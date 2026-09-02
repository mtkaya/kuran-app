#!/usr/bin/env bash
# iOS arsivini uretir ve YUKLEMEDEN ONCE dogrular.
#
# Neden bu betik var:
#   'xcode-select' yalnizca komut satiri araclarini yonlendirir. Xcode ile
#   Xcode-beta ayni bundle kimligini (com.apple.dt.Xcode) tasir, bu yuzden
#   macOS bir .xcodeproj'u cift tiklamayla -- ya da 'npx cap open ios' ile --
#   actiginda SURUM NUMARASI BUYUK olani secer, yani beta'yi. Sonuc: terminalde
#   'xcodebuild -version' 26.6 derken Xcode penceresi 27 beta olur, arsiv beta
#   SDK ile cikar ve App Store Connect bunu yuklemenin SONUNDA "Unsupported SDK
#   or Xcode version" diyerek reddeder. Hata mesaji Xcode'u degil SDK'yi
#   sucladigi icin yanlis yerde aranir.
#
#   Bu betik arsivi 'xcodebuild' ile alir; o da xcode-select'i dinler,
#   LaunchServices'e hic bakmaz. Uretilen arsivin hangi Xcode ve hangi SDK ile
#   derlendigi, sonunda arsivin kendi Info.plist'inden okunup dogrulanir.
#
# Kullanim:  ./scripts/build-ios-archive.sh [arsiv-yolu]
set -euo pipefail

KOK="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJE="$KOK/ios/App/App.xcodeproj"
# Capacitor 8 CocoaPods yerine SPM kullaniyor; .xcworkspace uretilmiyor.
PBXPROJ="$PROJE/project.pbxproj"

[ -d "$PROJE" ] || { echo "HATA: $PROJE yok."; exit 1; }

# --- 1) Secili toolchain beta olmamali -------------------------------------
gelistirici="$(xcode-select -p)"
case "$gelistirici" in
  *[Bb]eta*)
    echo "HATA: secili Xcode bir beta surumu: $gelistirici"
    echo "  -> sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
    exit 1 ;;
esac

xcode_surum="$(xcodebuild -version | head -1 | sed 's/Xcode //')"
xcode_build="$(xcodebuild -version | sed -n '2s/Build version //p')"
sdk="$(xcodebuild -showsdks 2>/dev/null | sed -n 's/.*-sdk \(iphoneos[0-9.]*\).*/\1/p' | head -1)"
[ -n "$sdk" ] || { echo "HATA: iOS SDK kurulu degil. 'xcodebuild -downloadPlatform iOS' calistirin."; exit 1; }

# Beta hala kuruluysa bundle kimligi cakismasi surer: GUI yine onu acar.
if [ -d /Applications/Xcode-beta.app ]; then
  echo "UYARI: /Applications/Xcode-beta.app duruyor. Bu betik etkilenmez, ama"
  echo "       Xcode'u elle acarken 'open -a /Applications/Xcode.app ...' kullanin."
fi

# --- 2) Projedeki surum, arsivde beklenen surumdur --------------------------
proje_surum="$(grep -oE 'MARKETING_VERSION = [^;]+' "$PBXPROJ" | head -1 | sed 's/.*= //')"
proje_build="$(grep -oE 'CURRENT_PROJECT_VERSION = [^;]+' "$PBXPROJ" | head -1 | sed 's/.*= //')"
dal="$(git -C "$KOK" rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"

ARSIV="${1:-$HOME/Desktop/kuran-$proje_surum.xcarchive}"

echo "==> Arsivlenecek surum: $proje_surum ($proje_build)  ·  dal: $dal"
echo "==> Toolchain: Xcode $xcode_surum ($xcode_build)  ·  SDK: $sdk"

# --- 3) Web katmani -------------------------------------------------------
# Atlanirsa arsiv eski dist/ icerigiyle cikar ve fark yalnizca cihazda gorulur.
echo "==> Web katmani derleniyor"
cd "$KOK" && npm run build >/dev/null && npx cap sync ios >/dev/null

# --- 4) Arsiv -------------------------------------------------------------
echo "==> Arsiv aliniyor (birkac dakika surer)"
rm -rf "$ARSIV"
xcodebuild -project "$PROJE" -scheme App -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARSIV" \
  -allowProvisioningUpdates \
  archive >/dev/null

plist="$ARSIV/Products/Applications/App.app/Info.plist"
[ -f "$plist" ] || { echo "BASARISIZ: arsiv olusmadi ($ARSIV)."; exit 1; }

# --- 5) Uretilen arsivi dogrula -------------------------------------------
oku() { /usr/libexec/PlistBuddy -c "Print :$1" "$plist" 2>/dev/null || true; }
a_surum="$(oku CFBundleShortVersionString)"
a_build="$(oku CFBundleVersion)"
a_xcode="$(oku DTXcodeBuild)"
a_sdk="$(oku DTSDKName)"

hata=0
if [ "$a_surum" != "$proje_surum" ] || [ "$a_build" != "$proje_build" ]; then
  echo "BASARISIZ: arsivdeki surum projeyle uyusmuyor."
  echo "  projede : $proje_surum ($proje_build)"
  echo "  arsivde : $a_surum ($a_build)"
  hata=1
fi
if [ "$a_xcode" != "$xcode_build" ]; then
  echo "BASARISIZ: arsiv baska bir Xcode ile derlenmis."
  echo "  secili  : $xcode_build"
  echo "  arsivde : $a_xcode"
  echo "  -> Xcode penceresinden alinmis eski bir arsiv olabilir."
  hata=1
fi
[ "$hata" -eq 0 ] || exit 1

echo
echo "TAMAM. App Store Connect'e yuklenecek arsiv:"
echo "  $ARSIV"
echo "  surum : $a_surum ($a_build)"
echo "  Xcode : $a_xcode   ·   SDK: $a_sdk"
echo
echo "Yuklemek icin (GUI'ye gerek yok, Organizer acilmasa da calisir):"
echo "  xcodebuild -exportArchive \\"
echo "    -archivePath \"$ARSIV\" \\"
echo "    -exportOptionsPlist scripts/ios-export-options.plist \\"
echo "    -exportPath \"${ARSIV%.xcarchive}-export\" \\"
echo "    -allowProvisioningUpdates"
echo
echo "Organizer'i tercih ederseniz arsiv su klasorde olmali:"
echo "  ~/Library/Developer/Xcode/Archives/$(date +%F)/"
echo "Xcode arayuzu '-10664' ile acilmiyorsa LaunchServices kaydi bozulmustur:"
echo "  lsregister -f /Applications/Xcode.app   (Support/ altinda, CoreServices icinde)"

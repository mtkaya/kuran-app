#!/usr/bin/env bash
# 1.0.8 icin imzali Play paketini uretir ve imzayi DOGRULAR.
#
# On kosul: android/keystore.properties doldurulmus olmali (storePassword,
# keyAlias, keyPassword). O dosya .gitignore'da; parola depoya girmez.
#
# Kullanim:  ./scripts/build-signed-bundle.sh
set -euo pipefail

KOK="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Play'in bekledigi imzalama sertifikasi (26 Tem 2026 tarihli yuklemeden alindi)
BEKLENEN_SHA1="73:AB:94:6A:0B:D6:53:B9:BB:C7:1A:6D:7B:B8:18:E7:7E:69:B9:14"
CIKTI="$KOK/android/app/build/outputs/bundle/release/app-release.aab"

ozellikler="$KOK/android/keystore.properties"
[ -f "$ozellikler" ] || { echo "HATA: $ozellikler yok."; exit 1; }
for alan in storePassword keyAlias keyPassword; do
  grep -qE "^${alan}=.+" "$ozellikler" || { echo "HATA: $ozellikler icinde '$alan' bos."; exit 1; }
done

echo "==> Web katmani derleniyor"
cd "$KOK" && npm run build >/dev/null && npx cap sync android >/dev/null

echo "==> Imzali bundle uretiliyor"
export JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"
cd "$KOK/android" && ./gradlew :app:bundleRelease -q

echo "==> Imza dogrulaniyor"
bulunan="$(keytool -printcert -jarfile "$CIKTI" 2>/dev/null | awk -F'SHA1: ' '/SHA1:/ {print $2; exit}' | tr -d ' \r')"
if [ -z "$bulunan" ]; then
  echo "BASARISIZ: paket imzasiz. keystore.properties okunmamis olabilir."; exit 1
fi
if [ "$bulunan" != "$BEKLENEN_SHA1" ]; then
  echo "BASARISIZ: yanlis imzalama anahtari."
  echo "  beklenen : $BEKLENEN_SHA1"
  echo "  bulunan  : $bulunan"
  echo "  -> storeFile muhtemelen yanlis keystore'u gosteriyor (~/kys1.jks deneyin)."
  exit 1
fi

echo
echo "TAMAM. Play'e yuklenecek dosya:"
echo "  $CIKTI"
keytool -printcert -jarfile "$CIKTI" 2>/dev/null | grep -E "Owner|SHA1" | head -2

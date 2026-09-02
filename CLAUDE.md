# Kur'an-ı Kerim uygulaması — Claude için notlar

React 18 + TypeScript + Vite. Capacitor 8 ile iOS/Android, Electron ile masaüstü.
Durum yönetimi Zustand, tema Tailwind + HSL değişkenleri, testler Vitest.

Buradaki maddelerin çoğu bir kez pahalıya mal olmuş şeyler. Her biri neden öyle
olduğunu da söylüyor; gerekçeyi okumadan tersini yapma.

## Değişmez kurallar

**Kur'an metnini asla hafızadan üretme.** Arapça, meal ve okunuş yalnızca
`src/data/ar.json`, `src/data/tr.json`, `src/data/translit-tr.json` dosyalarından
ya da doğrulanmış bir kaynaktan gelir. Tek bir harf bile uydurma, eksik veriyi
tamamlama.

**`git add -A` kullanma.** Depo herkese açık; dosyaları adıyla stage'le.

**Parola isteme, alma, bir yere yazma.** İmzalama parolaları
`android/keystore.properties` içinde ve o dosya `.gitignore`'da.

**Atıf görünür kalmalı.** Ayarlar'daki kaynak/lisans bilgisi CC BY-NC-SA 4.0
gereği; kaldırma, küçültme.

## Uygulama kimlikleri — karıştırması kolay, ikisi de doğru

| Platform | Kimlik | Durum |
|---|---|---|
| iOS (App Store) | `com.arfhause.kuran.multilang` | canlı |
| Android (Play üretim) | `com.arfhause.holyquran.indexed` | canlı |

İkisinin farklı olması hata değil. `capacitor.config.ts` içindeki `appId`
yalnızca platform klasörü ilk üretilirken okunur; mevcut projelerin kimliğini
değiştirmez, dolayısıyla config ile proje dosyasının ayrışması normaldir. iOS
kimliğini `holyquran.indexed` yapmaya çalışma — imzalama kırılır, provisioning
profili bulunamaz. Bu bir kez yanlış teşhis edildi; ayrıntısı
`capacitor.config.ts` yorumunda.

## iOS sürüm çıkarma — üç ayrı tuzak

Üçü de birbirinin arkasına saklanıyor ve hata mesajları hiçbirini doğrudan
işaret etmiyor. Bir öğleden sonra bunlara gitti.

**1. Beta macOS'tan gönderim geçmiyor.** 1.0.9 build 10, sürümlü Xcode 26.6 ve
iOS 26.5 SDK ile derlendiği hâlde `ITMS-90111: Unsupported SDK or Xcode version`
ile reddedildi. Makine macOS 27.0 beta (`26A5425a`) çalışıyordu ve Xcode sürümü
doğruyken geriye kalan tek değişken buydu. Geliştirme makinesi beta macOS
çalıştırdığı sürece App Store'a gönderilecek derlemeyi **Xcode Cloud** yapmalı;
`ios/App/ci_scripts/ci_post_clone.sh` hazır ve web katmanını kendisi derleyip
senkronluyor.

**2. Arayüz yanlış Xcode'u açar.** Xcode ile Xcode-beta aynı bundle kimliğini
(`com.apple.dt.Xcode`) taşır, macOS de sürüm numarası büyük olanı seçer. Sonuç:
`xcodebuild -version` 26.6 derken `npx cap open ios` beta'yı açar ve arşiv beta
SDK ile çıkar. `xcode-select` yalnızca komut satırı araçlarını yönlendirir,
LaunchServices'i değil. Xcode'u elle açman gerekirse
`open -a /Applications/Xcode.app ios/App/App.xcodeproj`.

**3. Xcode 26.6'nın arayüzü bu makinede hiç açılmıyor** (`LaunchServices -10664`).
Sürüm tabanı değil — Xcode 26.6 `LSMinimumSystemVersion 26.2` istiyor, makine
27.0. İki Xcode'un kimlik çakışmasından kalan bozuk kayıt.
`lsregister -f /Applications/Xcode.app` onarabiliyor.

Yerelde arşiv alırken **her zaman** `./scripts/build-ios-archive.sh` kullan.
`xcodebuild` ile derler (LaunchServices'e bakmaz), sonra arşivin kendi
`Info.plist`'ini geri okuyup `DTXcodeBuild` seçili toolchain mi, sürüm ve build
`project.pbxproj` ile aynı mı diye doğrular. Yanlış arşiv yüklemenin sonunda
değil, saniyeler içinde yerelde patlar. Yükleme adımı da GUI istemiyor:
`xcodebuild -exportArchive` + `scripts/ios-export-options.plist`.

Capacitor 8 CocoaPods değil SPM kullanıyor — `.xcworkspace` yok, `xcodebuild`
komutlarında `-project ios/App/App.xcodeproj` geçilecek.

## Android sürüm çıkarma

`./scripts/build-signed-bundle.sh`. Paketlenecek sürümü ve dalı başta yazar,
sonunda imzayı Play'in beklediği SHA1 ile karşılaştırır. Yanlış dalda derlemek
bir önceki sürümü sessizce yeniden paketliyordu; betik artık bunu görünür
kılıyor. VPN açıkken Gradle bağımlılıkları indiremiyor ("Remote host terminated
the handshake") — kapat.

## Sürüm notları

`docs/release-notes/<sürüm>.md` içinde tr/en/zh. Play, dil etiketli tek
yapıştırmayı kabul eder (`<tr-TR>…</tr-TR>`); App Store Connect etmez — orada
her yerelleştirmenin kendi kutusu vardır, tek kutu varsa diller başlıklarıyla
arka arkaya yazılır. Play'in sınırı dil başına 500 karakter.

## Test

`npm run test:run`. Okunuş korpusu modül seviyesinde önbellek tuttuğu için o
testler `vi.resetModules()` ile izole edilir; bu olmadan testler birbirinin
yüklediği korpusu görür.

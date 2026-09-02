# Durum

Son güncelleme: 2 Eylül 2026

Açık işler ve her platformun nerede olduğu. Oturum başında okunur, iş bitince
güncellenir. Tekrar eden sürüm çıkarma tuzakları burada değil `CLAUDE.md`
içinde — orası her birini gerekçesiyle tutuyor, burası yalnızca "şu an nerede
kaldık" sorusunu cevaplıyor.

## Açık işler

- [ ] **iOS 1.0.9 gönderimi** — App Store Connect → Distribution → 1.0.9 →
      build **8** → Add for Review. Build 8'i Xcode Cloud üretti (Apple'ın
      makineleri, beta işletim sistemi yok), yeniden derleme gerekmiyor.
      Reddedilen build 10 seçiliyse önce onu kaldır.
- [ ] **Yaş derecelendirmesi soruları** — App Information'daki sosyal medya
      soruları. Hepsi *Hayır*: hesap yok, kullanıcılar arası mesajlaşma yok,
      içerik akışı yok, kullanıcı içeriği hiçbir yere yüklenmiyor. Ayet kartı
      paylaşımı işletim sisteminin paylaş menüsünden gider, uygulama içinde
      sosyal katman değildir. Son tarih 7 Eylül 2026.

## Beklemede

- **Android 1.0.9 (versionCode 9)** — Google incelemesinde, üretime tam
  dağıtım kuyrukta. Yapılacak bir şey yok.

## Sürümler

| Platform | Yayında | Hazırlanan |
|---|---|---|
| iOS | 1.0.8 | 1.0.9 (build 8) |
| Android | 1.0.8 | 1.0.9 (versionCode 9) |

## 1.0.9'da çözülenler

- Mushaf'ta "son okunan" şeridi ayarlar düğmesinin altında kalıyordu; şerit
  `z-30`, başlık `z-50` olduğu için etiketin üstüne biniyordu.
- Arapça yazı tipi CDN'den indirilemediğinde metin işletim sisteminin
  Arapça fontuna düşüyordu. `arabicFontStack()` artık pakete gömülü Amiri
  Quran'ı ve genel bir yedeği sona ekliyor, yani en kötü ihtimalle yanlış
  stil çıkıyor — yanlış yazı sistemi değil.
- Okunuş korpusu tamamlandı: 114 sure, 6236 ayet.

Mağaza metinleri ve teknik ayrıntı: `docs/release-notes/1.0.9.md`

## Sonraki sürüm çıkarılırken

```bash
npm run test:run
./scripts/build-signed-bundle.sh    # Android: imzalı AAB + imza doğrulama
./scripts/build-ios-archive.sh      # iOS: arşiv + toolchain/sürüm doğrulama
```

iOS için uyarı: geliştirme makinesi beta macOS çalıştığı sürece yerel arşiv
App Store'a kabul edilmiyor (`ITMS-90111`). O durumda derlemeyi Xcode Cloud
yapmalı — `main`'e her push zaten bir derleme tetikliyor ve sonucu App Store
Connect'e teslim ediyor. Gerekçesi `CLAUDE.md` içinde.

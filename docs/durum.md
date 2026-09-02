---
tags: [proje/kuran, durum]
guncelleme: 2026-09-02
ios: "1.0.9 build 8 — gonderim bekliyor"
android: "1.0.9 versionCode 9 — Google incelemesinde"
---

# Durum

Açık işler ve her platformun hangi aşamada olduğu. Oturum başında okunur, iş
bitince güncellenir. Tekrar eden sürüm çıkarma tuzakları burada değil
[CLAUDE.md](../CLAUDE.md) içinde — orası her birini gerekçesiyle tutuyor,
burası yalnızca "şu an nerede kaldık" sorusunu cevaplıyor.

## Açık işler

- [ ] **iOS 1.0.9 gönderimi** — App Store Connect → Distribution → 1.0.9 →
      build **8** → Add for Review. Reddedilen build 10 seçiliyse önce kaldır.
- [ ] **Yaş derecelendirmesi** — App Information'daki sosyal medya soruları,
      hepsi *Hayır* 📅 2026-09-07

> [!IMPORTANT]
> Build 8'i Xcode Cloud üretti, Apple'ın kendi makinelerinde. Yeniden derleme
> gerekmiyor — sadece seçilip gönderilecek.

> [!WARNING]
> Geliştirme makinesi beta macOS çalıştığı sürece **yerelde alınan arşiv App
> Store'a kabul edilmiyor** (`ITMS-90111`), Xcode sürümlü olsa bile. O durumda
> derlemeyi Xcode Cloud yapmalı; `main`'e her push zaten bir derleme tetikliyor
> ve sonucu App Store Connect'e teslim ediyor.

### Yaş derecelendirmesi — cevaplar

Kodda doğrulandı: hesap yok, kullanıcılar arası mesajlaşma yok, içerik akışı
yok, kullanıcı içeriği hiçbir yere yüklenmiyor. Ayet kartı paylaşımı işletim
sisteminin paylaş menüsünden gider, uygulama içinde sosyal katman değildir.
Gömülü tarayıcı da yok; dış bağlantılar sistem tarayıcısında açılır.

| Soru | Cevap |
|---|---|
| Kullanıcı içeriği paylaşımı | Hayır |
| Kullanıcılar arası mesajlaşma | Hayır |
| Görünür kullanıcı profilleri | Hayır |
| İçerik akışı / keşfet | Hayır |
| Sınırsız web erişimi | Hayır |

## Beklemede

- **Android 1.0.9 (versionCode 9)** — Google incelemesinde, üretime tam dağıtım
  kuyrukta. Yapılacak bir şey yok.

## Sürümler

| Platform | Yayında | Hazırlanan |
|---|---|---|
| iOS | 1.0.8 | 1.0.9 (build 8) |
| Android | 1.0.8 | 1.0.9 (versionCode 9) |

## 1.0.9'da çözülenler

- Mushaf'ta "son okunan" şeridi ayarlar düğmesinin altında kalıyordu; şerit
  `z-30`, başlık `z-50` olduğu için etiketin üstüne biniyordu.
- Arapça yazı tipi CDN'den indirilemediğinde metin işletim sisteminin Arapça
  fontuna düşüyordu. `arabicFontStack()` artık pakete gömülü Amiri Quran'ı ve
  genel bir yedeği sona ekliyor — en kötü ihtimalle yanlış stil çıkıyor, yanlış
  yazı sistemi değil.
- Okunuş korpusu tamamlandı: 114 sure, 6236 ayet.

Mağaza metinleri ve teknik ayrıntı: [1.0.9 sürüm notları](release-notes/1.0.9.md)

## Sonraki sürüm çıkarılırken

```bash
npm run test:run
./scripts/build-signed-bundle.sh    # Android: imzalı AAB + imza doğrulama
./scripts/build-ios-archive.sh      # iOS: arşiv + toolchain/sürüm doğrulama
```

İkisi de yanlış sürümü ya da yanlış toolchain'i yüklemenin sonunda değil,
başında yakalar. Gerekçeleri [CLAUDE.md](../CLAUDE.md) içinde.

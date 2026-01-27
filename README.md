# 📖 Kur'an-ı Kerim: İndeksli

Modern, çok platformlu Kur'an-ı Kerim uygulaması. Web, iOS, Android ve masaüstü (Windows/Mac/Linux) desteği.

<p align="center">
  <img src="public/icons/icon-512x512.png" alt="Kur'an App Logo" width="128" height="128">
</p>

## ✨ Özellikler

### 📚 Okuma Modları
- **Normal Mod**: Ayet ayet okuma, meal ve transliterasyon desteği
- **Mushaf Modu**: Gerçek Mushaf sayfası görüntüleri (15+ farklı Mushaf edition)
- **Dijital Mushaf**: Sayfa bazlı dijital metin görünümü
- **Çift Sayfa Görünümü**: Tablet/masaüstünde kitap gibi okuma deneyimi

### 🌍 Çoklu Dil Desteği
| Dil | Meal/Tercüme |
|-----|--------------|
| 🇹🇷 Türkçe | Diyanet İşleri Meali |
| 🇬🇧 İngilizce | Sahih International |
| 🇩🇪 Almanca | Bubenheim & Elyas |
| 🇫🇷 Fransızca | Muhammad Hamidullah |
| 🇨🇳 Çince | Ma Jian |
| 🇮🇩 Endonezce | Kementerian Agama |
| 🇵🇰 Urduca | Ahmed Ali |
| 🇧🇩 Bengalce | Muhiuddin Khan |

### 🎧 Sesli Okuma
- **10+ Kari**: Mishary Rashid Alafasy, Abdul Basit, Mahmoud Khalil Al-Hussary ve daha fazlası
- **Ayet Takibi**: Ses çalarken aktif ayet vurgulanır
- **Arka Plan Oynatma**: Uygulama arka plandayken dinlemeye devam
- **Medya Kontrolleri**: iOS/Android bildirim merkezi kontrolü

### 📖 Gelişmiş Özellikler
- **Tefsir Desteği**: Diyanet Tefsiri ve daha fazlası
- **Son Okunan İşareti**: Kaldığınız yerden devam edin
- **Yer İmleri**: Favori ayetlerinizi kaydedin
- **Notlar**: Ayetlere kişisel notlar ekleyin
- **Arama**: Kuran içinde arama yapın
- **Cüz Listesi**: 30 cüz üzerinden navigasyon
- **Nüzul Sırası**: İniş sırasına göre sureler
- **Transliterasyon**: Arapça okunuşu Latin harfleriyle

### 🎨 Kullanıcı Deneyimi
- **Karanlık/Aydınlık Tema**: Göz yorgunluğunu azaltın
- **Özelleştirilebilir Font**: Arapça font boyutu ayarı
- **Multiple Arabic Fonts**: Uthmanic Hafs, Naskh, Me Quran
- **Ezberleme Modu**: Ayetleri gizleyerek ezber pratiği
- **Responsive Tasarım**: Tüm ekran boyutlarına uyum
- **PWA Desteği**: Tarayıcıdan yüklenebilir

### 📱 Platform Desteği
| Platform | Durum | Teknoloji |
|----------|-------|-----------|
| 🌐 Web | ✅ | React + Vite |
| 📱 iOS | ✅ | Capacitor |
| 🤖 Android | ✅ | Capacitor |
| 🖥️ Windows | ✅ | Electron |
| 🍎 macOS | ✅ | Electron |
| 🐧 Linux | ✅ | Electron |

## 🚀 Başlangıç

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Kurulum

```bash
# Repoyu klonla
git clone https://github.com/mtkaya/kuran-app.git
cd kuran-app

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

### Build Komutları

```bash
# Web build
npm run build

# iOS build
npx cap sync ios
npx cap open ios

# Android build
npx cap sync android
npx cap open android

# Windows masaüstü (.exe)
npm run electron:build:win

# macOS masaüstü (.dmg)
npm run electron:build:mac

# Linux masaüstü (.AppImage)
npm run electron:build:linux

# Electron geliştirme modu
npm run electron:dev
```

## 🏗️ Proje Yapısı

```
kuran-app/
├── src/
│   ├── components/      # UI bileşenleri
│   │   ├── AyahView.tsx         # Ayet görünümü
│   │   ├── MushafImageView.tsx  # Mushaf resim görünümü
│   │   ├── MushafTextView.tsx   # Dijital Mushaf görünümü
│   │   ├── ContentPanel.tsx     # Tefsir/Meal paneli
│   │   ├── AudioPlayer.tsx      # Ses oynatıcı
│   │   └── ...
│   ├── pages/           # Sayfa bileşenleri
│   │   ├── Reader.tsx           # Ana okuyucu
│   │   ├── Search.tsx           # Arama sayfası
│   │   ├── JuzList.tsx          # Cüz listesi
│   │   └── RevelationOrder.tsx  # Nüzul sırası
│   ├── store/           # Zustand state yönetimi
│   │   ├── audioStore.ts        # Ses durumu
│   │   ├── settingsStore.ts     # Ayarlar
│   │   ├── bookmarkStore.ts     # Yer imleri
│   │   └── readingStore.ts      # Okuma durumu
│   ├── data/            # Kuran verileri (JSON)
│   ├── hooks/           # Custom React hooks
│   ├── context/         # React Context providers
│   └── i18n/            # Çoklu dil desteği
├── electron/            # Electron masaüstü konfigürasyonu
├── ios/                 # iOS native projesi
├── android/             # Android native projesi
└── public/              # Statik dosyalar
    ├── icons/           # Uygulama ikonları
    ├── mushaf/          # Mushaf sayfa görselleri
    └── audio/           # Ses dosyaları (opsiyonel)
```

## 🛠️ Teknoloji Yığını

| Kategori | Teknoloji |
|----------|-----------|
| **Frontend** | React 18, TypeScript |
| **Build Tool** | Vite 5 |
| **Styling** | TailwindCSS 3 |
| **State Management** | Zustand 5 |
| **Routing** | React Router DOM 6 |
| **Icons** | Lucide React |
| **Mobile** | Capacitor 8 |
| **Desktop** | Electron 40 |
| **Testing** | Vitest, Testing Library |

## 📊 Veri Kaynakları

- **Kuran Metni**: [AlQuran Cloud API](https://alquran.cloud/)
- **Mushaf Görselleri**: Çeşitli Mushaf Edition'ları (Madina, Pakistan, Tajweed, vb.)
- **Ses Dosyaları**: EveryAyah.com, Quran.com API

## 🔒 Gizlilik

Uygulama hiçbir kişisel veri toplamaz. Tüm ayarlar ve veriler cihazınızda yerel olarak saklanır.

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🤝 Katkıda Bulunma

Pull request'ler kabul edilmektedir. Büyük değişiklikler için lütfen önce bir issue açın.

## 📧 İletişim

- **Geliştirici**: MTKaya
- **Email**: info@arfhause.com
- **GitHub**: [@mtkaya](https://github.com/mtkaya)

---

<p align="center">
  <b>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</b>
  <br>
  <i>Rahman ve Rahim olan Allah'ın adıyla</i>
</p>

# Kuran-ı Kerim: İndeksli - Proje Durum Raporu

**Tarih:** 17 Ocak 2026  
**Sürüm:** 0.0.0 (Geliştirme)  
**Platform:** iOS, Android, Web

### Proje Özeti
Bu rapor, iOS, Android ve Web platformlarında çalışmak üzere tasarlanan "The Holy Quran: Indexed" projesinin teknik ve fonksiyonel detaylarını içermektedir. Proje, React ve Capacitor teknolojileri temel alınarak geliştirilmiş kapsamlı bir Kuran uygulamasıdır. Temel amacı, kullanıcılara çeşitli okuma modları, arka planda çalışabilen gelişmiş bir ses oynatıcı ve detaylı kişiselleştirme seçenekleriyle zenginleştirilmiş kusursuz bir dijital Kuran deneyimi sunmaktır.

### Teknik Altyapı
Projenin teknik mimarisi, modern ve yüksek performanslı teknolojiler üzerine inşa edilmiştir. Uygulamanın çekirdeği React 18 ve Vite kullanılarak TypeScript diliyle geliştirilmiş, görsel tasarımda ise Tailwind CSS ve özel temalar tercih edilmiştir. Mobil tarafta Capacitor 8.0 çalışma zamanı (runtime) kullanılarak, tek bir kod tabanından hem iOS (Xcode) hem de Android (Android Studio) için native uygulamalar üretilmektedir. Uygulamanın durum yönetimi (state management) için Zustand mimarisi, sayfa yönlendirmeleri için React Router DOM ve performanslı arama işlemleri için Fuse.js kütüphanesi kullanılmaktadır. Ayrıca projenin kod kalitesi ve güvenilirliği, Vitest ve React Testing Library kullanılarak oluşturulan birim testler (unit tests) ile güvence altına alınmıştır.

### Temel Özellikler ve Kullanıcı Deneyimi
Uygulama, kullanıcı deneyimini merkeze alan zengin özellikler sunmaktadır. Okuma deneyimi açısından kullanıcılara üç farklı mod sağlanmıştır: sonsuz kaydırma özelliğine sahip standart "Normal" liste görünümü, klasik sayfa düzenini koruyan "Mushaf" görünümü ve tekil ayetlere odaklanan modern "Dijital" kart görünümü. Kullanıcılar yazı boyutlarını, temaları (açık, koyu ve sistem varsayılanı) ve tecvid/transkripsiyon görünümlerini diledikleri gibi kişiselleştirebilirler.

Ses özellikleri kapsamında, uygulamanın her yerinden erişilebilen ve uygulama simge durumuna küçültüldüğünde dahi çalışmaya devam eden global bir ses oynatıcı bulunmaktadır. Media Session API entegrasyonu sayesinde ses kontrolleri kilit ekranından yönetilebilir ve okuyucu, çalan ayete otomatik olarak odaklanarak sayfayı kaydırır. Navigasyon ve veri yönetimi tarafında ise meal metni ve sure isimleri içinde anlık arama yapabilme, sureleri ızgara veya liste halinde görüntüleme, yer imi ekleme, ayetlere not alma ve son okunan yeri otomatik kaydetme gibi özellikler mevcuttur.

### Son Gelişmeler ve İyileştirmeler
Son geliştirme sürecinde özellikle kullanıcı arayüzü ve native entegrasyonlara odaklanılmıştır. Uygulamaya animasyonlu bir açılış ekranı (Splash Screen) eklenmiş, sure listeleme ekranındaki ızgara görünümü tüm kartların eşit yükseklikte olacağı şekilde (160px sabit yükseklik) düzeltilmiş ve koyu modun (Dark Mode) kontrastı artırılarak okunabilirlik iyileştirilmiştir.

Teknik iyileştirmeler kapsamında, iOS platformu için arka plan ses çalma yeteneği (UIBackgroundModes) etkinleştirilmiş ve her iki platform için kilit ekranı medya kontrolleri aktif hale getirilmiştir. Ayrıca Android cihazlardaki fiziksel geri tuşu davranışı optimize edilmiştir. Kalite kontrol sürecinin bir parçası olarak test altyapısı kurulmuş ve kritik veri depoları (store) için %100 kapsama oranına sahip test senaryoları yazılarak kod güvenliği artırılmıştır. Güvenlik taramaları yapılarak geliştirme ortamı bağımlılıkları denetlenmiştir.

### Eksiklikler ve Gelecek Planları
Projenin mevcut sürümünde bazı kısıtlamalar ve geliştirilmesi gereken alanlar bulunmaktadır. Özellikle Android platformunda ses arka planda çalmasına rağmen, native bildirim çubuğu widget'ı henüz tam entegre edilmemiştir ve bunun için özel bir native servis yazılması gerekmektedir. Ayrıca, kullanıcıların telefonlarının ana ekranına ekleyebileceği "Günün Ayeti" gibi widget'lar ve konum tabanlı namaz vakitleri özelliği henüz uygulamada yer almamaktadır.

Gelecek yol haritasında öncelikli olarak bu native widget eksikliklerinin giderilmesi (iOS WidgetKit ve Android AppWidgetProvider ile), Aladhan API kullanılarak namaz vakitlerinin entegre edilmesi ve pusula özelliğinin eklenmesi planlanmaktadır. Uzun vadede ise kullanıcı verilerinin (yer imleri, notlar) cihazlar arasında senkronize edilmesini sağlayacak bulut altyapısının kurulması ve sosyal medya paylaşım özelliklerinin projeye dahil edilmesi hedeflenmektedir.

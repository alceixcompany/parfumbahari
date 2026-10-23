# Son doğrulama — 22 Ekim 2026

Veri kaynağı: statik. Firebase anahtarı, uzak veritabanı veya canlı işletme hesabı kullanılmadı.

- `npm run build`: başarılı; Next.js production çıktısı ve TypeScript kontrolü tamamlandı.
- `npm run check:site`: 17 genel sayfa, 32 iç bağlantı hedefi, 9 yerel görsel/simge ve 32 JSON-LD bloğu doğrulandı. Eski URL yönlendirmeleri, 404 sayfaları, sitemap, manifest ve statik yönetim sınırı kontrol edildi.
- `npm run test:rules`: yerel `demo-parfum-bahari` Firestore emülatöründe 48 güvenlik ve içerik yaşam döngüsü kontrolü geçti. Emülatör test sonunda kapandı.
- Tarayıcı: katalogda aile/kategori filtreleri, nota araması, sonuç bulunamadı durumu, alfabetik sıralama, favori ekleme/çıkarma ve yeniden yüklemede koruma kontrol edildi.
- Ürün boyutu seçiminden ürüne özel iletişim konusuna geçiş doğrulandı. Yerel mesaj taslağı kaydetme, yeniden yükleme ve silme denendi; test taslağı ve test favorisi kaldırıldı.
- Mobil menü açma/kapatma, Escape, klavye odağı ve galeri filtresi/görsel diyaloğu kontrol edildi.
- 1440 px masaüstü ve 390 px mobil görünümler incelendi. Ana sayfa ayrıca 320 px genişlikte taşma açısından kontrol edildi; ana Türkçe sayfalarda 390 px genişlikte yatay taşma yok.
- Temiz production tarayıcı oturumunda hata veya uyarı kaydı yok.

Ekran görüntüleri yerel `artifacts/parfum-bahari/` klasöründedir: `home-desktop.jpg`, `home-full.jpg`, `home-mobile.jpg`, `catalogue-desktop.jpg`, `catalogue-mobile.jpg`. Bu klasör geliştirme çıktısı olarak Git dışında tutulur.

Canlı Firebase hesabı ve gerçek işletme iletişim bilgileri henüz sağlanmadığından uzak yönetici girişi, gerçek mesaj teslimi ve canlı veritabanı entegrasyonu denenmedi. Geçiş için `firebase-setup.md` izlenmelidir.

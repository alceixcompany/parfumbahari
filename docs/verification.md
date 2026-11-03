# Son doğrulama — 3 Kasım 2026

Veri kaynağı: Parfum Bahari Firebase projesi. Mevcut altı ürünün tek fotoğraflı kayıtlarıyla geriye uyumluluk kontrol edildi. Tarayıcıdaki fotoğraf seçme denemeleri kaydedilmeden kapatıldı; canlı veritabanına deneme ürünü eklenmedi.

- Üretim derlemesi ve TypeScript kontrolü başarılı.
- Değişen ürün, galeri ve kayıt modüllerinde ESLint başarılı.
- `npm run check:site`: 16 genel sayfa, 18 iç bağlantı hedefi, 10 yerel görsel ve 30 JSON-LD bloğu doğrulandı. Yönlendirmeler, eksik sayfalar, sitemap, manifest ve yönetici oturum sınırı geçti.
- `npm run test:rules`: izole `demo-parfum-bahari` Firestore emülatöründe 82 kontrol geçti. Çoklu medya kaydı, kapak seçimi, kapak değiştirme, fotoğraf listesinden çıkarma, geçersiz fotoğraf sınırları ve bir medya yazımı reddedildiğinde tüm işlemin geri alınması test edildi.
- Yönetici oturumu ve başlangıç içeriklerinin bir kez aktarımı için mevcut testler başarılı.
- Masaüstü tarayıcıda bir defada üç fotoğraf seçildi; 15 MB kaynak fotoğraf da sıkıştırılarak önizlendi. İkinci fotoğraf kapak seçildi; seçili fotoğraf kaldırıldığında ilk kalan fotoğraf kapak oldu.
- 390 px mobil genişlikte çoklu fotoğraf düzenleyicisi ve kapak seçimi kontrol edildi; yatay taşma yok.
- Ürün detay galerisinin gerçek bileşeni geçici yerel kontrol sayfasında çalıştırıldı. Kapak görselinin ilk sıraya alınması, ileri/geri okları, küçük fotoğraf seçimi ve klavye okları doğrulandı. Kontrol sayfası üretim kaynaklarından kaldırıldı.
- Katalogda ürün araması, alfabetik sıralama, favori ekleme/çıkarma, favori filtresi ve boş sonuç görünümü doğrulandı. Deneme favorisi kaldırıldı.
- Ürün ekranlarında kategori, koku ailesi, nota ve ml kontrollerinin bulunmadığı kontrol edildi.
- Ana sayfadaki üç şişeli görsel masaüstünde ve 390 px telefonda incelendi. Üç şişe birlikte görünüyor; eski sol metin, görsel yazıları ve beyaz etiket kaldırıldı.

Ekran görüntüleri Git dışında tutulan `artifacts/product-update/` klasöründedir. Galeri gezinme kontrolü için kullanılan geçici sunucu kapatıldı.

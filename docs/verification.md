# Son doğrulama — 9 Kasım 2026

- `npm run build`, `npm run lint`, `npx tsc --noEmit` başarılı.
- `npm test`: yönetici oturumu, yeni korumalı listeleme uç noktası, ilk içerik aktarımı, fotoğraf kaydırma, eski kayıtların kategori/marka eşleşmesi ve bozuk ürün kayıtlarının normalleştirilmesi başarılı.
- İzole `demo-parfum-bahari` Firestore emülatöründe 100 kontrol: ürün ve fotoğraf transaction işlemleri, kategori ağacı, yetkisiz yazmalar, kendine bağlama, eksik ana kategori, üçüncü seviyeyi reddetme ve kategori alanlarının ürünle saklanması.
- Üretim sunucusunda site kontrolü: 12 sayfa, 141 katalog/sitemap kaydı, 10 yerel görsel, 29 JSON-LD nesnesi, kategori bağlantıları, yönlendirmeler ve yönetici oturum sınırı geçti. Ürün detaylarında ilk altı güncel kayıt örneklendi; blogda bu ortamda yayında yazı yok.
- Tarayıcıda 390 px mobil ve 820 px tablet yerleşimi incelendi. Yeni logo arka plansız ve yanında ayrı metin yok. Slider'da altta ortalanmış yalnızca üç nokta var; noktayla geçiş doğrulandı. Önceki sürümde otomatik kayma da gözlendi.
- Kadın → Eau de Parfum → Amouage filtresi iki ürün gösterdi. Erkek kategorisine geçildiğinde alt kategori ve marka sıfırlandı, 54 ürün gösterildi. Katalogda toplam 141 ürün var; adından emin biçimde sınıflandırılamayan üç kayıt yalnızca tüm ürünler içinde kalır.
- Yönetim giriş sayfasını ziyaret edip genel sayfaya döndükten sonra mobil çağrı alanının rengi `rgb(99, 43, 60)` olarak doğrulandı; yatay taşma gözlenmedi.
- Verilen Hakkımızda metninin beş paragrafı sayfada doğrulandı.
- Yeni logonun PNG alfa kanalı mevcut. Üretim istemi ve yerleşik imagegen kullanımı `docs/assets.md` içinde kayıtlıdır.

Ekran görüntüleri Git dışında `artifacts/november-update/` altındadır. Canlı yönetici hesabıyla giriş/yazma testi yapılmadı; yönetici erişimi API testleri ve emülatörde doğrulandı. Canlı Firebase kayıtlarına veya güvenlik kurallarına yazılmadı. Özel kategori yönetimi için güncel `firestore.rules` yetkili hesap tarafından yayınlanmalıdır; mevcut ortamın Firebase CLI hesabında hedef proje erişimi bulunmuyor.

---

## Önceki doğrulama — 3 Kasım 2026

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

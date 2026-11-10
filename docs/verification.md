# Canlı katalog geçişi — 10 Kasım 2026

- Kullanıcının verdiği yönetici hesabıyla giriş doğrulandı. 149 ürünün tamamı yedeklendi; 140 belgede otomatik geçiş ve 3 belgede kaynaklara dayalı kategori seçimi uygulandı.
- Yayındaki 142 ürünün tamamı Bay/Bayan/Unisex modeline bağlı. 7 taslak yayına alınmadı; bunların altı eski örnek ürünü kategorisi belirsiz olarak taslakta kaldı.
- İlk atomik işlem sonrasında 149 belge özgün yedekle alan alan karşılaştırıldı. İkinci işlemdeki üç belge yeniden okunup karşılaştırıldı. Yalnızca planlanan kategori/eski alan temizliği ve `updatedAt` değişti; adlar, URL’ler, görseller ve yayın durumları korundu.
- Tekrar kuru çalıştırmada otomatik değişiklik sayısı sıfırdı. Canlı admin panelinde Prada ürününün Erkek Parfüm kategorisi doğrulandı. Parola/token dosyalara kaydedilmedi; güvenlik kuralları veya erişim rolleri değiştirilmedi.
- Yedekler, işlem makbuzları, kaynaklar ve geri alma yöntemi `docs/catalogue-migration.md` içinde açıklanır. Canlı panelin önceki uygulama sürümündeki alt kategori/marka kontrolleri yeni kaynak sürümünün dağıtımını gerektiriyor.

---

# Kota tüketimi düzenlemesi — 10 Kasım 2026

- Gerçek üretim Next.js sunucusu, ayrı geçici `.next` dizini ve yerel Firebase test yanıtlarıyla doğrulandı. Canlı Firebase’e bu testlerde istek atılmadı; test verileri çalışma klasörünün Data Cache alanına girmedi.
- Soğuk ürün detayı yalnızca `limit: 1` ürün ve `limit: 4` öneri sorgusu kullandı; toplam en fazla 5 belge okuması. Ardından 10 aynı detay ve 5 katalog isteği ek Firestore sorgusu üretmedi.
- İkinci ürün detayı öneri önbelleğini paylaştı. Aynı medya iki kez istendiğinde Firestore yalnızca bir kez okundu.
- Yetkisiz önbellek yenileme reddedildi. Yetkili yenilemeden sonra ürün adı güncellendi; yayından kaldırılan ürün 404 verdi. Taslaklar genel veri önbelleğine alınmıyor.
- Kota hatasında ikinci ziyaretçi isteği yeni Firestore sorgusu yapmadı. Hata, boş katalog veya 404 olarak saklanmadı. Geçici veri hatası HTTP 500 ile döndü; fotoğraf hatasında HTTP 503 ve Retry-After verilir.
- Birim testinde aynı anda 20 sorgu tek upstream okumaya indirildi; 60 saniyelik kota beklemesi ve bekleme sonrası toparlanma doğrulandı.
- Yönetici ürün listesindeki 30 saniyelik otomatik yenileme kaldırıldı. Kaydetme/toggle/silme/ilk aktarım akışları ilgili genel önbelleği yeniler.
- Build, lint, TypeScript, birim testleri ve yeni tek ürün/sınırlı öneri sorgularının Firestore erişim kuralları kontrol edildi.

Komutlar: `npm test`, `npm run lint`, `npm run build`, `npm run test:cache`, `npm run test:rules`, `npx tsc --noEmit`.

---

# Önceki doğrulama — 10 Kasım 2026 (kota doluyken)

- `npm test`, `npm run lint`, `npm run build` ve TypeScript kontrolü başarılı. Firestore demo emülatöründe 100 kontrol geçti; ürün kaydında eski alt kategori/marka alanlarının temizlenmesi de doğrulandı.
- Kategoriler yalnızca Bay, Bayan ve Unisex olarak sabitlendi. Eski `erkek` / `kadin` / `unisex` kimlikleri korunuyor. Özel kategori sorgusu ürün düzenleyicisinden kaldırıldı.
- Masaüstü ve 390 px mobil tarayıcıda kullanıcı tarafından sağlanan Naxos ve Erba Pura fotoğrafları doğrulandı. Ana fotoğraf şişenin tamamını gösterecek biçimde yerleşir; iki görsel sayfa açılırken yüklenir. Mobilde yatay taşma yok.
- Masaüstü ve mobil ana menüde Blog bağlantısı yok. Mobil kategori bağlantıları Bay, Bayan ve Unisex ile sınırlı.
- “Parfümümü nasıl saklamalıyım?” sorusu kaldırıldı. Katalogdaki ve ürün düzenleyicisindeki alt kategori / parfüm markası alanları kaldırıldı.
- Genel site kontrolü 6 sayfa ve 12 yerel varlık için geçti; ancak Firestore `429 RESOURCE_EXHAUSTED`, `Quota exceeded.` döndürüyor. Bu nedenle bu çalışmada canlı katalog boş geldi, aktif ürün detayları ve güncel ürün sayısı doğrulanamadı. Kategori eşleme ve ürün kayıt davranışı yerel testler ve emülatörde doğrulandı.
- Canlı Firebase verilerine ve kurallarına yazılmadı. Bu sade kategori yapısı için yeni kategori kuralları yayınlamak gerekmiyor.

Ekran görüntüleri Git dışında `artifacts/november-10/` altındadır.

---

## Önceki doğrulama — 9 Kasım 2026

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

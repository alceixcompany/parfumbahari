# Parfum Bahari — Firebase kurulumu

Yerel `.env.local`, `parfumbahari-11a63` projesini ve `NEXT_PUBLIC_CONTENT_SOURCE=firebase` ayarını kullanır. Dosya Git'e dahil değildir. Yönetici şifresi kaynak koduna veya ortam dosyasına kaydedilmez.

## Yönetici girişi

Authentication'da Email/Password sağlayıcısı açık olmalıdır. `FIREBASE_PRIMARY_ADMIN_UID`, mevcut ana yönetici hesabının UID'sidir. Girişte Firebase kimliği sunucuda doğrulanır; başarılı giriş, imzalı httpOnly oturum çerezi oluşturur. Diğer yönetici hesapları için `admins/<UID>` belgesinde `isAdmin: true` gerekir.

`firestore.rules` dosyasındaki ana yönetici UID'si, ortam ayarıyla aynı olmalıdır. Kuralların Firebase konsolunda **yayınlanması** gerekir. Yalnızca Authentication hesabı açmak Firestore yetkisi sağlamaz. Önceki rol tabanlı kurallar kullanılıyorsa ana hesap için de `admins/<UID>` belgesine boolean `isAdmin: true` eklenmelidir. İstemci eksik yönetici rolünü kendiliğinden oluşturamaz.

## Başlangıç içerikleri

Ana yöneticinin ilk başarılı girişinde 6 ürün, 4 yazı, 6 galeri görseli ve 3 kategori Firestore'a tek işlemde aktarılır. Aynı kimlikteki mevcut kayıtların üzerine yazılmaz. `admins/parfum-bahari-content-seed-v1` tamamlanma kaydı sonraki girişlerde otomatik aktarımı durdurur; silinen kayıtlar yeniden oluşturulmaz. Yetki hatası panelde görünür ve aktarım başarılıymış gibi gösterilmez.

## Ürünler ve fotoğraflar

`/admin/urunler` üzerinden ürün oluşturma, düzenleme, silme, yayınlama/gizleme ve ana sayfada öne çıkarma yapılır. Bir ürüne bilgisayardan veya telefondan en fazla 8 fotoğraf seçilir; çoklu dosya seçimi ve sürükleyip bırakma desteklenir. Fotoğraflardan biri kapak olarak seçilir. Kapak katalogda ve detay galerisinde ilk sırada gösterilir. Önizleme ve sıkıştırma tarayıcıda yapılır. Kaydetmeden kapatılan fotoğraflar Firebase'e yüklenmez.

Girdi sınırı 20 MB'dir. Görseller en fazla 2400 piksele ve 700 KiB'a küçültülüp WebP/JPEG olarak Firestore `media` koleksiyonunda tutulur. Ürün ve tüm yeni fotoğraflar aynı transaction içinde kaydedilir; işlem başarısızsa yarım kayıt oluşmaz. `/api/media/[id]` doğrulanmış görseli sunar. Bu akış için Firebase Storage kullanımı gerekmez. Eski tek fotoğraflı ürünler ek işlem gerektirmeden çalışır; kategori, koku ailesi, nota ve ml alanları ürün ekranlarından kaldırılmıştır. `firestore.indexes.json`, medya baytlarının indekslenmesini kapatır.

Firebase modunda genel sayfalar yalnızca yayındaki Parfum Bahari kayıtlarını gösterir. Bağlantı veya yetki hatasında statik içeriklere dönülmez. İletişim sayfası, formu ve yönetimdeki mesaj bölümü kaldırılmıştır.

## Kontroller

- `npm run build`: üretim derlemesi.
- `node scripts/test-admin-session.cjs`: kimlik doğrulama ve oturum kontrolü.
- `node scripts/test-initial-content.cjs`: ilk aktarım ve mevcut kayıtların korunması.
- `npm run test:rules`: izole `demo-parfum-bahari` emülatöründe yetki, ürün ve medya transaction kontrolleri; gerçek projeye yazmaz.
- `npm run check:site`: çalışan sunucuda sayfa, bağlantı, görsel ve SEO kontrolleri. Firebase modunda başlangıç içeriği önceden aktarılmış olmalıdır.

Statik önizleme için `NEXT_PUBLIC_CONTENT_SOURCE=static` ayarlanıp uygulama yeniden başlatılabilir. Üretimden önce `NEXT_PUBLIC_SITE_URL` gerçek HTTPS alan adıyla doldurulmalıdır.

## Kategori yönetimi — 10 Kasım 2026

Ürün kategorileri kodda sabittir: Bay (`erkek`), Bayan (`kadin`), Unisex (`unisex`). `/admin/kategoriler` bu üç seçeneği listeler. Ürün düzenleyicisinde tek bir kategori seçilir; alt kategori ve parfüm markası alanları kaldırılmıştır. Katalog aynı üç kategoriyle filtrelenir.

Eski ürün kimlikleri ve URL parametreleri korunur. `bay` ve `bayan` kimlikleri de eski `erkek` ve `kadin` kimliklerine eşlenir. Kategorisiz eski ürünlerde adından güvenli biçimde kategori çıkarılır; `categoryId` alanında geçerli bir açık seçim varsa bu önceliklidir. Eski özel bir kategori artık desteklenmediğinde ürün adındaki kategori kullanılır.

Genel sayfalar ve ürün düzenleyicisi `product_categories` koleksiyonunu okumaz; bu nedenle yalnızca bu değişiklik için yeni Firestore kuralları yayınlamak gerekmez. Önceki kategori belgeleri canlı veritabanından toplu olarak silinmez. Ürün yeniden kaydedildiğinde kullanılmayan `subcategoryId` ve `fragranceBrand` alanları kayıt yardımcı fonksiyonunca temizlenir; kategori kimliği korunur.

Yönetici ürün listesi `/api/admin/collections/products` üzerinden imzalı yönetici çerezi ve Firebase ID token ile okunur. Firestore yetki kuralları ve önbelleksiz yanıtlar korunur.

## Genel içerik önbelleği ve güncellemeler

Genel veri sorguları `src/lib/contentCache.ts` üzerinden 3600 saniyelik paylaşımlı önbelleğe alınır. Anahtarlar proje, koleksiyon ve sorgu kapsamını içerir. Aynı ürünün metadata ve sayfa istekleri tek ürün sonucunu paylaşır. Ürün/yazı detayları en fazla bir belge, öneriler en fazla dört belge ister; eşitlik indeksleri kullanıldığından bu değişiklik için yeni bir birleşik indeks veya kural yayını gerekmez.

İstemcideki yazma işlemi tamamlandıktan sonra `refreshPublicContent` ilgili koleksiyonları `/api/admin/revalidate` uç noktasına iletir. Sunucu imzalı oturumu, Firebase kimliğini, kimliklerin eşleşmesini ve yönetici rolünü doğrular; sadece izin verilen genel içerik etiketlerini `{ expire: 0 }` ile geçersiz kılar. Bir sonraki istek güncel veriyi okur. Önceden açılmış ziyaretçi sayfaları kendiliğinden yeniden yüklenmez.

Önbellek yenilemesi başarısız olursa tamamlanmış veritabanı kaydı başarısız sayılmaz; panelde kayıt tamamlandı bilgisiyle birlikte yenileme uyarısı gösterilir. Başarılı güncelleme beklenirken aynı ürünün tekrar oluşturulmasına gerek yoktur. Firebase konsolu/harici betikler bu uç noktayı çağırmadığından onların değişiklikleri zaman tabanlı yenilemede görünür.

Medya baytları değiştirilmez UUID altında doğrulanarak 1 yıl önbelleğe alınır. Fotoğraf değiştirme zaten yeni UUID üretir. Taslak admin verisi veya Firebase tokenları genel veri önbelleğine alınmaz.

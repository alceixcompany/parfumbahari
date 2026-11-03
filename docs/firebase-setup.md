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

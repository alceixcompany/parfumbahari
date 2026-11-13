# Parfum Bahari

Next.js 16 / React 19 üzerinde, Türkçe bir parfüm markası sitesi. Krem ve bordo renkler, okunaklı Arial sistem tipografisi, şeffaf yatay marka logosu ve yerel ürün fotoğrafları kullanır. Mevcut Firebase, Redux ve güvenli yönetici oturumu altyapısı korunmuştur.

## Çalıştırma

```sh
npm install
npm run dev
```

Yerel `.env.local` dosyası Parfum Bahari Firebase projesine bağlıdır. Ortam ayarı olmadan varsayılan kaynak **statik** olarak çalışır. `npm run build` üretim derlemesi; `npm start` üretim sunucusu; `npx tsc --noEmit` tip kontrolüdür. Çalışan sunucuda `npm run check:site` güncel katalogdan örnek ürünler seçerek sayfa, bağlantı, medya, yönlendirme ve SEO bütünlüğünü denetler. Tüm ürün detaylarını kontrol etmek için `node scripts/check-site.mjs http://localhost:3000 --all-products` kullanılabilir.

## Sayfalar

- `/`: ana sayfa, seçki, marka hikâyesi, koku aileleri ve günlük.
- `/urun-katalogu`: ürün arama, alfabetik sıralama ve yerel favoriler.
- `/urun-katalogu/[slug]`: ürün açıklaması, çoklu fotoğraf galerisi, tıklayarak tam ekran açma/yakınlaştırma ve ilgili ürünler.
- `/hakkimizda`, `/galeri`, `/haberler`, `/haberler/[slug]`, `/gizlilik-politikasi`.
- `/admin`: statik modda herkese açık içerik özeti; Firebase modunda oturumla korunan yönetim paneli.
- `/admin/urunler`: ürün ekleme/düzenleme, yayınlama/gizleme, çoklu fotoğraf yükleme, kapak seçimi ve tek ürün açıklaması alanı. Alt başlık ve kısa açıklama kaldırıldı.

Eski İngilizce ve sektör sayfaları ilgili Türkçe sayfalara kalıcı yönlenir. Eski marka içerikleri ve görselleri kaldırıldı. Eski uzak veritabanlarına dokunulmadı.

## Statik içerik

- Ürünler: `src/data/products.json`
- 4 Türkçe blog yazısı, 6 galeri görseli ve 3 kategori: `src/data/starter-content.json`
- Marka ve menü: `src/data/brand.ts`
- Ortak veri erişimi: `src/lib/publicContent.ts`
- Arayüz: `src/components/brand/`, `src/app/globals.css`, `src/app/typography.css`
- Görseller ve PB marka varlıkları: `public/parfum-bahari/`

Ürün adları, açıklamaları ve görseller bu tasarım için hazırlanmış **konsept içeriklerdir**; gerçek stok, fiyat, sertifika veya performans iddiası değildir. Katalogda bu bilgi belirtilir. Satın alma/ödeme akışı yoktur.

Favoriler tarayıcıda saklanır. İletişim sayfası ve formu kaldırılmıştır. Fotoğraflar tarayıcıda küçültülür; ürünle birlikte Firebase Firestore'a kaydedilir.

## Firebase ve SEO

`.env.example` tüm ayarları belgeler. [Firebase kurulumu](docs/firebase-setup.md), yönetici hesabını ve güvenlik kurallarını açıklar. İlk yetkili yönetici girişinde 19 başlangıç kaydı bir kez aktarılır; mevcut kayıtlar korunur. Kayıtlar marka kimliğiyle ayrılır; Firebase modunda silinmiş/yayından kaldırılmış içerikler statik yedekten geri gelmez.

Gerçek HTTPS alan adını `NEXT_PUBLIC_SITE_URL` ile ayarlayın. Alan adı doğrulanana kadar indeksleme kapalıdır. Türkçe metadata, canonical, Open Graph, robots, sitemap ve yapılandırılmış veriler hazırdır. [SEO notları](docs/seo.md).

Görsel üretim yöntemi ve istemleri [görsel notlarında](docs/assets.md) bulunur.

## Güncel arayüz — 10 Kasım 2026

- Blog bağlantısı ana menüden kaldırılmıştır; mevcut `/haberler` sayfaları ve yönetimi korunur.
- `logo-gold.png`, kullanıcının sağladığı altın renkli “Parfüm Baharı / Kokunla İz Bırak” logosunun arka plansız sürümüdür. Başlık, alt bilgi, yönetim paneli ve Organization şemasında kullanılır. Görsel düzenleme istemi `docs/assets.md` içindedir.
- Üst hero üç slayt arasında otomatik kayar; dokunarak kaydırma ve altta ortalanmış üç nokta ile seçim desteklenir. Ürün seçkisinin altındaki ayrı ikinci slider, Carolina Herrera dört şişeli seçkiyi, kadın çiftini ve erkek çiftini üç ayrı sahnede gösterir; kendine ait noktaları ve ileri/geri düğmeleri vardır. İki slider birbirinden bağımsız çalışır. Elle seçim/kaydırma otomatik geçişi durdurur; odakta, fare üzerindeyken ve azaltılmış hareket tercihinde otomatik geçiş yapılmaz.
- Hakkımızda metni `src/data/about.ts` içindedir; ana sayfadaki marka hikâyesi aynı kaynağı kullanır.
- Ürün kategorileri yalnızca Bay, Bayan ve Unisex’tir. Katalogda ve admin ürün düzenleyicisinde alt kategori veya parfüm markası alanı yoktur. Eski `erkek`, `kadin`, `unisex` kimlikleri ve URL’leri korunur; kategorisi olmayan eski ürünler adlarından eşleştirilir.
- `/admin/kategoriler` üç sabit kategoriyi gösterir. Ürün düzenleyicisinden kategori seçilir; özel kategori koleksiyonuna istek atılmaz.
- Admin ürün listesi, Firebase kimliğini ve Firestore yetkilerini koruyan sunucu üzerinden yüklenir. 15 saniyelik yükleme sınırı, yeniden deneme, arama, 24 kayıtlık sayfalama ve eski ürün verilerini normalleştirme eklendi.

Hikâye bölümünde kullanıcı tarafından sağlanan Xerjoff Naxos ve Erba Pura fotoğrafları kullanılır. “Parfümümü nasıl saklamalıyım?” sorusu kaldırılmıştır. Sabit kategori yapısı için yeni Firestore kuralı yayınlamak gerekmez; eski kategori belgeleri toplu olarak değiştirilmez.

Doğrulama: `npm test`, `npm run test:rules`, `npm run lint`, `npm run build`, `npx tsc --noEmit`.

## Firestore okuma tüketimi

- Genel katalog, blog ve galeri sorguları Next.js’in istekler arasında paylaşılan Data Cache katmanında **1 saat** saklanır. Yalnızca başarılı ve yayındaki Parfum Bahari kayıtları önbelleğe girer. Yetkili admin listeleri bu paylaşımlı önbelleğe girmez.
- Ürün/yazı detayları `slug + isActive + brand` eşitlik sorgusu ve `limit: 1` kullanır. İlgili içerik önerileri ayrı ve ortak bir `limit: 4` sorgusunu paylaşır; detay sayfası tüm kataloğu okumaz.
- Değişmez UUID’li fotoğraflar doğrulandıktan sonra sunucuda 1 yıl önbelleğe alınır. Tarayıcı/CDN önbelleği de korunur.
- Admin ürün listesinde 30 saniyelik otomatik yenileme yoktur. Liste açılışta, kayıttan sonra veya elle yenilenir.
- Ürün/blog/galeri oluşturma, düzenleme, görünürlük değişimi, silme ve başlangıç içeriği aktarımı ilgili genel veri önbelleğini yeniler. `/api/admin/revalidate` imzalı oturumla eşleşen geçerli Firebase yönetici kimliği ister. Konsoldan veya harici betikten yapılan değişiklikler normal önbellek süresinde görülür.
- Eşzamanlı aynı sorgular sunucu örneği içinde birleştirilir. Firestore 429 döndürürse bu örnekte yeni genel veri okumaları 60 saniye duraklatılır. Hata boş katalog veya olmayan ürün olarak önbelleğe yazılmaz; geçici yükleme hatası gösterilir.
- Genel sayfalar derleme sırasında canlı veritabanı okumaz. Kota dolu olsa da derleme tamamlanabilir.

`npm run test:cache`, üretim derlemesinin geçici ve ayrı bir kopyasında gerçek Next.js önbelleğini doğrular. Firebase istekleri yerel test sunucusuna yönlendirilir; canlı kota harcanmaz, çalışma klasörünün veri önbelleğine deneme kaydı yazılmaz. Önce `npm run build` çalıştırılmalıdır.

## Gerçek katalog verilerinin uyarlanması

`npm run migrate:catalogue -- --project <proje-id>` varsayılan olarak yalnızca değişiklik planı çıkarır. Yönetici kimliği yoksa sadece yayındaki Parfum Bahari ürünlerini okuyabilir. Mevcut Firebase CLI hesabını kullanmak için `--firebase-cli`, ADC için `--adc` kullanılabilir; hedef projeye zaten yetkili bir hesap gerekir. Araç hesap veya rol oluşturmaz.

Planlar ve geri dönüş makbuzları Git dışında `artifacts/catalogue-migration/` altında, yalnızca kullanıcı tarafından okunabilir dosyalarda saklanır. İncelenen plan `--apply --plan <dosya>` ile tek atomik işlemde uygulanır; bu modda yetkili kimlik zorunludur. Ürün adları, mevcut URL’ler, görsel referansları ve yayın durumları korunur. Kategori adından kesin belirlenemeyen ürünler inceleme listesine bırakılır. Ayrıntılar `docs/catalogue-migration.md` içindedir.

Markanın güncel sloganı `src/data/brand.ts` içindeki **PREMİUM KALİTE PREMİUM KOKULAR** metnidir; üst bant, mobil menü, alt bilgi, yönetim ekranları ve ana sayfa metadata alanları aynı kaynağı kullanır.

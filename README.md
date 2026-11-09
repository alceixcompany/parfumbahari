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

## 9 Kasım 2026 güncellemesi

- Menüde ve sayfalarda Blog adı kullanılır; mevcut `/haberler` adresleri korunur.
- `logo-horizontal-v2.png` arka plansız yeni yatay logodur. Yanında ayrı yazı veya slogan gösterilmez. Üretim istemi `docs/assets.md` içindedir.
- Hero üç slayt arasında otomatik kayar; dokunarak kaydırma ve altta ortalanmış üç nokta ile seçim desteklenir. Elle seçim/kaydırma otomatik geçişi durdurur; odakta, fare üzerindeyken ve azaltılmış hareket tercihinde otomatik geçiş yapılmaz.
- Hakkımızda metni `src/data/about.ts` içindedir; ana sayfadaki marka hikâyesi aynı kaynağı kullanır.
- Kadın, Erkek ve Unisex ana kategorileri; Eau de Parfum, Eau de Toilette ve Parfum & Extrait alt kategorileri vardır. Marka filtresi bunlardan bağımsızdır. Eski ürünlerin kategori ve markaları adlarından çıkarılır, mevcut Firebase kayıtlarına toplu yazılmaz. Panelden verilen açık seçimler otomatik eşleşmenin önüne geçer.
- `/admin/kategoriler` ile ana/alt kategori eklenir, düzenlenir ve gizlenir. Ürün düzenleyicisinde kategori ve marka değiştirilebilir. Kategoriler `product_categories` koleksiyonunda saklanır; başlangıç yapısı kayıt olmadan da kullanılabilir.
- Admin ürün listesi, Firebase kimliğini ve Firestore yetkilerini koruyan sunucu üzerinden yüklenir. 15 saniyelik yükleme sınırı, yeniden deneme, arama, 24 kayıtlık sayfalama ve eski ürün verilerini normalleştirme eklendi.

**Canlıya geçiş:** Yeni kategori yönetimi için bu sürümdeki `firestore.rules` dosyası ilgili Firebase projesinde yayınlanmalıdır: `firebase deploy --only firestore:rules --project <hedef-proje>`. Bu işlem yetkili Firebase hesabıyla yapılır. Bu çalışma sırasında canlı kurallar veya ürün kayıtları değiştirilmedi.

Doğrulama: `npm test`, `npm run test:rules`, `npm run lint`, `npm run build`, `npx tsc --noEmit`.

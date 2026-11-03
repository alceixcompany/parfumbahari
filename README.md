# Parfum Bahari

Next.js 16 / React 19 üzerinde, Türkçe bir parfüm markası sitesi. Krem ve bordo renkler, okunaklı Arial sistem tipografisi, PB yazı logosu ve yerel ürün fotoğrafları kullanır. Mevcut Firebase, Redux ve güvenli yönetici oturumu altyapısı korunmuştur.

## Çalıştırma

```sh
npm install
npm run dev
```

Yerel `.env.local` dosyası Parfum Bahari Firebase projesine bağlıdır. Ortam ayarı olmadan varsayılan kaynak **statik** olarak çalışır. `npm run build` üretim derlemesi; `npm start` üretim sunucusu; `npx tsc --noEmit` tip kontrolüdür. Çalışan sunucuda `npm run check:site` sayfa, bağlantı, medya, yönlendirme ve SEO bütünlüğünü denetler.

## Sayfalar

- `/`: ana sayfa, seçki, marka hikâyesi, koku aileleri ve günlük.
- `/urun-katalogu`: ürün arama, alfabetik sıralama ve yerel favoriler.
- `/urun-katalogu/[slug]`: ürün açıklamaları, çoklu fotoğraf galerisi ve ilgili ürünler.
- `/hakkimizda`, `/galeri`, `/haberler`, `/haberler/[slug]`, `/gizlilik-politikasi`.
- `/admin`: statik modda herkese açık içerik özeti; Firebase modunda oturumla korunan yönetim paneli.
- `/admin/urunler`: ürün ekleme/düzenleme, yayınlama/gizleme, çoklu fotoğraf yükleme ve kapak seçimi.

Eski İngilizce ve sektör sayfaları ilgili Türkçe sayfalara kalıcı yönlenir. Eski marka içerikleri ve görselleri kaldırıldı. Eski uzak veritabanlarına dokunulmadı.

## Statik içerik

- Ürünler: `src/data/products.json`
- 4 Türkçe yazı, 6 galeri görseli ve 3 kategori: `src/data/starter-content.json`
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

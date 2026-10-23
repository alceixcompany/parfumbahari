# Parfum Bahari SEO

- Dil `tr`, Open Graph locale `tr_TR`.
- Her sayfanın kendi başlığı, açıklaması ve canonical adresi vardır.
- `/sitemap.xml`: ana sayfa, Türkçe içerik sayfaları, aktif parfümler ve aktif günlük yazıları.
- `Organization`, `BreadcrumbList`, katalog için `ItemList`, ürünler için `Product`, yazılar için `BlogPosting` JSON-LD.
- Uydurma değerlendirme, stok, fiyat, mağaza adresi veya satış teklifi işaretlemesi yoktur.
- `/admin` ve filtreli katalog sayfaları indeks dışıdır. Filtre sayfaları ana kataloğu canonical gösterir.
- `NEXT_PUBLIC_SITE_URL` doğrulanmış HTTPS alan adıyla ayarlanmadan indeksleme kapalıdır. Production olmayan önizlemeler ve geliştirme de indekslenmez.
- Eski sayfa yolları uygun Türkçe hedeflere 308 ile yönlenir. Eski içerik slug'ları artık yayınlanmıyorsa 404 verir.
- Gerçek iletişim bilgileri ortam değişkenlerinden alınır; eski firmaya ait telefon, adres ve schema kaldırılmıştır.

İçerik güncellemesinde ürün/yazı kimliklerini sabit tutun. Yeni slug kullanılıyorsa eski URL için bilinçli yönlendirme ekleyin. Statik sayfalara her istekte sahte güncelleme tarihi atanmaz.

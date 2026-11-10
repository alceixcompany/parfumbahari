# Katalog verisi geçişi

Bu araç gerçek ürünleri Bay (`erkek`), Bayan (`kadin`) ve Unisex (`unisex`) katalog modeline uyarlar. Varsayılan çalışma kuru çalıştırmadır; hiçbir belgeye yazmaz.

## 10 Kasım 2026 canlı geçişi

Kullanıcının sağladığı mevcut yönetici hesabıyla normal Firebase Auth girişi yapıldı ve birincil yönetici kimliği doğrulandı. CLI hesabında hedef proje IAM izni bulunmadığından bu hesabın yetkileri kullanılmadı. Parola ve oturum tokenı dosyalara kaydedilmedi.

**149 ürünün tam önceki hâli yedeklendi; 142 yayındaki ürün ve 7 taslak korundu.**

- İlk atomik işlem 140 belgeyi güncelledi: 113 üründe kategori kimliği standartlaştırıldı, 27 üründeki `subcategoryId` ve `fragranceBrand` alanları temizlendi.
- İkinci atomik işlem, kaynaklardan kontrol edilen üç yayındaki ürünün kategorisini tamamladı: Givenchy L’Interdit Absolu → Unisex ([Givenchy](https://www.givenchybeauty.com/us/p/l-interdit-absolu-P000218.html)), Grand Soir → Unisex ([Luckyscent](https://www.luckyscent.com/products/grand-soir-by-maison-francis-kurkdjian)), Prada Paradigme → Bay ([Prada Beauty](https://www.prada-beauty.com/fragrance/paradigme/paradigme-eau-de-parfum/3614274182897.html)). Bu elle incelenmiş plan, otomatik eşleme kuralına eklenmedi; kategori seçimi ve kaynakları ayrı yedekte tutuldu.
- Toplam 143 farklı belge değişti. Yayındaki 142 ürünün tamamı Bay/Bayan/Unisex kategorilerinden birine bağlı. Kategorisi belirsiz altı eski örnek ürün taslak olarak bırakıldı; yayına alınmadı.
- İlk işlem sonrasında 149 ürünün bütün alanları özgün yedekle karşılaştırıldı: yalnızca planlanan alanlar ve `updatedAt` değişti. Yeniden kuru çalıştırmada sıfır otomatik değişiklik kaldı. İkinci işlemdeki üç belge ayrıca tekrar okunup aynı şekilde doğrulandı.
- Canlı admin panelinde Prada kaydı açıldı; kayıtlı ana kategorisi Erkek Parfüm olarak doğrulandı. Canlı panel hâlâ önceki uygulama sürümünü çalıştırıyor; eski alt kategori/marka kontrollerinin kaldırılması ve kota iyileştirmeleri, yeni kaynak sürümü dağıtıldığında geçerli olur.

Git dışında `artifacts/catalogue-migration/` altında özel izinlerle tutulan kayıtlar:

- `plan-2026-11-10T09-40-21-873Z.json`: özgün 149 belge ve otomatik plan.
- `applied-2026-11-10T09-42-33-846Z.json`: 140 belgenin işlem makbuzu.
- `plan-2026-11-10T09-43-15-043Z.json`: ilk işlem sonrası tam doğrulama verisi.
- `reviewed-categories-2026-11-10.json` ve `applied-reviewed-categories-2026-11-10.json`: incelenen üç kategorinin yedeği ve işlem makbuzu.
- `verified-reviewed-categories-2026-11-10.json`: ikinci işlem sonrası doğrulama verisi.

Her iki işlem belge sürümü ön koşullarıyla yapıldı. Ürün silinmedi; yeni ürün oluşturulmadı. Ürün adları, URL’ler, fotoğraflar, açıklamalar ve yayın durumları korundu. Veritabanı kuralları ve hesap yetkileri değiştirilmedi.

## Kullanım

Yetkili Firebase hesabıyla mevcut CLI oturumunu kullanmak için:

```sh
npm run migrate:catalogue -- --project parfumbahari-11a63 --firebase-cli
```

Önce yeni planı inceleyin. Sonra aynı kimlik seçeneğiyle uygulayın:

```sh
npm run migrate:catalogue -- --project parfumbahari-11a63 --firebase-cli --apply --plan /tam/yol/plan.json
```

Alternatif kimlikler: ortamda `FIREBASE_ID_TOKEN` veya güvenilir Application Default Credentials (`GOOGLE_APPLICATION_CREDENTIALS` / `--adc`). Anahtarları, şifreleri ve tokenları sohbete veya Git’e koymayın. CLI oturumu kullanımı mevcut yetkileri kullanır; yetki yükseltmez.

## Korunan veriler ve işlem sınırları

- Sadece `brand: parfum-bahari` ürünleri planlanır. Başka markanın kayıtları, medya belgeleri veya admin rolleri değiştirilmez.
- Geçerli mevcut kategori seçimi korunur. Ürün adındaki kategoriyle çelişirse otomatik değiştirmek yerine inceleme notu eklenir.
- Adlar, mevcut slug’lar, yayın durumu ve özgün fotoğraf referansları korunur. Eksik slug yalnızca geçerli belge kimliğiyle tamamlanabilir. Belirsiz/uyumsuz URL elle incelemeye bırakılır.
- Eksik açıklama eski açıklamadan, eksik fotoğraf listesi mevcut kapaktan tamamlanabilir. Tanınmayan fotoğraf yapıları veya sekizden uzun listeler kesilmez.
- Kaldırılan iki alan dışındaki veriler topluca silinmez. Güncellemeler yalnızca ilgili alan maskeleriyle yapılır.
- Planın bütünlük özeti ve proje kimliği doğrulanır. Her belge için orijinal `updateTime` ön koşulu kullanılır; arada düzenlenen bir belge varsa tüm atomik işlem reddedilir. Otomatik tekrar yoktur.
- Bir işlem en fazla 400 belge içerir; daha büyük planlar sessizce parçalanmaz. Plan ve makbuzlar `0600` izinle oluşturulur; mevcut dosyaların üzerine yazılmaz.
- Harici geçiş, genel site önbelleğinde normal yenileme süresiyle görünür; yeni uygulamada bu süre bir saattir.

## Geri alma

Başarılı işlem sonrasında çıktıdaki makbuz yolunu kullanın:

```sh
npm run migrate:catalogue -- --project parfumbahari-11a63 --firebase-cli --rollback /tam/yol/applied.json
```

Sadece geçişin değiştirdiği alanlar, tam özgün Firestore değerleriyle geri alınır. Geçişten sonra elle değiştirilen belgeler varsa ön koşul bu geri almayı reddeder; kullanıcının sonraki düzenlemeleri ezilmez. Bu canlı geçişin iki makbuzu birbirinden ayrı ürünleri kapsar ve aynı geri alma komutuyla ayrı ayrı kullanılabilir.

## Yerel test

`npm test`, muhafazakâr eşleme testleri ile gerçek CLI’nin yerel API yanıtları üzerindeki testlerini çalıştırır. Kuru çalıştırma, özel yedek dosyaları, atomik güncelleme ön koşulları, değişikliksiz ikinci çalışma, eksiksiz geri alma, başka marka kayıtlarının korunması ve eksik yetkide yazmanın reddi doğrulanır. Bu testler canlı Firebase’e yazmaz.

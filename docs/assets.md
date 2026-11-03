# Parfum Bahari — görsel varlıklar

## Güncel logo — 3 Kasım 2026

Logo, okunaklı Arial yazı ve bordo PB ambleminden oluşan SVG olarak yenilendi. Sitede ortak `BrandMark` bileşeni; marka sayfasında `logo-wordmark.svg`; yapılandırılmış veride `logo-wordmark.png`; manifest ve tarayıcı simgesinde `icon-pb.png` / `src/app/icon.png` kullanılır. SVG kaynaklar `public/parfum-bahari/` içindedir. PNG kopyalar Sharp ile SVG kaynaklarından oluşturuldu. Bu logo için görsel üretim aracı kullanılmadı.

## Fotoğraflar

Üretim modu: **yerleşik Imagegen aracı**. İlk tasarımda kullanıcının sağladığı logo `logo.png`, küçük kopyası `icon.png` olarak saklanmıştı; bu iki dosya artık arayüzde kullanılmıyor.

Sekiz görsel, yerel `public/parfum-bahari/` klasöründe WebP olarak saklanır. Kaynak PNG'ler araç tarafından Codex görsel kitaplığına kaydedildi; projedeki görseller bu dış konuma bağımlı değildir. Sharp yalnızca yeniden boyutlandırma ve WebP dönüştürme için kullanıldı. Ürün görselleri ve koku kompozisyonları temsilî koleksiyon konseptleridir.

## Hero istemi

Dosya: `hero.webp`

Use case: product-mockup. Asset type: luxury fragrance brand website hero photograph, landscape 1536x1024. Create an exceptionally refined REAL photographic editorial still life for a Turkish independent fragrance concept brand Parfum Bahari. One substantial clear rectangular perfume bottle with pale golden fragrance, a thick dark burgundy cylindrical cap, and a small ivory paper label reading exactly 'PARFUM BAHARI' and below 'FLEUR DE BAHAR'. Bottle is on a worn warm limestone ledge at right center, one delicate branch of creamy magnolia flowers entering from upper right, a few fallen ivory petals, soft peach fabric partly at lower right. Deep warm mocha/burgundy shadow background, a broad late afternoon sunbeam from upper left hits the bottle and textured stone, real shadows, real optical glass caustics. Bottle and flowers occupy RIGHT TWO THIRDS, left third is quiet dark warm shadow to support optional overlay but NO OVERLAY TEXT. Sophisticated quiet luxury magazine perfume campaign, film grain, shot on medium format 80mm lens, tactile and believable materials, muted burgundy, honey, cream, no neon, no gradient graphics, no artificial 3d rendering. No brand other than Parfum Bahari. No watermark.

## Altı ürün için ortak istem

Her ürün ayrı bir Imagegen çağrısıyla oluşturuldu. Aşağıdaki ortak istemde `{subject}` yerine ilgili ürünün aşağıdaki tarifi kullanıldı.

Use case: product-mockup. Asset type: portrait product catalogue photograph 1024x1536 for independent Turkish fragrance concept Parfum Bahari. {subject} Centered full bottle, occupies 55% of image height, visible full cap and base with room around it, straight-on camera at bottle midline. Subtle sunbeam enters from upper left with natural diagonal shadow behind bottle to right. Restrained quiet luxury product campaign shot on Hasselblad, real photographic glass refraction, tangible ivory textured label, small fine serif uppercase label text. Consistent front-facing product catalogue, warm natural light, imperfect tactile stone. Minimal props. Crisp accurate rectangular bottle. No artificial gradients, no CGI appearance, no watermarks, no text outside the physical label.

### fleur.webp

A clear rectangular luxury perfume bottle filled with pale amber liquid, ivory label reading 'PARFUM BAHARI' above 'FLEUR DE BAHAR', matte dark burgundy rounded cylindrical cap. Creamy magnolia blossoms and two scattered pale pink petals at the foot of the bottle. Warm ivory plaster backdrop and a pale stone surface.

### santal.webp

A smoky amber rectangular luxury perfume bottle, ivory label reading 'PARFUM BAHARI' above 'SANTAL NOIR', matte dark burgundy rounded cylindrical cap. A single small dark sandalwood branch and subtle ochre stone. Warm sandy plaster backdrop and a pale stone surface.

### neroli.webp

A clear rectangular luxury perfume bottle filled with very pale golden liquid, ivory label reading 'PARFUM BAHARI' above 'NEROLI SOLEIL', matte dark burgundy rounded cylindrical cap. A cut fresh bergamot and one small white orange blossom with leaf at the foot. Muted buttery cream plaster backdrop and a pale stone surface.

### ambre.webp

A clear rectangular luxury perfume bottle filled with rich golden amber liquid, ivory label reading 'PARFUM BAHARI' above 'AMBRE DORE', matte dark burgundy rounded cylindrical cap. Small amber resin fragments and one warm brown vanilla pod at bottle foot. Deep terracotta plaster backdrop and warm sandy stone surface.

### rose.webp

A clear rectangular luxury perfume bottle filled with very pale blush pink liquid, ivory label reading 'PARFUM BAHARI' above 'ROSE DE SOIE', matte dark burgundy rounded cylindrical cap. A single dusky blush garden rose resting on the surface beside it with two loose petals. Soft dusty rose plaster backdrop and warm creamy stone surface.

### vetiver.webp

A smoky olive tinted rectangular luxury perfume bottle filled with pale amber liquid, ivory label reading 'PARFUM BAHARI' above 'BLEU VETIVER', matte dark burgundy rounded cylindrical cap. A small stem of olive green leaves and thin dried vetiver roots next to the base. Warm muted sage green plaster backdrop and pale stone surface.

## Üç parfümlü ana sayfa görseli — 3 Kasım 2026

Dosya: `public/parfum-bahari/hero-trio.webp`. Yerleşik Imagegen aracıyla, eski `hero.webp` referans alınarak düzenlendi. Ana sayfada erkek, kadın ve unisex üç şişe birlikte gösterilir; metin katmanları ve beyaz etiket yoktur. Sharp yalnızca WebP dönüşümü için kullanıldı. Eski görsel diğer sayfalarda kullanılmaya devam eder.

Kullanılan tam istem:

> Use case: precise-object-edit / product-mockup. Edit the supplied original Parfum Bahari perfume photograph into a wide editorial website hero photograph. Preserve the original photorealistic atmosphere: deep warm burgundy brown background, soft directional amber sunlight, rough pale limestone plinth, delicate white magnolia branches at the upper right, a little dusty rose fabric. Replace the single bottle with exactly THREE premium distinct Parfum Bahari perfume bottles together in a balanced central still-life group, all three completely visible with space between them. One masculine bottle: smoky dark rectangular glass with restrained black cap. One feminine bottle: the original clear golden liquid square bottle with burgundy cylindrical cap. One unisex bottle: clear slightly green tinted architectural glass with understated brushed metal cap. On the small physical paper labels only, use 'PARFUM BAHARI' and respectively 'HOMME', 'FEMME', 'UNISEX'. No ml or volume text. Keep the three bottles together inside the middle 60 percent of the frame so the group works on mobile as well. Horizontal wide landscape composition, natural optical perspective, authentic product photography, subtle reflections and real glass texture. No floating elements, no web interface, no sticker, no seal, no badge, no watermark, no caption or added advertising typography anywhere. Preserve refined understated warm editorial style of reference. This is an image asset only.

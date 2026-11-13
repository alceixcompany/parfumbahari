# Parfum Bahari — görsel varlıklar

## Güncel altın logo — 13 Kasım 2026

`public/parfum-bahari/logo-gold.png`, kullanıcının sağladığı “Parfüm Baharı / Kokunla İz Bırak” logosunun siyah arka planı kaldırılmış PNG sürümüdür. Yerleşik imagegen aracı, **background-extraction** düzenleme modunda ve `transparent_background: true` ile kullanıldı. Seçilen çıktı 2179 × 721 piksel, gerçek alfa kanallıdır ve değiştirilmeden projeye kopyalandı. Başlık, alt bilgi, yönetim ekranları ve Organization yapılandırılmış verisi bu dosyayı kullanır. Yönetim ekranlarındaki beyaza çevirme filtresi kaldırılarak altın renk korundu. Genel site sloganı değiştirilmedi.

Navbar sürümünde aynı şeffaf dosya, yalnızca `.site-header .brand-logo` kapsamındaki `brightness(.62) saturate(1.1)` CSS filtresiyle daha koyu altın/bronz tonda gösterilir. Harfler, ince çizgiler ve alfa kanalı korunur; alt bilgi ve yönetim ekranları özgün altın tonunu kullanır. Bu ton ayarı için yeni görsel üretilmedi.

Son düzenleme istemi:

> BACKGROUND EXTRACTION ONLY. Use the supplied image exactly as the source artwork, not as a design reference. Remove the pure black background to actual transparent alpha. Preserve the exact original warm pale champagne-gold color and subtle smooth gradient of all original strokes. Absolutely NO added embossing, NO bevel, NO 3D edge, NO outline, NO black outline, NO red or yellow chromatic fringe, NO new metallic texture or extra highlights. The original is smooth elegant thin calligraphic gold lettering and flat softly shaded gold lines. Do NOT redraw or reinterpret. Keep exactly the original 'PARFÜM BAHARI' wordmark, 'KOKUNLA İZ BIRAK' tagline, perfume silhouette, gold horizontal rules, arc and petal. Every black pixel must become transparent, including letter counters and the cap opening. Keep all existing lettering and symbols unchanged. Tight outer crop with small even transparent padding. Output only the original gold logo on true transparency.

## Önceki PB logosu — 3 Kasım 2026

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


## Markalı üç şişeli ana sayfa görseli — 3 Kasım 2026

Dosya: `public/parfum-bahari/hero-branded.webp`. Yerleşik Imagegen aracıyla `hero-trio.webp` sahnesi düzenlendi; kullanıcının sağladığı YSL Babycat, Amouage Guidance 46 ve Parfums de Marly ürün fotoğrafları nesne referansı olarak kullanıldı. Sharp yalnızca WebP dönüşümü için kullanıldı.

Tam istem:

> Use case: compositing / precise-object-edit. Asset type: wide photographic homepage hero, landscape 16:9. Image 1 is the edit target: preserve its warm burgundy-brown background, amber sunlight, limestone plinth, magnolia flowers at upper right, scattered petals and dusty rose fabric. Replace ONLY the three existing generic perfume bottles with the EXACT branded products supplied in images 2, 3 and 4. Image 2 is Yves Saint Laurent BABYCAT RAW BOURBON, clear tall rectangular amber bottle, textured black cylindrical cap, black rectangular label with the YSL monogram and BABYCAT / RAW BOURBON text. Image 3 is AMOUAGE GUIDANCE 46: wide pink-to-red rounded rectangular bottle, pale blush fluted dome cap with golden collar, silver Amouage emblem and gold AMOUAGE GUIDANCE 46 letters. Image 4 is dark navy Parfums de Marly bottle, rounded rectangle, silver metallic cap, embossed twin horses and 1743 shield, embossed PARFUMS de MARLY PARIS near the base. Put Babycat left, Amouage middle, Parfums de Marly right, in a balanced natural still-life group, correct relative proportions. Preserve their original brand names, logos, bottle shapes, cap designs, colours and labels faithfully; do not relabel them Parfum Bahari. All three bottles must be fully visible from cap to base, with small gaps, standing believably on the same stone surface in the middle 58 percent of the landscape frame so the group works when viewed on mobile. Integrate physically realistic warm sunlight, reflections, contact shadows, glass refraction, tactile packaging and metal. Natural premium commercial perfume photography, lifelike rather than CGI. Scene fills every edge of the rectangular canvas, no white margin or blank side area. No added overlay text, no sticker, no badge, no interface, no watermark, no extra bottle.

## Yatay şeffaf logo — 9 Kasım 2026

`public/parfum-bahari/logo-horizontal-v2.png`: yerleşik imagegen aracıyla üretilen, alfa kanallı yatay logo. Başlıkta, alt bilgide ve yönetim panelinde yalnızca bu görsel kullanılır; yanında ayrı yazı veya slogan yoktur. Kaynak çıktı değiştirilmeden projeye kopyalandı.

Üretim istemi:

> Use case: logo-brand. Asset type: finished horizontal transparent PNG logo for the header of a Turkish perfume boutique named Parfum Bahari. Primary request: create a refined, airy, beautiful horizontal identity with a delicate perfume bottle and a very subtle spring petal motif integrated with a graceful, highly legible wordmark. Text verbatim, only inside the logo composition: "Parfum Bahari". Wide horizontal layout around 4:1 with carefully balanced open spacing, compact height so it remains readable at 220px wide. Understated luxury, fresh and elegant rather than ornate, clean vector-like flat artwork, burgundy #632b3c with a restrained warm rose accent, no tiny details. Scene/backdrop: actual transparent alpha background, no solid background, no backdrop rectangle, no checkerboard painted into artwork. No tagline, no slogans, no subtitle, no extra text, no mockup, no shadow, no gradients, no gold metallic treatment. This is the logo image itself; do not show a website or surrounding UI.

## Kullanıcının sağladığı hikâye fotoğrafları — 10 Kasım 2026

`public/parfum-bahari/story-naxos.png` ve `public/parfum-bahari/story-erba-pura.png`, kullanıcının verdiği iki fotoğrafın değiştirilmeden kopyalanmış hâlidir. Ana sayfa ve Hakkımızda sayfasındaki ortak hikâye bölümünde eski Rose de Soie / Santal Noir görsellerinin yerini alır.

## Dört şişeli Carolina Herrera slaytı — 11 Kasım 2026

Dosya: `public/parfum-bahari/hero-herrera-collection.webp`. Yerleşik imagegen aracıyla oluşturuldu; `hero-branded.webp` sahne ve ışık referansı, kullanıcının gönderdiği pembe/lacivert topuklu ayakkabı ve siyah/mavi şimşek biçimli dört şişe nesne referansı olarak kullanıldı. Şişeler tek sahnede yan yana durur. Sharp yalnızca WebP dönüşümü için kullanıldı. Ana sayfada ürün seçkisinin altına eklenen bağımsız ikinci karuselin ilk görselidir. Üst hero üç slaytlı olarak korunur. Slogan resme basılmadı; okunaklı HTML metni olarak gösterilir.

Tam üretim istemi:

> Use case: compositing. Asset type: photorealistic homepage carousel banner, landscape 16:9. Input image 1 is the existing Parfum Bahari campaign scene and style reference; images 2–5 are the four exact product insert references. Create a new companion banner in the same warm burgundy, honey light, pale travertine and subtle dusty rose atmosphere, with a slightly different natural stone arrangement. Replace the three bottles in image 1 with exactly FOUR bottles, all standing side by side, fully visible cap to base, in this left-to-right order: image 2 glossy pale blush pink high heel perfume with black upper toe/cap and slender metallic gold stiletto heel; image 3 glossy deep navy blue high heel perfume with black upper and gold stiletto heel; image 4 angular matte black lightning bolt perfume bottle with restrained metallic gold trim and gold foot; image 5 angular electric cobalt blue and black lightning bolt bottle with black foot. Preserve each reference's distinctive bottle silhouette, proportions, colors, cap, base and small CH monogram faithfully. Do not invent other products, label names or a Parfum Bahari label. Integrate real photographic contact shadows, warm side sunlight, gold metal reflections, glass highlights and believable packaging textures. Keep the four bottles as a compact central group within the middle 62 percent of the frame, with clear small gaps and modest height variation, all feet on a long tactile limestone surface, so a center 4:3 mobile crop still includes all four. Slightly stepped stone background, soft out-of-focus burgundy-brown backdrop, a restrained magnolia branch at upper right and a small fold of dusty pink fabric at the lower edge, coordinated with the existing scene but not a duplicate. High quality lifelike perfume commercial photography, natural imperfections, no CGI or plastic rendering appearance. Edge-to-edge scene; no white product-background panels, no border, no watermark, no captions, no slogans or interface overlay. This is an image asset only; text will be added in HTML.

İkinci sliderdaki diğer sahneler: `public/parfum-bahari/hero-herrera-women.webp` ve `public/parfum-bahari/hero-herrera-men.webp`. Yerleşik imagegen aracıyla, dört şişeli sahne ve aynı kullanıcı referansları kullanılarak hazırlandı; Sharp ile WebP'ye dönüştürüldü.

Kadın çifti için tam istem:

> Use case: compositing / precise-object-edit. Asset type: photorealistic 16:9 landscape website fragrance carousel banner. Image 1 is the existing four-bottle campaign scene to edit. Preserve the warm amber side light, deep burgundy-brown backdrop, tactile stepped pale travertine platform, magnolia branch at upper right, petals and subtle dusty rose fabric along the lower edge. Replace the four bottles with ONLY the exact TWO high heel perfume bottles from images 2 and 3: pale blush pink with black top and slender gold stiletto heel on the left, deep navy blue with black top and slender gold stiletto heel on the right. Both stand fully visible, with a natural small gap, centered as a compact pair in the middle 50 percent of the frame. Preserve the precise bottle silhouettes, proportions, colors, small CH monogram, textures and cap shapes from the references. Keep full cap and full heel in frame. Real gold reflections, natural contact shadows, believable scale and glass, lively premium commercial fragrance photography. No lightning bolt bottles, no additional bottles, no invented labels, no added text, no slogan, no watermark, no border, no web UI. Scene fills the whole image. Mobile center crop must retain both complete bottles.

Erkek çifti için tam istem:

> Use case: compositing / precise-object-edit. Asset type: photorealistic 16:9 landscape website fragrance carousel banner. Image 1 is the existing four-bottle campaign scene to edit. Preserve the warm amber side light, deep burgundy-brown backdrop, tactile stepped pale travertine platform, magnolia branch at upper right, petals and subtle dusty rose fabric along the lower edge. Replace the four bottles with ONLY the exact TWO lightning bolt perfume bottles from images 2 and 3: sculptural matte black bolt with metallic gold trim and gold foot on the left, electric cobalt blue and black bolt with black foot on the right. Both stand fully visible, with a natural small gap, centered as a compact pair in the middle 50 percent of the frame. Preserve the precise angular silhouettes, proportions, colors, small CH monogram, textures, caps and feet from the references. Keep full cap and full foot in frame. Authentic glass and restrained metal reflections, natural contact shadows, believable scale, lively premium commercial fragrance photography. No high heel bottles, no additional bottles, no invented labels, no added text, no slogan, no watermark, no border, no web UI. Scene fills the whole image. Mobile center crop must retain both complete bottles.

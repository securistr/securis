# Securis — Astro Migration Sonuç Raporu

**Faz 1 tamamlandı: migration + tekrar azaltma + deployment + aynı görsel sonuç.**
Redesign yapılmadı.

---

## 1. Mevcut proje — ne vardı?

| | |
|---|---|
| Versiyonlanan dosya | **42** (2.5 MB) |
| HTML sayfası | **17** (el yazımı, her biri kendi kendine yeten) |
| HTML satır toplamı | **5 840** |
| Ortak CSS + JS | 335 satır (`assets/seo-pages.css` + `.js`) |
| **Elle bakım yapılan toplam** | **6 175 satır** |
| Git | **yoktu** |
| CI/CD | **yoktu** |

`securis-bold-animasyon.zip` (1 MB) sitenin kendi arşiv kopyasıydı; `.gitignore` ile dışarıda bırakıldı.

## 2. Yeni yapı — kaç kaynak dosyaya indi?

| | |
|---|---|
| Versiyonlanan dosya | **55** |
| `src/` (elle bakım yapılan kaynak) | **27 dosya / 4 318 satır** |
| `public/` (dokunulmamış statik varlık) | 21 dosya |
| Üretilen sayfa | **17** (birebir aynı sayı) |

`src/` dağılımı:

| Dizin | Dosya | Satır | İçerik |
|---|---|---|---|
| `src/styles/` | 3 | 1 084 | tokens + ana sayfa + alt sayfa CSS'i |
| `src/pages/` | 6 | 799 | 17 sayfayı üreten 6 kaynak |
| `src/data/` | 4 | 783 | tüm içerik verisi |
| `src/scripts/` | 3 | 518 | ortak + ana sayfa + alt sayfa JS |
| `src/lib/` | 2 | 259 | JSON-LD ve link üreticileri |
| `src/components/` | 8 | 388 | ortak bloklar |
| `src/layouts/` | 1 | 89 | sayfa iskeleti |

**17 HTML dosyası → 6 sayfa kaynağı.** 9 bölge sayfası tek `[slug].astro`'dan,
5 hizmet sayfası tek `[slug].astro`'dan üretiliyor.

## 3. Oluşturulan ortak component'ler

| Component | Neyi ortaklaştırdı |
|---|---|
| `BaseLayout.astro` | `<html>/<head>/<body>`, CSP, viewport, PWA + favicon linkleri, Google Fonts yükleme stratejisi, skip-link |
| `SEO.astro` | title, description, canonical, robots, OG, Twitter, JSON-LD |
| `Header.astro` | nav + logo + hamburger + 7 menü öğesi (`home` / `sub` varyantı) |
| `Footer.astro` | NAP satırı + linkler + copyright |
| `MobileCTA.astro` | mobil aksiyon barı (Ara + WhatsApp) |
| `FAQ.astro` | `<details>` listesi — aynı veri FAQPage şemasını da besliyor |
| `CtaBand.astro` | "Ücretsiz Keşif için Bize Ulaşın" bandı |
| `RegionGrid.astro` + `PinIcon.astro` | bölge çipi ızgarası ve tekrar eden pin SVG'si |

Bilinçli olarak component **yapılmayanlar** (§9 — sistemi gereksiz parçalama):
hero, brands marquee, services grid, solutions grid, about, contact.
Bunlar ana sayfaya özgü, tek kullanımlık bloklar.

**Ölçülebilir tekrar azalması:** telefon numaraları 17 dosyada **123 kez**
geçiyordu; şimdi `site.json` içinde **4 kez** (iki numara × e164 + wa formu).

## 4. Veri modeline taşınanlar

| Dosya | İçerik |
|---|---|
| `src/data/site.json` | domain, işletme adı, 2 telefon (e164/görünen/ARIA/wa formları), e-posta, adres, geo, çalışma saatleri, Instagram, harita, CSP, font URL'i, robots direktifleri, CTA metinleri, sabit bölüm etiketleri, nav yapısı |
| `src/data/bolgeler.json` | 9 kayıt: slug, ad, çip etiketi, şema City adı, title, description, h1, lead, bölge profili, mahalle listesi, 3 SSS, komşu bölgeler, WhatsApp metni |
| `src/data/hizmetler.json` | 5 kayıt: slug, kısa ad/açıklama, title, description, h1, lead, 4 detay kartı, 3 SSS, WhatsApp metni, ana sayfa şema alanları |
| `src/data/anasayfa.json` | ana sayfanın 7 SSS maddesi |

`tekirdag` kaydı üç ayrı isim taşıyor — production'daki kullanım aynen korundu:
`ad: "Süleymanpaşa"` (breadcrumb/başlık), `chipLabel: "Tekirdağ / Süleymanpaşa"`
(ızgara), `cityName: "Tekirdağ"` (schema areaServed).

## 5. SEO — neler korundu?

Şema **kapsamı daralmadı**, hiçbir alan kaybolmadı:

| | Durum |
|---|---|
| title / description / canonical | 17 sayfada birebir aynı |
| robots direktifleri | aynı (ana sayfa `max-video-preview:-1` dahil, 404 `noindex, follow`) |
| Open Graph (10 etiket) | aynı — ana sayfanın `og:description`'ı meta description'dan **farklıydı**, o fark korundu |
| Twitter card | aynı — ana sayfanın `twitter:description`'ı da farklıydı, korundu |
| `geo.region` / `geo.placename` | ana sayfada, aynı |
| **JSON-LD** | `LocalBusiness` (2 telefon, PostalAddress, GeoCoordinates, 2 OpeningHoursSpecification, 9 City, OfferCatalog/5 Offer), `WebSite`, `Service` ×5, `FAQPage` ×15 sayfa, `BreadcrumbList` ×16 sayfa — **derin karşılaştırmayla düğüm ve alan sırasına kadar doğrulandı** |

**Bilinçli, yalnızca ekleyici (additive) normalizasyonlar** — hiçbir şey
kaldırılmadı, yalnızca ana sayfada zaten var olanlar alt sayfalara da taşındı:

| Ekleme | Kaç sayfa | Gerekçe |
|---|---|---|
| `<meta name="format-detection" content="date=no, address=no, email=no">` | 16 | Ana sayfada vardı; footer'daki adres iOS'ta otomatik linke dönüşmesin |
| `<link rel="shortcut icon" href="/favicon.ico">` | 16 | Ana sayfada vardı |
| `<link rel="icon" sizes="16x16">` | 15 | Ana sayfa ve 404'te vardı |
| `<meta name="twitter:image:alt">` | 15 | Ana sayfada vardı |

Bunları geri almak isterseniz `src/layouts/BaseLayout.astro` ve
`src/components/SEO.astro` içinde tek yerde koşula bağlanabilir.

## 6. URL karşılaştırması

**16 production URL'inin tamamı değişmedi.** `trailingSlash: 'always'` +
`build.format: 'directory'` ile dizin/slash yapısı korundu.

```
/                                    ->  /                                   ✓
/gizlilik-politikasi/                ->  /gizlilik-politikasi/               ✓
/bolgeler/{9 ilçe}/                  ->  /bolgeler/{9 ilçe}/                 ✓
/hizmetler/{5 hizmet}/               ->  /hizmetler/{5 hizmet}/              ✓
404.html                             ->  404.html (kök)                      ✓
/sitemap.xml  /robots.txt  /manifest.json  /CNAME                            ✓
```

Sitemap URL listesi orijinalle **birebir aynı** (16 URL, `diff` ile doğrulandı).
Hiçbir yönlendirmeye (redirect) ihtiyaç yok.

## 7. 404 — düzeltildi mi? **Evet.**

Production'daki `404.html` karışık yol stratejisi kullanıyordu: nav ve footer
linkleri mutlak, ama stylesheet, script, logo, favicon, manifest ve tüm
hizmet/bölge kartları **göreliydi**. GitHub Pages 404'ü istenen yolda sunduğu
için derin bir URL'de her şey kırılıyordu.

`/bolgeler/derin/olmayan-sayfa` adresinde ölçüldü:

| | Kırık kaynak/link |
|---|---|
| **Eski (production)** | **11** — CSS, JS, logo, 5 favicon/ikon, manifest, hizmet kartları |
| **Yeni (Astro)** | **0** |

Yeni sayfada CSS, JS, logo, ikonlar ve tüm kartlar 200 dönüyor; JS çalışma
hatası yok. Belgenin kendisi doğru şekilde HTTP 404 döndürüyor.

## 8. Manifest — düzeltildi mi? **Evet.**

`"start_url": "/index.html"` → `"start_url": "/"`.
İkon yolları kök-göreli (`/icon-192.png`, `/icon-512.png`) ve build çıktısında
200 dönüyor.

## 9. Sitemap — otomatikleşti mi? **Evet.**

`src/pages/sitemap.xml.js` build sırasında `bolgeler.json` + `hizmetler.json`
verisinden üretiyor. Yeni bir bölge/hizmet eklendiğinde sitemap kendiliğinden
büyür; `lastmod` build tarihini alır.

`@astrojs/sitemap` bilinçli olarak kullanılmadı: o eklenti `sitemap-index.xml`
üretir, oysa arama motorlarına verilmiş adres `/sitemap.xml` ve `robots.txt` de
onu gösteriyor. Kendi endpoint'imizle **URL ve format birebir korundu**;
`robots.txt` hiç değişmedi.

## 10. Commit yapısı

```
105ef84  Eski HTML kaynaklarini kaldir
21d48f4  Astro migration: component ve veri odakli mimari
4fd36cd  Initial commit - original Securis production site   <- ROLLBACK NOKTASI
```

`4fd36cd` yayındaki sitenin bozulmamış hâlini içerir. Eski dosyalar ancak
parite doğrulandıktan **sonra** silindi; geri dönmek için:

```bash
git checkout 4fd36cd -- .
```

> Not: `21d48f4` commit mesajında telefon tekrarı "74" yazıyor; doğru sayı
> **123**. Ölçüm sonradan netleştirildi, kod etkilenmiyor.

## 11. GitHub Actions

`.github/workflows/deploy.yml` — `main`'e push (veya elle tetikleme):

```
checkout → setup-node 22 (npm cache) → npm ci → npm run build
        → CNAME doğrulama → sitemap doğrulama
        → upload-pages-artifact → deploy-pages
```

`package-lock.json` commit edildi (`npm ci` için zorunlu).
İki güvenlik kontrolü eklendi: `dist/CNAME` yoksa build **kasten başarısız
olur** (aksi halde custom domain sessizce düşer), `dist/sitemap.xml` yoksa da.

## 12. GitHub Pages — yapılması gereken repository ayarları

Bunlar **sizin yapmanız gereken** adımlar; repo'dan yapılamaz:

1. GitHub'da repo oluşturun ve push edin:
   ```bash
   git remote add origin git@github.com:<kullanici>/<repo>.git
   git push -u origin main
   ```
2. **Settings → Pages → Build and deployment → Source** = **GitHub Actions**
   (varsayılan "Deploy from a branch" DEĞİL — workflow bununla çalışır).
3. İlk push sonrası **Actions** sekmesinden workflow'un yeşil olduğunu doğrulayın.

## 13. Custom domain — gerekli ayarlar

1. **Settings → Pages → Custom domain** = `securis.com.tr` → Save.
2. **Enforce HTTPS** işaretli olsun (sertifika sağlanana kadar birkaç dakika sürebilir).
3. DNS tarafında apex için GitHub Pages A/AAAA kayıtları:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   (+ AAAA `2606:50c0:8000::153` … `8003::153`). Zaten yayında olduğu için
   bunlar muhtemelen mevcut — **değiştirmeyin**.
4. `www` **kullanılmıyor**; `public/CNAME` = `securis.com.tr` (apex).
5. `astro.config.mjs`'de `site: 'https://securis.com.tr'`, **`base` ayarlanmadı**.
   Custom domain'de `base` vermek tüm yolları bozar.

## 14. Build sonucu

```
npm install   ✓  (astro 5.18.2, 0 hata)
npm run build ✓  17 page(s) built in ~1.0s
npm run dev   ✓  (/, /bolgeler/silivri/, /hizmetler/nvr-depolama/ → 200)
```

Build çıktısı: 17 HTML + `sitemap.xml` + `CNAME` + `robots.txt` +
`manifest.json` + favicon/ikon seti + 10 `.webp` + `_astro/` (hash'li CSS/JS).

### Doğrulama sonuçları

| Test | Sonuç |
|---|---|
| **Parite** — JSON-LD, title, canonical, 26 meta, görünür metin, `<main>`/`<header>`/`<footer>`/mobil bar DOM iskeleti, head link'leri, tüm link hedefleri (17 sayfa) | **581 kontrol geçti, 0 başarısız** |
| **CSS eşdeğerlik** — ana sayfa | 29→29 token, **240→240 kural**, sıra dahil aynı (tek fark: 7 `url()` yoluna eklenen `/`) |
| **CSS eşdeğerlik** — alt sayfalar | 23→23 token, **88→88 kural**, birebir |
| **JS davranış yüzeyi** | ana sayfa 51 öğeden 50'si aynı, alt sayfa 19/19 aynı (tek fark aşağıda) |
| **Görsel parite** — 4 viewport × 5 sayfa | **20/20'de stil/geometri farkı 0**, **19/20 ekran görüntüsü bayt düzeyinde aynı** |
| **Fonksiyonel** — 17 sayfa | mobil menü, SSS akordiyonu, tel/WhatsApp/mailto linkleri, logo, mobil CTA barı: hepsi çalışıyor; konsol hatası ve başarısız istek yok |
| **Ana sayfa davranışları** | reveal ✓, scroll-spy ✓ (`aria-current`), silindirik efekt 6/6 `rotateX` ✓, `nav--scrolled` ✓, nav spotlight ✓, marquee ✓ |
| **Derin yol 404** | eski 11 kırık → **yeni 0** |

Görsel testte kalan 1 fark (tablet-768 / ana sayfa) **migration kaynaklı değil**:
aynı eski site kendisiyle karşılaştırıldığında %1.22 fark üretirken, eski↔yeni
ikinci çekimde fark **tam sıfır** çıktı. Bu, tam sayfa ekran görüntüsü alınırken
IntersectionObserver zamanlamasından doğan tarayıcı render belirsizliğidir.

### Migration sırasında yakalanan ve düzeltilen regresyon

Ana sayfanın inline CSS'i harici dosyaya (`/_astro/index.*.css`) taşınınca,
içindeki `url('assets/img/…')` yolları `/_astro/assets/img/…` olarak çözülmeye
başladı ve **7 arka plan görseli 404 verdi**. Görsel parite testi bunu
yakaladı; yollar kök-göreli yapılıp düzeltildi ve test tekrar çalıştırıldı.

## 15. Açık kalan problemler / kararınızı bekleyenler

1. **Ana sayfada SSS metni ile şema metni farklı (production'dan geliyor).**
   7 sorudan 3'ünde görünür cevap ile `FAQPage` şemasındaki cevap birbirinden
   farklı (şemadakiler daha kısa). Örn. *"Arıza durumunda ne kadar sürede
   geliyorsunuz?"* — görünür metinde "1 yıl servis garantisi" cümlesi var,
   şemada yok. Faz 1'de **ikisi de aynen korundu**;
   `src/data/anasayfa.json` içinde `a` (görünür) ve `aSchema` (şema) alanları
   ayrı duruyor. Alt sayfalarda böyle bir sapma **yok** (42/42 aynı).
   → Karar: hangisi doğruysa ona sabitleyip `aSchema` alanlarını silin.

2. **Çelişen 7 CSS token'ı hâlâ sayfa kapsamında.**
   `--shadow`, `--shadow-hover`, `--space-xs/sm/md/lg/xl` ana sayfa ile alt
   sayfalarda farklı değerlerde. Runtime'da çakışmıyorlar (iki stil dosyası
   asla birlikte yüklenmiyor), bu yüzden bugün görsel bir hata yok — ama
   ayrışma riski sürüyor. Faz 1'de görsel pariteyi bozmamak için
   **kasten birleştirilmedi**; nedenleri iki CSS dosyasında da yazılı.
   → Faz 2'de tek ölçeğe indirilmeli.

3. **`npm audit`: 3 açık (1 düşük, 2 yüksek).** Tamamı build zamanı geliştirme
   bağımlılıklarında; üretilen statik siteye hiçbir kod girmiyor. Yine de
   `npm audit` çıktısı gözden geçirilmeli.

4. **Astro 7.2.4 mevcut** (kurulu: 5.18.2). Faz 1'de sürüm yükseltmesi
   **kasten yapılmadı** — major sürüm atlaması davranış değiştirebilir ve
   migration'ın "aynı sonuç" garantisini bulanıklaştırırdı. Parite kabul
   edildikten sonra ayrı bir adımda değerlendirilmeli.

5. **`securis-bold-animasyon.zip` hâlâ klasörde duruyor** (repo'ya girmiyor).
   Sitenin eski bir kopyası; artık git geçmişi bu işi yaptığı için silebilirsiniz.

6. **Ana sayfada mobil menü Escape ile kapanmıyor** (production'daki davranış).
   Alt sayfalarda kapanıyor. `ui-common.js` ikisini tek uygulamada topladı ama
   farkı korumak için bayrağa bağladı:
   `initMobileMenu({ closeOnEscape: false })`. Erişilebilirlik açısından doğrusu
   her yerde `true` olması — tek satırlık değişiklik, ama davranış değişikliği
   olduğu için Faz 1'de yapılmadı.

7. **Nav menü linki dinleyicisi birleştirildi.** Ana sayfa her `<a>`'ya ayrı
   dinleyici bağlıyordu, alt sayfalar `<ul>` üzerinde delegasyon kullanıyordu;
   tek uygulamada delegasyona geçildi. 21 nav linkinin hiçbirinde element
   çocuğu olmadığı doğrulandı, dolayısıyla `e.target` her zaman `<a>` — davranış
   eşdeğer.

8. **`bolgeler/` ve `hizmetler/` için hub (liste) sayfası yok.** Production'da
   da yoktu; URL yapısını değiştirmemek için eklenmedi. Faz 2'de iç link
   yapısını güçlendirmek isterseniz değerlendirilebilir.

---

## Sırada ne var

Faz 1 kapandı. Faz 2 (**Visual Upgrade Roadmap**) için altyapı hazır:
tasarım token'ları tek dosyada, tekrar eden bloklar component, içerik veriden
geliyor ve her sayfa aynı layout'u kullanıyor — yani premium hero, motion
design, scroll animation, micro-interaction, parallax, interactive cards,
gerekirse GSAP veya küçük ölçekli WebGL bölümleri **tek yerden** eklenebilir.

Faz 2'ye geçmeden önce bu raporun 15. bölümündeki kararların netleşmesi yeterli.

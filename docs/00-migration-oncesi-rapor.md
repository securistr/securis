# Securis — Migration Öncesi Analiz Raporu

> Bu rapor, Astro migration'ı başlamadan **önce** mevcut production kaynakları
> üzerinde yapılan tam envanter çalışmasının sonucudur. Hiçbir production
> dosyası bu analiz sırasında değiştirilmemiştir.
>
> Baseline commit: `Initial commit - original Securis production site`

---

## A. Dosya Yapısı

Toplam **42 dosya** versiyonlandı (2.5 MB). `securis-bold-animasyon.zip` (1 MB)
`.gitignore` ile dışarıda bırakıldı — sitenin kendi arşiv kopyasıydı.

```
.
├── index.html                       119 KB   2138 satır  (ana sayfa, self-contained)
├── 404.html                          10 KB
├── CNAME                                     securis.com.tr
├── robots.txt
├── sitemap.xml                        3 KB   16 URL, elle yazılmış
├── manifest.json                             PWA
├── securis-logo.png / og-image.jpg
├── favicon.ico / favicon-16 / favicon-32 / apple-touch-icon / icon-192 / icon-512
├── assets/
│   ├── seo-pages.css                 15 KB   228 satır  (alt sayfaların ortak CSS'i)
│   ├── seo-pages.js                   4 KB   107 satır  (alt sayfaların ortak JS'i)
│   └── img/                         656 KB   10 adet .webp
├── gizlilik-politikasi/index.html    14 KB
├── bolgeler/     (9 dizin)          ~16 KB / sayfa
└── hizmetler/    (5 dizin)          ~17 KB / sayfa
```

### index.html iç dağılımı

| Bölüm | Satır aralığı | Satır |
|---|---|---|
| `<head>` + meta/SEO | 1–63 | 63 |
| JSON-LD `@graph` | 64–548 | 485 |
| Inline `<style>` | 549–1364 | **816** |
| `<body>` markup | 1366–1749 | 384 |
| Inline `<script>` | 1751–2135 | **385** |

---

## B. Sayfa Listesi (dosyalardan doğrulandı)

**17 HTML sayfası**, beklenen listeyle birebir uyumlu:

| # | Sayfa | Dosya |
|---|---|---|
| 1 | Ana sayfa | `index.html` |
| 2 | Gizlilik | `gizlilik-politikasi/index.html` |
| 3–11 | 9 bölge | `bolgeler/{silivri, catalca, buyukcekmece, beylikduzu, corlu, cerkezkoy, marmaraereglisi, kapakli, tekirdag}/index.html` |
| 12–16 | 5 hizmet | `hizmetler/{ip-kamera-sistemleri, firewall-yapilandirma, switch-konfigurasyonu, access-point-kurulumu, nvr-depolama}/index.html` |
| 17 | 404 | `404.html` |

Fazladan veya eksik sayfa yok. `bolgeler/` ve `hizmetler/` için index (liste)
sayfası **yok** — bunlara ana sayfadaki `#region` / `#services` bölümlerinden
gidiliyor. Sitemap de bu yapıyla uyumlu.

---

## C. URL Listesi (canonical'lardan doğrulandı)

```
https://securis.com.tr/
https://securis.com.tr/gizlilik-politikasi/
https://securis.com.tr/bolgeler/silivri/
https://securis.com.tr/bolgeler/catalca/
https://securis.com.tr/bolgeler/buyukcekmece/
https://securis.com.tr/bolgeler/beylikduzu/
https://securis.com.tr/bolgeler/corlu/
https://securis.com.tr/bolgeler/cerkezkoy/
https://securis.com.tr/bolgeler/marmaraereglisi/
https://securis.com.tr/bolgeler/kapakli/
https://securis.com.tr/bolgeler/tekirdag/
https://securis.com.tr/hizmetler/ip-kamera-sistemleri/
https://securis.com.tr/hizmetler/firewall-yapilandirma/
https://securis.com.tr/hizmetler/switch-konfigurasyonu/
https://securis.com.tr/hizmetler/access-point-kurulumu/
https://securis.com.tr/hizmetler/nvr-depolama/
```

Tamamı trailing slash'li, tamamı apex domain (`www` yok). Sitemap'teki 16 URL
canonical'larla birebir örtüşüyor. **Migration sonrası bu 16 URL değişmeyecek.**

> Dikkat: `bolgeler/tekirdag/` slug'ı `tekirdag`, ama sayfa başlığı ve H1
> **"Süleymanpaşa"** diyor; ana sayfadaki çip etiketi ise "Tekirdağ /
> Süleymanpaşa". Bu kasıtlı bir SEO tercihi — slug değiştirilmeyecek.

---

## D. Sayfa Başına title / description / canonical

| Sayfa | Title | Robots |
|---|---|---|
| `/` | Silivri Kamera Sistemleri ve Network Kurulumu \| Securis | index, follow, max-image-preview:large, max-snippet:-1, **max-video-preview:-1** |
| `/gizlilik-politikasi/` | Gizlilik Politikası ve KVKK Aydınlatma Metni \| Securis | index, follow, max-image-preview:large, max-snippet:-1 |
| `/bolgeler/silivri/` | Silivri Kamera Sistemleri ve Network Kurulumu \| Securis | index, follow, … |
| `/bolgeler/catalca/` | Çatalca Kamera Sistemleri ve Network Kurulumu \| Securis | index, follow, … |
| `/bolgeler/buyukcekmece/` | Büyükçekmece Kamera Sistemleri ve Network Kurulumu \| Securis | index, follow, … |
| `/bolgeler/beylikduzu/` | Beylikdüzü Kamera Sistemleri ve Network Kurulumu \| Securis | index, follow, … |
| `/bolgeler/corlu/` | Çorlu Kamera Sistemleri ve Network Kurulumu \| Securis | index, follow, … |
| `/bolgeler/cerkezkoy/` | Çerkezköy Kamera Sistemleri ve Network Kurulumu \| Securis | index, follow, … |
| `/bolgeler/marmaraereglisi/` | Marmaraereğlisi Kamera Sistemleri ve Network Kurulumu \| Securis | index, follow, … |
| `/bolgeler/kapakli/` | Kapaklı Kamera Sistemleri ve Network Kurulumu \| Securis | index, follow, … |
| `/bolgeler/tekirdag/` | **Süleymanpaşa** Kamera Sistemleri ve Network Kurulumu \| Securis | index, follow, … |
| `/hizmetler/ip-kamera-sistemleri/` | IP Kamera Sistemleri Kurulumu \| Silivri, Tekirdağ, Çatalca \| Securis | index, follow, … |
| `/hizmetler/firewall-yapilandirma/` | FortiGate Firewall Kurulumu ve Yapılandırma \| Trakya \| Securis | index, follow, … |
| `/hizmetler/switch-konfigurasyonu/` | Kurumsal Switch Kurulumu ve VLAN Yapılandırması \| Securis | index, follow, … |
| `/hizmetler/access-point-kurulumu/` | Access Point Kurulumu - Kesintisiz Wi-Fi \| Securis | index, follow, … |
| `/hizmetler/nvr-depolama/` | NVR Kurulumu ve Kamera Kayıt Depolama Çözümleri \| Securis | index, follow, … |
| `404.html` | Sayfa Bulunamadı \| Securis | **noindex, follow** (canonical yok — doğru) |

Her sayfada ayrıca: OG (`type, site_name, url, title, description, image,
image:width/height/alt, locale`) + Twitter card seti mevcut.
Ana sayfada ek olarak `geo.region` / `geo.placename` var.

---

## E. JSON-LD Türleri

| Sayfa grubu | Schema türleri |
|---|---|
| Ana sayfa | `LocalBusiness` (telephone ×2, PostalAddress, GeoCoordinates, OpeningHoursSpecification ×2, areaServed City ×9), `WebSite`, `OfferCatalog` (`Offer` ×5 → `Service` ×5), `FAQPage` (`Question` ×7), `BreadcrumbList` |
| Hizmet sayfaları (×5) | `WebPage`, `Service` (areaServed `City` ×9), `FAQPage` (`Question` ×3), `BreadcrumbList` (`ListItem` ×3) |
| Bölge sayfaları (×9) | `WebPage` (+`ImageObject`), `FAQPage` (`Question` ×3), `BreadcrumbList` (`ListItem` ×3) |
| Gizlilik | `WebPage`, `BreadcrumbList` (`ListItem` ×2) |
| 404 | yok (doğru) |

Toplam **FAQPage: 15 sayfa**, **BreadcrumbList: 16 sayfa**.
Migration sonrası bu kapsam **birebir korunacak**.

---

## F. Ortak HTML Blokları (asıl tekrar kaynağı)

17 dosyanın tamamında birebir tekrar eden bloklar:

| Blok | Kaç dosyada | Yaklaşık boyut |
|---|---|---|
| `<nav>` + logo + hamburger + 7 menü öğesi | 17 | ~1.2 KB × 17 |
| `<footer>` (NAP + linkler + copyright) | 17 | ~0.9 KB × 17 |
| `.mobile-action-bar` (Ara + WhatsApp, inline SVG) | 17 | ~1.0 KB × 17 |
| CSP `<meta>` | 17 | 340 B × 17 |
| Google Fonts preconnect + preload + link + noscript | 17 | ~1.0 KB × 17 |
| OG + Twitter meta seti | 16 | ~1.1 KB × 16 |
| Favicon / PWA ikon `<link>` seti | 17 | ~0.6 KB × 17 |
| Pin ikonu SVG (`region-chip` içinde) | 15 | 9 veya 3 kez/sayfa |
| `.cta-band` (Ücretsiz Keşif bandı) | 15 | ~0.8 KB × 15 |
| Telefon `+905419248987` | 17 dosya, **74 kez** toplam | — |

**Sonuç:** Telefon numarası değişirse bugün 17 dosyada 74 yerde düzenleme gerekiyor.

### Alt sayfa yapıları tamamen tek biçimli (doğrulandı)

| | `<section>` | `.section-desc` | `.faq-item` | `.info-card` | `.region-chip` |
|---|---|---|---|---|---|
| 9 bölge sayfasının **her biri** | 5 | 3 | 3 | 5 | 3 |
| 5 hizmet sayfasının **her biri** | 4 | 1 | 3 | 4 | 9 |

Sapma yok. Bu, tek bir `[slug].astro` şablonunun 9 (ve 5) sayfayı **kayıpsız**
üretebileceği anlamına geliyor.

---

## G. Ortak CSS

İki bağımsız stil kaynağı var:

1. `index.html` içindeki inline `<style>` — 816 satır, **yalnızca ana sayfa**
2. `assets/seo-pages.css` — 228 satır, **16 alt sayfa** (404 dahil)

Aynı isimli ama **farklı değerli** token'lar (gerçek sapma):

| Token | index.html | seo-pages.css |
|---|---|---|
| `--shadow` | `0 4px 20px rgba(0,0,0,0.02)` | `0 4px 20px rgba(0,0,0,.04)` |
| `--shadow-hover` | `0 12px 30px rgba(30,58,138,0.06)` | `0 12px 30px rgba(30,58,138,.10)` |
| `--space-xs` | `12px` | `14px` |
| `--space-sm` | `16px` | `20px` |
| `--space-md` | `24px` | `28px` |
| `--space-lg` | `32px` | `clamp(24px,3vw,40px)` |
| `--space-xl` | `48px` | `clamp(64px,8vw,112px)` |

**Tamamen aynı olan** 13 token (güvenle tek kaynağa alınabilir):
`--bg --bg2 --card --card-border --primary --primary-hover --primary-light
--text --text-dim --font --font-display --nav-h --space-2xs`

**Yalnız bir tarafta olanlar:**
`--primary-dim --font-mono --space-section --space-gutter --space-heading
--space-grid --accent-cyan --accent-cyan-light --rec-red` (index)
`--accent --accent-deep --gutter` (seo-pages)

`--accent-deep` (`#0891b2`) ile `--accent-cyan` (`#0891b2`) **aynı değer, farklı isim**.

> **Önemli tespit:** Bu token'lar aslında runtime'da çakışmıyor — ana sayfa ile
> alt sayfalar hiçbir zaman aynı anda iki stil dosyasını birden yüklemiyor.
> Yani sapma bugün görsel bir hataya yol açmıyor; **gelecekteki düzenlemelerde
> ayrışma riski** taşıyor. Bu yüzden Faz 1'de değerler DEĞİŞTİRİLMEYECEK:
> sadece gerçekten özdeş olan 13 token `tokens.css`e alınacak, çelişenler
> sayfa kapsamında kalacak ve neden ayrı oldukları yorumla belgelenecek.

---

## H. Ortak JS

1. `index.html` inline script — 385 satır. İçerik: mobil menü, hero parallax +
   `deviceGroup` scale/opacity, **silindirik scroll motoru** (`rotateX` + damped
   lerp + perspektif telafisi), nav spotlight (`--mouse-x/--mouse-y`), scroll-spy
   (`IntersectionObserver` + `aria-current`), reveal observer, marquee font-ready
   reset, mobil CTA tek seferlik nabız, FAQ akordiyon (Web Animations API).
2. `assets/seo-pages.js` — 107 satır. İçerik: mobil menü (+Escape), nav scroll
   opaklığı, mobil CTA nabzı, FAQ akordiyon.

**Kopyalanan davranışlar:** FAQ akordiyonu ve mobil CTA nabzı iki dosyada da
neredeyse birebir aynı (yorum satırlarına kadar). `FAQ_DURATION = 240` ve
`FAQ_EASING = cubic-bezier(.16,1,.3,1)` her iki yerde de aynı.
Mobil menü mantığı da tekrar ediyor (alt sayfa sürümünde ek olarak Escape ve
`aria-label` güncellemesi var — ana sayfada yok).

Migration'da bu ortak davranışlar tek modüle alınacak, **davranış değişmeyecek**.

---

## I. Relative Path Problemleri

### 1. `404.html` — GERÇEK HATA (öncelikli)

Dosya iki farklı yol stratejisini karıştırıyor:

| Öğe | Mevcut değer | Durum |
|---|---|---|
| `<link rel="stylesheet">` | `assets/seo-pages.css` | **göreli** |
| `<script src>` | `assets/seo-pages.js` | **göreli** |
| logo `<img src>` | `securis-logo.png` | **göreli** |
| favicon / manifest linkleri | göreli | **göreli** |
| hizmet kartları | `hizmetler/…/` | **göreli** |
| bölge çipleri | `bolgeler/…/` | **göreli** |
| nav linkleri | `/`, `/#services` | mutlak (doğru) |
| footer gizlilik linki | `/gizlilik-politikasi/` | mutlak (doğru) |

GitHub Pages 404'ü **istenen yolda** sunar. `/bolgeler/test/olmayan-sayfa`
açıldığında tarayıcı `assets/seo-pages.css`i `/bolgeler/test/assets/seo-pages.css`
olarak çözer → **CSS yok, logo yok, JS yok, tüm kartlar kırık link.**

**Migration'da tüm 404 yolları mutlağa (`/…`) çevrilecek.**

### 2. Alt sayfalarda `../../` zinciri

16 alt sayfanın tamamı `../../assets/…`, `../../securis-logo.png`,
`../../bolgeler/…` kullanıyor. Bugün doğru çalışıyor (hepsi tam 2 seviye
derinlikte) ama kırılgan: dizin derinliği değişirse hepsi bozulur.
Migration'da kök-göreli (`/…`) yollara geçilecek.

---

## J. SEO Problemleri

| # | Bulgu | Etki |
|---|---|---|
| 1 | `sitemap.xml` elle yazılıyor; 16 URL'nin **tamamında** `lastmod` = `2026-08-20` | Yeni sayfa eklenince unutulur; lastmod anlamsızlaşır |
| 2 | Ana sayfa canonical'ı ile sitemap girdisi tutarlı | Sorun yok |
| 3 | 404'te canonical yok | Doğru davranış, değişmeyecek |
| 4 | `bolgeler/` ve `hizmetler/` için hub (liste) sayfası yok | Faz 2'de değerlendirilebilir; Faz 1'de URL yapısı değişmeyecek |
| 5 | JSON-LD tamamen elle yazılmış, 15 sayfada FAQ tekrar ediyor | Data-driven üretimle tek kaynağa iner |

SEO **kalitesi iyi**: canonical, OG, Twitter, robots direktifleri, LocalBusiness
+ FAQPage + BreadcrumbList şemaları eksiksiz. Migration'da hiçbiri azaltılmayacak.

---

## K. Asset Problemleri

| # | Bulgu |
|---|---|
| 1 | `manifest.json` → `"start_url": "/index.html"`. Production URL yapısı `/` olduğu için **`/` olmalı** — aksi halde PWA olarak eklenince ayrı bir URL'den açılır. |
| 2 | `securis-bold-animasyon.zip` (1 MB) sitenin kendi kopyası, klasörde duruyordu → `.gitignore` ile dışarıda bırakıldı. |
| 3 | 10 `.webp` toplam 656 KB — zaten optimize, **yeniden encode edilmeyecek**. |
| 4 | Favicon / PWA ikon seti tam (16/32/180/192/512 + `.ico`) — sorun yok. |
| 5 | Google Fonts 3 aile: Inter (5 ağırlık), Space Grotesk (700), JetBrains Mono (400). `media="print" onload` tekniğiyle async yükleniyor. **Faz 1'de dokunulmayacak.** |
| 6 | `assets/seo-pages.css` içinde hiç `url()` referansı yok → CSS taşınırken yol kırılma riski **yok**. |

---

## L. Deployment Problemleri

| # | Bulgu |
|---|---|
| 1 | Proje **git repository değildi** → `git init` + baseline commit yapıldı. |
| 2 | GitHub Actions workflow yok → oluşturulacak. |
| 3 | `CNAME` = `securis.com.tr` (apex, `www` yok). Astro `site` değeri buna eşitlenecek; custom domain kullanıldığı için **`base` ayarlanmayacak** (repo adı base path olarak eklenmeyecek). |
| 4 | Astro build sırasında `public/` içeriği `dist/`e kopyalanır → `CNAME` dosyası `public/`e konmalı, yoksa custom domain her deploy'da düşer. |
| 5 | `package-lock.json` commit edilecek (CI'da `npm ci` için zorunlu). |

---

## M. Astro Component Önerisi

```
src/
├── layouts/
│   └── BaseLayout.astro        html/head/body iskeleti + Header + Footer + MobileCTA
├── components/
│   ├── SEO.astro               title, description, canonical, robots, OG, Twitter, JSON-LD
│   ├── Header.astro            nav (ana sayfa varyantı: spotlight + #anchor linkleri)
│   ├── Footer.astro            NAP + linkler + copyright
│   ├── MobileCTA.astro         mobil aksiyon barı (Ara + WhatsApp)
│   ├── FAQ.astro               <details> listesi (FAQPage şemasıyla aynı veriden)
│   ├── CtaBand.astro           "Ücretsiz Keşif için Bize Ulaşın" bandı
│   ├── RegionGrid.astro        region-chip ızgarası (pin SVG tek yerde)
│   └── PinIcon.astro           tekrar eden pin SVG'si
```

Bilinçli olarak component **yapılmayacaklar**: hero, services grid, about,
brands marquee, showcase kartları. Bunlar ana sayfaya özgü, tek kullanımlık
bloklar — component'e bölmek sistemi gereksiz parçalar (§9).

## N. JSON / Data Modeli Önerisi

```
src/data/
├── site.json          domain, işletme adı, telefonlar, e-posta, adres, geo,
│                      Instagram, harita CID, çalışma saatleri, NAP metni,
│                      varsayılan OG görseli, WhatsApp şablon metinleri
├── bolgeler.json      9 kayıt: slug, ad, title, description, h1, badge, lead,
│                      profil paragrafları, mahalleler, 3 FAQ, komşu bölgeler,
│                      whatsappText
└── hizmetler.json     5 kayıt: slug, ad, title, description, h1, badge, lead,
                       4 "Neler Yapıyoruz" kartı, 3 FAQ, whatsappText,
                       Service şeması alanları
```

Ana sayfanın FAQ'i (7 soru) ve hizmet kartları da veriden beslenecek; böylece
ana sayfa `FAQPage` şeması ile görünen SSS listesi **tek kaynaktan** üretilir.

## O. Migration Riskleri

| # | Risk | Önlem |
|---|---|---|
| 1 | **Görsel sapma.** CSS/JS taşınırken farkında olmadan değer değişmesi. | Build çıktısı ile orijinal HTML normalize edilip **diff**lenecek; fark varsa sebep bulunacak. |
| 2 | **Inline → external CSS geçişi.** Ana sayfa CSS'i bugün inline; `<link>` olunca render sırası değişebilir. | Astro `inlineStylesheets` davranışı doğrulanacak; kritik stiller aynı sırada kalacak. |
| 3 | **Inline → module script.** Astro `<script>`i `type="module"` (defer) yapar; bugünkü script body sonunda senkron çalışıyor. | Script zaten body sonunda ve DOM'a bağımlı; defer davranışı güvenli. Fonksiyonel test edilecek. |
| 4 | **CSP.** `script-src 'self' 'unsafe-inline'` — bundle'lanmış script same-origin olduğu için `'self'` kapsıyor. | Build sonrası CSP ihlali konsoldan doğrulanacak. |
| 5 | **Trailing slash.** Astro'nun `trailingSlash` ayarı yanlışsa URL'ler `/bolgeler/silivri` (slash'sız) olur → canonical uyumsuzluğu. | `trailingSlash: 'always'` + `build.format: 'directory'` ile mevcut yapı korunacak. |
| 6 | **CNAME kaybı.** `public/`e konmazsa her deploy'da custom domain düşer. | `public/CNAME` olarak taşınacak, build çıktısında varlığı doğrulanacak. |
| 7 | **JSON-LD daralması.** Data-driven üretimde alan atlanması. | Üretilen JSON-LD, orijinaliyle **derin karşılaştırma** ile doğrulanacak. |
| 8 | **`base` yanlış ayarı.** Repo adı base path olarak eklenirse tüm yollar bozulur. | Custom domain olduğu için `base` ayarlanmayacak. |
| 9 | Sitemap otomatikleşirken URL sayısının 16'nın altına düşmesi. | Build sonrası sitemap URL sayısı ve içerik karşılaştırılacak. |

---

## Faz Ayrımı

**Faz 1 (bu iş):** migration + tekrar azaltma + deployment + **aynı görsel sonuç**.
**Faz 2 (sonra):** Visual Upgrade Roadmap — premium hero, motion design, scroll
animation, micro-interaction, parallax, interactive cards, gerekirse GSAP/WebGL.

Faz 1 bitmeden Faz 2'ye geçilmeyecek.

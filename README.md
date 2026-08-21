# Securis — securis.com.tr

[Securis Ağ ve Kamera Güvenlik Sistemleri](https://securis.com.tr) kurumsal web
sitesi. Astro ile üretilen **tamamen statik** bir site; backend, veritabanı,
CMS veya kimlik doğrulama yoktur.

```
GitHub repo → GitHub Actions → Astro static build → GitHub Pages → securis.com.tr
```

## Çalıştırma

```bash
npm install     # bağımlılıklar
npm run dev     # geliştirme sunucusu (http://localhost:4321)
npm run build   # dist/ üretir
npm run preview # dist/ çıktısını yerelde sun
```

Node 18.20.8+ gerekir (CI'da Node 22).

## Dizin yapısı

```
src/
├── data/            TEK İÇERİK KAYNAĞI — kod içine metin gömülmez
│   ├── site.json        telefon, adres, e-posta, CSP, etiketler, nav
│   ├── bolgeler.json    9 bölge sayfasının tüm içeriği
│   ├── hizmetler.json   5 hizmet sayfasının tüm içeriği
│   └── anasayfa.json    ana sayfa SSS'i
├── lib/
│   ├── schema.js        JSON-LD üreticileri (LocalBusiness, Service, FAQPage…)
│   └── links.js         tel: / wa.me link üretimi
├── styles/          TASARIM SİSTEMİ (sıralama önemli)
│   ├── tokens.css       tek token kaynağı: renk, tipografi, boşluk, gölge, motion
│   ├── base.css         reset, tipografi, buton, kart, SSS, çip, CTA bandı
│   ├── chrome.css       nav, footer, mobil aksiyon barı
│   ├── home.css         yalnızca ana sayfa
│   └── pages.css        yalnızca alt sayfalar
├── scripts/
│   ├── ui-common.js     tüm sayfalarda ortak davranışlar
│   ├── home.js          ana sayfa (scroll-spy, hero parallax, marquee)
│   └── sub-pages.js     alt sayfalar
├── components/      Header, Footer, SEO, FAQ, CtaBand, RegionGrid, PinIcon,
│                    MobileCTA, QuickFacts
├── layouts/BaseLayout.astro
└── pages/
    ├── index.astro                 /
    ├── 404.astro                   /404.html
    ├── gizlilik-politikasi/        /gizlilik-politikasi/
    ├── bolgeler/[slug].astro       /bolgeler/<slug>/     (9 sayfa)
    ├── hizmetler/[slug].astro      /hizmetler/<slug>/    (5 sayfa)
    └── sitemap.xml.js              /sitemap.xml (build'de üretilir)

public/              olduğu gibi kopyalanır: CNAME, robots.txt, manifest.json,
                     favicon/PWA ikonları, og-image, logo, assets/img/*.webp
```

## Sık yapılan işler

**Telefon / adres / e-posta değişikliği** → yalnızca `src/data/site.json`.
Tüm sayfalara, JSON-LD'ye, footer'a ve WhatsApp linklerine oradan yayılır.

**Yeni bölge sayfası** → `src/data/bolgeler.json`'a bir kayıt ekleyin.
Sayfa, sitemap girdisi, footer linki ve iç linkler otomatik oluşur.

**Yeni hizmet sayfası** → `src/data/hizmetler.json`'a bir kayıt ekleyin.
Ana sayfadaki hizmet kartını `src/pages/index.astro` içindeki
`hizmetKartlari` dizisine de eklemeniz gerekir (ana sayfa kartlarının kendi
metinleri ve ikonları vardır).

**Renk / boşluk / tipografi** → `src/styles/tokens.css`. Component'ler kendi
sabit değerlerini tanımlamaz.

## Dikkat edilmesi gerekenler

- **`astro.config.mjs` içinde `base` AYARLANMAZ.** Site apex custom domain'de
  yayınlanıyor; `base` vermek tüm yolları bozar.
- **`public/CNAME` silinmemeli.** Her deploy'da GitHub Pages'e custom domain'i
  bildiren dosya budur; workflow varlığını kontrol eder.
- **CSS içindeki `url()` yolları kök-göreli (`/assets/...`) olmalı.** Stil
  dosyaları `/_astro/` altına derlendiği için göreli yollar kırılır.
- **URL yapısı sabittir** (`trailingSlash: 'always'`). Mevcut 16 URL SEO
  açısından korunur; değiştirilmemelidir.
- **`.reveal` gizlemesi `.js` sınıfına bağlıdır.** JS çalışmazsa içerik
  gizlenmez. `BaseLayout` içindeki inline satır kaldırılmamalıdır.
- **Uydurma veri yasak.** Sitede müşteri sayısı, proje sayısı, sertifika veya
  referans gibi doğrulanamayan iddialar yer almaz.

## Deploy

`main` dalına push → `.github/workflows/deploy.yml` çalışır →
`npm ci` → `npm run build` → CNAME ve sitemap doğrulaması → GitHub Pages.

Repository ayarı: **Settings → Pages → Source = GitHub Actions**.

## Dokümantasyon

- `docs/00-migration-oncesi-rapor.md` — Faz 1 öncesi durum analizi
- `docs/01-migration-sonuc-raporu.md` — Faz 1 (Astro migration) sonucu
- `docs/02-visual-upgrade-raporu.md` — Faz 2 (görsel yükseltme) sonucu

# Securis — securis.com.tr

[Securis Ağ ve Kamera Güvenlik Sistemleri](https://securis.com.tr) kurumsal web
sitesi. **Tamamen statik**; bağımlılık, backend, veritabanı veya CMS yoktur.

```
GitHub repo → GitHub Actions (node build.mjs + node audit.mjs) → GitHub Pages → securis.com.tr
```

## Çalıştırma

```bash
node build.mjs   # dist/ üretir (Node 22, npm install gerekmez)
node audit.mjs   # kırık link, h1, canonical, JSON-LD, sitemap, CNAME, 404 kontrolü
```

`dist/` klasörünü herhangi bir statik sunucuyla açın (ör. `npx http-server dist`).
Sayfalar kök-göreli yollar kullandığı için `index.html` doğrudan çift tıklanarak açılmaz.

## Dizin yapısı

```
build.mjs          sayfa üretici: head/SEO, JSON-LD, tüm sayfa şablonları
audit.mjs          yayın öncesi denetim (CI'da HARD hata yayını durdurur)
data/              TEK İÇERİK KAYNAĞI
  site.json          telefon, adres, e-posta, CSP, Instagram
  hizmetler.json     5 hizmet sayfası
  bolgeler.json      9 ilçe sayfası (ilçe × hizmet bölümleri, SSS)
  anasayfa.json      ana sayfa SSS
  reviews.json       Google yorumları (metinler olduğu gibi)
  gizlilik.json      gizlilik / KVKK metni
public/            dist/'e olduğu gibi kopyalanır
  site.css           tüm stiller (koyu/açık tema token'ları)
  site.js            menü, tema, yorumlar, animasyonlar, parallax
  carousel.js        ana sayfa filmşeridi + WebGL morph + katmanlı parallax
  morph.js           yorumlar bölümünün morph geçişi
  topology.js        fotoğrafsız bölümlerin arka plan kanvası
  assets/            görseller (jpg + webp varyantları)
  CNAME, robots.txt, manifest.json, ikonlar, .nojekyll
DESIGN.md          tasarım sistemi
PRODUCT.md         ürün bağlamı ve içerik kuralları
SEO-PLAN.md        anahtar kelime planı ve site dışı SEO adımları
```

## Sık yapılan işler

- **Telefon / adres / e-posta** → yalnızca `data/site.json`.
- **Yorum ekleme** → `data/reviews.json`. Profil fotoğrafı için
  `public/assets/reviews/<ad>.webp` kaydedip kayda `"avatar"` alanı ekleyin.
- **İlçe veya hizmet içeriği** → `data/bolgeler.json` / `data/hizmetler.json`.
- **Fontlar** → `public/fonts/` (kendi sunucumuzdan, Google Fonts yok). `data/lastmod.json` build tarafından yazılır: sitemap tarihi yalnızca sayfanın HTML'i değişince güncellenir; bu dosyayı commit edin.
- **Ölçüm (GA4 / Google Ads)** → `data/site.json` içindeki `analytics`: `ga4` (G-...), `ads` (AW-...), `adsWhatsapp` / `adsCall` (Ads dönüşüm etiketleri). Boş bırakılırsa hiçbir etiket, çerez penceresi ya da CSP değişikliği olmaz. Dolunca çerez onayı (KVKK), CSP ve `public/track.js` kendiliğinden devreye girer; WhatsApp ve telefon tıklamaları `whatsapp_click` / `phone_click` olayı ve Ads dönüşümü olarak gider. Reklamdan (gclid) gelenlerin WhatsApp mesajına her durumda "(Google reklamı)" eklenir.

## Dikkat edilmesi gerekenler

- **`public/CNAME` silinmemeli.** Custom domain her deploy'da buradan gelir.
- **URL yapısı sabittir** (sondaki `/` dahil). SEO için değiştirilmemelidir.
- **Uydurma veri yasak.** Müşteri/proje sayısı, sertifika, fiyat veya
  doğrulanamayan iddia eklenmez; yorumlar Google'daki haliyle kalır.

## Deploy

`main` dalına push → `.github/workflows/deploy.yml` → `node build.mjs` →
`node audit.mjs` → CNAME ve sitemap doğrulaması → GitHub Pages.
Repository ayarı: **Settings → Pages → Source = GitHub Actions**.

Önceki Astro sürümü `astro-archive` dalında durur; geri dönmek için o dalı
`main`'e geri almak yeterlidir.

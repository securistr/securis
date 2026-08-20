/* ─────────────────────────────────────────────────────────────────────
   Securis — sitemap.xml (build sırasında otomatik üretilir)

   @astrojs/sitemap bilinçli olarak KULLANILMADI: o eklenti
   `sitemap-index.xml` + `sitemap-0.xml` üretir, oysa production'da
   arama motorlarına verilmiş adres `https://securis.com.tr/sitemap.xml`
   ve robots.txt de bu adresi gösteriyor. URL'yi değiştirmemek için
   sitemap kendi endpoint'imizden, production'daki formatın birebir
   aynısıyla üretiliyor.

   URL listesi artık elle tutulmuyor: bolgeler.json / hizmetler.json'a
   yeni kayıt eklendiği anda sitemap kendiliğinden büyür.
   ───────────────────────────────────────────────────────────────────── */

import site from '../data/site.json';
import bolgeler from '../data/bolgeler.json';
import hizmetler from '../data/hizmetler.json';

/** Build tarihi — production'daki `lastmod` alanının karşılığı. */
const lastmod = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  ...hizmetler.map((h) => ({
    loc: `/hizmetler/${h.slug}/`,
    changefreq: 'monthly',
    priority: '0.8',
  })),
  ...bolgeler.map((b) => ({
    loc: `/bolgeler/${b.slug}/`,
    changefreq: 'monthly',
    priority: '0.7',
  })),
  { loc: '/gizlilik-politikasi/', changefreq: 'yearly', priority: '0.3' },
];

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${site.url}${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}

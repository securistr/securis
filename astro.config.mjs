// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Securis — securis.com.tr
 *
 * Bu bir statik (prerendered) sitedir; production'da Astro runtime'ı çalışmaz.
 * Çıktı: saf HTML + CSS + JS + asset -> GitHub Pages.
 *
 * ÖNEMLİ — `base` AYARLANMAZ:
 * Site custom domain (apex, securis.com.tr) üzerinden yayınlanıyor.
 * `base` verilmesi tüm yolların önüne repo adını ekler ve production'ı bozar.
 *
 * `trailingSlash: 'always'` + `build.format: 'directory'`:
 * Mevcut production URL yapısı (/bolgeler/silivri/ gibi, sonu slash'li) birebir korunur.
 */
export default defineConfig({
  site: 'https://securis.com.tr',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Stil dosyaları harici tutulur: sayfalar arası cache paylaşımı sağlar,
    // CSP'deki style-src 'self' ile uyumludur.
    inlineStylesheets: 'never',
  },
  // Mevcut .webp görseller elle optimize edilmiş; yeniden encode edilmez.
  // Bu yüzden Astro'nun image servisi kullanılmıyor, görseller public/ altında.
  devToolbar: { enabled: false },
});

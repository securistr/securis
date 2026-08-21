/* ─────────────────────────────────────────────────────────────────────
   Securis — Alt sayfa davranışları
   (hizmet, bölge, gizlilik, 404)

   Tüm mantık ui-common.js'te; bu dosya yalnızca alt sayfalarda hangi
   davranışların açılacağını belirler. Ana sayfa (home.js) aynı ortak
   kümeyi kullanır, üstüne scroll-spy ve hero parallax ekler.
   ───────────────────────────────────────────────────────────────────── */

import {
  initMobileMenu,
  initNavScroll,
  initMobileCtaReveal,
  initFaqAccordion,
  initReveal,
} from './ui-common.js';

initMobileMenu();
initNavScroll();
initMobileCtaReveal();
initFaqAccordion();
initReveal();

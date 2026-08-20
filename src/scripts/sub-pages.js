/* ─────────────────────────────────────────────────────────────────────
   Securis — Alt sayfa davranışları
   (hizmet, bölge, gizlilik, 404)

   Kaynak: migration öncesi assets/seo-pages.js.
   Tüm mantık ui-common.js'e taşındı; bu dosya yalnızca hangi davranışların
   hangi seçeneklerle açılacağını belirler.
   ───────────────────────────────────────────────────────────────────── */

import {
  initMobileMenu,
  initNavScroll,
  initMobileCtaPulse,
  initFaqAccordion,
} from './ui-common.js';

// Alt sayfalarda production'da Escape ile kapatma ve aria-label güncellemesi
// VARDI — aynen korunuyor.
initMobileMenu();

// Ana sayfadan farklı olarak burada nav opaklığı kendi scroll dinleyicisiyle
// yönetilir (ana sayfada rAF döngüsünün içinde).
initNavScroll();

initMobileCtaPulse();
initFaqAccordion();

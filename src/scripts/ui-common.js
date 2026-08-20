/* ─────────────────────────────────────────────────────────────────────
   Securis — Tüm sayfalarda ortak UI davranışları

   Migration öncesinde bu davranışların bir kısmı hem index.html'in inline
   script'inde hem de assets/seo-pages.js içinde AYRI AYRI yazılıydı.
   Burada tek uygulamada birleştirildiler.

   Faz 2: davranış farkları giderildi. Ana sayfa ile alt sayfalar artık
   AYNI mobil menü davranışını kullanır (Escape ile kapanma dahil).
   ───────────────────────────────────────────────────────────────────── */

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Mobil menü aç/kapa.
 *
 * Faz 1'de ana sayfada Escape ile kapatma ve aria-label güncellemesi YOKTU
 * (production'daki durum aynen korunmuştu). Faz 2'de erişilebilirlik gereği
 * her sayfada açık:
 *   - Escape menüyü kapatır ve odağı butona geri verir
 *   - aria-expanded ve aria-label durumla birlikte güncellenir
 *   - menü açıkken sayfa gövdesi kaydırılmaz (arka plan kaymasın)
 */
export function initMobileMenu() {
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('navLinks');
  if (!btn || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle('mobile-open', open);
    btn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    document.body.classList.toggle('nav-open', open);
  };

  btn.addEventListener('click', () => setOpen(!nav.classList.contains('mobile-open')));

  // Menüdeki bir linke tıklanınca menü kapanır.
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('mobile-open')) {
      setOpen(false);
      btn.focus();
    }
  });

  // Menü açıkken masaüstü genişliğine geçilirse durum temizlenir.
  const wide = window.matchMedia('(min-width: 901px)');
  wide.addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}

/**
 * Kaydırdıkça navigasyon çubuğunu biraz daha opak yapar (okunabilirlik).
 *
 * Yalnızca ALT SAYFALAR için. Ana sayfada aynı iş, spotlight ile birlikte
 * tek bir requestAnimationFrame döngüsü içinde yapılıyor (home.js →
 * renderNav), bu yüzden orada bu fonksiyon çağrılmaz — iki ayrı scroll
 * dinleyicisi olmasın diye.
 */
export function initNavScroll() {
  const header = document.querySelector('nav');
  if (!header) return;
  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        header.classList.toggle('nav--scrolled', window.scrollY > 40);
        ticking = false;
      });
    },
    { passive: true }
  );
}

/**
 * Mobil CTA butonlarına sayfa yüklendikten birkaç saniye sonra TEK SEFERLİK
 * bir nabız — dikkat çeker, sürekli/rahatsız edici değildir.
 */
export function initMobileCtaPulse() {
  if (prefersReducedMotion()) return;
  const mabBtns = document.querySelectorAll('.mab-btn');
  if (!mabBtns.length) return;

  setTimeout(() => {
    mabBtns.forEach((btn) => {
      btn.classList.add('pulse-once');
      btn.addEventListener('animationend', () => btn.classList.remove('pulse-once'), { once: true });
    });
  }, 2500);
}

/**
 * SSS akordiyonları — native <details>/<summary> davranışı (klavye,
 * erişilebilirlik) tamamen korunur; açılış/kapanış yükseklik geçişi Web
 * Animations API (element.animate) ile çalıştırılır.
 *
 * CSS transition + zorla-reflow (offsetHeight) + çift requestAnimationFrame
 * yöntemi terk edilmişti: beklerken ~1-2 kare boyunca görünür bir "donma"
 * oluşuyordu. animate() ek kare beklemeden bir sonraki kare üretiminde
 * başlar, bu yüzden donma olmaz.
 */
export function initFaqAccordion() {
  if (prefersReducedMotion()) return;
  if (typeof Element === 'undefined' || !Element.prototype.animate) return;

  const FAQ_DURATION = 240;
  // Yavaş başlayan bir easing (ör. .4,0,.2,1) ilk karelerde neredeyse görünmez
  // bir hareketle başlıyor ve bu da "donma" hissi veriyordu. Sitede zaten
  // kullanılan, güçlü başlangıç hızına sahip ease-out eğrisi kullanılır.
  const FAQ_EASING = 'cubic-bezier(.16,1,.3,1)';

  document.querySelectorAll('.faq-item').forEach((details) => {
    const content = details.querySelector('.faq-answer');
    if (!content) return;
    let anim = null;

    details.addEventListener('click', (e) => {
      if (!e.target.closest('summary')) return;
      e.preventDefault();
      if (anim) anim.cancel();

      if (details.hasAttribute('open')) {
        // Kapat: o anki yükseklikten 0'a
        const fromH = content.getBoundingClientRect().height;
        anim = content.animate([{ height: fromH + 'px' }, { height: '0px' }], {
          duration: FAQ_DURATION,
          easing: FAQ_EASING,
          fill: 'forwards',
        });
        anim.onfinish = () => {
          details.removeAttribute('open');
          content.style.height = '';
          anim = null;
        };
      } else {
        details.setAttribute('open', '');
        // ÖNEMLİ: open eklenir eklenmez içerik doğal (tam) yüksekliğinde render
        // edilir; burada rect ölçmek "tam yükseklik → tam yükseklik" animasyonu
        // (yani donup açılma hissi) verirdi. Başlangıç sabit 0, hedef scrollHeight.
        const toH = content.scrollHeight;
        anim = content.animate([{ height: '0px' }, { height: toH + 'px' }], {
          duration: FAQ_DURATION,
          easing: FAQ_EASING,
          fill: 'forwards',
        });
        anim.onfinish = () => {
          content.style.height = '';
          anim = null;
        };
      }
    });
  });
}

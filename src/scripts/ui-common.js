/* ─────────────────────────────────────────────────────────────────────
   Securis — Tüm sayfalarda ortak UI davranışları

   Migration öncesinde bu davranışların bir kısmı hem index.html'in inline
   script'inde hem de assets/seo-pages.js içinde AYRI AYRI yazılıydı.
   Burada tek uygulamada birleştirildiler.

   KURAL: Faz 1'de davranış DEĞİŞTİRİLMEZ. İki sürüm arasında gerçek bir
   fark varsa, fark bir seçenekle korunur (bkz. initMobileMenu options) —
   sessizce "iyileştirilmez".
   ───────────────────────────────────────────────────────────────────── */

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Mobil menü aç/kapa.
 *
 * @param {object}  [opts]
 * @param {boolean} [opts.closeOnEscape=false]   Escape tuşuyla kapatma
 * @param {boolean} [opts.updateAriaLabel=false] Açıkken aria-label'ı "Menüyü kapat" yapma
 *
 * Faz 1 notu: production'da ana sayfada bu iki davranış YOKTU, alt
 * sayfalarda VARDI. Parite için varsayılan "kapalı" bırakıldı ve her sayfa
 * kendi mevcut davranışını açıkça seçiyor. Faz 2'de ikisi de her yerde
 * açılmalı (erişilebilirlik açısından doğrusu bu).
 */
export function initMobileMenu({ closeOnEscape = false, updateAriaLabel = false } = {}) {
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('navLinks');
  if (!btn || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('mobile-open', open);
    btn.setAttribute('aria-expanded', String(open));
    if (updateAriaLabel) {
      btn.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    }
  }

  btn.addEventListener('click', () => setOpen(!nav.classList.contains('mobile-open')));

  // Menüdeki bir linke tıklanınca menü kapanır.
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') setOpen(false);
  });

  if (closeOnEscape) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('mobile-open')) {
        setOpen(false);
        btn.focus();
      }
    });
  }
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

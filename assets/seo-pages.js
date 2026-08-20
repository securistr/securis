/* Securis alt sayfa scripti — mobil menü (B1) */
(function () {
  'use strict';
  var btn = document.getElementById('menuBtn');
  var nav = document.getElementById('navLinks');
  if (!btn || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('mobile-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  }
  btn.addEventListener('click', function () {
    setOpen(!nav.classList.contains('mobile-open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('mobile-open')) {
      setOpen(false); btn.focus();
    }
  });
  // Scroll ile nav opaklığı (ana sayfayla tutarlı)
  var header = document.querySelector('nav');
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      header.classList.toggle('nav--scrolled', window.scrollY > 40);
      ticking = false;
    });
  }, { passive: true });
})();

/* BOLD: mobil CTA tek seferlik nabız + SSS akordiyon yumuşak açılış —
   ana sayfadaki (index.html) aynı davranışın alt sayfalar için karşılığı.
   Ayrı bir IIFE: yukarıdaki mobil menü scriptinden bağımsız çalışır. */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  // Mobil CTA — sayfa yüklendikten birkaç saniye sonra tek seferlik nabız
  var mabBtns = document.querySelectorAll('.mab-btn');
  if (mabBtns.length) {
    setTimeout(function () {
      mabBtns.forEach(function (btn) {
        btn.classList.add('pulse-once');
        btn.addEventListener('animationend', function onEnd() {
          btn.classList.remove('pulse-once');
          btn.removeEventListener('animationend', onEnd);
        }, { once: true });
      });
    }, 2500);
  }

  // SSS akordiyonları — native <details>/<summary> davranışı (klavye dahil) korunur.
  // Yükseklik animasyonu Web Animations API (element.animate) ile çalıştırılır:
  // CSS transition + zorla-reflow (offsetHeight) + çift requestAnimationFrame yöntemi
  // görünür bir "donma" oluşturuyordu, animate() ek kare beklemeden hemen başlar.
  if (typeof Element !== 'undefined' && Element.prototype.animate) {
    var FAQ_DURATION = 240;
    // Yavaş başlayan bir easing ilk karelerde neredeyse görünmez hareketle başlıyor ve
    // "donma" hissi veriyordu; ana sayfayla aynı, güçlü başlangıç hızına sahip ease-out eğrisi.
    var FAQ_EASING = 'cubic-bezier(.16,1,.3,1)';
    document.querySelectorAll('.faq-item').forEach(function (details) {
      var content = details.querySelector('.faq-answer');
      if (!content) return;
      var anim = null;
      details.addEventListener('click', function (e) {
        if (!e.target.closest('summary')) return;
        e.preventDefault();
        if (anim) anim.cancel();
        var isOpen = details.hasAttribute('open');
        var fromH, toH;
        if (isOpen) {
          fromH = content.getBoundingClientRect().height;
          anim = content.animate(
            [{ height: fromH + 'px' }, { height: '0px' }],
            { duration: FAQ_DURATION, easing: FAQ_EASING, fill: 'forwards' }
          );
          anim.onfinish = function () {
            details.removeAttribute('open');
            content.style.height = '';
            anim = null;
          };
        } else {
          details.setAttribute('open', '');
          // ÖNEMLİ: open eklenir eklenmez içerik doğal (tam) yüksekliğinde render edilir,
          // burada rect ölçmek tam yükseklik -> tam yükseklik animasyonu (yani "donup açılma"
          // hissi) verirdi. Başlangıç sabit 0, hedef doğal içerik yüksekliği (scrollHeight).
          toH = content.scrollHeight;
          anim = content.animate(
            [{ height: '0px' }, { height: toH + 'px' }],
            { duration: FAQ_DURATION, easing: FAQ_EASING, fill: 'forwards' }
          );
          anim.onfinish = function () {
            content.style.height = '';
            anim = null;
          };
        }
      });
    });
  }
})();

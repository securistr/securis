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

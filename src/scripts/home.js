/* ─────────────────────────────────────────────────────────────────────
   Securis — ANA SAYFAYA ÖZEL davranışlar (Faz 2)

   Faz 1'de burada 300 satırlık bir "silindirik kaydırma motoru" vardı:
   tüm bölümlere scroll'a bağlı rotateX + perspektif telafisi + damped
   lerp uygulayan, her karede 6 büyük öğeye transform yazan bir döngü.

   NEDEN KALDIRILDI (§7 değerlendirmesi):
     - Bölümleri 3B döndürmek okuma sırasında metni eğiyordu; kurumsal
       bir güvenlik firması için "premium" değil "demo" hissi veriyordu.
     - Kaydırma boyunca sürekli çalışan bir rAF döngüsü + 6 öğeye
       transform/opacity/filter yazımı gereksiz maliyetti.
     - Fikrin kendisi (derinlik + kaydırmaya yanıt) korundu, daha
       kontrollü bir dille yeniden yorumlandı:
         · hero fotoğraf katmanında hafif parallax (tek öğe, transform)
         · içerik bloklarında kısa, tek eksenli reveal (CSS geçişi)
         · bölüm zeminlerinde süreklilik (gradyan/maske, JS'siz)

   Kalan iş bu dosyada: scroll-spy, hero parallax, marquee sıfırlaması.
   ───────────────────────────────────────────────────────────────────── */

import {
  initMobileMenu,
  initNavScroll,
  initMobileCtaReveal,
  initFaqAccordion,
  initReveal,
  prefersReducedMotion,
} from './ui-common.js';

initMobileMenu();
initNavScroll();
initMobileCtaReveal();
initFaqAccordion();
initReveal();

/* ── SCROLL-SPY ───────────────────────────────────────────────────────
   Menüde bulunulan bölüm vurgulanır (aria-current="true"). Kaydırma
   dinleyicisi yok; IntersectionObserver yeterli.                        */
(function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const targets = links
    .map((link) => ({ link, sec: document.querySelector(link.getAttribute('href')) }))
    .filter((t) => t.sec);
  if (!targets.length || !('IntersectionObserver' in window)) return;

  const navH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
    10
  ) || 76;

  const setActive = (link) => {
    for (const t of targets) {
      if (t.link === link) t.link.setAttribute('aria-current', 'true');
      else t.link.removeAttribute('aria-current');
    }
  };

  const spy = new IntersectionObserver(
    (entries) => {
      let best = null;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
      if (!best) return;
      const t = targets.find((x) => x.sec === best.target);
      if (t) setActive(t.link);
    },
    { rootMargin: `-${navH + 10}px 0px -55% 0px`, threshold: [0.1, 0.3, 0.6] }
  );
  targets.forEach((t) => spy.observe(t.sec));
})();

/* ── HERO PARALLAX ────────────────────────────────────────────────────
   Tek öğe (.hero-photo), yalnızca transform — layout tetiklemez.
   Döngü YALNIZCA hero görünür alandayken çalışır; hero ekrandan
   çıktığında IntersectionObserver döngüyü tamamen durdurur.             */
(function initHeroParallax() {
  if (prefersReducedMotion()) return;

  const hero = document.getElementById('hero');
  const layer = hero?.querySelector('[data-parallax]');
  if (!hero || !layer) return;

  // Dokunmatik/dar ekranda kapalı: kazanç düşük, maliyet görece yüksek.
  const allowed = window.matchMedia('(min-width: 981px) and (pointer: fine)');
  if (!allowed.matches) return;

  const depth = parseFloat(layer.dataset.parallax) || 0.15;
  let running = false;
  let raf = 0;

  const frame = () => {
    const y = window.scrollY;
    // Hero yüksekliğini aşınca yazmayı bırak
    if (y > hero.offsetHeight) {
      running = false;
      return;
    }
    layer.style.transform = `translate3d(0, ${(y * depth).toFixed(2)}px, 0)`;
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const io = new IntersectionObserver(
    ([e]) => (e.isIntersecting ? start() : stop()),
    { threshold: 0 }
  );
  io.observe(hero);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });
})();

/* ── MARQUEE ──────────────────────────────────────────────────────────
   Yazı tipi async yüklendiğinde şerit genişliği değişir; yüzde tabanlı
   translateX(-50%) animasyonunda bu görünür bir sıçrama yapar. Fontlar
   hazır olduğunda animasyon bir kez temiz şekilde yeniden başlatılır.   */
(function resetMarqueeAfterFonts() {
  if (prefersReducedMotion()) return;
  const track = document.querySelector('.marquee-track');
  if (!track || !document.fonts?.ready) return;

  document.fonts.ready.then(() => {
    track.style.animation = 'none';
    void track.offsetWidth; // reflow'u zorla
    track.style.animation = '';
  });
})();

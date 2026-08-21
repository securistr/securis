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
   Menüde bulunulan bölüm vurgulanır (aria-current="true").

   ESKİ YAKLAŞIMIN NEDEN BOZUK OLDUĞU (ölçülerek bulundu, layout sorunu
   DEĞİLDİ — bölümler bitişik, örtüşme/negatif margin yok):

   IntersectionObserver `rootMargin: -86px 0px -55%` ile yalnızca 319px
   yüksekliğinde bir bant tanımlıyordu. Sayfadaki her bölüm bu banttan
   UZUN olduğu için ulaşılabilir en yüksek intersectionRatio değerleri
   0.21–0.58 arasındaydı; yani `threshold: 0.6` hiçbir zaman
   tetiklenemiyordu. Dahası callback, oranı yalnızca O ANKİ PARTİ
   içindeki entry'ler arasında karşılaştırıyordu.

   Asıl kusur ise ölçütün kendisiydi: intersectionRatio, kesişen alanın
   ÖĞENİN KENDİ YÜKSEKLİĞİNE oranıdır. Kısa bir bölüm (#region, 546px)
   aynı görünür alan için uzun bir bölümden (#about, 816px) daima daha
   yüksek oran üretir. Bu yüzden yukarıdan About'a inerken "Bölgeler"
   aktif kalıyor, aşağıdan çıkarken (#region bantta olmadığı için)
   doğru çalışıyordu — kullanıcının tarif ettiği asimetri tam olarak bu.

   YENİ YAKLAŞIM — tek, belirlenimci referans çizgisi:
   Viewport'ta nav'ın altından itibaren %30'luk bir noktada hayali bir
   çizgi düşünülür. AKTİF BÖLÜM = üstü bu çizginin üzerinde kalan SON
   bölüm. Bu kural:
     · bölüm yüksekliğinden bağımsızdır
     · her değerlendirmede TÜM bölümleri tarar (parti bağımlı değil)
     · #brands / #solutions gibi menüde karşılığı olmayan aradaki
       bölümlerde bir öncekini korur (Çözümler'deyken "Hizmetler")
     · sayfa sonunda son bölümü (#contact) etkinleştirir             */
(function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const targets = links
    .map((link) => ({ link, sec: document.querySelector(link.getAttribute('href')) }))
    .filter((t) => t.sec);
  if (!targets.length) return;

  let aktif = null;
  const setActive = (link) => {
    if (link === aktif) return; // gereksiz DOM yazımı yok
    aktif = link;
    for (const t of targets) {
      if (t.link === link) t.link.setAttribute('aria-current', 'true');
      else t.link.removeAttribute('aria-current');
    }
  };

  const olc = () => {
    const navH =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 76;
    const cizgi = navH + (window.innerHeight - navH) * 0.3;

    // Sayfa sonuna gelindiyse son bölüm aktiftir: son bölümün üstü
    // çizgiyi geçemeyebilir çünkü daha fazla kaydırma alanı yoktur.
    const dip = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (dip) return targets[targets.length - 1].link;

    // TÜM bölümler tek turda okunur (ölçüm ve yazım ayrı) —
    // layout thrashing oluşmaz.
    let secilen = targets[0].link;
    for (const t of targets) {
      if (t.sec.getBoundingClientRect().top <= cizgi) secilen = t.link;
      else break; // bölümler belge sırasında; ilk geçmeyende durabiliriz
    }
    return secilen;
  };

  // rAF ile kısılmış tek scroll dinleyicisi; sürekli dönen bir döngü yok.
  let bekliyor = false;
  const guncelle = () => {
    bekliyor = false;
    setActive(olc());
  };
  const planla = () => {
    if (bekliyor) return;
    bekliyor = true;
    requestAnimationFrame(guncelle);
  };

  window.addEventListener('scroll', planla, { passive: true });
  window.addEventListener('resize', planla, { passive: true });

  // Nav tıklaması: hedefi hemen işaretle (yumuşak kaydırma boyunca
  // titremesin), kaydırma bitince ölçüm zaten doğrulayacak.
  for (const t of targets) {
    t.link.addEventListener('click', () => setActive(t.link));
  }

  guncelle();
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

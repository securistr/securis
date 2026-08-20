/* ─────────────────────────────────────────────────────────────────────
   Securis — ANA SAYFAYA ÖZEL davranışlar

   Kaynak: migration öncesi index.html'in inline <script> bloğu.
   Kod BİREBİR taşınmıştır; tek değişiklik, tüm sayfalarda ortak olan
   davranışların (mobil menü, mobil CTA nabzı, SSS akordiyonu)
   ui-common.js'ten import edilmesidir.

   İçerik:
     - hero parallax + cihaz kartı grubu (scale/opacity)
     - silindirik kaydırma motoru (rotateX + damped lerp + perspektif telafisi)
     - nav spotlight (--mouse-x / --mouse-y) + kaydırma opaklığı
     - scroll-spy (aktif bölümü menüde vurgular)
     - reveal observer
     - marquee font-ready sıfırlaması
   ───────────────────────────────────────────────────────────────────── */

import {
  initMobileMenu,
  initMobileCtaPulse,
  initFaqAccordion,
} from './ui-common.js';

// Ana sayfada Escape ile kapatma ve aria-label güncellemesi production'da
// YOKTU; parite için kapalı bırakıldı (bkz. ui-common.js açıklaması).
initMobileMenu({ closeOnEscape: false, updateAriaLabel: false });

const group = document.getElementById('deviceGroup');
const hero = document.getElementById('hero');
const heroLayers = document.querySelectorAll('.hero-layer');

// Katmanların CSS'te tanımlı temel ölçek/opaklık değerlerini oku; parallax
// bu değerlerin üzerine çarpan olarak uygulanır, onları ezmez.
function captureLayerBases() {
    heroLayers.forEach(l => {
        const cs = getComputedStyle(l);
        l.dataset.baseOpacity = cs.opacity;
        let scale = 1;
        if (cs.transform && cs.transform !== 'none') {
            const nums = cs.transform.match(/-?[\d.]+/g);
            if (nums && nums.length >= 4) scale = parseFloat(nums[0]) || 1;
        }
        l.dataset.baseScale = scale.toFixed(3);
    });
}
captureLayerBases();
const cylEls = document.querySelectorAll('.cyl');
// CSS'teki --nav-h ile senkron kalsın diye değişkenden okunur
const NAV_H = parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--nav-h'), 10) || 80;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let ticking = false;

// ── SİLİNDİRİK KAYDIRMA MOTORU (tek eksen: rotateX) ─────────────
//
// Tüm bölümler AYNI davranışı gösterir; dönüşümlü/alternatif yön yok.
// Yalnızca rotateX kullanılır — rotateY, rotateZ ve translateX yok,
// dolayısıyla hiçbir öğe sağa-sola kaymaz.
//
//   Bölüm ekrana girerken   : en fazla ±MAX_ANGLE derece eğik
//   Bölüm ekranın ortasında : tam 0° — düz, deforme değil, okunur
//
// transform-origin, bölümün merkeze göre konumuna bakılarak üst veya
// alt kenara alınır; böylece dönüş bir silindir yüzeyinden geliyormuş
// gibi hissedilir. Sönümleme (damped lerp) ile scroll olayının düzensiz
// aralıkları animasyona yansımaz: state -> rAF -> transform.

const MAX_ANGLE = 13;       // BOLD: daha sinematik eğim (±8-10 → ±13, taşma telafisi aşağıda korunur)
const PERSPECTIVE = 1200;   // CSS'teki perspective ile aynı olmalı
const DAMP = 0.10;          // sönümleme katsayısı
const SETTLE_EPS = 0.0008;
const FADE = 0.28;          // kenarlarda hafif saydamlaşma

// 768px ve altında efekt tamamen kapalı (performans + okunurluk)
const effectQuery = window.matchMedia('(min-width: 769px)');
let effectOn = effectQuery.matches && !reduceMotion;

function computeCylTargets() {
    const vh = window.innerHeight;
    const mid = vh / 2;
    for (let i = 0; i < cylEls.length; i++) {
        const el = cylEls[i];
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) { el._visible = false; continue; }
        el._visible = true;
        // -1 (ekranın üstünde) .. 0 (tam merkez) .. +1 (ekranın altında)
        let p = ((r.top + r.height / 2) - mid) / (vh * 0.85);
        el._tp = p < -1 ? -1 : (p > 1 ? 1 : p);
    }
}

function renderCyl() {
    let settled = true;
    for (let i = 0; i < cylEls.length; i++) {
        const el = cylEls[i];
        const tp = el._tp || 0;
        if (el._p === undefined) el._p = tp;

        el._p += (tp - el._p) * DAMP;
        if (Math.abs(tp - el._p) > SETTLE_EPS) settled = false;
        else el._p = tp;

        // will-change yalnızca hareket halindeki öğede
        if (Math.abs(el._p) > 0.02) {
            if (!el._wc) { el.style.willChange = 'transform, opacity'; el._wc = true; }
        } else if (el._wc) {
            el.style.willChange = 'auto'; el._wc = false;
        }

        // Merkezin altındaysa alt kenardan, üstündeyse üst kenardan döner
        el.style.transformOrigin = el._p > 0 ? 'center bottom' : 'center top';
        const theta = -el._p * MAX_ANGLE;

        // PERSPEKTİF TELAFİSİ:
        // transform-origin kenarda olduğu için karşı kenar izleyiciye
        // yaklaşır ve öğe projeksiyonda genişler (1024/1280px'de yatay
        // taşmanın gerçek sebebi buydu). Büyüme oranını hesaplayıp
        // ters ölçekle sıfırlıyoruz; genişlik sabit kalır, eğim korunur.
        const h = el.offsetHeight || 0;
        const z = h * Math.abs(Math.sin(theta * Math.PI / 180));
        const grow = PERSPECTIVE / Math.max(1, PERSPECTIVE - z);
        const comp = (1 / grow).toFixed(4);

        el.style.transform = `rotateX(${theta.toFixed(3)}deg) scale(${comp})`;
        el.style.opacity = (1 - el._p * el._p * FADE).toFixed(4);
        // BOLD: hafif parlaklık değişimi — merkezdeyken tam parlak (1.0),
        // kenara yaklaştıkça biraz kararır (min ~0.88); "sinematik" bir his verir.
        el.style.filter = `brightness(${(1 - Math.abs(el._p) * 0.12).toFixed(3)})`;
    }
    return settled;
}

function clearCyl() {
    for (let i = 0; i < cylEls.length; i++) {
        const el = cylEls[i];
        el.style.transform = '';
        el.style.opacity = '';
        el.style.filter = '';
        el.style.transformOrigin = '';
        el.style.willChange = 'auto';
        el._wc = false; el._p = undefined;
    }
}

function updateCylinder() {
    if (!effectOn || !cylEls.length) return true;
    computeCylTargets();
    return renderCyl();
}
function updateGroup() {
    if (!group || !hero) return;
    const r = hero.getBoundingClientRect();
    const isMobile = window.innerWidth <= 900;
    let s = 0;
    
    if (isMobile) {
        const groupRect = group.getBoundingClientRect();
        const triggerPoint = window.innerHeight * 0.55; 
        s = Math.max(0, Math.min(1, (triggerPoint - groupRect.top) / (groupRect.height || 1)));
    } else {
        s = Math.max(0, Math.min(1, -r.top / r.height));
    }
    
    // Yatay kayma yok: yalnızca ölçek + opaklık
    const sc = 1 - s * 0.12;
    const op = 1 - s * 2;

    group.style.transform = `scale(${Math.max(0.8, sc)})`;
    group.style.opacity = Math.max(0, op);

if (op <= 0.02) {
    group.style.visibility = 'hidden';
    group.style.pointerEvents = 'none';
} else {
    group.style.visibility = 'visible';
    group.style.pointerEvents = 'auto';
}

    // Arkaplan fotoğrafı: kaydırdıkça sola süzülür ve solarak kaybolur
    if (heroLayers.length && !reduceMotion) {
        const hs = Math.max(0, Math.min(1, -r.top / (r.height || 1)));
        heroLayers.forEach(layer => {
            // Her katman farklı hızda süzülür -> derinlik (parallax) hissi
            const d = parseFloat(layer.dataset.depth) || 1;
            const base = parseFloat(layer.dataset.baseScale) || 1;
            layer.style.transform = `scale(${base + hs * 0.07 * d})`;
            layer.style.opacity = String(Math.max(0, (parseFloat(layer.dataset.baseOpacity) || 1) * (1 - hs * 1.15)));
        });
    }

    ticking = false;
}

// ── ANİMASYON DÖNGÜSÜ ────────────────────────────────────────────
// Kaydırma olayları düzensiz aralıklarla gelir; doğrudan onlara bağlı
// yazmak kare atlamalarına (takılma) yol açar. Bunun yerine kaydırma
// yalnızca döngüyü uyandırır, çizim her karede sönümlü olarak yapılır.
let loopRunning = false;
let lastScrollAt = 0;

// ── NAV: yarı saydam çubuk + imleç spotlight'ı ───────────────────
// pointermove olayında YALNIZCA state güncellenir; DOM'a yazma işi
// aşağıdaki rAF döngüsünde yapılır (olay başına reflow yok).
const siteNav = document.getElementById('siteNav');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const spotlightEnabled = finePointer.matches && !reduceMotion;

let navMouse = { x: 0, y: 0, dirty: false };
let navScrolled = false;

if (spotlightEnabled && siteNav) {
    // Dokunmatik cihazlarda bu dinleyici hiç bağlanmaz
    siteNav.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = siteNav.getBoundingClientRect();
        navMouse.x = e.clientX - r.left;
        navMouse.y = e.clientY - r.top;
        navMouse.dirty = true;
        if (!siteNav.classList.contains('nav--lit')) siteNav.classList.add('nav--lit');
        wakeLoop();
    }, { passive: true });

    siteNav.addEventListener('pointerleave', () => {
        // Sert kesme yok: opacity geçişi CSS'te yumuşakça söner
        siteNav.classList.remove('nav--lit');
    }, { passive: true });
}

function renderNav() {
    if (!siteNav) return;
    if (navMouse.dirty) {
        siteNav.style.setProperty('--mouse-x', navMouse.x.toFixed(1) + 'px');
        siteNav.style.setProperty('--mouse-y', navMouse.y.toFixed(1) + 'px');
        navMouse.dirty = false;
    }
    // Kaydırdıkça çubuk biraz daha opak (okunabilirlik)
    const shouldScroll = window.scrollY > 40;
    if (shouldScroll !== navScrolled) {
        navScrolled = shouldScroll;
        siteNav.classList.toggle('nav--scrolled', shouldScroll);
    }
}

function tick() {
    updateGroup();                       // hero + cihaz kartları
    renderNav();                         // nav spotlight + opaklık
    const settled = updateCylinder();    // silindir (sönümlü)
    const idle = performance.now() - lastScrollAt > 600;
    if (settled && idle) { loopRunning = false; return; }
    requestAnimationFrame(tick);
}

function wakeLoop() {
    lastScrollAt = performance.now();
    if (!loopRunning) { loopRunning = true; requestAnimationFrame(tick); }
}

window.addEventListener('scroll', wakeLoop, { passive: true });
// Sekme arka plandayken döngü boşuna dönmesin
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) wakeLoop();
});

function onViewportChange() {
    const was = effectOn;
    effectOn = effectQuery.matches && !reduceMotion;
    captureLayerBases();
    if (was && !effectOn) clearCyl();   // mobile geçişte stiller temizlenir
    updateGroup();
    wakeLoop();
}
window.addEventListener('resize', onViewportChange, { passive: true });
window.addEventListener('orientationchange', onViewportChange);
if (effectQuery.addEventListener) effectQuery.addEventListener('change', onViewportChange);
window.addEventListener('load', () => { updateGroup(); wakeLoop(); });
updateGroup();
updateCylinder();
wakeLoop();

// ── SCROLL-SPY: aktif bölüm menüde vurgulanır ────────────────────
const navLinkEls = Array.from(document.querySelectorAll('.nav-link'));
const spyTargets = navLinkEls
    .map(a => ({ link: a, sec: document.querySelector(a.getAttribute('href')) }))
    .filter(t => t.sec);

function setActive(link) {
    for (const t of spyTargets) {
        if (t.link === link) t.link.setAttribute('aria-current', 'true');
        else t.link.removeAttribute('aria-current');
    }
}
if (spyTargets.length) {
    const spy = new IntersectionObserver((entries) => {
        let best = null;
        for (const e of entries) {
            if (!e.isIntersecting) continue;
            if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (best) {
            const t = spyTargets.find(x => x.sec === best.target);
            if (t) setActive(t.link);
        }
    }, { rootMargin: `-${NAV_H + 10}px 0px -55% 0px`, threshold: [0.1, 0.3, 0.6] });
    spyTargets.forEach(t => spy.observe(t.sec));
}

const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
revealEls.forEach(el => observer.observe(el));

// ── MARQUEE (#brands) — yazı tipi async yüklendiğinde şerit genişliği
// değişebilir; bu, yüzde-tabanlı translateX(-50%) animasyonunda görünür
// bir sıçramaya yol açabilir. Font tamamen yüklendikten sonra animasyonu
// bir kez temiz şekilde sıfırlayarak (baştan başlatarak) bu riski ortadan
// kaldırıyoruz — döngünün kendisi ve hover'da duraklama davranışı korunur.
if (!reduceMotion) {
    const brandsTrack = document.querySelector('.brands-track');
    if (brandsTrack && document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            brandsTrack.style.animation = 'none';
            void brandsTrack.offsetWidth; // reflow'u zorla
            brandsTrack.style.animation = '';
        });
    }
}

initMobileCtaPulse();
initFaqAccordion();

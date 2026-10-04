/* Securis — shared behaviour: menu overlay, section reveals. */
(() => {
  const menu = document.getElementById('menu');
  const opener = document.querySelector('[data-menu-open]');
  if (menu && opener) {
    // kinetic panel: CSS runs the sweep/rise off .is-open; hidden (and inert while it slides out) keeps it out of reach when closed
    let t = 0;
    const state = on => {
      opener.setAttribute('aria-expanded', on); opener.setAttribute('aria-label', on ? 'Menüyü kapat' : 'Menü');
      document.documentElement.classList.toggle('menu-open', on); menu.inert = !on;
    };
    const open = () => {
      clearTimeout(t); menu.hidden = false;
      void menu.offsetWidth; // commit the closed pose so the sheets sweep from it
      menu.classList.add('is-open'); state(true);
      menu.querySelector('a, button').focus(); // straight away, not after the animation
    };
    const close = () => {
      if (!menu.classList.contains('is-open')) return;
      menu.classList.remove('is-open'); state(false);
      t = setTimeout(() => { menu.hidden = true; }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700);
      opener.focus();
    };
    opener.addEventListener('click', open);
    menu.querySelectorAll('[data-menu-close]').forEach(b => b.addEventListener('click', close)); // the in-panel button and the dim overlay
    menu.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    // hover motifs: the hovered service's drawing builds in; the previous one fades out
    if (matchMedia('(hover: hover)').matches) {
      const ms = menu.querySelectorAll('.menu__motif');
      const show = i => ms.forEach((m, j) => { const on = j === i; if (on || m.classList.contains('is-on')) { m.classList.toggle('is-on', on); m.classList.toggle('was-on', !on); } });
      menu.querySelectorAll('.menu__svcs li').forEach((li, i) => { li.addEventListener('pointerenter', () => show(i)); li.addEventListener('focusin', () => show(i)); });
      menu.querySelector('.menu__svcs ul').addEventListener('pointerleave', () => show(-1));
      menu.querySelector('.menu__svcs ul').addEventListener('focusout', e => { if (!e.currentTarget.contains(e.relatedTarget)) show(-1); });
    }
    document.addEventListener('keydown', e => {
      if (!menu.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { // keep focus inside the dialog
        const f = [...menu.querySelectorAll('a, button')];
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
        else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

  /* theme toggle (skiper26): the new theme opens as a circle from the button */
  const root = document.documentElement;
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    const sync = () => btn.setAttribute('aria-pressed', root.dataset.theme === 'light');
    sync();
    btn.addEventListener('click', () => {
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      const apply = () => { root.dataset.theme = next; document.querySelector('meta[name=theme-color]')?.setAttribute('content', next === 'light' ? '#f2f3f4' : '#000000'); try { localStorage.setItem('theme', next); } catch (e) {} sync(); };
      const r = btn.getBoundingClientRect();
      root.style.setProperty('--vt-x', `${r.left + r.width / 2}px`);
      root.style.setProperty('--vt-y', `${r.top + r.height / 2}px`);
      if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(apply).ready.catch(() => {}); // aborts harmlessly in hidden tabs
      else apply();
    });
  });

  /* text roll (skiper58): letters split into two stacked layers; the visible text stays for screen readers */
  const roll = el => {
    const text = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).pop();
    if (!text) return;
    const t = text.textContent.trim(), mid = (t.length - 1) / 2;
    // letters grouped per word so long names can still wrap between words
    const esc1 = c => c.replace(/[&<>]/g, x => `&#${x.charCodeAt(0)};`);
    const layer = cls => { let k = 0; return `<span class="${cls}" aria-hidden="true">${t.split(' ').map(w => `<span class="w">${[...w].map(c => `<i style="--d:${Math.abs(k++ - mid)}">${esc1(c)}</i>`).join('')}</span>`).join(' ')}</span>`; };
    const span = document.createElement('span');
    span.className = 'roll';
    span.innerHTML = `<span class="sr">${t}</span>${layer('roll__a')}${layer('roll__b')}`;
    text.replaceWith(span);
    // the roll clips one line; a label that wraps (or a touch screen with no hover) keeps plain text
    if (span.offsetHeight > parseFloat(getComputedStyle(span).fontSize) * 1.6) span.replaceWith(text);
  };
  if (matchMedia('(hover: hover)').matches) {
    // menu links are laid out while the dialog is hidden, so measure them on first open
    document.querySelectorAll('[data-roll]').forEach(roll);
    document.querySelector('[data-menu-open]')?.addEventListener('click', () => requestAnimationFrame(() => document.querySelectorAll('.menu nav a').forEach(a => { if (!a.querySelector('.roll')) roll(a); })));
  }

  /* member list (skiper6): a graded photo follows the cursor over the service names */
  const list = document.querySelector('.members__list'), fol = document.querySelector('.follower');
  if (list && fol && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const img = fol.querySelector('img'), [c, m] = fol.querySelectorAll('i');
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const tick = () => {
      x += (tx - x) * .16; y += (ty - y) * .16;
      fol.style.transform = `translate(${Math.min(x + 28, innerWidth - fol.offsetWidth - 12)}px, ${Math.max(12, y - fol.offsetHeight - 18)}px) rotate(${(tx - x) * .04}deg)`; // sits above-right of the cursor, over the dimmed row, so the hovered name stays readable
      raf = Math.abs(tx - x) + Math.abs(ty - y) > .3 ? requestAnimationFrame(tick) : 0;
    };
    list.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; if (!fol.classList.contains('is-on')) { x = tx; y = ty; } if (!raf) raf = requestAnimationFrame(tick); });
    list.querySelectorAll('a').forEach(a => a.addEventListener('pointerenter', () => {
      img.src = a.dataset.img; const acc = a.style.getPropertyValue('--accent');
      c.style.background = m.style.background = acc; fol.classList.add('is-on');
    }));
    list.addEventListener('pointerleave', () => fol.classList.remove('is-on'));
  }

  /* reviews: the server list (a scroll-snap strip without JS) becomes one featured review at a time over a photo that
     morph-dissolves (morph.js) to the review's frame. Autoplay every 7s; held by the pause button, paused on mouse hover,
     focus, off-screen, in a hidden tab or while a long review is open. Only the visitor's own changes are announced. */
  const revs = document.getElementById('revs');
  if (revs) addEventListener('DOMContentLoaded', () => { // morph.js is a later deferred script
    const sec = revs.closest('.revs'), items = [...revs.children], n = items.length, ctl = sec.querySelector('.revs__ctl');
    const avs = [...ctl.querySelectorAll('.revs__avs button')], pauseBtn = ctl.querySelector('.revs__pause'), num = ctl.querySelector('.revs__n span');
    const bg = sec.querySelector('.revs__bg'), grade = bg.querySelectorAll('i'), cv = document.createElement('canvas');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cur = 0, held = false, hover = false, focus = false, onScreen = false, seen = false, timer = 0;
    grade[0].before(cv);
    const morph = window.createMorph?.(cv, items.map(li => li.dataset.img), { zoom: [1.08, 1.02], zoomMs: 4500 });
    revs.setAttribute('aria-live', 'off'); items[0].classList.add('is-on'); sec.classList.add('is-rot'); ctl.hidden = false; pauseBtn.hidden = reduce;

    // long quotes are clamped; the toggle shows only where the clamp actually cuts (re-checked on resize)
    const mores = items.map(li => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'rev__more'; btn.hidden = true;
      const set = o => { li.classList.toggle('is-open', o); btn.textContent = o ? 'Kısalt' : 'Devamını oku'; btn.setAttribute('aria-expanded', o); };
      set(false);
      btn.addEventListener('click', () => { set(!li.classList.contains('is-open')); plan(); });
      li.querySelector('blockquote').after(btn);
      return { li, btn, set };
    });
    new ResizeObserver(() => mores.forEach(({ li, btn }) => { if (!li.classList.contains('is-open')) { const p = li.querySelector('blockquote p'); btn.hidden = p.scrollHeight <= p.clientHeight + 2; } })).observe(revs);

    const plan = () => {
      clearTimeout(timer);
      if (!reduce && !held && !hover && !focus && onScreen && !document.hidden && !items[cur].classList.contains('is-open')) timer = setTimeout(() => go(cur + 1, 1, true), 7000);
    };
    function paint() {
      avs.forEach((b, j) => { b.setAttribute('aria-current', j === cur); b.tabIndex = j === cur ? 0 : -1; });
      num.textContent = String(cur + 1).padStart(2, '0');
      grade.forEach(g => { g.style.background = items[cur].dataset.accent; });
    }
    function go(i, dir, auto = false) {
      i = (i + n) % n;
      if (i === cur) return;
      revs.setAttribute('aria-live', auto ? 'off' : 'polite');
      mores[cur].set(false); items[cur].classList.remove('is-on');
      cur = i; items[cur].classList.add('is-on');
      paint();
      if (seen) morph?.show(cur, dir);
      plan();
    }
    paint();

    ctl.querySelectorAll('[data-rev]').forEach(b => b.addEventListener('click', () => go(cur + +b.dataset.rev, +b.dataset.rev)));
    avs.forEach((b, j) => b.addEventListener('click', () => go(j, j > cur ? 1 : -1)));
    pauseBtn.addEventListener('click', () => { held = !held; pauseBtn.setAttribute('aria-pressed', held); plan(); });
    sec.addEventListener('keydown', e => {
      const k = { ArrowLeft: cur - 1, ArrowRight: cur + 1, Home: 0, End: n - 1 }[e.key];
      const inRow = avs.includes(document.activeElement);
      if (k === undefined || (!inRow && (e.key === 'Home' || e.key === 'End'))) return;
      e.preventDefault(); go(k, k > cur ? 1 : -1);
      if (inRow) avs[cur].focus(); // roving focus follows the current review
    });
    sec.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hover = true; plan(); } });
    sec.addEventListener('pointerleave', () => { hover = false; plan(); });
    sec.addEventListener('focusin', () => { focus = true; plan(); });
    sec.addEventListener('focusout', e => { if (!sec.contains(e.relatedTarget)) { focus = false; plan(); } });
    document.addEventListener('visibilitychange', plan);
    new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen && !seen) { seen = true; morph?.show(cur, 1); } // no photo downloads until the stage is in view
      plan();
    }, { rootMargin: '-15% 0px' }).observe(sec);
    // touch swipe on the quote; touch-action: pan-y leaves vertical scrolling to the page (a scroll cancels the pointer)
    let sx = 0, sy = 0, sid = null;
    revs.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { sid = e.pointerId; sx = e.clientX; sy = e.clientY; } });
    revs.addEventListener('pointercancel', () => { sid = null; });
    revs.addEventListener('pointerup', e => {
      if (e.pointerId !== sid) return;
      sid = null;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) go(cur - Math.sign(dx), -Math.sign(dx));
    });
  });

  /* contact sheet: on narrow screens scroll the ringed frame into the middle */
  const on = document.querySelector('.sheet .is-on');
  if (on) { const sh = on.parentElement; sh.scrollLeft = on.offsetLeft - (sh.clientWidth - on.clientWidth) / 2; }

  /* reveal: content is visible without JS; with JS it rises in once */
  const els = document.querySelectorAll('.sec__head, .dsv li, .faq details, .cards li');
  els.forEach((el, i) => { el.classList.add('rv'); el.style.transitionDelay = `${(i % 6) * 50}ms`; });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));

  /* depth parallax: --p goes 0→1 as the photo hero scrolls out of view (CSS does the layering) */
  const px = document.querySelector('.stage, .hero:not(.hero--plain)');
  if (px && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let pr = 0;
    const setP = () => { pr = 0; const r = px.getBoundingClientRect(), y = Math.min(r.height, Math.max(0, -r.top)); px.style.setProperty('--p', (y / r.height).toFixed(4)); px.style.setProperty('--py', y.toFixed(1) + 'px'); };
    addEventListener('scroll', () => { if (!pr) pr = requestAnimationFrame(setP); }, { passive: true });
    setP();
  }

  /* ==== MOTION A: home sections ==== */
  /* members, regions, reviews, closing band: armed with .ma only when motion is allowed, so no-JS and reduced motion keep the finished page */
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // split an element at its <br>s into masked lines (.ma-l > span); the text itself is unchanged
    const lines = el => {
      const g = [[]];
      [...el.childNodes].forEach(n => n.nodeName === 'BR' ? g.push([]) : g.at(-1).push(n));
      el.replaceChildren(...g.map((ns, j) => { const o = document.createElement('span'), s = document.createElement('span'); s.append(...ns); o.append(s); o.className = 'ma-l'; o.style.setProperty('--j', j); return o; }));
    };
    // .ma-in once in view (or already scrolled past); blocks entering together get a 70ms stagger, capped
    const arm = (els, go) => {
      const io = new IntersectionObserver(es => { let k = 0; es.forEach(e => {
        if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
        e.target.style.setProperty('--d', `${Math.min(k++, 6) * 70}ms`); e.target.classList.add('ma-in'); io.unobserve(e.target); go?.(e.target);
      }); }, { rootMargin: '0px 0px -10% 0px' });
      [...els].forEach(el => { el.classList.add('ma'); io.observe(el); });
    };

    document.querySelectorAll('.members__name, .regs a > span, .close h2').forEach(el => lines(el));
    arm(document.querySelectorAll('.members__list > li, .regs > li, .close__in'));

    const tr = document.getElementById('revs');
    if (tr) arm([tr]); // holds the featured review's rise (site.css rev-in) until it is in view
    const sc = document.querySelector('.revs__score');
    if (sc) {
      sc.querySelectorAll('.revs__stars svg').forEach((s, i) => s.style.setProperty('--i', i));
      arm([sc], () => { // tick the score up once, keeping its decimal places and separator ("5,0")
        const b = sc.querySelector('b'), t = b.textContent, v = parseFloat(t.replace(',', '.')), dp = (t.split(/[.,]/)[1] || '').length, sep = t.includes(',') ? ',' : '.', t0 = performance.now();
        if (!(v > 0)) return;
        const tick = now => { const p = Math.min((now - t0) / 1100, 1); b.textContent = p < 1 ? (v * (1 - (1 - p) ** 3)).toFixed(dp).replace('.', sep) : t; if (p < 1) requestAnimationFrame(tick); };
        tick(t0);
      });
    }
  }
  /* ==== /MOTION A ==== */

  /* ==== MOTION B: page chrome + subpages ==== */
  /* steps, prose, footer: own reveal (children staggered; things that enter together are staggered as a batch) */
  const seen = new IntersectionObserver(es => es.filter(e => e.isIntersecting).forEach((e, k) => {
    e.target.style.setProperty('--k', k); e.target.classList.add('is-in'); seen.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.steps li, .prose, .foot').forEach(el => {
    (el.matches('.foot') ? el.querySelectorAll('.foot__in > *') : [...el.children]).forEach((c, i) => c.style.setProperty('--i', Math.min(i, 5)));
    el.classList.add('mb'); seen.observe(el);
  });
  /* ==== /MOTION B ==== */

  /* the menu marks the page you are on */
  document.querySelectorAll('.menu nav a[href^="/"]').forEach(a => { if (a.pathname === location.pathname) a.setAttribute('aria-current', 'page'); });

  /* light theme: the top pill stays dark while it sits over a photo zone */
  const zones = document.querySelectorAll('.stage, .hero:not(.hero--plain), .close, .revs');
  if (zones.length) {
    const over = new Set(); let io;
    const watch = () => {
      io?.disconnect(); over.clear();
      io = new IntersectionObserver(es => {
        es.forEach(e => (e.isIntersecting ? over.add(e.target) : over.delete(e.target)));
        document.documentElement.classList.toggle('on-photo', over.size > 0);
      }, { rootMargin: `0px 0px -${Math.max(0, innerHeight - 90)}px 0px` }); // the top 90px strip, where the pill lives
      zones.forEach(z => io.observe(z));
    };
    watch(); addEventListener('resize', watch);
  }

  /* Google Ads visitors: the WhatsApp message says so, so the chat shows which leads came from the ads.
     Read from this page's own address only — no cookie, no storage — and the visitor can delete it before sending. */
  if (/[?&](gclid|gbraid|wbraid)=/.test(location.search)) document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="https://wa.me/"]'); if (!a) return;
    const u = new URL(a.href), t = u.searchParams.get('text') || '';
    if (!t.includes('(Google reklamı)')) { u.searchParams.set('text', `${t} (Google reklamı)`); a.href = u.href; }
  }, true);

  /* home dock (phones/tablets): the bottom contact bar steps aside while the closing band or the footer, which carry the same contacts, is on screen */
  const dock = document.querySelector('.dock');
  if (dock) {
    const shown = new Set();
    const io = new IntersectionObserver(es => {
      es.forEach(e => (e.isIntersecting ? shown.add(e.target) : shown.delete(e.target)));
      dock.classList.toggle('is-off', shown.size > 0);
    });
    document.querySelectorAll('.close, .foot').forEach(el => io.observe(el));
  }
})();

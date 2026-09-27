/* Securis — home filmstrip. One spring-animated x drives the strip, the
   descriptions and the background words, so all three travel together. */
(() => {
  const ITEMS = JSON.parse(document.getElementById('slides').textContent);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const stage = document.querySelector('.stage'), track = $('track'), bg = $('bg'), subj = $('subj'), descs = $('descs'), words = $('words');
  const last = ITEMS.length - 1;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const pad2 = n => String(n).padStart(2, '0');

  ITEMS.forEach((it, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'card'; b.dataset.i = i;
    b.setAttribute('aria-label', it.t.replace('\n', ' '));
    b.innerHTML = `<img src="${it.card}" alt="" draggable="false"${i > 2 ? ' loading="lazy"' : ''}>`;
    b.addEventListener('click', e => { if (!suppressClick || e.detail === 0) go(i); }); // detail 0 = keyboard, never a swipe
    track.appendChild(b);
    descs.insertAdjacentHTML('beforeend', `<div class="desc" aria-hidden="true"><b>${pad2(i + 1)} — ${it.word}</b><p><span>${it.d}</span></p></div>`);
    words.insertAdjacentHTML('beforeend', `<span lang="en">${it.word}</span>`);
  });
  const cards = [...track.children], descEls = [...descs.children], wordEls = [...words.children];
  $('tot').textContent = pad2(ITEMS.length);
  $('thumb').style.width = `${100 / ITEMS.length}%`;

  /* geometry measured off the stage; every size is a ratio of it */
  let W = 0, H = 0, fullH = 0, cardW = 0, step = 0, pad = 0, descW = 0;
  function measure() {
    W = stage.clientWidth; H = stage.clientHeight;
    fullH = clamp(H * 0.27, 110, 380); cardW = fullH * 0.75;
    const gap = Math.max(5, Math.round(cardW * 0.04)); step = cardW + gap;
    pad = Math.max(18, Math.round(W * 0.024));
    descW = Math.min(W - pad * 2, 660);
    const label = Math.max(13, Math.round(Math.min(H * 0.0135, 15)));
    const s = stage.style;
    s.setProperty('--fullH', fullH + 'px'); s.setProperty('--cardW', cardW + 'px'); s.setProperty('--gap', gap + 'px');
    s.setProperty('--pad', pad + 'px'); s.setProperty('--label', label + 'px'); s.setProperty('--descW', descW + 'px');
    s.setProperty('--title', Math.max(40, Math.round(Math.min(H * 0.095, W * 0.13))) + 'px');
    x = xFor(index); vel = 0; paint();
    if (morph) morph.resize();
  }
  // phones: the focused card sits on the left gutter so its description can sit right under it
  const anchor = () => (W < 700 ? pad + cardW / 2 : W / 2);
  const xFor = i => anchor() - (i * step + cardW / 2);

  let index = 0, x = 0, vel = 0, target = 0, raf = 0;
  function paint() {
    track.style.transform = `translate3d(${x}px,0,0)`;
    const p = clamp((anchor() - cardW / 2 - x) / step, -0.5, last + 0.5);
    descs.style.transform = `translate3d(${Math.min(anchor() - cardW / 2, W - pad - descW) - p * descW}px,0,0)`;
    const lo = clamp(Math.floor(p), 0, last), hi = clamp(lo + 1, 0, last), f = clamp(p - lo, 0, 1);
    const wx = wordEls[lo].offsetLeft + (wordEls[hi].offsetLeft - wordEls[lo].offsetLeft) * f;
    words.style.transform = `translate3d(${pad - wx * 0.9}px,0,0)`;
  }
  function springTo(t) {
    target = t;
    if (reduce) { x = t; vel = 0; paint(); return; }
    cancelAnimationFrame(raf);
    let prev = performance.now();
    const tick = now => {
      let dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      while (dt > 0) { const h = Math.min(dt, 1 / 240); vel += ((-260 * (x - target) - 34 * vel) / 0.9) * h; x += vel * h; dt -= h; }
      paint();
      if (Math.abs(x - target) > 0.3 || Math.abs(vel) > 2) raf = requestAnimationFrame(tick); else { x = target; vel = 0; paint(); }
    };
    raf = requestAnimationFrame(tick);
  }

  const titleEl = $('title');
  let lastUser = 0; // any hand-driven step restarts the autoplay clock
  function go(next, auto = false) {
    if (!auto) lastUser = performance.now();
    titleEl.setAttribute('aria-live', auto ? 'off' : 'polite'); // announce only what the visitor asked for
    next = clamp(next, 0, last);
    const changed = next !== index, dir = auto || next > index ? 1 : -1; // autoplay only ever steps forward, the wrap included
    index = next; springTo(xFor(index));
    if (changed || !bg.firstChild) render(dir);
  }
  function render(dir = 1) {
    const it = ITEMS[index];
    cards.forEach((c, i) => c.setAttribute('aria-current', i === index));
    descEls.forEach((d, i) => d.classList.toggle('is-on', i === index));
    wordEls.forEach((w, i) => w.classList.toggle('is-on', i === index));
    $('title').innerHTML = it.t.split('\n').map(l => `<span><span>${l}</span></span>`).join(' '); // the space keeps screen readers from saying "IPKamera"
    const credit = $('credit'); credit.innerHTML = `<span>${it.credit}</span>`; credit.style.animation = 'none'; credit.offsetWidth; credit.style.animation = '';
    $('meta').innerHTML = it.meta.map(m => `<span>${m}</span>`).join('');
    $('more').href = `/hizmetler/${it.slug}/`;
    $('cur').textContent = pad2(index + 1);
    $('thumb').style.left = `${(index / ITEMS.length) * 100}%`;
    if (morph) morph.show(index, dir); else crossfade(it);
  }
  /* depth layers: a slide with a clean plate shows the plate behind a cut-out subject that parallaxes on its own;
     a slide with a cutout but no plate keeps its photo and the cutout stays glued to it (is-flat), still over the words */
  const sepOf = it => !!(it.fg && it.plate);
  function crossfade(it) {
    const layer = document.createElement('div');
    layer.className = 'bg__layer';
    layer.innerHTML = `<img src="${sepOf(it) ? it.plate : it.bg}" alt=""><i class="c" style="background:${it.accent}"></i><i class="m" style="background:${it.accent}"></i>`;
    const cut = document.createElement('div');
    cut.className = 'subj__layer' + (sepOf(it) ? '' : ' is-flat');
    if (it.fg && !document.documentElement.classList.contains('low')) cut.innerHTML = `<div class="subj__cut" style="-webkit-mask-image:url(${it.fg});mask-image:url(${it.fg})"><img src="${it.fg}" alt=""><i class="c" style="background:${it.accent}"></i><i class="m" style="background:${it.accent}"></i><i class="w"></i></div>`;
    for (const [box, el] of [[bg, layer], [subj, cut]]) {
      box.appendChild(el); el.offsetWidth; el.classList.add('is-on');
      [...box.children].slice(0, -1).forEach(old => setTimeout(() => old.remove(), reduce ? 0 : 800));
    }
  }

  /* drag */
  let dragging = false, suppressClick = false, startX = 0, startTrack = 0, lastX = 0, lastT = 0, v = 0, downCard = null;
  track.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    cancelAnimationFrame(raf);
    dragging = true; suppressClick = false; startX = lastX = e.clientX; startTrack = x; lastT = e.timeStamp; v = 0;
    downCard = e.target.closest('.card');
    track.setPointerCapture(e.pointerId); track.classList.add('is-drag');
  });
  track.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) suppressClick = true;
    let raw = startTrack + dx;
    const min = xFor(last), max = xFor(0);
    if (raw > max) raw = max + (raw - max) * 0.08; else if (raw < min) raw = min + (raw - min) * 0.08;
    const dt = Math.max(1, e.timeStamp - lastT);
    v = ((e.clientX - lastX) / dt) * 1000; lastX = e.clientX; lastT = e.timeStamp;
    x = raw; paint();
  });
  const endDrag = e => {
    if (!dragging) return;
    dragging = false; track.classList.remove('is-drag');
    if (!suppressClick) { go(e.type === 'pointerup' && downCard ? +downCard.dataset.i : index); return; } // a cancel is the browser taking a vertical scroll, not a tap
    // one card per flick; a long drag moves as many cards as it covered — velocity never adds extra cards
    const dist = startTrack - x, cards = Math.round(dist / step);
    go(index + (cards !== 0 ? cards : (Math.abs(dist) > Math.min(40, step * 0.2) || Math.abs(v) > 400 ? Math.sign(dist || -v) : 0)));
    // suppressClick stays set until the next pointerdown: phones send the "click" for a swipe well after pointerup
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  /* wheel / trackpad; hands the page back at either end */
  let acc = 0, until = 0;
  stage.addEventListener('wheel', e => {
    // only horizontal gestures step the strip; a vertical wheel always scrolls the page
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    const delta = e.deltaX;
    if ((delta > 0 && index === last) || (delta < 0 && index === 0)) { acc = 0; return; }
    e.preventDefault();
    if (e.timeStamp < until) { until = e.timeStamp + 250; return; } // trackpad momentum keeps firing: one gesture = one step, unlock after 250ms of quiet
    acc += delta;
    if (Math.abs(acc) < 60) return;
    go(index + Math.sign(acc)); acc = 0; until = e.timeStamp + 420;
  }, { passive: false });

  stage.addEventListener('keydown', e => {
    const k = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: last }[e.key];
    if (k === undefined) return;
    e.preventDefault(); go(k);
  });

  /* autoplay, paused on hover / focus / drag / hidden tab */
  let hover = false, focused = false, held = false; // hover and focus pause separately: the mouse leaving never un-pauses a keyboard user
  const pauseBtn = $('pause');
  if (reduce) pauseBtn.hidden = true;
  pauseBtn.addEventListener('click', () => { held = !held; pauseBtn.setAttribute('aria-pressed', held); });
  stage.addEventListener('pointerenter', () => { hover = true; });
  stage.addEventListener('pointerleave', () => { hover = false; });
  stage.addEventListener('focusin', () => { focused = true; });
  stage.addEventListener('focusout', () => { focused = false; });
  if (!reduce) setInterval(() => { if (!held && !hover && !focused && !dragging && !document.hidden && scrollY < innerHeight * 0.5 && performance.now() - lastUser > 4900) go(index === last ? 0 : index + 1, true); }, 5000); // 1.5s dissolve + 2.5s hold

  /* backdrop: WebGL "noise morph". An fbm field, biased by the incoming frame's luminance, decides when each
     pixel flips; the two frames drift vertically against each other; quintic ease. One persistent .c/.m grade
     pair sits over the canvas and eases to the new accent alongside. No WebGL, a shader error, a failed image
     or a lost context hands the backdrop back to crossfade().
     Depth: the same context draws a second pass first — the cut-out subjects, with the same cover/zoom, the same
     noise mask and the photo's accent grade + stage wash baked in — which is copied into the .subj canvas that sits
     over the outline words. A subject without a clean plate is sampled where its photo is now (it tracks .bg's
     parallax), so it never doubles; one with a plate sits in .subj and parallaxes at the strip's speed. */
  const DUR = 1500, KB = 6000; // dissolve; slow zoom 1.42 → 1.28, the same as the CSS layer
  const zoomAt = t => 1.42 - 0.14 * clamp(t / KB, 0, 1);
  const ease = t => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2);
  const bez = x => { let lo = 0, hi = 1, t = x; for (let k = 0; k < 20; k++) { t = (lo + hi) / 2; if (3 * (1 - t) ** 2 * t * .83 + 3 * (1 - t) * t * t * .17 + t ** 3 < x) lo = t; else hi = t; } return 3 * (1 - t) * t * t + t ** 3; }; // the grade's CSS cubic-bezier(.83, 0, .17, 1)
  const rgb = h => [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16) / 255);
  const VERT = 'attribute vec2 a_position;varying vec2 v_uv;void main(){v_uv=a_position*0.5+0.5;gl_Position=vec4(a_position,0.0,1.0);}';
  const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D u_from, u_to, u_cutFrom, u_cutTo;
uniform float u_progress, u_fromA, u_toA, u_fromZ, u_toZ, u_dir, u_pass, u_sepFrom, u_sepTo, u_accT;
uniform vec2 u_res, u_shift;
uniform vec3 u_accA, u_accB;
varying vec2 v_uv;
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 a0 = x - floor(x + 0.5);
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float fbm(vec2 v) { float s = 0.0, a = 0.5; for (int k = 0; k < 5; k++) { s += a * snoise(v); v *= 2.0; a *= 0.5; } return s; }
vec2 cover(vec2 uv, float ia, float z) { // object-fit: cover, then scale(z) about the centre; mirror past the edges
  float ca = u_res.x / u_res.y;
  uv = (uv - 0.5) * (ca > ia ? vec2(1.0, ia / ca) : vec2(ca / ia, 1.0)) / z + 0.5;
  return 1.0 - abs(1.0 - mod(uv, 2.0));
}
// what the stage shows over the photo, as CSS composites it (sRGB): .c colour blend, .m multiply at .55, .wash
float lum(vec3 c) { return dot(c, vec3(0.3, 0.59, 0.11)); }
vec3 clipColor(vec3 c) {
  float l = lum(c), n = min(min(c.r, c.g), c.b), x = max(max(c.r, c.g), c.b);
  if (n < 0.0) c = l + (c - l) * l / (l - n);
  if (x > 1.0) c = l + (c - l) * (1.0 - l) / (x - l);
  return c;
}
float wash(float y) { return y < 0.38 ? mix(0.55, 0.32, y / 0.38) : y < 0.62 ? mix(0.32, 0.36, (y - 0.38) / 0.24) : mix(0.36, 0.75, (y - 0.62) / 0.38); }
vec4 shade(vec4 f) {
  vec3 acc = mix(u_accA, u_accB, u_accT);
  vec3 c = clipColor(acc + (lum(f.rgb) - lum(acc)));
  c = mix(c, c * acc, 0.55) * (1.0 - wash(1.0 - v_uv.y));
  return vec4(c * f.a, f.a); // premultiplied
}
void main() {
  // cut pass: where on the photo this subject pixel sits now (.bg has moved .6 of the scroll further and scaled)
  vec2 P = u_pass > 0.5 ? vec2(0.5 + (v_uv.x - 0.5) / u_shift.y, 0.5 + (v_uv.y - 0.5 + u_shift.x) / u_shift.y) : v_uv;
  vec2 qa = u_sepFrom > 0.5 ? v_uv : P, qb = u_sepTo > 0.5 ? v_uv : P;
  if (u_progress >= 1.0) { // settled: the slow zoom costs one lookup
    gl_FragColor = u_pass > 0.5 ? shade(texture2D(u_cutTo, cover(qb, u_toA, u_toZ))) : texture2D(u_to, cover(v_uv, u_toA, u_toZ));
    return;
  }
  vec4 to = texture2D(u_to, cover(P, u_toA, u_toZ));
  const float E = 0.15, D = 0.5;
  float adj = u_progress * (1.0 + 2.0 * E) - E;
  float n = fbm(P * 3.5 + vec2(0.0, u_progress * u_dir)) * 0.5 + 0.5;
  n = smoothstep(0.0, 2.0, length(to.rgb) + n);
  float k = 1.0 - smoothstep(adj - E, adj + E, n);
  vec2 da = vec2(0.0, n * u_progress * D * u_dir), db = vec2(0.0, -n * (1.0 - u_progress) * 0.5 * D * u_dir);
  if (u_pass > 0.5) gl_FragColor = mix(shade(texture2D(u_cutFrom, cover(qa + da, u_fromA, u_fromZ))), shade(texture2D(u_cutTo, cover(qb + db, u_toA, u_toZ))), k);
  else gl_FragColor = mix(texture2D(u_from, cover(v_uv + da, u_fromA, u_fromZ)), texture2D(u_to, cover(v_uv + db, u_toA, u_toZ)), k);
}`;
  function createMorph() {
    if (document.documentElement.classList.contains('low')) return null; // hafif mod: DOM cross-fade only
    const cv = document.createElement('canvas'), fcv = document.createElement('canvas');
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    const fx = fcv.getContext('2d');
    if (!gl || !fx) return null;
    const prog = gl.createProgram();
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); gl.attachShader(prog, s); return gl.getShaderParameter(s, gl.COMPILE_STATUS); };
    if (!sh(gl.VERTEX_SHADER, VERT) || !sh(gl.FRAGMENT_SHADER, FRAG)) return null;
    gl.bindAttribLocation(prog, 0, 'a_position'); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const u = {};
    for (const n of ['from', 'to', 'cutFrom', 'cutTo', 'progress', 'res', 'fromA', 'toA', 'fromZ', 'toZ', 'dir', 'pass', 'sepFrom', 'sepTo', 'accT', 'accA', 'accB', 'shift']) u[n] = gl.getUniformLocation(prog, 'u_' + n);
    gl.uniform1i(u.from, 0); gl.uniform1i(u.to, 1); gl.uniform1i(u.cutFrom, 2); gl.uniform1i(u.cutTo, 3);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const upload = (img, fmt) => {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      for (const [k, v] of [[gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE], [gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
      if (img) gl.texImage2D(gl.TEXTURE_2D, 0, fmt, fmt, gl.UNSIGNED_BYTE, img); else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
      return t;
    };
    const none = upload(null); // a slide without a cutout samples this clear pixel

    const tex = [], cut = [], asked = [], cutAsked = [], at = []; // at[i]: when slide i came on, drives its zoom
    const grade = ['c', 'm'].map(k => { const i = document.createElement('i'); i.className = k; return i; });
    let cur = -1, prev = -1, t0 = 0, dir = 1, want = 0, wantDir = 1, raf = 0, onScreen = true, dead = false, cutClear = false;
    let accA = [0, 0, 0], accB = [0, 0, 0], accT0 = -Infinity;

    function fail() { // hand the backdrop back to the DOM cross-fade, for good
      if (dead) return;
      dead = true; cancelAnimationFrame(raf); morph = null; fcv.remove(); crossfade(ITEMS[index]);
    }
    const decode = src => { const img = new Image(); img.src = src; return img.decode().then(() => img); };
    function loadCut(i) { // the cutout of a slide that keeps its photo: after the first frame, never blocks it
      if (cutAsked[i] || !ITEMS[i].fg) return;
      cutAsked[i] = true;
      decode(ITEMS[i].fg).then(img => { if (dead) return; cut[i] = upload(img, gl.RGBA); kick(); }, () => {});
    }
    function load(i) {
      if (asked[i]) return;
      asked[i] = true;
      const it = ITEMS[i];
      // plate and cutout arrive together, or not at all (the photo alone never doubles its subject)
      const sep = sepOf(it) ? Promise.all([decode(it.plate), decode(it.fg)]).catch(() => null) : Promise.resolve(null);
      sep.then(pair => (pair ? pair : decode(it.bg).then(img => [img]))).then(([img, fg]) => {
        if (dead) return;
        tex[i] = { t: upload(img, gl.RGB), a: img.naturalWidth / img.naturalHeight, sep: !!fg };
        if (fg) { cut[i] = upload(fg, gl.RGBA); cutAsked[i] = true; } else if (cur >= 0) loadCut(i);
        if (i === want) start();
      }, fail);
    }
    const scrolled = () => { if (reduce) return 0; const r = stage.getBoundingClientRect(); return clamp(-r.top, 0, r.height); };
    function draw(now) {
      const q = prev < 0 ? 1 : clamp((now - t0) / DUR, 0, 1), from = prev < 0 ? cur : prev;
      const A = tex[from], B = tex[cur], ca = cut[from] || none, cb = cut[cur] || none;
      gl.uniform1f(u.progress, ease(q)); gl.uniform2f(u.res, cv.width, cv.height); gl.uniform1f(u.dir, dir);
      gl.uniform1f(u.fromA, A.a); gl.uniform1f(u.toA, B.a);
      gl.uniform1f(u.fromZ, zoomAt(now - at[from])); gl.uniform1f(u.toZ, zoomAt(now - at[cur]));
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A.t);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, B.t);
      if (ca === none && cb === none) { if (!cutClear) { fx.clearRect(0, 0, fcv.width, fcv.height); cutClear = true; } }
      else { // cut pass → .subj canvas, then the backdrop pass overwrites the drawing buffer
        const py = scrolled(), h = stage.clientHeight || 1;
        gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, ca);
        gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, cb);
        gl.uniform1f(u.pass, 1); gl.uniform1f(u.sepFrom, A.sep ? 1 : 0); gl.uniform1f(u.sepTo, B.sep ? 1 : 0);
        gl.uniform2f(u.shift, 0.6 * py / h, 1 + 0.06 * py / h);
        gl.uniform3fv(u.accA, accA); gl.uniform3fv(u.accB, accB); gl.uniform1f(u.accT, reduce ? 1 : bez(clamp((now - accT0) / DUR, 0, 1)));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        fx.globalCompositeOperation = 'copy'; fx.drawImage(cv, 0, 0); cutClear = false;
      }
      gl.uniform1f(u.pass, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (q >= 1) prev = -1;
      return q < 1 || now - at[cur] < KB || (!reduce && now - accT0 < DUR); // still moving?
    }
    const frame = now => { raf = 0; if (draw(now)) kick(); };
    const kick = () => { if (!raf && cur >= 0 && onScreen && !document.hidden && !dead) raf = requestAnimationFrame(frame); };
    function start() {
      const now = performance.now(), i = want, first = cur < 0;
      if (i === cur && prev < 0) return;
      // cut in mid-dissolve: carry on from whichever frame covers most of the screen right now
      const shown = prev >= 0 && now - t0 < DUR / 2 ? prev : cur;
      prev = first || reduce || shown === i ? -1 : shown;
      if (!first && prev >= 0) at[i] = now; else if (at[i] === undefined) at[i] = -Infinity; // the first frame holds at 1.28 like the server-rendered img
      cur = i; dir = wantDir; t0 = now;
      // the grade eases from wherever it is now, as the CSS transition on .bg > i does
      const t = reduce ? 1 : bez(clamp((now - accT0) / DUR, 0, 1));
      accA = first ? rgb(ITEMS[i].accent) : accA.map((v, k) => v + (accB[k] - v) * t); accB = rgb(ITEMS[i].accent); accT0 = first ? -Infinity : now;
      grade.forEach(g => { g.style.backgroundColor = ITEMS[i].accent; });
      if (first) { // the server-rendered img stays on top until this very frame is drawn
        bg.prepend(cv, ...grade); subj.prepend(fcv); resize(); draw(now);
        bg.querySelectorAll('.bg__layer').forEach(l => l.remove());
        (window.requestIdleCallback || setTimeout)(() => ITEMS.forEach((_, j) => { load(j); loadCut(j); }));
      }
      kick();
    }
    function resize() {
      // pixel budget: a retina desktop no longer shades 5M px per pass, ~2.4M at most
      const r = Math.min(devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.25 : 2, Math.sqrt(2.4e6 / Math.max(1, bg.clientWidth * bg.clientHeight)));
      const w = Math.round(bg.clientWidth * r), h = Math.round(bg.clientHeight * r);
      if (w === cv.width && h === cv.height) return;
      cv.width = fcv.width = w; cv.height = fcv.height = h; gl.viewport(0, 0, w, h); cutClear = false;
      if (cur >= 0) draw(performance.now()); // same task as the resize, so no blank frame
    }
    cv.addEventListener('webglcontextlost', fail);
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; kick(); }).observe(stage);
    document.addEventListener('visibilitychange', kick);
    // a cutout glued to its photo follows .bg's parallax, so it redraws while the page scrolls (one lookup)
    addEventListener('scroll', () => { if (cur >= 0 && ((cut[cur] && !tex[cur].sep) || (prev >= 0 && cut[prev] && !tex[prev].sep))) kick(); }, { passive: true });
    return {
      show(i, d) { want = i; wantDir = d; if (tex[i]) start(); else load(i); },
      resize() { if (cur >= 0) resize(); },
      kill: fail,
    };
  }
  let morph = createMorph();
  addEventListener('sec:low', () => morph?.kill());

  new ResizeObserver(measure).observe(stage);
  measure(); render();
})();

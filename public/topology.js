/* Securis — topology field background (port of the "Nexus topology" Three.js scene to plain canvas 2D).
   120 nodes on a Fibonacci sphere, links between near neighbours, slow rotation, pulsing nodes.
   Sits behind the page on a fixed canvas; photo zones (stage, heroes, closing band) cover it. */
(() => {
  const cv = document.querySelector('.topo');
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d');
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // phones: fewer nodes, 1x canvas, 30fps and fainter ink, so it stays a texture behind the copy, not noise on it
  const small = innerWidth < 700 || matchMedia('(pointer: coarse)').matches;
  const B = 6, LINE_MAX = 0.52, DOT_MAX = 1.4; // ink buckets: each frame is 2×B draw calls
  let LINE_INK = [], DOT_INK = [];
  const N = small ? 70 : 120, LINK = small ? 0.6 : 0.45, CAM = 650, FOG_NEAR = 300, FOG_FAR = 950;
  const nodes = [];
  for (let i = 0; i < N; i++) {
    const phi = Math.acos(-1 + (2 * i) / N), theta = Math.sqrt(N * Math.PI) * phi;
    nodes.push({ x: Math.cos(theta) * Math.sin(phi), y: Math.sin(theta) * Math.sin(phi), z: Math.cos(phi),
      size: Math.random() * 1.5 + 1, speed: Math.random() * 0.02 + 0.015, off: Math.random() * Math.PI * 2 });
  }
  const links = [];
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
    if (d < LINK) links.push([i, j, (1 - d / LINK) * 0.8 * 0.65]);
  }

  /* ink follows the theme: white on the dark ground, near-black on the light one */
  let rgb = '255,255,255', dark = true, k = 0.5;
  const readTheme = () => {
    ctx.fillStyle = getComputedStyle(root).getPropertyValue('--fg').trim() || '#fff';
    const h = ctx.fillStyle; // normalised to #rrggbb
    rgb = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',');
    dark = root.dataset.theme !== 'light';
    k = (dark ? 0.5 : 0.42) * (small ? 0.5 : 1);
    LINE_INK = Array.from({ length: B }, (_, b) => `rgba(${rgb},${(((b + 0.5) / B) * LINE_MAX * k).toFixed(3)})`);
    DOT_INK = Array.from({ length: B }, (_, b) => `rgba(${rgb},${(((b + 0.5) / B) * DOT_MAX * k).toFixed(3)})`);
  };

  let W = 0, H = 0, R = 0, cx = 0, cy = 0, f = 0;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, small ? 1.5 : 2);
    // the canvas is sized to the large viewport (100lvh), so a phone's address bar sliding in and out never reallocates it mid-scroll
    if (W === cv.clientWidth && H === cv.clientHeight) return;
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = W > 768 ? 380 : 200;
    cx = W > 768 ? W * 0.2 : 0; cy = W > 768 ? -H * 0.05 : -H * 0.2; // same placement as the original scene
    f = (H / 2) / Math.tan(Math.PI / 6); // 60° vertical fov
    readTheme();
  };

  /* photo zones are opaque; skip frames while one fills the viewport */
  const zones = [...document.querySelectorAll('.stage, .hero:not(.hero--plain), .close, .pj__stage')];
  const seen = new Map();
  const io = new IntersectionObserver(es => es.forEach(e => seen.set(e.target, e.intersectionRect.height)), { threshold: Array.from({ length: 51 }, (_, i) => i / 50) });
  zones.forEach(z => io.observe(z));
  const covered = () => { for (const h of seen.values()) if (h >= innerHeight - 2) return true; return false; };

  const P = new Float32Array(N * 4); // screen x, y, depth, fog-alpha
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const ry = t * 0.0018, rx = 0.2, rz = t * 0.0006;
    const sy = Math.sin(ry), cyr = Math.cos(ry), sx = Math.sin(rx), cxr = Math.cos(rx), sz = Math.sin(rz), czr = Math.cos(rz);
    const ox = W / 2 + cx, oy = H / 2 - cy;
    if (dark) {
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, R * 1.4);
      g.addColorStop(0, `rgba(${rgb},.07)`); g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    for (let i = 0; i < N; i++) {
      const n = nodes[i];
      // Euler XYZ (three.js order): v' = Rx · Ry · Rz · v
      let x = n.x * czr - n.y * sz, y = n.x * sz + n.y * czr, z = n.z;
      const x2 = x * cyr + z * sy; z = -x * sy + z * cyr; x = x2;
      const y3 = y * cxr - z * sx; z = y * sx + z * cxr; y = y3;
      const wx = x * R + cx, wy = y * R + cy, wz = z * R, d = CAM - wz, s = f / d;
      P[i * 4] = W / 2 + wx * s; P[i * 4 + 1] = H / 2 - wy * s; P[i * 4 + 2] = s;
      P[i * 4 + 3] = 1 - Math.min(1, Math.max(0, (d - FOG_NEAR) / (FOG_FAR - FOG_NEAR)));
    }
    ctx.lineWidth = 1;
    for (let b = 0; b < B; b++) { ctx.strokeStyle = LINE_INK[b]; ctx.beginPath(); let any = false;
      for (const [i, j, a] of links) {
        const q = a / 0.52 * (P[i * 4 + 3] + P[j * 4 + 3]) / 2; // 0..1 of the brightest possible line
        if (q < 0.02 || Math.min(B - 1, q * B | 0) !== b) continue;
        ctx.moveTo(P[i * 4], P[i * 4 + 1]); ctx.lineTo(P[j * 4], P[j * 4 + 1]); any = true;
      }
      if (any) ctx.stroke();
    }
    for (let b = 0; b < B; b++) { ctx.fillStyle = DOT_INK[b]; ctx.beginPath(); let any = false;
      for (let i = 0; i < N; i++) {
        const n = nodes[i], pulse = (Math.sin(t * n.speed + n.off) + 1) / 2, q = (0.4 + pulse * 0.6) * P[i * 4 + 3];
        if (Math.min(B - 1, q * B | 0) !== b) continue;
        const r = Math.max((n.size + pulse * 1.8) * P[i * 4 + 2], 0.6), x = P[i * 4], y = P[i * 4 + 1];
        ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); any = true;
      }
      if (any) ctx.fill();
    }
  }

  addEventListener('resize', resize);
  resize();

  if (reduce) { // one still frame, redrawn when the size or the theme's ink changes
    const still = () => draw(120);
    new MutationObserver(() => { readTheme(); still(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    still(); addEventListener('resize', still); return;
  }
  new MutationObserver(readTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  const t0 = performance.now();
  const loop = now => {
    if (!covered()) draw((now - t0) / (1000 / 60)); // time in 60fps frames, as the original counted
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();

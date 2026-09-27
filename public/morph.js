/* Securis — WebGL "morph dissolve" between photos, generic form of the home hero's backdrop (carousel.js).
   An fbm noise field, biased by the incoming frame's luminance, decides when each pixel flips; the two frames
   drift vertically against each other; quintic ease.

   const m = createMorph(canvas, urls, { duration, zoom: [from, to], zoomMs })
   m.show(i, dir)  dissolve to urls[i]; dir +1 forward, -1 back (the drift direction)
   m.resize()      re-measure (also automatic through a ResizeObserver)

   The canvas fills a positioned box and stays invisible until its first frame is drawn, so a server-rendered <img>
   under it shows until then. Frames only run while a dissolve or the slow zoom is moving, on screen, in a visible tab.
   No WebGL, a shader error, a failed image or a lost context: a DOM cross-fade of <img>s inserted before the canvas.
   prefers-reduced-motion: cuts, no zoom. */
window.createMorph = (cv, urls, { duration = 1500, zoom = [1, 1], zoomMs = 6000 } = {}) => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const ease = t => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2);
  const zoomAt = t => (reduce ? zoom[1] : zoom[0] + (zoom[1] - zoom[0]) * clamp(t / zoomMs, 0, 1));
  const VERT = 'attribute vec2 a_position;varying vec2 v_uv;void main(){v_uv=a_position*0.5+0.5;gl_Position=vec4(a_position,0.0,1.0);}';
  const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D u_from, u_to;
uniform float u_progress, u_fromA, u_toA, u_fromZ, u_toZ, u_dir;
uniform vec2 u_res;
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
void main() {
  vec4 to = texture2D(u_to, cover(v_uv, u_toA, u_toZ));
  if (u_progress >= 1.0) { gl_FragColor = to; return; } // settled: the slow zoom costs one lookup
  const float E = 0.15, D = 0.5;
  float adj = u_progress * (1.0 + 2.0 * E) - E;
  float n = fbm(v_uv * 3.5 + vec2(0.0, u_progress * u_dir)) * 0.5 + 0.5;
  n = smoothstep(0.0, 2.0, length(to.rgb) + n);
  float k = 1.0 - smoothstep(adj - E, adj + E, n);
  vec4 a = texture2D(u_from, cover(v_uv + vec2(0.0, n * u_progress * D * u_dir), u_fromA, u_fromZ));
  vec4 b = texture2D(u_to, cover(v_uv + vec2(0.0, -n * (1.0 - u_progress) * 0.5 * D * u_dir), u_toA, u_toZ));
  gl_FragColor = mix(a, b, k);
}`;

  let gl = null, u = {}, dead = false, want = 0, wantDir = 1;
  /* fallback: plain <img> layers cross-fading in front of the (hidden) canvas */
  const layers = [];
  function fade(i) {
    const img = new Image();
    img.src = urls[i]; img.alt = ''; img.decoding = 'async';
    img.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(${zoom[1]});opacity:0;transition:opacity ${reduce ? 0 : 0.7}s`;
    cv.before(img); layers.push(img); img.offsetWidth; img.style.opacity = 1;
    layers.splice(0, layers.length - 1).forEach(old => setTimeout(() => old.remove(), reduce ? 0 : 800));
  }
  function fail() { // hand the backdrop to the DOM cross-fade, for good
    if (dead) return;
    dead = true; cancelAnimationFrame(raf); cv.hidden = true; fade(want);
  }

  try {
    gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false });
    const prog = gl.createProgram();
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); gl.attachShader(prog, s); return gl.getShaderParameter(s, gl.COMPILE_STATUS); };
    if (!sh(gl.VERTEX_SHADER, VERT) || !sh(gl.FRAGMENT_SHADER, FRAG)) throw 0;
    gl.bindAttribLocation(prog, 0, 'a_position'); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw 0;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    for (const n of ['from', 'to', 'progress', 'res', 'fromA', 'toA', 'fromZ', 'toZ', 'dir']) u[n] = gl.getUniformLocation(prog, 'u_' + n);
    gl.uniform1i(u.from, 0); gl.uniform1i(u.to, 1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  } catch (e) { dead = true; cv.hidden = true; }

  const tex = new Map(), asked = new Set(), at = []; // textures per URL; at[i]: when frame i came on, drives its zoom
  let cur = -1, prev = -1, t0 = 0, dir = 1, raf = 0, onScreen = true;
  const T = i => tex.get(urls[i]);
  cv.style.visibility = 'hidden'; // until the first frame is drawn

  function load(i) {
    const url = urls[i];
    if (dead || asked.has(url)) return;
    asked.add(url);
    const img = new Image(); img.src = url;
    img.decode().then(() => {
      if (dead) return;
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      for (const [k, v] of [[gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE], [gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      tex.set(url, { t, a: img.naturalWidth / img.naturalHeight });
      if (urls[want] === url) start();
    }, fail);
  }
  function draw(now) {
    const q = prev < 0 ? 1 : clamp((now - t0) / duration, 0, 1), from = prev < 0 ? cur : prev;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, T(from).t);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, T(cur).t);
    gl.uniform1f(u.progress, ease(q)); gl.uniform2f(u.res, cv.width, cv.height); gl.uniform1f(u.dir, dir);
    gl.uniform1f(u.fromA, T(from).a); gl.uniform1f(u.toA, T(cur).a);
    gl.uniform1f(u.fromZ, zoomAt(now - at[from])); gl.uniform1f(u.toZ, zoomAt(now - at[cur]));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    cv.style.visibility = '';
    if (q >= 1) prev = -1;
    return q < 1 || (!reduce && now - at[cur] < zoomMs); // still moving?
  }
  const frame = now => { raf = 0; if (draw(now)) kick(); };
  const kick = () => { if (!raf && cur >= 0 && onScreen && !document.hidden && !dead) raf = requestAnimationFrame(frame); };
  function start() {
    const now = performance.now(), i = want, first = cur < 0;
    if (i === cur && prev < 0) return;
    // cut in mid-dissolve: carry on from whichever frame covers most of the screen right now
    const shown = prev >= 0 && now - t0 < duration / 2 ? prev : cur;
    const same = shown >= 0 && urls[shown] === urls[i]; // same photo: nothing to dissolve, keep its zoom going
    prev = first || reduce || same ? -1 : shown;
    at[i] = same ? at[shown] : first ? -Infinity : now; // the first frame holds at the end of its zoom
    cur = i; dir = wantDir; t0 = now;
    if (first) resize();
    draw(now); kick();
    load((i + 1) % urls.length); // warm the next one
  }
  function resize() {
    if (dead) return;
    const r = Math.min(devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.5 : 2);
    const w = Math.round(cv.clientWidth * r), h = Math.round(cv.clientHeight * r);
    if (!w || !h || (w === cv.width && h === cv.height)) return;
    cv.width = w; cv.height = h; gl.viewport(0, 0, w, h);
    if (cur >= 0) draw(performance.now()); // same task as the resize, so no blank frame
  }
  cv.addEventListener('webglcontextlost', fail);
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; kick(); }).observe(cv);
  new ResizeObserver(resize).observe(cv);
  document.addEventListener('visibilitychange', kick);

  return {
    show(i, d = 1) {
      want = i; wantDir = d;
      if (dead) fade(i); else if (T(i)) start(); else load(i);
    },
    resize,
  };
};

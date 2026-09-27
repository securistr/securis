// Securis — static site generator (zero dependencies).
// node build.mjs  →  dist/   (URL structure identical to the live site)
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const J = f => JSON.parse(readFileSync(new URL(`./data/${f}.json`, import.meta.url), 'utf8'));
const site = J('site'), hizmetler = J('hizmetler'), bolgeler = J('bolgeler'), anasayfa = J('anasayfa'), gizlilik = J('gizlilik'), reviews = J('reviews');
const STARS = Array(5).fill('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z"/></svg>').join('');
const OUT = new URL('./dist/', import.meta.url);

/* ---------- visual data per service (the world's accents + real/composited photos) ---------- */
const SVC = {
  'ip-kamera-sistemleri': { img: 'kamera.jpg', accent: '#c2410c', label: 'IP KAMERA', meta: ['KÖR NOKTA ANALİZİ', 'TEMİZ KABLOLAMA', 'CEPTEN İZLEME'], credit: 'DAHUA · HIKVISION · MILESIGHT', brands: 'Dahua, Hikvision ve Milesight' },
  'nvr-depolama': { img: 'nvr.jpg', accent: '#7c3aed', label: 'NVR · NAS', meta: ['KAPASİTE PLANI', 'SÜREKLİ KAYIT', 'YEDEKLEME'], credit: 'NVR · NAS · DİSK', brands: 'Hikvision ve Dahua' },
  'switch-konfigurasyonu': { img: 'switch.jpg', accent: '#0284c7', label: 'SWITCH', meta: ['POE', 'VLAN', 'PORT ETİKETLEME'], credit: 'RUIJIE · TP-LINK', brands: 'Ruijie ve TP-Link' },
  'firewall-yapilandirma': { img: 'firewall.jpg', hero: 'firewall-wide.jpg', accent: '#dc2626', label: 'FIREWALL', meta: ['ERİŞİM KURALLARI', 'PORT YÖNLENDİRME', 'VPN'], credit: 'FORTINET · FORTIGATE', brands: 'Fortinet (FortiGate)' },
  'access-point-kurulumu': { img: 'ap-saha.jpg', accent: '#059669', label: 'WI-FI', meta: ['SİNYAL ANALİZİ', 'TEK AĞ · ROAMING', 'MİSAFİR AĞI'], credit: 'SAHADAN · KENDİ KURULUMUMUZ', brands: 'TP-Link Omada ve Ruijie' },
};
const ORDER = ['ip-kamera-sistemleri', 'nvr-depolama', 'switch-konfigurasyonu', 'firewall-yapilandirma', 'access-point-kurulumu'];
const H = Object.fromEntries(hizmetler.map(h => [h.slug, h]));
const SLIDE_TITLE = { 'ip-kamera-sistemleri': 'IP\nKamera', 'nvr-depolama': 'NVR ve\nDepolama', 'switch-konfigurasyonu': 'Switch ve\nAğ', 'firewall-yapilandirma': 'Firewall', 'access-point-kurulumu': 'Access\nPoint' };
const SLIDES = [
  ...ORDER.map(slug => ({ t: SLIDE_TITLE[slug], slug, word: SVC[slug].label, img: SVC[slug].img, accent: SVC[slug].accent, credit: SVC[slug].credit, meta: SVC[slug].meta, d: H[slug].lead })),
];
// the real industrial frame sits second, under the camera service
SLIDES.splice(1, 0, { t: 'Endüstriyel\nAlan', slug: 'ip-kamera-sistemleri', word: 'SAHA', img: 'saha-endustriyel.jpg', accent: '#6b7280', credit: 'SAHADAN · KENDİ KURULUMUMUZ', meta: ['FABRİKA', 'DEPO', 'ŞANTİYE'],
  d: 'Fabrika, depo ve şantiyede kamera; kablo tavasına, tavana, direğe, alan neyi gerektiriyorsa. Çok noktalı projelerde kurulum süresi keşifte birlikte netleşir.' });

const TIMES = { silivri: '10–20', catalca: '30–40', buyukcekmece: '25–35', beylikduzu: '35–45', corlu: '35–45', cerkezkoy: '45–55', marmaraereglisi: '25–35', kapakli: '45–55', tekirdag: '50–60' };
const B = Object.fromEntries(bolgeler.map(b => [b.slug, b]));
/* local-SEO anchors: [service page → district ("Çatalca güvenlik kamerası"), district page → service] */
const KW = {
  'ip-kamera-sistemleri': ['güvenlik kamerası', 'Güvenlik kamerası kurulumu'],
  'nvr-depolama': ['NVR kurulumu', 'NVR kayıt cihazı kurulumu'],
  'switch-konfigurasyonu': ['bilgi işlem altyapısı', 'Switch ve network altyapısı'],
  'firewall-yapilandirma': ['firewall kurulumu', 'FortiGate firewall kurulumu'],
  'access-point-kurulumu': ['Wi-Fi kurulumu', 'Access point ve Wi-Fi kurulumu'],
};

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const encodeStrict = s => encodeURIComponent(s).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
const [P1, P2] = site.phones;
const wa = (text, p = P1) => `https://wa.me/${p.wa}?text=${encodeStrict(text)}`;
const abs = p => `${site.url}${p}`;
const serialize = o => JSON.stringify(o, null, 2).replace(/</g, '\\u003c');
// Turkish uppercase, but English product words keep their dotless I (FIREWALL, not FİREWALL)
const EN = new Set(['firewall', 'switch', 'access', 'point', 'ip', 'nvr', 'wi-fi', 'network', 'vpn']);
const upperTR = s => s.split(' ').map(w => EN.has(w.toLowerCase().replace(/[^a-z-]/g, '')) ? w.toUpperCase() : w.toLocaleUpperCase('tr')).join(' ');

const I = {
  ig: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/></svg>',
  wa: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20.5 5.3 16A8.5 8.5 0 1 1 8.4 19z"/><path d="M9 8.5c0 3.5 2.6 6.3 6.3 6.6l1.2-1.6-2-1-1 .8c-1.1-.5-2-1.4-2.4-2.5l.8-1-1-2z"/></svg>',
  call: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5h4l1.5 4.5-2.5 1.5a11 11 0 0 0 6.5 6.5l1.5-2.5 4.5 1.5v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5.5a2 2 0 0 1 2-2z"/></svg>',
  menu: '<svg class="kbtn__ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1v14M1 8h14"/></svg>',
  close: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  arrow: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  plus: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
};
// kinetic menu button: "Menü" / "Kapat" stacked in a mask + a plus that turns to a cross (site.css .kbtn); the name comes from aria-label
const kbtn = attrs => `<button class="bar__btn kbtn" type="button" ${attrs}><span class="kbtn__lbl" aria-hidden="true"><span>Menü</span><span>Kapat</span></span>${I.menu}</button>`;
// menu hover motifs: one line drawing per service, stroked in its accent (site.css .menu__motif)
const arc = (cx, cy, r, a0, a1) => { const p = a => `${(cx + r * Math.cos(a * Math.PI / 180)).toFixed(1)} ${(cy + r * Math.sin(a * Math.PI / 180)).toFixed(1)}`; return `M${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}`; };
const MOTIF = {
  'ip-kamera-sistemleri': ['<circle cx="60" cy="200" r="22"/>', '<path d="M368 56 60 200l308 144"/>', ...[140, 230, 320].map(r => `<path d="${arc(60, 200, r, -25, 25)}"/>`)], // field-of-view cone
  'nvr-depolama': ['<path d="M200 60v280"/>', ...[110, 165, 220, 275].map(y => `<ellipse cx="200" cy="${y}" rx="150" ry="34"/>`)], // disk platters
  'switch-konfigurasyonu': ['<rect x="40" y="130" width="320" height="140"/>', ...[0, 1, 2, 3, 4, 5].map(i => `<path d="M${64 + i * 48} 160h34v30h-34zM${64 + i * 48} 214h34v30h-34z"/>`)], // port grid
  'firewall-yapilandirma': ['<path d="M40 330V80h320v250z"/>', ...[0, 1, 2, 3, 4].map(k => `<path d="M40 ${80 + k * 50}h320${(k % 2 ? [80, 160, 240, 320] : [120, 200, 280]).map(x => `M${x} ${80 + k * 50}v50`).join('')}"/>`)], // brick wall
  'access-point-kurulumu': ['<circle cx="200" cy="320" r="10"/>', ...[60, 120, 180, 240].map(r => `<path d="${arc(200, 320, r, -135, -45)}"/>`)], // Wi-Fi arcs
};

/* ---------- JSON-LD (ported 1:1 from SEC GÜNCEL/src/lib/schema.js) ---------- */
const BUSINESS_ID = `${site.url}/#business`, WEBSITE_ID = `${site.url}/#website`;
const place = b => ({ '@type': 'City', name: b.ad, containedInPlace: { '@type': 'AdministrativeArea', name: b.il } }); // district (ilçe) inside its province
const cities = () => bolgeler.map(place);
const faqPage = (items, id) => ({ '@type': 'FAQPage', ...(id ? { '@id': id } : {}), mainEntity: items.map(it => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } })) });
const crumbs = (items, id) => ({ '@type': 'BreadcrumbList', ...(id ? { '@id': id } : {}), itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.item })) });
const localBusiness = () => ({
  '@type': 'LocalBusiness', '@id': BUSINESS_ID, name: site.name, url: `${site.url}/`, image: abs(site.ogImage), logo: abs(site.logo), description: site.description,
  telephone: site.phones.map(p => p.e164), email: site.email,
  address: { '@type': 'PostalAddress', streetAddress: site.address.streetAddress, addressLocality: site.address.addressLocality, addressRegion: site.address.addressRegion, postalCode: site.address.postalCode, addressCountry: site.address.addressCountry },
  geo: { '@type': 'GeoCoordinates', latitude: site.geo.latitude, longitude: site.geo.longitude },
  areaServed: cities(),
  priceRange: site.priceRange, currenciesAccepted: site.currenciesAccepted, sameAs: [site.mapUrl, site.instagram],
  hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Hizmetler', itemListElement: hizmetler.map(h => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: h.anaSayfaSchema.name } })) },
  alternateName: site.alternateName, hasMap: site.mapUrl,
});
const webSite = () => ({ '@type': 'WebSite', '@id': WEBSITE_ID, url: `${site.url}/`, name: site.name, inLanguage: site.inLanguage, publisher: { '@id': BUSINESS_ID } });
const webPage = (url, name, description, extra = {}) => ({ '@type': 'WebPage', '@id': url, url, name, description, inLanguage: site.inLanguage, isPartOf: { '@id': WEBSITE_ID }, about: { '@id': BUSINESS_ID }, ...extra });

/* ---------- shared chrome ---------- */
function head({ title, description, path = '/', robots = site.robotsDefault, ogDescription = description, twitterDescription = description, ogImageAlt = site.ogImageAlt, geo = false, noCanonical = false, social = true, jsonLd, preload }) {
  const canonical = abs(path), og = abs(site.ogImage);
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${esc(site.csp)}">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noCanonical ? '' : `<link rel="canonical" href="${canonical}">`}
<meta name="robots" content="${esc(robots)}">
${geo ? `<meta name="geo.region" content="${site.geo.region}">\n<meta name="geo.placename" content="${esc(site.geo.placename)}">` : ''}
${social ? `<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.siteName)}">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(ogDescription)}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(ogImageAlt)}">
<meta property="og:locale" content="${site.locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(twitterDescription)}">
<meta name="twitter:image" content="${og}">
<meta name="twitter:image:alt" content="${esc(site.ogImageAlt)}">` : ''}
<meta name="theme-color" content="#000000">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100,400;100,500;100,600;100,700&family=JetBrains+Mono:wght@500&display=swap">
${preload || ''}
<link rel="stylesheet" href="/site.css">
<script>(function(d){d.classList.add('js');var t;try{t=localStorage.getItem('theme')}catch(e){}d.dataset.theme=t||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');if(d.dataset.theme==='light')document.querySelector('meta[name=theme-color]').content='#f2f3f4'})(document.documentElement)</script>
<script>/* hafif mod: yazılım WebGL (donanım hızlandırması kapalı) ya da süren <40fps → efektler sadeleşir */(function(d){var low=0;function go(w){if(low)return;low=1;d.classList.add('low');d.dataset.low=w;dispatchEvent(new Event('sec:low'))}try{var g=document.createElement('canvas').getContext('webgl');if(!g)go('nogl');else{var x=g.getExtension('WEBGL_debug_renderer_info'),r=x?g.getParameter(x.UNMASKED_RENDERER_WEBGL):'';if(/swiftshader|llvmpipe|software|basic render/i.test(r))go('soft');var l=g.getExtension('WEBGL_lose_context');if(l)l.loseContext()}}catch(e){}var ts=[],last=0,bad=0;function f(n){if(low)return;if(last&&!document.hidden){var dt=n-last;if(dt<250){ts.push(dt);if(ts.length>=60){ts.sort(function(a,b){return a-b});bad=ts[30]>24?bad+1:0;ts=[];if(bad>=2)go('slow')}}}last=n;requestAnimationFrame(f)}setTimeout(function(){requestAnimationFrame(f)},2500)})(document.documentElement);</script>
${jsonLd ? `<script type="application/ld+json">\n${serialize(jsonLd)}\n</script>` : ''}
</head>`;
}

const bar = (whatsText = site.defaultWhatsappText) => `
<a class="skip" href="#main">İçeriğe geç</a>
<canvas class="topo" aria-hidden="true"></canvas>
<header class="bar">
  <a class="bar__logo" href="/" aria-label="Securis ana sayfa"><img src="/securis-logo-320.png" alt="Securis" width="320" height="98"></a>
  <div class="bar__end">
    <button class="bar__btn theme" type="button" data-theme-toggle aria-label="Açık / koyu tema"><svg class="theme__ic" viewBox="0 0 240 240" aria-hidden="true"><g class="theme__half"><path d="M120 67.5c29.25 0 52.5 23.25 52.5 52.5s-23.25 52.5-52.5 52.5" fill="currentColor"/></g><path class="theme__ring" d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120S55.5 236.25 120 236.25 236.25 184.5 236.25 120 184.5 3.75 120 3.75Zm0 210.75v-42c-29.25 0-52.5-23.25-52.5-52.5s23.25-52.5 52.5-52.5v-42c52.5 0 94.5 42 94.5 94.5s-42 94.5-94.5 94.5Z" fill="currentColor"/></svg></button>
    <a class="bar__btn" href="${wa(whatsText)}" target="_blank" rel="noopener noreferrer"><span>WhatsApp</span>${I.wa}</a>
    ${kbtn('data-menu-open aria-haspopup="dialog" aria-controls="menu" aria-expanded="false" aria-label="Menü"')}
  </div>
</header>
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Site menüsü" hidden>
  <div class="menu__dim" data-menu-close></div>
  <div class="menu__panel">
    <div class="menu__bg" aria-hidden="true"><div class="menu__sweep"><i></i><i></i></div><i class="menu__ground"></i>${ORDER.map(s => `<svg class="menu__motif" viewBox="0 0 400 400" style="--accent:${SVC[s].accent}">${MOTIF[s].map((el, i) => el.replace(/^<(\w+)/, `<$1 style="--i:${i}"`)).join('')}</svg>`).join('')}</div>
    <div class="menu__in">
      <div class="menu__top">
        <img src="/securis-logo-320.png" alt="" width="320" height="98">
        ${kbtn('data-menu-close aria-label="Menüyü kapat"')}
      </div>
      <nav class="menu__svcs" aria-label="Hizmetler"><p class="mono" data-menu-fade>HİZMETLER</p><ul>${ORDER.map((s, i) => `<li style="--i:${i}"><a href="/hizmetler/${s}/">${pic(SVC[s].img, fit(SVC[s].img, '54px', '54px'), ' loading="lazy"')}${esc(H[s].kisaAd)}</a></li>`).join('')}</ul></nav>
      <div class="menu__more">
        <nav aria-label="Bölgeler"><p class="mono" data-menu-fade style="--mf:1">BÖLGELER</p><ul class="menu__regions" data-menu-fade style="--mf:2">${bolgeler.map(b => `<li><a href="/bolgeler/${b.slug}/">${esc(b.ad)}</a></li>`).join('')}</ul></nav>
        <div class="menu__contact"><p class="mono" data-menu-fade style="--mf:3">İLETİŞİM</p>
          ${[`<a href="${wa(whatsText)}" target="_blank" rel="noopener noreferrer">${I.wa} WhatsApp: ${P1.display}</a>`, `<a href="tel:${P1.e164}">${I.call} ${P1.display}</a>`, `<a href="tel:${P2.e164}">${I.call} ${P2.display}</a>`, `<a href="mailto:${site.email}">${site.email}</a>`, `<a href="${site.instagram}" target="_blank" rel="noopener noreferrer">${I.ig} Instagram ${site.instagramHandle}</a>`, '<a href="/">Ana sayfa</a>', '<a href="/gizlilik-politikasi/">Gizlilik politikası</a>'].map((a, i) => a.replace('<a ', `<a data-menu-fade style="--mf:${4 + i}" `)).join('')}
        </div>
      </div>
    </div>
  </div>
</div>`;

const btns = (text, extra = '') => `<div class="btns">
  <a class="btn" href="${wa(text)}" target="_blank" rel="noopener noreferrer">${I.wa}<span>${site.labels.waButton}</span></a>
  <a class="btn btn--line" href="tel:${P1.e164}" aria-label="Ara ${P1.display}">${I.call}<span class="lg">${P1.display}</span><span class="sm">Ara</span></a>${extra}
</div>`;

/* ---------- responsive images ----------
   Next to each assets/*.jpg the image pipeline writes name-480 / name-960 (.webp + .jpg) and a full-width name.webp.
   A variant wider than the original, or heavier in bytes than it, is never written; the helpers only list files that exist. */
const PUB = new URL('./public/', import.meta.url);
const FILES = new Set(['assets', 'assets/saha'].flatMap(d => readdirSync(new URL(`${d}/`, PUB)).map(f => `/${d}/${f}`)));
const DIM = new Map();
const dim = f => { // [width, height] from the JPEG's SOF marker
  if (!DIM.has(f)) { const b = readFileSync(new URL(`assets/${f}`, PUB)); let i = 2; while (!(b[i + 1] >= 0xc0 && b[i + 1] <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(b[i + 1]))) i += 2 + b.readUInt16BE(i + 2); DIM.set(f, [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]); }
  return DIM.get(f);
};
const srcset = (f, ext) => { const [w] = dim(f), b = `/assets/${f.slice(0, -4)}`; return [...[480, 960].filter(x => x < w && FILES.has(`${b}-${x}.${ext}`)).map(x => `${b}-${x}.${ext} ${x}w`), `${FILES.has(`${b}.${ext}`) ? `${b}.${ext}` : `/assets/${f}`} ${w}w`].join(', '); };
/** one WebP URL at most `w` wide (JS-swapped images: filmstrip, backdrop, follower, projects) */
/** home depth layers: <name>-fg.webp (subject cutout) and <name>-plate.webp (subject filled out), when they exist */
const layer = (f, k) => { const u = `/assets/${f.slice(0, -4)}-${k}.webp`; return FILES.has(u) ? u : undefined; };
const one = (f, w = Infinity) => { const b = `/assets/${f.slice(0, -4)}`; return [...(w < dim(f)[0] ? [`${b}-${w}.webp`] : []), `${b}.webp`, `/assets/${f}`].find(u => FILES.has(u)); };
/** rendered width of an object-fit: cover image in a w × h box: max(w, h × aspect) */
const fit = (f, w, h) => { const [iw, ih] = dim(f); return `max(${w}, ${h.replace(/[\d.]+/, n => +(n * iw / ih).toFixed(1))})`; };
const heroSizes = f => fit(f, '120vw', '120vh'); // .grade img covers the hero at scale(1.2)
/** <picture> with WebP + JPEG srcsets; `narrow` = { f, sizes } adds the art-directed ≤700px plate */
const pic = (f, sizes, attrs = '', narrow) => `<picture>${narrow ? `<source media="(max-width: 700px)" type="image/webp" srcset="${srcset(narrow.f, 'webp')}" sizes="${narrow.sizes}"><source media="(max-width: 700px)" srcset="${srcset(narrow.f, 'jpg')}" sizes="${narrow.sizes}">` : ''}<source type="image/webp" srcset="${srcset(f, 'webp')}" sizes="${sizes}"><img src="/assets/${f}" srcset="${srcset(f, 'jpg')}" sizes="${sizes}" alt=""${attrs}></picture>`;
const preloadImg = (f, narrow) => { const l = (g, media = '') => `<link rel="preload" as="image" type="image/webp" imagesrcset="${srcset(g, 'webp')}" imagesizes="${heroSizes(g)}"${media} fetchpriority="high">`; return narrow ? `${l(narrow, ' media="(max-width: 700px)"')}\n${l(f, ' media="not all and (max-width: 700px)"')}` : l(f); };
const preloadUrl = u => `<link rel="preload" as="image"${u.endsWith('.webp') ? ' type="image/webp"' : ''} href="${u}" fetchpriority="high">`;

const grade = (img, accent, cls = 'grade', narrow, loading) => /* photo re-graded to the accent; optional portrait plate for phones */ `<div class="${cls}" aria-hidden="true">${pic(img, heroSizes(img), loading ? ` loading="${loading}"` : '', narrow && { f: narrow, sizes: heroSizes(narrow) })}<i class="c" style="background:${accent}"></i><i class="m" style="background:${accent}"></i></div><div class="wash" aria-hidden="true"></div><div class="grain" aria-hidden="true"></div>`;

/** Contact sheet: every service frame in a row, the current one enlarged and ringed. */
const sheet = (current, caption) => `<nav class="sheet" aria-label="${esc(caption)}">${ORDER.map((s, i) => `
  <a class="sheet__frame${s === current ? ' is-on' : ''}" style="--i:${i}" href="/hizmetler/${s}/"${s === current ? ' aria-current="page"' : ''}>
    ${pic(SVC[s].img, s === current ? `(max-width: 700px) ${fit(SVC[s].img, '58vw', '190px')}, ${fit(SVC[s].img, '27vw', '330px')}` : `(max-width: 700px) ${fit(SVC[s].img, '34vw', '110px')}, ${fit(SVC[s].img, '18vw', '160px')}`, ` loading="${s === current ? 'eager' : 'lazy'}"`)}
    <span class="mono">${String(i + 1).padStart(2, '0')} ${esc(upperTR(H[s].kisaAd))}${s === current ? ' — BU SAYFA' : ''}</span>
  </a>`).join('')}
</nav>`;

/** Subpage h1: each word in its own mask so the heading wipes up line by line (MOTION B). */
const words = t => esc(t).split(' ').map((w, i) => `<span class="wd" style="--w:${i}"><span>${w}</span></span>`).join(' ');
const faq = items => `<div class="faq">${items.map(it => `<details><summary><span>${esc(it.q)}</span>${I.plus}</summary><p>${esc(it.a)}</p></details>`).join('')}</div>`;

const regionGrid = (slugs, label = s => B[s].ad) => `<ul class="regs">${slugs.map(s => `<li><a href="/bolgeler/${s}/"><span>${esc(label(s))}</span><small class="mono">${TIMES[s]} DK</small>${I.arrow}</a></li>`).join('')}</ul>`;

const closeCta = (text, h2 = 'Kurulum bittiğinde<br>her şey masanızda.') => `
<section class="close" id="contact" aria-labelledby="close-h">
  ${grade('kurulum-sonu.jpg', '#1f2937', undefined, undefined, 'lazy')}
  <div class="close__in">
    <h2 id="close-h">${h2}</h2>
    <p>${esc(site.ctaBand.p)} ${esc(site.ctaNote)}.</p>
    ${btns(text)}
  </div>
</section>`;

const footer = () => `
<footer class="foot">
  <div class="foot__in">
    <img src="/securis-logo-320.png" alt="Securis" width="320" height="98" loading="lazy">
    <address>
      <a href="${site.mapUrl}" target="_blank" rel="noopener noreferrer">${esc(site.address.footerLine)}</a>
      <span><a href="tel:${P1.e164}">${P1.display}</a> · <a href="tel:${P2.e164}">${P2.display}</a> · <a href="mailto:${site.email}">${site.email}</a> · <a class="foot__ig" href="${site.instagram}" target="_blank" rel="noopener noreferrer">${I.ig}${site.instagramHandle}</a></span>
    </address>
    <nav aria-label="Alt menü"><a href="/gizlilik-politikasi/">Gizlilik Politikası</a> · <span>© ${site.copyrightYear} Securis</span></nav>
  </div>
</footer>
<script src="/site.js" defer></script>
<script src="/topology.js" defer></script>`;

/* Google reviews stage: each review dissolves in over the real frame closest to what it talks about, graded to that service */
const REV_BG = {
  'Neslihan Balik': ['nvr.jpg', '#7c3aed'], 'Büyükçekmece Kooperatif': ['saha/saha-kablolama.jpg', '#a16207'], 'Boss Kurt': ['ap-saha.jpg', '#059669'],
  'Furkan Eryesil': ['saha/saha-servis.jpg', '#c2410c'], 'Göktuğ Demir': ['ap-saha.jpg', '#059669'], 'Mehmet Buğra Foto': ['switch.jpg', '#0284c7'],
  'Berk Dogar': ['kamera.jpg', '#c2410c'], 'omer': ['saha/saha-dis-cephe.jpg', '#b45309'], 'Cem E': ['saha/saha-kablolama.jpg', '#a16207'],
  'Emre ÖZEN': ['saha/saha-servis.jpg', '#c2410c'], 'Deniz Şengül': ['kurulum-sonu.jpg', '#1f2937'], 'Mehmet Kalaycı': ['saha-endustriyel.jpg', '#6b7280'],
  'Harun Tahtacı': ['kamera.jpg', '#c2410c'],
};
const revBg = r => REV_BG[r.name] || ['kurulum-sonu.jpg', '#1f2937'];
/** reviewer avatar: the self-hosted Google profile photo when reviews.json has one, else the initial */
const revAv = r => `<span class="rev__av" aria-hidden="true">${r.avatar ? `<img src="${esc(r.avatar)}" alt="" width="96" height="96" loading="lazy">` : esc([...r.name.trim()][0].toLocaleUpperCase('tr'))}</span>`;

/* ---------- pages ---------- */
function home() {
  const title = 'Silivri Kamera Sistemleri ve Network Kurulumu | Securis';
  const description = "Silivri, Tekirdağ ve Çatalca'da IP kamera sistemleri, firewall ve network kurulumu. Ücretsiz keşif, hafta 7 gün destek. Hemen teklif alın.";
  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    localBusiness(), webSite(),
    crumbs([{ name: 'Ana Sayfa', item: `${site.url}/` }, { name: 'Hizmetler', item: `${site.url}/#services` }, { name: 'Hizmet Bölgeleri', item: `${site.url}/#region` }], `${site.url}/#breadcrumb`),
    ...hizmetler.map(h => ({ '@type': 'Service', '@id': abs(`/hizmetler/${h.slug}/#service`), serviceType: h.anaSayfaSchema.serviceType, name: h.anaSayfaSchema.name, description: h.anaSayfaSchema.description, url: abs(`/hizmetler/${h.slug}/`), provider: { '@id': BUSINESS_ID }, areaServed: cities() })),
    faqPage(anasayfa.sss.items, `${site.url}/#faq`),
  ] };
  return `${head({ title, description, robots: site.robotsHome, ogDescription: "Silivri, Tekirdağ ve Çatalca'da IP kamera sistemleri, firewall ve network kurulumu. Ücretsiz keşif, hafta 7 gün destek.", twitterDescription: 'IP kamera, firewall ve network kurulumu. Silivri, Tekirdağ, Çatalca ve çevresi. Ücretsiz keşif.', ogImageAlt: site.ogImageAltHome, geo: true, jsonLd, preload: preloadUrl(one(SLIDES[0].img)) })}
<body class="is-home">
${bar()}
<main id="main">
  <section class="stage" id="services" tabindex="0" role="group" aria-roledescription="carousel" aria-label="Securis hizmetleri">
    <h1 class="sr">Silivri, Tekirdağ ve Çatalca'da kamera sistemleri ve network kurulumu</h1>
    <div class="bg" id="bg" aria-hidden="true"><div class="bg__layer is-on"><img src="${one(SLIDES[0].img)}" alt="" fetchpriority="high"><i class="c" style="background:${SLIDES[0].accent}"></i><i class="m" style="background:${SLIDES[0].accent}"></i></div></div>
    <div class="wash" aria-hidden="true"></div>
    <div class="words" aria-hidden="true"><div class="words__track" id="words"></div></div>
    <div class="subj" id="subj" aria-hidden="true"></div><div class="grain" aria-hidden="true"></div>
    <div class="head">
      <p class="title" id="title" aria-live="off"></p>
      <p class="credit mono" id="credit"></p>
      <div class="meta mono" id="meta"></div>
      <a class="more mono" id="more" href="/hizmetler/ip-kamera-sistemleri/">HİZMETİ İNCELE ${I.arrow}</a>
    </div>
    <div class="strip"><div class="track" id="track"></div></div>
    <div class="descs"><div class="descs__track" id="descs"></div></div>
    <div class="rail mono"><div class="rail__in" aria-hidden="true"><div class="rail__nums"><span id="cur">01</span><span id="tot">06</span></div><div class="rail__line"><i id="thumb"></i></div></div><button class="rail__pause" id="pause" type="button" aria-pressed="false" aria-label="Otomatik geçişi durdur"><svg class="hold" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2h3.5v12H3zM9.5 2H13v12H9.5z"/></svg><svg class="play" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2l10 6-10 6z"/></svg></button></div>
    <noscript><ul class="nojs">${ORDER.map(s => `<li><a href="/hizmetler/${s}/">${esc(H[s].kisaAd)}</a></li>`).join('')}</ul></noscript>
  </section>

  <section class="sec members" aria-labelledby="svc-h">
    <div class="sec__head"><h2 id="svc-h">Beş iş, tek ekip.</h2><p>Kamerayı, arkasındaki ağı ve kayıt cihazını aynı ekip kurar; arızada "kameracı" ile "internetçi" arasında kalmazsınız.</p></div>
    <ul class="members__list">${ORDER.map((s, i) => `<li><a href="/hizmetler/${s}/" data-img="${one(SVC[s].img, 960)}" style="--accent:${SVC[s].accent}">${pic(SVC[s].img, fit(SVC[s].img, '64px', '64px'), ' class="members__thumb" loading="lazy"')}<span class="members__n mono">${String(i + 1).padStart(2, '0')}</span><span class="members__name">${esc(H[s].kisaAd)}</span><span class="members__line">${esc(H[s].kisaAciklama)}</span>${I.arrow}</a></li>`).join('')}</ul>
    <div class="follower" aria-hidden="true"><img src="${one(SVC[ORDER[0]].img, 960)}" alt=""><i class="c"></i><i class="m"></i></div>
  </section>

  <section class="sec revs" aria-labelledby="rev-h">
    ${grade(...revBg(reviews.items[0]), 'grade revs__bg', undefined, 'lazy')}
    <div class="revs__in">
      <div class="sec__head">
        <h2 id="rev-h">Kurduğumuz yerlerden.</h2>
        <div class="revs__score"><b>${reviews.rating}</b><span class="revs__stars" aria-hidden="true">${STARS}</span><span>Google'da ${reviews.count} yorum</span></div>
      </div>
      <ul class="revs__list" id="revs" aria-label="Google yorumları">${reviews.items.map(r => `<li class="rev" data-img="${one(revBg(r)[0])}" data-accent="${revBg(r)[1]}"><p class="rev__stars" role="img" aria-label="5 üzerinden 5 yıldız">${STARS}</p><blockquote><p>${esc(r.text)}</p></blockquote><p class="rev__who">${revAv(r)}<span><b>${esc(r.name)}</b><small class="mono">GOOGLE YORUMU</small></span></p></li>`).join('')}</ul>
      <div class="revs__foot">
        <div class="revs__ctl" hidden>
          <div class="revs__nav"><button class="revs__btn" type="button" data-rev="-1" aria-label="Önceki yorum">${I.arrow}</button><button class="revs__btn revs__pause" type="button" aria-pressed="false" aria-label="Otomatik geçişi durdur"><svg class="hold" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2h3.5v12H3zM9.5 2H13v12H9.5z"/></svg><svg class="play" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2l10 6-10 6z"/></svg></button><button class="revs__btn" type="button" data-rev="1" aria-label="Sonraki yorum">${I.arrow}</button></div>
          <p class="revs__n mono" aria-hidden="true"><span>01</span> / ${String(reviews.items.length).padStart(2, '0')}</p>
          <div class="revs__avs" role="group" aria-label="Yorum seçin">${reviews.items.map((r, i) => `<button type="button" data-i="${i}" aria-label="${i + 1}. yorum: ${esc(r.name)}">${revAv(r)}</button>`).join('')}</div>
        </div>
        <a class="more" href="${reviews.url}" target="_blank" rel="noopener noreferrer">Tüm yorumlar Google'da ${I.arrow}</a>
      </div>
    </div>
  </section>

  <section class="sec" id="region" aria-labelledby="reg-h">
    <div class="sec__head"><h2 id="reg-h">Silivri'den dokuz ilçeye.</h2><p>Aynı ekip, aynı servis süresi. Süreler Silivri'deki merkezimizden ortalama yol süresidir.</p></div>
    ${regionGrid(bolgeler.map(b => b.slug))}
  </section>

  <section class="sec" id="sss" aria-labelledby="sss-h">
    <div class="sec__head"><h2 id="sss-h">${esc(anasayfa.sss.title)}</h2><p>${esc(anasayfa.sss.desc)}</p></div>
    ${faq(anasayfa.sss.items)}
  </section>
  ${closeCta(site.defaultWhatsappText)}
</main>
${footer()}
<script type="application/json" id="slides">${JSON.stringify(SLIDES.map(s => ({ ...s, card: one(s.img, 960), bg: one(s.img), fg: layer(s.img, 'fg'), plate: layer(s.img, 'plate') }))).replace(/</g, '\\u003c')}</script>
<script src="/carousel.js" defer></script>
<script src="/morph.js" defer></script>
</body></html>`;
}

function servicePage(h) {
  const path = `/hizmetler/${h.slug}/`, url = abs(path), v = SVC[h.slug];
  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Service', '@id': `${url}#service`, serviceType: h.kisaAd, name: h.h1, description: h.description, url, provider: { '@id': BUSINESS_ID }, areaServed: cities() },
    webPage(url, h.title, h.description),
    crumbs([{ name: 'Ana Sayfa', item: `${site.url}/` }, { name: 'Hizmetler', item: `${site.url}/#services` }, { name: h.breadcrumbName, item: url }]),
    faqPage(h.sss.items),
  ] };
  return `${head({ title: h.title, description: h.description, path, jsonLd, preload: v.hero ? preloadImg(v.hero, v.img) : preloadImg(v.img) })}
<body style="--accent:${v.accent}">
${bar(h.whatsappText)}
<main id="main">
  <section class="hero">
    ${grade(v.hero || v.img, v.accent, v.hero ? 'grade grade--wide' : 'grade', v.hero ? v.img : null)}
    <div class="hero__txt">
      <nav class="crumb" aria-label="Site haritası"><a href="/">Ana sayfa</a> / <a href="/#services">Hizmetler</a> / <span aria-current="page">${esc(h.breadcrumbName)}</span></nav>
      <h1>${words(h.h1)}</h1>
      <p class="lead">${esc(h.lead)}</p>
      ${btns(h.whatsappText)}
      <p class="note mono">${esc(upperTR(site.ctaNote))}</p>
    </div>
    ${sheet(h.slug, 'Diğer hizmetler')}
  </section>

  <section class="sec" aria-labelledby="det-h">
    <div class="sec__head"><h2 id="det-h">${esc(site.labels.hizmetDetayTitle)}</h2><p>Çalıştığımız markalar: ${esc(v.brands)}. Marka seçimi keşifte, alanın ihtiyacına ve bütçeye göre netleşir.</p></div>
    <ul class="steps">${h.detayKartlari.map(k => `<li><h3>${esc(k.h3)}</h3><p>${esc(k.p)}</p></li>`).join('')}</ul>
  </section>

  <section class="sec" aria-labelledby="reg-h">
    <div class="sec__head"><h2 id="reg-h">Hizmet verdiğimiz ilçeler</h2><p>${esc(site.labels.hizmetBolgeDesc)} Her ilçenin sayfasında bu hizmetin o bölgede nasıl planlandığını anlattık.</p></div>
    ${regionGrid(bolgeler.map(b => b.slug), s => `${B[s].ad} ${KW[h.slug][0]}`)}
  </section>

  <section class="sec" aria-labelledby="sss-h">
    <div class="sec__head"><h2 id="sss-h">${esc(h.sss.title)}</h2></div>
    ${faq(h.sss.items)}
  </section>
  ${closeCta(h.whatsappText)}
</main>
${footer()}
</body></html>`;
}

function regionPage(b) {
  const path = `/bolgeler/${b.slug}/`, url = abs(path);
  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    webPage(url, b.title, b.description, { primaryImageOfPage: { '@type': 'ImageObject', url: abs(site.ogImage) } }),
    crumbs([{ name: 'Ana Sayfa', item: `${site.url}/` }, { name: 'Bölgeler', item: `${site.url}/#region` }, { name: b.ad, item: url }]),
    ...b.hizmetDetay.map(d => ({ '@type': 'Service', '@id': `${url}#${d.slug}`, name: d.h3, serviceType: H[d.slug].anaSayfaSchema.serviceType, description: d.p, url, provider: { '@id': BUSINESS_ID }, areaServed: place(b), isRelatedTo: { '@id': abs(`/hizmetler/${d.slug}/#service`) } })),
    faqPage(b.sss.items),
  ] };
  return `${head({ title: b.title, description: b.description, path, jsonLd, preload: preloadImg('saha-endustriyel.jpg') })}
<body style="--accent:#1d4ed8">
${bar(b.whatsappText)}
<main id="main">
  <section class="hero">
    ${grade('saha-endustriyel.jpg', '#1d4ed8')}
    <div class="hero__txt">
      <nav class="crumb" aria-label="Site haritası"><a href="/">Ana sayfa</a> / <a href="/#region">Bölgeler</a> / <span aria-current="page">${esc(b.ad)}</span></nav>
      <h1>${words(b.h1)}</h1>
      <p class="lead">${esc(b.lead)}</p>
      ${btns(b.whatsappText)}
      <p class="note mono">${esc(upperTR(site.ctaNote))} · MERKEZDEN ${TIMES[b.slug]} DK</p>
    </div>
    ${sheet(null, esc(b.hizmetlerTitle))}
  </section>

  <section class="sec" aria-labelledby="pro-h">
    <div class="sec__head"><h2 id="pro-h">${esc(b.profil.title)}</h2></div>
    <div class="prose"><p>${esc(b.profil.paragraf)}</p><p class="locales"><span class="mono">${esc(upperTR(site.labels.mahalleLabel))}</span> ${esc(b.profil.mahalleList)}</p></div>
  </section>

  <section class="sec" aria-labelledby="svc-h">
    <div class="sec__head"><h2 id="svc-h">${esc(b.hizmetlerTitle)}</h2><p>Kamera, firewall, switch, Wi-Fi ve kayıt cihazı; beşini de aynı ekip kurar, arızada da aynı ekip gelir.</p></div>
    <ul class="dsv">${b.hizmetDetay.map((d, i) => `<li style="--accent:${SVC[d.slug].accent}"><p class="dsv__n mono">${String(i + 1).padStart(2, '0')} · ${esc(upperTR(H[d.slug].kisaAd))}</p><h3>${esc(d.h3)}</h3><p>${esc(d.p)}</p><a href="/hizmetler/${d.slug}/">${esc(KW[d.slug][1])}${I.arrow}</a></li>`).join('')}</ul>
  </section>

  <section class="sec" aria-labelledby="sss-h">
    <div class="sec__head"><h2 id="sss-h">${esc(b.sss.title)}</h2></div>
    ${faq(b.sss.items)}
  </section>

  <section class="sec" aria-labelledby="near-h">
    <div class="sec__head"><h2 id="near-h">${esc(b.yakinBolgeler.title)}</h2><p>${esc(site.labels.yakinBolgelerDesc)}</p></div>
    ${regionGrid(b.yakinBolgeler.slugs)}
  </section>
  ${closeCta(b.whatsappText)}
</main>
${footer()}
</body></html>`;
}

function privacyPage() {
  const { title, description } = gizlilik, path = '/gizlilik-politikasi/', url = abs(path);
  const jsonLd = { '@context': 'https://schema.org', '@graph': [webPage(url, title, description), crumbs([{ name: 'Ana Sayfa', item: `${site.url}/` }, { name: 'Gizlilik Politikası', item: url }])] };
  const link = t => esc(t).replace('{email}', `<a href="mailto:${site.email}">${site.email}</a>`).replace('{phone}', `<a href="tel:${P1.e164}">${P1.display}</a>`).replace('{address}', esc(site.address.footerLine));
  return `${head({ title, description, path, jsonLd })}
<body class="is-legal">
${bar(gizlilik.whatsappText)}
<main id="main">
  <section class="hero hero--plain">
    <div class="hero__txt">
      <nav class="crumb" aria-label="Site haritası"><a href="/">Ana sayfa</a> / <span aria-current="page">Gizlilik politikası</span></nav>
      <h1>${words(gizlilik.h1)}</h1>
      <p class="lead">${esc(gizlilik.lead)}</p>
      <p class="note mono">${esc(upperTR(gizlilik.updated))}</p>
    </div>
  </section>
  ${gizlilik.sections.map((s, i) => `<section class="sec sec--narrow" aria-labelledby="g${i}"><div class="sec__head"><h2 id="g${i}">${esc(s.h2)}</h2></div><div class="prose">${s.p.map(p => `<p>${link(p)}</p>`).join('')}</div>${s.cards ? `<ul class="cards">${s.cards.map(c => `<li><h3>${esc(c.h3)}</h3><p>${esc(c.p)}</p></li>`).join('')}</ul>` : ''}</section>`).join('')}
</main>
${footer()}
</body></html>`;
}

function notFound() {
  return `${head({ title: 'Sayfa Bulunamadı | Securis', description: 'Aradığınız sayfa bulunamadı. Securis ana sayfasına dönün veya doğrudan bizimle iletişime geçin.', robots: 'noindex, follow', noCanonical: true, social: false })}
<body>
${bar()}
<main id="main">
  <section class="hero">
    ${grade('kurulum-sonu.jpg', '#374151')}
    <div class="hero__txt">
      <nav class="crumb" aria-label="Site haritası"><a href="/">Ana sayfa</a> / <span aria-current="page">404</span></nav>
      <h1>${words('Bu sayfa kadrajın dışında kaldı.')}</h1>
      <p class="lead">Aradığınız sayfa taşınmış ya da hiç olmamış olabilir. Hizmetlerimize aşağıdan ulaşabilir ya da bize doğrudan yazabilirsiniz.</p>
      ${btns(site.defaultWhatsappText, `<a class="btn btn--line" href="/">${I.arrow}<span>Ana sayfa</span></a>`)}
    </div>
    ${sheet(null, 'Hizmetler')}
  </section>
</main>
${footer()}
</body></html>`;
}

function sitemap() {
  const lastmod = new Date().toLocaleDateString('sv-SE'); // local date, YYYY-MM-DD
  const urls = [{ loc: '/', f: 'weekly', p: '1.0' }, ...hizmetler.map(h => ({ loc: `/hizmetler/${h.slug}/`, f: 'monthly', p: '0.8' })), ...bolgeler.map(b => ({ loc: `/bolgeler/${b.slug}/`, f: 'monthly', p: '0.7' })), { loc: '/gizlilik-politikasi/', f: 'yearly', p: '0.3' }];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${abs(u.loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${u.f}</changefreq>\n    <priority>${u.p}</priority>\n  </url>`).join('\n')}
</urlset>
`;
}

/* ---------- write ---------- */
mkdirSync(OUT, { recursive: true });
for (const e of readdirSync(OUT)) rmSync(new URL(e, OUT), { recursive: true, force: true }); // empty, keep the dir (a dev server may hold it)
cpSync(new URL('./public/', import.meta.url), OUT, { recursive: true, filter: s => !/\.(jpg|webp)\.json$/.test(s) }); // provenance notes stay in the repo
const put = (p, s) => { const f = fileURLToPath(new URL(p, OUT)); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, s); };
put('index.html', home());
hizmetler.forEach(h => put(`hizmetler/${h.slug}/index.html`, servicePage(h)));
bolgeler.forEach(b => put(`bolgeler/${b.slug}/index.html`, regionPage(b)));
put('gizlilik-politikasi/index.html', privacyPage());
put('404.html', notFound());
put('sitemap.xml', sitemap());
console.log(`built ${2 + hizmetler.length + bolgeler.length + 2} files → dist/`);

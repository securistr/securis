// Self-audit of dist/. HARD checks fail the run (exit 1); INFO lines are intentional or advisory.
// HARD: broken internal links/assets, h1 count, heading jumps, duplicate ids, html lang, mixed http,
//       indexable pages missing title/description/canonical/og, duplicate titles/descriptions,
//       JSON-LD that does not parse, lacks required fields, carries review markup, or whose FAQ
//       differs from the visible FAQ, sitemap vs noindex, robots.txt, CNAME, 404.html.
// INFO: title/description length, SEO differences against the old live build (SEC GÜNCEL/dist).
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';

const DIST = 'dist', LIVE = join('..', '..', 'SEC GÜNCEL', 'dist'), SITE = 'https://securis.com.tr';
const walk = d => readdirSync(d).flatMap(f => statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]);
const pages = walk(DIST).filter(f => f.endsWith('.html'));
const hard = [], info = [];
const tag = (h, re) => (h.match(re) || [])[1] || '';
const norm = s => s.replace(/&#39;|&apos;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const RE = { title: /<title>([^<]*)/, description: /name="description" content="([^"]*)/, canonical: /rel="canonical" href="([^"]*)/, robots: /name="robots" content="([^"]*)/, 'og:title': /property="og:title" content="([^"]*)/, 'og:url': /property="og:url" content="([^"]*)/, 'og:image': /property="og:image" content="([^"]*)/, 'og:description': /property="og:description" content="([^"]*)/ };
const types = n => [].concat(n?.['@type'] || []);
const nodes = ld => ld.flatMap(o => o['@graph'] || [o]);
const seen = { title: new Map(), description: new Map() };
const indexable = new Set();

for (const f of pages) {
  const h = readFileSync(f, 'utf8');
  const rel = f.slice(DIST.length).split(sep).join('/');
  const bad = m => hard.push(`${rel}: ${m}`);
  for (const [, u] of h.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) if (!existsSync(join(DIST, u.endsWith('/') ? u + 'index.html' : u))) bad(`broken ${u}`);
  for (const [, u] of h.matchAll(/(?:href|src|srcset|content|action)="(http:\/\/[^"]*)/g)) bad(`mixed http ${u}`);
  if (!/<html lang="tr"/.test(h)) bad('html lang is not "tr"');
  const h1s = (h.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) bad(`${h1s} h1`);
  let prev = 0;
  for (const [, l] of h.matchAll(/<h([1-6])[\s>]/g)) { if (+l > prev + 1) bad(`heading jumps h${prev} → h${l}`); prev = +l; }
  const ids = [...h.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) bad(`duplicate ids ${dup}`);

  const v = Object.fromEntries(Object.entries(RE).map(([k, re]) => [k, norm(tag(h, re))]));
  const isIndexable = !/noindex/.test(v.robots);
  if (isIndexable) {
    for (const k of ['title', 'description', 'canonical', 'og:title', 'og:url', 'og:image']) if (!v[k]) bad(`missing ${k}`);
    if (v.canonical && v['og:url'] !== v.canonical) bad('og:url differs from canonical');
    for (const k of ['title', 'description']) { if (seen[k].has(v[k])) bad(`duplicate ${k} (also ${seen[k].get(v[k])})`); else seen[k].set(v[k], rel); }
    if ([...v.title].length > 60) info.push(`${rel}: title ${[...v.title].length} chars`);
    const dl = [...v.description].length; if (dl < 120 || dl > 165) info.push(`${rel}: description ${dl} chars`);
    indexable.add(v.canonical);
  }

  let ld = [];
  for (const [, j] of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { ld.push(JSON.parse(j)); } catch (e) { bad(`JSON-LD does not parse: ${e.message}`); } }
  const all = nodes(ld), txt = JSON.stringify(ld);
  if (/"(AggregateRating|Review)"/.test(txt)) bad('review / rating markup in JSON-LD');
  for (const n of all) {
    const t = types(n);
    if (t.includes('LocalBusiness') && !(n.name && n.address?.streetAddress && n.address?.addressLocality && n.telephone && n.url)) bad('LocalBusiness missing name/address/telephone/url');
    if (t.includes('Service') && !(n.name && n.provider)) bad(`Service ${n['@id'] || ''} missing name/provider`);
    if (t.includes('FAQPage')) {
      const q = (n.mainEntity || []).map(m => m.name);
      if (!q.length || n.mainEntity.some(m => !m.name || !m.acceptedAnswer?.text)) bad('FAQPage without questions/answers');
      const visible = [...h.matchAll(/<summary><span>([^<]*)<\/span>/g)].map(m => norm(m[1]));
      if (JSON.stringify(q) !== JSON.stringify(visible)) bad('FAQPage JSON-LD does not match the visible FAQ');
    }
  }

  const lf = join(LIVE, rel);
  if (!existsSync(lf)) { info.push(`${rel}: no live counterpart (new page)`); continue; }
  const l = readFileSync(lf, 'utf8');
  const changed = ['title', 'description', 'canonical', 'robots', 'og:description'].filter(k => v[k] !== norm(tag(l, RE[k])));
  const ll = [...l.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1].trim());
  if (JSON.stringify(ld) !== JSON.stringify(ll.map(s => { try { return JSON.parse(s); } catch { return s; } }))) changed.push('JSON-LD');
  if (changed.length) info.push(`${rel}: differs from live build in ${changed.join(', ')} (intentional SEO change)`);
}

// sitemap, robots, GitHub Pages files
const sm = existsSync(join(DIST, 'sitemap.xml')) ? readFileSync(join(DIST, 'sitemap.xml'), 'utf8') : '';
if (!sm) hard.push('sitemap.xml missing');
const locs = [...sm.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1]);
for (const u of locs) {
  const p = join(DIST, u.slice(SITE.length) + (u.endsWith('/') ? 'index.html' : ''));
  if (!existsSync(p)) hard.push(`sitemap: ${u} has no page`);
  else if (/name="robots" content="[^"]*noindex/.test(readFileSync(p, 'utf8'))) hard.push(`sitemap: ${u} is noindex`);
}
for (const u of indexable) if (!locs.includes(u)) hard.push(`sitemap: indexable ${u} missing`);
const today = new Date().toLocaleDateString('sv-SE');
if ([...sm.matchAll(/<lastmod>([^<]*)/g)].some(m => m[1] !== today)) info.push(`sitemap: lastmod is not ${today}`);
const robots = existsSync(join(DIST, 'robots.txt')) ? readFileSync(join(DIST, 'robots.txt'), 'utf8') : '';
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) hard.push('robots.txt missing Sitemap line');
if (/^Disallow:\s*\/\s*$/m.test(robots)) hard.push('robots.txt disallows everything');
if (readFileSync(join(DIST, 'CNAME'), 'utf8').trim() !== 'securis.com.tr') hard.push('CNAME is not securis.com.tr');
if (!existsSync(join(DIST, '404.html'))) hard.push('404.html missing');

console.log(`${pages.length} pages checked, ${indexable.size} indexable, ${locs.length} sitemap URLs`);
console.log(info.length ? `INFO\n  ${info.join('\n  ')}` : 'INFO none');
console.log(hard.length ? `HARD FAILURES\n  ${hard.join('\n  ')}` : 'HARD checks passed');
process.exitCode = hard.length ? 1 : 0;

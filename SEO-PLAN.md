# Securis — local SEO plan

Goal: rank for "<ilçe> + service" queries across the 9 service districts ("Silivri güvenlik kamerası", "silivri firewall", "çatalca kamera", "çatalca bilgi işlem hizmeti", …) and win the Google local pack around Silivri.

## 1. Keyword → page matrix

Rule: **district pages** are the primary target for "<ilçe> + service". **Service pages** are the primary target for the generic query, "Silivri + service" and "İstanbul batı / Trakya + service". For Silivri (the office's own district) the service pages lead on single-service queries and `/bolgeler/silivri/` leads on the umbrella ones ("silivri bilgi işlem", "silivri güvenlik sistemleri", "silivri kamera ve network"). Watch this in Search Console (§5).

Intent groups (the same keyword families are used on every page):

| Intent | Keyword family | Service page (generic, Silivri, Trakya) |
|---|---|---|
| CAM | güvenlik kamerası, kamera sistemi, IP kamera, kamera kurulumu, NVR, kayıt cihazı | `/hizmetler/ip-kamera-sistemleri/` |
| FW | firewall, FortiGate, güvenlik duvarı, VPN | `/hizmetler/firewall-yapilandirma/` |
| NET | network, switch, VLAN, bilgi işlem altyapısı, kablolama | `/hizmetler/switch-konfigurasyonu/` |
| WIFI | Wi-Fi, access point, kablosuz ağ | `/hizmetler/access-point-kurulumu/` |
| NAS | NAS, veri yedekleme, RAID, dosya sunucusu | `/hizmetler/depolama-yedekleme/` |

NVR, kayıt cihazı and kamera kaydı belong to CAM since 2026-10-03 (a camera installer does the NVR too). The old `/hizmetler/nvr-depolama/` URL is a noindex page with a 0-second refresh to `/hizmetler/ip-kamera-sistemleri/`; Search Console should show it as a redirect within a few weeks.

District × intent. Every cell points to the **district page**, and each page has its own H3 section for that intent. Since 2026-10-04 the FW, WIFI and NAS headings use searcher wording: "<İlçe> işyeri ağ güvenliği ve firewall kurulumu", "<İlçe>: Wi-Fi çekmiyor mu? Access point kurulumu", "<İlçe> veri yedekleme ve NAS kurulumu" (district × firewall/NAS searches are near zero; "wifi çekmiyor", "veri yedekleme" and "işyeri ağ güvenliği" are what people type). Breadcrumb JSON-LD is two levels (Ana Sayfa → page) without fragment hops; the home page carries none.

| District (URL) | CAM (+ NVR) | FW | NET / bilgi işlem | WIFI | NAS | Page angle (unique copy) |
|---|---|---|---|---|---|---|
| Silivri `/bolgeler/silivri/` | Silivri güvenlik kamerası ve NVR kurulumu | Silivri firewall kurulumu | Silivri bilgi işlem ve ağ altyapısı | Silivri Wi-Fi ve access point kurulumu | Silivri NAS kurulumu ve veri yedekleme | HQ district, coastal sites and villas, central shops, farms |
| Çatalca `/bolgeler/catalca/` | Çatalca güvenlik kamerası ve NVR kurulumu | Çatalca firewall kurulumu | Çatalca bilgi işlem ve ağ altyapısı | Çatalca Wi-Fi … | Çatalca NAS … | large area, farms, warehouses, weak fixed internet, links between buildings |
| Büyükçekmece `/bolgeler/buyukcekmece/` | Büyükçekmece güvenlik kamerası … | … firewall … | … network ve bilgi işlem altyapısı | … Wi-Fi … | … NAS … | housing sites (management access rights), shops on main streets, Kumburgaz/Mimarsinan |
| Beylikdüzü `/bolgeler/beylikduzu/` | … | … | … | … | … | plazas, offices, residences, office moves, multi-floor Wi-Fi |
| Çorlu `/bolgeler/corlu/` | … | … | … | … | … | factories, Çorlu OSB, dust, fiber backbone, shift work |
| Çerkezköy `/bolgeler/cerkezkoy/` | … | … | … | … | … | Çerkezköy OSB, remote access from HQ over VPN, segmentation |
| Marmaraereğlisi `/bolgeler/marmaraereglisi/` | … | … | … | … | … | seasonal: empty summer houses, seasonal restaurants, guest Wi-Fi, salty air |
| Kapaklı `/bolgeler/kapakli/` | … | … | … | … | … | next to the Çerkezköy industry, workshops and depots, new housing, retrofitted cabling |
| Süleymanpaşa `/bolgeler/tekirdag/` | … | … | … | … | … | Tekirdağ city centre: retail, clinics, offices, multi-branch, coastal hospitality |

("…" = same pattern: "<İlçe> <service> kurulumu", visible as the H3 on that page.)

Long-tail questions answered in the visible FAQ plus FAQPage markup: "<ilçe>'de kamera kurulumu ne kadar sürer?", "arızada ne kadar sürede geliyorsunuz?", "<ilçe>'de bilgi işlem hizmeti kapsamında neler yapıyorsunuz?" (framed as network/IT infrastructure. No PC repair or software is offered).

Home (`/`) stays the brand + "Silivri kamera sistemleri" page. It links to every district and service.

## 2. Internal link mesh

- Service page → 9 district pages, in the "Hizmet verdiğimiz ilçeler" grid, with anchors "<İlçe> güvenlik kamerası" / "<İlçe> firewall kurulumu" / "<İlçe> bilgi işlem altyapısı" / "<İlçe> Wi-Fi kurulumu" / "<İlçe> NAS ve yedekleme".
- District page → 5 service pages, one link under each service section, with anchors "Güvenlik kamerası kurulumu", "FortiGate firewall kurulumu", "Switch ve network altyapısı", "Access point ve Wi-Fi kurulumu", "NAS kurulumu ve veri yedekleme". These are deliberately *not* "<ilçe> + service", so a district page does not hand its own query to the service page.
- District page → 3 neighbouring districts. Hero contact sheet → 5 services. Menu → all 14 pages.

## 3. Structured data (per page type)

- All pages (since 2026-10-04, previously home only): LocalBusiness `#business` (NAP from `data/site.json`, `geo`, `hasMap`, `sameAs` Maps + Instagram, `areaServed` = 9 districts as City with `containedInPlace` İstanbul/Tekirdağ). Opening hours are left out on purpose (owner request).
- District pages: WebPage, BreadcrumbList, 5 × Service (`areaServed` = that district, `provider` → `#business`, `isRelatedTo` → the service page's Service), FAQPage identical to the visible FAQ.
- Service pages: Service (areaServed = 9 districts), WebPage, BreadcrumbList, FAQPage.
- No AggregateRating/Review markup anywhere. Google does not show self-serving review stars, and the Google reviews on the home page stay plain HTML. `node audit.mjs` fails the build if one appears.
- Note: since 2023 Google shows FAQ rich results only for authoritative government/health sites. The markup is still valid and still helps Google understand the page. Don't expect FAQ snippets.

## 4. Launch checklist (GitHub Pages)

`node build.mjs && node audit.mjs` must print "HARD checks passed".

- [x] `public/CNAME` = `securis.com.tr`, copied to `dist/`
- [x] `public/.nojekyll` (empty) is copied to `dist/` so the Jekyll step leaves the output alone
- [x] `dist/404.html` at the root, noindex, no canonical
- [x] `robots.txt` allows all and lists `Sitemap: https://securis.com.tr/sitemap.xml`
- [x] `sitemap.xml`: 16 indexable URLs, `lastmod` = build date, with no noindex pages
- [x] Canonical, OG and Twitter tags on every indexable page, `html lang="tr"`, `robots` index on real pages
- [x] `/ornek/hero-projeler/` is noindex, nofollow and not in the sitemap. **Recommendation: drop it from the production build** (remove the `put('ornek/…')` line in `build.mjs` before deploying). It is a design sample, it duplicates the menu and footer, and a crawlable noindex page earns nothing.
- [x] No mixed `http://` references. No broken internal links. One h1 per page with no heading-level jumps. No duplicate ids.
- [ ] In the repo settings, set Pages to the custom domain `securis.com.tr` and tick **Enforce HTTPS** once the certificate is issued
- [ ] DNS: apex A records to GitHub Pages (185.199.108–111.153) and `www` CNAME to `<user>.github.io`, so both hosts resolve and `www` redirects to the apex
- [ ] After deploy, spot-check `https://securis.com.tr/bolgeler/catalca/`, `/sitemap.xml`, `/robots.txt` and a random 404 URL

## 5. Off-site actions (owner: must be done by hand, these matter most for the local pack)

### Google Business Profile
1. **Primary category:** "Güvenlik sistemi tedarikçisi" (Security system supplier). If GBP offers a closer "güvenlik kamerası / CCTV" installer category, use that instead.
   **Secondary:** "Bilgisayar ağı hizmeti" (Computer networking service), "Güvenlik sistemi montaj hizmeti" (Security system installer), "Kablolama / Telekomünikasyon hizmeti" if listed. Don't pick "Bilgisayar tamir servisi". The business doesn't do that.
2. **Service areas:** add all 9: Silivri, Çatalca, Büyükçekmece, Beylikdüzü (İstanbul), Çorlu, Çerkezköy, Marmaraereğlisi, Kapaklı, Süleymanpaşa (Tekirdağ). Keep the address visible, since the office in Alipaşa, Silivri, is a real location customers can visit.
3. **Services list:** one entry per service with the site's wording: Güvenlik kamerası (IP kamera) kurulumu, FortiGate firewall kurulumu, Switch / VLAN ve network altyapısı, Access point / Wi-Fi kurulumu, NAS kurulumu ve veri yedekleme. Also add Ücretsiz keşif. Link each to its `/hizmetler/…/` page.
4. **Website link:** `https://securis.com.tr/`. Hours must match the real hours (the site no longer publishes them, so GBP is the source of truth).
5. **Photos:** real install photos only, not stock (camera on a façade, rack and switch, AP on a wall, NVR screen at handover). Add a few every month. Don't show client names or faces.
6. **Reviews:** after every handover, send the review link over WhatsApp (GBP → "Ask for reviews" link). Ask steadily, a few every week, not in bursts. Reply to every review. Never offer anything in return for reviews, and never add review markup to the site.
7. **Posts:** a short post with a photo every 1–2 weeks, tied to a district when that's true ("Çerkezköy'de bir depoda Wi-Fi ve kamera teslimi"), with no client names.

### NAP consistency
Use exactly the same name, address and phone everywhere:
`Securis Ağ ve Kamera Güvenlik Sistemleri — Alipaşa Mah. Minare Sk. No:15, 34570 Silivri / İstanbul — +90 541 924 8987`
Check and fix: Google Business Profile, Instagram @securistr bio, Apple Business Connect (Apple Maps), Bing Places, Yandex Business (widely used in Türkiye), Foursquare, and Turkish directories that already list the business. Note that `public/manifest.json` says "Securis Güvenlik ve Ağ Sistemleri" (the alternateName). That doesn't hurt, but pick one name for listings.

### Google Search Console
1. Add a **Domain property** `securis.com.tr` and verify it with the DNS TXT record at the registrar.
2. Submit `https://securis.com.tr/sitemap.xml`.
3. URL Inspection → **Request indexing** for `/`, the 5 service pages and the 9 district pages (a few per day is fine).
4. After 4–6 weeks, go to Performance → Queries, filter by district names, and check which URL ranks for each "<ilçe> + service" query. If a service page outranks its district page (or `/` outranks `/bolgeler/silivri/`), strengthen the district page's section rather than adding more pages.

### Bing Webmaster Tools
Import the site straight from Search Console (one click), then submit the sitemap. Bing also feeds DuckDuckGo and Yahoo, and some voice assistants.

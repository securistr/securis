/* ─────────────────────────────────────────────────────────────────────
   Securis — JSON-LD (schema.org) üreticileri

   Migration öncesinde her sayfanın JSON-LD'si elle yazılmıştı. Burada
   aynı yapılar site.json / bolgeler.json / hizmetler.json verisinden
   üretilir.

   KURAL: şema KAPSAMI daralmaz. Üretilen @graph, orijinal HTML'deki
   @graph ile derin karşılaştırmadan (scripts/verify-schema.mjs) geçmek
   zorundadır — düğüm sırası ve alan sırası dahil.
   ───────────────────────────────────────────────────────────────────── */

import site from '../data/site.json';

const BUSINESS_ID = `${site.url}/#business`;
const WEBSITE_ID = `${site.url}/#website`;

/** Mutlak URL üretir: abs('/bolgeler/silivri/') -> https://securis.com.tr/bolgeler/silivri/ */
export const abs = (pathname) => `${site.url}${pathname}`;

/** JSON-LD'yi <script> içine güvenle gömmek için serileştirir. */
export const serialize = (obj) =>
  JSON.stringify(obj, null, 2).replace(/</g, '\\u003c');

const city = (name) => ({ '@type': 'City', name });

/** Tüm hizmet bölgeleri, ana sayfadaki areaServed sırasıyla. */
const areaServedCities = (bolgeler) => bolgeler.map((b) => city(b.cityName));

// ── LocalBusiness ─────────────────────────────────────────────────────
function localBusiness(bolgeler, hizmetler) {
  return {
    '@type': 'LocalBusiness',
    '@id': BUSINESS_ID,
    name: site.name,
    url: `${site.url}/`,
    image: abs(site.ogImage),
    logo: abs(site.logo),
    description: site.description,
    telephone: site.phones.map((p) => p.e164),
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.streetAddress,
      addressLocality: site.address.addressLocality,
      addressRegion: site.address.addressRegion,
      postalCode: site.address.postalCode,
      addressCountry: site.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    areaServed: areaServedCities(bolgeler),
    openingHoursSpecification: site.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dayOfWeek,
      opens: h.opens,
      closes: h.closes,
    })),
    priceRange: site.priceRange,
    currenciesAccepted: site.currenciesAccepted,
    sameAs: [site.mapUrl, site.instagram],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Hizmetler',
      itemListElement: hizmetler.map((h) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: h.anaSayfaSchema.name },
      })),
    },
    alternateName: site.alternateName,
    hasMap: site.mapUrl,
  };
}

// ── WebSite ───────────────────────────────────────────────────────────
const webSite = () => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${site.url}/`,
  name: site.name,
  inLanguage: site.inLanguage,
  publisher: { '@id': BUSINESS_ID },
});

// ── BreadcrumbList ────────────────────────────────────────────────────
/** @param {{name:string,item:string}[]} items */
function breadcrumb(items, id) {
  const node = {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
  // Ana sayfadaki breadcrumb'ın @id'si vardı, alt sayfalarınkinin yoktu.
  return id ? { '@type': 'BreadcrumbList', '@id': id, itemListElement: node.itemListElement } : node;
}

// ── FAQPage ───────────────────────────────────────────────────────────
/**
 * @param {{q:string,a:string,aSchema?:string}[]} items
 * `aSchema` yalnızca ana sayfada, görünür metinle şema metninin
 * production'da FARKLI olduğu 3 soru için vardır (bkz. rapor).
 */
function faqPage(items, id) {
  const node = {
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.aSchema ?? it.a },
    })),
  };
  return id ? { '@type': 'FAQPage', '@id': id, mainEntity: node.mainEntity } : node;
}

// ══ SAYFA ŞEMALARI ════════════════════════════════════════════════════

/** Ana sayfa: LocalBusiness, WebSite, BreadcrumbList, Service×5, FAQPage */
export function homeSchema({ bolgeler, hizmetler, sss }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      localBusiness(bolgeler, hizmetler),
      webSite(),
      breadcrumb(
        [
          { name: 'Ana Sayfa', item: `${site.url}/` },
          { name: 'Hizmetler', item: `${site.url}/#services` },
          { name: 'Hizmet Bölgeleri', item: `${site.url}/#region` },
        ],
        `${site.url}/#breadcrumb`
      ),
      ...hizmetler.map((h) => ({
        '@type': 'Service',
        '@id': abs(`/hizmetler/${h.slug}/#service`),
        serviceType: h.anaSayfaSchema.serviceType,
        name: h.anaSayfaSchema.name,
        description: h.anaSayfaSchema.description,
        url: abs(`/hizmetler/${h.slug}/`),
        provider: { '@id': BUSINESS_ID },
        areaServed: areaServedCities(bolgeler),
      })),
      faqPage(sss, `${site.url}/#faq`),
    ],
  };
}

/** Hizmet sayfası: Service, WebPage, BreadcrumbList, FAQPage */
export function hizmetSchema(hizmet, bolgeler) {
  const url = abs(`/hizmetler/${hizmet.slug}/`);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        serviceType: hizmet.kisaAd,
        name: hizmet.h1,
        description: hizmet.description,
        url,
        provider: { '@id': BUSINESS_ID },
        areaServed: areaServedCities(bolgeler),
      },
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: hizmet.title,
        description: hizmet.description,
        inLanguage: site.inLanguage,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': BUSINESS_ID },
      },
      breadcrumb([
        { name: 'Ana Sayfa', item: `${site.url}/` },
        { name: 'Hizmetler', item: `${site.url}/#services` },
        { name: hizmet.breadcrumbName, item: url },
      ]),
      faqPage(hizmet.sss.items),
    ],
  };
}

/** Bölge sayfası: WebPage (+primaryImageOfPage), BreadcrumbList, FAQPage */
export function bolgeSchema(bolge) {
  const url = abs(`/bolgeler/${bolge.slug}/`);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: bolge.title,
        description: bolge.description,
        inLanguage: site.inLanguage,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': BUSINESS_ID },
        primaryImageOfPage: { '@type': 'ImageObject', url: abs(site.ogImage) },
      },
      breadcrumb([
        { name: 'Ana Sayfa', item: `${site.url}/` },
        { name: 'Bölgeler', item: `${site.url}/#region` },
        { name: bolge.ad, item: url },
      ]),
      faqPage(bolge.sss.items),
    ],
  };
}

/** Gizlilik sayfası: WebPage, BreadcrumbList */
export function gizlilikSchema({ title, description }) {
  const url = abs('/gizlilik-politikasi/');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: title,
        description,
        inLanguage: site.inLanguage,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': BUSINESS_ID },
      },
      breadcrumb([
        { name: 'Ana Sayfa', item: `${site.url}/` },
        { name: 'Gizlilik Politikası', item: url },
      ]),
    ],
  };
}

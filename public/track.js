/* Securis — measurement, loaded only when data/site.json has an analytics ID (build.mjs adds this tag).
   KVKK: nothing from Google loads and no cookie is set until the visitor says "Kabul et"; the choice lives in
   localStorage ('consent': 'yes' | 'no') and can be changed from the footer's "Çerez tercihleri".
   Conversions: a click on a WhatsApp or tel: link → GA4 event (whatsapp_click / phone_click), and a Google Ads
   conversion when its label is set. Ad personalisation stays denied: this measures, it does not retarget. */
(() => {
  const s = document.currentScript.dataset, KEY = 'consent';
  const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const set = v => { try { localStorage.setItem(KEY, v); } catch {} };
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }

  let on = false;
  function load() {
    if (on) return; on = true;
    gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied' });
    gtag('js', new Date());
    if (s.ga4) gtag('config', s.ga4);
    if (s.ads) gtag('config', s.ads);
    const tag = document.createElement('script');
    tag.async = true; tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(s.ga4 || s.ads);
    document.head.appendChild(tag);
  }
  function forget() { // a "no" after a "yes": drop Google's first-party cookies, then start clean
    document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(n => /^(_ga|_gid|_gcl|_gat)/.test(n))
      .forEach(n => { document.cookie = `${n}=; Max-Age=0; path=/`; document.cookie = `${n}=; Max-Age=0; path=/; domain=.${location.hostname.replace(/^www\./, '')}`; });
  }

  function banner() {
    if (document.querySelector('.consent')) return;
    const d = document.createElement('div');
    d.className = 'consent'; d.setAttribute('role', 'region'); d.setAttribute('aria-label', 'Çerez tercihi');
    d.innerHTML = '<p>Sitemizi kaç kişinin ziyaret ettiğini ve reklamlarımızın işe yarayıp yaramadığını ölçmek için Google Analytics ve Google Ads çerezlerini kullanmak istiyoruz. <a href="/gizlilik-politikasi/#cerez">Ayrıntılar</a></p>'
      + '<div class="consent__btns"><button type="button" data-c="no">Reddet</button><button type="button" data-c="yes">Kabul et</button></div>';
    d.addEventListener('click', e => {
      const b = e.target.closest('[data-c]'); if (!b) return;
      const yes = b.dataset.c === 'yes', was = get();
      set(yes ? 'yes' : 'no'); d.remove(); document.documentElement.classList.remove('consent-open');
      if (yes) load(); else if (was === 'yes') { forget(); location.reload(); }
    });
    document.body.appendChild(d); document.documentElement.classList.add('consent-open');
  }

  const c = get();
  if (c === 'yes') load(); else if (c !== 'no') document.readyState === 'loading' ? addEventListener('DOMContentLoaded', banner) : banner();
  document.addEventListener('click', e => { if (e.target.closest('[data-consent-open]')) banner(); });

  // the site's conversions: WhatsApp and phone taps
  document.addEventListener('click', e => {
    if (!on) return;
    const a = e.target.closest('a[href^="https://wa.me/"], a[href^="tel:"]'); if (!a) return;
    const wa = a.href.startsWith('https://wa.me/'), label = wa ? s.adsWa : s.adsCall;
    gtag('event', wa ? 'whatsapp_click' : 'phone_click', { link_url: a.href.split('?')[0], page_path: location.pathname, transport_type: 'beacon' });
    if (s.ads && label) gtag('event', 'conversion', { send_to: `${s.ads}/${label}`, transport_type: 'beacon' });
  });
})();

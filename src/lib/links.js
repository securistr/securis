/* ─────────────────────────────────────────────────────────────────────
   Securis — İletişim linki üreticileri
   ───────────────────────────────────────────────────────────────────── */

/**
 * RFC 3986 uyumlu tam kodlama.
 *
 * `encodeURIComponent` şu karakterleri KAÇIRMAZ: ! ' ( ) *
 * Production'daki elle yazılmış wa.me linkleri ise bunları kodluyordu
 * (ör. "Silivri'deki" → "Silivri%27deki"). İşlevsel olarak ikisi de aynı
 * çalışır; byte düzeyinde parite için orijinaldeki kodlama korunur.
 */
export const encodeStrict = (s) =>
  encodeURIComponent(s).replace(
    /[!'()*]/g,
    (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()
  );

/** WhatsApp linki: hazır mesaj metniyle birlikte. */
export const waHref = (phoneWa, text) => `https://wa.me/${phoneWa}?text=${encodeStrict(text)}`;

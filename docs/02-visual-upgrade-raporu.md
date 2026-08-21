# Securis — Faz 2: Premium Visual Upgrade Sonuç Raporu

> Faz 1 (Astro migration) tamamlanmıştı ve site mimari olarak sağlamdı ama
> görsel olarak hâlâ eski tasarımdı. Faz 2'nin hedefi: ziyaretçinin ilk
> saniyelerde Securis'i ciddi, teknik ve premium bir altyapı firması olarak
> algılaması — Faz 1'de kazanılan hiçbir şeyi kaybetmeden.

---

## A. Başlangıçta çözülen problemler

Faz 1 raporunun 15. bölümünde bilinçli olarak açık bırakılan teknik borçlar,
redesign'a başlamadan önce temizlendi.

### A.1 FAQ / FAQPage şema tutarsızlığı — çözüldü

Ana sayfada 7 SSS sorusunun 3'ünde **görünen cevap ile JSON-LD cevabı
farklıydı** (production'dan gelen eski bir tutarsızlık). Örneğin:

| | Metin |
|---|---|
| Görünen (eski) | "…maksimum 3 saat içinde yerinde müdahale ediyoruz. **Kurulumunu yaptığımız sistemler 1 yıl servis garantisi kapsamındadır.**" |
| Şema (eski) | "…maksimum 3 saat içinde yerinde müdahale ediyoruz." |

**Kullanıcıya görünen cevap tek kaynak kabul edildi.** `aSchema` alanı veri
modelinden tamamen kaldırıldı; `FAQPage` şeması artık doğrudan görünen metinden
üretiliyor. Alt sayfalardaki 42 doğru eşleşme bozulmadı.

Kalıcı koruma: SEO regresyon testi her sayfada `görünür cevap == şema cevabı ==
veri` üçlüsünü karşılaştırıyor; ayrışma tekrar oluşursa test kırılır.

### A.2 Mobil menü Escape davranışı — çözüldü

Ana sayfada Escape ile kapatma ve `aria-label` güncellemesi yoktu; alt
sayfalarda vardı. `initMobileMenu()` artık seçenek almıyor, tüm sayfalarda aynı:

- Escape menüyü kapatır **ve odağı butona geri verir**
- `aria-expanded` + `aria-label` birlikte güncellenir
- menü açıkken `body` kaydırması kilitlenir
- masaüstü genişliğine geçilirse durum temizlenir

4 sayfa tipinde otomatik test edildi, dördü de geçiyor.

### A.3 CSS token ayrışması — çözüldü

Çelişen 7 token (`--shadow`, `--shadow-hover`, `--space-xs/sm/md/lg/xl`)
körlemesine birinden seçilmedi; **yeni tasarım sisteminin parçası olarak
yeniden tasarlandı**:

- Boşluk: 4px tabanlı tek ritim (`--space-3xs` … `--space-3xl`) + akışkan
  `--section`, `--gutter`, `--stack`, `--grid-gap`
- Gölge: dört kademeli tek ölçek (`--shadow-xs/sm/md/lg`) + koyu yüzeyler için
  `--shadow-ink`, sinyal için `--shadow-signal`. Gölgeler nötr siyah değil
  mavimsi — açık lacivert zeminde siyah gölge kirli görünüyordu.

Artık hiçbir sayfa kendi paralel token setini taşımıyor.

### A.4 npm audit — 3 açıktan 1'e indi

| | Önce | Sonra |
|---|---|---|
| Toplam | 3 (1 low, 2 high) | **1 (high)** |

`package.json` içine **non-breaking** `overrides` eklendi:

```json
"overrides": { "sharp": "^0.35.0", "esbuild": "^0.28.1" }
```

- **sharp** `0.34.5 → 0.35.3` (libvips CVE'leri) — Astro'nun *optional*
  bağımlılığı, bu projede görsel optimizasyon hiç kullanılmıyor.
- **esbuild** `0.27.7 → 0.28.2` (Windows dev-server dosya okuma açığı).

Doğrulama: override'lardan önce ve sonra build çıktısının **48 dosyasının
tamamı bayt düzeyinde aynı** kaldı (SHA-256 karşılaştırması).

**Kalan tek açık `astro`'nun kendisi** ve yalnızca `astro@7.2.4` ile kapanıyor —
breaking major. §1.5 gereği redesign'ın ortasında yapılmadı.

Production statik çıktıya etkisi: **yok.**
- 8 Astro advisory'sinin tamamı `define:vars`, server islands, spread props,
  view transitions, slot adları ve SSR hata sayfası ile ilgili. Projede
  **hiçbiri kullanılmıyor** (kod taramasıyla doğrulandı) ve `output` statik —
  production'da Astro runtime çalışmıyor.
- esbuild açığı yalnızca yerel `astro dev` sunucusunu ilgilendiriyordu.
- sharp/libvips açığı görsel işleme yapıldığında geçerli; yapılmıyor.

**Önerilen sonraki adım:** parite kabul edildikten sonra, redesign'dan bağımsız
ayrı bir iş olarak Astro 7 yükseltmesi (bkz. M bölümü).

### A.5 Ek olarak tespit edilip düzeltilen hatalar

| Hata | Nasıl bulundu |
|---|---|
| Global `nav { position: fixed }` kuralı sayfa içi `<nav class="breadcrumb">` öğesini de sabitleyip başlık çubuğuna yapıştırıyordu | görsel QA |
| Footer ve CTA bandındaki `.btn--ghost` metni koyu zeminde siyah kalıyor, okunmuyordu (1.1:1) | erişilebilirlik taraması |
| Hamburger kapatma ikonu X yerine ">" çiziliyordu (grid yerleşimi geometriyi bozuyordu) | görsel QA |
| JS çalışmazsa `.reveal` içerikleri kalıcı olarak görünmez kalıyordu | fonksiyonel test |
| `src/styles/seo-pages.css` yetim kalmıştı (hiçbir sayfa import etmiyordu) | temizlik |

---

## B. Görsel olarak ne değişti?

**Tasarım yönü: "kontrol odası".** Derin lacivert zemin, mühendislik
hassasiyetinde tipografi, mono teknik etiketler ve **sinyal olarak** kullanılan
camgöbeği — dekorasyon olarak değil.

Bölüm ritmi bilinçli olarak koyu/açık dönüşümlü, böylece sayfa "kutular
toplamı" değil tek bir akış gibi okunuyor:

```
hero (koyu) → markalar (koyu) → hizmetler (açık) → çözümler (koyu)
→ bölgeler (açık) → hakkımızda (açık) → SSS (açık) → iletişim (koyu) → footer (koyu)
```

| Bölüm | Önce | Sonra |
|---|---|---|
| **Navbar** | Koyu lacivert opak çubuk, logonun arkasında beyaz "etiket" plakası, imleç spotlight'ı | Hero üzerinde saydam başlar, kaydırınca 76→64px alçalıp cam çubuğa döner. Logo beyaz render (dosya değişmedi), plaka kaldırıldı. Aktif bölüm camgöbeği + tam alt çizgi |
| **Hero** | Açık zemin, orta boy başlık, 3 "showcase" kartı, glow orb'lar + radar süpürme | Koyu katmanlı kompozisyon: saha fotoğrafı (maskeli, hafif parallax) + blueprint ızgarası + tek yumuşak ışık + çok yavaş tarama çizgisi. Solda tipografik hiyerarşi, sağda **"Sistem Kapsamı" okuma paneli** (numaralı satırlar, canlı kayıt noktası), altta istatistik şeridi |
| **Markalar** | Açık zeminde marquee | Koyu zeminde sessiz marquee, kenarları maskeli, hover'da duruyor — hero'nun devamı gibi |
| **Hizmetler** | 5 eşit kart, ikon + başlık + paragraf | Asimetrik katalog: geniş öne çıkan kart **yatay yerleşimli** (büyük ikon solda), diğer 4'ü ızgarada. Numaralı, hover'da üst kenarda sinyal çizgisi ve ikon rengi tersine döner |
| **Çözümler** | Açık zeminde 3 görsel kart | Koyu zeminde editoryal görsel kartlar; görsel üzerine inen degrade, mono kategori etiketi, hover'da hafif zoom |
| **Bölgeler** | Çip ızgarası + not satırı | İki sütunlu başlık düzeni; "3 saat" garantisi ayrı bir vurgu kartında, arka planda maskeli bölge görseli |
| **Hakkımızda** | Yan yana metin + fotoğraf + kart | Fotoğrafın üzerine binen koyu istatistik kartı; özellikler onay işaretli ızgarada |
| **SSS** | Sol hizalı liste | Ortalanmış başlık + genişliği sınırlı liste; artı/eksi göstergesi 90° dönüyor |
| **İletişim** | 4 kart | Koyu zeminde cam kartlar, maskeli arka plan görseli, altta adres bloğu |
| **Footer** | 3 satırlık düz blok | 4 sütunlu yapı: marka + açıklama + Instagram, hizmetler, bölgeler, iletişim. NAP satırı yerel SEO için aynen korundu. **İç link ağı belirgin şekilde güçlendi** |
| **Alt sayfalar** | Ana sayfadan farklı, daha sönük bir sistem | Ana sayfa sisteminin gerçek devamı: aynı koyu hero dili, aynı token'lar. Hero'da **QuickFacts** paneli (9 ilçe / 3 saat / 1 yıl) |
| **Gizlilik** | Standart alt sayfa | Dar ölçü (`--container-narrow`), ağır animasyon yok, okunabilirlik öncelikli |
| **404** | Standart alt sayfa | Mono "404" filigranı + marka dili; derin yol davranışı korundu |

---

## C. Hero — önce / sonra yaklaşımı

**Önce:** açık zeminli bir bölüm; sol tarafta rozet + başlık + paragraf +
üç buton, sağ tarafta üç adet "showcase" kartı. Arka planda üç adet bulanık
`glow-orb` ve dönen bir `radar-sweep`. Sayfa girişinde tüm bölümlere uygulanan
3B `rotateX` efekti çalışıyordu.

**Sonra:** hero artık sitenin en güçlü ekranı.

1. **Zemin — dört katman.** Saha fotoğrafı (`hero-primary-bg.webp`) düşük
   opaklıkta, sağa doğru maskeli ve hafif parallax'lı; blueprint ızgarası;
   marka mavisi tek bir yumuşak ışık; 11 saniyelik çok yavaş tarama çizgisi
   (radar dili). Hepsi `pointer-events: none` — okunabilirlik önce gelir.

2. **Sol — tipografik hiyerarşi.** Mono eyebrow → oversized ama **kontrollü**
   H1 (`clamp(2.05rem, 3.9vw, 3.4rem)`) → 52ch ile sınırlı lead.

3. **CTA hiyerarşisi.** İki birincil buton (Hemen Ara / WhatsApp) + üçüncül
   "Ücretsiz Keşif Talep Et" **sessiz metin bağı**. İlk denemede üç buton yan
   yana sığmayıp üçüncüsü alt satıra düşüyor ve hiyerarşiyi bozuyordu.

4. **Sağ — "Sistem Kapsamı" okuma paneli.** Cam yüzey, mono başlık, numaralı
   üç satır, canlı kayıt noktası. Metinler Faz 1'deki showcase kartlarıyla
   **birebir aynı**; değişen yalnızca sunum.

5. **Alt — istatistik şeridi.** 9 ilçe / 3 saat / 1 yıl, ince ayraçla.

**Ölçülen sonuç:** 1440×900'de eyebrow, H1, lead, iki CTA, üçüncül bağ, not ve
istatistik şeridinin tamamı katlamanın içinde; bir sonraki bölümün etiketi
alttan görünerek kaydırmaya davet ediyor.

### İlk turdan sonra düzeltilenler (§42 eleştiri turu)

| Sorun | Düzeltme |
|---|---|
| H1 5 satıra çıkıp CTA'yı katlamanın altına itiyordu | display ölçeği `4.75rem` → `3.4rem`, dikey ritim sıkılaştırıldı |
| "Kamera Sistemleri" altındaki gradyan çizgi bir alt satıra binip üstü çizili gibi okunuyordu | çizgi kaldırıldı, vurgu yalnızca renkle |
| Fotoğraf başlığın arkasında kontrastı düşürüyordu | maske yönü çevrildi, opaklık 0.3→0.2 + 1px blur |
| Üç buton yan yana sığmıyordu | üçüncüsü sessiz metin bağına dönüştürüldü |

---

## D. Motion — ne kullanıldı, neden

Tüm süre ve eğriler merkezi token'lardan geliyor; hiçbir component kendi
rastgele süresini tanımlamıyor:

```css
--motion-fast: 160ms;  --motion-normal: 280ms;  --motion-slow: 520ms;  --motion-reveal: 720ms;
--ease-standard: cubic-bezier(.2,0,0,1);
--ease-out:      cubic-bezier(.16,1,.3,1);
--ease-emphasized: cubic-bezier(.2,.8,.2,1);
```

| Hareket | Neden |
|---|---|
| Scroll reveal (14px yukarı + opaklık) | Dikkati okuma sırasına yönlendirir. Tek eksen, kısa mesafe |
| Nav yükseklik + cam geçişi | "Sayfanın başındayım / içindeyim" durum bilgisi |
| Hero parallax (tek katman) | Derinlik hissi. Yalnızca `transform`, layout tetiklemez |
| Tarama çizgisi (11s) + kayıt noktası (2.4s) | Marka dili: radar / canlı izleme. İkisi de çok düşük kontrastlı |
| Kart hover: 2-3px kalkış + üst kenarda sinyal çizgisi | "Cihaz aydınlandı". `scale(1.15)` gibi oyuncak efektler yok |
| Ok ikonlarında 3-4px kayma | Yönlendirme sinyali |
| Marquee (42s, hover'da durur) | Sessiz, arka plan bilgisi |
| Mobil menüde sıralı öğe girişi | Panelin açıldığını anlatır |
| SSS akordiyon (Web Animations API) | Faz 1'den korundu — CSS transition + zorla reflow yöntemi görünür donma yapıyordu |

### Silindirik scroll motoru — kaldırıldı

Faz 1'de ana sayfada 300 satırlık bir motor vardı: tüm bölümlere scroll'a bağlı
`rotateX` + perspektif telafisi + damped lerp uygulayan, her karede 6 büyük
öğeye `transform`/`opacity`/`filter` yazan bir rAF döngüsü.

**Değerlendirme (§7):** fikir ilginçti ama bölümleri okuma sırasında 3B
döndürmek metni eğiyordu; kurumsal bir güvenlik firması için "premium" değil
"demo" hissi veriyordu. Ayrıca kaydırma boyunca sürekli çalışan bir döngü
gereksiz maliyetti.

**Fikrin kendisi (derinlik + kaydırmaya yanıt) korundu, daha kontrollü bir
dille yeniden yorumlandı:** hero fotoğraf katmanında tek öğeli parallax, içerik
bloklarında kısa reveal, bölüm zeminlerinde CSS tabanlı süreklilik.

**Ölçülen kazanç:** kaydırma sırasında oluşan uzun görev (long task) sayısı
**0**. Ana sayfa JS'i 4.87 KB → 1.6 KB (+2.3 KB ortak modül).

### Nav spotlight — kaldırıldı

Faz 1'de imleci takip eden bir radial gradient vardı. §13'teki "her elementte
glow" uyarısı doğrultusunda çıkarıldı; nav zaten saydam→cam geçişi, yükseklik
değişimi ve animasyonlu alt çizgilerle yeterince rafine. Geri istenirse
`chrome.css` içinde ~15 satırla eklenebilir.

---

## E. Dependency

**Yeni runtime dependency eklenmedi.** GSAP, Three.js/WebGL, animasyon
kütüphanesi, UI framework — hiçbiri yok.

```json
"dependencies": { "astro": "^5.14.1" }
"overrides":    { "sharp": "^0.35.0", "esbuild": "^0.28.1" }
```

`overrides` yeni paket eklemez; mevcut geçişli bağımlılıkların güvenli
sürümlerini zorlar (bkz. A.4).

**GSAP neden kullanılmadı (§16):** ihtiyaç duyulan hareketlerin tamamı —
reveal, hover, nav durumu, parallax, akordiyon — CSS geçişleri, `IntersectionObserver`
ve tek bir küçük rAF döngüsüyle temiz şekilde yapılabiliyor. Karmaşık bir scroll
koreografisi yok. Bundle maliyeti karşılığında bir kazanç olmazdı.

**WebGL/Three.js neden kullanılmadı (§17):** hero'nun etkisi kompozisyon,
tipografi ve katmanlı zeminden geliyor. WebGL sahnesi düşük cihazlarda
ağırlaşma ve fallback karmaşıklığı getirir; bu sitenin statik-hafif olma
avantajını zedeler.

**Toplam client JS:** ana sayfa **3.9 KB**, alt sayfalar **2.5 KB** (sıkıştırılmamış).

---

## F. Mobil

390 / 430 / 768 (ve ayrıca 1024 / 1440 / 1920) ölçüldü.

| | Sonuç |
|---|---|
| **Yatay taşma** | 7 sayfa × 6 viewport = **42 kombinasyonda sıfır** |
| **390 px** | Hero tek sütuna iner; H1 4 satır, lead, iki tam genişlik CTA, üçüncül bağ ve panelin üstü katlamada. Sağ panel altına geçer |
| **430 px** | Aynı düzen, daha rahat nefes |
| **768 px** | Hero tek sütun, QuickFacts yatay 3'lü şeride döner, kart ızgaraları 2 sütuna iner |
| **Mobil menü** | Tam ekran koyu panel, 1.32rem başlık ölçeğinde bağlantılar, sıralı giriş, altta tam genişlik CTA. `body` kaydırması kilitleniyor |
| **Mobil CTA barı** | Korundu; 62px yükseklik, sayfa yüklendikten 2.5 sn sonra tek seferlik nabız |
| **Dokunma hedefleri** | Tümü ≥ 24px (WCAG 2.2 AA). Butonlar 44-46px |
| **Mobilde sadeleştirilenler** | Hero parallax kapalı (`min-width: 981px` + `pointer: fine`), öne çıkan kart dikey yerleşime döner |

---

## G. Erişilebilirlik

Otomatik denetim: 5 sayfa tipi × (kontrast + başlık sırası + landmark + alt
metin + odak + dokunma hedefi).

| Kontrol | Sonuç |
|---|---|
| **Renk kontrastı (WCAG AA)** | Tüm metinler geçti — normal ≥4.5:1, büyük ≥3:1 |
| **Başlık sırası** | Her sayfada tek `h1`, seviye atlaması yok |
| **Landmark** | `header` / `main` / `footer` birer tane; her `nav` `aria-label`'lı |
| **Skip link** | Tüm sayfalarda; ilk Tab hedefi, görünür odak halkası |
| **Klavye odağı** | `:focus-visible` 2px sinyal halkası; koyu zeminde açık ton |
| **Escape** | Mobil menüyü kapatır, odağı butona iade eder |
| **`alt` metni** | Eksik yok |
| **Erişilebilir ad** | Adsız link/buton yok |
| **`lang`** | Tüm sayfalarda `tr` |
| **Dokunma hedefi** | <24px hedef yok |
| **`prefers-reduced-motion`** | Tek yerden tüm motion süreleri 1ms'e iner; reveal, parallax, marquee, tarama çizgisi, kayıt noktası ve nabız devre dışı |

**Sonuç: 0 hata, 0 uyarı.**

Düzeltilen gerçek kontrast hataları:
- `.eyebrow` / `.locales dt` / `.step::before`: `#0891b2` 12px'te 3.46:1 →
  küçük metin için `--signal-700` (`#0e7490`) tonu eklendi
- Marka şeridi: `rgba(169,188,221,.42)` 2.66:1 → `.62` opaklık
- CTA bandı ve footer'daki hayalet buton metni: **1.1:1** → `.on-ink` kapsamı

### İlerlemeli geliştirme

`.reveal` gizlemesi artık `.js` sınıfına bağlı. `<html>` etiketine `js` sınıfını
`BaseLayout` içindeki inline bir satır render'dan önce ekler. **JS çalışmazsa
içerik hiç gizlenmez.** Faz 1'deki `<noscript>` yamasından daha sağlam; test
edildi (JS kapalıyken 27 `.reveal` öğesinin tamamı görünür).

---

## H. Performans

| Ölçüm | Ana sayfa | Hizmet sayfası | Bölge sayfası |
|---|---|---|---|
| İstek | 20 | 14 | 14 |
| Toplam transfer | 810 KB | 326 KB | 325 KB |
| — görsel | 530 KB | 80 KB | 80 KB |
| — font | 182 KB | 182 KB | 182 KB |
| — CSS | 52 KB | 42 KB | 42 KB |
| — JS | **3.9 KB** | **2.5 KB** | **2.5 KB** |
| DOM düğümü | 484 | 302 | 273 |
| FCP | 124 ms | 64 ms | 60 ms |
| **CLS** | **0.0011** | **0.0004** | 0.0253 |
| Kaydırmada uzun görev | **0** | **0** | **0** |

Statik çıktı: **17 HTML + 48 dosya, 1.5 MB** (Faz 1: 1.4 MB — artış görsellerden
değil, ek CSS ve daha zengin footer/HTML'den).

### Yapılan optimizasyonlar

1. **Silindirik motor kaldırıldı** → kaydırma sırasında sıfır uzun görev,
   ana sayfa JS'i 4.87 KB → 1.6 KB.
2. **Inter 800 ağırlığı istekten çıkarıldı** — CSS'te hiç kullanılmıyordu.
3. **Yazı tipi geçiş kayması giderildi.** Google Fonts async yüklendiği için
   metin önce yedek fontla çizilip sonra yeniden akıyordu. `'Inter Fallback'`
   `@font-face` metrik uyumu (`size-adjust`, `ascent-override`) eklendi —
   **yazı tipi değişmedi**, yalnızca yedeğin ölçüleri hizalandı.
   **CLS: 0.0215 → 0.0011** (ana sayfa), 0.0019 → 0.0004 (hizmet).
4. Animasyonlar yalnızca `transform` ve `opacity` üzerinden; layout thrashing yok.
5. Hero parallax rAF döngüsü **yalnızca hero görünürken** çalışıyor
   (`IntersectionObserver` ile durduruluyor), sekme arka plandayken duruyor.
6. Reveal gözlemcisi öğeyi bir kez yakaladıktan sonra `unobserve` ediyor.

> Bölge sayfasındaki 0.0253 CLS, Space Grotesk başlığının yedek metrik uyumu
> olmamasından geliyor. "İyi" eşiğinin (0.1) çok altında. Kalıcı çözümü font
> self-hosting (bkz. M).

---

## I. SEO — değişiklik / regresyon var mı?

**Kapsam daralmadı. Tek kasıtlı değişiklik A.1'deki FAQ şeması düzeltmesi.**

| Alan | Durum |
|---|---|
| `title` / `description` / `canonical` / `robots` | 17 sayfada değişmedi |
| Open Graph (10 etiket) + Twitter card | Değişmedi; ana sayfanın farklı `og:description` / `twitter:description` değerleri korundu |
| `geo.region` / `geo.placename` | Korundu |
| `LocalBusiness` | Tam korundu (2 telefon, adres, koordinat, 2 çalışma saati bloğu, 9 areaServed, OfferCatalog/5 Offer) |
| `WebSite`, `Service` ×5, `BreadcrumbList` ×16 | Korundu |
| `FAQPage` ×15 | Korundu; ana sayfada 3 cevap **görünen metinle eşitlendi** |
| `sitemap.xml` | 16 URL, değişmedi |
| `robots.txt` | Dosyaya hiç dokunulmadı |
| CSP meta | 17 sayfada korundu |
| `h1` | Her sayfada tam olarak bir tane, veriyle birebir |

**Ek kazanç:** footer'daki 4 sütunlu yapı ve hizmet sayfalarındaki "Diğer
Hizmetler" bloğu ile **iç link ağı belirgin şekilde güçlendi** — hiçbir URL
eklemeden.

Otomatik SEO regresyon testi: **607 kontrol, 0 başarısız.**

---

## J. URL — korundu mu? **Evet.**

16 production URL'inin tamamı değişmedi; `trailingSlash: 'always'` +
`build.format: 'directory'` aynen duruyor.

```
/                                     /gizlilik-politikasi/
/bolgeler/{silivri, catalca, buyukcekmece, beylikduzu, corlu,
           cerkezkoy, marmaraereglisi, kapakli, tekirdag}/
/hizmetler/{ip-kamera-sistemleri, firewall-yapilandirma,
            switch-konfigurasyonu, access-point-kurulumu, nvr-depolama}/
404.html (kök)
```

Yönlendirmeye ihtiyaç yok. `securis.com.tr` apex; `www` kullanılmıyor.
`astro.config.mjs`'de `base` **ayarlanmadı**.

---

## K. Build

```
npm install   ✓  astro 5.18.2, 0 hata
npm run build ✓  17 page(s) built in ~0.7s
npm run dev   ✓
npm run preview ✓
```

`dist/` içeriği: 17 HTML + `CNAME` + `sitemap.xml` (16 URL) + `robots.txt` +
`manifest.json` (`start_url: "/"`) + favicon/PWA ikon seti + 10 `.webp` +
`_astro/` (3 CSS + 6 JS, hash'li).

Görseller **yeniden encode edilmedi**; `url()` yolları kök-göreli, build sonrası
erişilebilirlikleri doğrulandı (Faz 1'deki `/_astro/assets/...` regresyonu
tekrarlanmadı).

---

## L. Test sonuçları

| Test paketi | Kapsam | Sonuç |
|---|---|---|
| **SEO / yapı regresyonu** | 17 sayfa: title, description, canonical, robots, OG/Twitter, CSP, viewport, lang, tek h1, JSON-LD türleri, FAQ üçlü eşleşme, iletişim linkleri, iç link hedefleri, sitemap, statik dosyalar | **607 geçti / 0 başarısız** |
| **Fonksiyonel** | 17 rota + ana sayfa davranışları + Escape (4 sayfa tipi) + JS kapalı senaryosu | **tümü geçti** |
| **Erişilebilirlik** | 5 sayfa tipi × kontrast/başlık/landmark/alt/odak/dokunma | **0 hata, 0 uyarı** |
| **Görsel QA** | 7 sayfa × 6 viewport (390/430/768/1024/1440/1920) | **42 kombinasyonda yatay taşma yok, konsol hatası yok** |
| **Derin yol 404** | `/bolgeler/cok/derin/olmayan-sayfa` — 12 alt kaynak + 21 iç link | **0 kırık**, belge HTTP 404 |
| **Performans** | 3 sayfa: transfer, CLS, FCP, uzun görev | H bölümü |

---

## M. Açık TODO

1. **Astro 7 yükseltmesi.** Kalan tek `npm audit` açığı. Production statik
   çıktıya etkisi yok (A.4), ama güncel kalmak için ayrı ve tek başına bir iş
   olarak yapılmalı: `npm install astro@latest` → build → bu rapordaki dört
   test paketini tekrar çalıştır. Redesign ile birlikte yapılmamalıydı, çünkü
   regresyonun kaynağını ayırmak imkânsızlaşırdı.

2. **Font self-hosting.** 182 KB'lık Google Fonts yükü ve kalan CLS'in
   (bölge sayfasında 0.0253) kaynağı. Fontları `public/fonts/` altına alıp
   `@font-face` ile sunmak: üçüncü taraf bağımlılığını kaldırır, CSP'yi
   sıkılaştırmayı mümkün kılar (`font-src 'self'`), CLS'i sıfıra yaklaştırır ve
   gizlilik sayfasındaki "Google Fonts" maddesini gereksiz kılar.
   **Not:** bu değişiklik gizlilik metnini de güncellemeyi gerektirir.

3. **`/bolgeler/` ve `/hizmetler/` hub sayfaları.** §30 gereği kendiliğinden
   eklenmedi. Şu an bunlara ihtiyaç yok: footer 9 bölge + 5 hizmeti listeliyor,
   hizmet sayfaları birbirine, bölge sayfaları hizmetlere bağlanıyor. Site
   büyürse (10+ bölge) değerlendirilebilir. **Öneri olarak sunuluyor, karar
   sizin.**

4. **Nav spotlight.** Kaldırıldı (D bölümü). Geri istenirse ~15 satır.

5. **Logo beyaz render.** Koyu çubuk üzerinde `filter: brightness(0) invert(1)`
   ile beyaza çevriliyor. **Dosya değişmedi**, yalnızca CSS filtresi. Markanın
   lacivert tonunun korunması isteniyorsa `chrome.css`'te tek satır geri
   alınabilir — o durumda logonun arkasına açık bir plaka gerekir.

6. **`securis-bold-animasyon.zip`** hâlâ klasörde duruyor, repo'ya girmiyor.
   Git geçmişi artık bu işi yaptığı için silinebilir.

---

## N. Git

Faz 2'de oluşturulan **yerel** commit'ler:

```
86e6866  test: validate visual upgrade
e54b6a2  design: rebuild homepage and align all page types
521ac13  design: establish unified visual system
d93280b  fix: resolve post-migration inconsistencies
```

Önceki geçmiş (Faz 1) dokunulmadan duruyor:

```
b4f9af7  docs: migration sonuc raporu
105ef84  Eski HTML kaynaklarini kaldir
21d48f4  Astro migration: component ve veri odakli mimari
4fd36cd  Initial commit - original Securis production site   ← rollback noktası
```

Rollback:

```bash
git checkout b4f9af7 -- .   # Faz 1 sonu (migration bitmiş, eski tasarım)
git checkout 4fd36cd -- .   # orijinal production sitesi
```

---

```
GIT PUSH YAPILMADI.
PRODUCTION DEPLOY EDİLMEDİ.
ONAY BEKLENİYOR.
```

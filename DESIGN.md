---
name: Securis
description: Security-camera and network installs for western Istanbul and Thrace, shown as a filmstrip of real install frames.
colors:
  ink: "#000000"
  paper: "#ffffff"
  paper-soft: "#e2e2e2"
  dim: "#b8bcc3"
  hairline: "#2a2a2a"
  step-rule: "#3d3d3d"
  row-hover: "#0f0f0f"
  menu-glass: "rgba(0, 0, 0, .72)"
  print-paper: "#f2f3f4"
  print-ink: "#0d0d0d"
  print-ink-soft: "#2a2a2a"
  print-dim: "#4f545b"
  print-hairline: "#d3d6da"
  print-step-rule: "#b6bac0"
  print-hover: "#e7e9eb"
  print-menu-glass: "rgba(242, 243, 244, .86)"
  photo-soft: "#f2f2f2"
  photo-dim: "#d0d3d8"
  photo-rule: "rgba(255, 255, 255, .22)"
  button-hover: "#e9e9e9"
  red-pencil: "#ff3b30"
  grade-camera: "#c2410c"
  grade-nvr: "#7c3aed"
  grade-switch: "#0284c7"
  grade-firewall: "#dc2626"
  grade-wifi: "#059669"
  grade-field: "#6b7280"
  grade-regions: "#1d4ed8"
  grade-close: "#1f2937"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.8rem, 6.4vw, 6.2rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 5.4vw, 5.6rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
  section:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 4.6vw, 4.2rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  list-name:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(30px, 3.9vw, 58px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(22px, 1.8vw, 28px)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(19px, 1.5vw, 23px)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(18px, 1.2vw, 20px)"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.08em"
  crumb:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.04em"
rounded:
  none: "0px"
spacing:
  gutter: "clamp(18px, 3.6vw, 56px)"
  section: "clamp(80px, 11vw, 140px)"
  button-gap: "12px"
  row: "24px 26px"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 26px"
    height: "56px"
  button-primary-hover:
    backgroundColor: "{colors.button-hover}"
    textColor: "{colors.ink}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0 26px"
    height: "56px"
  region-row:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "{spacing.row}"
  region-row-hover:
    backgroundColor: "{colors.row-hover}"
  region-row-light:
    backgroundColor: "{colors.print-paper}"
    textColor: "{colors.print-ink}"
    rounded: "{rounded.none}"
    padding: "{spacing.row}"
  region-row-light-hover:
    backgroundColor: "{colors.print-hover}"
  menu:
    backgroundColor: "{colors.menu-glass}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
  menu-light:
    backgroundColor: "{colors.print-menu-glass}"
    textColor: "{colors.print-ink}"
    rounded: "{rounded.none}"
---

# Design System: Securis

## Overview

**Creative North Star: "The Contact Sheet"**

Every service is a photograph. On the home page the services run as a filmstrip across a black ground: the focused frame stands full height in colour, its neighbours sit at half height in greyscale, and the whole backdrop behind them is re-graded to the focused service's accent. Subpages are the photographer's contact sheet: all service frames in a row along the bottom edge, this page's frame enlarged and ringed in red pencil. The world is photographic and quiet; colour arrives through the photo grade, never through painted UI.

The reading surfaces come in two printings. Dark is the default negative: black ground, white type. Light is the print: a neutral paper (print-paper) with near-black ink. Only the page surfaces change; every photographic zone (home stage, subpage hero, closing band, projects stage and detail) stays dark and graded in both themes, because a photograph is always shown on its own dark ground. The theme follows a stored choice, else the OS preference, and is set before first paint.

Density is low at the top (one frame, one title, one lead, two buttons) and becomes a ruled, editorial reading surface below: hairline-separated sections, a big-type service list, a ruled region table with travel times, a plain FAQ, then a closing band carrying the finished-install photo. The system refuses the category default of a blue hero with three icon cards.

**Key Characteristics:**
- Black or print-paper ground; photos re-graded per service with a colour-blend plus multiply layer, a dark wash and film grain; photo zones dark in both themes.
- Archivo 600 with tight negative tracking for every heading; JetBrains Mono 500 for small uppercase readouts.
- Square corners everywhere; hairline rules instead of cards or shadows.
- One spring-driven horizontal position moves strip, descriptions and giant outline words together.
- A hand-drawn red-pencil ring is the only mark that says "this one".

## Colors

A monochrome interface in two printings whose only colour comes from grading photographs to one accent per service.

### Primary
- **Service Grades** (camera, NVR, switch, firewall, Wi-Fi, regions): never used as flat UI fills or text. Each is applied twice over its photo, once as `mix-blend-mode: color` and once as `multiply` at .55 opacity, so the image takes on that service's hue. One grade per page hero: service pages use their service, region pages use the regions blue, the home backdrop cross-fades to the focused slide's grade. The members follower and the projects stage re-grade their photo to the hovered item's accent.
- **Field Grey** (grade-field): the grade of the home page's industrial-site frame, the one slide that is not a service.
- **Close Slate** (grade-close): the grade of the closing band's finished-install photo on every content page.

### Tertiary
- **Red Pencil** (red-pencil): exists only as the two-pass SVG stroke carried by the shared `--pencil` image. It is a marker, not a brand colour.

### Neutral (dark printing, default)
- **Ink** (ink): page ground, table cells, button text. Contrast of paper on ink 21:1.
- **Paper** (paper): headings and primary text, the primary button fill, text selection.
- **Paper Soft** (paper-soft): leads, step copy, FAQ answers, prose, crumbs (16.2:1).
- **Dim Steel** (dim): section-head descriptions, mono labels, travel times, members lines, footer (11.0:1).
- **Hairline** (hairline): every section divider, table grid, FAQ and list rules, footer rule.
- **Step Rule** (step-rule): the brighter top rule on each process step; scrollbar thumb.
- **Row Hover** (row-hover): region-row hover fill.
- **Menu Glass** (menu-glass): the translucent menu ground over a 22px blur.

### Neutral (light printing)
- **Print Paper** (print-paper): page ground and table cells.
- **Print Ink** (print-ink): headings and primary text (17.5:1 on print paper).
- **Print Ink Soft** (print-ink-soft): the soft-text role (12.9:1).
- **Print Dim** (print-dim): the dim role (6.8:1).
- **Print Hairline** (print-hairline), **Print Step Rule** (print-step-rule), **Print Hover** (print-hover), **Print Menu Glass** (print-menu-glass): the same roles as their dark counterparts.

### Photo-zone overrides
Inside photographic zones, in both themes, text is paper, soft text is Photo Soft (photo-soft), dim is Photo Dim (photo-dim) and rules are Photo Rule (photo-rule), a white line at .22.

### Named Rules
**The Grade-Not-Paint Rule.** Accent colour reaches the screen only through a graded photograph. No accent-coloured buttons, text, icons, borders or backgrounds.

**The One Grade Rule.** A page carries exactly one service grade in its hero; the closing band always carries Close Slate.

**The Darkroom Rule.** Photographs are always shown on a dark ground. Switching to the light theme changes page surfaces only; stage, heroes, closing band and projects stage and detail keep white type, dark wash and grade in both themes.

**The Role-Not-Hex Rule.** Page surfaces take colour through the theme roles (bg, fg, fg-2, dim, line, line-2, hover, menu-bg), never through a literal neutral, so both printings stay in step.

## Typography

**Display Font:** Archivo (with system-ui, sans-serif)
**Body Font:** Archivo (with system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, monospace)

**Character:** A tight, workmanlike grotesk at weight 600 carries every heading at negative tracking; a monospace at 500 does the small factual readouts, like the edge print on a film strip.

### Hierarchy
- **Display** (600, clamp(2.8rem, 6.4vw, 6.2rem), 1): closing band headline. The home slide title uses the same weight at line-height .95, sized by the stage script; the projects H1 runs larger (clamp(3rem, 7vw, 7rem), .95, -.04em).
- **Headline** (600, clamp(2.6rem, 5.4vw, 5.6rem), 1): subpage H1, balanced wrap; drops to clamp(2rem, 8.6vw, 2.6rem) on phones. The project detail H2 sits just below (clamp(2.4rem, 4.4vw, 4.4rem)).
- **Section** (600, clamp(2.2rem, 4.6vw, 4.2rem), 1.02): section H2, max 20ch; narrow pages use clamp(1.8rem, 3vw, 2.6rem).
- **List Name** (600, clamp(30px, 3.9vw, 58px), 1, -.035em): members service names. Menu service links (clamp(26px, 2.8vw, 44px), -.02em) and project titles (clamp(24px, 2.8vw, 42px), -.025em) are the same voice one step down.
- **Title** (600, clamp(22px, 1.8vw, 28px), 1.15): process-step H3; region rows and service tiles use the same weight at 20-28px.
- **Lead** (400, clamp(19px, 1.5vw, 23px), 1.55): hero lead, max 52ch; closing paragraph max 46ch.
- **Body** (400, clamp(18px, 1.2vw, 20px), 1.65): running text; FAQ answers max 70ch, prose max 54ch.
- **Label** (JetBrains Mono 500, 13px, .08em, uppercase): travel times, notes, menu column labels, member and project numbers, project categories, preview caption.
- **Crumb** (JetBrains Mono 500, 14px, .04em, sentence case): breadcrumb trail above the H1.
- **Outline words** (Archivo 700, 2.3x the slide title, -.04em): giant service words behind the strip, transparent fill with a 1px white stroke at .14 opacity (.34 when on).

### Named Rules
**The Readability Floor Rule.** Body never below 18px at 1.65, leads 19-23px, mono labels never below 13px. Soft and dim text must hold at least 6.8:1 in either printing.

**The Dotless Product Rule.** Mono labels are uppercased with Turkish rules (i to İ), except English product words (FIREWALL, SWITCH, WI-FI and similar), which keep a plain I. Always route uppercase text through the Turkish-aware helper; never use CSS `text-transform` for Turkish copy.

**The Edge-Print Rule.** Mono is for short factual readouts only (counts, times, brand credits, frame numbers, categories). It never carries sentences or headings.

## Layout

Full-bleed sections with a fluid side gutter (spacing.gutter) and fluid vertical padding (spacing.section), each separated by a hairline top rule. Section heads are a wrapping flex row: H2 left, a dim description (max 42ch) aligned to its baseline on the right.

**Home stage:** one viewport tall (100svh, min 600px). A centred top bar (menu, large white logo, theme toggle and WhatsApp). The upper half holds the two-line slide title bottom-left with the mono credit and three meta facts on the same baseline, plus a mono "more" link. The strip starts at 50% height; the focused card is full height, neighbours half height. The focused description sits under the strip. A 01/06 progress rail sits bottom-left (top-right on phones). On phones the focused card anchors to the left gutter so its description sits directly beneath it.

**Subpage hero:** at least one viewport tall (min 780px): crumb, H1, lead, two buttons, mono note at top; the contact sheet along the bottom edge. The current frame grows to 1.7x flex and ~2x height. On phones the sheet becomes a horizontal snap-scroller that opens with the ringed frame centred.

**Members list:** full-width ruled rows in four columns (number 3.2em, name, dim line max 38ch, arrow); on touch or phones the number drops out and a 64px square thumbnail leads a two-line row.

**Projects stage:** one viewport, two columns (intro left, draggable 3:4 preview right, max 360px) over a ruled index list spanning both; one column under 800px with the preview at 70% (max 280px). The detail dialog is full screen: photo 1.1fr, text 1fr; stacked on phones with the photo at 52svh.

**Grids:** process steps 4 columns (2 under 1000px, 1 under 460px); region table 3 columns (1 on phones); service tiles 5 columns (3, then a list row with an 88px thumbnail on phones); menu 1.4fr / 1fr / .9fr (2, then 1).

Breakpoints are 1000px, 800px (projects only), 700px and 460px.

## Elevation & Depth

Flat. Depth comes from the photograph and the layers over it: a 1.2x scaled image, the two grade layers, a vertical dark wash (.55 at top, .05 at 38%, .25 at 62%, .75 at bottom), then fractal-noise grain at .28 opacity in overlay blend. Text over photos sits on a scrim: on desktop a left-to-right black gradient (.82 to .66 at 44% to clear at 62%); on phones a vertical band that holds .9 black from 22% to 68%. The one translucent surface is the menu: its theme's menu glass over `backdrop-filter: blur(22px) saturate(1.2)`.

### Named Rules
**The Scrim-Before-Type Rule.** Any text set over a graded photo gets a scrim; legibility never depends on the photo being dark enough.

**The Shadowless Rule.** The only `box-shadow` values are inset 1px hairlines (the outline button, the stage focus ring). Nothing floats.

## Shapes

Square corners throughout (rounded.none): buttons, cards, frames, tables, the menu, the follower and the preview. Lines are 1px. Region and legal-card grids are drawn by a 1px gap over a hairline-coloured parent, so the rules are the grid. Photo frames in lists are 3:4 portrait (follower, service tiles, project preview) or square thumbnails (menu 54px, members 64px). The one organic shape is the red-pencil ring: two hand-drawn strokes (3.6px, then 1.6px at .55 opacity), non-scaling, stretched to its target and rotated (-2deg on the sheet, -1.5deg on a project title). The theme toggle is a half-disc inside a ring: the half and the ring counter-rotate 180deg when the theme flips.

## Components

### Buttons
Blunt, full-weight, square. Buttons live only in photographic zones, so they are white-on-dark in both themes.
- **Shape:** square (0px), 56px tall, 26px horizontal padding, 600 weight 17px, icon plus label with a 10px gap.
- **Primary:** paper fill, ink text (WhatsApp; "Hizmeti incele" in the project detail).
- **Hover / Focus:** fill steps to button-hover; press nudges 1px down; focus is the global 2px currentColor outline at 3px offset.
- **Outline:** transparent with an inset 1px white line at .55 opacity, paper text; hover adds a 10% white fill.
- **Phones:** the pair shares one row as equal-flex buttons with shorter labels.

### Navigation
A centred top bar over the hero: text-plus-icon buttons at .92 opacity (icons only on phones) and a logo forced white; on plain legal pages the bar follows the theme ink.
- **Theme toggle:** a 44px icon button (half-disc in a ring, aria-pressed). The new theme is revealed as a circle growing from the button's centre through a root view transition (.7s, cubic-bezier(.16, 1, .3, 1)); without view-transition support or with reduced motion it switches instantly.
- **Menu:** a full-screen translucent glass sheet (menu-glass, 22px blur) fading in over .35s, in the theme's ink: service links at 26-44px with 54px greyscale thumbnails that colour on hover, region links at 20-26px, then contact in soft text; dim mono column labels. Focus is trapped, Escape closes.
- **Letter roll:** on hover-capable devices, single-line menu links and project titles roll letter by letter: the letters slide up out of a clip while a copy slides in from below (.5s, cubic-bezier(.65, 0, .35, 1)), staggered 32ms per letter outward from the centre. Labels that wrap, and touch devices, keep plain text; the real text stays for screen readers.

### Filmstrip (signature)
Cards are square-cornered photos with no captions. Unfocused cards are half height, greyscale at .85 brightness with a .14 black veil; the focused card grows to full height in full colour. A single spring (stiffness 260, damping 34, mass .9) drives the strip, the description track and the outline-word track together, from drag with momentum, wheel, arrow/Home/End keys and a 5.5s autoplay that pauses off-screen. The backdrop cross-fades to the new grade over .7s while the image slowly zooms from 1.42 to 1.28. The title rises in through a clipped line wipe. Reduced motion jumps without animation.

### Contact Sheet (signature)
A bottom-aligned row of every service frame, each greyscale at .8 brightness with a mono caption ("01 IP KAMERA"). The current frame is larger, in colour, captioned "— BU SAYFA" and ringed in red pencil. Frames settle in with a 70ms stagger; the ring draws in .55s later.

### Members List
Big service names as ruled rows: mono number, List Name, a dim one-line description and an arrow. Hovering the list dims every row to the dim role and returns the hovered one to full ink, while its row padding eases and the arrow turns -45deg and slides 6px. On fine pointers a 3:4 photo (200-300px wide) follows the cursor, sitting to the right of it with a lerp (.16) and a slight velocity tilt, re-graded to the hovered service (colour layer .55, multiply .25); it scales in from .6. On touch, a 64px thumbnail leads each row instead.

### Projects Showcase
A photographic stage re-graded to the active project, carrying the intro, a draggable 3:4 preview that stays where dropped, and a ruled index list. Rows are dim; hover, focus or the active row turns them white, and the active title is ringed in red pencil. Choosing a row opens a full-screen detail dialog: the photo morphs from the preview into the left half through a named view transition (.6s, cubic-bezier(.16, 1, .3, 1)); the right half carries the title, a mono category, the lead, a ruled list of what was done and the button pair. Escape or Kapat closes and returns focus to the row.

### Region Table
A ruled 3-column table of region rows on the page ground: region name (600, 20-28px), mono travel time in dim ("35 DK"), and an arrow that slides 4px right and turns to full ink on hover while the row fills with the hover role.

### FAQ
Native details/summary rows between hairlines. Summary 500 weight 19-23px with a plus icon that rotates 45deg to a cross when open. Answer in soft text, max 70ch.

### Closing Band
A 620px-tall graded band using the finished-install photo in Close Slate with wash and grain, a Display headline, a short lead-size paragraph and the button pair bottom-left.

## Do's and Don'ts

### Do:
- **Do** grade every photograph with its accent as a colour-blend layer plus a multiply layer at .55, then the wash and .28 grain.
- **Do** keep every photographic zone dark with white type in both themes; switch only page surfaces between the two printings.
- **Do** colour page surfaces through the theme roles so dark and light stay in step.
- **Do** put a scrim under any text that sits on a photo: left gradient on desktop, .9 band on phones.
- **Do** keep all headings Archivo 600 with negative tracking (-.02em to -.035em) and all readouts JetBrains Mono 500 at .08em, 13px or larger.
- **Do** separate sections and list rows with hairline rules, not boxes or shadows.
- **Do** uppercase Turkish label text with the Turkish-aware helper that leaves English product words dotless.
- **Do** keep only real install photographs in frames; greyscale or dim means "not focused", colour or full ink means "this one".
- **Do** give every pointer-only flourish (follower, letter roll, drag) a touch and reduced-motion fallback.

### Don't:
- **Don't** fill buttons, text, icons or borders with a service accent; accents live only in photo grades.
- **Don't** put a photograph on a light ground.
- **Don't** round corners or add drop shadows.
- **Don't** fall back to a blue hero with three icon cards.
- **Don't** use the red-pencil ring for anything other than marking "this one": the current page's frame or the active project.
- **Don't** set mono labels above headings as section intros; the mono layer is for factual readouts only.

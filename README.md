# milotacheny.com

Personal portfolio for Milo Tacheny. Plain HTML and CSS, no build step, served by GitHub Pages.

## V2 (current, October 2026)

```
index.html        portfolio: research & strategy, human factors & systems design, industrial design, Wiley Banting
about.html        bio, headshot, teaching photo
cdes-atlas.html   interactive CDes AI tools matrix (data embedded in the page)
design/           legacy case-study pages, still linked from the industrial design cards
bio.html, research.html, design.html, tashstudios.html
                  redirects so old links keep working
```

The V2 pages carry their own styles inline. `styles.css` is only used by the legacy pages in `design/` and `contact.html`.

## Previous version

The original site is preserved two ways:

- branch `v1-archive`
- tag `v1`

To browse it locally: `git checkout v1-archive`, then run the server below. Return with `git checkout main`.

---

## V1 notes (archived)

A hand-built, dependency-free copy of the Squarespace landing page. Plain HTML +
CSS, no build step, no JavaScript.

```
index.html      landing page
styles.css      all styles
assets/         images pulled from the live site (2048px originals where available)
```

## Run locally

```bash
python3 -m http.server 8391
# → http://localhost:8391
```

## Status

- [x] Landing page
- [x] `design.html` — Design Work index (10 projects)
- [x] `research.html` — two study write-ups, a poster, a Google-Drive PDF embed,
      and a "Learn more" link to the published paper
- [x] `tashstudios.html` — hero (banner + title + logo), 3×2 gallery, intro,
      YouTube video embed, and a YouTube button
- [x] `bio.html` — portrait + bio, essentially pixel-perfect
- [x] `contact.html` — "Let's Work Together" + form. Form posts via `mailto:` to
      tacheny.m@gmail.com (no backend on GitHub Pages; see notes below)
- [x] 10 project case-study pages under `design/` (168 slides total)

**The site is complete.** Every page, the full nav, and all 10 Design Work
project pages are built.

### Case-study pages

Each project page is a vertical stack of the original's full-width presentation
slides. They're generated from a manifest so the set is easy to regenerate:

- `scripts/case-studies.json` — the manifest (slug, title, image CDN paths).
- `scripts/build_case_studies.py` — downloads every slide at 1500w into
  `assets/design/<slug>/` and writes `design/<slug>.html`. Re-run with
  `python3 scripts/build_case_studies.py` (skips images already downloaded).
- `scripts/build-case-studies.mjs` — the same generator in Node, if you prefer
  it (this machine had no `node`, so the Python one is what was used).

Slides use `loading="lazy"`, so a long deck loads as you scroll.

Two pages were **unfinished on the live Squarespace site** — Low Roller Mini and
Omnipod each had an extra block with Squarespace's default placeholder text
("It all begins with an idea…") and/or a Squarespace-hosted video. The real
slides are reproduced; the placeholder/boilerplate blocks are omitted. If you
want those sections, add the finished content on the source site and re-run the
generator.

The nav and buttons already point at the filenames above, so pages link up as
they're added. Until then those links 404.

### Contact form

There is no server on GitHub Pages, so the form composes a pre-filled email to
`tacheny.m@gmail.com` in the visitor's mail app (`CONTACT_EMAIL` in the inline
script at the bottom of `contact.html`). To upgrade to a real in-page submit,
swap the handler for a `fetch()` POST to a form service (Formspree / Basin) or a
Cloudflare Worker.

### Third-party embeds

Both the Research PDF (Google Drive) and the TASH Studios video (YouTube) are
standard embeds. They can render blank or hang inside a local preview pane but
work normally in a real browser once deployed.

### Research page notes

- Prose is transcribed verbatim from the live site. Images match the original's
  rendered sizes to the pixel (glove diagram 635×721, NFPA chart 435×515).
- The "Learn more" button sits one grid row lower than the original's markup
  (row 20, not 19). On the original, the tall glove image grows the upper grid
  tracks and pushes the button down; a CSS-grid image spanning many `auto` rows
  doesn't reproduce that track growth in Chrome, so without the nudge the button
  overlaps the paragraph. Verified clear at 375 / 820 / 1280.
- The second study's heading overlaps the chart by 111px **on purpose** — that's
  exactly what the original does (right-aligned heading at top, chart below in
  shared columns; they don't visually collide).
- The Google-Drive PDF is embedded via the same `/preview` iframe the original
  uses. Google often refuses to frame on `http://localhost`, so it shows blank
  locally — it renders once deployed to a real domain.
- Because that image-driven track growth isn't reproduced, the page runs ~3%
  shorter than the original overall (≈4141px vs 4281px at 1280). No overlaps,
  and every block's width and in-section position matches; it's purely a little
  vertical compression between sections.

## Layout notes

The original is a Squarespace fluid-engine page. Rather than eyeball it, the
layout below was measured off the live site and reproduced exactly. Verified
within 3px at 1280px wide, with total page height and all three section heights
matching to the pixel.

**Grid** — each section is a 26-column grid: a flexible gutter, 24 content cells,
then another gutter (so column lines run 1–27).

```
--container-width : min(1500px, 100vw - 4vw*2)
--cell-max-width  : (1500px - 11px * 23) / 24
--grid-gutter     : 4vw - 11px
--row-height      : container-width * 0.0215
column-gap        : 11px
```

Blocks are placed with `grid-area` via the `--area` custom property, using the
same row/column spans as the original. Images that bleed off-screen do so by
spanning into the gutter columns (1 and 27).

**Row gaps** differ per section, matching the original: the hero and footer use
an 11px row gap; the category section uses `0`. This is load-bearing — it's what
puts the buttons at y=902 rather than y=1089.

**Sections** are `min-height: 33vh`, vertically centred, with 43px of vertical
padding. The hero adds the 80px header height on top.

**Images** use `margin: auto` + `max-width/max-height: 100%` inside an absolutely
positioned box. This makes the *element itself* shrink to the letterboxed size and
centre — which is what the original does, and it also stops intrinsic image
heights from stretching the auto-sized grid rows.

**Type** is Raleway (Google Fonts — the same face Squarespace serves, so the text
metrics match). Both hero sizes are fluid, growing as `16px + Nvw` and capping at
the value they reach at the 1500px site max-width:

| | formula | 1024 | 1280 | 1440 | ≥1500 |
|---|---|---|---|---|---|
| `h1` | `min(16px + 3.6vw, 70px)` | 52.864 | 62.08 | 67.84 | 70 |
| subtitle | `min(16px + 0.72vw, 26.8px)` | 23.373 | 25.216 | 26.368 | 26.8 |

The hero weight comes from a `<strong>` inside the `h1`, as on the original — the
`h1` itself is weight 400.

**Palette**, sampled from the hero tiles:

| | |
|---|---|
| ochre | `#A46403` |
| slate | `#546669` |
| olive | `#586145` |
| charcoal | `#47413C` |

**Category index pages** (`design.html`) do *not* use the fluid grid. They're a
plain two-column grid with `padding: 3.3vw 4vw`, a fixed 40px gap, and no
max-width — so unlike the landing page they keep growing past 1500px. Items are a
16:9 `object-fit: cover` image, then a 20px gap, then the title. Verified exact at
1280 (total page height 2667px) and at 375.

**The 768px breakpoint** is where the original switches the index grid to one
column *and* the site gutter from 4vw to 6vw. Confirmed precisely: at 768 the
title is 21.5296px, exactly what the desktop formula predicts.

**Mobile on the landing page** (`<768px`) is *not* a copy — Squarespace's mobile
grid areas weren't recoverable from the rendered page, so the fluid grid is
dropped and blocks stack in source order. Worth a look against the real site on a
phone. The index pages' mobile layout *is* an exact copy.

Below 768px the title uses a separate rule, `21.2403px + 0.1616vw`, fitted to the
original at 375 and 767. It doesn't follow the desktop formula.

## Deploying

The domain `milotacheny.com` is already registered — this doesn't need a new one,
just a DNS repoint once you're ready to leave Squarespace. Check who the domain is
registered *through* first: if it's registered via Squarespace, it either needs
transferring out to a registrar (~$12/yr) or Squarespace kept on for registration
only.

For GitHub Pages: push this folder to a repo, enable Pages on the branch, add a
`CNAME` file containing `milotacheny.com`, and point the DNS A records at GitHub.
Don't cancel Squarespace until the new site is live and verified.

# Personal Website v2.1 (Rev 2 — EGM-Hardened) — Swiss Cleanroom Editorial & Precision Kinematic Portfolio Specification

* **Author:** Claudiu Șpan (`Mr-Span`)
* **Date:** 2026-11-24
* **Revision:** `v2.1-rev2` (hardened after 6-lens parallel EGM Goldfish Review: `zoom-out`, `inventive-catalyst`, `design`, `comprehension`, `codebase-details`, `implementation-readiness`)
* **Repository:** `C:\Dev\personal-website` (branch `feat/v2-astro-upgrade`, deploying under `BASE_PATH=/personal-website` to `https://mr-span.github.io/personal-website/`)
* **Supersedes Visual Layer Of:** `docs/designs/personal-website-v2.md` (replaces the rejected Dark SaaS Bento visual layer while preserving Astro 5, Zod canonical schemas, Playwright ATS PDF generation, `ArchitectureVisualizer`, `/blog` MDX + `/rss.xml`, and CI verification gates)

---

## 0. Open Author Confirmation Gates (Lock Before Implementation)

Only three product decisions remain open after the 6-lens EGM review:
1. **Betfair Tenure Copy (Nov 2026 context):** Confirm **`Mar 2022 – Present`** (recommended for public CV/PDF until role concludes) vs. **`Mar 2022 – Jan 2027`** verbatim.
2. **First-Visit Theme Polarity:** Confirm **Warm Cleanroom Vellum (Light) as intentional default** (ensures all visitors experience the signature Braun/Cleanroom theme first, with instant Dark toggle persisted in `localStorage`) vs. **OS `prefers-color-scheme` default**.
3. **Showcase Station Click Behavior & `⌘K`:** Confirm **Docked Quick-Inspect `<dialog>`** (preserving live un-dimmed cobot above the sheet + `Recruiter Scan ↔ Engineer Deep Dive` + Desktop-only `⌘K`) vs. **Direct MPA Navigation** (stations link straight to `/projects/[slug]/` & `/resume/`, zero modal layer, drop `⌘K`), plus whether `Agri-Rover` launches immediately as a factual baseline Tier 1 Case Study or starts as a Showcase entry until extra field data arrives.

---

## 1. Purpose, Audience & Non-Negotiable Constraints

This specification defines the unified design system, OKLCH color palette, hardware rendering material layer, kinematic & dot-matrix showcase mechanics, factual data updates, and complete Astro 5 integration plan for Claudiu Șpan's portfolio and CV website.

### Core Objectives
* **Portfolio & Showcase Identity Without Recruiter Friction:** Preserve Claudiu's explicit signature opt-ins — (1) an articulated robotic arm on a linear 7th-axis gantry with optional live IK telemetry, and (2) the 6 custom `9×9` engineering pixel glyphs — unified inside one **Swiss Cleanroom Editorial × Braun/CAD Precision Instrument** visual language.
* **Dual-Audience Architecture:**
  1. **Human Recruiters & Technical Hiring Managers (Desktop-first `1280×720`, `1366×768`, `1440×900`):** Immediate F-pattern scan (`Claudiu Șpan` as H1, role, EU location, `40+` enterprise workflows, `~70%` review-time reduction, 6 verified certifications, ATS PDF download) in under 7 seconds with zero forced animation delay.
  2. **Mobile Visitors (`375×812` & `390×844`) & AI/ATS Consumers (`/Claudiu-Span-CV.pdf`, `/llms.txt`, `/index.md`):** `< 220 KB` mobile initial transfer with `0 KB` kinematic JS loaded, zero horizontal or vertical clipping, full SSR HTML readable without JavaScript, 1-page A4 ATS PDF compiled at build time, and synchronized Markdown endpoints (`/llms.txt` and `/index.md`).

### Explicit Anti-AI-Slop Rules
* **Permitted User Opt-Ins:** Overhead 2D orthographic articulated cobot on a linear gantry rail (Desktop `>= 1024px`, fine pointer), toggleable live IK readout, and functional `9×9` dot-matrix engineering glyph display.
* **Strictly Banned Across All Routes:** `.bento-card` rounded box-in-a-box grids, `rounded-xl`/`rounded-2xl` blanket radii, `Space Grotesk` / `Inter` / `JetBrains Mono`, Tailwind Slate+Sky dark defaults (`#070B12` + `#38BDF8`), `01 / SECTION` numbered uppercase eyebrows, chip/pill soup for skill lists, floating right-edge `Resume` tabs, repetitive placeholder schematic SVGs (`FallbackCover.astro`), and skeuomorphic Apple HIG top-bar capsules.

---

## 2. Canonical Factual Content Model

All routes, the Playwright ATS PDF, and `/llms.txt` + `/index.md` derive from `src/data/resume.json` and `src/content/projects/*.mdx` via Zod schemas (`src/data/resume.schema.ts`, `src/lib/content.schemas.ts`). `SITE.role` and `SITE.location` in `src/data/site.ts` and JSON-LD in `BaseLayout.astro` derive directly from `getResumeData()` to prevent drift.

### Confirmed Updates Applied to `src/data/resume.json`
| Field | Updated Canonical Value | Notes |
| :--- | :--- | :--- |
| `profile.headline` | `Applied AI, Automation & Robotics Engineer` | Aligns enterprise automation/AI career with MSc CPS, QUADYX, and Agri-Rover. |
| `profile.location` | `EU · Romania (Cluj-Napoca) & Spain — Open to Relocation` | Displayed on web routes; optional compact `profile.pdfLocation` (`EU · Cluj-Napoca, RO & Spain (Relocation Ready)`) keeps ATS PDF cleanly on 1 page A4. |
| `experience[0]` (Betfair) | `period`: per Gate #1 (`Mar 2022 – Present` or `Mar 2022 – Jan 2027`); `location`: `Cluj-Napoca, Romania (EU)` | Exact verified highlights (`40+` workflows, `~70%` review-time cut, PII boundary). |
| `education[1].thesis` (UTCN BSc) | `title`: `Agri-Rover — Autonomous Robotic Navigation & Vision-Guided Control`; `projectSlug: "agri-rover"` | Schema extended with optional `projectSlug` linking `/resume/` cleanly to `/projects/agri-rover/` while emitting `"Agri-Rover"` into `Claudiu-Span-CV.pdf`. |
| `certifications` (All 6) | AWS Certified AI Practitioner (`AIF-C01`), UiPath Advanced RPA Developer, Python & Agentic AI Engineering, Python Development, NVIDIA Fundamentals of Deep Learning, Simplilearn AI Program | All 6 visible simultaneously in a 2×3 hairline grid (`Ctrl+F` searchable) on both `/` and `/resume/`. |
| `skillGroups` (All 4) | Group 4 retitled `Robotics & Cyber-Physical Systems` (removing `(Side Venture)` since UTCN academic Agri-Rover joins QUADYX) | Rendered in 4 typographic hairline columns (zero pill soup). |
| `projects` (8 real entries) | Orders `1–4`: `enterprise-agentic-review`, `electrocasnicu-rag`, `quadyx-autonomy`, `agri-rover`. Orders `5–8` (renumbered): `aideas`, `ai-resume-parser`, `client-robser-construct`, `claux-workshop`. | `agri-rover.mdx` uses strictly verified baseline scope (embedded C++, GPS + digital compass IMU fusion, Haversine waypoint guidance, differential drive, Bluetooth watchdog) with zero visible placeholder blocks on the live page; `ProjectCard.astro` displays `"Academic Hardware Prototype"` when `visibility: "public"` has no `repoUrl`. |

### Typed Showcase Adapter (`src/data/showcase-modules.ts`)
Eliminates hardcoded shadow copy: `buildShowcaseModules(resume, projects)` builds the 6 Hero Showcase Station descriptors directly from `resume.json` and the `projects` collection (mapping Station 1 `Profile & CV` → `/resume/`, Stations 2–5 → the 4 flagship `/projects/[slug]/` case studies, Station 6 `Credentials & Contact` → `/resume/#certifications` + direct contact actions). Every station title is capped at `<= 20` characters and every compact proof metric at `<= 18` characters to guarantee single-line fit across all desktop widths.

---

## 3. Design System — Overall Theme, Geometry & Typography

### 3.1 Unified Aesthetic: „Swiss Cleanroom Editorial × Braun/CAD Precision Instrument”
* **One Indivisible Visual Language:** Editorial Swiss print hierarchy + Dieter Rams/Braun laboratory hardware drafting.
* **Geometry (`0px–2px` discipline):**
  * Structural plates, showcase stations, tables, diagrams, and `<dialog>` containers: **`0px–2px` border radius** (`1px` architectural hairlines, zero multi-layer CSS box-shadows).
  * Interactive buttons and focus rings: **`2px` border radius** max.
  * **Flat Brand Wordmark (`CLAUDIU ȘPAN`):** Placed directly on the `56px` hairline header (zero pill border), combining the `24×24` (`2px` radius) geometric C-axis monogram with uppercase `CLAUDIU ȘPAN` where the Romanian comma under `Ș` flows seamlessly into a `2px` vermilion trace.

### 3.2 Typography System (2-Family Self-Hosted IBM Plex Superfamily — `< 115 KB` WOFF2)
Commit exclusively to the **IBM Plex** industrial engineering superfamily (eliminating the third-font `Instrument Sans` bloat that threatened the `< 220 KB` mobile budget and guaranteeing native Romanian `Ș`/`Ț` `U+0218`/`U+021A` glyphs across every weight):
* **Display & Body:** `@fontsource-variable/ibm-plex-sans` (self-hosted `latin` + `latin-ext` WOFF2 only; weights `400` body, `500` medium UI, `600` headings/display — `~55–65 KB` total).
* **Technical, Dates, IK Telemetry & Code:** `@fontsource/ibm-plex-mono` (self-hosted `latin-400` + `latin-500` WOFF2 only — `~35–45 KB` total, `font-variant-numeric: tabular-nums`).
* **Preloading (Astro 5 / Vite safe):** Import exact `.woff2?url` assets in `BaseLayout.astro` frontmatter and emit at most **2** `<link rel="preload" href={url} as="font" type="font/woff2" crossorigin />` tags **without** wrapping in `withBase()` (Vite automatically prepends `astro.config.mjs` `base`). Delete external Google Fonts `<link>` tags and remove the obsolete `includeMonoFont` prop from `BaseLayout.astro` and its 5 callers.
* **Print PDF Font (`PrintResumeLayout.astro`):** Keep deterministic system sans (`'Segoe UI', Arial, Helvetica, sans-serif`) so `Claudiu-Span-CV.pdf` stays `< 60 KB` and 100% ATS-extractable.

**Fluid Type Scale (`clamp()`):**
* Hero H1 (`Claudiu Șpan`): `clamp(2.0rem, 1.5rem + 2.0vw, 3.1rem)` (`32px → 49.6px`), line-height `1.06`, tracking `-0.03em`, weight `600`.
* Section H2: `clamp(1.35rem, 1.15rem + 0.75vw, 1.85rem)` (`21.6px → 29.6px`), weight `600`.
* Station / Project H3: `clamp(0.9375rem, 0.90rem + 0.2vw, 1.0625rem)` (`15px → 17px`), weight `600`.
* Body: `clamp(0.9375rem, 0.91rem + 0.1vw, 1.0rem)` (`15px → 16px`), line-height `1.58`.
* Technical Meta / Telemetry / Diagram Labels: `0.75rem` (`12px` floor across the site; minimum `11px` only inside SVG diagram edge labels).

---

## 4. OKLCH Color Palette, Hardware Material Layer & Verified WCAG 2.1 Matrix

### 4.1 Theme Architecture (100% Cross-WebView & Tailwind v4 `@theme inline` Safe)
To avoid iOS 17.0–17.4 LinkedIn WKWebView `light-dark()` invalidation and Tailwind v4 `color-mix()` `/90` opacity breakage, `src/styles/tokens.css` defines explicit polarity blocks synchronized with `<meta name="color-scheme">` and `data-theme`:
* `:root` defines Light (Warm Cleanroom Vellum) tokens + `color-scheme: light;` (or `light dark` if Gate #2 selects OS-default, paired with `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ... } }`).
* `:root[data-theme="dark"]` defines Dark (Anodized Graphite Cleanroom) tokens + `color-scheme: dark;`.
* Inline pre-paint `<head>` script resolves persisted override (`localStorage` key `'claudiu-span-theme-v2'`, strictly wrapped in `try/catch` for blocked WebViews), sets `data-theme`, `<meta name="color-scheme">`, and `<meta name="theme-color">` (`#F5F2EB` Light / `#141413` Dark) synchronously with zero FOUC, and listens to both `storage` (including `ev.newValue === null`) and `matchMedia('(prefers-color-scheme: dark)')`.
* `src/styles/global.css` uses **`@theme inline`** mapping semantic utilities (`--color-canvas`, `--color-surface`, `--color-recessed`, `--color-elevated`, `--color-hairline`, `--color-interactive`, `--color-ink`, `--color-ink-secondary`, `--color-muted`, `--color-vermilion`, `--color-vermilion-hover`, `--color-tech`, `--color-signal`, `--color-on-accent`, `--font-display: var(--family-display)`, `--font-sans: var(--family-body)`, `--font-mono: var(--family-mono)`), eliminating the prior circular `--font-display` variable bug.
* `src/styles/print.css` enforces `:root { color-scheme: light !important; }` alongside explicit `#FFFFFF` / `#151619` overrides so printing from Dark Mode never produces invisible ink.

### 4.2 Editorial UI Tokens (Verified WCAG 2.1 AA/AAA + 1.4.11 Non-Text `>= 3:1`)
| Semantic Role | Light Hex (`OKLCH`) | Light CR (Canvas / Recessed) | Dark Hex (`OKLCH`) | Dark CR (Canvas / Surface) | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#F5F2EB` (`0.9615 0.0098 87.5`) | — | `#141413` (`0.1908 0.0020 106.6`) | — | Primary page canvas |
| `--bg-recessed` | `#ECE8DF` (`0.9316 0.0128 86.8`) | — | `#0E0E0D` (`0.1633 0.0021 106.6`) | — | Recessed rail bed / table head / code wells |
| `--bg-surface` | `#ECE8DF` (`0.9316 0.0128 86.8`) | — | `#1C1C1A` (`0.2257 0.0038 106.7`) | — | Secondary band / active row tint / Shiki bg |
| `--bg-elevated` | `#FAF8F4` (`0.9796 0.0057 84.6`) | — | `#242320` (`0.2561 0.0057 91.6`) | — | `<dialog>` sheet / inspector drawer |
| `--border-hairline` | `#D4CFC4` (`0.8554 0.0160 86.4`) | `1.39` (decorative) | `#2F2E2A` (`0.3008 0.0072 95.3`) | `1.37` (decorative) | Purely decorative `1px` Swiss dividers |
| `--border-interactive` | `#827C70` (`0.5880 0.0190 83.2`) | **`3.71:1` / `3.39:1`** | `#747066` (`0.5457 0.0160 88.8`) | **`3.73:1` / `3.50:1`** | Interactive control & input borders (WCAG 1.4.11) |
| `--ink-primary` | `#151619` (`0.2004 0.0062 271.1`) | **`16.18:1` / `14.80:1`** | `#F2EFE9` (`0.9528 0.0086 84.6`) | **`16.06:1` / `14.87:1`** | Headings, primary text |
| `--ink-secondary` | `#4A4E57` (`0.4236 0.0158 266.5`) | **`7.46:1` / `6.82:1`** | `#C4BFB6` (`0.8062 0.0137 82.4`) | **`10.07:1` / `9.33:1`** | Body copy, descriptions |
| `--ink-muted` | `#595D66` (`0.4780 0.0153 266.6`) | **`5.90:1` / `5.40:1`** | `#9D988F` (`0.6813 0.0142 82.4`) | **`6.43:1` / `5.95:1`** | Dates, telemetry, dimmed sibling rows (`>= 5.4:1`!) |
| `--accent-vermilion` | `#B33A10` (`0.5200 0.1642 37.1`) | **`5.32:1` / `4.87:1`** | `#F07241` (`0.6935 0.1680 40.8`) | **`6.31:1` / `5.84:1`** | Primary CTAs, guardrail/failure paths, active detent text |
| `--accent-vermilion-hover` | `#942E0A` (`0.4515 0.1432 37.2`) | **`7.09:1` / `6.48:1`** | `#F58B62` (`0.7429 0.1407 41.5`) | **`7.84:1` / `7.26:1`** | Primary CTA hover |
| `--accent-tech` | `#0B5D8A` (`0.4571 0.1017 240.7`) | **`6.37:1` / `5.83:1`** | `#6DBCE3` (`0.7593 0.0959 231.3`) | **`8.74:1` / `8.09:1`** | Links, nominal diagram paths, plumb line, `--ring-focus` |
| `--accent-signal` | `#156E4B` (`0.4789 0.0986 161.3`) | **`5.58:1` / `5.11:1`** | `#58C496` (`0.7443 0.1212 163.0`) | **`8.56:1` / `7.93:1`** | Internal verified/nominal status & Shiki strings only |
| `--on-accent` | `#FAF8F4` (`0.9796 0.0057 84.6`) | **`5.61:1` on vermilion** | `#141413` (`0.1908 0.0020 106.6`) | **`6.31:1` on vermilion** | Text on solid accent fills |
| `--ring-focus` | `var(--accent-tech)` | **`6.37:1` vs canvas** | `var(--accent-tech)` | **`8.74:1` vs canvas** | `:focus-visible` `2px solid` + `2px` offset everywhere |

* **Color-Step Sibling Dimming (Zero WCAG Failures):** Hovering/focusing a showcase station or project index row steps inactive sibling text from `--ink-primary` down to `--ink-muted` (mathematically **`>= 5.40:1` AA** in both themes — never applying `opacity: 0.55` to text!). Keyboard highlighting binds strictly to `:focus-visible`.

### 4.3 Dedicated Orthographic Hardware Material Tokens (`--hw-*`, Pure Inline SVG)
Preserves consistent physical material identity across Light and Dark themes via lighting inversion (dark drafting strokes on Light Vellum; bright rim-lit titanium edges on Dark Graphite) with WCAG 1.4.11 `>= 3:1` compliance:
| Token | Light Hex | Dark Hex | Verified Role |
| :--- | :--- | :--- | :--- |
| `--hw-chassis` | `#E4DFD4` | `#2B2A27` | Machined aluminum / dark anodized titanium arm tubes & carriage body |
| `--hw-joint-core` | `#24262B` (`13.54:1`) | `#161615` | Joint drum cores & parallel gripper housing |
| `--hw-edge-stroke` | `#5C584F` (`6.34:1`) | `#9A958B` (`6.18:1` canvas / `4.82:1` chassis) | Crisp `1px–1.5px` orthographic CAD strokes & datum crosshairs |
| `--hw-specular` | `#FAF8F4` | `#4A4842` | Subtle `1px` edge highlight line |
| `--hw-actuator` | `#B33A10` (`5.32:1`) | `#E35F32` (`5.22:1` canvas / `4.07:1` chassis) | Solid vermilion actuator rings, jaw tips, active dot-matrix pixels |
| `--hw-plumb` | `#0B5D8A` | `#6DBCE3` | `1px` dashed draftsman projection line (`stroke-dasharray: 2 3`) |

### 4.4 Calibrated Shiki Code Block Tokens (`--astro-code-*`, Verified `>= 4.87:1` AA)
| Token | Light (on `#ECE8DF`) | CR | Dark (on `#1C1C1A`) | CR |
| :--- | :--- | :--- | :--- | :--- |
| `foreground` / `parameter` | `#151619` | `14.80:1` | `#F2EFE9` | `14.87:1` |
| `background` | `#ECE8DF` | — | `#1C1C1A` | — |
| `comment` | `#595D66` | `5.40:1` | `#9D988F` | `5.95:1` |
| `keyword` | `#B33A10` | `4.87:1` | `#F07241` | `5.84:1` |
| `function` / `link` | `#0B5D8A` | `5.83:1` | `#6DBCE3` | `8.09:1` |
| `string` / `string-expression` | `#156E4B` | `5.11:1` | `#58C496` | `7.93:1` |
| `constant` | `#6B3FA0` | `6.04:1` | `#C69DF0` | `7.71:1` |
| `punctuation` | `#4A4E57` | `6.82:1` | `#C4BFB6` | `9.33:1` |

---

## 5. Inverted Above-the-Fold Geometry & Signature Showcase Mechanics

### 5.1 Zero-Collision Desktop Stack (`<= 485px` Total Hero Height — Fits `1280×720`, `1366×768`, `1440×900`)
Container width on `/` hero showcase uses `max-w-7xl` (`1280px` → `1216px` inner width = `~200px` per station column):
1. **Flat Hairline Top Bar (`56px` sticky):**
   * `>= 640px`: `CLAUDIU ȘPAN` flat Ș-trace wordmark | `Projects` · `Resume` · `Blog` | `Theme` · (`⌘K` on `md:` if kept per Gate #3) · `Download CV ↓` (`white-space: nowrap`, vermilion fill).
   * `< 640px` (`375px`/`390px` mobile — fits `<= 336px` inside `343px` inner width): `24×24` `CȘ` monogram (`sr-only` name) | `Projects` · `Resume` · `Blog` (`px-2 text-xs`) | `Theme` (`40×40`) · `CV ↓` (`px-2.5 text-xs`, `white-space: nowrap`). Zero overflow guaranteed.
2. **Compact 2-Column Swiss Editorial Identity Band (`~135–150px` tall):**
   * **Left (`~62%`):** Hero H1 **`Claudiu Șpan`** (SSR `opacity: 1` byte 0 -> `< 1.0s` LCP) + crisp role & proof line (`Applied AI, Automation & Robotics Engineer — 40+ enterprise workflows, ~70% review-time reduction · EU: Cluj-Napoca & Spain`).
   * **Right (`~38%`, aligned baseline):** Direct utility row (`Explore Projects →`, `ATS PDF ↓`, `Copy Email` with inline `Copied ✓` feedback — zero toast spam).
3. **Docked Orthographic Gantry + Articulated Cobot Stage (`116px` tall, `>= 1024px` fine pointer only; `gap: 0` directly above the 6 Showcase Stations):**
   * **Physically Docked Directly Above the 6 Stations:** Zero text exists between the gantry stage (`y = 0..116`) and the station top pickup detents (`y = 116`). The gripper physically reaches down to the active station's datum notch without ever crossing typography.
   * **Pure Inline SSR SVG (`<= 35` lightweight primitives, zero SVG `<filter>` blur):** Pre-rendered in its parked IDLE pose inside raw SSR HTML (`~1.8 KB` gzip HTML, `0.00 CLS`, zero MPA View Transition jump, graceful static CAD elevation on coarse-pointer tablets or no-JS).
   * **Compact Instrument Margin Strip (integrated cleanly along the top `22px` gantry bezel):**
     * Left: **`9×9` Braun Dot-Matrix Hardware Display** (see Section 5.2).
     * Right: Live optional `IK` telemetry toggle (`aria-pressed`, reveals inline tabular readout `X / J1 / J2 / J3 / GRIP` inside reserved bezel space with `0.00 CLS`) + WCAG 2.2.2 Motion Pause control (`aria-label="Pause robotic arm motion"` / `Live` toggling to `aria-label="Resume robotic arm motion"` / `Static`, without `aria-pressed`).
   * **Exact Verified Analytical IK & Spring Constants (`src/lib/kinematic-solver.ts`):**
     * Dynamic 1:1 CSS-pixel `viewBox="0 0 ${W} 116"` updated solely inside `ResizeObserver` (`W = stageEl.clientWidth`, `anchors[i] = stationCenterX - stageLeft` cached on resize — zero `getBoundingClientRect()` inside `rAF`).
     * Geometry (`STAGE_H = 116`): `RAIL_Y = 26`, `SHOULDER_Y = 36`, `L1 = 42`, `L2 = 34`, `WRIST_GRIP_DROP = 6` (`36 + 42 + 34 + 6 = 118` max vertical reach → hover target `y = 104`, clamp impulse `y = 112`, strictly inside `116px`!).
     * Redundancy split (eliminates vertical singularity): `X_MIN = 36`, `X_MAX = W - 36`, `CARRIAGE_LEAD_X = 34`, `targetCarriageX = clamp(targetX - CARRIAGE_LEAD_X, X_MIN, X_MAX)`.
     * Analytical left-elbow IK (`y` downward): `dx = targetX - carriageX`, `dy = (targetY - WRIST_GRIP_DROP) - SHOULDER_Y`, `r = clamp(Math.hypot(dx, dy), Math.abs(L1 - L2) + 2, L1 + L2 - 2)`, `cosJ2 = clamp((r*r - L1*L1 - L2*L2) / (2 * L1 * L2), -1, 1)`, `j2 = Math.acos(cosJ2)`, `j1 = Math.atan2(dy, dx) - Math.atan2(L2 * Math.sin(j2), L1 + L2 * Math.cos(j2))`, `j3 = Math.PI / 2 - (j1 + j2)` (vertical tool axis).
     * Inertial Feel (`dt = Math.min((now - prev) / 1000, 0.05)`): carriage `ζ = 1.0, ω_n = 18 rad/s` (`~180–360ms` natural mass-scaled glide), wrist/jaws `ζ = 0.88, ω_n = 26 rad/s` (crisp mechanical settle).
     * Separate Auto-Sleep Thresholds (rAF stops completely at rest): `0.15 px` & `0.15 px/s` for carriage `X`, `0.002 rad` & `0.002 rad/s` for `J1/J2/J3`, `0.005` for `grip`.
     * Reactive Hydration: Dynamic `import('@/lib/kinematic-runtime')` attaches via `MediaQueryList('(min-width: 1024px) and (pointer: fine)').addEventListener('change', ...)` with a clean `destroy()` teardown on shrink, reusing `getMotionEnvironment()` (`prefers-reduced-motion` + `saveData`) from `src/lib/motion.ts` + `IntersectionObserver` + `visibilitychange`.
     * Hover-out debounced `400ms` before gliding cleanly back to parked IDLE (`targetX = Math.round(W * 0.16)`, `targetY = 86`, `grip = 1`).
     * `pointerdown` tactile jaw pre-clamp (`110ms`, canceled cleanly on `pointercancel` / `pointerleave`) so physical feedback fires under the finger before `click` opens the target (`<= 140ms`).
4. **6 Single-Row Open Hairline Datum Stations (`<= 104px` tall on `>= 1024px`) + Full-Width Active Station Readout Bar (`48px`):**
   * Strictly 1D single row (`grid-template-columns: repeat(6, minmax(0, 1fr))`) on `>= 1024px` (zero 2-row `3×2` rail ambiguity!). Open `1px` vertical hairline partitions (`0px` radius, no closed rounded cards), top center machined datum notch aligned directly under `y = 116`.
   * Each station renders 3 crisp rows: `12px` category, `15px–16px` title (`<= 20` chars), `12px` mono proof metric (`<= 18` chars).
   * Directly below: **Active Station Readout Bar** displaying the untruncated 1–2 line summary and direct link for the currently targeted station (updating in `<= 60ms` optical lock on hover/focus, SSR-populated with Station 1 by default).
   * **Mobile (`< 1024px`):** `0 KB` kinematic JS loaded; permanent `1px` hairline rail divider enhanced with Scroll-Driven vermilion fill inside `@supports (animation-timeline: scroll()) and (prefers-reduced-motion: no-preference)`; stations stack cleanly into 2 columns (`640–1023px`) and 1 column (`< 640px`) with inline full summaries and zero `overflow: hidden`.

### 5.2 Unified `9×9` Braun Dot-Matrix Hardware Display (Preserved Pixel-Art Opt-In)
Eliminates the retro-vs-Swiss clash and the banned uppercase monospace eyebrow while making Claudiu's 6 custom `9×9` engineering pixel glyphs genuinely functional:
* Mounted inside the left bezel of the gantry rail (`27×27px` crisp SVG `viewBox="0 0 9 9" shape-rendering="crispEdges"`, plus compact mobile inline badge next to the Hero role line).
* **6 Embedded `9×9` Glyph Matrices** (ported directly from the prototype's verified bitmaps: `0: Profile/Chip`, `1: Enterprise Automation`, `2: QUADYX UAV`, `3: ElectrocasNicu RAG`, `4: Agri-Rover`, `5: Credentials/Terminal`, themed strictly with `--ink-primary`, `--accent-tech`, `--hw-actuator`).
* **LCP-Safe Boot Sequence (`<= 580ms`, `0ms` H1 block):** On first visit in session (`try { !sessionStorage.getItem('cs-intro-seen') } catch { false }` AND `prefers-reduced-motion: no-preference`), cycles cleanly through all 6 engineering glyphs (`~85ms` per glyph — a hardware `POST` self-test), then locks onto Station 1's glyph and updates live whenever the user hovers/focuses/selects any of the 6 stations. A subtle `POST` replay button sits inside the rail margin controls (never next to the H1). Under `prefers-reduced-motion: reduce`, repeat visits, or blocked `sessionStorage`, it displays Station 1's static glyph immediately with zero flash.

### 5.3 Native `<dialog>`, Progressive Top-Layer Transitions & Below-the-Fold Ledger
* **Docked Quick-Inspect `<dialog id="module-visor" closedby="any">`** *(if Gate #3 selects Option 1)*:
  * Docks below the gantry rail when opened from the hero (`margin-top` computed once from cached rail offset at `showModal()`, with transparent upper backdrop strip so the **live cobot stays visible and un-dimmed above the sheet**; falls back to centered modal if opened after scrolling).
  * Uses `@starting-style` for crisp `150ms` entry only + instant native `dialog.close()` (eliminating Safari/Firefox `data-closing` / `getAnimations()` race conditions), feature-detected `'closedBy' in HTMLDialogElement.prototype` fallback (`pointerdown`/`pointerup` bounds check), and `body:has(dialog:modal[open]) { overflow: hidden; }` + `overscroll-behavior: contain` for iOS scroll lock.
  * Switching stations via visible Prev/Next buttons or `← / →` (ignored when focus is inside the lens control) uses a crisp `120ms` CSS opacity swap on the inner body — **NOT** root `document.startViewTransition()` — so the live cobot glides at 60fps above the sheet without freezing or throwing `AbortError`.
  * Audience Lens Switch (`Recruiter Scan ↔ Engineer Deep Dive`) persists across switches and uses scoped `view-transition-name` (feature-detected, abort-safe) or crisp opacity swap.
  * All 6 stations are semantic `<a href={withBase(...)}>` links progressively enhanced with click interception when JS is active, guaranteeing 100% no-JS navigability.
* **De-Duplicated Below-the-Fold `/` Ledger (SSR HTML):**
  1. **Experience & Education Ledger:** Concise hairline rows synced from `resume.json` linking to `/resume/` for full coursework.
  2. **Verified Certifications (All 6 Visible Upfront):** 2×3 Swiss hairline grid (`Ctrl+F` searchable) with issuer, year, credential code (`AIF-C01`), and verify link.
  3. **Additional Projects & Client Work (4 Non-Duplicate Entries):** Hairline rows with color-step sibling dimming for `AIdeas`, `AI Resume Parser`, `RobSer Construct`, and `CLAUX Engineering Workshop` + link to `/projects/` (all 8 systems).
  4. **Technical Stack Matrix:** 4 typographic hairline columns (zero pill soup).
  5. **Direct Contact & Machine-Readable Footer:** Copy Email, GitHub, LinkedIn, `/resume/`, `/Claudiu-Span-CV.pdf`, `/llms.txt`, `/index.md`, `/rss.xml` (all routed via `withBase()`).

---

## 6. Performance, Accessibility & Verification Budgets

| Gate | Budget / Requirement | Enforcement |
| :--- | :--- | :--- |
| **Desktop `/` Initial Transfer** | **`< 300 KB`** (hard cap `< 500 KB`) | Playwright network transfer assertion (`portfolio.spec.ts`) |
| **Mobile `375×812` & `390×844` `/` Transfer** | **`< 220 KB`** (`0 KB` kinematic JS requests) | Playwright mobile network assertion (`hasTouch: true`) |
| **Global Gzipped JS (`dist/_astro`)** | **`<= 130 KB`** total (reclaiming `~15–20 KB` by uninstalling `motion`; kinematic chunk `<= 5 KB` gzip) | `scripts/verify-budgets.mjs` |
| **WOFF2 Fonts on Disk** | `<= 250 KB` total, zero `cyrillic`/`greek`/`vietnamese` subsets | `scripts/verify-budgets.mjs` |
| **LCP & CLS** | `LCP <= 1.8 s` (`0 ms` H1 hide); `CLS <= 0.02` | Playwright performance timing |
| **UI Click-to-Content Latency** | `<= 180 ms` (`0 ms` on `⌘K` open if enabled) | Playwright timing assertion |
| **Accessibility** | **0 axe-core WCAG 2.1 AA violations** across Light, Dark, OS-Default, Mobile (`375px` & `390px`), Hover/Focus dimmed states, Visor Open | `@axe-core/playwright` (`portfolio.spec.ts`) |
| **ATS PDF & AI-Native Sync** | Strict **1-page A4** text-extractable PDF (`<= 300 KB`) + `/llms.txt` & `/index.md` synced to `resume.json` with `0` local-path/private-repo leaks | `verify-pdf.mjs` + `verify-content.mjs` + `verify-budgets.mjs` |

---

## Detailed Implementation Plan

### Complete Target File Manifest (`Create / Modify / Delete`)

#### Create
* `src/env.d.ts` — Augment `astroHTML.JSX.DialogHTMLAttributes` with `closedby?: 'any' | 'closerequest' | 'none'` so `pnpm check` passes cleanly on native `<dialog closedby="any">`.
* `src/data/showcase-modules.ts` — Typed build-time adapter `buildShowcaseModules(resume, projects)` generating the 6 Showcase Stations + dual-lens Visor payloads + `9×9` pixel glyph matrices directly from `resume.json` & MDX (zero shadow data drift).
* `src/lib/kinematic-solver.ts` — Pure TypeScript math (2-link left-elbow IK solver, critically damped `ServoSpring`, separate settle thresholds, zero DOM imports).
* `src/lib/kinematic-runtime.ts` — Browser SVG/rAF/`ResizeObserver`/`IntersectionObserver`/`MediaQueryList` driver (dynamically imported only on `(min-width: 1024px) and (pointer: fine)`, reusing `getMotionEnvironment()` from `src/lib/motion.ts`).
* `src/lib/dialog-utils.ts` — Shared progressive `'closedBy' in HTMLDialogElement.prototype` outside-bounds `pointerdown`/`pointerup` light-dismiss helper (reused by `InspectorDrawer.tsx`, `ModuleVisorDialog.astro`, and `CommandPalette.astro`).
* `src/components/KinematicHero.astro` — 2-column Swiss Editorial Identity Band (`H1: Claudiu Șpan`), docked `116px` SSR inline SVG orthographic gantry + cobot + `9×9` Braun dot-matrix display, 6 open-hairline Datum Stations, and Active Station Readout Bar.
* `src/components/ModuleVisorDialog.astro` — *(If Gate #3 = Option 1)* Docked `<dialog id="module-visor" closedby="any">` Inspection Sheet with `Recruiter Scan ↔ Engineer Deep Dive` lens and Prev/Next keyboard controls.
* `src/components/CommandPalette.astro` — *(If Gate #3 = Option 1)* Desktop-triggered `<dialog id="cmd-palette" closedby="any">` with `0ms` open transition, live search filter, arrow navigation, `withBase()` routing, and route-aware IK toggle.
* `src/content/projects/agri-rover.mdx` & `src/content/projects/agri-rover.architecture.json` — Mandatory 4-stage factual architecture graph (`Sensors -> Fusion & Guidance -> Motor Control -> Failsafe Telemetry` using valid schema kinds `source`/`process`/`guardrail`/`human`, both `nominal` and `guardrail` scenarios).
* `src/pages/llms.txt.ts` & `src/pages/index.md.ts` — Static Astro endpoints compiled from `getResumeData()` + `getCollection('projects')`, routing every link via `absoluteUrl()` (trailing slashes on pages, no trailing slashes on files) and guarding `repoUrl` strictly by `visibility === 'public'`.
* `tests/unit/kinematic-solver.test.ts` — Unit test suite (`>= 95%` coverage) verifying IK bounds, singularity avoidance, spring damping, and settle thresholds.

#### Modify
* **Data & Schemas:** `src/data/resume.json`, `src/data/resume.schema.ts` (add optional `pdfLocation` & `thesis.projectSlug`), `src/data/site.ts` (sync `role`/`location` from `resume.json`), `src/content/projects/aideas.mdx` (`order: 5`), `ai-resume-parser.mdx` (`order: 6`), `client-robser-construct.mdx` (`order: 7`), `claux-workshop.mdx` (`order: 8`).
* **Dependencies & Config:** `package.json` (add `@fontsource-variable/ibm-plex-sans`, `@fontsource/ibm-plex-mono`; **remove `motion`**), `vitest.config.ts` (exclude `src/lib/kinematic-runtime.ts` alongside `src/lib/motion.ts` from Node DOM-less coverage).
* **Design Tokens & Styles:** `src/styles/tokens.css` (OKLCH Light/Dark + `--bg-recessed` + `--hw-*` + 11 Shiki tokens + `--ring-focus`), `src/styles/global.css` (`@theme inline`, remove `.bento-card` & global `0.01ms` reduced-motion reset, add color-step sibling dimming, `@view-transition`, scoped `<dialog>` rules, Scroll-Driven mobile rail fallback), `src/styles/print.css` (`:root { color-scheme: light !important; }`, hide `[data-kinematic-stage], dialog`, remove `.bento-card` & `[data-resume-side-cta]`).
* **Shell & Brand Assets:** `src/layouts/BaseLayout.astro` (self-hosted WOFF2 `?url` preloads without `withBase()`, remove `includeMonoFont` & `ResumeSideButton`, WebView-safe theme bootstrap, updated JSON-LD), `src/components/Header.astro` (flat `56px` Swiss hairline bar, flat `CLAUDIU ȘPAN` Ș-trace mark, `375px`-safe mobile layout, clean ARIA button semantics), `src/components/Footer.astro` (add `/llms.txt` & `/index.md` links), `public/favicon.svg` (`2px`-radius Swiss Cleanroom CȘ + vermilion trace).
* **Pages & Components (Zero Residual `.bento-card` / `baby` / `coral`):** `src/pages/index.astro` (compose `KinematicHero` + de-duplicated ledger, preserve `resolveLegacyRedirect` with namespaced `#home-*` IDs), `src/pages/projects/index.astro` (2-col case-study grid, `[aria-pressed="true"]` CSS filters removing inline `btn.className` overwrite, retitled `Robotics & CPS`), `src/pages/projects/[slug].astro`, `src/pages/resume.astro` (remove `hideResumeSideButton`, link BSc thesis to `/projects/agri-rover/`), `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, `src/pages/404.astro`, `src/components/ProjectCard.astro` (remove `FallbackCover` import, label `public` without `repoUrl` as `Academic Hardware Prototype`), `src/components/CertificationGrid.astro`, `src/components/SubscribeForm.astro`, `src/components/TableOfContents.astro`, `src/components/CopyCodeEnhancer.astro`.
* **Architecture Visualizer:** `src/components/diagram/ArchitectureVisualizer.tsx` (remove `motion/react` import & replace single `pathLength` animation with CSS `stroke-dashoffset`, fix undefined `--accent-primary-glow`, strip `01 /` stage prefixes, `2px` radii, bump `fontSize="11"`/`text-xs`), `InspectorDrawer.tsx` (reuse `dialog-utils.ts`, fix duplicate `#inspector-node-title` DOM ID, Swiss tokens), `MobilePipeline.tsx` (strip `01 ·` prefixes, Swiss tokens), `DiagramErrorBoundary.tsx`.
* **Print PDF & Build/QA Scripts:** `src/layouts/PrintResumeLayout.astro` & `src/pages/resume-print.astro` (Swiss ink/vermilion accents, 1-page A4 balance), `scripts/build-resume-pdf.mjs` (replace hardcoded Dark Bento OG card HTML with Swiss Cleanroom Vellum OG card), `scripts/serve-dist.mjs` (add `'.md': 'text/markdown; charset=utf-8'`), `scripts/verify-budgets.mjs` (require `llms.txt` & `index.md`, drop dead `public/media/*` video checks, enforce `<= 130 KB` gzipped JS + kinematic chunk `<= 5 KB` gzip + `<= 250 KB` WOFF2 with zero non-Latin subsets), `scripts/verify-content.mjs` (add `.md` to `textExts` + AI-native `resume.json` sync drift assertions), `scripts/verify-pdf.mjs` (verify strict 1-page A4 + updated canonical tokens).
* **Tests & Docs:** `tests/unit/diagram-layout.test.ts` (validate all 4 architecture graphs including `agri-rover.architecture.json`), `tests/e2e/portfolio.spec.ts` (replace `[data-resume-side-cta]` with Header `Resume` link, add `/projects/agri-rover/`, test `375×812` & `390×844` with `hasTouch: true`, assert `< 300 KB` desktop / `< 220 KB` mobile transfer, `0` kinematic JS on mobile, H1 first-paint visibility, OS-default + override theme reset, Visor `< 180 ms` latency, zero axe-core violations including hover/focus states, `/llms.txt` & `/index.md` HTTP 200 + `text/markdown`), `AGENTS.md`, `README.md`, `design-system/personal-website/*`.

#### Delete
* `src/components/ResumeSideButton.astro` (banned floating edge tab)
* `src/components/HeroMedia.astro` (replaced by `KinematicHero.astro`)
* `src/components/FallbackCover.astro` (banned repetitive placeholder schematic SVG)

### Verification Gate Before Completion
1. Static grep hygiene check: `0` residual references to `bento-card`, `text-baby`, `bg-baby`, `bg-coral`, `text-coral`, `--accent-primary`, `--accent-contrast`, `--border-subtle`, `--text-primary`, `Space Grotesk`, `JetBrains Mono`.
2. Full repo gate: `pnpm verify:all` (`astro check && tsc`, `eslint`, `vitest --coverage`, `astro build`, `pdf:build`, `pdf:verify`, `verify:content`, `verify:budgets`, `playwright test`).
3. Post-render Anti-AI-Slop visual screenshot audit across Desktop (`1440×900`, `1280×720` Light/Dark/Hover/Visor) and Mobile (`375×812`, `390×844`).

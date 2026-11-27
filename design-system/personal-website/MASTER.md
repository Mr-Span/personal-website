# Design System Master — Personal Website v3.1 (Apple Hardware × Warm Cleanroom Industrial 3D/2.5D)

Source of truth for visual tokens, typography, tactile hardware geometry, 3D PBR lighting, accessibility contrast, and performance budgets in `Mr-Span/personal-website`.

## 1. Visual Voice & Hardware Craft
- **Direction:** Apple Hardware Precision × Warm Ceramic Cleanroom Industrial 3D/2.5D across a unified single-page portfolio (`/`) and minimalist technical blog (`/blog/`).
- **Subtitle Signature:** `"Science can amuse and fascinate us all, but it is engineering that changes the world." — Isaac Asimov` (displayed directly beneath the byte-0 `Claudiu Șpan` H1).
- **Polarity:** OS `prefers-color-scheme` default (`<meta name="color-scheme" content="light dark">`) + two-state manual override (`localStorage` key `claudiu-span-theme-v2`, auto-clears when returning to OS polarity).
- **Tactile Geometry & Surfaces:**
  - Frosted hardware header capsules (`.nav-capsule`, `.brand-capsule`, `.home-back-capsule`, `.brand-blog-union`, `11px–12px` radius) with subtle top specular sheen (`--inner-highlight`, `--shadow-bevel`) and native MPA `@view-transition` header morph (`vt-brand-claux`, `vt-nav-blog`).
  - Anodized burnt-orange primary CTAs (`.cta-anodized`, `11px` radius, `#FAF8F5` text >= 5.5:1 in both themes, omitted on `/blog/` routes) and machined secondary bevel buttons (`.cta-secondary-bevel`, `10px` radius).
  - Cleanroom below-the-fold editorial sections (`#experience`, `#projects`, `#certifications`, `#stack`) laid directly on `--bg-canvas` with `1px` `--border-hairline` dividers and zero box-in-a-box card wrappers.
  - 6 upright 2.5D molded ceramic-over-aluminum monolith cartridges (`.tile-card`, `13px` radius) seated in milled desk wells (`.tile-desk-well`) with recessed center robot latch pockets (`.tile-detent`).
  - Right-edge tucked Ceramic Monobloc Personal Badge (`PersonalBadgeDock` + `<dialog id="personal-badge-dialog" closedby="any">`, also accessible via Footer `Open Badge` `claux:open-badge` and mobile pull-tab).
- **Authorized Signatures:**
  - Desktop-only (`>= 1024px` & `pointer: fine`) Three.js `0.185` PBR 6-DOF UR Cobot + Heavy CNC 7th-Axis Linear Gantry Rail (`src/lib/kinematic-runtime.ts`) using procedural `RoomEnvironment` IBL lighting (0 external 3D asset fetches, 0 KB downloaded on mobile).
  - Real-time optical targeting laser on cartridge hover, ~200ms `ENGAGE_TAP` latch press dispatching `claux:cnc-navigate` to the sticky desktop R1 `#vertical-cnc-rail` (4 stations: `Experience`, `Projects`, `Certs`, `Stack` + pixel-art servo shuttle, cancelling immediately on `wheel`/`touchstart`/`pointerdown`/nav keys), full Personal Badge 3D pull/return choreography, and a `9×9` pixel-art intro cascade folding into the domain capsule.
  - Reusable minimalist pixel-art SVG micro-schematics (`ProjectPixelVisual`: `pipeline`, `uav`, `retrieval`, `rover`, paused off-screen via `IntersectionObserver`) and a full-bleed `[ Drones | List ]` certifications section whose list view uses `hidden="until-found"` with `beforematch` and Safari fallback.
- **Anti-AI-Slop Guardrails:**
  - No generic purple/indigo SaaS gradients, no `Space Grotesk`/`Inter`/`JetBrains Mono` defaults, no Tailwind Slate+Sky defaults, no containeritis/pill soup, no numbered `01 /` eyebrows, no low-contrast glassmorphism, and strictly verifiable factual claims only.

## 2. Self-Hosted Typography (`Instrument Sans` + `IBM Plex`)
All fonts are self-hosted WOFF2 with `latin` + `latin-ext` (native Romanian `Ș`/`Ț`) only and zero unused Cyrillic/Greek/Vietnamese subsets (`<= 250 KB` total disk budget, ~144 KB actual):
- **Display & Headings (`--family-display`):** `Instrument Sans Variable` (`400–700`, `latin` + `latin-ext`, fallback `IBM Plex Sans Variable`).
- **Body & Editorial Prose (`--family-body`):** `IBM Plex Sans Variable` (`100–700`, `latin` + `latin-ext`).
- **Technical, IK Telemetry, Dates & Code (`--family-mono`):** `IBM Plex Mono` (`400`, `500`, `latin`, `tabular-nums`).

## 3. Verified WCAG 2.1 AA Color System
All foreground/background pairs exceed WCAG 2.1 AA (`>= 4.5:1` normal text, `>= 3:1` UI components) across both Light and Dark themes:

### Light — Warm Ceramic Industrial Cleanroom
- **Surfaces:** Canvas `#EFECE7`, Surface `#F8F6F2`, Elevated `#FCFBF9`, Recessed `#E6E2DB`, Frosted Glass `rgba(248, 246, 242, 0.91)`.
- **Borders:** Hairline `#D8D4CC`, Strong `#C5C0B6`, Interactive `#948F84`.
- **Typography:** Ink `#17181B` (`15.07:1` canvas / `16.45:1` surface), Secondary `#3E424A` (`8.56:1` / `9.34:1`), Muted `#52565E` (`6.25:1` / `6.82:1`).
- **Accents:** Vermilion `#B33D0E` (`4.96:1` canvas / `5.42:1` surface; hover `#96310B`), Tech `#025F92` (`5.83:1` / `6.37:1`; 3D optical laser `#38BDF8`), Signal `#0F6E4A` (`5.32:1` / `5.81:1`), On-Accent `#FAF8F5` (`5.52:1` on Vermilion).
- **2.5D Monolith & Pickup Lug:** Shell Ring `rgba(110, 102, 90, 0.36)` (hover `#025F92` tint, hoist `#B33D0E` tint), Ceramic Face `#FBF9F5` → `#EDE8DF`, Aluminum Plinth `#DBD5CA` → `#B4ACA0`, Pickup Lug `#1E2129` with `#CC4B14` bar.

### Dark — Machined Charcoal Cleanroom
- **Surfaces:** Canvas `#111317`, Surface `#191C22`, Elevated `#20242C`, Recessed `#13161B`, Frosted Glass `rgba(25, 28, 34, 0.92)`.
- **Borders:** Hairline `#2B303B`, Strong `#3A4150`, Interactive `#586174`.
- **Typography:** Ink `#F2EFE9` (`16.20:1` canvas / `14.87:1` surface), Secondary `#C5C9D2` (`11.21:1` / `10.29:1`), Muted `#989FA9` (`6.97:1` / `6.39:1`).
- **Accents:** Vermilion `#F5783E` (`6.76:1` canvas / `6.21:1` surface; hover `#FF8D57`), Tech `#38BDF8` (`8.68:1` / `7.97:1`), Signal `#4ADE80` (`10.67:1` / `9.79:1`), On-Accent `#111317` (`6.76:1` on Vermilion).
- **2.5D Monolith & Pickup Lug:** Shell Ring `rgba(128, 142, 168, 0.28)` (hover `#38BDF8` tint, hoist `#F5783E` tint), Ceramic Face `#212630` → `#151920`, Aluminum Plinth `#262C38` → `#12151C`, Pickup Lug `#373E4E` with `#F97316` bar.

### 3D PBR Studio Material Layer (`PALETTE_3D`)
- **Light Studio:** Anodized ceramic arm tubes (`#E3DFD7`), brushed aluminum gantry (`#C9C5BD`), joint caps (`#23262E`), vermilion trim (`#B84312`), cyan targeting LED (`#38BDF8`), warm studio IBL (`envIntensity: 0.62`).
- **Dark Studio:** Bead-blasted dark anodized aluminum arm tubes (`#4B5465`), charcoal CNC gantry (`#3D4452`), obsidian joint caps (`#181B22`), high-visibility orange trim (`#EA580C`), cyan targeting LED (`#38BDF8`), cool studio IBL (`envIntensity: 0.85`).

## 4. Motion, Budgets & Modern Web Platform
- **Dialogs:** Native `<dialog closedby="any">` + `@starting-style` entry + progressive Safari light-dismiss fallback (`src/lib/dialog-utils.ts`).
- **Navigation:** Native MPA `@view-transition { navigation: auto; }` gated by `prefers-reduced-motion: no-preference`.
- **Micro-Schematics & Marquee:** Pure CSS keyframe animations in `ProjectPixelVisual` and `CertificationCarousel`, paused automatically off-screen via `IntersectionObserver` and gated by `prefers-reduced-motion` (zero external JS motion runtime).
- **3D Lifecycle:** WebGL `setAnimationLoop` auto-sleeps once servo springs settle, pauses on off-screen `IntersectionObserver` / hidden tab / `prefers-reduced-motion` / `Save-Data`, and disposes all GPU geometries, materials, and textures on teardown.
- **Verified Budgets:**
  - Self-hosted WOFF2 fonts: `<= 250 KB` total (0 Cyrillic/Greek/Vietnamese subsets).
  - Non-3D core app JS: `<= 45 KB` gzipped.
  - Desktop-only lazy 3D JS (`kinematic-runtime` + Three.js): `<= 220 KB` gzipped (0 KB requested on mobile).
  - Wire transfer: `< 420 KB` desktop initial load, `< 200 KB` mobile `390×844` load.
  - ATS Resume PDF: strict `1 page A4`, `<= 300 KB`, compiled alongside `/llms.txt` and `/index.md` from single-source `resume.json`.

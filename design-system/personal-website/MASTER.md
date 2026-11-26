# Design System Master — Personal Website v3.0 (Apple Hardware × Warm Cleanroom Industrial 3D/2.5D)

Source of truth for visual tokens, typography, tactile hardware geometry, 3D PBR lighting, accessibility contrast, and performance budgets in `Mr-Span/personal-website`.

## 1. Visual Voice & Hardware Craft
- **Direction:** Apple Hardware Precision × Warm Ceramic Cleanroom Industrial 3D/2.5D.
- **Subtitle Signature:** `Engineering Systems in Motion.` (displayed directly beneath the byte-0 `Claudiu Șpan` H1).
- **Polarity:** OS `prefers-color-scheme` default (`<meta name="color-scheme" content="light dark">`) + two-state manual override (`localStorage` key `claudiu-span-theme-v2`, auto-clears when returning to OS polarity).
- **Tactile Geometry & Surfaces:**
  - Frosted hardware header capsules (`.nav-capsule`, `.brand-capsule`, `11px` radius) with subtle top specular sheen (`--inner-highlight`, `--shadow-bevel`).
  - Anodized burnt-orange primary CTAs (`.cta-anodized`, `11px` radius, `#FAF8F5` text >= 5.5:1 in both themes) and machined secondary bevel buttons (`.cta-secondary-bevel`, `10px` radius).
  - Below-the-fold hardware panels (`.hw-panel`, `12px` radius, `--shadow-card`) and recessed industrial cells (`.hw-cell`, `10px` radius, `--shadow-bevel`).
  - 6 upright 2.5D industrial cartridges (`.tile-card`, `10px` radius) with stacked physical extrusion shadow edges (`--block-edge` through `--block-edge-deep`), subtle micro-ribs, corner rivets, and high-contrast machined pickup lug detents (`.tile-detent`) for 3D gripper jaws.
  - Native frosted `<dialog id="module-visor" closedby="any">` (`18px` radius, `--surface-glass`, `--shadow-visor`) featuring a top physical gripper clamp receiver (`.visor-clamp`) and an Apple-style sliding segmented control (`Recruiter Scan` ↔ `Engineer Deep Dive`).
- **Authorized Signatures:**
  - Desktop-only (`>= 1024px` & `pointer: fine`) Three.js `0.185` PBR 6-DOF UR Cobot + Heavy CNC 7th-Axis Linear Gantry Rail (`src/lib/kinematic-runtime.ts`) using procedural `RoomEnvironment` IBL lighting (0 external 3D asset fetches, 0 KB downloaded on mobile).
  - Real-time optical targeting laser on cartridge hover, ~500ms physical pick/clamp/hoist choreography into `#module-visor`, toggleable 6-DOF IK telemetry HUD (`#ik-hud-readout`), WCAG 2.2.2 Pause/Resume control, and a `9×9` pixel-art intro launching an autonomous obstacle-avoiding flying pixel drone.
- **Anti-AI-Slop Guardrails:**
  - No generic purple/indigo SaaS gradients, no `Space Grotesk`/`Inter`/`JetBrains Mono` defaults, no Tailwind Slate+Sky defaults, no pill soup, no low-contrast glassmorphism, and strictly verifiable factual claims only.

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
- **2.5D Cartridge & Pickup Lug:** Border `#B2ABA0`, Edges `#D4CEC4` → `#7F786B`, Pickup Lug `#1E2129` with `#CC4B14` bar, Visor Clamp `#E2DED6` / `#ABA69C`.

### Dark — Machined Charcoal Cleanroom
- **Surfaces:** Canvas `#111317`, Surface `#191C22`, Elevated `#20242C`, Recessed `#13161B`, Frosted Glass `rgba(25, 28, 34, 0.92)`.
- **Borders:** Hairline `#2B303B`, Strong `#3A4150`, Interactive `#586174`.
- **Typography:** Ink `#F2EFE9` (`16.20:1` canvas / `14.87:1` surface), Secondary `#C5C9D2` (`11.21:1` / `10.29:1`), Muted `#989FA9` (`6.97:1` / `6.39:1`).
- **Accents:** Vermilion `#F5783E` (`6.76:1` canvas / `6.21:1` surface; hover `#FF8D57`), Tech `#38BDF8` (`8.68:1` / `7.97:1`), Signal `#4ADE80` (`10.67:1` / `9.79:1`), On-Accent `#111317` (`6.76:1` on Vermilion).
- **2.5D Cartridge & Pickup Lug:** Border `#454E62`, Edges `#151922` → `#020305`, Pickup Lug `#373E4E` with `#F97316` bar, Visor Clamp `#252933` / `#485060`.

### 3D PBR Studio Material Layer (`PALETTE_3D`)
- **Light Studio:** Anodized ceramic arm tubes (`#E3DFD7`), brushed aluminum gantry (`#C9C5BD`), joint caps (`#23262E`), vermilion trim (`#B84312`), cyan targeting LED (`#38BDF8`), warm studio IBL (`envIntensity: 0.62`).
- **Dark Studio:** Bead-blasted dark anodized aluminum arm tubes (`#4B5465`), charcoal CNC gantry (`#3D4452`), obsidian joint caps (`#181B22`), high-visibility orange trim (`#EA580C`), cyan targeting LED (`#38BDF8`), cool studio IBL (`envIntensity: 0.85`).

## 4. Motion, Budgets & Modern Web Platform
- **Dialogs:** Native `<dialog closedby="any">` + `@starting-style` entry + progressive Safari light-dismiss fallback (`src/lib/dialog-utils.ts`).
- **Navigation:** Native MPA `@view-transition { navigation: auto; }` gated by `prefers-reduced-motion: no-preference`.
- **Diagrams:** Pure CSS `stroke-dashoffset` flow animation in `ArchitectureVisualizer` (zero external JS motion runtime).
- **3D Lifecycle:** WebGL `setAnimationLoop` auto-sleeps once servo springs settle, pauses on off-screen `IntersectionObserver` / hidden tab / `prefers-reduced-motion` / `Save-Data` / manual Pause, and disposes all GPU geometries, materials, and textures on teardown.
- **Verified Budgets:**
  - Self-hosted WOFF2 fonts: `<= 250 KB` total (0 Cyrillic/Greek/Vietnamese subsets).
  - Non-3D core app JS: `<= 130 KB` gzipped.
  - Desktop-only lazy 3D JS (`kinematic-runtime` + Three.js): `<= 220 KB` gzipped (0 KB requested on mobile).
  - Wire transfer: `< 480 KB` desktop initial load, `< 220 KB` mobile `390×844` load.
  - ATS Resume PDF: strict `1 page A4`, `<= 300 KB`, compiled alongside `/llms.txt` and `/index.md` from single-source `resume.json`.

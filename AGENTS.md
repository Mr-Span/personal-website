# AGENTS.md — Personal Website (`Mr-Span/personal-website`)

Working guide for AI agents contributing to this repository.

## Project & Deployment
- **Public Repository:** `https://github.com/Mr-Span/personal-website`
- **Active Local Dev Clone:** `C:\Dev\personal-website` (outside OneDrive to avoid `node_modules/` file-locking on Windows)
- **Hosting:** 100% static on GitHub Pages with optional custom domain, deployed via `.github/workflows/deploy.yml`
- **Stack (v2.1):** Astro 5 (`output: 'static'`, `trailingSlash: 'always'`), TypeScript strict, Tailwind CSS v4 (`@theme inline`), self-hosted IBM Plex superfamily, React islands (`client:visible`, zero `motion` dependency — pure CSS trace animation), vanilla TS desktop-only kinematic engine + autonomous pixel drone (`< 5 KB` gzip, `0 KB` loaded on mobile), MDX + Zod Content Collections, Shiki (`css-variables`), Playwright ATS PDF pipeline, build-time `/llms.txt` & `/index.md`
- **Design Document:** `docs/designs/personal-website-v2-swiss-kinematic.md`
- **Rollback Baseline:** Git tag `v1.0-static-backup`

## Design System & UI Quality (Anti-AI-Slop — Swiss Cleanroom × Braun/CAD)
- Visual source of truth: `src/styles/tokens.css`, `src/styles/global.css`, and `docs/designs/personal-website-v2-swiss-kinematic.md`.
- **Polarity:** OS `prefers-color-scheme` default (`<meta name="color-scheme" content="light dark">`) + persistent manual toggle (`localStorage` key `claudiu-span-theme-v2`):
  - **Light (Warm Cleanroom Vellum):** `#F5F2EB` canvas, `#ECE8DF` recessed/surface, `#151619` ink, `#B33A10` vermilion, `#0B5D8A` blueprint tech blue.
  - **Dark (Anodized Graphite Cleanroom):** `#141413` canvas, `#1C1C1A` surface, `#F2EFE9` ink, `#F07241` / `#E35F32` vermilion, `#6DBCE3` desaturated steel-cyan, plus dedicated `--hw-*` orthographic hardware tokens.
- **Geometry & Restraint:** `0px–2px` border radius, `1px` architectural hairlines, color-step sibling dimming (`>= 5.4:1` AA), zero `.bento-card` containeritis, zero `Space Grotesk`/`Inter`/`JetBrains Mono`, zero pill soup, zero floating right-edge tabs.
- **Authorized Interactive Signatures:** Desktop-only (`>= 1024px`, fine pointer) overhead 2D orthographic cobot arm on linear rail (background layer underneath readable hero copy) + toggleable live IK telemetry + WCAG 2.2.2 Pause toggle + `9×9` pixel-art intro transforming the UAV glyph into an autonomous flying pixel drone.
- Maintain WCAG 2.1 AA contrast (`>= 4.5:1` normal text, `>= 3:1` non-text), visible `:focus-visible`, `prefers-reduced-motion`, native `<dialog>` modals, and strict transfer/JS budgets (`< 300 KB` desktop, `< 220 KB` mobile with `0 KB` kinematic JS).

## Data & Security Invariants
- Single source of truth for `/`, `/resume/`, `/Claudiu-Span-CV.pdf`, `/llms.txt`, and `/index.md`: `src/data/resume.json` + `src/content/projects/*.mdx` (validated via Zod, rendered via Playwright `/resume-print/` -> CI verified strictly 1 page A4 & `<= 300 KB`).
- **Private Repos:** Zod strictly forbids `repoUrl` when `visibility !== 'public'`.
- **Public Repo Security:** Never commit secrets, tokens, private notes, local Windows paths, or unredacted personal certificate files containing PII/CNP/EXIF.
- Keep `Mr-Span/claux-cv` and `Mr-Span.github.io` completely independent and untouched.

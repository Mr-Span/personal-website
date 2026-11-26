# Claudiu Șpan — Personal Website, CV & Engineering Portfolio (v2.1)

Static-first Swiss Cleanroom Editorial & Precision Kinematic engineering portfolio, structured CV with build-time 1-page ATS PDF generation, interactive System Architecture Visualizers, AI-native `/llms.txt` & `/index.md` endpoints, and MDX technical blog deployed on GitHub Pages.

- **Design Specification:** [`docs/designs/personal-website-v2-swiss-kinematic.md`](docs/designs/personal-website-v2-swiss-kinematic.md)
- **Rollback Tag (v1.0 Static):** `v1.0-static-backup`

## Stack
- **Static Framework:** Astro 5 (`output: 'static'`, `trailingSlash: 'always'`) + TypeScript strict
- **Design System:** Tailwind CSS v4 (`@theme inline`) + OKLCH WCAG 2.1 AA/AAA tokens (OS-aware Warm Cleanroom Vellum Light & Anodized Graphite Dark + manual toggle) + self-hosted subsetted IBM Plex Sans Variable & IBM Plex Mono
- **Interactive Craft:**
  - Desktop (`>= 1024px`, fine pointer): `< 5 KB` gzip vanilla TS overhead 2D orthographic articulated cobot arm on linear rail (background layer underneath hero copy) + live IK telemetry + `9×9` pixel-art intro launching an autonomous flying UAV pixel drone (`0 KB` downloaded on mobile)
  - Native `<dialog closedby="any">` Quick-Inspect sheet (`Recruiter Scan ↔ Engineer Deep Dive`) + `⌘K` Command Palette + MPA `@view-transition { navigation: auto; }`
  - React islands (`client:visible`) for interactive `ArchitectureVisualizer` case-study diagrams (Nominal / Guardrail modes, pure CSS `stroke-dashoffset` trace — zero external motion libraries)
- **Single Source of Truth & AI-Native:** `src/data/resume.json` + Zod Content Collections compiling HTML, strict 1-page A4 `dist/Claudiu-Span-CV.pdf`, `/llms.txt`, `/index.md`, and `/rss.xml`

## Local Development (Windows / Linux)
Clone outside OneDrive (e.g. `C:\Dev\personal-website`) to avoid file-locking on `node_modules/`. Requires **Node.js 22 LTS** and **`pnpm`**.

```bash
pnpm install --frozen-lockfile
pnpm dev                 # Local dev server
pnpm check               # Astro + TypeScript strict check
pnpm lint                # ESLint strict check
pnpm test:unit:coverage  # Vitest unit tests + >= 85% coverage (kinematic solver, layout, schemas)
pnpm build               # Static build to dist/
pnpm pdf:build           # Generate 1-page A4 ATS PDF + Swiss Cleanroom OG card
pnpm pdf:verify          # Verify 1-page A4, <= 300 KB, ATS text extraction
pnpm verify:content      # Verify zero local paths, PII leaks, and llms.txt/index.md sync
pnpm verify:budgets      # Verify WOFF2 <= 250 KB, gzipped JS <= 130 KB, kinematic <= 5 KB
pnpm test:e2e            # Playwright E2E + axe-core WCAG AA (1440px, 390px, 375px; Light & Dark)
pnpm verify:all          # Run full verification gate locally
```

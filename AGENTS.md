# AGENTS.md — Personal Website (`Mr-Span/personal-website`)

Working guide for AI agents contributing to this repository.

## Project & Deployment
- **Public Repository:** `https://github.com/Mr-Span/personal-website`
- **Active Local Dev Clone:** `C:\Dev\personal-website` (outside OneDrive to avoid `node_modules/` file-locking on Windows)
- **Hosting:** 100% static on GitHub Pages with custom domain (`CNAME` via Repository Settings -> Pages), deployed via `.github/workflows/deploy.yml`
- **Stack (v2.0):** Astro (`output: 'static'`, `trailingSlash: 'always'`), TypeScript strict, Tailwind CSS v4, React + Motion (`LazyMotion`) islands (`client:visible`), MDX + Zod Content Collections, Shiki (`css-variables`), Playwright ATS PDF pipeline
- **Design Document:** `docs/designs/personal-website-v2.md`
- **Rollback Baseline:** Git tag `v1.0-static-backup`

## Design System & UI Quality
- Visual source of truth: `design-system/personal-website/MASTER.md`, `design-system/personal-website/tokens.css`, and `src/styles/tokens.css`.
- **Polarity:** Techy Dark Mode default (`#070B12`, `#0D1422`, Baby Blue `#38BDF8`/`#7DD3FC`, Signal Coral `#FB7185`, Signal Mint `#34D399`) + Light Mode toggle (`#F8FAFC`, `#FFFFFF`, Sky-700 `#0369A1`, Rose-700 `#BE123C`, Emerald-700 `#047857`).
- **Zero Clutter:** No fake telemetry HUDs, no decorative micro-badges, no hover-open Resume overlays, no circular carousels hiding certifications.
- Maintain WCAG 2.1 AA contrast (`>= 4.5:1` normal text) in both Light and Dark themes, visible `:focus-visible`, `prefers-reduced-motion: reduce`, and Lighthouse `>= 95` (Perf/A11y/BP/SEO) at `1440px` and `375px`.

## Data & Security Invariants
- Single source of truth for `/resume` and `/Claudiu-Span-CV.pdf`: `src/data/resume.json` (validated via Zod, rendered via Playwright `/resume-print/` -> CI verified `1–2` pages & `<= 300 KB`).
- **Private Repos:** Zod strictly forbids `repoUrl` when `visibility !== 'public'`.
- **Public Repo Security:** Never commit secrets, tokens, private notes, raw Google AI Pro exports (`raw-media/`), local Windows paths, or unredacted personal certificate files containing PII/CNP/EXIF.
- Keep `Mr-Span/claux-cv` and `Mr-Span.github.io` completely independent and untouched.

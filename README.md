# Claudiu Șpan — Personal Website, CV & Applied AI Portfolio (v2.0)

Static-first personal engineering portfolio, structured CV with build-time ATS PDF generation, interactive System Architecture Visualizers, and MDX technical blog architecture deployed on GitHub Pages.

- **Design Specification:** [`docs/designs/personal-website-v2.md`](docs/designs/personal-website-v2.md)
- **Rollback Tag (v1.0 Static):** `v1.0-static-backup`

## Stack
- **Static Framework:** Astro (`output: 'static'`, `trailingSlash: 'always'`) + TypeScript strict
- **Styling:** Tailwind CSS v4 + WCAG AA semantic tokens (Dark Baby Blue default + Light toggle)
- **Interactive Islands:** React + Motion (`LazyMotion`, hydrated strictly via `client:visible`)
- **Content & Validation:** MDX + Zod Content Collections + Shiki (`css-variables`, 0 KB client JS)
- **ATS PDF Pipeline:** Playwright headless Chromium rendering `/resume-print/` from `src/data/resume.json` -> `dist/Claudiu-Span-CV.pdf` (CI-verified `1–2` pages, `<= 300 KB`, text-layer parsed)
- **Syndication:** Build-time `/rss.xml` + static Buttondown `SubscribeAdapter` (zero secrets, GDPR double opt-in)

## Local Development (Windows / Linux)
Clone outside OneDrive (e.g. `C:\Dev\personal-website`) to avoid file-locking on `node_modules/`. Requires **Node.js 22 LTS** and **`pnpm`**.

```bash
pnpm install --frozen-lockfile
pnpm dev                 # Local dev server
pnpm check               # Astro + TypeScript strict check
pnpm test:unit           # Vitest unit tests (layout compiler, Zod schemas, subscribe adapter)
pnpm build               # Static build to dist/
pnpm pdf:build           # Generate dist/Claudiu-Span-CV.pdf and strip internal /resume-print/
pnpm pdf:verify          # Verify 1-2 pages, <= 300 KB, ATS text extraction
pnpm verify:content      # Verify zero local paths, NDA denylist, private repo invariants
pnpm verify:budgets      # Verify .nojekyll, dist/ <= 30 MB, media & JS size caps
pnpm test:e2e            # Playwright E2E + axe-core WCAG AA (1440px & 375px, Dark & Light)
pnpm verify:all          # Run full verification gate locally
```

## Deployment & Two-Stage Custom Domain Cutover
Controlled via environment variables in `.github/workflows/deploy.yml`:
- **Stage A (GitHub Pages subpath):** `SITE_URL=https://mr-span.github.io`, `BASE_PATH=/personal-website`
- **Stage B (Custom domain root):** Attach custom domain strictly on `Mr-Span/personal-website` (leaving `Mr-Span.github.io` and `Mr-Span/claux-cv` untouched), enable *Enforce HTTPS*, then rebuild with `SITE_URL=https://<custom-domain>` and `BASE_PATH=""`.

## Rollback to v1.0
```bash
git checkout v1.0-static-backup
```
Or revert the v2.0 merge commit on `main` to republish `v1.0` via GitHub Actions in under 2 minutes.

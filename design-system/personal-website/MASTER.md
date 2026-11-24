# Design System Master File (v2.0)

**Project:** Personal Website (`Mr-Span/personal-website` v2.0)
**Updated:** 2026-11-24
**Polarity:** Techy Dark Mode (default) + Light Mode (toggle, zero flash via `claudiu-span-theme-v2`)
**Token Sources:** `design-system/personal-website/tokens.css`, `design-system/personal-website/tokens.json`, `src/styles/tokens.css`

---

## Visual Rules
- **Theme Rule (Glow vs. Borders):** Dark Mode uses subtle Baby Blue accents and restrained ambient focus glow. Light Mode disables all glow completely and relies on `1px` crisp borders and subtle Bento shadows.
- **Zero Clutter:** No fake telemetry HUDs, no decorative micro-badges, no status pings, no hover-triggered page overlays, no circular carousels obscuring credentials.
- **Typography:**
  - Headings / Display: `Space Grotesk`
  - Body / Long-form MDX: `Inter`
  - Code / Metrics / Technical Tags: `JetBrains Mono` (not preloaded on `/`)

---

## WCAG 2.1 AA Verified Color Tokens (`>= 4.5:1` Normal Text)

| Semantic Token | Dark Mode (Default) | Light Mode (Toggle) | Verified Contrast (Normal Text) |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#070B12` | `#F8FAFC` | Main canvas |
| `--bg-surface` | `#0D1422` | `#FFFFFF` | Bento cards / containers |
| `--bg-elevated` | `#131E33` | `#F1F5F9` | Inspector Drawer / secondary panels |
| `--border-subtle` | `#1E3250` | `#E2E8F0` | 1px dividers & borders |
| `--text-primary` | `#F1F5F9` | `#0F172A` | `> 14:1` in both themes |
| `--text-muted` | `#94A3B8` | `#475569` | `> 6.5:1` in both themes |
| `--accent-primary` (Baby Blue) | `#38BDF8` / `#7DD3FC` | `#0369A1` | Dark `> 9.5:1`; Light `5.93:1` on `#FFF` / `5.67:1` on `#F8FAFC` |
| `--accent-contrast` (Signal Coral) | `#FB7185` (on-fill text `#070B12`) | `#BE123C` (on-fill text `#FFFFFF`) | Dark `> 7.5:1`; Light `6.58:1` on `#FFF` / `6.29:1` on `#F8FAFC` |
| `--accent-signal` (Verified / Active Trace) | `#34D399` | `#047857` | Dark `> 10:1`; Light `5.48:1` on `#FFF` |

---

## Motion, Accessibility & Media Budgets
- **Unified Motion Gate:** All motion respects `prefers-reduced-motion: reduce`, `IntersectionObserver`, `document.visibilitychange`, and `navigator.connection?.saveData`.
- **Single Visual Signature in Hero:** Photographic-faithful realist-Ghibli portrait (`<= 80 KB` AVIF/WebP) + poster-first ambient loop (`<= 400 KB`, loaded post-LCP). No Canvas 2D Vector Field.
- **Responsive Targets:** `375px`, `768px`, `1024px`, `1440px` with `0` horizontal overflow and `>= 44px` interactive tap targets.
- **Global Z-Index Scale:** `--z-base: 0`, `--z-sticky: 20`, `--z-side-cta: 30`, `--z-drawer: 40`, `--z-modal: 50`.

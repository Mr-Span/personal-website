# Claudiu Șpan — Personal Website (CV & Portfolio)

Live site: **https://mr-span.github.io/personal-website/**

Personal CV and engineering portfolio showcasing production work in **Applied AI**, **Enterprise Automation & RPA**, and **Autonomous Robotics**.

## Architecture & Highlights

- **Zero-build static site** (semantic HTML5, modular CSS with design tokens, vanilla JS) — fast loading, easy to maintain, zero runtime dependencies.
- **Design System**: Minimalism & Swiss Style tokens persisted in `design-system/personal-website/MASTER.md` and `tokens.css`.
- **Light & Dark Mode**: Respects system preference (`prefers-color-scheme`) with persistent manual toggle and zero theme flash.
- **Print-ready CV**: Dedicated `@media print` stylesheet for saving a clean CV directly as PDF.
- **URL-synced project filtering**: Filter projects by domain (`?category=ai|automation|robotics`) with deep-linkable URLs.
- **Accessibility**: Skip link, semantic landmarks, visible `:focus-visible` states, `aria-live` status updates, and `prefers-reduced-motion` support.
- **Automated Deployment**: GitHub Actions deploys every push to `main` directly to GitHub Pages via `.github/workflows/deploy.yml`.

## Local Preview

Any static HTTP server works (for example Python's built-in server):

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Project Structure

```text
.
├── index.html                           # Main CV & Portfolio page
├── 404.html                             # Custom GitHub Pages 404 fallback
├── robots.txt                           # Search crawler rules
├── sitemap.xml                          # XML sitemap for GitHub Pages
├── assets/
│   ├── favicon.svg                      # Monogram favicon
│   ├── css/styles.css                   # Responsive, themeable & print CSS
│   └── js/main.js                       # Theme toggle, filters, copy-email, reveal
├── design-system/
│   └── personal-website/
│       ├── MASTER.md                    # Design system source of truth
│       ├── tokens.css                   # Generated CSS custom properties
│       └── tokens.json                  # W3C DTCG design tokens
├── .github/
│   └── workflows/deploy.yml             # GitHub Pages CI/CD pipeline
├── AGENTS.md                            # Local agent conventions & hybrid Obsidian pointers
└── README.md
```

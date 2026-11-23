# AGENTS.md — Personal Website (`Mr-Span/personal-website`)

Working guide for AI agents contributing to this repository.

## Project & Deployment
- **Public Repository:** `https://github.com/Mr-Span/personal-website`
- **Live URL (GitHub Pages):** `https://mr-span.github.io/personal-website/`
- **Deploy Pipeline:** Automatic on every push to `main` via `.github/workflows/deploy.yml`.
- **Stack:** Semantic HTML5, CSS3 design tokens, Vanilla JS (zero-build static architecture).

## Design System & UI Quality
- Visual source of truth: `design-system/personal-website/MASTER.md` and `tokens.css`.
- Maintain WCAG AA contrast (≥ 4.5:1) in both Light and Dark themes, visible `:focus-visible` states, `prefers-reduced-motion` support, and a clean `@media print` CV stylesheet.
- Keep all biographical, project, and metric claims strictly factual and verifiable.

## Hybrid Documentation Workflow
- Product specs, research briefs, and handoffs live in the shared `Obsidian-Shared` (`Antigravity-Hub`) workspace and `Project-Tracker`.
- Local engineering ADRs, task boards, and debug logs live in the offline `Obsidian-Dev-Local` vault.
- Long-term project history and decisions live in the primary `Obsidian Vault`.
- **Security:** Never commit secrets, tokens, or private notes into this public repository.

# Upgrade Site Personal — Portofoliu Applied AI, CV & Blog Tehnic (`Mr-Span/personal-website` v2.0)

* **Author:** Claudiu Șpan (`Mr-Span`)
* **Status:** Proposed
* **Date:** 2026-11-24

--------------------------------------------------------------------------------

## Overview

Acest document definește designul tehnic pentru versiunea `v2.0` a site-ului personal `Mr-Span/personal-website`, care înlocuiește versiunea statică `v1.0` (`HTML/CSS/JS` mono-pagină) păstrând separate și neatinse repository-urile `Mr-Span/claux-cv` și `Mr-Span.github.io`.

Site-ul funcționează ca instrument principal pentru **căutarea activă de job și vizibilitate inginerească**, cu URL-ul publicat pe LinkedIn și în CV-urile trimise la aplicări. Conținutul este exclusiv în engleză și servește două audiențe cu nevoi distincte:

* **Recruiteri și Hiring Managers:** au nevoie să verifice în 15–20 de secunde poziționarea principală (**Applied AI & Automation / RPA**), impactul în producție (Betfair Romania Development: 40+ fluxuri livrate end-to-end, sistem Agentic AI + human-in-the-loop cu reducere ~70% a timpului de verificare și izolare PII), cele 6 certificări verificate și educația UTCN (MSc Cyber-Physical Systems + BSc Robotics), și să descarce imediat un CV PDF compatibil ATS de 1–2 pagini.
* **Tech Leads și ingineri:** au nevoie de dovezi verificabile de gândire de sistem — studii de caz cu diagrame de arhitectură interactive (`Nominal` vs. `Guardrail / Failure Mode` și trade-off-uri documentate), cod public, proiecte web reale pentru clienți și o arhitectură pregătită pentru note tehnice (`/blog`), cu **QUADYX** (robotică autonomă / computer vision) poziționat clar ca proiect secundar de explorare tehnică.

Sistemul rulează **100% static pe GitHub Pages** cu **domeniu custom**, construit cu **Astro + React/Motion Islands + Tailwind CSS + MDX**, dintr-o clonă locală mutată în afara OneDrive (`C:\Dev\personal-website`).

## The Problem

Versiunea curentă `v1.0` și varianta inițială de PRD lasă nerezolvate patru probleme concrete care afectează direct rezultatele în campania de angajare:

1. **CV PDF neutilizabil pentru aplicări și sisteme ATS:** Exportul prin `@media print` din `v1.0` a produs un fișier de **6 pagini** (`dasd.pdf`) cu spații goale mari și secțiuni rupte (cauzat de `break-inside: avoid-page` pe `.section`, colapsarea grid-urilor pe o coloană și afișarea cardurilor ascunse la print). În plus, comportamentul `window.print()` diferă între Chrome, Safari și WebView-ul mobil din LinkedIn.
2. **Dovezi incomplete și lipsă de demonstrație inginerească:** Versiunea `v1.0` listează doar 3 certificări fără linkuri de verificare (lipsesc `AWS Certified AI Practitioner AIF-C01`, `Simplilearn AI` și cele 2 certificări de la `Școala Informala de IT`), nu expune structurat proiectele/cursurile/lucrările din MSc și BSc UTCN, nu include website-urile realizate pentru clienți, iar cazul Betfair este redus la un singur card care trimite în afara site-ului fără explorare de arhitectură.
3. **Limitele HTML-ului manual pe un site multi-rută cu date partajate:** Menținerea manuală a 4 rute (`/`, `/projects/[slug]`, `/resume`, `/blog/[slug]`), a diagramelor de arhitectură tipate, a unui PDF sincronizat cu pagina `/resume` și a proiectelor cu repo-uri publice/private duce la duplicare, metrici desincronizate și risc de linkuri `404` către repo-uri private sau scurgeri de metadate personale în repo public.
4. **Nealinieri între PRD-ul inițial și constrângerea de hosting static:** PRD-ul inițial presupunea `Next.js App Router + Vercel`, o suprapunere vizuală în Hero (Canvas 2D + loop media), un carusel circular de certificări, deschiderea `/resume` pe hover și un blog lansat gol — combinație care introduce costuri de bundle incompatibile cu Lighthouse mobil `>= 95`, erori de contrast WCAG AA pe Light Mode (`#0284C7` = ~4.09:1, `#D97706` = ~3.19:1) și blocaje de fișiere dacă `node_modules/` este instalat în OneDrive.

## Goals

* **G1 — Acces rapid și CV ATS verificat în CI:** De pe orice pagină, vizitatorul ajunge printr-un buton persistent etichetat `Resume` (strict click/tap) la un `/resume` liniar, scanabil în 20 de secunde, care afișează vizibil toate cele **6 certificări reale** într-un grid 2×3 cu linkuri verificate, date academice UTCN extensibile și buton 1-click pentru un PDF static ATS de **1–2 pagini** cu text selectabil, generat la build din același `src/data/resume.json`.
* **G2 — Portofoliu diferențiat pe 2 niveluri cu dovezi de sistem:** Rutele `/projects` și `/projects/[slug]` separă proiectele *Tier 1* (`case-study`: Betfair anonimizat, ElectrocasNicu RAG, QUADYX ca proiect secundar — fiecare cu Architecture Visualizer SVG interactiv `Nominal` vs. `Guardrail / Failure Mode`, Inspector Drawer accesibil prin tastatură/touch și pipeline vertical la `375px`) de proiectele *Tier 2* (`showcase-card`: proiecte personale adiționale + website-uri de clienți, cu validare la build care interzice linkuri GitHub pentru repo-uri private).
* **G3 — Performanță statică și accesibilitate verificabile automat:** Build-ul CI verifică Lighthouse `>= 95` pe Performance, Accessibility, Best Practices și SEO atât la `1440px` cât și la `375px`, contrast WCAG AA (`>= 4.5:1` text normal) în **Dark Mode implicit** (Baby Blue `#38BDF8` + Signal Coral `#FB7185`) și **Light Mode** (`#0369A1` + `#BE123C`), `0` erori de consolă, `0` overflow orizontal și suport complet `prefers-reduced-motion: reduce`.
* **G4 — Identitate vizuală unitară cu media iterată Google AI Pro sub buget strict:** Hero-ul folosește o singură semnătură vizuală — portret derivat din poza reală de pe GitHub cu finisare subtilă realist-Ghibli pe fundal neutru (`<= 80 KB` AVIF/WebP) + loop vizual ambiental poster-first (`<= 400 KB`, încărcat post-LCP și pauzat offscreen) — completat de 3–4 coperți unitare de proiect (`<= 120 KB`) și carduri OG statice (`1200×630`), menținând transferul inițial al paginii `/` sub `500 KB`.
* **G5 — Arhitectură `/blog` pregătită fără efect de „site gol":** Pipeline-ul `/blog` + `/blog/[slug]` (MDX, syntax highlighting la build cu 0 KB JS client, Copy, ToC, embed diagramă), `/rss.xml` static și `SubscribeAdapter` fără secrete sunt construite și testate în CI din ziua 1, iar poarta automată `publishedPosts.length === 0` suprimă cardul „Latest Blog Post" de pe `/` până la publicarea primului articol.
* **G6 — Migrare fără întrerupere și igienă de repo public:** Etichetare `v1.0-static-backup`, relocare clonă locală în `C:\Dev\personal-website`, punte de compatibilitate pentru linkurile v1.0 (`/#projects`, `/#experience`, `/?category=...`), `404.html` dedicat, audit PII pe certificări și cutover în 2 etape pe domeniul custom exclusiv pe `Mr-Span/personal-website`.

## Non-Goals

* Nu folosim Next.js App Router, Vercel hosting, SSR, Server Actions, API routes, baze de date, autentificare sau CMS extern în v2.0.
* Nu implementăm Canvas 2D Vector Field & Telemetry Grid în Hero și nu adăugăm elemente decorative de tip HUD sau micro-badge-uri de status.
* Nu deschidem `/resume` (sau vreun overlay de CV) la hover pe butonul lateral și nu folosim carusel circular pentru cele 6 certificări.
* Nu construim în MVP v2.0 Knowledge & Skill Graph-ul pe 3 straturi cu fizică micro-spring și nici Command Palette (`Cmd+K`) — ambele rămân candidate opționale pentru Faza 2 după lansarea MVP-ului de job search.
* Nu construim un backend propriu de newsletter, nu integrăm un chatbot AI/RAG live cu costuri pe tokeni și nu includem modele 3D WebGL (`Three.js` / `.glb`).
* Nu adăugăm suport bilingv RO + EN.
* Nu modificăm repository-urile `Mr-Span/claux-cv` și `Mr-Span.github.io`.
* Nu comitem în repository-ul public exporturi brute Google AI Pro, fișiere cu date personale neauditabile (CNP, adrese, EXIF) sau detalii confidențiale neanonimizate din sistemele interne Betfair.

## Open Questions

* **Question 1 — Domeniul custom și furnizorul DNS:** Ce domeniu custom exact va fi conectat pe GitHub Pages (`SITE_URL`) și dacă zona DNS va fi gestionată prin Cloudflare (activând automat Cloudflare Web Analytics fără cookie-uri) sau direct la registrar? *(Nu blochează dezvoltarea — `SITE_URL`, `BASE_PATH` și beacon-ul analytics sunt complet parametrizate prin variabile de mediu.)*

## Critical User Journeys (CUJs)

### CUJ 1: Recruiter pe mobil din LinkedIn — Scanare CV și Descărcare PDF ATS

* **Given:** Un recruiter deschide URL-ul custom al site-ului din aplicația mobilă LinkedIn (`375px`, WebView iOS/Android, eventual cu `localStorage` restricționat sau conexiune mobilă limitată).
* **When:** Pagina `/` se încarcă, recruiterul scanează Hero-ul (titlu, rol Applied AI & Automation, portret real-fidel, impact Betfair `40+` / `~70%`), apasă butonul etichetat `Resume` din bara de navigare, inspectează certificările (inclusiv `AWS AIF-C01`) și apasă `Download ATS PDF`.
* **Then:** Pagina `/` pictează conținutul principal sub `2.0s` cu transfer inițial `<= 500 KB`, zero erori de consolă și zero scroll orizontal; `/resume` afișează direct CV-ul liniar cu toate cele 6 certificări vizibile și linkuri funcționale; fișierul `/Claudiu-Span-CV.pdf` se descarcă/deschide imediat, are `1–2` pagini și text 100% selectabil și parsabil de ATS.

### CUJ 2: Tech Lead pe desktop — Explorare Architecture Visualizer și Moduri de Eșec

* **Given:** Un Tech Lead vizitează `/projects` la `1440px` în Dark Mode (sau după comutarea în Light Mode) pentru a evalua profunzimea inginerească dincolo de descrieri generale.
* **When:** Filtrează proiectele pe `Applied AI`, deschide studiul de caz anonimizat Betfair (`/projects/enterprise-agentic-review`), navighează nodurile diagramei SVG cu mouse-ul sau tastatura (`Tab`/`Enter`), apasă `Trace Flow`, comută vizualizarea din `Nominal` în `Guardrail / Failure Mode` (ex. detecție PII / escaladare human-in-the-loop) și inspectează detaliile unui nod în Inspector Drawer, apoi închide cu `Esc`.
* **Then:** Contrastul respectă WCAG AA (`>= 4.5:1`) în ambele teme; selecția unui nod evidențiază traseul upstream/downstream și deschide Inspector Drawer cu rolul, granița de date și trade-off-ul tehnic real (returnând focus-ul pe nod la `Esc`); pe `prefers-reduced-motion: reduce`, `Trace Flow` rulează prin evidențiere discretă pas-cu-pas fără animații continue.

### CUJ 3: Verificare portofoliu de proiecte reale și site-uri de clienți

* **Given:** Un Hiring Manager sau potențial client deschide `/projects` pentru a verifica lucrări livrate în producție.
* **When:** Navighează între proiectele Tier 1 (`case-study`) și Tier 2 (`showcase-card` — website-uri pentru clienți cu repo public sau privat).
* **Then:** Fiecare card indică explicit statutul (`Anonymized Enterprise Case Study`, `Public Repo + Live`, `Client Work · Private Repo`), proiectele publice oferă linkuri valide spre GitHub + live URL, iar proiectele cu repo privat afișează exclusiv linkul live și/sau screenshot-uri curățate, fără niciun link mort `404` către GitHub.

### CUJ 4: Continuitate linkuri v1.0, polaritate temă și accesibilitate

* **Given:** Un vizitator deschide un link distribuit anterior într-un CV vechi (ex. `https://<domain>/#projects`, `https://<domain>/?category=ai` sau o rută inexistentă) ori are activată preferința `prefers-reduced-motion: reduce` și o cheie veche `claudiu-span-theme` în `localStorage`.
* **When:** Accesează URL-ul și comută tema Dark/Light, apoi reîncarcă pagina.
* **Then:** Puntea client redirecționează curat `/#projects` -> `/projects`, `/?category=ai` -> `/projects?category=ai` și `/#experience` -> `/resume`; rutele inexistente afișează pagina `404.html` cu întoarcere în 1 click; tema persistă fără flash vizual înainte de first paint (`claudiu-span-theme-v2` cu `try/catch`); loop-ul vizual din Hero se oprește pe `prefers-reduced-motion: reduce` afișând posterul static.

### CUJ 5: Publicare atomică de conținut de către autor (Resume & Blog)

* **Given:** Autorul modifică o certificare/experiență în `src/data/resume.json` sau adaugă primul articol tehnic MDX cu `published: true` în `src/content/blog/` și face push pe `main`.
* **When:** Rulează workflow-ul `.github/workflows/deploy.yml` în GitHub Actions.
* **Then:** CI validează schemele Zod (inclusiv referințele de noduri/muchii și regula `visibility !== 'public'` fără `repoUrl`), recompilează `/Claudiu-Span-CV.pdf` și verifică `<= 2` pagini + text extractibil, regenerează `/rss.xml`, promovează automat cardul „Latest Post" pe `/` când `publishedPosts.length > 0`, verifică Lighthouse `>= 95` și `0` erori consolă, apoi publică static pe GitHub Pages.

## Technical Plan (Architecture)

### 1. Arhitectura de ansamblu (Static-First Islands pe GitHub Pages)

Sistemul folosește **Astro (output static)** ca generator principal de pagini, combinat cu **insule React + Motion (`LazyMotion`)** hidratate strict pe componentele interactive (`client:visible` / `client:idle`). Conținutul textual, structura Bento, pagina `/resume`, articolele MDX și blocurile de cod (evidențiate la build cu **Shiki** pe tema CSS variables) se livrează ca HTML/CSS pur cu `0 KB` JavaScript de hidratare.

```text
+-----------------------------------------------------------------------------+
|                        GIT REPOSITORY (C:\Dev\personal-website)             |
|                                                                             |
|  src/data/site.ts          src/data/resume.json       src/content/          |
|  (SITE_URL, BASE_PATH,     (Experienta, UTCN,         ├── projects/*.mdx    |
|   Buttondown endpoint)      6 Certificari, PDF flags) ├── projects/*.json   |
|                                                       └── blog/*.mdx        |
+--------------------------------------+--------------------------------------+
                                       | Zod Schema + NDA/PII + Stage/Lane
                                       v Validation at Build Time
+-----------------------------------------------------------------------------+
|                         ASTRO STATIC BUILD + CI PIPELINE                    |
|                                                                             |
|  1. astro:assets (Sharp)   -> Responsive AVIF/WebP + static OG (1200x630)  |
|  2. Layout Compiler        -> Pre-computed SVG coords (stage/lane Bezier)  |
|  3. Astro SSG              -> dist/ (/, /projects/[slug], /resume, /blog,  |
|                               /resume-print, /404.html, /rss.xml, .nojekyll)|
|  4. Playwright PDF Step    -> dist/Claudiu-Span-CV.pdf (<=2p + pdf-parse)  |
|  5. QA & Budget Gates      -> Asset caps + Playwright E2E + axe + LH >= 95 |
+--------------------------------------+--------------------------------------+
                                       | actions/deploy-pages (SHA-pinned)
                                       v
+-----------------------------------------------------------------------------+
|                 GITHUB PAGES (100% STATIC + CUSTOM DOMAIN)                  |
|                                                                             |
|  Static HTML/CSS/AVIF  |  React Islands (lazy):      |  External Pull:      |
|  - Zero server runtime |  - ArchitectureVisualizer   |  - Buttondown polls  |
|  - Zero secrets        |  - ProjectFilter / Gallery  |    /rss.xml -> Email |
|  - /build-info.json    |  - SubscribeForm (Adapter)  |  - Cloudflare RUM    |
+-----------------------------------------------------------------------------+
```

### 2. Rute, componente și frontiere de hidratare

| Rută | Tip randare | Insule client (JS) | Rol și contract principal |
| :--- | :--- | :--- | :--- |
| `/` | HTML/CSS static | `HeroMediaIsland` (script ușor post-LCP, 0 React) | Hero cu portret fidel realist-Ghibli (`fetchpriority="high"`) + loop Google AI Pro poster-first (`<= 400 KB`), poziționare Applied AI & Automation + QUADYX side project, Bento Grid cu poartă automată pe `publishedPosts.length > 0`, punte client pentru ancorele v1.0 (`/#projects`, `/?category=...`). |
| `/projects` | HTML/CSS static | `ProjectFilter` (vanilla JS ~1 KB cu sync URL `?category=...`) | Grid Bento filtrabil cu cele 2 niveluri (`case-study` și `showcase-card`), etichete explicite de vizibilitate (`Anonymized Enterprise Case Study`, `Public Repo + Live`, `Client Work · Private Repo`). Fără duplicarea visualizer-ului mare deasupra pliului. |
| `/projects/[slug]` | HTML/CSS static (MDX) | `ArchitectureVisualizer` (React + `LazyMotion`, `client:visible`, în ErrorBoundary) | Generat strict pentru intrările `tier: 'case-study'`. Problemă -> Arhitectură interactivă (`Nominal` vs. `Guardrail / Failure Mode`, `Trace Flow`, Inspector Drawer cu focus trap & `Esc`) -> Decizii/Trade-offs -> Impact. |
| `/resume` | HTML/CSS static | Fără insule React (`<details>` nativ HTML pentru cursuri/teze UTCN) | CV liniar scanabil sus, buton 1-click `Download ATS PDF` (`/Claudiu-Span-CV.pdf`), grid vizibil 2×3 cu toate cele **6 certificări reale** și linkuri verificate, secțiune extensibilă UTCN MSc/BSc. |
| `/resume-print` | HTML/CSS static intern | `0 KB` JS (`noindex`, exclus din `sitemap.xml`) | Layout dedicat pe o singură coloană, alb-negru tipografic, alimentat din `src/data/resume.json` (`includeInPdf: true`), randat exclusiv de Playwright în CI pentru a produce `dist/Claudiu-Span-CV.pdf`. |
| `/blog` | HTML/CSS static | `BlogTagFilter` (vanilla JS) + `SubscribeForm` (vanilla JS, `SubscribeAdapter`) | Listă filtrabilă pe tag-uri (`?tag=...`), link `/rss.xml` și formular static Buttondown. La `0` articole publicate, afișează o stare curată „Engineering Notes — Notify via Email / RSS" fără carduri placeholder rupte. |
| `/blog/[slug]` | HTML/CSS static (MDX) | `CopyCodeButton` (vanilla JS) + opțional `ArchitectureVisualizer` (`client:visible`) | Generat automat pentru toate fișierele MDX cu `published: true` (și verificat în CI printr-un fixture de test chiar când `publishedPosts.length === 0`). Syntax highlighting la build prin Shiki (`css-variables`), cuprins sticky (IntersectionObserver). |
| `/404.html` | HTML/CSS static | `0 KB` JS | Rute root-relative (parametrizează `BASE_PATH`), acțiuni 1-click spre `/`, `/projects` și `/resume`. |

### 3. Contracte de date canonice (Scheme TypeScript / Zod — Single Source of Truth)

Toate datele sunt validate la build. Orice încălcare de schemă, referință inexistentă sau risc de confidențialitate oprește compilarea înainte de deploy.

#### 3.1 `src/data/resume.json` (CV Web + PDF ATS)

```typescript
interface ResumeData {
  profile: {
    name: string;               // "Claudiu Șpan"
    headline: string;           // "Applied AI & Automation Engineer"
    location: string;
    email: string;
    links: { github: string; linkedin: string; website: string };
    summary: string;
    metrics: Array<{ value: string; label: string; includeInPdf: boolean }>;
  };
  experience: Array<{
    id: string;
    company: string;
    role: string;
    period: string;
    location: string;
    isSideVenture?: boolean;    // true pentru QUADYX
    url?: string;
    highlights: Array<{ text: string; includeInPdf: boolean }>;
    stack: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;             // MSc Cyber-Physical Systems / BSc Robotics
    institution: string;        // Technical University of Cluj-Napoca
    period: string;
    thesis?: { title: string; summary: string; includeInPdf: boolean };
    courses: Array<{ name: string; focus: string; projectSummary?: string }>;
  }>;
  certifications: Array<{
    id: string;
    name: string;               // AWS AIF-C01, Simplilearn AI, Scoala Informala x2, UiPath, NVIDIA
    issuer: string;
    issuedDate: string;         // YYYY-MM
    verifyUrl?: string;         // Prioritar URL public oficial (Credly/AWS/etc.)
    auditedAssetPath?: string;  // Doar fișier redactat/fără PII dacă lipsește URL extern
    domain: 'ai' | 'automation' | 'software' | 'robotics';
    includeInPdf: boolean;
  }>;
  skillGroups: Array<{ title: string; items: string[] }>;
}
```

#### 3.2 `src/content/projects/*` (Discriminated Union + Guard confidențialitate)

```typescript
type ProjectTier = 'case-study' | 'showcase-card';
type RepoVisibility = 'public' | 'private' | 'anonymized';

interface ProjectFrontmatter {
  slug: string;
  title: string;
  tier: ProjectTier;
  visibility: RepoVisibility;
  category: Array<'ai' | 'automation' | 'robotics' | 'client-web'>;
  featured: boolean;
  order: number;
  outcomeBadge: string;         // ex. "~70% Less Review Time"
  summary: string;
  stack: string[];
  coverAsset?: string;          // Google AI Pro cover; fallback SVG dacă lipsește
  repoUrl?: string;             // ZOD INVARIANT: INTERZIS dacă visibility !== 'public'
  liveUrl?: string;             // Necesar (sau screenshots.length > 0) dacă visibility === 'private'
  screenshots?: Array<{ src: string; alt: string; caption?: string }>;
  anonymizationNote?: string;   // Obligatoriu când visibility === 'anonymized' (Betfair)
  architectureFile?: string;    // Obligatoriu pentru Tier 1 cu visualizer
}
```

#### 3.3 `src/content/projects/*.architecture.json` (Grid determinist `stage` + `lane`)

```typescript
interface ArchitectureGraph {
  projectSlug: string;
  stages: string[];             // Etichete coloane ex. ["Ingest", "Orchestrate", "Agent", "Review"]
  nodes: Array<{
    id: string;
    label: string;
    stage: number;              // Coloană 0..N
    lane: number;               // Bandă verticală 0..M (perechea (stage, lane) unică!)
    kind: 'source' | 'process' | 'agent' | 'guardrail' | 'human' | 'storage';
    stackTag: string;
    metricTag?: string;
    inspector: {
      role: string;
      dataBoundary: string;     // ex. "Enterprise PII boundary — zero external egress"
      tradeoff: string;
      failureBehavior: string;
    };
  }>;
  edges: Array<{
    id: string;
    from: string;               // Validat Zod: există în nodes[]
    to: string;                 // Validat Zod: există în nodes[]
    label?: string;
    mode: 'both' | 'nominal' | 'guardrail';
  }>;
  scenarios: {
    nominal: { label: string; steps: string[] };    // Secvență ordonată de node IDs pentru Trace Flow
    guardrail: { label: string; steps: string[] };  // Secvență de eșec / PII / fallback GSM->IP
  };
}
```

* **Compilarea layout-ului la build (`src/lib/diagram-layout.ts`):** Primește `ArchitectureGraph` validat Zod, verifică unicitatea `(stage, lane)` și validitatea tuturor muchiilor/pașilor, apoi calculează determinist `viewBox`, coordonatele `(x, y)` ale fiecărui nod (cu dimensiuni fixe de card SVG + spațiere constantă) și căile SVG cubic Bezier. Pe desktop (`>= 768px`) randăm `<svg>` interactiv cu ordine DOM de tabbing derivată din `(stage, lane)`; sub `768px` (`375px`) aceeași insulă randează un pipeline vertical semantic pe carduri ordonate după `stage`, eliminând orice risc de overflow orizontal.

### 4. Global Chrome, Sistem de Teme, Mișcare și `SubscribeAdapter`

* **Navigație globală și buton `Resume`:** Header sticky curat (`/`, `/projects`, `/resume`, `/blog`), comutator Dark/Light și pe desktop un buton lateral ancorat clar cu etichetă vizibilă **`Resume`** (strict **click/tap**, zero acțiuni pe hover) care navighează direct la `/resume`; sub `768px` butonul se integrează direct în bara de navigare, fără elemente flotante care să acopere conținutul la `375px`.
* **Polaritate Dark/Light fără flash și fără erori de hidratare:**
  * Script inline sincron în `<head>` (executat înainte de first paint) care citește `localStorage.getItem('claudiu-span-theme-v2')` în `try/catch` (protejat în WebView-ul mobil LinkedIn), aplică implicit `dark` când lipsește, setează `document.documentElement.dataset.theme` și actualizează `<meta name="theme-color">` (`#070B12` vs. `#F8FAFC`).
  * Toate suprafețele DOM, stroke-urile/fill-urile SVG din `ArchitectureVisualizer` și evidențierea de cod Shiki citesc **exclusiv CSS Custom Properties** (`src/styles/tokens.css` mapat în Tailwind `@theme`), eliminând orice ramificare JS de temă la montare.
  * Tokeni WCAG AA blocați: Dark (`--bg-canvas: #070B12`, `--bg-surface: #0D1422`, `--bg-elevated: #131E33`, `--border-subtle: #1E3250`, `--accent-primary: #38BDF8` / `#7DD3FC`, `--accent-contrast: #FB7185`, `--accent-signal: #34D399`) și Light (`--bg-canvas: #F8FAFC`, `--bg-surface: #FFFFFF`, `--bg-elevated: #F1F5F9`, `--border-subtle: #E2E8F0`, `--accent-primary: #0369A1` [5.93:1], `--accent-contrast: #BE123C` [6.58:1], `--accent-signal: #047857` [5.48:1]).
* **Contract unificat de mișcare (`src/lib/motion.ts`):** Hook/helper comun `useMotionActive(ref)` care combină `IntersectionObserver` + `document.visibilitychange` + `matchMedia('(prefers-reduced-motion: reduce)')` + `navigator.connection?.saveData`. Oprește loop-ul video Hero imediat ce iese din viewport sau tab-ul este inactiv și trece `Trace Flow` pe evidențiere discretă pas-cu-pas fără animații continue sub `prefers-reduced-motion: reduce`.
* **`SubscribeAdapter` pentru Buttondown (`src/lib/subscribe.ts`):**
  * Interfață stabilă `submitSubscription(email: string): Promise<SubscribeResult>` cu mașină de stări explicită (`idle | submitting | success | rate_limited | blocked_or_error`), câmp honeypot ascuns, `AbortController` cu timeout `8s`, mesaje de stare în `aria-live="polite"` și informare explicită de confidențialitate/double opt-in GDPR.
  * Dacă cererea `fetch` este blocată de ad-blocker/CORS sau expiră, interfața afișează automat un link direct către pagina de abonare găzduită Buttondown + linkul `/rss.xml`, astfel încât nicio intenție de abonare să nu eșueze tăcut.

### 5. Pipeline-ul de generare PDF ATS (`/resume-print` -> Playwright)

1. `astro build` emite pagina internă `dist/resume-print/index.html` (`<meta name="robots" content="noindex, nofollow">`) construită din `src/data/resume.json` folosind strict intrările marcate `includeInPdf: true`, pe un flux HTML liniar pe o singură coloană, cu fonturi standard embedded și marje A4 (`14mm`).
2. Scriptul post-build `scripts/build-resume-pdf.mjs` pornește un mini-server static local pe `dist/`, deschide `/resume-print/` cu Playwright Chromium (versiune fixată în `package.json`), generează `dist/Claudiu-Span-CV.pdf` (`format: 'A4'`, `printBackground: true`, `preferCSSPageSize: true`) și șterge `dist/resume-print/` înainte de upload-ul artefactului GitHub Pages (astfel încât ruta internă nu este publicată live).
3. Scriptul de verificare `scripts/verify-pdf.mjs` citește PDF-ul generat prin `pdf-parse` și verifică automat: existența fișierului, dimensiunea `<= 300 KB`, numărul de pagini `>= 1 && <= 2` și prezența în stratul de text extras a cuvintelor-cheie critice (`Claudiu`, `Betfair`, `40+`, `70%`, `QUADYX`, `AWS`, `Technical University of Cluj-Napoca`, email-ul de contact). Dacă o editare viitoare în `resume.json` împinge CV-ul pe pagina 3, CI eșuează imediat cu mesaj clar.

### 6. Art Direction & Pipeline Media Google AI Pro

* **Exporturi brute în afara Git:** Fișierele sursă necomprimate generate în Google AI Pro (Gemini / Imagen / Whisk / Veo) se salvează exclusiv local / în Google Drive, niciodată în istoricul Git.
* **Manifest finit și bugete verificate în CI (`scripts/verify-budgets.mjs`):**
  1. `src/assets/media/portrait.png` (sursă curată -> `astro:assets` AVIF/WebP `<= 80 KB`): portret fidel fotografic din poza GitHub, fond neutru uniform, editare subtilă realist-Ghibli fără deformarea trăsăturilor.
  2. `public/media/hero-loop.webm` + `.mp4` (`<= 400 KB`, fără canal audio) + `src/assets/media/hero-poster.png` (`<= 80 KB` AVIF/WebP): poster static randat imediat pentru LCP, loop-ul `<video muted playsinline loop preload="none">` atașat după `load` doar dacă `prefers-reduced-motion: no-preference` și `saveData !== true`.
  3. `src/assets/media/covers/*.png` (3–4 coperți pentru proiectele flagship -> AVIF/WebP `<= 120 KB` fiecare), generate cu Style Lock din imaginea-ancoră și încadrate cu bordură CSS adaptabilă Dark/Light (un singur set de imagini pentru ambele teme), cu fallback SVG determinist pentru proiecte fără copertă raster.
  4. `public/og/default.png` (card Open Graph static `1200×630` pentru preview pe LinkedIn/Slack/GitHub).

--------------------------------------------------------------------------------

## Alternatives Considered

### Alternative A: Next.js App Router (`output: 'export'`) pe GitHub Pages
* **Pros:** Păstrează alinierea cu PRD-ul inițial generat pentru Vercel; permite activarea ulterioară a SSR, Server Actions și Route Handlers cu modificări minime de rutare dacă proiectul migrează pe Vercel.
* **Cons:** În regim `output: 'export'` pe GitHub Pages, `next/image` nu poate optimiza imagini (`images: { unoptimized: true }`), o rută dinamică `/blog/[slug]` cu `generateStaticParams()` gol (0 articole) provoacă eșec de build, `_next/` necesită `.nojekyll` manual, iar baseline-ul JS React + Next Router + Motion (~120–190 KB gzipped pe pagini pur statice) pune presiune directă pe Lighthouse mobil `>= 95`.
* **Reason for Rejection:** Respins de autor — site-ul rulează 100% static pe GitHub Pages fără nevoi de server runtime, iar Astro + React Islands oferă 0 KB JS implicit, `astro:assets` cu Sharp la build, Zod Content Collections și `/rss.xml` fără workaround-uri.

### Alternative B: Extinderea manuală a versiunii statice v1.0 (HTML5/CSS3/Vanilla JS)
* **Pros:** Zero instalare Node.js local, zero dependențe `npm`, deploy în ~30 de secunde.
* **Cons:** Menținerea a 4+ rute, pagini dinamice MDX (`/projects/[slug]`, `/blog/[slug]`), validarea schemelor JSON pentru diagrame de arhitectură și sincronizarea unui CV PDF ATS cu pagina `/resume` în HTML editat manual introduce duplicare masivă și risc ridicat de drift sau linkuri rupte.
* **Reason for Rejection:** Respins de autor — complexitatea conținutului v2.0 (studii de caz structurate, 6 certificări + UTCN, arhitectură blog) necesită un pipeline tipat cu validare automată la build.

### Alternative C: Generare PDF ATS cu Typst CLI sau `@react-pdf/renderer` (vs. Playwright pe `/resume-print`)
* **Pros:** Typst compilează nativ sub 1 secundă fără Chromium headless; `@react-pdf/renderer` rulează pur în Node/TypeScript fără binare externe.
* **Cons:** Typst introduce un limbaj de template separat (`.typ`) și un binar suplimentar de instalat pe Windows și CI; `@react-pdf/renderer` impune un subset Yoga flexbox diferit de CSS standard și nu suportă fonturi `.woff2` (necesită `.ttf`/`.otf`).
* **Reason for Rejection:** Respins de autor — proiectul rulează deja Playwright în CI pentru auditul E2E/vizual, iar randarea unei rute dedicate `/resume-print` pe o singură coloană HTML/CSS elimină un al doilea limbaj de layout și menține un singur toolchain.

### Alternative D: `@media print` în browser ca mecanism unic de export CV PDF
* **Pros:** Zero script post-build; funcționează direct prin `window.print()`.
* **Cons:** Deja demonstrat nesigur în v1.0 (`dasd.pdf` a produs 6 pagini cu spații goale și carduri rupte); rezultatul variază între Chrome, Safari, Firefox și WebView-ul mobil LinkedIn și riscă ordonare incorectă în parserele ATS.
* **Reason for Rejection:** Respins de autor — PDF-ul descărcabil pentru aplicări trebuie să fie determinist (`1–2` pagini verificate în CI); `@media print` rămâne doar fallback secundar curat pe `/resume`.

### Alternative E: Carusel circular pentru cele 6 certificări și trigger lateral pe hover pentru `/resume`
* **Pros:** Economisește spațiu vertical pe desktop pentru lista de certificări și oferă efect vizual imediat la trecerea cursorului.
* **Cons:** Caruselul circular ascunde 3–5 certificări (inclusiv `AWS AIF-C01`) de la scanarea rapidă și din `Ctrl+F`, adaugă fricțiune pe mobil și nu se imprimă curat. Trigger-ul pe hover încalcă WCAG 1.4.13/3.2.1 (declanșări accidentale lângă scrollbar), lipsește pe touch (`375px`) și creează ambiguitate de navigare.
* **Reason for Rejection:** Respins de autor — pe un site folosit activ în aplicări la job, toate cele 6 certificări trebuie vizibile simultan în grid 2×3, iar butonul `Resume` trebuie etichetat clar și acționat exclusiv prin click/tap.

### Alternative F: Suprapunerea Canvas 2D Vector Field + Loop vizual Google AI Pro în Hero
* **Pros:** Permite combinarea unei interacțiuni reactive la cursor pe desktop cu elementele vizuale iterate cu Google AI Pro.
* **Cons:** Încalcă regula Zero Clutter, creează competiție vizuală cu portretul și titlul, dublează sarcina CPU/GPU pe mobil (`375px`) și amenință bugetul Lighthouse `>= 95` și cota GitHub Pages (`100 GB/lună`).
* **Reason for Rejection:** Respins de autor — Hero-ul păstrează o singură semnătură vizuală (portret realist-Ghibli fidel fotografic + loop vizual Google AI Pro poster-first `<= 400 KB`), fără Canvas 2D Vector Field.

### Alternative G: Compilare layout SVG la build cu `ELKjs` / `Dagre` (vs. Grid determinist `stage` + `lane`)
* **Pros:** Rutare automată pentru grafuri complexe cu ramificații dense și minimizare automată a încrucișărilor.
* **Cons:** Introduce dependențe externe de graf la build, iar editarea unui nod poate rearanja imprevizibil raportul de aspect al diagramei desktop, cerând ajustări repetate ale opțiunilor de engine.
* **Reason for Rejection:** Respins de autor — studiile de caz au diagrame inginerești de 4–12 noduri unde un grid determinist `(stage, lane)` validat Zod oferă aliniament previzibil, diff-uri curate și 0 dependențe de graf.

### Alternative H: Kit / ConvertKit sau doar `/rss.xml` fără formular email pe `/blog` (vs. Buttondown)
* **Pros:** Kit oferă plafon gratuit mai mare de abonați (10.000); varianta strict `/rss.xml` elimină orice dependență terță până la articolul #1.
* **Cons:** Kit adaugă amprentă de newsletter comercial și restricții pe automatizările RSS în planul gratuit; varianta strict `/rss.xml` nu oferă buton de abonare email pe `/blog` din ziua 1.
* **Reason for Rejection:** Respins de autor — Buttondown se potrivește unui blog tehnic minimalist, oferă RSS-to-Email nativ cu double opt-in și GDPR gestionat extern și rămâne izolat în `SubscribeAdapter` (ușor de înlocuit dacă se depășește plafonul gratuit de 100 abonați).

### Alternative I: Warm Amber necalibrat (`#F59E0B`/`#D97706`) din PRD-ul inițial (vs. Calibrated Baby Blue + Signal Coral)
* **Pros:** Respectă verbatim tabelul de culori propus inițial în PRD.
* **Cons:** `#0284C7` (~4.09:1), `#D97706` (~3.19:1) și `#F59E0B` (~2.15:1) pe fundal Light `#FFFFFF`/`#F8FAFC` eșuează matematic WCAG AA (`>= 4.5:1`), iar perechea dark navy + albastru-portocaliu replică șablonul generic al portofoliilor generate cu LLM.
* **Reason for Rejection:** Respins de autor — adoptarea Baby Blue calibrat (`#38BDF8` Dark / `#0369A1` Light) + Signal Coral (`#FB7185` Dark / `#BE123C` Light) trece WCAG AA cu marjă mare în ambele teme și diferențiază vizual site-ul.

### Alternative J: Includerea Knowledge & Skill Graph (3 straturi) și `Cmd+K` în MVP v2.0
* **Pros:** Adaugă explorare interactivă suplimentară pe `/resume` și salt rapid de la tastatură.
* **Cons:** Dublează suprafața de implementare și QA (desktop graph + Cluster Explorer mobil + index de căutare pentru 0 articole de blog), întârziind lansarea MVP-ului necesar acum în campania activă de aplicare la joburi.
* **Reason for Rejection:** Amânat de autor în Faza 2 (Post-MVP) — MVP v2.0 prioritizează viteza de lansare, CV-ul ATS determinist și studiile de caz cu Architecture Visualizer.

--------------------------------------------------------------------------------

## Non-Functional Requirements

### Security, Privacy & Public-Repo Hygiene
* **Zero secrete în repo și în bundle:** Nicio cheie API, token privat sau webhook neautentificat nu există în codul sursă sau în `dist/`. Formularul Buttondown folosește exclusiv acțiunea publică de abonare + protecție server-side la furnizor.
* **Conformitate GDPR pe `/blog`:** Formularul afișează explicit scopul (notificare la articole noi), double opt-in și dezabonare 1-click gestionate de Buttondown; pagina nu încarcă cookie-uri de tracking sau scripturi terțe de marketing.
* **Protecție PII & NDA:**
  * Niciun fișier de certificare cu CNP, adresă sau metadate EXIF nu se comite în repo (se folosesc prioritar URL-uri oficiale Credly/AWS/UiPath/NVIDIA; orice artefact local trece prin audit de redactare și strip EXIF).
  * Schema Zod blochează build-ul dacă un proiect cu `visibility !== 'public'` declară `repoUrl` sau dacă un proiect `anonymized` omite `anonymizationNote`.
  * Scriptul CI `scripts/verify-content.mjs` verifică absența termenilor interni neautorizați din fișierele publice Betfair și absența căilor locale de sistem (`C:\Users\<user>\...`).

### Performance, Bandwidth & Resource Budgets
* **Lighthouse CI (obligatoriu pe `1440px` și `375px`, în Dark și Light):** Performance `>= 95`, Accessibility `>= 95`, Best Practices `>= 95`, SEO `>= 95`.
* **Plafoane dure de transfer și artefact:**
  * Transfer inițial `/` `<= 500 KB` (garantează `>= 200.000` afișări/lună în limita soft de `100 GB/lună` a GitHub Pages).
  * JavaScript inițial pe rutele statice (`/`, `/resume`, `/blog`): `<= 20 KB` gzipped; pe rutele cu insulă `ArchitectureVisualizer` (`/projects/[slug]`): `<= 150 KB` gzipped.
  * Artefact complet `dist/` `<= 30 MB` (limita GitHub Pages: `1 GB`).
  * Timp build CI cu cache `pnpm` + Playwright: `< 3` minute.

### Observability & Error Isolation
* **Analytics fără cookie-uri:** Integrare opțională Cloudflare Web Analytics (activată prin `PUBLIC_CF_BEACON_TOKEN` când DNS-ul rulează pe Cloudflare; `< 2 KB`, zero cookies, respectă DNT).
* **Error Boundaries:** Insula `ArchitectureVisualizer` este înfășurată într-un React `ErrorBoundary` care cade grațios pe o listă statică a nodurilor și trade-off-urilor dacă apare o eroare client.
* **Release Provenance:** Build-ul emite `dist/build-info.json` (`commitSha`, `builtAt`, `siteUrl`) și `<meta name="build-sha" ...>` (fără text vizibil pe UI, respectând Zero Clutter), verificate automat de un smoke-check post-deploy în GitHub Actions.

### Rollout, Custom-Domain Cutover & Rollback
* **Izolare locală:** Clona de lucru se mută în `C:\Dev\personal-website` înainte de `pnpm install`; `.node-version` (`22`) și `packageManager` (`pnpm@10.x`) aliniază Windows-ul local cu `ubuntu-latest` din CI; `.gitattributes` impune `eol=lf`.
* **Rollout protejat:**
  1. Tag `git tag v1.0-static-backup` pe ultimul commit stabil v1.0.
  2. Dezvoltare și verificare completă CI (Zod, PDF, E2E, axe-core, Lighthouse) pe branch-ul `feat/v2-astro-upgrade`, urmată de un singur merge atomic în `main`.
  3. **Cutover domeniu custom în 2 etape:** (Etapa A) Deploy v2.0 pe `https://mr-span.github.io/personal-website/` cu `BASE_PATH=/personal-website` și validare live; (Etapa B) configurare DNS (`A`/`AAAA`/`CNAME`), atașare domeniu custom strict în *Repository Settings -> Pages* pe `Mr-Span/personal-website` (lăsând `Mr-Span.github.io` și `Mr-Span/claux-cv` neatinse), activare *Enforce HTTPS*, apoi rebuild atomic cu `BASE_PATH=""` și `SITE_URL=https://<domeniu-custom>`.
* **Rollback (< 2 minute):** `git revert` pe merge-ul v2.0 (sau restaurarea `v1.0-static-backup`) declanșează `.github/workflows/deploy.yml` și republică versiunea statică v1.0.
* **Continuitate linkuri v1.0:** Script mic pe `/` redirecționează ancorele și parametrii vechi din CV-uri/LinkedIn (`/#projects` -> `/projects/`, `/#experience` sau `/#credentials` sau `/#skills` -> `/resume/`, `/?category=<x>` -> `/projects/?category=<x>`).

--------------------------------------------------------------------------------

### Additional Resources

* Repository curent v1.0 & guvernanță existentă: `../../AGENTS.md`, `../../README.md`, `../../.github/workflows/deploy.yml`, `../../design-system/personal-website/MASTER.md`.
* Product PRD & Project-Tracker (`T-002`–`T-008`) în workspace-ul hibrid de produs (`Antigravity-Hub`).
* Brainstorm multi-lens (`concepts_brief.md` din `/egm-brainstorm` cu 8 Goldfish în paralel, 2026-11-24).

### Future Improvements

* **Interactive Knowledge & Skill Graph (Faza 2, Zona 2 pe `/resume`):** Harta ancorată pe 3 straturi (Domenii -> Tehnologii -> Cursuri/Certificări/Proiecte) încărcată lazy sub CV-ul clasic, cu layout pre-calculat la build și filtrare bi-direcțională fără bucle `requestAnimationFrame` continue.
* **Command Palette `Ctrl+K` / `⌘K` (Faza 2):** Declanșată prin buton vizibil OS-aware + scurtătură tastatură, alimentată de un `/search-index.json` static (`<= 15 KB` gzipped) încărcat lazy la prima deschidere, cu acțiuni rapide pentru recruiter (Download ATS PDF, Copy Email, salt direct la proiecte și articole).
* **Publicarea primelor 2–3 articole tehnice MDX:** Ex. arhitectura anonimizată Enterprise Agentic AI + PII isolation, evaluare citări RAG cu Pydantic + ChromaDB și telemetrie hibridă GSM/IP în robotică — activând automat tile-ul de blog pe `/` și fluxul RSS-to-Email Buttondown.
* **Portabilitate Vercel (dacă apar cerințe dinamice viitoare):** Izolarea configurării statice în `astro.config.mjs` permite adăugarea unui adapter Vercel fără rescrierea paginilor sau a schemelor de conținut.

--------------------------------------------------------------------------------

## Detailed Implementation Plan

Implementarea se execută în ordine secvențială pe branch-ul `feat/v2-astro-upgrade`, pornind din clona locală relocată în `C:\Dev\personal-website` (în afara OneDrive) după crearea etichetei `git tag v1.0-static-backup` pe ultimul commit stabil `v1.0`. Planul de mai jos enumeră toate fișierele create, modificate și șterse, fără cod de producție direct.

### Execution Phases (Ordered Single Sequence)

1. **Faza 0 — Backup, relocare mediu și actualizare guvernanță:**
   * Creare `git tag v1.0-static-backup` și push al tag-ului pe `origin`.
   * Clonare repo în `C:\Dev\personal-website`; instalare Node 22 LTS (installer oficial Windows `.msi`) și activare `corepack enable pnpm`.
   * Creare branch `feat/v2-astro-upgrade`; actualizare `.gitignore`, `.gitattributes`, `AGENTS.md`, `README.md` și `design-system/personal-website/*`.
2. **Faza 1 — Scaffold Astro + Config + Tokeni WCAG AA:**
   * Inițializare `package.json`, `astro.config.mjs`, `tsconfig.json`, Tailwind v4, Shiki (`css-variables`), `@astrojs/react`, `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`, `vitest`, `playwright`.
   * Implementare `src/styles/{tokens.css,global.css,print.css}`, `src/data/site.ts`, script sincron pre-paint `claudiu-span-theme-v2` și `src/layouts/BaseLayout.astro`.
3. **Faza 2 — Date canonice, validare Zod & layout compiler `ArchitectureVisualizer`:**
   * Implementare `src/data/{resume.schema.ts,resume.json}`, `src/content.config.ts`, `src/lib/{architecture.schema.ts,diagram-layout.ts,motion.ts,subscribe.ts,legacy-bridge.ts}`.
   * Populare proiecte Tier 1 (`enterprise-agentic-review`, `electrocasnicu-rag`, `quadyx-autonomy` + fișierele `.architecture.json`) și Tier 2 (proiecte personale + website-uri de clienți auditate `public`/`private`) + toate cele 6 certificări și datele UTCN MSc/BSc (cu audit PII).
4. **Faza 3 — Art Direction & Iterare Media Google AI Pro (în afara Git -> optimizare în repo):**
   * Definire Style Bible (paleta `#070B12`/`#38BDF8`/`#FB7185`, materiale mate, lumină studio, interdicții stricte: zero text în imagini, zero neon sci-fi).
   * Runda 1–4 per asset în Google AI Pro (Gemini / Imagen / Whisk / Veo): portret din poza GitHub cu finisare subtilă realist-Ghibli pe fundal neutru, imagine-ancoră copertă + Style Lock pe restul coperților flagship, micro-loop Hero (`<= 400 KB`) + poster static, carduri OG `1200×630`. Exporturile brute rămân local / în Drive; în repo intră exclusiv asset-urile optimizate sub bugetele CI.
5. **Faza 4 — Rutele MVP, insula React `ArchitectureVisualizer` și pipeline PDF Playwright:**
   * Implementare pagini `/`, `/projects`, `/projects/[slug]`, `/resume`, `/resume-print`, `/blog`, `/blog/[slug]`, `/404.html`, `/rss.xml`, `/robots.txt`, `/build-info.json`.
   * Implementare scripturi `scripts/{build-resume-pdf.mjs,verify-pdf.mjs,verify-budgets.mjs,verify-content.mjs,verify-live.mjs}` și înlocuire `.github/workflows/deploy.yml`.
6. **Faza 5 — Teste Unitare, E2E Playwright, Lighthouse CI, Merge & Cutover Domeniu Custom:**
   * Rulare completă verificări locale și CI pe PR; ștergere fișiere statice vechi `v1.0` din rădăcină; merge atomic în `main`.
   * Cutover în 2 etape: (A) validare live pe `mr-span.github.io/personal-website/` cu `BASE_PATH=/personal-website`; (B) configurare DNS + atașare domeniu custom strict pe repo-ul `Mr-Span/personal-website` + *Enforce HTTPS* + rebuild cu `BASE_PATH=""` și `SITE_URL=https://<domeniu-custom>`.

---

### Target Files to Create, Modify, or Delete

#### A. Modificări în fișiere existente (`Modify`)

1. **`.gitignore`** (`Modify`)
   * **Type / Scope:** Git configuration
   * **Proposed Changes:** Adaugă `node_modules/`, `dist/`, `.astro/`, `playwright-report/`, `test-results/`, `.lighthouseci/`, `.env`, `.env.local`, `raw-media/` pentru a bloca comiterea dependințelor, build-urilor și exporturilor brute AI Pro în repo-ul public.
2. **`AGENTS.md`** (`Modify`)
   * **Type / Scope:** Repository agent guidelines
   * **Proposed Changes:** Actualizează stack-ul documentat la Astro + React Islands + Tailwind + MDX, calea locală recomandată (`C:\Dev\personal-website`), sursa unică `src/data/resume.json` -> PDF ATS, paleta WCAG AA și regulile stricte PII/NDA pentru repo public.
3. **`README.md`** (`Modify`)
   * **Type / Scope:** Project documentation
   * **Proposed Changes:** Înlocuiește comenzile v1.0 (`python -m http.server`) cu instrucțiunile Node 22 + `pnpm` (`pnpm dev`, `pnpm build`, `pnpm pdf:build`, `pnpm test`, `pnpm verify:all`), variabilele `SITE_URL`/`BASE_PATH` și procedura de rollback la `v1.0-static-backup`.
4. **`.github/workflows/deploy.yml`** (`Modify`)
   * **Type / Scope:** CI/CD GitHub Actions Pages workflow
   * **Proposed Changes:** Păstrează acțiunile pinned la commit SHA; configurează Node 22 + cache `pnpm` și Playwright Chromium; rulează în jobul `build`: `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test:unit`, `pnpm build`, `pnpm pdf:build`, `pnpm pdf:verify`, `pnpm verify:content`, `pnpm verify:budgets`, `pnpm test:e2e`, `pnpm verify:lighthouse`, ștergerea `dist/resume-print/`, și `upload-pages-artifact` din `./dist`; în jobul `deploy`: `deploy-pages` urmat de `node scripts/verify-live.mjs` care validează HTTP 200 și `commitSha` din `/build-info.json`.
5. **`design-system/personal-website/MASTER.md`**, **`design-system/personal-website/tokens.css`**, **`design-system/personal-website/tokens.json`** (`Modify`)
   * **Type / Scope:** Design system source of truth
   * **Proposed Changes:** Migrează de la v1.0 Light Swiss (`Archivo`, `#2563EB`) la v2.0 Dark Baby Blue default + Light toggle (`#070B12`/`#0D1422`/`#131E33`/`#38BDF8`/`#FB7185` și Light `#F8FAFC`/`#FFFFFF`/`#0369A1`/`#BE123C`), tipografia `Space Grotesk`/`Inter`/`JetBrains Mono`, regula Glow vs. 1px border și regula Zero Clutter.

#### B. Fișiere v1.0 eliminate la finalizarea migrării (`Delete`)

6. **`index.html`**, **`404.html`**, **`robots.txt`**, **`sitemap.xml`**, **`.nojekyll`**, **`assets/css/styles.css`**, **`assets/js/main.js`**, **`assets/favicon.svg`**, **`dasd.pdf`** (`Delete`)
   * **Type / Scope:** Legacy v1.0 root files & test print artifact
   * **Proposed Changes:** Șterse în commit-ul de migrare din `feat/v2-astro-upgrade` odată ce rutele echivalente Astro și fișierele mutate în `public/` (`.nojekyll`, `favicon.svg`) sunt verificate în CI; `dasd.pdf` (testul de 6 pagini) este eliminat definitiv.

#### C. Configurare proiect & Toolchain (`Create`)

7. **`.node-version`** & **`.gitattributes`** (`Create`)
   * **Type / Scope:** Environment parity config
   * **Proposed Changes:** `.node-version` fixează `22`; `.gitattributes` impune `* text=auto eol=lf` și marcaje `binary` pe `.png`/`.webp`/`.avif`/`.mp4`/`.webm`/`.pdf` pentru paritate Windows <-> Ubuntu CI.
8. **`package.json`** & **`pnpm-lock.yaml`** (`Create`)
   * **Type / Scope:** Package manifest & lockfile
   * **Proposed Changes:** Fixează `engines.node >= 22`, `packageManager: "pnpm@10.x"`, dependențele Astro, `@astrojs/react`, `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`, `tailwindcss`, `motion`, `zod`, `shiki`, `pdf-parse` (pentru `verify-pdf.mjs`), `vitest`, `@playwright/test`, `@axe-core/playwright`, `@lhci/cli`, plus scripturile `dev`, `check`, `build`, `pdf:build`, `pdf:verify`, `verify:budgets`, `verify:content`, `test:unit`, `test:e2e`, `verify:lighthouse`, `verify:all`.
9. **`astro.config.mjs`**, **`tsconfig.json`**, **`eslint.config.mjs`**, **`vitest.config.ts`**, **`playwright.config.ts`**, **`.lighthouserc.json`** (`Create`)
   * **Type / Scope:** Build, lint & test configuration
   * **Proposed Changes:** `astro.config.mjs` setează `output: 'static'`, `trailingSlash: 'always'`, `site: process.env.SITE_URL || 'https://mr-span.github.io'`, `base: process.env.BASE_PATH || '/personal-website'`, `markdown.shikiConfig.theme = 'css-variables'`, integrările React/MDX/Sitemap (excluzând `/resume-print/` din sitemap). `tsconfig.json` folosește `astro/tsconfigs/strict`. `.lighthouserc.json` impune prag `>= 0.95` pe Performance, Accessibility, Best Practices, SEO pentru desktop (`1440px`) și mobile (`375px`).

#### D. Stiluri, date canonice, scheme Zod și module logice (`Create`)

10. **`src/styles/tokens.css`**, **`src/styles/global.css`**, **`src/styles/print.css`** (`Create`)
    * **Type / Scope:** Design tokens, base styles & print fallback
    * **Proposed Changes:** Mapează toate variabilele WCAG AA (`[data-theme="dark"]` și `[data-theme="light"]`), variabilele Shiki (`--astro-code-*`), ierarhia strictă de `z-index`, stiluri `:focus-visible`, `@media (prefers-reduced-motion: reduce)` și fallback `@media print` curat (fără `break-inside: avoid-page` pe secțiuni întregi).
11. **`src/data/site.ts`** (`Create`)
    * **Type / Scope:** Central site configuration module
    * **Proposed Changes:** Exportă `SITE_URL`, `BASE_PATH`, helper `withBase(path)`, metadate autor, linkuri sociale, `BUTTONDOWN_SUBSCRIBE_URL`, `BUTTONDOWN_HOSTED_URL` și `CF_BEACON_TOKEN` (opțional din env).
12. **`src/data/resume.schema.ts`** & **`src/data/resume.json`** (`Create`)
    * **Type / Scope:** Canonical Resume Zod schema & verified dataset
    * **Proposed Changes:** Definește schema strictă `ResumeSchema` (inclusiv flag-urile `includeInPdf`, validare `verifyUrl` vs. `auditedAssetPath`) și conținutul complet verificat: Betfair Romania Development, QUADYX (`isSideVenture: true`), UTCN MSc Cyber-Physical Systems + BSc Robotics (cursuri, proiecte, teze), toate cele 6 certificări (`AWS AIF-C01`, `Simplilearn AI`, `Școala Informala de IT — Python`, `Școala Informala de IT — Python + Agentic AI`, `UiPath Advanced Developer`, `NVIDIA Fundamentals of Deep Learning`) și grupurile de competențe.
13. **`src/content.config.ts`** (`Create`)
    * **Type / Scope:** Astro Content Collections Zod registry
    * **Proposed Changes:** Definește colecțiile `projects` (`tier`, `visibility`, `.refine()` care interzice `repoUrl` când `visibility !== 'public'` și cere `liveUrl` sau `screenshots` pentru `private`, plus `anonymizationNote` obligatoriu pentru `anonymized`) și `blog` (`title`, `publishedAt`, `tags`, `summary`, `published`).
14. **`src/lib/architecture.schema.ts`** & **`src/lib/diagram-layout.ts`** (`Create`)
    * **Type / Scope:** Architecture Visualizer schema & build-time SVG compiler
    * **Proposed Changes:** `ArchitectureGraphSchema` validează unicitatea `(stage, lane)`, referințele `edges[].from/to` și `scenarios.{nominal,guardrail}.steps`. `compileArchitectureLayout(graph)` calculează determinist `viewBox`, coordonatele `(x, y)` ale nodurilor, punctele de ancorare și curbele cubic Bezier ale muchiilor, returnând obiectul `CompiledArchitectureGraph` consumat de insula React cu `0 KB` librărie de layout în browser.
15. **`src/lib/motion.ts`**, **`src/lib/subscribe.ts`**, **`src/lib/legacy-bridge.ts`** (`Create`)
    * **Type / Scope:** Shared client utilities
    * **Proposed Changes:**
      * `motion.ts`: exportă `useMotionActive(ref)` și helper vanilla `observeMediaVisibility(el, onState)` combinând `IntersectionObserver`, `visibilitychange`, `prefers-reduced-motion` și `saveData`.
      * `subscribe.ts`: implementează `SubscribeAdapter` pentru Buttondown (`submitSubscription(email, honeypot)` cu `8s` `AbortController`, mașină de stări `idle | submitting | success | rate_limited | blocked_or_error`, zero secrete, fallback hosted URL).
      * `legacy-bridge.ts`: mapează determinist ancorele și query-urile v1.0 (`#projects`, `#experience`, `#credentials`, `#skills`, `?category=...`) la rutele v2.0 respectând `BASE_PATH`.

#### E. Conținut & Asset-uri statice (`Create`)

16. **`src/content/projects/enterprise-agentic-review.{mdx,architecture.json}`**, **`electrocasnicu-rag.{mdx,architecture.json}`**, **`quadyx-autonomy.{mdx,architecture.json}`** (`Create`)
    * **Type / Scope:** Tier 1 Flagship Case Studies + Architecture Graphs
    * **Proposed Changes:** Conținut tehnic structurat (Problem -> Architecture -> Guardrails/Failure Modes -> Measured Outcome) și grafuri JSON cu scenarii reale `nominal` vs. `guardrail` (ex. izolare PII + HITL Betfair, refuz verificat Pydantic ElectrocasNicu, fallback GSM -> IP QUADYX).
17. **`src/content/projects/aideas.mdx`**, **`ai-resume-parser.mdx`**, **`src/content/projects/client-*.mdx`** (`Create`)
    * **Type / Scope:** Tier 2 Showcase Cards (proiecte personale + website-uri clienți)
    * **Proposed Changes:** Metadate tipate + descrieri scurte, cu `visibility: 'public'` (GitHub + live) sau `visibility: 'private'` (live URL și/sau screenshot-uri curățate, fără `repoUrl`).
18. **`src/assets/media/{portrait.png,hero-poster.png,covers/*.png,clients/*.png}`**, **`public/media/{hero-loop.webm,hero-loop.mp4}`**, **`public/og/default.png`**, **`public/.nojekyll`**, **`public/favicon.svg`** (`Create`)
    * **Type / Scope:** Optimized media & static public assets
    * **Proposed Changes:** Asset-urile rezultate din sesiunea iterativă Google AI Pro, verificate sub plafoanele de dimensiune CI; `.nojekyll` și `favicon.svg` (actualizat pe paleta Baby Blue) plasate în `public/` pentru copiere automată în `dist/`.

#### F. Layout-uri, Componente statice & Insula React (`Create`)

19. **`src/layouts/BaseLayout.astro`** & **`src/layouts/PrintResumeLayout.astro`** (`Create`)
    * **Type / Scope:** Page shells
    * **Proposed Changes:** `BaseLayout.astro` include skip-link, scriptul inline pre-paint `claudiu-span-theme-v2` (cu `try/catch`), `<meta name="build-sha">`, OG tags, Schema.org `Person` JSON-LD, opțional beacon Cloudflare Web Analytics, `Header`, `ResumeSideButton` și `Footer`. `PrintResumeLayout.astro` definește pagina A4 strict pe o coloană (`noindex`, `0 KB` JS) pentru Playwright PDF.
20. **`src/components/{Header,Footer,ResumeSideButton,HeroMedia,ProjectCard,FallbackCover,CertificationGrid,SubscribeForm,TableOfContents,CopyCodeEnhancer}.astro`** (`Create`)
    * **Type / Scope:** Zero-JS / minimal-JS Astro UI components
    * **Proposed Changes:**
      * `ResumeSideButton.astro`: control persistent click/tap-only cu etichetă vizibilă `Resume` pe desktop lateral, integrat în `Header.astro` sub `768px`.
      * `HeroMedia.astro`: randează portretul (`astro:assets`, `fetchpriority="high"`) și containerul ambient poster-first care atașează loop-ul `.webm`/`.mp4` după `load` doar când `motion.ts` permite.
      * `CertificationGrid.astro`: randează toate cele 6 certificări din `resume.json` în grid vizibil 2×3 cu link extern verificat (`target="_blank" rel="noopener noreferrer"`).
      * `SubscribeForm.astro`: conectat la `src/lib/subscribe.ts`, cu `aria-live="polite"`, informare GDPR și link fallback Buttondown + `/rss.xml`.
21. **`src/components/diagram/{ArchitectureVisualizer,InspectorDrawer,MobilePipeline,DiagramErrorBoundary}.tsx`** (`Create`)
    * **Type / Scope:** React + `LazyMotion` interactive island (`client:visible`)
    * **Proposed Changes:** Primește `CompiledArchitectureGraph` ca prop static (0 calcul de layout în browser). Gestionează selecția nodului (mouse hover, click/tap, `Tab`/`Enter`), evidențierea traseului upstream/downstream, comutatorul `Nominal` vs. `Guardrail / Failure Mode`, butonul `Trace Flow` (cu mod discret pas-cu-pas pe `prefers-reduced-motion: reduce`), `InspectorDrawer` accesibil (`role="dialog"` / panou lateral desktop, bottom sheet mobil, `Esc` returnează focusul pe nod) și `MobilePipeline` vertical sub `768px`, protejate de `DiagramErrorBoundary`.

#### G. Rute Astro & Endpoint-uri Statice (`Create`)

22. **`src/pages/index.astro`**, **`src/pages/projects/index.astro`**, **`src/pages/projects/[slug].astro`**, **`src/pages/resume.astro`**, **`src/pages/resume-print.astro`**, **`src/pages/blog/index.astro`**, **`src/pages/blog/[slug].astro`**, **`src/pages/404.astro`** (`Create`)
    * **Type / Scope:** Static HTML page routes
    * **Proposed Changes:**
      * `index.astro`: Hero + Bento Grid modular (suprimă automat cardul „Latest Blog Post" când `publishedPosts.length === 0`) + invocare `legacy-bridge.ts`.
      * `projects/index.astro`: grid Bento filtrabil cu sync `?category=...` pentru Tier 1 și Tier 2.
      * `projects/[slug].astro`: generat doar pentru `tier === 'case-study'`, montează `ArchitectureVisualizer` cu `client:visible`.
      * `resume.astro`: CV liniar scanabil sus, buton 1-click `Download ATS PDF` (`/Claudiu-Span-CV.pdf`), `CertificationGrid` 2×3, panouri `<details>` pentru cursurile/tezele UTCN.
      * `resume-print.astro`: CV A4 alb-negru pe o coloană pentru Playwright (`includeInPdf: true`).
      * `blog/index.astro` & `blog/[slug].astro`: filtrare pe tag-uri (`?tag=...`), `SubscribeForm`, stare curată la 0 articole; `[slug].astro` returnează `[]` în siguranță nativ în Astro fără eroare de build.
23. **`src/pages/rss.xml.ts`**, **`src/pages/robots.txt.ts`**, **`src/pages/build-info.json.ts`** (`Create`)
    * **Type / Scope:** Static build-time endpoints
    * **Proposed Changes:** Generează `/rss.xml` (din articolele `published: true`), `/robots.txt` (din `SITE_URL` + excludere `/resume-print/`) și `/build-info.json` (`commitSha`, `builtAt`, `siteUrl`).

#### H. Scripturi Build/Verification & Suite de Teste (`Create`)

24. **`scripts/build-resume-pdf.mjs`** & **`scripts/verify-pdf.mjs`** (`Create`)
    * **Type / Scope:** Post-build PDF compiler & ATS validator
    * **Proposed Changes:** `build-resume-pdf.mjs` servește `./dist`, generează `dist/Claudiu-Span-CV.pdf` prin Playwright Chromium din `/resume-print/` și șterge directorul `dist/resume-print/`. `verify-pdf.mjs` verifică dimensiunea `<= 300 KB`, numărul de pagini `1..2` și prezența în textul extras a credențialelor esențiale (`Claudiu`, `Betfair`, `40+`, `70%`, `QUADYX`, `AWS`, `Technical University of Cluj-Napoca`, email).
25. **`scripts/verify-budgets.mjs`**, **`scripts/verify-content.mjs`**, **`scripts/verify-live.mjs`** (`Create`)
    * **Type / Scope:** CI quality, security & deploy gates
    * **Proposed Changes:** `verify-budgets.mjs` validează existența `dist/.nojekyll`, `dist/404.html`, `dist/rss.xml`, `dist/Claudiu-Span-CV.pdf`, dimensiunea `dist/ <= 30 MB`, portret `<= 80 KB`, coperți `<= 120 KB`, loop Hero `<= 400 KB`, JS per rută `<= 20 KB` (static) / `<= 150 KB` (insule). `verify-content.mjs` scanează `dist/` pentru absența căilor locale (`C:\Users\<user>\...`), termenilor de denylist NDA și linkurilor GitHub pe proiecte private. `verify-live.mjs` verifică post-deploy HTTP 200 și `commitSha` pe `SITE_URL/build-info.json`.
26. **`tests/unit/{diagram-layout,schemas,subscribe,legacy-bridge}.test.ts`** & **`tests/fixtures/sample-post.mdx`** (`Create`)
    * **Type / Scope:** Unit tests (Vitest) & blog pipeline fixture
    * **Proposed Changes:** Acoperă calculul coordonatelor `stage/lane`, respingerea coliziunilor `(stage, lane)` și a `repoUrl` pe proiecte `private`, mașina de stări `SubscribeAdapter` (inclusiv timeout `8s` și eroare network/CORS), maparea `legacy-bridge` și validarea schemei MDX printr-un fixture de test izolat (nu intră în `dist/`).
27. **`tests/e2e/portfolio.spec.ts`** (`Create`)
    * **Type / Scope:** End-to-End & Accessibility tests (Playwright + `@axe-core/playwright`)
    * **Proposed Changes:** Testează toate rutele pe `1440px` și `375px` în Dark și Light Mode: `0` erori consolă/`pageerror`, `0` overflow orizontal, audit `axe-core` WCAG 2.1 AA, persistența `claudiu-span-theme-v2` (inclusiv cu `localStorage` blocat), clic pe `ResumeSideButton` -> `/resume` cu toate cele 6 certificări vizibile + HTTP 200 pe `/Claudiu-Span-CV.pdf`, interacțiunea tastatură/click `ArchitectureVisualizer` (`Nominal` -> `Guardrail`, `Trace Flow`, `Esc` focus return), comportamentul `prefers-reduced-motion: reduce`, starea de fallback `SubscribeForm` la cerere blocată și redirecționarea ancorelor v1.0 (`/#projects`, `/?category=ai`).

---

### Verification Plan

Toate verificările de mai jos trebuie să treacă local (din `C:\Dev\personal-website`) și în GitHub Actions înainte de merge pe `main`:

* **Compilation & Static Build:** `pnpm check` (`astro check` + `tsc --noEmit`) urmat de `pnpm build` și `pnpm pdf:build` (exit code `0`, zero warning-uri de schemă sau rute).
* **Unit Tests:** `pnpm test:unit` (`vitest run`) — acoperire `>= 85%` pe `src/lib/` (`diagram-layout.ts`, `subscribe.ts`, `legacy-bridge.ts`) și `100%` pe invarianții critici Zod (`resume.schema.ts`, `architecture.schema.ts`, `content.config.ts`).
* **Static Analysis & Formatting:** `pnpm lint` (`eslint .`) și `pnpm format:check` (`prettier --check .`) cu zero erori.
* **ATS PDF & Asset/Security Gates:** `pnpm pdf:verify` (`1–2` pagini, `<= 300 KB`, text ATS verificat), `pnpm verify:budgets` (plafoane KB/MB + `.nojekyll` + artefacte obligatorii) și `pnpm verify:content` (zero PII/căi locale/linkuri private).
* **E2E, A11y & Visual Verification:** `pnpm test:e2e` (Playwright pe `./dist` la `1440px` și `375px`, Dark & Light, `axe-core` 0 violări WCAG AA, 0 erori consolă, 0 overflow orizontal, `prefers-reduced-motion: reduce`) + audit vizual `/browser` salvat în zona de review-uri a proiectului.
* **Lighthouse CI:** `pnpm verify:lighthouse` (`lhci autorun`) impunând scor `>= 95` pe Performance, Accessibility, Best Practices și SEO pentru `/`, `/projects/`, `/projects/enterprise-agentic-review/`, `/resume/` și `/blog/` (desktop și mobil).
* **Post-Deploy Live Smoke Check:** `node scripts/verify-live.mjs` confirmând HTTP `200`, TLS valid și `commitSha` așteptat pe URL-ul public (atât după Etapa A cât și după Etapa B a cutover-ului pe domeniul custom).

--------------------------------------------------------------------------------

*Drafted with EGM*

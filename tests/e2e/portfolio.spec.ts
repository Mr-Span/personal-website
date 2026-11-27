import { createRequire } from 'node:module';
import { gzipSync } from 'node:zlib';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const esmRequire = createRequire(import.meta.url);
const pdfParse = esmRequire('pdf-parse/lib/pdf-parse.js') as (buf: Buffer) => Promise<{ numpages: number; text: string }>;

function wireBytes(url: string, buf: Buffer): number {
  if (/\.(woff2?|png|jpe?g|webp|pdf)$/i.test(url)) return buf.length;
  return gzipSync(buf).length;
}

const BASE = '/personal-website';
const ROUTES = [`${BASE}/`, `${BASE}/blog/`];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, hasTouch: false },
  { name: 'mobile-375', width: 375, height: 812, hasTouch: true },
  { name: 'mobile-390', width: 390, height: 844, hasTouch: true },
];

for (const vp of VIEWPORTS) {
  for (const theme of ['light', 'dark'] as const) {
    test(`WCAG AA, zero console errors & zero horizontal overflow (${vp.name}, ${theme})`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        hasTouch: vp.hasTouch,
        colorScheme: theme,
      });
      const page = await context.newPage();

      for (const route of ROUTES) {
        const errors: string[] = [];
        page.removeAllListeners('console');
        page.removeAllListeners('pageerror');
        page.on('console', (msg) => {
          if (msg.type() === 'error') errors.push(msg.text());
        });
        page.on('pageerror', (err) => errors.push(err.message));

        const response = await page.goto(route, { waitUntil: 'networkidle' });
        expect(response?.status(), `HTTP status for ${route}`).toBe(200);
        expect(await page.locator('html').getAttribute('data-theme')).toBe(theme);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        );
        expect(overflow, `Horizontal overflow on ${route} (${vp.name})`).toBe(false);

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        expect(
          axe.violations,
          `Axe violations on ${route} (${vp.name}, ${theme}): ${JSON.stringify(axe.violations, null, 2)}`,
        ).toEqual([]);

        expect(errors, `Console/page errors on ${route}`).toEqual([]);
      }

      await context.close();
    });
  }
}

test('Header Morph / <-> /blog/: separated Blog & Theme buttons, single-DOM capsules, and zero Download CV on /blog/', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  const header = page.locator('#site-header');
  await expect(header).toBeVisible();
  await expect(header.locator('.nav-capsule')).toHaveCount(0);
  await expect(header.locator('.nav-sep')).toHaveCount(0);
  await expect(header.locator('.vt-brand-claux')).toHaveCount(1);
  await expect(header.locator('.vt-brand-claux')).toBeVisible();
  await expect(header.locator('.vt-nav-blog')).toHaveCount(1);
  await expect(header.locator('.vt-nav-blog')).toHaveText('Blog');

  const blogKey = header.locator('a.header-blog-key.vt-nav-blog');
  const themeBtn = header.locator('#theme-toggle.header-theme-dial');
  const cvBtn = header.locator('a.cta-anodized');
  await expect(blogKey).toBeVisible();
  await expect(themeBtn).toBeVisible();
  await expect(cvBtn).toContainText('Download CV');

  await expect(blogKey).toHaveCSS('border-radius', '6px');
  await expect(themeBtn).toHaveCSS('border-radius', '9999px');
  await expect(cvBtn).toHaveCSS('border-radius', '11px');

  const blogBox = await blogKey.boundingBox();
  const themeBox = await themeBtn.boundingBox();
  const cvBox = await cvBtn.boundingBox();
  expect(blogBox, 'Blog keycap bounding box').not.toBeNull();
  expect(themeBox, 'Theme dial bounding box').not.toBeNull();
  expect(cvBox, 'Download CV bounding box').not.toBeNull();
  expect(
    themeBox!.x - (blogBox!.x + blogBox!.width),
    'Blog and Theme buttons must stay separated side-by-side (>= 6px gap)',
  ).toBeGreaterThanOrEqual(6);
  expect(
    cvBox!.x - (themeBox!.x + themeBox!.width),
    'Theme dial and Download CV must stay separated side-by-side',
  ).toBeGreaterThanOrEqual(6);

  // Removed routes & ⌘K button must not exist in header
  await expect(header.getByRole('link', { name: 'Projects' })).toHaveCount(0);
  await expect(header.getByRole('link', { name: 'Resume' })).toHaveCount(0);
  await expect(page.locator('#cmd-open-btn')).toHaveCount(0);
  await expect(page.locator('#cmd-palette')).toHaveCount(0);

  // Navigate to /blog/ via header Blog link
  await blogKey.click();
  await expect(page).toHaveURL(new RegExp(`${BASE}/blog/$`));

  await expect(header.locator('.nav-capsule')).toHaveCount(0);
  await expect(header.locator('.home-back-capsule')).toBeVisible();
  await expect(header.locator('.home-back-capsule')).toContainText('Home');
  await expect(header.locator('.brand-blog-union')).toBeVisible();
  await expect(header.locator('.brand-blog-union .vt-brand-claux')).toHaveCount(1);
  await expect(header.locator('.brand-blog-union .vt-nav-blog')).toHaveCount(1);
  await expect(header.locator('.brand-blog-union .vt-nav-blog')).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(header.locator('#theme-toggle.header-theme-dial')).toBeVisible();
  await expect(header.locator('#theme-toggle.header-theme-dial')).toHaveCSS(
    'border-radius',
    '9999px',
  );

  // Zero Download CV CTA anywhere in /blog/ header, and no Open Badge button in /blog/ footer
  await expect(header.locator('a.cta-anodized')).toHaveCount(0);
  await expect(header.locator('a[href*="Claudiu-Span-CV.pdf"]')).toHaveCount(0);
  await expect(header.getByText(/Download CV/i)).toHaveCount(0);
  await expect(page.locator('#footer-open-badge')).toHaveCount(0);
});

test('Desktop showcase: byte-0 H1, < 450 KB transfer, 3D hoist & concise #module-visor -> See more scroll, 5-station CNC rail & wheel cancel', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  const transferred: Array<{ url: string; bytes: number }> = [];
  page.on('response', async (resp) => {
    try {
      const buf = await resp.body();
      transferred.push({ url: resp.url(), bytes: wireBytes(resp.url(), buf) });
    } catch {
      // Ignore empty/redirect bodies
    }
  });

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // H1 must be immediately visible (LCP safe)
  await expect(page.locator('#hero-heading')).toBeVisible();
  await expect(page.locator('#hero-heading')).toHaveText('Claudiu Șpan');
  await expect(page.locator('#btn-ik-toggle')).toHaveCount(0);
  await expect(page.locator('#ik-hud-readout')).toHaveCount(0);
  await expect(page.locator('#module-visor')).toHaveCount(1);
  await expect(page.locator('#module-visor')).not.toBeVisible();
  await expect(page.locator('#hoist-card')).toHaveCount(1);
  await expect(page.locator('#hoist-card')).not.toHaveClass(/active/);
  await expect(page.locator('.brand-claux-svg')).toBeVisible();

  const totalKb = transferred.reduce((s, r) => s + r.bytes, 0) / 1024;
  expect(
    totalKb,
    `Desktop initial wire transfer ${totalKb.toFixed(1)} KB exceeded 450 KB`,
  ).toBeLessThan(450);

  // Wait for desktop 3D kinematic runtime to mount pick/release preview handlers
  await page.waitForFunction(
    () => {
      const w = window as unknown as Record<string, unknown>;
      return (
        typeof w.__cobotPickModule === 'function' &&
        typeof w.__cobotReleaseModule === 'function' &&
        typeof w.__openModulePreview === 'function'
      );
    },
    undefined,
    { timeout: 5000 },
  );

  // Verify 5-station rail structure and off-screen pause at top of page
  const rail = page.locator('#vertical-cnc-rail');
  await expect(rail.locator('[data-rail-link]')).toHaveCount(5);
  for (const stationId of ['experience', 'education', 'projects', 'certifications', 'stack'] as const) {
    await expect(rail.locator(`a[data-station="${stationId}"]`)).toHaveCount(1);
  }
  await expect(rail.locator('.cnc-station-icon').first()).toHaveAttribute('width', '18');
  await expect(rail.locator('.cnc-station-icon').first()).toHaveAttribute('height', '18');
  await expect(rail).toHaveAttribute('data-in-view', 'false');

  // Hover station 2 (QUADYX) and verify WCAG AA stays clean
  const station2 = page.locator('[data-station-index="2"]');
  const initialBox = await station2.boundingBox();
  expect(initialBox, 'Station 2 initial bounding box').not.toBeNull();
  await station2.hover();
  const hoverAxe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(hoverAxe.violations).toEqual([]);

  // Click station 2 (QUADYX) -> 3D hoist picks container & opens concise #module-visor (no Recruiter/Engineer tabs)
  await station2.click();
  const visor = page.locator('#module-visor');
  await expect(visor).toBeVisible({ timeout: 2000 });
  await expect(station2).toHaveClass(/is-picked/);
  await expect(page.locator('#personal-badge-dialog')).not.toBeVisible();
  await expect(page.locator('#visor-title')).toContainText('QUADYX');
  const summaryText = await page.locator('#visor-summary').textContent();
  expect(summaryText?.trim().length ?? 0).toBeGreaterThan(20);
  await expect(page.locator('#visor-facts li')).toHaveCount(3);
  await expect(page.locator('#visor-stack')).toBeVisible();
  await expect(page.locator('#visor-see-more')).toBeVisible();
  await expect(page.locator('#visor-see-more')).toContainText('See more');
  await expect(page.locator('#visor-secondary-link')).toHaveAttribute('href', 'https://quadyx.com/');
  await expect(page.locator('#lens-recruiter')).toHaveCount(0);
  await expect(page.locator('#lens-engineer')).toHaveCount(0);

  const visorAxe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(visorAxe.violations).toEqual([]);

  // Esc close with cursor still over station 2 -> returns cleanly flush with bay, zero ghosting/stuck hover/focus
  await page.mouse.move(
    initialBox!.x + initialBox!.width / 2,
    initialBox!.y + initialBox!.height / 2,
  );
  await page.keyboard.press('Escape');
  await expect(visor).not.toBeVisible();
  await expect(station2).not.toHaveClass(/is-picked|is-hovered|is-grabbing/, { timeout: 2500 });
  await expect(page.locator('#hoist-card')).not.toHaveClass(/active/, { timeout: 2500 });
  await expect(page.locator('body')).not.toHaveClass(/arm-hoisting/);
  const station2Focused = await station2.evaluate((el) => document.activeElement === el);
  expect(station2Focused, 'Station 2 must not stay focused after Esc release').toBe(false);

  await page.waitForTimeout(350);
  const restoredBox = await station2.boundingBox();
  expect(restoredBox, 'Station 2 restored bounding box').not.toBeNull();
  expect(
    Math.abs(restoredBox!.y - initialBox!.y),
    `Restored bay card y=${restoredBox!.y.toFixed(1)} drifted from initial y=${initialBox!.y.toFixed(1)}`,
  ).toBeLessThan(3);

  // Close button (#visor-close) and backdrop click also return cleanly with zero ghosting
  const station0 = page.locator('[data-station-index="0"]');
  await station0.click();
  await expect(visor).toBeVisible({ timeout: 2000 });
  await page.click('#visor-close');
  await expect(visor).not.toBeVisible();
  await expect(station0).not.toHaveClass(/is-picked|is-grabbing/, { timeout: 2500 });
  await expect(page.locator('#hoist-card')).not.toHaveClass(/active/, { timeout: 2500 });

  const station1 = page.locator('[data-station-index="1"]');
  await station1.click();
  await expect(visor).toBeVisible({ timeout: 2000 });
  const visorBox = await visor.boundingBox();
  expect(visorBox, '#module-visor bounding box').not.toBeNull();
  await page.mouse.click(Math.max(8, visorBox!.x - 24), visorBox!.y + 24);
  await expect(visor).not.toBeVisible();
  await expect(station1).not.toHaveClass(/is-picked|is-grabbing/, { timeout: 2500 });
  await expect(page.locator('#hoist-card')).not.toHaveClass(/active/, { timeout: 2500 });

  // Re-open & click See more ↓ -> instant bay dock + smooth scroll to #proj-quadyx synced to 5-station CNC rail
  await station2.click();
  await expect(visor).toBeVisible({ timeout: 2000 });
  await page.click('#visor-see-more');
  await expect(visor).not.toBeVisible();
  await expect(station2).not.toHaveClass(/is-picked|is-grabbing/);
  await expect(page.locator('#hoist-card')).not.toHaveClass(/active/);
  await expect(page.locator('body')).not.toHaveClass(/arm-hoisting/);

  const projectsRailLink = rail.locator('a[data-station="projects"]');
  await expect(projectsRailLink).toHaveAttribute('aria-current', 'location', { timeout: 2500 });

  await expect(async () => {
    const quadBox = await page.locator('#proj-quadyx').boundingBox();
    expect(quadBox, '#proj-quadyx should be in viewport').not.toBeNull();
    expect(Math.abs((quadBox?.y ?? 9999) - 82)).toBeLessThan(80);
  }).toPass({ timeout: 2500 });

  // Scroll to #experience so sticky 5-station CNC rail is in view, trigger long scroll to #stack, and verify wheel cancels it
  await page.evaluate(() => window.scrollTo({ top: 960, behavior: 'instant' }));
  await expect(rail).toHaveAttribute('data-in-view', 'true', { timeout: 1500 });

  const stackTop = await page.evaluate(() => {
    const el = document.getElementById('stack');
    return el ? el.getBoundingClientRect().top + window.scrollY - 82 : 2000;
  });

  await page.click('#vertical-cnc-rail a[data-station="stack"]');
  await expect(rail).toHaveAttribute('data-state', 'transit');
  await page.waitForTimeout(40);
  await page.evaluate(() => {
    window.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, bubbles: true }));
  });

  await expect(rail).toHaveAttribute('data-state', 'idle');
  const yAfterCancel = await page.evaluate(() => window.scrollY);
  await page.waitForTimeout(550);
  const yAfterWait = await page.evaluate(() => window.scrollY);
  expect(
    Math.abs(yAfterWait - yAfterCancel),
    `Active rail scroll must stay cancelled after wheel event (was ${yAfterCancel}, became ${yAfterWait})`,
  ).toBeLessThan(10);
  expect(yAfterWait, 'Cancelled scroll should stop short of #stack').toBeLessThan(stackTop - 200);

  // Sticky 5-station CNC rail must never clip behind #site-header or overlap #cert-drone-carousel, and scrollspy must match all 5 stations
  for (const sectionId of ['experience', 'education', 'projects', 'certifications', 'stack'] as const) {
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 82;
      window.scrollTo({ top, behavior: 'instant' });
    }, sectionId);
    await expect(
      rail.locator(`a[data-station="${sectionId}"]`),
      `#vertical-cnc-rail should highlight ${sectionId} when scrolled to #${sectionId}`,
    ).toHaveAttribute('aria-current', 'location', { timeout: 1500 });

    const headerBox = await page.locator('#site-header').boundingBox();
    const railBox = await rail.boundingBox();
    expect(headerBox, '#site-header bounding box').not.toBeNull();
    expect(railBox, `#vertical-cnc-rail bounding box at #${sectionId}`).not.toBeNull();
    expect(
      railBox!.y,
      `#vertical-cnc-rail (top=${railBox!.y.toFixed(1)}) clipped behind #site-header (bottom=${(headerBox!.y + headerBox!.height).toFixed(1)}) at #${sectionId}`,
    ).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height);

    if (sectionId === 'certifications') {
      const carouselBox = await page.locator('#cert-drone-carousel').boundingBox();
      expect(carouselBox, '#cert-drone-carousel bounding box').not.toBeNull();
      expect(
        railBox!.x + railBox!.width,
        `#vertical-cnc-rail (right=${(railBox!.x + railBox!.width).toFixed(1)}) overlaps #cert-drone-carousel (left=${carouselBox!.x.toFixed(1)})`,
      ).toBeLessThanOrEqual(carouselBox!.x);
    }
  }
});

test('Mobile 375px & 390px: zero hero badge-tab / domain-caption overlap, single-line caption, inline footer beacon', async ({
  browser,
}) => {
  for (const width of [375, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 375 ? 812 : 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

    const tabBox = await page.locator('#personal-badge-mobile-trigger').boundingBox();
    const capBox = await page.locator('#pixel-domain-caption').boundingBox();
    expect(tabBox, `Mobile badge tab box at ${width}px`).not.toBeNull();
    expect(capBox, `Domain caption box at ${width}px`).not.toBeNull();

    const gap = capBox!.y - (tabBox!.y + tabBox!.height);
    expect(
      gap,
      `Mobile badge tab bottom (${(tabBox!.y + tabBox!.height).toFixed(1)}) overlaps/crowds #pixel-domain-caption top (${capBox!.y.toFixed(1)}) at ${width}px`,
    ).toBeGreaterThanOrEqual(10);
    expect(
      capBox!.height,
      `#pixel-domain-caption wrapped to multiple lines (height=${capBox!.height.toFixed(1)}) at ${width}px`,
    ).toBeLessThanOrEqual(36);

    const beaconBox = await page.locator('footer .px-beacon').boundingBox();
    const yearBox = await page.locator('footer p span.tabular-nums').boundingBox();
    expect(beaconBox, `Footer beacon box at ${width}px`).not.toBeNull();
    expect(yearBox, `Footer 2026 span box at ${width}px`).not.toBeNull();
    expect(
      Math.abs((beaconBox!.y + beaconBox!.height / 2) - (yearBox!.y + yearBox!.height / 2)),
      `Footer beacon should stay inline with © 2026 at ${width}px`,
    ).toBeLessThan(12);

    await context.close();
  }
});

test('Mobile 390x844: < 220 KB transfer, ZERO kinematic/Three.js JS & tap opens concise #module-visor -> See more', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();

  const requests: string[] = [];
  let totalBytes = 0;
  page.on('request', (req) => requests.push(req.url()));
  page.on('response', async (resp) => {
    try {
      const buf = await resp.body();
      totalBytes += wireBytes(resp.url(), buf);
    } catch {
      // ignore
    }
  });

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const forbidden3dRequests = requests.filter((u) => /kinematic-runtime|three/i.test(u));
  expect(
    forbidden3dRequests,
    `Unexpected desktop-only 3D/kinematic requests on mobile: ${forbidden3dRequests.join(', ')}`,
  ).toEqual([]);
  expect(
    totalBytes / 1024,
    `Mobile wire transfer ${(totalBytes / 1024).toFixed(1)} KB exceeded 220 KB`,
  ).toBeLessThan(220);

  // Mobile tap opens concise #module-visor cleanly without 3D runtime & See more navigates to target
  await page.locator('[data-station-index="2"]').tap();
  const visor = page.locator('#module-visor');
  await expect(visor).toBeVisible({ timeout: 2000 });
  await expect(page.locator('#visor-title')).toContainText('QUADYX');
  await page.locator('#visor-see-more').tap();
  await expect(visor).not.toBeVisible();
  await expect(async () => {
    const quadBox = await page.locator('#proj-quadyx').boundingBox();
    expect(quadBox, '#proj-quadyx should be scrolled into mobile viewport').not.toBeNull();
    expect(Math.abs((quadBox?.y ?? 9999) - 82)).toBeLessThan(120);
  }).toPass({ timeout: 2500 });

  await context.close();
});

test('Single-page sections: split #experience/#education + grad cap, 220x88 pixel visuals, project copy, certs, ATS PDF & AI endpoints', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  await expect(page.locator('#pixel-drone-flyer')).toHaveCount(0);
  await expect(page.locator('#btn-motion-toggle')).toHaveCount(0);
  await expect(page.locator('#btn-cert-carousel-toggle')).toHaveCount(0);

  // Separate #experience & #education sections on / + pixel graduation cap figurine
  const expSection = page.locator('#experience');
  const eduSection = page.locator('#education');
  await expect(expSection).toBeVisible();
  await expect(eduSection).toBeVisible();
  await expect(page.locator('#experience #education')).toHaveCount(0);
  await expect(page.locator('#experience-heading')).toHaveText('Experience');
  await expect(page.locator('#education-heading')).toHaveText('Education');
  await expect(expSection).toContainText('Mar 2022 – Jan 2027');
  await expect(eduSection).toContainText('MSc. Cyber-Physical Systems');
  await expect(eduSection).toContainText('BSc. Robotics');

  const gradCap = eduSection.locator('[data-pixel-visual="graduation"]');
  await expect(gradCap).toHaveAttribute('data-in-view', 'false');
  const gradSvg = gradCap.locator('svg');
  await expect(gradSvg).toHaveAttribute('viewBox', '0 0 23 15');
  await expect(gradSvg).toHaveAttribute('width', '46');
  await expect(gradSvg).toHaveAttribute('height', '30');
  await expect(gradSvg).toHaveAttribute('shape-rendering', 'crispEdges');
  await expect(gradSvg.locator('.pv-cap-tassel')).toHaveCount(1);
  await gradCap.scrollIntoViewIfNeeded();
  await expect(gradCap).toHaveAttribute('data-in-view', 'true', { timeout: 1500 });

  // Richer 220x88 (2x integer scale) pixel-art figurines + off-screen IntersectionObserver pause
  for (const [projId, kind] of [
    ['proj-flutter', 'pipeline'],
    ['proj-quadyx', 'uav'],
    ['proj-electrocasnicu', 'retrieval'],
  ] as const) {
    const pvWrap = page.locator(`#${projId} [data-pixel-visual="${kind}"]`);
    const pvSvg = pvWrap.locator('svg.pv-svg');
    await expect(pvSvg).toHaveAttribute('viewBox', '0 0 110 44');
    await expect(pvSvg).toHaveAttribute('width', '220');
    await expect(pvSvg).toHaveAttribute('height', '88');
    await expect(pvSvg).toHaveAttribute('shape-rendering', 'crispEdges');
    await pvWrap.scrollIntoViewIfNeeded();
    await expect(pvWrap).toHaveAttribute('data-in-view', 'true', { timeout: 1500 });
    const box = await pvSvg.boundingBox();
    expect(box, `${projId} svg.pv-svg bounding box`).not.toBeNull();
    expect(Math.round(box!.width)).toBe(220);
    expect(Math.round(box!.height)).toBe(88);
  }

  const compactRover = page.locator('#proj-agri-rover [data-pixel-visual="rover"][data-variant="compact"]');
  await compactRover.scrollIntoViewIfNeeded();
  await expect(compactRover).toBeVisible();
  await expect(compactRover).toHaveAttribute('data-in-view', 'true', { timeout: 1500 });
  await expect(compactRover.locator('svg.pv-rover-compact')).toHaveAttribute('viewBox', '0 0 24 10');
  await expect(compactRover.locator('svg.pv-flag-compact')).toHaveAttribute('viewBox', '0 0 7 10');

  // Updated project copy & title order
  await expect(page.locator('#proj-flutter')).toContainText('Robot Process Automation, UiPath');
  await expect(page.locator('#proj-flutter')).not.toContainText('~70% Less Review Time');
  await expect(page.locator('#proj-electrocasnicu h3')).toHaveText(
    'Document RAG Agent — ElectrocasNicu',
  );

  // Drones mode active initially
  const certCarousel = page.locator('#cert-drone-carousel');
  const listPanel = page.locator('#certs-list-panel');
  await expect(certCarousel).toBeVisible();
  await expect(page.locator('#cert-mode-drones')).toHaveAttribute('aria-pressed', 'true');

  // Toggle to List -> shows all 10 certifications & hides drone carousel
  await page.click('#cert-mode-list');
  await expect(page.locator('#cert-mode-list')).toHaveAttribute('aria-pressed', 'true');
  await expect(certCarousel).toBeHidden();
  await expect(listPanel).toBeVisible();

  const expectedCerts = [
    'AWS Certified AI Practitioner',
    'UiPath Advanced RPA Developer',
    'Python & Agentic AI Engineering',
    'Python Development',
    'Fundamentals of Deep Learning',
    "Artificial Intelligence Engineer Master's Program",
    'Deep Learning with TensorFlow',
    'Machine Learning using Python',
    'Machine Learning: Real-time Vehicle License Plate Detection',
    'Python 101 for Data Science',
  ];
  for (const name of expectedCerts) {
    await expect(listPanel.getByText(name, { exact: true })).toBeVisible();
  }

  // Toggle back to Drones -> verify beforematch event reveals #certs-list-panel for Ctrl+F searchability
  await page.click('#cert-mode-drones');
  await expect(certCarousel).toBeVisible();
  await expect(listPanel).toHaveAttribute('hidden', 'until-found');

  await page.evaluate(() => {
    document.getElementById('certs-list-panel')?.dispatchEvent(new Event('beforematch'));
  });
  await expect(listPanel).toBeVisible();
  await expect(page.locator('#cert-mode-list')).toHaveAttribute('aria-pressed', 'true');

  // ATS PDF: HTTP 200, valid PDF, strictly 1 page A4
  const pdfRes = await request.get(`${BASE}/Claudiu-Span-CV.pdf`);
  expect(pdfRes.status()).toBe(200);
  expect(pdfRes.headers()['content-type']).toContain('application/pdf');
  const pdfParsed = await pdfParse(await pdfRes.body());
  expect(pdfParsed.numpages).toBe(1);

  // /llms.txt & /index.md: HTTP 200, synced, zero dead /resume/ or /projects/ links
  const llmsRes = await request.get(`${BASE}/llms.txt`);
  expect(llmsRes.status()).toBe(200);
  const llmsText = await llmsRes.text();
  expect(llmsText).toContain('Mar 2022 – Jan 2027');
  expect(llmsText).toContain('/#experience');
  expect(llmsText).toContain('/#education');
  expect(llmsText).toContain('Robot Process Automation, UiPath');
  expect(llmsText).toContain('Document RAG Agent — ElectrocasNicu');
  expect(llmsText).toContain('Agri-Rover');
  expect(llmsText).not.toMatch(/\/resume\/|\/projects\//);

  const mdRes = await request.get(`${BASE}/index.md`);
  expect(mdRes.status()).toBe(200);
  expect(mdRes.headers()['content-type']).toContain('text/markdown');
  const mdText = await mdRes.text();
  expect(mdText).toContain('Robot Process Automation, UiPath');
  expect(mdText).toContain('Document RAG Agent — ElectrocasNicu');
  expect(mdText).toContain('Agri-Rover');
  expect(mdText).not.toMatch(/\/resume\/|\/projects\//);
});

test('OS-aware theme toggle persists override and clears storage when returning to OS preference', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: 'light',
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  expect(await page.locator('html').getAttribute('data-theme')).toBe('light');
  expect(await page.evaluate(() => localStorage.getItem('claudiu-span-theme-v2'))).toBeNull();

  // Toggle to Dark -> overrides OS
  await page.click('#theme-toggle');
  expect(await page.locator('html').getAttribute('data-theme')).toBe('dark');
  expect(await page.evaluate(() => localStorage.getItem('claudiu-span-theme-v2'))).toBe('dark');

  // Toggle back to Light (matches OS) -> clears localStorage & resets meta to 'light dark'
  await page.click('#theme-toggle');
  expect(await page.locator('html').getAttribute('data-theme')).toBe('light');
  expect(await page.evaluate(() => localStorage.getItem('claudiu-span-theme-v2'))).toBeNull();
  expect(await page.locator('meta[name="color-scheme"]').getAttribute('content')).toBe('light dark');

  await context.close();
});

test('SubscribeForm gracefully surfaces fallback when network is blocked', async ({ page }) => {
  await page.route('https://buttondown.com/**', (route) => route.abort('blockedbyclient'));
  await page.goto(`${BASE}/blog/`, { waitUntil: 'networkidle' });

  await page.fill('#subscribe-email', 'techlead@example.com');
  await page.click('#subscribe-submit');

  await expect(page.locator('#subscribe-feedback')).toContainText(/blocked|timed out/i);
  await expect(page.locator('#subscribe-fallback')).toBeVisible();
});

test('Legacy query parameter & 404 /resume/ and /projects/ routes redirect onto / anchors safely', async ({
  page,
  request,
}) => {
  // Confirm deleted routes return 404.html with 404 status on static server
  const resumeRes = await request.get(`${BASE}/resume/`);
  expect(resumeRes.status()).toBe(404);
  const projectsRes = await request.get(`${BASE}/projects/`);
  expect(projectsRes.status()).toBe(404);

  // Visiting /resume/ and /projects/ in browser redirects to /#experience and /#projects
  await page.goto(`${BASE}/resume/`, { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(new RegExp(`${BASE}/#experience$`));

  await page.goto(`${BASE}/projects/`, { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(new RegExp(`${BASE}/#projects$`));

  await page.goto(`${BASE}/projects/agri-rover/`, { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(new RegExp(`${BASE}/#proj-agri-rover$`));

  // Blocked storage must stay safe on /?category=ai redirect
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('SecurityError: blocked in WebView');
      },
    });
    Object.defineProperty(window, 'sessionStorage', {
      get() {
        throw new Error('SecurityError: blocked in WebView');
      },
    });
  });

  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(`${BASE}/?category=ai`, { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(new RegExp(`${BASE}/#projects$`));
  expect(errors).toEqual([]);
});

test('Right-edge Ceramic Monobloc personal badge, anti-teleport Esc return & Footer Open Badge / Copy Email', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write'],
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  const trigger = page.locator('#personal-badge-trigger');
  await expect(trigger).toBeVisible();

  // Tilted on far-right edge (exposing portrait top corner ~1/3 face without accidental hover across Hero)
  const restBox = await trigger.boundingBox();
  expect(restBox, 'Personal badge trigger bounding box').not.toBeNull();
  const visibleSlice = 1440 - (restBox?.x ?? 1440);
  expect(
    visibleSlice,
    `Docked tilted badge peek (${visibleSlice.toFixed(1)}px) should expose ~1/3 of portrait (105-150px) cleanly on right edge`,
  ).toBeGreaterThanOrEqual(105);
  expect(visibleSlice).toBeLessThanOrEqual(150);

  // Click badge -> 3D arm pulls leftward & opens native <dialog id="personal-badge-dialog">
  const t0 = Date.now();
  await trigger.click();
  const badgeDialog = page.locator('#personal-badge-dialog');
  await expect(badgeDialog).toBeVisible({ timeout: 3000 });
  expect(Date.now() - t0, 'Badge left-pull & dialog open exceeded 3000ms').toBeLessThan(3000);

  // WCAG AA audit while badge modal is open
  const badgeAxe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(badgeAxe.violations).toEqual([]);

  // Verify the 3 pictogram contact controls (Email, LinkedIn, GitHub) and zero phone button
  await expect(badgeDialog.getByRole('button', { name: /Copy email address/i })).toBeVisible();
  await expect(badgeDialog.getByRole('link', { name: /Open LinkedIn profile/i })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/claudiuspan',
  );
  await expect(badgeDialog.getByRole('link', { name: /Open GitHub profile/i })).toHaveAttribute(
    'href',
    'https://github.com/Mr-Span',
  );
  await expect(page.locator('#badge-btn-phone')).toHaveCount(0);

  // Email button copies & reveals address cleanly underneath
  await page.click('#badge-btn-email');
  await expect(page.locator('#badge-contact-readout')).toContainText('clauxspan2002@gmail.com');

  // Escape closes cleanly: verify proxy travels strictly RIGHTWARD (never teleports back to center!) & leaves zero ghost
  await page.keyboard.press('Escape');
  await expect(badgeDialog).not.toBeVisible();

  const proxy = page.locator('#badge-pull-proxy');
  const sampledXs: number[] = [];
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(75);
    const active = await proxy.evaluate((el) => el.classList.contains('active'));
    if (active) {
      const box = await proxy.boundingBox();
      if (box) sampledXs.push(box.x);
    }
  }
  for (let i = 1; i < sampledXs.length; i++) {
    expect(
      sampledXs[i],
      `Returning badge proxy must travel rightward, never snap back toward center (samples: ${sampledXs.map((n) => n.toFixed(1)).join(', ')})`,
    ).toBeGreaterThanOrEqual(sampledXs[i - 1] - 18);
  }

  await expect(trigger).not.toHaveClass(/is-picked|is-hovered|is-grabbing/, { timeout: 2500 });
  await expect(proxy).not.toHaveClass(/active/, { timeout: 1500 });
  await expect(trigger).toHaveCSS('opacity', '1');
  const triggerStillFocused = await trigger.evaluate((el) => document.activeElement === el);
  expect(triggerStillFocused, 'Personal badge trigger should not stay focused after Esc').toBe(false);

  // Regression: interrupting BADGE_RETURNING by clicking a module cleans up proxy/trigger & opens #module-visor cleanly
  await trigger.click();
  await expect(badgeDialog).toBeVisible({ timeout: 3000 });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(50);
  await page.click('[data-station-index="2"]');
  const visor = page.locator('#module-visor');
  await expect(visor).toBeVisible({ timeout: 2000 });
  await expect(proxy).not.toHaveClass(/active/);
  await expect(trigger).not.toHaveClass(/is-picked/);
  await page.keyboard.press('Escape');
  await expect(visor).not.toBeVisible();
  await expect(page.locator('[data-station-index="2"]')).not.toHaveClass(/is-picked|is-grabbing/, {
    timeout: 2500,
  });
  await expect(page.locator('body')).not.toHaveClass(/arm-hoisting/, { timeout: 2500 });

  // Footer Open Badge & Copy Email controls
  const footerOpenBadge = page.locator('#footer-open-badge');
  await footerOpenBadge.scrollIntoViewIfNeeded();
  await expect(footerOpenBadge).toBeVisible();
  await footerOpenBadge.click();
  await expect(badgeDialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(badgeDialog).not.toBeVisible();

  const footerCopyEmail = page.locator('#footer-copy-email');
  await expect(footerCopyEmail).toBeVisible();
  await footerCopyEmail.click();
  await expect(page.locator('#footer-copy-status')).toContainText('Copied');
  await expect(footerCopyEmail).toHaveAttribute('data-copied', 'true');

  await context.close();
});

test('Dark-mode interactive modals (#module-visor & #personal-badge-dialog) pass WCAG 2.1 AA with 0 violations', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  expect(await page.locator('html').getAttribute('data-theme')).toBe('dark');

  const station2 = page.locator('[data-station-index="2"]');
  await station2.click();
  const visor = page.locator('#module-visor');
  await expect(visor).toBeVisible({ timeout: 2000 });
  const darkVisorAxe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(darkVisorAxe.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(visor).not.toBeVisible();
  await expect(station2).not.toHaveClass(/is-picked|is-grabbing/, { timeout: 2500 });

  await page.click('#personal-badge-trigger');
  const badgeDialog = page.locator('#personal-badge-dialog');
  await expect(badgeDialog).toBeVisible({ timeout: 3000 });
  const darkBadgeAxe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(darkBadgeAxe.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(badgeDialog).not.toBeVisible();

  await context.close();
});

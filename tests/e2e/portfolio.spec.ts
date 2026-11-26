import { gzipSync } from 'node:zlib';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

function wireBytes(url: string, buf: Buffer): number {
  if (/\.(woff2?|png|jpe?g|webp|pdf)$/i.test(url)) return buf.length;
  return gzipSync(buf).length;
}

const BASE = '/personal-website';
const ROUTES = [
  `${BASE}/`,
  `${BASE}/projects/`,
  `${BASE}/projects/enterprise-agentic-review/`,
  `${BASE}/resume/`,
  `${BASE}/blog/`,
];

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

test('Desktop showcase: byte-0 H1, < 480 KB transfer, 3D hoist & Quick-Inspect <dialog>, Lens switch, ⌘K & MPA link', async ({
  page,
}) => {
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
  // Top-left claux. logo + zero IK overlay/toggle clutter
  await expect(page.locator('#btn-ik-toggle')).toHaveCount(0);
  await expect(page.locator('#ik-hud-readout')).toHaveCount(0);
  await expect(page.locator('.brand-claux-svg')).toBeVisible();

  const totalKb = transferred.reduce((s, r) => s + r.bytes, 0) / 1024;
  expect(
    totalKb,
    `Desktop initial wire transfer ${totalKb.toFixed(1)} KB exceeded 480 KB`,
  ).toBeLessThan(480);

  // Hover station 2 (QUADYX UAV) and check color-step dimming stays WCAG AA
  await page.hover('[data-station-index="2"]');
  const hoverAxe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(hoverAxe.violations).toEqual([]);

  // Click station 2 -> triggers 3D cobot hoist & opens enlarged native <dialog id="module-visor"> within 1500ms
  const t0 = Date.now();
  await page.click('[data-station-index="2"]');
  const visor = page.locator('#module-visor');
  await expect(visor).toBeVisible({ timeout: 1500 });
  expect(Date.now() - t0, '3D hoist & Visor open exceeded 1500ms').toBeLessThan(1500);
  await expect(visor).toHaveCSS('opacity', '1');
  const visorBox = await visor.boundingBox();
  expect(visorBox?.width ?? 0, 'Enlarged Inspection Visor width should be >= 740px on 1440px desktop').toBeGreaterThanOrEqual(740);

  // Toggle Engineer Deep Dive lens & audit WCAG while visor open
  await page.click('#lens-engineer');
  await expect(page.locator('#lens-engineer')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#visor-panel-body')).toHaveCSS('opacity', '1');
  const visorAxe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(visorAxe.violations).toEqual([]);

  // Keep cursor positioned right over station 2 and press Escape -> cobot places cartridge back & card MUST stay flush
  const station1 = page.locator('[data-station-index="1"]');
  const station2 = page.locator('[data-station-index="2"]');
  const preEscBox2 = await station2.boundingBox();
  if (preEscBox2) {
    await page.mouse.move(preEscBox2.x + preEscBox2.width / 2, preEscBox2.y + preEscBox2.height / 2);
  }
  await page.keyboard.press('Escape');
  await expect(visor).not.toBeVisible();
  await expect(station2).not.toHaveClass(/is-picked|is-hovered|is-grabbing/, { timeout: 2500 });
  const isStillFocused = await station2.evaluate((el) => document.activeElement === el);
  expect(isStillFocused, 'Closed station card should not remain focused after Esc').toBe(false);
  // Wait for CSS transition to settle and verify card #2 sits flush with sibling card #1 (NOT lifted -13px!)
  await page.waitForTimeout(350);
  const box1 = await station1.boundingBox();
  const box2 = await station2.boundingBox();
  expect(
    Math.abs((box2?.y ?? 0) - (box1?.y ?? 0)),
    `Closed card #2 should sit flush with sibling card #1 (got y2=${box2?.y}, y1=${box1?.y})`,
  ).toBeLessThan(3);

  // Re-open station 2 cleanly and verify direct MPA navigation link from Quick-Inspect dialog works
  await page.click('[data-station-index="2"]');
  await expect(visor).toBeVisible({ timeout: 1500 });
  await visor.getByRole('link', { name: /Inspect Interactive Architecture/i }).click();
  await expect(page).toHaveURL(new RegExp(`${BASE}/projects/quadyx-autonomy/$`));

  // Command palette opens with Ctrl+K
  await page.keyboard.press('Control+k');
  await expect(page.locator('#cmd-palette')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#cmd-palette')).not.toBeVisible();
});

test('Mobile 390x844: < 220 KB transfer & ZERO kinematic/Three.js runtime JS requested', async ({
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

  await context.close();
});

test('Resume header navigation, all 10 certifications, drone carousel, Betfair Mar 2022–Jan 2027, ATS PDF & AI endpoints', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  // Homepage organic 2D pixel cargo drone certification carousel + zero Pause buttons & zero random hero drone
  await expect(page.locator('#pixel-drone-flyer')).toHaveCount(0);
  await expect(page.locator('#btn-motion-toggle')).toHaveCount(0);
  await expect(page.locator('#btn-cert-carousel-toggle')).toHaveCount(0);
  const certCarousel = page.locator('#cert-drone-carousel');
  await expect(certCarousel).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Primary navigation' })
    .getByRole('link', { name: 'Resume' })
    .click();
  await expect(page).toHaveURL(new RegExp(`${BASE}/resume/$`));

  await expect(page.getByText('Mar 2022 – Jan 2027')).toBeVisible();
  await expect(page.getByText('AWS Certified AI Practitioner')).toBeVisible();
  await expect(page.getByText('UiPath Advanced RPA Developer')).toBeVisible();
  await expect(page.getByText('Python & Agentic AI Engineering')).toBeVisible();
  await expect(page.getByText('Python Development')).toBeVisible();
  await expect(page.getByText('Fundamentals of Deep Learning')).toBeVisible();
  await expect(page.getByText("Artificial Intelligence Engineer Master's Program")).toBeVisible();
  await expect(page.getByText('Deep Learning with TensorFlow')).toBeVisible();
  await expect(page.getByText('Machine Learning using Python')).toBeVisible();
  await expect(page.getByText('Machine Learning: Real-time Vehicle License Plate Detection')).toBeVisible();
  await expect(page.getByText('Python 101 for Data Science')).toBeVisible();

  const pdfRes = await request.get(`${BASE}/Claudiu-Span-CV.pdf`);
  expect(pdfRes.status()).toBe(200);
  expect(pdfRes.headers()['content-type']).toContain('application/pdf');

  const llmsRes = await request.get(`${BASE}/llms.txt`);
  expect(llmsRes.status()).toBe(200);
  expect(await llmsRes.text()).toContain('Mar 2022 – Jan 2027');

  const mdRes = await request.get(`${BASE}/index.md`);
  expect(mdRes.status()).toBe(200);
  expect(mdRes.headers()['content-type']).toContain('text/markdown');
  expect(await mdRes.text()).toContain('Agri-Rover');
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

test('ArchitectureVisualizer Nominal/Guardrail toggle, Trace Flow, and reduced-motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/projects/enterprise-agentic-review/`, { waitUntil: 'networkidle' });

  const viz = page.locator('[data-architecture-visualizer]');
  await viz.scrollIntoViewIfNeeded();
  await expect(viz).toBeVisible();

  const guardrailBtn = viz.getByRole('button', { name: 'Guardrail / Failure' });
  await guardrailBtn.click();
  await expect(guardrailBtn).toHaveAttribute('aria-pressed', 'true');
  await expect(viz.getByText(/unmasked PII/i)).toBeVisible();

  await viz.getByRole('button', { name: /Trace Flow/i }).click();
  await expect(viz.getByText(/PII Boundary & Schema Gate/i).first()).toBeVisible();
});

test('SubscribeForm gracefully surfaces fallback when network is blocked', async ({ page }) => {
  await page.route('https://buttondown.com/**', (route) => route.abort('blockedbyclient'));
  await page.goto(`${BASE}/blog/`, { waitUntil: 'networkidle' });

  await page.fill('#subscribe-email', 'techlead@example.com');
  await page.click('#subscribe-submit');

  await expect(page.locator('#subscribe-feedback')).toContainText(/blocked|timed out/i);
  await expect(page.locator('#subscribe-fallback')).toBeVisible();
});

test('Legacy v1.0 query parameter redirects to /projects/?category=ai and blocked storage stays safe', async ({
  page,
}) => {
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
  await expect(page).toHaveURL(new RegExp(`${BASE}/projects/\\?category=ai$`));
  expect(errors).toEqual([]);
});

test('Right-edge Ceramic Monobloc personal badge: portrait peek (~1/3 face), robot left-pull <dialog>, 3 pictogram actions & Email copy', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
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
  await expect(badgeDialog).toBeVisible({ timeout: 1500 });
  expect(Date.now() - t0, 'Badge left-pull & dialog open exceeded 1500ms').toBeLessThan(1500);

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
});

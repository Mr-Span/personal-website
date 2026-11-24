import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE = '/personal-website';
const ROUTES = [
  `${BASE}/`,
  `${BASE}/projects/`,
  `${BASE}/projects/enterprise-agentic-review/`,
  `${BASE}/resume/`,
  `${BASE}/blog/`,
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 },
];

for (const vp of VIEWPORTS) {
  for (const theme of ['dark', 'light'] as const) {
    test(`WCAG AA, zero console errors & zero horizontal overflow (${vp.name}, ${theme})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.addInitScript((t) => {
        window.localStorage.setItem('claudiu-span-theme-v2', t);
      }, theme);

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

        // Zero horizontal overflow check
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        );
        expect(overflow, `Horizontal overflow on ${route} (${vp.name})`).toBe(false);

        // WCAG 2.1 AA axe-core audit
        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        expect(
          axe.violations,
          `Axe violations on ${route} (${vp.name}, ${theme}): ${JSON.stringify(axe.violations, null, 2)}`,
        ).toEqual([]);

        expect(errors, `Console/page errors on ${route}`).toEqual([]);
      }
    });
  }
}

test('Resume quick access, all 6 certifications visible, and ATS PDF HTTP 200', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  await page.locator('[data-resume-side-cta]').click();
  await expect(page).toHaveURL(new RegExp(`${BASE}/resume/$`));

  await expect(page.getByText('AWS Certified AI Practitioner')).toBeVisible();
  await expect(page.getByText('UiPath Advanced RPA Developer')).toBeVisible();
  await expect(page.getByText('Python & Agentic AI Engineering')).toBeVisible();
  await expect(page.getByText('Python Development')).toBeVisible();
  await expect(page.getByText('Fundamentals of Deep Learning')).toBeVisible();
  await expect(page.getByText('Artificial Intelligence Program')).toBeVisible();

  const pdfRes = await request.get(`${BASE}/Claudiu-Span-CV.pdf`);
  expect(pdfRes.status()).toBe(200);
  expect(pdfRes.headers()['content-type']).toContain('application/pdf');
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

test('Legacy v1.0 query parameter redirects to /projects/?category=ai and blocked localStorage stays safe', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
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

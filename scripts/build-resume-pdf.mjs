import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { createDistServer } from './serve-dist.mjs';

const distDir = path.resolve(process.cwd(), 'dist');
const rawBase = process.env.BASE_PATH !== undefined ? process.env.BASE_PATH : '/personal-website';
const normBase = !rawBase || rawBase === '/' ? '' : `/${rawBase.replace(/^\/+|\/+$/g, '')}`;

async function main() {
  const resumePrintHtml = path.join(distDir, 'resume-print', 'index.html');
  if (!fs.existsSync(resumePrintHtml)) {
    throw new Error(`Missing internal route ${resumePrintHtml}. Run "pnpm build" first.`);
  }

  const server = createDistServer(distDir, rawBase);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 4323;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const targetUrl = `http://127.0.0.1:${port}${normBase}/resume-print/`;
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    const outPdf = path.join(distDir, 'Claudiu-Span-CV.pdf');
    await page.pdf({
      path: outPdf,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });
    console.log(`Generated ATS PDF: ${outPdf}`);

    // Generate static fallback OG card (1200x630) if custom Google AI Pro OG image not yet added
    const ogOut = path.join(distDir, 'og', 'default.png');
    if (!fs.existsSync(ogOut)) {
      fs.mkdirSync(path.dirname(ogOut), { recursive: true });
      const ogPage = await browser.newPage({ viewport: { width: 1200, height: 630 } });
      await ogPage.setContent(`
        <!doctype html>
        <html>
          <body style="margin:0;width:1200px;height:630px;background:#070B12;color:#F1F5F9;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;padding:72px;box-sizing:border-box;">
            <div style="border:1px solid #1E3250;background:#0D1422;border-radius:24px;padding:56px;width:100%;">
              <div style="color:#38BDF8;font-family:monospace;font-size:20px;letter-spacing:0.12em;text-transform:uppercase;">Applied AI &amp; Automation Systems</div>
              <h1 style="margin:18px 0 12px;font-size:64px;line-height:1.08;">Claudiu Șpan</h1>
              <p style="margin:0 0 36px;color:#94A3B8;font-size:28px;line-height:1.4;">40+ production automation workflows · ~70% operator review cut via Agentic AI · AWS AIF-C01 · QUADYX Autonomy</p>
              <div style="display:flex;gap:16px;font-family:monospace;font-size:18px;">
                <span style="background:#131E33;border:1px solid #2B456B;color:#7DD3FC;padding:10px 18px;border-radius:10px;">Applied AI &amp; RPA</span>
                <span style="background:#131E33;border:1px solid #2B456B;color:#FB7185;padding:10px 18px;border-radius:10px;">Interactive Architectures</span>
                <span style="background:#131E33;border:1px solid #2B456B;color:#34D399;padding:10px 18px;border-radius:10px;">ATS CV &amp; Notes</span>
              </div>
            </div>
          </body>
        </html>
      `);
      await ogPage.screenshot({ path: ogOut });
      console.log(`Generated static OG image: ${ogOut}`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  // Strip internal /resume-print/ before GitHub Pages artifact upload
  fs.rmSync(path.join(distDir, 'resume-print'), { recursive: true, force: true });
  console.log('Removed internal dist/resume-print/ directory.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

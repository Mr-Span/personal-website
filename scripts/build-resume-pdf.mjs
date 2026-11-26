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

    // Generate static v3.0 Warm Ceramic Cleanroom OG card (1200x630)
    const ogOut = path.join(distDir, 'og', 'default.png');
    fs.mkdirSync(path.dirname(ogOut), { recursive: true });
    const ogPage = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await ogPage.setContent(`
      <!doctype html>
      <html lang="en">
        <body style="margin:0;width:1200px;height:630px;padding:36px 42px;box-sizing:border-box;background:#EFECE7;color:#17181B;font-family:'Instrument Sans','IBM Plex Sans',system-ui,-apple-system,'Segoe UI',sans-serif;display:flex;background-image:radial-gradient(rgba(23,24,27,0.08) 1.15px, transparent 1.15px);background-size:26px 26px;">
          <div style="position:relative;flex:1;display:flex;flex-direction:column;justify-content:space-between;padding:42px 52px 36px;border-radius:18px;background:linear-gradient(180deg,#FCFBF9 0%,#F8F6F2 72%,#EFECE7 100%);border:1.5px solid #C5C0B6;box-shadow:0 24px 48px -20px rgba(23,24,27,0.20),0 2px 6px rgba(23,24,27,0.07),inset 0 2px 0 rgba(255,255,255,0.92),inset 0 -2px 4px rgba(23,24,27,0.06);">
            <!-- Machined Top Gripper Pickup Lug -->
            <div style="position:absolute;top:-1.5px;left:50%;transform:translateX(-50%);width:82px;height:13px;border-radius:0 0 7px 7px;background:#1E2129;border:1px solid #101217;border-top:none;box-shadow:0 3px 6px rgba(23,24,27,0.22);display:flex;align-items:center;justify-content:center;">
              <div style="width:36px;height:3.5px;border-radius:2px;background:#B33D0E;"></div>
            </div>

            <!-- Corner Machined Rivets -->
            <span style="position:absolute;top:14px;left:14px;width:5px;height:5px;border-radius:50%;background:rgba(23,24,27,0.22);"></span>
            <span style="position:absolute;top:14px;right:14px;width:5px;height:5px;border-radius:50%;background:rgba(23,24,27,0.22);"></span>
            <span style="position:absolute;bottom:14px;left:14px;width:5px;height:5px;border-radius:50%;background:rgba(23,24,27,0.22);"></span>
            <span style="position:absolute;bottom:14px;right:14px;width:5px;height:5px;border-radius:50%;background:rgba(23,24,27,0.22);"></span>

            <!-- Header Capsule Bar -->
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #D8D4CC;padding-bottom:18px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:34px;height:34px;border-radius:9px;background:linear-gradient(160deg,#252932 0%,#14171D 100%);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 1px 0 rgba(255,255,255,0.18),0 2px 4px rgba(23,24,27,0.22);">
                  <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                    <path d="M12.2 4.2A5.5 5.5 0 1 0 12.2 13.8" stroke="#F8F6F2" stroke-width="2" stroke-linecap="round" />
                    <path d="M9.5 9H15.2" stroke="#CC4B14" stroke-width="1.8" stroke-linecap="round" />
                    <circle cx="9.2" cy="9" r="2.2" fill="#CC4B14" />
                  </svg>
                </div>
                <div style="font-family:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:17px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#17181B;border-bottom:3px solid #B33D0E;padding-bottom:3px;">CLAUDIU ȘPAN</div>
              </div>
              <div style="font-family:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:15px;font-weight:500;color:#52565E;letter-spacing:0.04em;">EU · CLUJ-NAPOCA &amp; SPAIN</div>
            </div>

            <!-- Hero Identity & Signature Subtitle -->
            <div style="padding:10px 0;">
              <div style="display:inline-flex;align-items:center;gap:9px;padding:6px 14px;border-radius:999px;background:#EFECE7;border:1px solid #D8D4CC;font-family:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;font-weight:600;letter-spacing:0.09em;text-transform:uppercase;color:#B33D0E;">
                <span style="width:7px;height:7px;border-radius:50%;background:#B33D0E;display:inline-block;"></span>
                <span>Applied AI · Enterprise Automation · Autonomous Robotics</span>
              </div>
              <h1 style="margin:18px 0 8px;font-size:66px;font-weight:800;line-height:1.03;letter-spacing:-0.036em;color:#17181B;">Claudiu Șpan</h1>
              <div style="margin:0 0 16px;font-size:31px;font-weight:600;line-height:1.18;letter-spacing:-0.025em;color:#3E424A;">Engineering Systems in <span style="color:#52565E;">Motion</span><span style="color:#B33D0E;">.</span></div>
              <p style="margin:0;color:#52565E;font-family:'IBM Plex Sans',system-ui,-apple-system,sans-serif;font-size:20px;line-height:1.45;max-width:960px;">40+ production automation workflows · ~70% operator review-time cut via Agentic AI · QUADYX UAV Autonomy · Agri-Rover · 6 Verified Certifications</p>
            </div>

            <!-- Bottom Machined Telemetry Footer -->
            <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #D8D4CC;padding-top:16px;font-family:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:15px;">
              <span style="color:#025F92;font-weight:600;">Interactive 3D Hardware Showcase · System Architectures · ATS PDF · /llms.txt</span>
              <span style="color:#52565E;">github.com/Mr-Span</span>
            </div>
          </div>
        </body>
      </html>
    `);
    await ogPage.screenshot({ path: ogOut });
    console.log(`Generated static v3.0 Warm Ceramic Cleanroom OG image: ${ogOut}`);
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

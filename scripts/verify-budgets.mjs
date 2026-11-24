import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const distDir = path.resolve(process.cwd(), 'dist');

const REQUIRED_ARTIFACTS = [
  '.nojekyll',
  '404.html',
  'rss.xml',
  'robots.txt',
  'build-info.json',
  'Claudiu-Span-CV.pdf',
  'index.html',
  path.join('projects', 'index.html'),
  path.join('resume', 'index.html'),
  path.join('blog', 'index.html'),
];

function walkFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

function main() {
  for (const rel of REQUIRED_ARTIFACTS) {
    const full = path.join(distDir, rel);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required artifact in dist/: ${rel}`);
    }
  }

  if (fs.existsSync(path.join(distDir, 'resume-print'))) {
    throw new Error('Internal dist/resume-print/ directory must be deleted before upload.');
  }

  const allFiles = walkFiles(distDir);
  const totalBytes = allFiles.reduce((sum, f) => sum + fs.statSync(f).size, 0);
  const maxDistBytes = 30 * 1024 * 1024;
  if (totalBytes > maxDistBytes) {
    throw new Error(`Total dist/ size ${(totalBytes / 1024 / 1024).toFixed(2)} MB exceeds 30 MB cap.`);
  }

  // Optional Google AI Pro media file caps (if present)
  const checks = [
    { rel: path.join('media', 'portrait.webp'), maxKb: 80 },
    { rel: path.join('media', 'hero-poster.webp'), maxKb: 80 },
    { rel: path.join('media', 'hero-loop.webm'), maxKb: 400 },
    { rel: path.join('media', 'hero-loop.mp4'), maxKb: 400 },
  ];
  for (const c of checks) {
    const full = path.join(distDir, c.rel);
    if (fs.existsSync(full)) {
      const kb = fs.statSync(full).size / 1024;
      if (kb > c.maxKb) {
        throw new Error(`Media budget exceeded for ${c.rel}: ${kb.toFixed(1)} KB > ${c.maxKb} KB`);
      }
    }
  }

  // Verify total gzipped JS across dist/_astro stays under 150 KB cap
  const jsFiles = allFiles.filter((f) => f.endsWith('.js') || f.endsWith('.mjs'));
  let totalJsGz = 0;
  for (const f of jsFiles) {
    totalJsGz += zlib.gzipSync(fs.readFileSync(f)).length;
  }
  const totalJsGzKb = totalJsGz / 1024;
  if (totalJsGzKb > 150) {
    throw new Error(`Total gzipped JS payload ${totalJsGzKb.toFixed(1)} KB exceeds 150 KB cap.`);
  }

  console.log(
    `Budgets verified: dist=${(totalBytes / 1024).toFixed(1)} KB (< 30 MB), total gzipped JS=${totalJsGzKb.toFixed(1)} KB (<= 150 KB), all required artifacts present.`,
  );
}

main();

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const distDir = path.resolve(process.cwd(), 'dist');

const MAX_DIST_BYTES = 30 * 1024 * 1024;
const MAX_WOFF2_KB = 250;
const MAX_CORE_JS_GZ_KB = 130;
const MAX_LAZY_3D_JS_GZ_KB = 220;

// Desktop-only lazy 3D chunks dynamically imported ONLY at >= 1024px & pointer:fine (0 KB on mobile)
const LAZY_3D_CHUNK_RE = /kinematic-runtime|three|RoundedBoxGeometry|RoomEnvironment/i;
const FORBIDDEN_FONT_SUBSET_RE = /cyrillic|greek|vietnamese/i;

const REQUIRED_ARTIFACTS = [
  '.nojekyll',
  '404.html',
  'rss.xml',
  'robots.txt',
  'llms.txt',
  'index.md',
  'build-info.json',
  'Claudiu-Span-CV.pdf',
  path.join('og', 'default.png'),
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

function formatChunkList(chunks) {
  return [...chunks]
    .sort((a, b) => b.gzKb - a.gzKb)
    .map((c) => `${c.name}=${c.gzKb.toFixed(1)}KB`)
    .join(', ');
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
  if (totalBytes > MAX_DIST_BYTES) {
    throw new Error(`Total dist/ size ${(totalBytes / 1024 / 1024).toFixed(2)} MB exceeds 30 MB cap.`);
  }

  // Verify self-hosted WOFF2 fonts stay lean and contain zero unused Cyrillic/Greek/Vietnamese subsets
  const woffFiles = allFiles.filter((f) => f.endsWith('.woff2'));
  let totalWoffBytes = 0;
  for (const wf of woffFiles) {
    const name = path.basename(wf);
    if (FORBIDDEN_FONT_SUBSET_RE.test(name)) {
      throw new Error(`Forbidden unused font subset emitted into dist/: ${name}`);
    }
    totalWoffBytes += fs.statSync(wf).size;
  }
  const totalWoffKb = totalWoffBytes / 1024;
  if (totalWoffKb > MAX_WOFF2_KB) {
    throw new Error(
      `Total WOFF2 disk payload ${totalWoffKb.toFixed(1)} KB exceeds ${MAX_WOFF2_KB} KB cap.`,
    );
  }

  // Split JS gzip budget checks:
  // (a) Non-3D core app gzipped JS <= 130 KB
  // (b) Desktop-only lazy 3D chunk (kinematic-runtime + any Three.js chunks emitted by Vite) <= 220 KB
  const jsFiles = allFiles.filter((f) => f.endsWith('.js') || f.endsWith('.mjs'));
  const coreChunks = [];
  const lazy3dChunks = [];

  for (const f of jsFiles) {
    const raw = fs.readFileSync(f);
    const gzKb = zlib.gzipSync(raw).length / 1024;
    const entry = {
      name: path.basename(f),
      rawKb: raw.length / 1024,
      gzKb,
    };
    if (LAZY_3D_CHUNK_RE.test(entry.name)) {
      lazy3dChunks.push(entry);
    } else {
      coreChunks.push(entry);
    }
  }

  const coreJsGzKb = coreChunks.reduce((sum, c) => sum + c.gzKb, 0);
  const lazy3dJsGzKb = lazy3dChunks.reduce((sum, c) => sum + c.gzKb, 0);

  if (coreJsGzKb > MAX_CORE_JS_GZ_KB) {
    throw new Error(
      `Non-3D core app gzipped JS payload ${coreJsGzKb.toFixed(1)} KB exceeds ${MAX_CORE_JS_GZ_KB} KB cap (${formatChunkList(coreChunks)}).`,
    );
  }

  if (lazy3dChunks.length === 0) {
    throw new Error(
      'Expected desktop-only lazy 3D chunk (kinematic-runtime / three) in dist/, but found none.',
    );
  }

  if (lazy3dJsGzKb > MAX_LAZY_3D_JS_GZ_KB) {
    throw new Error(
      `Desktop-only lazy 3D gzipped JS payload ${lazy3dJsGzKb.toFixed(1)} KB exceeds ${MAX_LAZY_3D_JS_GZ_KB} KB cap (${formatChunkList(lazy3dChunks)}).`,
    );
  }

  console.log('=== v3.0 Build & Performance Budget Breakdown ===');
  console.log(`  dist/ total   : ${(totalBytes / 1024).toFixed(1)} KB (<= 30720.0 KB)`);
  console.log(
    `  WOFF2 fonts   : ${totalWoffKb.toFixed(1)} KB (<= ${MAX_WOFF2_KB} KB) across ${woffFiles.length} files (0 forbidden subsets)`,
  );
  console.log(
    `  Core JS (gz)  : ${coreJsGzKb.toFixed(1)} KB (<= ${MAX_CORE_JS_GZ_KB} KB) [${formatChunkList(coreChunks)}]`,
  );
  console.log(
    `  Lazy 3D (gz)  : ${lazy3dJsGzKb.toFixed(1)} KB (<= ${MAX_LAZY_3D_JS_GZ_KB} KB, desktop-only) [${formatChunkList(lazy3dChunks)}]`,
  );
  console.log(
    `Budgets verified: coreJS=${coreJsGzKb.toFixed(1)} KB, lazy3D=${lazy3dJsGzKb.toFixed(1)} KB, WOFF2=${totalWoffKb.toFixed(1)} KB, all ${REQUIRED_ARTIFACTS.length} required artifacts present.`,
  );
}

main();

import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
const FORBIDDEN_PATTERNS = [
  { label: 'Local Windows user path', regex: /C:\\Users\\|C:\/Users\//i },
  { label: 'Private OneDrive path', regex: /OneDrive\\Desktop|OneDrive\/Desktop/i },
  { label: 'Raw Google Drive Hub path', regex: /G:\\My Drive\\Antigravity-Hub/i },
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
  if (!fs.existsSync(distDir)) {
    throw new Error(`Missing dist/ directory at ${distDir}`);
  }

  const textExts = new Set(['.html', '.json', '.xml', '.txt', '.css', '.js', '.mjs']);
  const files = walkFiles(distDir).filter((f) => textExts.has(path.extname(f).toLowerCase()));
  const failures = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    for (const rule of FORBIDDEN_PATTERNS) {
      if (rule.regex.test(content)) {
        failures.push(`${path.relative(distDir, file)} matched forbidden pattern: ${rule.label}`);
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(`Content hygiene check failed:\n${failures.join('\n')}`);
  }

  console.log(`Content hygiene verified across ${files.length} built text artifacts (0 leaks).`);
}

main();

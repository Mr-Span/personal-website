import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
const resumePath = path.resolve(process.cwd(), 'src', 'data', 'resume.json');

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

  const textExts = new Set(['.html', '.json', '.xml', '.txt', '.md', '.css', '.js', '.mjs']);
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

  // AI-Native single-source-of-truth drift check (llms.txt + index.md synced to resume.json)
  const resume = JSON.parse(fs.readFileSync(resumePath, 'utf-8'));
  const requiredSyncTokens = [
    resume.profile.name,
    resume.profile.headline,
    resume.profile.location,
    resume.experience[0].period,
    ...resume.certifications.map((c) => c.name),
    'Agri-Rover',
  ];

  for (const aiFile of ['llms.txt', 'index.md']) {
    const fullPath = path.join(distDir, aiFile);
    if (!fs.existsSync(fullPath)) {
      failures.push(`Missing AI-native endpoint: dist/${aiFile}`);
      continue;
    }
    const text = fs.readFileSync(fullPath, 'utf-8');
    for (const token of requiredSyncTokens) {
      if (!text.includes(token)) {
        failures.push(`dist/${aiFile} drifted from resume.json: missing "${token}"`);
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(`Content hygiene & sync check failed:\n${failures.join('\n')}`);
  }

  console.log(
    `Content hygiene & AI-native sync verified across ${files.length} built artifacts (0 leaks, 0 drift).`,
  );
}

main();

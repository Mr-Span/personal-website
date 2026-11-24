import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// Import core lib directly to avoid pdf-parse's top-level test-file quirk in ESM/CLI environments
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

const MAX_BYTES = 300 * 1024;
const REQUIRED_TOKENS = [
  'Claudiu',
  'Betfair',
  '40+',
  '70%',
  'QUADYX',
  'AWS',
  'Technical University of Cluj-Napoca',
  'clauxspan2002@gmail.com',
];

async function main() {
  const pdfPath = path.resolve(process.cwd(), 'dist', 'Claudiu-Span-CV.pdf');
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`Missing ATS PDF at ${pdfPath}`);
  }

  const stat = fs.statSync(pdfPath);
  if (stat.size > MAX_BYTES) {
    throw new Error(`ATS PDF size ${stat.size} bytes exceeds 300 KB limit.`);
  }

  const buf = fs.readFileSync(pdfPath);
  const parsed = await pdfParse(buf);

  if (parsed.numpages < 1 || parsed.numpages > 2) {
    throw new Error(`ATS PDF page count ${parsed.numpages} violates strict 1..2 page ceiling.`);
  }

  const text = parsed.text || '';
  const missing = REQUIRED_TOKENS.filter((tok) => !text.includes(tok));
  if (missing.length > 0) {
    throw new Error(`ATS PDF extracted text is missing required tokens: ${missing.join(', ')}`);
  }

  console.log(
    `ATS PDF verified: ${parsed.numpages} page(s), ${(stat.size / 1024).toFixed(1)} KB, all ${REQUIRED_TOKENS.length} core tokens extracted.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

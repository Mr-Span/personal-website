import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

const MAX_BYTES = 300 * 1024;
const REQUIRED_TOKENS = [
  'Claudiu',
  'Betfair',
  'Mar 2022',
  'Jan 2027',
  '40+',
  '70%',
  'QUADYX',
  'Agri-Rover',
  'Spain',
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

  if (parsed.numpages !== 1) {
    throw new Error(
      `ATS PDF page count ${parsed.numpages} violates strict 1-page A4 target (check print spacing).`,
    );
  }

  const text = parsed.text || '';
  const missing = REQUIRED_TOKENS.filter((tok) => !text.includes(tok));
  if (missing.length > 0) {
    throw new Error(`ATS PDF extracted text is missing required tokens: ${missing.join(', ')}`);
  }

  console.log(
    `ATS PDF verified: ${parsed.numpages} page A4, ${(stat.size / 1024).toFixed(1)} KB, all ${REQUIRED_TOKENS.length} core tokens extracted.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

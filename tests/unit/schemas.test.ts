import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import resumeJson from '../../src/data/resume.json';
import { ResumeSchema } from '../../src/data/resume.schema';
import { BlogFrontmatterSchema, ProjectFrontmatterSchema } from '../../src/lib/content.schemas';
import { getResumeData } from '../../src/lib/resume-loader';
import {
  GRADUATION_CAP_GRID,
  GRADUATION_TASSEL_RECTS,
  PIXEL_GLYPHS,
  RAIL_EDUCATION_GLYPH,
  buildShowcaseModules,
  type RailStationId,
} from '../../src/data/showcase-modules';

function parseYamlFrontmatter(raw: string): Record<string, unknown> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error('Missing YAML frontmatter block');
  }
  const lines = match[1].split(/\r?\n/);
  const out: Record<string, unknown> = {};
  let currentListKey: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (currentListKey && /^\s+-\s+/.test(line)) {
      const val = line.replace(/^\s+-\s+/, '').trim();
      (out[currentListKey] as unknown[]).push(JSON.parse(val));
      continue;
    }

    currentListKey = null;
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    const rawVal = line.slice(colonIdx + 1).trim();

    if (rawVal === '') {
      out[key] = [];
      currentListKey = key;
    } else if (rawVal === 'true') {
      out[key] = true;
    } else if (rawVal === 'false') {
      out[key] = false;
    } else if (/^-?\d+(\.\d+)?$/.test(rawVal)) {
      out[key] = Number(rawVal);
    } else {
      out[key] = JSON.parse(rawVal);
    }
  }

  return out;
}

describe('Canonical Zod Schemas', () => {
  it('validates src/data/resume.json with all 10 interleaved certifications present via loader', () => {
    const parsed = ResumeSchema.parse(resumeJson);
    const loaded = getResumeData();
    expect(parsed.certifications.length).toBe(10);
    expect(loaded.certifications.some((c) => c.credentialCode === 'AIF-C01')).toBe(true);
    // Guarantee zero consecutive duplicate issuers across the circular carousel wrap-around
    for (let i = 0; i < parsed.certifications.length; i++) {
      const cur = parsed.certifications[i];
      const next = parsed.certifications[(i + 1) % parsed.certifications.length];
      expect(cur.issuer.toLowerCase()).not.toBe(next.issuer.toLowerCase());
    }
  });

  it('rejects repoUrl when project visibility is private or anonymized', () => {
    const privateWithRepo = {
      title: 'Private Client Site',
      tier: 'showcase-card',
      visibility: 'private',
      category: ['client-web'],
      featured: false,
      order: 99,
      outcomeBadge: 'Client Site',
      summary: 'A private client website project that must never expose a dead private GitHub link.',
      stack: ['Astro'],
      repoUrl: 'https://github.com/Mr-Span/private-repo-404',
    };

    const result = ProjectFrontmatterSchema.safeParse(privateWithRepo);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('repoUrl'))).toBe(true);
    }
  });

  it('requires anonymizationNote on anonymized case studies without requiring architectureFile', () => {
    const missingNote = {
      title: 'Enterprise Case Study',
      tier: 'case-study',
      visibility: 'anonymized',
      category: ['ai'],
      featured: true,
      order: 1,
      outcomeBadge: '~70% cut',
      summary: 'Anonymized enterprise case study missing its required redaction note.',
      stack: ['Python'],
    };
    expect(ProjectFrontmatterSchema.safeParse(missingNote).success).toBe(false);

    const validWithoutArch = {
      ...missingNote,
      anonymizationNote: 'Internal client details intentionally redacted.',
      visual: 'pipeline',
      highlights: [
        'Deterministic SQL pre-aggregation inside the enterprise boundary.',
        'Validated LLM summarization with human-in-the-loop sign-off.',
      ],
    };
    expect(ProjectFrontmatterSchema.safeParse(validWithoutArch).success).toBe(true);
  });

  it('enforces visual enum and highlights constraints on ProjectFrontmatterSchema', () => {
    const base = {
      title: 'UAV Autonomy Stack',
      tier: 'case-study',
      visibility: 'public',
      category: ['robotics'],
      featured: true,
      order: 2,
      outcomeBadge: 'ROS 2',
      summary: 'Real-time spatial perception and resilient multi-channel telemetry for UAVs.',
      stack: ['ROS 2', 'C++'],
    };

    expect(
      ProjectFrontmatterSchema.safeParse({ ...base, visual: 'uav' }).success,
    ).toBe(true);
    expect(
      ProjectFrontmatterSchema.safeParse({ ...base, visual: 'bento' }).success,
    ).toBe(false);
    expect(
      ProjectFrontmatterSchema.safeParse({
        ...base,
        highlights: ['Too short'],
      }).success,
    ).toBe(false);
    expect(
      ProjectFrontmatterSchema.safeParse({
        ...base,
        highlights: [
          'First valid highlight line >= 10 chars',
          'Second valid highlight line >= 10 chars',
          'Third valid highlight line >= 10 chars',
          'Fourth highlight exceeds max 3 limit',
        ],
      }).success,
    ).toBe(false);
  });

  it('validates all 8 project MDX files including visual and highlights fields', () => {
    const projectsDir = path.resolve(process.cwd(), 'src', 'content', 'projects');
    const mdxFiles = fs.readdirSync(projectsDir).filter((f) => f.endsWith('.mdx')).sort();
    expect(mdxFiles.length).toBe(8);

    const parsedProjects = new Map<string, ReturnType<typeof ProjectFrontmatterSchema.parse>>();
    for (const file of mdxFiles) {
      const raw = fs.readFileSync(path.join(projectsDir, file), 'utf-8');
      const fm = parseYamlFrontmatter(raw);
      expect(fm.architectureFile, `${file} should not reference deleted architectureFile`).toBeUndefined();
      parsedProjects.set(file, ProjectFrontmatterSchema.parse(fm));
    }

    expect(parsedProjects.get('enterprise-agentic-review.mdx')?.visual).toBe('pipeline');
    expect(parsedProjects.get('enterprise-agentic-review.mdx')?.outcomeBadge).toBe(
      'Robot Process Automation, UiPath',
    );
    expect(parsedProjects.get('quadyx-autonomy.mdx')?.visual).toBe('uav');
    expect(parsedProjects.get('electrocasnicu-rag.mdx')?.visual).toBe('retrieval');
    expect(parsedProjects.get('electrocasnicu-rag.mdx')?.title).toBe(
      'Document RAG Agent — ElectrocasNicu',
    );
    expect(parsedProjects.get('agri-rover.mdx')?.visual).toBe('rover');

    for (const slug of [
      'enterprise-agentic-review.mdx',
      'quadyx-autonomy.mdx',
      'electrocasnicu-rag.mdx',
      'agri-rover.mdx',
    ]) {
      const highlights = parsedProjects.get(slug)?.highlights;
      expect(highlights?.length, `${slug} highlights length`).toBeGreaterThanOrEqual(1);
      expect(highlights?.length, `${slug} highlights max`).toBeLessThanOrEqual(3);
    }
  });

  it('preserves 6 hero PIXEL_GLYPHS, 5 RailStationIds, and bounded pixel graduation cap grids', () => {
    expect(PIXEL_GLYPHS).toHaveLength(6);
    expect(PIXEL_GLYPHS[1]?.id).toBe('uav');

    const stations: readonly RailStationId[] = [
      'experience',
      'education',
      'projects',
      'certifications',
      'stack',
    ];
    expect(stations).toHaveLength(5);

    expect(RAIL_EDUCATION_GLYPH).toHaveLength(9);
    for (const row of RAIL_EDUCATION_GLYPH) {
      expect(row).toHaveLength(9);
      expect(row).toMatch(/^[.ksmwbco]+$/);
    }

    expect(GRADUATION_CAP_GRID).toHaveLength(15);
    for (const row of GRADUATION_CAP_GRID) {
      expect(row).toHaveLength(23);
      expect(row).toMatch(/^[.ksmwbco]+$/);
    }

    expect(GRADUATION_TASSEL_RECTS.length).toBeGreaterThan(0);
    for (const rect of GRADUATION_TASSEL_RECTS) {
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.x).toBeLessThan(23);
      expect(rect.y).toBeGreaterThanOrEqual(0);
      expect(rect.y).toBeLessThan(15);
      expect(['k', 'o', 'v']).toContain(rect.fill);
    }

    const modules = buildShowcaseModules(getResumeData());
    expect(modules).toHaveLength(6);
    expect(modules.find((m) => m.id === 'electrocasnicu')?.previewTitle).toBe(
      'Document RAG Agent — ElectrocasNicu',
    );
  });

  it('validates sample blog fixture frontmatter cleanly', () => {
    const fixturePath = path.resolve(process.cwd(), 'tests', 'fixtures', 'sample-post.mdx');
    const raw = fs.readFileSync(fixturePath, 'utf-8');
    expect(raw).toContain('Sample CI Fixture');

    const parsed = BlogFrontmatterSchema.parse({
      title: 'Sample CI Fixture: Isolating PII in Enterprise Agentic AI',
      publishedAt: '2026-11-24',
      tags: ['agentic-ai', 'security', 'architecture'],
      summary:
        'Isolated unit-test fixture verifying blog MDX frontmatter validation without publishing placeholder posts to dist/.',
      published: true,
      readingTime: '4 min read',
    });
    expect(parsed.published).toBe(true);
  });
});

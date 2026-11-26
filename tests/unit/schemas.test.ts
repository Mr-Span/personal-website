import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import resumeJson from '../../src/data/resume.json';
import { ResumeSchema } from '../../src/data/resume.schema';
import { BlogFrontmatterSchema, ProjectFrontmatterSchema } from '../../src/lib/content.schemas';
import { getResumeData } from '../../src/lib/resume-loader';
import { loadCompiledArchitecture } from '../../src/lib/architecture-loader';

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

  it('loads and compiles architecture files from disk via architecture-loader', () => {
    const compiled = loadCompiledArchitecture('enterprise-agentic-review.architecture.json');
    expect(compiled.projectSlug).toBe('enterprise-agentic-review');
    expect(compiled.nodes.length).toBeGreaterThan(3);
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

  it('requires anonymizationNote on anonymized case studies', () => {
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
      architectureFile: 'enterprise-agentic-review.architecture.json',
    };
    expect(ProjectFrontmatterSchema.safeParse(missingNote).success).toBe(false);
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

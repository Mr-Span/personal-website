import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { absoluteUrl, SITE } from '@/data/site';
import { getResumeData } from '@/lib/resume-loader';

export const GET: APIRoute = async () => {
  const resume = getResumeData();
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);

  const lines: string[] = [
    `# ${resume.profile.name} — ${resume.profile.headline}`,
    '',
    `**Location:** ${resume.profile.location}  `,
    `**Email:** ${resume.profile.email}  `,
    `**Web:** ${absoluteUrl('/')} · **ATS PDF:** ${absoluteUrl('/Claudiu-Span-CV.pdf')} · **GitHub:** ${SITE.githubUrl} · **LinkedIn:** ${SITE.linkedinUrl}`,
    '',
    '## Summary',
    resume.profile.summary,
    '',
    '## Key Metrics',
    ...resume.profile.metrics.map((m) => `- **${m.value}** — ${m.label}`),
    '',
    '## Experience',
    ...resume.experience.flatMap((exp) => [
      `### ${exp.role} — ${exp.company}`,
      `*${exp.period} · ${exp.location}*`,
      ...exp.highlights.map((h) => `- ${h.text}`),
      `- **Stack:** ${exp.stack.join(', ')}`,
      '',
    ]),
    '## Selected Projects & Architectures',
    ...projects.flatMap((p) => {
      const slug = p.id.replace(/\.mdx$/, '');
      const details: string[] = [];
      if (p.data.tier === 'case-study') {
        details.push(`Case Study: ${absoluteUrl(`/projects/${slug}/`)}`);
      }
      if (p.data.liveUrl) details.push(`Live: ${p.data.liveUrl}`);
      if (p.data.visibility === 'public' && p.data.repoUrl) {
        details.push(`Source: ${p.data.repoUrl}`);
      }
      return [
        `### ${p.data.title} (${p.data.outcomeBadge})`,
        p.data.summary,
        `- **Stack:** ${p.data.stack.join(', ')}`,
        ...(details.length ? [`- **Links:** ${details.join(' | ')}`] : []),
        '',
      ];
    }),
    '## Education',
    ...resume.education.flatMap((ed) => [
      `### ${ed.degree} — ${ed.institution} (${ed.period})`,
      ...(ed.thesis ? [`- **Thesis:** ${ed.thesis.title} — ${ed.thesis.summary}`] : []),
      '',
    ]),
    `## Verified Certifications (${resume.certifications.length})`,
    ...resume.certifications.map(
      (c) =>
        `- **${c.name}**${c.credentialCode ? ` (${c.credentialCode})` : ''} — ${c.issuer} (${c.issuedDate})`,
    ),
    '',
    '## Technical Stack',
    ...resume.skillGroups.map((g) => `- **${g.title}:** ${g.items.join(', ')}`),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};

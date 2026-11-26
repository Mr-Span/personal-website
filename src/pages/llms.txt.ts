import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { absoluteUrl, SITE } from '@/data/site';
import { getResumeData } from '@/lib/resume-loader';

export const GET: APIRoute = async () => {
  const resume = getResumeData();
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
  const caseStudies = projects.filter((p) => p.data.tier === 'case-study');
  const showcaseProjects = projects.filter((p) => p.data.tier === 'showcase-card');

  const lines: string[] = [
    `# ${resume.profile.name}`,
    '',
    `> ${resume.profile.headline} · ${resume.profile.location}`,
    `> ${resume.profile.summary}`,
    '',
    '## Core Pages',
    `- [Home & Kinematic Portfolio](${absoluteUrl('/')})`,
    `- [Structured Resume & Verified Certifications](${absoluteUrl('/resume/')})`,
    `- [ATS-Clean PDF Resume](${absoluteUrl('/Claudiu-Span-CV.pdf')})`,
    `- [Projects & System Architectures](${absoluteUrl('/projects/')})`,
    `- [Full Markdown CV Mirror](${absoluteUrl('/index.md')})`,
    `- [Engineering Notes & RSS](${absoluteUrl('/blog/')}) (${absoluteUrl('/rss.xml')})`,
    '',
    '## Flagship Case Studies (Interactive Architectures)',
    ...caseStudies.map((p) => {
      const slug = p.id.replace(/\.mdx$/, '');
      const repoSuffix =
        p.data.visibility === 'public' && p.data.repoUrl ? ` | Source: ${p.data.repoUrl}` : '';
      return `- [${p.data.title}](${absoluteUrl(`/projects/${slug}/`)}) — ${p.data.outcomeBadge}. ${p.data.summary}${repoSuffix}`;
    }),
    '',
    '## Completed Robotics, AI & Client Showcase Projects',
    ...showcaseProjects.map((p) => {
      const links: string[] = [];
      if (p.data.liveUrl) links.push(`Live: ${p.data.liveUrl}`);
      if (p.data.visibility === 'public' && p.data.repoUrl) links.push(`Repo: ${p.data.repoUrl}`);
      const linkStr = links.length ? ` (${links.join(' · ')})` : '';
      return `- **${p.data.title}** — ${p.data.outcomeBadge}. ${p.data.summary}${linkStr}`;
    }),
    '',
    '## Verified Experience & Credentials',
    ...resume.experience.map(
      (e) => `- **${e.role} — ${e.company}** (${e.period}, ${e.location})`,
    ),
    ...resume.education.map(
      (ed) => `- **${ed.degree} — ${ed.institution}** (${ed.period})${ed.thesis ? ` — Thesis: ${ed.thesis.title}` : ''}`,
    ),
    `- **Certifications (${resume.certifications.length}):** ${resume.certifications
      .map((c) => `${c.name}${c.credentialCode ? ` (${c.credentialCode})` : ''} — ${c.issuer}, ${c.issuedDate}`)
      .join('; ')}`,
    '',
    '## Contact',
    `- Email: ${resume.profile.email}`,
    `- GitHub: ${SITE.githubUrl}`,
    `- LinkedIn: ${SITE.linkedinUrl}`,
    `- QUADYX: ${SITE.quadyxUrl}`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

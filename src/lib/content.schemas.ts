import { z } from 'zod';

export const ProjectTierSchema = z.enum(['case-study', 'showcase-card']);
export const RepoVisibilitySchema = z.enum(['public', 'private', 'anonymized']);
export const ProjectCategorySchema = z.enum(['ai', 'automation', 'robotics', 'client-web']);

export const ProjectFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    tier: ProjectTierSchema,
    visibility: RepoVisibilitySchema,
    category: z.array(ProjectCategorySchema).min(1),
    featured: z.boolean().default(false),
    order: z.number().int().min(1),
    outcomeBadge: z.string().min(1),
    summary: z.string().min(20),
    stack: z.array(z.string().min(1)).min(1),
    coverAsset: z.string().optional(),
    repoUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    screenshots: z
      .array(
        z.object({
          src: z.string().min(1),
          alt: z.string().min(1),
          caption: z.string().optional(),
        }),
      )
      .optional(),
    anonymizationNote: z.string().min(10).optional(),
    architectureFile: z.string().min(1).optional(),
    visual: z.enum(['pipeline', 'uav', 'retrieval', 'rover']).optional(),
    highlights: z.array(z.string().min(10)).max(3).optional(),
    isSideVenture: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Hard invariant: never publish GitHub links for private or anonymized repos
    if (data.visibility !== 'public' && data.repoUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['repoUrl'],
        message: 'repoUrl is forbidden when visibility is "private" or "anonymized" to prevent dead 404 links and NDA leaks.',
      });
    }

    if (data.visibility === 'anonymized' && !data.anonymizationNote) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['anonymizationNote'],
        message: 'anonymizationNote is required when visibility is "anonymized".',
      });
    }
  });

export const BlogFrontmatterSchema = z.object({
  title: z.string().min(1),
  publishedAt: z.coerce.date(),
  tags: z.array(z.string().min(1)).min(1),
  summary: z.string().min(20),
  published: z.boolean().default(false),
  readingTime: z.string().min(1).default('5 min read'),
});

export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;
export type BlogFrontmatter = z.infer<typeof BlogFrontmatterSchema>;

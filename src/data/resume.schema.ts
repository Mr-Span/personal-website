import { z } from 'zod';

export const MetricSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  includeInPdf: z.boolean(),
});

export const ExperienceHighlightSchema = z.object({
  text: z.string().min(1),
  includeInPdf: z.boolean(),
});

export const ExperienceItemSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  period: z.string().min(1),
  location: z.string().min(1),
  isSideVenture: z.boolean().optional(),
  url: z.string().url().optional(),
  highlights: z.array(ExperienceHighlightSchema).min(1),
  stack: z.array(z.string().min(1)).min(1),
});

export const CourseItemSchema = z.object({
  name: z.string().min(1),
  focus: z.string().min(1),
  projectSummary: z.string().min(1).optional(),
});

export const EducationItemSchema = z.object({
  id: z.string().min(1),
  degree: z.string().min(1),
  institution: z.string().min(1),
  period: z.string().min(1),
  thesis: z
    .object({
      title: z.string().min(1),
      summary: z.string().min(1),
      includeInPdf: z.boolean(),
      projectSlug: z.string().min(1).optional(),
    })
    .optional(),
  courses: z.array(CourseItemSchema).min(1),
});

export const CertificationItemSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    issuer: z.string().min(1),
    issuedDate: z.string().min(4),
    credentialCode: z.string().min(1).optional(),
    verifyUrl: z.string().url().optional(),
    auditedAssetPath: z.string().min(1).optional(),
    domain: z.enum(['ai', 'automation', 'software', 'robotics']),
    includeInPdf: z.boolean(),
  })
  .refine((cert) => Boolean(cert.verifyUrl || cert.auditedAssetPath), {
    message: 'Every certification must provide an official verifyUrl or PII-audited local asset path.',
  });

export const SkillGroupSchema = z.object({
  title: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});

export const ResumeSchema = z.object({
  profile: z.object({
    name: z.string().min(1),
    headline: z.string().min(1),
    location: z.string().min(1),
    pdfLocation: z.string().min(1).optional(),
    email: z.string().email(),
    links: z.object({
      github: z.string().url(),
      linkedin: z.string().url(),
      website: z.string().url(),
    }),
    summary: z.string().min(20),
    metrics: z.array(MetricSchema).min(2),
  }),
  experience: z.array(ExperienceItemSchema).min(1),
  education: z.array(EducationItemSchema).min(1),
  certifications: z.array(CertificationItemSchema).min(6),
  skillGroups: z.array(SkillGroupSchema).min(1),
});

export type ResumeData = z.infer<typeof ResumeSchema>;

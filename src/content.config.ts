import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { ProjectFrontmatterSchema, BlogFrontmatterSchema } from './lib/content.schemas';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: ProjectFrontmatterSchema,
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: BlogFrontmatterSchema,
});

export const collections = { projects, blog };

import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { SITE, withBase } from '@/data/site';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog'))
    .filter((p) => p.data.published)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  return rss({
    title: `${SITE.name} — Engineering Notes`,
    description: 'Applied AI, enterprise automation, RAG systems, and autonomous robotics engineering notes.',
    site: context.site ?? SITE.siteUrl,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.summary,
      link: withBase(`/blog/${post.id.replace(/\.mdx$/, '')}/`),
    })),
    customData: '<language>en-us</language>',
  });
}

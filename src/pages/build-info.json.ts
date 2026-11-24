import type { APIRoute } from 'astro';
import { SITE, absoluteUrl } from '@/data/site';

export const GET: APIRoute = () => {
  return new Response(
    JSON.stringify(
      {
        commitSha: SITE.buildSha,
        builtAt: SITE.builtAt,
        siteUrl: absoluteUrl('/'),
      },
      null,
      2,
    ),
    {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    },
  );
};

import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const rawSite = process.env.SITE_URL || 'https://mr-span.github.io';
const rawBase = process.env.BASE_PATH !== undefined ? process.env.BASE_PATH : '/personal-website';
const normalizedBase =
  rawBase === '' || rawBase === '/'
    ? '/'
    : `/${rawBase.replace(/^\/+|\/+$/g, '')}`;

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  site: rawSite.replace(/\/+$/, ''),
  base: normalizedBase,
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/resume-print/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
      wrap: false,
    },
  },
});

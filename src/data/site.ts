export const SITE = {
  name: 'Claudiu Șpan',
  shortName: 'CȘ',
  role: 'Applied AI & Automation Engineer',
  tagline:
    'Building production Agentic AI workflows, enterprise RPA pipelines, and autonomous robotics systems.',
  location: 'Cluj-Napoca, Romania',
  email: 'clauxspan2002@gmail.com',
  githubUrl: 'https://github.com/Mr-Span',
  repoUrl: 'https://github.com/Mr-Span/personal-website',
  linkedinUrl: 'https://www.linkedin.com/in/claudiuspan',
  quadyxUrl: 'https://quadyx.com/',
  clauxWorkshopUrl: 'https://mr-span.github.io/claux-cv/',
  siteUrl: (import.meta.env.SITE || 'https://mr-span.github.io').replace(/\/+$/, ''),
  basePath: (import.meta.env.BASE_URL || '/').replace(/\/+$/, ''),
  /**
   * Public Buttondown form action URL (zero private secrets).
   * Replace handle with live Buttondown username when account is activated.
   */
  buttondown: {
    username: import.meta.env.PUBLIC_BUTTONDOWN_USERNAME || 'claudiuspan',
    get formAction(): string {
      return `https://buttondown.com/api/emails/embed-subscribe/${this.username}`;
    },
    get hostedUrl(): string {
      return `https://buttondown.com/${this.username}`;
    },
  },
  cfBeaconToken: import.meta.env.PUBLIC_CF_BEACON_TOKEN || '',
  buildSha: process.env.GITHUB_SHA?.slice(0, 7) || 'local-dev',
  builtAt: new Date().toISOString(),
} as const;

/**
 * Resolves an internal path respecting BASE_PATH (works cleanly for both
 * Stage A `/personal-website/` and Stage B custom domain root `/`).
 */
export function withBase(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!SITE.basePath || SITE.basePath === '/') {
    return cleanPath;
  }
  return `${SITE.basePath}${cleanPath}`;
}

export function absoluteUrl(path: string): string {
  return `${SITE.siteUrl}${withBase(path)}`;
}

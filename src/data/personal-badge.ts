import { SITE, withBase } from './site';

export interface PersonalBadgeConfig {
  portraitSrc: string;
  portraitAlt: string;
  languagesLine: string;
  /** Opening personal line shown before the paragraph break on the badge. */
  bioIntro: string;
  /** Strictly personal bio (character/temperament — zero work/project copy). Edit freely later. */
  bio: string;
  hobbies: readonly string[];
  softSkills: readonly string[];
  email: string;
  linkedinUrl: string;
  githubUrl: string;
}

/** Shared C2 trapezoidal silhouette + C3 embossed retro running-stitch vector geometry */
export const BADGE_SVG_PATHS = {
  viewBox: '0 0 264 366',
  /** C2 taller trapezoidal crown + square lower ceramic monobloc + stadium lanyard punch */
  monoblocEvenOdd:
    'M92 3 H172 Q181 3 187 13 L253 63 Q261 69 261 79 V353 Q261 363 251 363 H13 Q3 363 3 353 V79 Q3 69 11 63 L77 13 Q83 3 92 3 Z M112 16 H152 A4.5 4.5 0 0 1 152 25 H112 A4.5 4.5 0 0 1 112 16 Z',
  /** C3 embossed recessed stitch groove + terracotta running-stitch contour matching C2 shape */
  stitchContour:
    'M94 11 H170 Q177 11 182 18 L245 66 Q253 72 253 81 V350 Q253 355 248 355 H16 Q11 355 11 350 V81 Q11 72 19 66 L82 18 Q87 11 94 11 Z',
  /** Exact punched stadium lanyard hole (center at x=132 [50%], y=20.5 [5.60%]) */
  holeContour: 'M112 16 H152 A4.5 4.5 0 0 1 152 25 H112 A4.5 4.5 0 0 1 112 16 Z',
} as const;

export const PERSONAL_BADGE: PersonalBadgeConfig = {
  portraitSrc: withBase('/images/claudiu-badge-portrait.webp'),
  portraitAlt: 'Portrait of Claudiu Șpan',
  languagesLine: 'I speak Romanian, English, and German. Let’s chat!',
  bioIntro:
    'Hi, I’m Claudiu. I keep a calm head, stay curious, and love learning things hands-on.',
  bio: 'Outside of work you’ll find me lifting at the gym, making DIY crafts, unwinding at the piano, or paddleboarding on calm water, anchored by my faith.',
  hobbies: ['Gym', 'DIY & Crafts', 'Piano', 'Paddleboarding'],
  softSkills: ['Curiosity', 'Eager to Learn', 'Calm Focus'],
  email: SITE.email,
  linkedinUrl: SITE.linkedinUrl,
  githubUrl: SITE.githubUrl,
};

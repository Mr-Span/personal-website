import { describe, expect, it } from 'vitest';
import { BADGE_SVG_PATHS, PERSONAL_BADGE } from '../../src/data/personal-badge';

describe('personal-badge config & vector geometry', () => {
  it('stores natural human copy, languages, and non-phone contact links cleanly', () => {
    expect(PERSONAL_BADGE.bioIntro).toContain('Hi, I’m Claudiu');
    expect(PERSONAL_BADGE.bio).toContain('anchored by my faith');
    expect(PERSONAL_BADGE.languagesLine).toContain('Let’s chat!');
    expect(PERSONAL_BADGE.email).toContain('@');
    expect(PERSONAL_BADGE.linkedinUrl).toContain('linkedin.com/in/');
    expect(PERSONAL_BADGE.githubUrl).toContain('github.com/');
  });

  it('preserves C2 monobloc & C3 running-stitch contour coordinates', () => {
    expect(BADGE_SVG_PATHS.monoblocEvenOdd).toContain('M92 3 H172');
    expect(BADGE_SVG_PATHS.stitchContour).toContain('M94 11 H170');
  });
});

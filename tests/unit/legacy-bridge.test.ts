import { describe, expect, it } from 'vitest';
import { resolveLegacyRedirect } from '../../src/lib/legacy-bridge';

describe('resolveLegacyRedirect', () => {
  it('maps v1.0 query categories to /#projects with subpath base', () => {
    expect(resolveLegacyRedirect('', '?category=ai', '/personal-website')).toBe(
      '/personal-website/#projects',
    );
    expect(resolveLegacyRedirect('', '?category=AI', '/personal-website')).toBe(
      '/personal-website/#projects',
    );
    expect(resolveLegacyRedirect('', '?category=robotics', '/')).toBe('/#projects');
  });

  it('maps legacy #credentials and #skills hashes to single-page anchors', () => {
    expect(resolveLegacyRedirect('#credentials', '', '/')).toBe('/#certifications');
    expect(resolveLegacyRedirect('#skills', '', '/')).toBe('/#stack');
    expect(resolveLegacyRedirect('#credentials', '', '/personal-website')).toBe(
      '/personal-website/#certifications',
    );
    expect(resolveLegacyRedirect('#skills', '', '/personal-website')).toBe(
      '/personal-website/#stack',
    );
  });

  it('returns null for live / anchors (#projects, #experience, #education) and normal visits', () => {
    expect(resolveLegacyRedirect('#projects', '', '/')).toBeNull();
    expect(resolveLegacyRedirect('#experience', '', '/')).toBeNull();
    expect(resolveLegacyRedirect('#education', '', '/')).toBeNull();
    expect(resolveLegacyRedirect('#EDUCATION', '', '/personal-website')).toBeNull();
    expect(resolveLegacyRedirect('', '', '/')).toBeNull();
    expect(resolveLegacyRedirect('#contact', '', '/')).toBeNull();
  });
});

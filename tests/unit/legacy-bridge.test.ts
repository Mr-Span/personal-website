import { describe, expect, it } from 'vitest';
import { resolveLegacyRedirect } from '../../src/lib/legacy-bridge';

describe('resolveLegacyRedirect', () => {
  it('maps v1.0 query categories to /projects/?category=... with subpath base', () => {
    expect(resolveLegacyRedirect('', '?category=ai', '/personal-website')).toBe(
      '/personal-website/projects/?category=ai',
    );
  });

  it('maps v1.0 hash anchors cleanly on root custom domain', () => {
    expect(resolveLegacyRedirect('#projects', '', '/')).toBe('/projects/');
    expect(resolveLegacyRedirect('#experience', '', '/')).toBe('/resume/#experience');
    expect(resolveLegacyRedirect('#credentials', '', '/')).toBe('/resume/#certifications');
    expect(resolveLegacyRedirect('#skills', '', '/')).toBe('/resume/#skills');
  });

  it('returns null for normal root visits', () => {
    expect(resolveLegacyRedirect('', '', '/')).toBeNull();
    expect(resolveLegacyRedirect('#contact', '', '/')).toBeNull();
  });
});

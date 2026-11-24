/**
 * Maps legacy v1.0 single-page hash anchors and query parameters
 * (shared on LinkedIn or older CVs) onto v2.0 multi-route destinations.
 */
export function resolveLegacyRedirect(
  hash: string,
  search: string,
  basePath: string,
): string | null {
  const normalizedBase =
    !basePath || basePath === '/' ? '' : `/${basePath.replace(/^\/+|\/+$/g, '')}`;

  const params = new URLSearchParams(search);
  const category = params.get('category');
  if (category && ['all', 'ai', 'automation', 'robotics', 'client-web'].includes(category)) {
    return `${normalizedBase}/projects/?category=${encodeURIComponent(category)}`;
  }

  const normalizedHash = hash.toLowerCase().trim();
  switch (normalizedHash) {
    case '#projects':
      return `${normalizedBase}/projects/`;
    case '#experience':
      return `${normalizedBase}/resume/#experience`;
    case '#skills':
      return `${normalizedBase}/resume/#skills`;
    case '#credentials':
      return `${normalizedBase}/resume/#certifications`;
    default:
      return null;
  }
}

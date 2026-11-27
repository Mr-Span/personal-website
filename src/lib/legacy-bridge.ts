/**
 * Maps legacy v1.0 / v2.0 hash anchors and query parameters
 * (shared on LinkedIn or older CVs) onto single-page destinations on `/`.
 */
export function resolveLegacyRedirect(
  hash: string,
  search: string,
  basePath: string,
): string | null {
  const normalizedBase =
    !basePath || basePath === '/' ? '' : `/${basePath.replace(/^\/+|\/+$/g, '')}`;

  const params = new URLSearchParams(search);
  const category = params.get('category')?.toLowerCase().trim();
  if (category && ['all', 'ai', 'automation', 'robotics', 'client-web'].includes(category)) {
    return `${normalizedBase}/#projects`;
  }

  const normalizedHash = hash.toLowerCase().trim();
  switch (normalizedHash) {
    case '#credentials':
      return `${normalizedBase}/#certifications`;
    case '#skills':
      return `${normalizedBase}/#stack`;
    case '#projects':
    case '#experience':
    case '#education':
    default:
      return null;
  }
}

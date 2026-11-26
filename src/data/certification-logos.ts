export type CertBrandKey = 'aws' | 'simplilearn' | 'uipath' | 'siit' | 'nvidia' | 'veoneer';

export interface CertBrandMeta {
  key: CertBrandKey;
  /** False when the brand wordmark is already explicit inside the logo SVG */
  showIssuerLabel: boolean;
  boxWidth: number;
  boxHeight: number;
  svg: string;
}

export const CERT_BRANDS: Record<CertBrandKey, CertBrandMeta> = {
  aws: {
    key: 'aws',
    showIssuerLabel: false,
    boxWidth: 48,
    boxHeight: 36,
    svg: `<svg width="40" height="24" viewBox="0 0 58 34" fill="none" aria-hidden="true">
      <text x="29" y="18" text-anchor="middle" font-family="var(--family-display),system-ui,sans-serif" font-weight="800" font-size="18" letter-spacing="-0.5" fill="var(--ink-primary)">aws</text>
      <path d="M9 24.5 C20 31.5, 38 31.5, 49 24.5" stroke="#F59E0B" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M44.5 23.2 L50.5 24.1 L47.2 29.2" stroke="#F59E0B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  simplilearn: {
    key: 'simplilearn',
    showIssuerLabel: true,
    boxWidth: 38,
    boxHeight: 38,
    svg: `<svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#0B5ED7"/>
      <path d="M18.2 10.6c-.8-.9-2.2-1.4-4-1.4-2.4 0-4 1.1-4 2.7 0 1.5 1.1 2.2 3.4 2.7l1.4.3c1.3.3 1.9.7 1.9 1.4 0 .9-1 1.5-2.6 1.5-1.5 0-2.7-.5-3.4-1.4l-1.5 1.4c1 1.2 2.7 1.9 4.9 1.9 3 0 4.8-1.4 4.8-3.4 0-1.6-1.1-2.5-3.5-3l-1.4-.3c-1.2-.2-1.8-.6-1.8-1.2 0-.7.8-1.2 2-1.2 1.2 0 2.1.4 2.7 1.1l1.1-1.1z" fill="#FFFFFF"/>
      <circle cx="21.5" cy="7.2" r="2.2" fill="#F97316"/>
    </svg>`,
  },
  uipath: {
    key: 'uipath',
    showIssuerLabel: false,
    boxWidth: 46,
    boxHeight: 36,
    svg: `<svg width="38" height="24" viewBox="0 0 46 26" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="44" height="22" rx="5" fill="#FA4616"/>
      <text x="23" y="17.2" text-anchor="middle" font-family="var(--family-display),system-ui,sans-serif" font-weight="800" font-size="11.5" letter-spacing="-0.3" fill="#FFFFFF">UiPath</text>
    </svg>`,
  },
  siit: {
    key: 'siit',
    showIssuerLabel: true,
    boxWidth: 38,
    boxHeight: 38,
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2"/>
      <path d="M2 19h20"/>
      <path d="m8.5 8.5-2 1.5 2 1.5M15.5 8.5l2 1.5-2 1.5M12.8 7.5l-1.6 5" stroke="var(--accent-vermilion)"/>
    </svg>`,
  },
  nvidia: {
    key: 'nvidia',
    showIssuerLabel: true,
    boxWidth: 38,
    boxHeight: 38,
    svg: `<svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#76B900"/>
      <path d="M5.5 14.5 C8.5 9.8, 16.2 8.2, 22.5 12.2 C19.4 17.8, 12.5 19.8, 7.2 16.5 C10.4 12.2, 16.0 11.4, 19.6 13.5 C17.2 16.2, 13.2 17.0, 10.6 15.2 C12.4 13.4, 15.0 13.3, 16.5 14.2" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  veoneer: {
    key: 'veoneer',
    showIssuerLabel: false,
    boxWidth: 50,
    boxHeight: 36,
    svg: `<svg width="44" height="24" viewBox="0 0 54 26" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="52" height="22" rx="5" fill="#46A29B"/>
      <text x="27" y="16.5" text-anchor="middle" font-family="var(--family-display),system-ui,sans-serif" font-weight="700" font-size="10.5" letter-spacing="-0.2" fill="#0F2020">veoneer</text>
    </svg>`,
  },
};

export function resolveCertBrand(issuer: string): CertBrandMeta {
  const s = issuer.toLowerCase();
  if (s.includes('aws') || s.includes('amazon')) return CERT_BRANDS.aws;
  if (s.includes('simplilearn')) return CERT_BRANDS.simplilearn;
  if (s.includes('uipath')) return CERT_BRANDS.uipath;
  if (s.includes('nvidia')) return CERT_BRANDS.nvidia;
  if (s.includes('veoneer')) return CERT_BRANDS.veoneer;
  return CERT_BRANDS.siit;
}

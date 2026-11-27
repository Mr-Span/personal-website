export interface MotionEnvironment {
  prefersReducedMotion: boolean;
  saveData: boolean;
}

export function getMotionEnvironment(): MotionEnvironment {
  if (typeof window === 'undefined') {
    return { prefersReducedMotion: true, saveData: false };
  }
  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  const saveData = Boolean(nav.connection?.saveData);

  return { prefersReducedMotion, saveData };
}

import { useEffect, useState, type RefObject } from 'react';

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

/**
 * Unified React hook combining IntersectionObserver + document.visibilitychange
 * + prefers-reduced-motion + saveData. Ensures zero offscreen or reduced-motion CPU waste.
 */
export function useMotionActive(ref: RefObject<Element | null>): {
  active: boolean;
  prefersReducedMotion: boolean;
} {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() =>
    getMotionEnvironment().prefersReducedMotion,
  );
  const [inView, setInView] = useState<boolean>(true);
  const [tabVisible, setTabVisible] = useState<boolean>(() =>
    typeof document === 'undefined' ? true : document.visibilityState !== 'hidden',
  );
  const [saveData] = useState<boolean>(() => getMotionEnvironment().saveData);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMqChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', onMqChange);

    const onVisChange = () => setTabVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onVisChange);

    let observer: IntersectionObserver | undefined;
    if (ref.current && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) setInView(entry.isIntersecting);
        },
        { threshold: 0.05 },
      );
      observer.observe(ref.current);
    }

    return () => {
      mq.removeEventListener('change', onMqChange);
      document.removeEventListener('visibilitychange', onVisChange);
      observer?.disconnect();
    };
  }, [ref]);

  return {
    active: !prefersReducedMotion && !saveData && inView && tabVisible,
    prefersReducedMotion,
  };
}

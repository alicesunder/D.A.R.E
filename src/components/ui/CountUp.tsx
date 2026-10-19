import React, { useEffect, useRef, useState } from 'react';

/** Number that counts up when it appears / changes. Respects prefers-reduced-motion. */
export const CountUp: React.FC<{ value: number; duration?: number; locale?: string }> = ({ value, duration = 1100, locale }) => {
  const [n, setN] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const target = Number.isFinite(value) ? value : 0;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setN(target); from.current = target; return; }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(a + (target - a) * eased));
      if (p < 1) raf = requestAnimationFrame(tick); else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{n.toLocaleString(locale)}</>;
};

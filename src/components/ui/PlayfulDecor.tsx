import React from 'react';

const DOODLES: { icon: string; left: string; top: string; d: string; s: string }[] = [
  { icon: '⭐', left: '6%', top: '20%', d: '8s', s: '0s' },
  { icon: '✏️', left: '92%', top: '28%', d: '10s', s: '1s' },
  { icon: '🎈', left: '82%', top: '68%', d: '11s', s: '.5s' },
  { icon: '📚', left: '4%', top: '62%', d: '9s', s: '2s' },
  { icon: '🌈', left: '3%', top: '40%', d: '12s', s: '1.5s' },
  { icon: '🌟', left: '94%', top: '90%', d: '7s', s: '.8s' },
];

/** Decorative floating school doodles. Hidden from assistive tech, ignores pointer events. */
export const PlayfulDecor: React.FC = () => (
  <div className="pf-decor" aria-hidden="true">
    {DOODLES.map(x => (
      <span key={x.icon + x.left} style={{ left: x.left, top: x.top, ['--d' as string]: x.d, ['--s' as string]: x.s }}>{x.icon}</span>
    ))}
  </div>
);

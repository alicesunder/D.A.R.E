/** Global "kids' website" click feedback: jelly squish on the pressed element + a tiny sparkle burst.
 *  Purely visual; skipped for reduced-motion users and disabled controls. */
const TARGET = 'button, a[href], [role="button"], article, .dare-stat-card, .fun-card, .fun-kpi, [class*="cursor-pointer"]';
const SPARKS = ['⭐', '✨', '🎈', '💜', '🌟'];

export function initFunFx() {
  if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('pointerdown', (e) => {
    const el = (e.target as HTMLElement | null)?.closest?.(TARGET) as HTMLElement | null;
    if (!el || (el as HTMLButtonElement).disabled || el.closest('.no-fx')) return;
    el.classList.remove('fun-jelly');
    void el.offsetWidth; // restart animation
    el.classList.add('fun-jelly');
    el.addEventListener('animationend', () => el.classList.remove('fun-jelly'), { once: true });
    if (el.tagName === 'BUTTON' || el.tagName === 'A') {
      for (let i = 0; i < 5; i++) {
        const s = document.createElement('span');
        s.className = 'fun-spark';
        s.textContent = SPARKS[(i + Math.floor(Math.random() * SPARKS.length)) % SPARKS.length];
        const ang = (Math.PI * 2 * i) / 5 + Math.random() * 0.6;
        const dist = 26 + Math.random() * 22;
        s.style.left = `${e.clientX}px`; s.style.top = `${e.clientY}px`;
        s.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
        s.style.setProperty('--dy', `${Math.sin(ang) * dist - 10}px`);
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 750);
      }
    }
  }, { passive: true });
}

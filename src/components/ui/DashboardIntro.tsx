import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CountUp } from './CountUp';

const SEEN_KEY = 'dare_intro_seen_v1';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'ดึกแล้ว ขอบคุณที่ยังทำงานเพื่อเด็กไทย';
  if (h < 12) return 'สวัสดีตอนเช้า ครูแดร์';
  if (h < 17) return 'สวัสดีตอนบ่าย ครูแดร์';
  return 'สวัสดีตอนเย็น ครูแดร์';
};

/** แอนิเมชันเปิดแดชบอร์ด (แสดงครั้งเดียวต่อการเปิดเบราว์เซอร์ — แตะเพื่อข้ามได้ — ข้ามเองถ้าผู้ใช้ตั้งค่า "ลดการเคลื่อนไหว") */
export const DashboardIntro: React.FC<{ teachers: number; schools: number; students: number }> = ({ teachers, schools, students }) => {
  const skip = useMemo(() => {
    try {
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return true;
      return sessionStorage.getItem(SEEN_KEY) === '1';
    } catch { return false; }
  }, []);
  const [phase, setPhase] = useState<'show' | 'leaving' | 'gone'>(skip ? 'gone' : 'show');
  const timers = useRef<number[]>([]);

  const finish = () => {
    if (phase !== 'show') return;
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
    setPhase('leaving');
    timers.current.push(window.setTimeout(() => setPhase('gone'), 850));
  };

  useEffect(() => {
    if (skip) return;
    timers.current.push(window.setTimeout(finish, 4300));
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter') finish(); };
    window.addEventListener('keydown', onKey);
    return () => { timers.current.forEach(clearTimeout); window.removeEventListener('keydown', onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  const sparks = useMemo(() => Array.from({ length: 26 }, (_, i) => {
    const r = (n: number) => { const x = Math.sin(i * 91.7 + n * 17.3) * 10000; return x - Math.floor(x); };
    return { l: `${r(1) * 100}%`, t: `${r(2) * 100}%`, s: 2 + r(3) * 4, dl: `${r(4) * 3}s`, d: `${2 + r(5) * 3}s` };
  }), []);

  if (phase === 'gone') return null;
  const title = 'D.A.R.E. Command Center';
  // Portal: the dashboard's children are transformed by entrance animations, which would break position:fixed.
  return createPortal(
    <div className={`intro ${phase === 'leaving' ? 'leaving' : ''}`} onClick={finish} role="presentation" aria-hidden="true">
      <div className="intro-aurora" />
      {sparks.map((s, i) => <span key={i} className="intro-spark" style={{ left: s.l, top: s.t, width: s.s, height: s.s, ['--dl' as any]: s.dl, ['--t' as any]: s.d }} />)}
      <span className="intro-ring" /><span className="intro-ring" /><span className="intro-ring" />
      <div className="intro-stage">
        <img className="intro-mascot" src="/images/dare-purple-police-elephant.png" alt="" draggable={false} />
        <div className="intro-hello">{greeting()} 👋</div>
        <div className="intro-title">{title.split('').map((ch, k) => <span key={k} style={{ ['--k' as any]: k }}>{ch === ' ' ? '\u00A0' : ch}</span>)}</div>
        <div className="intro-sub">กองบัญชาการตำรวจตระเวนชายแดน · สร้างภูมิคุ้มกันให้เด็กไทย ห่างไกลยาเสพติด</div>
        <div className="intro-stats">
          <div className="intro-stat"><b><CountUp value={teachers} duration={1800} /></b><span>ครู D.A.R.E.</span></div>
          <div className="intro-stat"><b><CountUp value={schools} duration={1800} /></b><span>โรงเรียน</span></div>
          <div className="intro-stat"><b><CountUp value={students} duration={1800} /></b><span>นักเรียนที่ได้เรียนรู้</span></div>
        </div>
        <div className="intro-load"><i /></div>
      </div>
      <div className="intro-skip">แตะที่ใดก็ได้เพื่อข้าม</div>
    </div>,
    document.body
  );
};

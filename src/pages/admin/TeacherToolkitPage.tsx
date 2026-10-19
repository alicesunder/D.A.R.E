import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CURRICULUM, SCENARIOS, REAL_STEPS, buildPlan, planToText } from '../../data/curriculum';
import { Sparkles, Printer, Copy, Play, Pause, RotateCcw, Shuffle, Maximize2, X, Users, Timer, Vote, CheckCircle2, ChevronRight } from 'lucide-react';

const GRADES = ['ป.4', 'ป.5', 'ป.6', 'ม.1'];
const NAMES_KEY = 'dare-class-names-v1';

const beep = () => {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.25, 0.5].forEach(t => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.15, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.22);
    });
  } catch { /* audio may be blocked */ }
};

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/* ---------------- Classroom Mode (full screen) ---------------- */
const ClassMode: React.FC<{ lessonN: number; onClose: () => void }> = ({ lessonN, onClose }) => {
  const lesson = CURRICULUM.find(l => l.n === lessonN) ?? CURRICULUM[0];
  const [total, setTotal] = useState(5 * 60);
  const [left, setLeft] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [scIdx, setScIdx] = useState(Math.max(0, SCENARIOS.findIndex(s => s.id === lesson.scenarioId)));
  const [step, setStep] = useState(0);
  const [namesText, setNamesText] = useState(() => { try { return localStorage.getItem(NAMES_KEY) || ''; } catch { return ''; } });
  const [picked, setPicked] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [noRepeat, setNoRepeat] = useState(true);
  const [votes, setVotes] = useState<Record<string, number>>({ R: 0, E: 0, A: 0, L: 0 });
  const spinRef = useRef<number | null>(null);
  const sc = SCENARIOS[scIdx];
  const names = useMemo(() => namesText.split('\n').map(n => n.trim()).filter(Boolean), [namesText]);

  useEffect(() => { try { localStorage.setItem(NAMES_KEY, namesText); } catch { /* ignore */ } }, [namesText]);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setLeft(v => v - 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  useEffect(() => { if (running && left <= 0) { setRunning(false); setLeft(0); beep(); } }, [left, running]);
  useEffect(() => () => { if (spinRef.current) window.clearInterval(spinRef.current); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === ' ' && tag !== 'TEXTAREA' && tag !== 'INPUT') { e.preventDefault(); setRunning(r => !r); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const setPreset = (m: number) => { setRunning(false); setTotal(m * 60); setLeft(m * 60); };
  const pick = () => {
    if (spinning || names.length === 0) return;
    const pool = noRepeat ? names.filter(n => !picked.includes(n)) : names;
    const source = pool.length ? pool : names;
    if (!pool.length) setPicked([]);
    setSpinning(true);
    let ticks = 0;
    spinRef.current = window.setInterval(() => {
      setCurrent(source[Math.floor(Math.random() * source.length)]);
      ticks++;
      if (ticks > 25) {
        window.clearInterval(spinRef.current!);
        const winner = source[Math.floor(Math.random() * source.length)];
        setCurrent(winner); setSpinning(false);
        setPicked(p => (pool.length ? [...p, winner] : [winner]));
      }
    }, 80);
  };
  const pct = total ? left / total : 0;
  const stepsLabel = ['สถานการณ์', 'D · นิยามปัญหา', 'A · ประเมินทางเลือก', 'R · เลือกทำ', 'E · ทบทวน'];
  const maxVote = Math.max(1, ...Object.values(votes));

  return <div className="fixed inset-0 z-[300] overflow-y-auto bg-gradient-to-br from-[#1a0b36] via-[#3b1a7a] to-[#5b2bb8] p-3 text-white sm:p-6" role="dialog" aria-modal="true" aria-label="โหมดห้องเรียน">
    <div className="mx-auto flex max-w-[1500px] items-center justify-between pb-4">
      <div><p className="text-xs font-bold tracking-widest text-amber-300">CLASSROOM MODE</p><h2 className="text-xl font-black sm:text-2xl">บทที่ {lesson.n}: {lesson.title}</h2></div>
      <button onClick={onClose} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"><X size={16} /> ออก (Esc)</button>
    </div>
    <div className="mx-auto grid max-w-[1500px] gap-4 lg:grid-cols-3">
      {/* Timer */}
      <section className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
        <h3 className="mb-3 flex items-center gap-2 font-bold"><Timer size={18} /> จับเวลากิจกรรม</h3>
        <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="7" />
            <circle cx="50" cy="50" r="44" fill="none" stroke={left <= 30 ? '#fb7185' : '#fcd34d'} strokeWidth="7" strokeLinecap="round" strokeDasharray={2 * Math.PI * 44} strokeDashoffset={2 * Math.PI * 44 * (1 - pct)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <span className={`text-5xl font-black tabular-nums ${left === 0 ? 'animate-pulse text-rose-300' : ''}`}>{fmt(left)}</span>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          {[3, 5, 10, 15].map(m => <button key={m} onClick={() => setPreset(m)} className={`rounded-lg px-3 py-1.5 text-sm font-bold ${total === m * 60 ? 'bg-amber-300 text-[#321653]' : 'bg-white/10 hover:bg-white/20'}`}>{m} นาที</button>)}
        </div>
        <div className="mt-3 flex justify-center gap-2">
          <button onClick={() => { if (left === 0) setLeft(total); setRunning(r => !r); }} className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-5 py-2.5 font-black text-[#321653]">{running ? <><Pause size={16} /> หยุด</> : <><Play size={16} /> เริ่ม</>}</button>
          <button onClick={() => { setRunning(false); setLeft(total); }} aria-label="รีเซ็ตเวลา" className="rounded-xl bg-white/10 px-4 py-2.5 hover:bg-white/20"><RotateCcw size={16} /></button>
        </div>
        <p className="mt-3 text-center text-xs text-white/50">กด Space เพื่อเริ่ม/หยุด</p>
      </section>

      {/* Scenario */}
      <section className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur lg:row-span-2">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold"><Sparkles size={18} /> การ์ดสถานการณ์ ({scIdx + 1}/{SCENARIOS.length})</h3>
          <button onClick={() => { setScIdx(i => (i + 1) % SCENARIOS.length); setStep(0); }} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20"><Shuffle size={13} /> ใบถัดไป</button>
        </div>
        <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-xl">
          <p className="text-xs font-bold text-violet-600">{stepsLabel[step]}</p>
          <h4 className="mt-1 text-xl font-black">{sc.title}</h4>
          <p className="mt-3 leading-7 text-slate-700">{sc.setup}</p>
          {step >= 1 && <div className="mt-4 rounded-xl bg-violet-50 p-3 text-sm"><b className="text-violet-700">D — นิยามปัญหา:</b> {sc.define}</div>}
          {step >= 2 && <div className="mt-3 rounded-xl bg-sky-50 p-3 text-sm"><b className="text-sky-700">A — ประเมินทางเลือก:</b><ul className="mt-1 list-disc space-y-1 pl-5">{sc.assess.map(a => <li key={a}>{a}</li>)}</ul></div>}
          {step >= 3 && <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm"><b className="text-emerald-700">R — เลือกทำ:</b><ul className="mt-1 list-disc space-y-1 pl-5">{sc.respond.map(a => <li key={a}>{a}</li>)}</ul></div>}
          {step >= 4 && <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm"><b className="text-amber-700">E — ทบทวน:</b> {sc.evaluate}</div>}
          <div className="mt-4 flex gap-2">
            <button disabled={step >= 4} onClick={() => setStep(s => Math.min(4, s + 1))} className="inline-flex items-center gap-1 rounded-xl bg-violet-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">เปิดขั้นต่อไป <ChevronRight size={15} /></button>
            {step > 0 && <button onClick={() => setStep(0)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">เริ่มใหม่</button>}
          </div>
        </div>
        <p className="mt-3 text-xs text-white/60">ให้นักเรียนอภิปรายก่อนกดเปิดแต่ละขั้น เพื่อให้คิดเองก่อนเห็นแนวทาง</p>
      </section>

      {/* Picker */}
      <section className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
        <h3 className="mb-3 flex items-center gap-2 font-bold"><Users size={18} /> สุ่มเรียกนักเรียน</h3>
        <div className={`flex h-24 items-center justify-center rounded-2xl bg-white/10 px-3 text-center text-3xl font-black ${spinning ? 'animate-pulse text-amber-200' : 'text-amber-300'}`}>{current || (names.length ? 'พร้อมสุ่ม' : 'ใส่รายชื่อด้านล่าง')}</div>
        <div className="mt-3 flex items-center gap-2">
          <button onClick={pick} disabled={!names.length || spinning} className="flex-1 rounded-xl bg-amber-300 py-2.5 font-black text-[#321653] disabled:opacity-40">สุ่มเลย!</button>
          <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={noRepeat} onChange={e => setNoRepeat(e.target.checked)} /> ไม่ซ้ำคนเดิม</label>
        </div>
        <textarea value={namesText} onChange={e => setNamesText(e.target.value)} rows={4} placeholder="พิมพ์ชื่อเล่นหรือเลขที่ บรรทัดละ 1 คน (ไม่ต้องใช้ชื่อจริง)" className="mt-3 w-full resize-none rounded-xl border border-white/20 bg-white/10 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-amber-300" />
        <p className="mt-1 text-xs text-white/50">เก็บในเครื่องนี้เท่านั้น · เรียกแล้ว {picked.length}/{names.length}</p>
      </section>

      {/* Poll */}
      <section className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur lg:col-span-3">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold"><Vote size={18} /> โหวตสด: ถ้าเป็นเรา จะเลือกวิธีไหน?</h3>
          <button onClick={() => setVotes({ R: 0, E: 0, A: 0, L: 0 })} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">ล้างคะแนน</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {REAL_STEPS.map(s => <div key={s.key} className="rounded-2xl bg-white/10 p-4">
            <div className="flex items-center justify-between"><span className="text-3xl font-black text-amber-300">{s.key}</span><span className="text-sm font-bold">{s.th}</span></div>
            <p className="mt-1 min-h-[2.5rem] text-xs text-white/60">{s.hint}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: `${(votes[s.key] / maxVote) * 100}%` }} /></div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-2xl font-black tabular-nums">{votes[s.key]}</span>
              <div className="flex gap-1">
                <button aria-label={`ลด ${s.th}`} onClick={() => setVotes(v => ({ ...v, [s.key]: Math.max(0, v[s.key] - 1) }))} className="h-8 w-8 rounded-lg bg-white/10 font-black hover:bg-white/20">−</button>
                <button aria-label={`เพิ่ม ${s.th}`} onClick={() => setVotes(v => ({ ...v, [s.key]: v[s.key] + 1 }))} className="h-8 w-8 rounded-lg bg-amber-300 font-black text-[#321653]">+</button>
              </div>
            </div>
          </div>)}
        </div>
      </section>
    </div>
  </div>;
};

/* ---------------- Page ---------------- */
export const TeacherToolkitPage: React.FC = () => {
  const { schools, currentUser } = useApp();
  const [lessonN, setLessonN] = useState(4);
  const [minutes, setMinutes] = useState(50);
  const [grade, setGrade] = useState('ป.5');
  const [students, setStudents] = useState(30);
  const [school, setSchool] = useState('');
  const [classMode, setClassMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const lesson = CURRICULUM.find(l => l.n === lessonN) ?? CURRICULUM[0];
  const plan = useMemo(() => buildPlan(lesson, minutes, grade, students), [lesson, minutes, grade, students]);
  const mine = useMemo(() => {
    const pid = currentUser.personnelId;
    return [...schools].sort((a, b) => Number(!!pid && b.assignedPersonnelIds.includes(pid)) - Number(!!pid && a.assignedPersonnelIds.includes(pid))).slice(0, 400);
  }, [schools, currentUser.personnelId]);
  const teacherName = currentUser.name;

  const copy = async () => {
    try { await navigator.clipboard.writeText(planToText(plan, school, teacherName)); setCopied(true); window.setTimeout(() => setCopied(false), 2500); } catch { window.prompt('คัดลอกข้อความนี้', planToText(plan, school, teacherName)); }
  };
  let acc = 0;

  return <div className="mx-auto w-full max-w-[1500px] space-y-6 pb-10">
    <style>{`@media print{body *{visibility:hidden}.dare-print,.dare-print *{visibility:visible}.dare-print{position:absolute;left:0;top:0;width:100%;box-shadow:none!important;border:0!important}}`}</style>
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#27104d] via-[#5420a4] to-[#8b5cf6] p-6 text-white shadow-xl sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[36px] border-white/10" />
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide"><Sparkles size={14} /> TEACHER TOOLKIT</div>
          <h1 className="text-2xl font-black leading-tight sm:text-4xl">ชุดเครื่องมือครู D.A.R.E.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-purple-100 sm:text-base">สร้างแผนการสอนพร้อมใช้ในไม่กี่คลิก แล้วเปิดโหมดห้องเรียนเต็มจอ — จับเวลา สุ่มเรียกนักเรียน การ์ดสถานการณ์ D-A-R-E และโหวตสดบนกระดานเดียว</p></div>
        <button onClick={() => setClassMode(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ffd66b] px-5 py-3 text-sm font-bold text-[#321653] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#ffe49b]"><Maximize2 size={17} /> เปิดโหมดห้องเรียน</button>
      </div>
    </section>

    <section className="grid gap-4 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm md:grid-cols-5">
      <label className="space-y-1.5 text-sm font-semibold text-slate-700 md:col-span-2">บทเรียน
        <select value={lessonN} onChange={e => setLessonN(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-violet-400">{CURRICULUM.map(l => <option key={l.n} value={l.n}>สัปดาห์ {l.n} — {l.title}</option>)}</select></label>
      <label className="space-y-1.5 text-sm font-semibold text-slate-700">ระดับชั้น
        <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-violet-400">{GRADES.map(g => <option key={g}>{g}</option>)}</select></label>
      <label className="space-y-1.5 text-sm font-semibold text-slate-700">เวลา (นาที)
        <select value={minutes} onChange={e => setMinutes(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-violet-400">{[30, 40, 50, 60].map(m => <option key={m} value={m}>{m}</option>)}</select></label>
      <label className="space-y-1.5 text-sm font-semibold text-slate-700">จำนวนนักเรียน
        <input type="number" min={5} max={60} value={students} onChange={e => setStudents(Math.min(60, Math.max(5, Number(e.target.value) || 5)))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-violet-400" /></label>
      <label className="space-y-1.5 text-sm font-semibold text-slate-700 md:col-span-5">โรงเรียน (ไม่บังคับ)
        <input list="toolkit-schools" value={school} onChange={e => setSchool(e.target.value)} placeholder="พิมพ์ค้นหาชื่อโรงเรียนในทะเบียน" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-violet-400" />
        <datalist id="toolkit-schools">{mine.map(s => <option key={s.id} value={s.name} />)}</datalist></label>
    </section>

    <div className="flex flex-wrap gap-2">
      <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-violet-800"><Printer size={16} /> พิมพ์ / บันทึกเป็น PDF</button>
      <button onClick={copy} className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-bold text-violet-800 hover:bg-violet-100">{copied ? <><CheckCircle2 size={16} /> คัดลอกแล้ว</> : <><Copy size={16} /> คัดลอกส่ง LINE</>}</button>
    </div>

    <article className="dare-print rounded-2xl border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs font-bold tracking-widest text-violet-600">แผนการสอน D.A.R.E. · สัปดาห์ที่ {lesson.n}</p>
        <h2 className="mt-1 text-2xl font-black text-slate-900">{lesson.title}</h2>
        <p className="mt-2 text-sm text-slate-600">{school || 'โรงเรียน: ________'} · ชั้น {grade} · นักเรียน {students} คน · {minutes} นาที · ผู้สอน {teacherName}</p>
        <p className="mt-1 text-sm text-slate-600"><b>จุดเน้น:</b> {lesson.focus}</p>
      </header>
      <ol className="mt-5 space-y-4">
        {plan.sections.map((s, i) => { const start = acc; acc += s.minutes; return <li key={i} className="flex gap-4">
          <div className="w-24 shrink-0 text-right"><div className="text-sm font-black text-violet-700">{start}–{acc} นาที</div><div className="text-xs text-slate-400">({s.minutes} นาที)</div></div>
          <div className="min-w-0 flex-1 border-l-2 border-violet-200 pl-4"><h3 className="font-bold text-slate-900">{s.title}</h3><ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">{s.body.map((b, j) => <li key={j}>{b}</li>)}</ul></div>
        </li>; })}
      </ol>
      <div className="mt-6 grid gap-4 border-t border-slate-200 pt-4 text-sm sm:grid-cols-2">
        <div><h3 className="font-bold text-slate-900">สื่อและอุปกรณ์</h3><ul className="mt-1 list-disc pl-5 text-slate-700">{plan.materials.map(m => <li key={m}>{m}</li>)}</ul></div>
        <div><h3 className="font-bold text-slate-900">ข้อความถึงผู้ปกครอง</h3><p className="mt-1 leading-6 text-slate-700">{lesson.parentNote}</p></div>
      </div>
      <p className="mt-5 text-xs text-slate-400">เอกสารร่างอัตโนมัติจากหลักสูตรตัวอย่าง — ครูควรปรับให้เข้ากับบริบทห้องเรียนและตรวจทานกับหลักสูตรทางการของหน่วยก่อนใช้</p>
    </article>

    {classMode && <ClassMode lessonN={lessonN} onClose={() => setClassMode(false)} />}
  </div>;
};

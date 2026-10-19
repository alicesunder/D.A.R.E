import React, { useMemo, useState } from 'react';
import { Award, Copy, Download, Flame, CheckCircle2 } from 'lucide-react';
import type { TeachingRecord } from '../../services/teachingRecordsService';

const weekStart = (d: Date) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x.getTime();
};
const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const WEEK = 7 * 24 * 3600 * 1000;

export const TeacherInsights: React.FC<{ records: TeachingRecord[] }> = ({ records }) => {
  const [copied, setCopied] = useState(false);

  const s = useMemo(() => {
    const valid = records.filter(r => /^\d{4}-\d{2}-\d{2}$/.test(r.date));
    const students = valid.reduce((a, r) => a + (r.students || 0), 0);
    const approved = valid.filter(r => r.reviewStatus === 'approved').length;
    const schools = new Set(valid.map(r => r.school.trim())).size;
    const thisWeek = weekStart(new Date());
    const weeks = new Set(valid.map(r => weekStart(parse(r.date))));
    let cursor = weeks.has(thisWeek) ? thisWeek : thisWeek - WEEK;
    let streak = 0;
    while (weeks.has(cursor)) { streak++; cursor -= WEEK; }
    const bars = Array.from({ length: 6 }, (_, i) => {
      const w = thisWeek - (5 - i) * WEEK;
      const inWeek = valid.filter(r => weekStart(parse(r.date)) === w);
      return { label: new Date(w).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }), sessions: inWeek.length, students: inWeek.reduce((a, r) => a + r.students, 0) };
    });
    const badges = [
      { name: 'ก้าวแรก', desc: 'บันทึกการสอนครั้งแรก', ok: valid.length >= 1 },
      { name: 'ครูประจำ', desc: 'สอนครบ 5 ครั้ง', ok: valid.length >= 5 },
      { name: 'ร้อยรอยยิ้ม', desc: 'เข้าถึงนักเรียน 100 คน', ok: students >= 100 },
      { name: 'ห้าร้อยพลัง', desc: 'เข้าถึงนักเรียน 500 คน', ok: students >= 500 },
      { name: 'ต่อเนื่อง 3 สัปดาห์', desc: 'สอนติดต่อกัน 3 สัปดาห์', ok: streak >= 3 },
      { name: 'มาตรฐานทอง', desc: 'รายงานอนุมัติ 5 ฉบับ', ok: approved >= 5 },
    ];
    return { valid, students, approved, schools, streak, bars, badges };
  }, [records]);

  const max = Math.max(1, ...s.bars.map(b => b.sessions));

  const copySummary = async () => {
    const now = new Date();
    const month = records.filter(r => { const d = parse(r.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const text = [
      `📊 สรุปผลงานการสอน D.A.R.E. เดือน${now.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}`,
      `• สอนแล้ว ${month.length} ครั้ง | นักเรียน ${month.reduce((a, r) => a + r.students, 0)} คน`,
      `• โรงเรียน: ${[...new Set(month.map(r => r.school))].join(', ') || '-'}`,
      `• ตลอดปี ${s.valid.length} ครั้ง | ${s.students} คน | ${s.schools} โรงเรียน`,
    ].join('\n');
    try { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 2500); } catch { window.prompt('คัดลอกข้อความนี้', text); }
  };

  const exportCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['วันที่', 'โรงเรียน', 'บทเรียน', 'จำนวนนักเรียน', 'สถานะ', 'ผลตรวจ', 'หมายเหตุ'],
      ...records.map(r => [r.date, r.school, r.lesson, r.students, r.status === 'submitted' ? 'ส่งแล้ว' : 'ร่าง', r.reviewStatus ?? '', r.note])];
    const blob = new Blob(['\ufeff' + rows.map(r => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `dare-teaching-records-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(a.href);
  };

  return <section className="grid gap-4 lg:grid-cols-3">
    <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><h2 className="text-lg font-extrabold text-slate-900">ผลงานของฉัน</h2><p className="text-xs text-slate-500">6 สัปดาห์ล่าสุด · นักเรียนที่เข้าถึงรวม {s.students.toLocaleString()} คน · {s.schools} โรงเรียน</p></div>
        <div className="flex gap-2">
          <button onClick={copySummary} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100">{copied ? <><CheckCircle2 size={14} /> คัดลอกแล้ว</> : <><Copy size={14} /> สรุปส่ง LINE</>}</button>
          <button onClick={exportCsv} disabled={!records.length} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100 disabled:opacity-40"><Download size={14} /> ส่งออก CSV</button>
        </div>
      </div>
      <div className="mt-5 flex h-36 items-end gap-3" role="img" aria-label="กราฟจำนวนครั้งที่สอนรายสัปดาห์">
        {s.bars.map(b => <div key={b.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs font-bold text-violet-700">{b.sessions || ''}</span>
          <div className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-fuchsia-400 transition-all" style={{ height: `${Math.max(4, (b.sessions / max) * 100)}%`, opacity: b.sessions ? 1 : 0.2 }} />
          <span className="text-[10px] text-slate-400">{b.label}</span>
        </div>)}
      </div>
    </div>
    <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-slate-900">เหรียญตราความสำเร็จ</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600"><Flame size={14} /> {s.streak} สัปดาห์ติดต่อกัน</span></div>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {s.badges.map(b => <li key={b.name} className={`rounded-xl border p-3 text-xs ${b.ok ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
          <Award size={18} className={b.ok ? 'text-amber-500' : 'text-slate-400'} /><p className="mt-1 font-bold text-slate-800">{b.name}</p><p className="text-slate-500">{b.desc}</p></li>)}
      </ul>
    </div>
  </section>;
};

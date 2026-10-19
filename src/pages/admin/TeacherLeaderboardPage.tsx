import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { CountUp } from '../../components/ui/CountUp';
import { TeacherFace } from '../../components/ui/TeacherAvatar';
import {
  SCORE_RULES, LEVELS, buildMonthlyRanking, buildUnitLeague, displayName, monthKeyOf, realStatsFromActivities,
  shiftMonth, thaiMonthLabel, type RankedTeacher,
} from '../../services/rankingService';
import { downloadCertificate } from '../../utils/certificate';
import {
  ChevronLeft, ChevronRight, Search, Trophy, X, Award, Info, Download, Flame, Users, GraduationCap, School, Sparkles, ChevronDown,
} from 'lucide-react';

const CONFETTI_COLORS = ['#FFD56A', '#FF6FB5', '#A855F7', '#4CC9F0', '#2DD4A8', '#FF9F1C'];

const Confetti: React.FC<{ seed: string }> = ({ seed }) => {
  const pieces = useMemo(() => Array.from({ length: 42 }, (_, i) => {
    const r = (n: number) => { const x = Math.sin(i * 12.9898 + n * 78.233 + seed.length) * 43758.5453; return x - Math.floor(x); };
    return { left: `${r(1) * 100}%`, x: `${(r(2) - 0.5) * 120}px`, d: `${2.6 + r(3) * 2}s`, dl: `${r(4) * 1.4}s`, rot: `${360 + r(5) * 720}deg`, c: CONFETTI_COLORS[i % CONFETTI_COLORS.length] };
  }), [seed]);
  return (
    <div className="lb-confetti" aria-hidden="true" key={seed}>
      {pieces.map((p, i) => <i key={i} style={{ left: p.left, background: p.c, ['--x' as any]: p.x, ['--d' as any]: p.d, ['--dl' as any]: p.dl, ['--r' as any]: p.rot }} />)}
    </div>
  );
};

const Move: React.FC<{ move: number | null }> = ({ move }) => {
  if (move == null) return <span className="lb-move new">ใหม่</span>;
  if (move > 0) return <span className="lb-move up">▲ {move}</span>;
  if (move < 0) return <span className="lb-move down">▼ {Math.abs(move)}</span>;
  return <span className="lb-move same">–</span>;
};

const LevelChip: React.FC<{ t: RankedTeacher }> = ({ t }) => (
  <span className="lb-lv" style={{ background: t.level.current.color }}>{t.level.current.emoji} Lv.{t.level.current.lv}</span>
);

/** ใบรายละเอียดครู (bottom sheet บนมือถือ / กล่องกลางจอบนเดสก์ท็อป) */
const TeacherSheet: React.FC<{ t: RankedTeacher; monthKey: string; isDemo: boolean; onClose: () => void }> = ({ t, monthKey, isDemo, onClose }) => {
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const p = t.person;
  const maxHist = Math.max(1, ...t.history.map(h => h.xp));
  const earned = t.achievements.filter(a => a.earned).length;

  const makeCert = async () => {
    setBusy(true);
    try {
      await downloadCertificate({
        name: displayName(p), unit: p.organizationName, monthLabel: thaiMonthLabel(monthKey), xp: t.xp, rank: t.rank,
        levelName: t.level.current.name, sessions: t.raw.sessions, students: t.raw.taught, isDemo,
      });
    } finally { setBusy(false); }
  };

  return createPortal(
    <div className="lb-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`รายละเอียด ${displayName(p)}`}>
      <div className="lb-sheet" onClick={e => e.stopPropagation()}>
        <div className="relative px-5 pb-4 pt-5 text-white" style={{ background: `linear-gradient(135deg,#2A0F5C,${t.level.current.color})` }}>
          <button onClick={onClose} aria-label="ปิด" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white"><X className="h-5 w-5" /></button>
          <div className="flex items-center gap-4">
            <div className="lb-av" style={{ width: '5rem', height: '5rem' }}><TeacherFace person={p} /></div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-amber-200">อันดับที่ {t.rank} · {thaiMonthLabel(monthKey)}</div>
              <div className="text-lg font-black leading-snug">{displayName(p)}</div>
              <div className="truncate text-xs text-white/80">{p.organizationName}</div>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-5 pt-4">
          <div className="flex items-center gap-4">
            <div className="lb-ring" style={{ ['--p' as any]: t.level.progress, ['--c' as any]: t.level.current.color }}>
              <span><span className="block text-2xl">{t.level.current.emoji}</span><span className="block text-[10px] font-black text-[#2B1B5A]">Lv.{t.level.current.lv}</span></span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-black text-[#2B1B5A]">{t.level.current.name}</div>
              <div className="mt-0.5 text-xs text-[#6B5B8C]">XP เดือนนี้ <b className="text-[#6D28D9]">{t.xp.toLocaleString()}</b> · สะสม 6 เดือน {t.totalXp6m.toLocaleString()}</div>
              {t.level.next
                ? <div className="mt-1 text-[11px] text-[#8B7FA8]">อีก <b>{t.level.toNext.toLocaleString()}</b> XP จะเลื่อนเป็น {t.level.next.emoji} {t.level.next.name}</div>
                : <div className="mt-1 text-[11px] font-bold text-amber-600">เลเวลสูงสุดแล้ว 👑</div>}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-black text-[#2B1B5A]">คะแนนมาจากอะไรบ้าง</div>
            <div className="space-y-2.5">
              {SCORE_RULES.map(rule => {
                const val = t.breakdown[rule.key];
                const max = rule.key === 'training' ? 50 : rule.per * rule.cap;
                return (
                  <div key={rule.key}>
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-bold text-[#4B3F66]">{rule.emoji} {rule.label}</span>
                      <span className="font-black tabular-nums" style={{ color: rule.color }}>+{val.toLocaleString()}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#F1EAFF]"><div className="fun-bar-grow h-full rounded-full" style={{ width: `${Math.min(100, (val / max) * 100)}%`, background: rule.color }} /></div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-black text-[#2B1B5A]"><span>เหรียญรางวัล</span><span className="text-[#8B7FA8]">{earned}/{t.achievements.length}</span></div>
            <div className="grid grid-cols-4 gap-2">
              {t.achievements.map(a => (
                <div key={a.id} className={`lb-badge ${a.earned ? '' : 'locked'}`} title={a.desc}><span className="e">{a.emoji}</span>{a.name}</div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-[#8B7FA8]">แตะค้างที่เหรียญเพื่อดูเงื่อนไข (เหรียญสีเทา = ยังไม่ได้รับ)</p>
          </div>

          <div>
            <div className="mb-2 text-xs font-black text-[#2B1B5A]">XP ย้อนหลัง 6 เดือน</div>
            <div className="lb-spark">
              {t.history.map((h, i) => (
                <div key={h.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <i className={i === t.history.length - 1 ? 'now' : ''} style={{ height: `${(h.xp / maxHist) * 100}%`, width: '100%', animationDelay: `${i * 70}ms` }} title={`${thaiMonthLabel(h.key)}: ${h.xp}`} />
                </div>
              ))}
            </div>
            <div className="mt-1 flex gap-1.5 text-[9px] text-[#8B7FA8]">{t.history.map(h => <span key={h.key} className="flex-1 text-center">{thaiMonthLabel(h.key).split(' ')[0].slice(0, 4)}</span>)}</div>
          </div>

          {t.rank === 1 && (
            <button onClick={makeCert} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFB020] to-[#EC4899] px-5 py-3 text-sm font-black text-white shadow-[0_5px_0_#B4540A66] disabled:opacity-60">
              <Download className="h-4 w-4" /> {busy ? 'กำลังสร้างเกียรติบัตร…' : 'ดาวน์โหลดเกียรติบัตร (PNG)'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export const TeacherLeaderboardPage: React.FC = () => {
  const { personnel, activities, currentUser } = useApp();
  const nowKey = monthKeyOf(new Date());
  const [monthKey, setMonthKey] = useState(nowKey);
  const realThisMonth = useMemo(() => Object.keys(realStatsFromActivities(personnel, activities, monthKey)).length, [personnel, activities, monthKey]);
  const [demo, setDemo] = useState(() => realThisMonth === 0);
  const [unit, setUnit] = useState('ทั้งหมด');
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(15);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  const ranking = useMemo(() => buildMonthlyRanking(personnel, monthKey, { demo, activities }), [personnel, activities, monthKey, demo]);
  const units = useMemo(() => ['ทั้งหมด', ...Array.from(new Set(ranking.map(r => r.person.organizationName).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'th'))], [ranking]);
  const pool = useMemo(() => (unit === 'ทั้งหมด' ? ranking : ranking.filter(r => r.person.organizationName === unit)), [ranking, unit]);
  const q = search.trim().toLowerCase();
  const searching = q.length > 0;
  const matches = useMemo(() => (searching ? pool.filter(r => `${displayName(r.person)} ${r.person.organizationName} ${r.person.policeId}`.toLowerCase().includes(q)) : []), [pool, q, searching]);
  const podium = !searching ? pool.slice(0, 3) : [];
  const list = searching ? matches : pool.slice(3);
  const shown = list.slice(0, visible);
  const maxXp = Math.max(1, pool[0]?.xp || 1);
  const league = useMemo(() => buildUnitLeague(ranking).slice(0, 6), [ranking]);
  const selected = ranking.find(r => r.person.id === selectedId) || null;
  const mine = ranking.find(r => r.person.id === currentUser?.personnelId) || null;

  const totals = useMemo(() => ({
    teachers: ranking.length,
    sessions: ranking.reduce((s, r) => s + r.raw.sessions, 0),
    students: ranking.reduce((s, r) => s + r.raw.taught, 0),
    xp: ranking.reduce((s, r) => s + r.xp, 0),
  }), [ranking]);

  useEffect(() => { setVisible(15); }, [unit, monthKey, demo, search]);

  const canNext = monthKey < nowKey;
  const rankOf = (r: RankedTeacher, i: number, offset: number) => (searching ? r.rank : unit === 'ทั้งหมด' ? r.rank : i + 1 + offset);
  const podiumOrder = podium.length === 3 ? [podium[1], podium[0], podium[2]] : podium;

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-5 pb-10">
      {/* ───── HERO ───── */}
      <section className="lb-hero">
        {['12%:18%', '82%:12%', '70%:60%', '24%:70%', '48%:8%'].map((pos, i) => { const [l, t] = pos.split(':'); return <span key={i} className="lb-star" style={{ left: l, top: t, animationDelay: `${i * 0.6}s` }}>{['✨', '⭐', '✨', '🌟', '✨'][i]}</span>; })}
        {podium.length > 0 && <Confetti seed={`${monthKey}-${demo}-${unit}`} />}
        <div className="relative z-[3] flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-200"><Trophy className="h-4 w-4" /> LEADERBOARD · ระบบจัดอันดับครูแดร์</div>
            <h1 className="mt-1 text-2xl font-black leading-tight sm:text-4xl">ทำเนียบยอดครูแดร์ประจำเดือน</h1>
            <p className="mt-1 hidden max-w-xl text-xs text-white/85 sm:block sm:text-sm">สะสม XP จากการสอน เด็กที่ดูแล และการส่งรายงานตรงเวลา — แข่งกันเลื่อนเลเวล เก็บเหรียญ และชิงตำแหน่งครูแดร์ดีเด่น</p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <button className="lb-iconbtn" onClick={() => setMonthKey(shiftMonth(monthKey, -1))} aria-label="เดือนก่อนหน้า"><ChevronLeft className="h-5 w-5" /></button>
            <div className="min-w-[8.5rem] text-center text-sm font-black">{thaiMonthLabel(monthKey)}</div>
            <button className="lb-iconbtn" onClick={() => setMonthKey(shiftMonth(monthKey, 1))} disabled={!canNext} aria-label="เดือนถัดไป"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="relative z-[3] mt-3 flex flex-wrap items-center gap-2">
          <button className={`lb-pill ${!demo ? 'on' : ''}`} onClick={() => setDemo(false)} aria-pressed={!demo}>📋 ข้อมูลจริงในระบบ</button>
          <button className={`lb-pill ${demo ? 'on' : ''}`} onClick={() => setDemo(true)} aria-pressed={demo}>🎮 ข้อมูลตัวอย่างสาธิต</button>
        </div>
        {demo && <p className="relative z-[3] mt-2 rounded-xl bg-black/20 px-3 py-1.5 text-[10px] leading-snug text-amber-100 sm:hidden">โหมดสาธิต: ตัวเลขการสอนรายเดือนเป็นข้อมูลจำลอง ไม่ใช่ผลงานจริง</p>}
        {demo && <p className="relative z-[3] mt-2 hidden rounded-xl bg-black/20 px-3 py-2 text-[11px] leading-relaxed text-amber-100 sm:block">โหมดสาธิต: จำนวนครั้งที่สอนและนักเรียนรายเดือนเป็นตัวเลขจำลองเพื่อแสดงรูปแบบระบบ (สุ่มคงที่ตามรหัสครู) — ไม่ใช่ผลงานจริง ส่วน "เด็กที่ดูแล / โรงเรียน / ชั่วโมงอบรม" มาจากทะเบียนจริง</p>}
        {!demo && realThisMonth === 0 && <p className="relative z-[3] mt-2 rounded-xl bg-black/20 px-3 py-2 text-[11px] leading-relaxed text-amber-100">เดือนนี้ยังไม่มีกิจกรรมที่อนุมัติและผูกกับครูในทะเบียน อันดับจึงมาจากเด็กที่ดูแล โรงเรียน และชั่วโมงอบรมเท่านั้น — เมื่อมีบันทึกการสอนที่อนุมัติแล้ว คะแนนจะขยับเองอัตโนมัติ</p>}

        <div className="relative z-[3] mt-3 hidden grid-cols-4 gap-2 sm:grid">
          {[
            { Icon: Users, label: 'ครูที่ร่วมจัดอันดับ', v: totals.teachers, u: 'นาย' },
            { Icon: GraduationCap, label: 'ครั้งที่สอนรวม', v: totals.sessions, u: 'ครั้ง' },
            { Icon: School, label: 'นักเรียนที่ได้เรียน', v: totals.students, u: 'คน' },
            { Icon: Sparkles, label: 'XP รวมทั้งหมด', v: totals.xp, u: 'XP' },
          ].map(({ Icon, label, v, u }) => (
            <div key={label} className="rounded-2xl border border-white/25 bg-white/12 px-3 py-2 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/80"><Icon className="h-3.5 w-3.5 text-amber-200" />{label}</div>
              <div className="text-xl font-black tabular-nums"><CountUp value={v} /> <span className="text-[10px] font-semibold text-white/70">{u}</span></div>
            </div>
          ))}
        </div>

        {/* ───── PODIUM ───── */}
        {podium.length > 0 && (
          <div className="lb-podium relative z-[3]" key={`${monthKey}-${demo}-${unit}`}>
            {podiumOrder.map(t => {
              const pr = pool.indexOf(t) + 1;
              return (
                <button key={t.person.id} className={`lb-pod r${pr}`} onClick={() => setSelectedId(t.person.id)} aria-label={`อันดับ ${pr} ${displayName(t.person)} ${t.xp} XP`}>
                  <div className="relative flex flex-col items-center">
                    {pr === 1 && <span className="lb-crown" aria-hidden="true">👑</span>}
                    <div className="lb-pod-av"><TeacherFace person={t.person} /></div>
                  </div>
                  <div className="lb-pod-name">{displayName(t.person)}</div>
                  <div className="lb-pod-unit">{t.person.organizationName}</div>
                  <div className="lb-pod-xp"><CountUp value={t.xp} /><small>XP</small></div>
                  <div className="lb-pod-step">{pr}</div>
                </button>
              );
            })}
          </div>
        )}
        {podium.length === 0 && !searching && <div className="relative z-[3] mt-5 rounded-2xl bg-white/10 p-6 text-center text-sm">ยังไม่มีครูในกลุ่มนี้</div>}
      </section>

      {/* สรุปตัวเลข (มือถือ: ย้ายออกจากส่วนหัวเพื่อให้เห็นโพเดียมก่อน) */}
      <div className="grid grid-cols-4 gap-1.5 sm:hidden">
        {[{ e: '👮', v: totals.teachers, l: 'ครู' }, { e: '🎓', v: totals.sessions, l: 'ครั้งสอน' }, { e: '🧒', v: totals.students, l: 'นักเรียน' }, { e: '✨', v: totals.xp, l: 'XP รวม' }].map(k => (
          <div key={k.l} className="lb-card px-1 py-2 text-center"><div className="text-base leading-none">{k.e}</div><div className="mt-1 text-[13px] font-black tabular-nums text-[#2B1B5A]">{k.v >= 100000 ? `${Math.round(k.v / 1000)}k` : k.v.toLocaleString()}</div><div className="text-[9px] font-bold text-[#8B7FA8]">{k.l}</div></div>
        ))}
      </div>

      {/* ───── MY RANK ───── */}
      {mine && (
        <button onClick={() => setSelectedId(mine.person.id)} className="lb-card flex w-full items-center gap-3 border-amber-300 p-3 text-left" style={{ borderColor: '#FFB020' }}>
          <div className="lb-av"><TeacherFace person={mine.person} /></div>
          <div className="min-w-0 flex-1"><div className="text-xs font-bold text-amber-600">อันดับของฉัน</div><div className="truncate text-sm font-black text-[#2B1B5A]">{displayName(mine.person)}</div></div>
          <div className="text-right"><div className="text-2xl font-black text-[#6D28D9]">#{mine.rank}</div><div className="text-[10px] text-[#8B7FA8]">{mine.xp.toLocaleString()} XP</div></div>
        </button>
      )}

      <div className="grid gap-5 lg:grid-cols-12">
        {/* ───── LIST ───── */}
        <section className="space-y-3 lg:col-span-8">
          <div className="lb-card flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
            <label className="relative block flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B7FA8]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อครู / รหัส / หน่วย…" aria-label="ค้นหาครู" className="fun-field has-icon" />
            </label>
            <select value={unit} onChange={e => setUnit(e.target.value)} aria-label="กรองตามหน่วย" className="fun-field sm:max-w-[15rem]">
              {units.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            {shown.map((t, i) => {
              const isMe = t.person.id === currentUser?.personnelId;
              return (
                <div key={t.person.id} role="button" tabIndex={0} className={`lb-row ${isMe ? 'me' : ''}`} style={{ ['--i' as any]: Math.min(i, 14) }}
                  onClick={() => setSelectedId(t.person.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(t.person.id); } }}>
                  <div className="lb-rank">{rankOf(t, i, 3)}</div>
                  <div className="lb-av"><TeacherFace person={t.person} /></div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <span className="truncate text-[13px] font-black text-[#2B1B5A] sm:text-sm">{displayName(t.person)}</span>
                      <LevelChip t={t} />
                      {isMe && <span className="lb-lv" style={{ background: '#FFB020' }}>ฉัน</span>}
                    </div>
                    <div className="lb-meta"><span>{t.person.organizationName}</span><span>🎓 {t.raw.sessions} ครั้ง</span><span>🧒 {t.raw.taught.toLocaleString()} คน</span><span>🏫 {t.raw.schools}</span></div>
                    <div className="lb-bar"><i style={{ width: `${Math.max(3, (t.xp / maxXp) * 100)}%`, animationDelay: `${Math.min(i, 14) * 35}ms` }} /></div>
                  </div>
                  <div className="lb-xp">{t.xp.toLocaleString()}<small>XP <Move move={t.move} /></small></div>
                </div>
              );
            })}
            {list.length === 0 && <div className="fun-empty"><div className="text-4xl">🔎</div><div className="text-sm font-bold text-[#2B1B5A]">ไม่พบครูที่ตรงกับการค้นหา</div></div>}
          </div>

          {list.length > visible && (
            <div className="text-center"><button onClick={() => setVisible(v => v + 20)} className="fun-more">แสดงเพิ่มอีก 20 คน ({list.length - visible} ที่เหลือ)</button></div>
          )}
        </section>

        {/* ───── SIDE ───── */}
        <aside className="space-y-4 lg:col-span-4">
          <div className="lb-card p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#2B1B5A]"><Flame className="h-4 w-4 text-orange-500" /> ลีกหน่วย (XP เฉลี่ย)</div>
            <div className="space-y-2.5">
              {league.map((u, i) => (
                <div key={u.name}>
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="min-w-0 truncate font-bold text-[#4B3F66]">{['🥇', '🥈', '🥉'][i] || `${i + 1}.`} {u.name}</span>
                    <span className="font-black tabular-nums text-[#6D28D9]">{u.avg.toLocaleString()}</span>
                  </div>
                  <div className="lb-bar"><i style={{ width: `${(u.avg / (league[0]?.avg || 1)) * 100}%`, animationDelay: `${i * 90}ms` }} /></div>
                </div>
              ))}
              {league.length === 0 && <div className="text-xs text-[#8B7FA8]">ยังไม่มีข้อมูลเพียงพอ</div>}
            </div>
            <p className="mt-3 text-[10px] text-[#8B7FA8]">นับเฉพาะหน่วยที่มีครูตั้งแต่ 3 นายขึ้นไป เพื่อความเป็นธรรม</p>
          </div>

          <div className="lb-card p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#2B1B5A]"><Award className="h-4 w-4 text-violet-600" /> เลเวลครูแดร์</div>
            <div className="space-y-1.5">
              {LEVELS.map(l => (
                <div key={l.lv} className="flex items-center gap-2 rounded-xl bg-[#F8F3FF] px-3 py-1.5 text-xs">
                  <span className="text-lg">{l.emoji}</span>
                  <span className="min-w-0 flex-1 truncate font-bold text-[#2B1B5A]">Lv.{l.lv} {l.name}</span>
                  <span className="tabular-nums text-[10px] font-bold text-[#8B7FA8]">{l.min.toLocaleString()}+</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-[#8B7FA8]">เลเวลคิดจาก XP สะสม 6 เดือนล่าสุด</p>
          </div>

          <div className="lb-card p-4">
            <button onClick={() => setRulesOpen(v => !v)} aria-expanded={rulesOpen} className="flex w-full items-center justify-between gap-2 text-left text-sm font-black text-[#2B1B5A]">
              <span className="flex items-center gap-2"><Info className="h-4 w-4 text-sky-500" /> วิธีคิดคะแนน (โปร่งใส)</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${rulesOpen ? 'rotate-180' : ''}`} />
            </button>
            {rulesOpen && (
              <div className="mt-3 space-y-2">
                {SCORE_RULES.map(r => (
                  <div key={r.key} className="flex items-start gap-2 text-[11px]"><span className="text-base leading-none">{r.emoji}</span><div><b className="text-[#2B1B5A]">{r.label}</b><div className="text-[#8B7FA8]">{r.hint}</div></div></div>
                ))}
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-[10px] leading-relaxed text-amber-800">คะแนนเป็นเครื่องมือสร้างแรงจูงใจภายในหน่วย ไม่ใช่ผลประเมินทางราชการ และมีเพดานต่อหมวดเพื่อไม่ให้ครูที่ดูแลโรงเรียนจำนวนมากได้เปรียบเกินจริง</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {selected && <TeacherSheet t={selected} monthKey={monthKey} isDemo={demo} onClose={() => setSelectedId(null)} />}
    </div>
  );
};

/**
 * Phase 25 — ระบบจัดอันดับครู D.A.R.E. ประจำเดือน (เกมมิฟิเคชัน)
 *
 * ไฟล์นี้เป็น "เครื่องคำนวณ" ล้วน ๆ (ไม่แตะ Firebase / ไม่แก้ข้อมูลต้นทาง)
 * - รับ personnel + activities จาก AppContext แล้วคำนวณคะแนน XP, เลเวล, เหรียญ, อันดับ และการขึ้น/ลงของอันดับ
 * - ถ้าเดือนนั้นยังไม่มีบันทึกการสอนจริง จะสลับไปใช้ "ข้อมูลตัวอย่างสาธิต" (deterministic ตาม id ครู — เปิดกี่ครั้งก็ได้ผลเดิม)
 *   และหน้าจอต้องแสดงป้ายบอกชัดเจนว่าเป็นข้อมูลตัวอย่าง
 *
 * ต่อข้อมูลจริงภายหลัง: ส่งค่า `realStats` (Record<personnelId, RealMonthStat>) เข้า buildMonthlyRanking
 * (เช่น อ่านจากคอลเลกชันสรุปรายเดือนที่ Cloud Function เขียนไว้) — สูตรคะแนนไม่ต้องแก้
 */
import type { Activity, Personnel } from '../types';

// ───────────────────────── สูตรคะแนน (แสดงให้ผู้ใช้เห็นในหน้าอันดับด้วย) ─────────────────────────
export const SCORE_RULES = [
  { key: 'sessions', label: 'จำนวนครั้งที่สอน', unit: 'ครั้ง/เดือน', per: 60, cap: 12, emoji: '🎓', color: '#7C3AED', hint: 'ครั้งละ 60 XP (นับสูงสุด 12 ครั้ง)' },
  { key: 'taught', label: 'นักเรียนที่ได้สอนในเดือนนี้', unit: 'คน', per: 0.6, cap: 600, emoji: '🧒', color: '#EC4899', hint: 'คนละ 0.6 XP (นับสูงสุด 600 คน)' },
  { key: 'cared', label: 'เด็กที่ดูแลตามทะเบียน', unit: 'คน', per: 0.4, cap: 500, emoji: '🤝', color: '#0EA5E9', hint: 'คนละ 0.4 XP (นับสูงสุด 500 คน)' },
  { key: 'schools', label: 'โรงเรียนที่รับผิดชอบ', unit: 'แห่ง', per: 40, cap: 6, emoji: '🏫', color: '#F59E0B', hint: 'แห่งละ 40 XP (นับสูงสุด 6 แห่ง)' },
  { key: 'punctual', label: 'ส่งรายงานตรงเวลา', unit: '%', per: 150, cap: 1, emoji: '⏱️', color: '#10B981', hint: 'เต็ม 150 XP เมื่อส่งตรงเวลา 100%' },
  { key: 'streak', label: 'สอนต่อเนื่องหลายเดือน', unit: 'เดือน', per: 25, cap: 6, emoji: '🔥', color: '#EF4444', hint: 'เดือนละ 25 XP (นับสูงสุด 6 เดือน)' },
  { key: 'training', label: 'ชั่วโมงอบรมสะสม', unit: 'ชม.', per: 0.1, cap: 500, emoji: '📚', color: '#6366F1', hint: 'ทุก 10 ชม. ได้ 1 XP (สูงสุด 50 XP)' },
] as const;

export type ScoreKey = typeof SCORE_RULES[number]['key'];
export type ScoreBreakdown = Record<ScoreKey, number>;

export interface RealMonthStat {
  sessions: number;
  taught: number;
  /** 0..1 */
  punctual?: number;
  streak?: number;
}

// ───────────────────────── เลเวล ─────────────────────────
export const LEVELS = [
  { lv: 1, name: 'ครูแดร์ฝึกหัด', emoji: '🐣', min: 0, color: '#94A3B8' },
  { lv: 2, name: 'ครูแดร์หน้าใหม่', emoji: '🌱', min: 1200, color: '#22C55E' },
  { lv: 3, name: 'ครูแดร์ดาวเด่น', emoji: '⭐', min: 3000, color: '#F59E0B' },
  { lv: 4, name: 'ผู้พิทักษ์เยาวชน', emoji: '🛡️', min: 5500, color: '#3B82F6' },
  { lv: 5, name: 'ยอดครูช้างแดร์', emoji: '🐘', min: 8500, color: '#8B5CF6' },
  { lv: 6, name: 'ตำนานแดร์', emoji: '👑', min: 12000, color: '#EAB308' },
] as const;

export function levelFor(totalXp: number) {
  let cur: typeof LEVELS[number] = LEVELS[0];
  for (const l of LEVELS) if (totalXp >= l.min) cur = l;
  const next = LEVELS.find(l => l.lv === cur.lv + 1) ?? null;
  const progress = next ? Math.min(1, (totalXp - cur.min) / (next.min - cur.min)) : 1;
  return { current: cur, next, progress, toNext: next ? Math.max(0, next.min - totalXp) : 0 };
}

// ───────────────────────── เหรียญรางวัล ─────────────────────────
export interface Achievement { id: string; emoji: string; name: string; desc: string; earned: boolean }

export interface MonthContext {
  sessions: number; taught: number; cared: number; schools: number; punctual: number; streak: number; trainingHours: number; badgeLevel?: string;
}

export function achievementsFor(c: MonthContext): Achievement[] {
  return [
    { id: 'tiger', emoji: '🐯', name: 'เสือสอน', desc: 'สอนตั้งแต่ 8 ครั้งในเดือนเดียว', earned: c.sessions >= 8 },
    { id: 'crowd', emoji: '🎤', name: 'ขวัญใจเด็ก ๆ', desc: 'ได้สอนนักเรียนตั้งแต่ 300 คนในเดือนเดียว', earned: c.taught >= 300 },
    { id: 'multi', emoji: '🗺️', name: 'นักเดินทางชายแดน', desc: 'รับผิดชอบตั้งแต่ 4 โรงเรียน', earned: c.schools >= 4 },
    { id: 'punctual', emoji: '⏱️', name: 'รายงานตรงเวลา', desc: 'ส่งรายงานตรงเวลา 95% ขึ้นไป', earned: c.punctual >= 0.95 },
    { id: 'fire', emoji: '🔥', name: 'ไฟไม่มอด', desc: 'สอนต่อเนื่องตั้งแต่ 4 เดือน', earned: c.streak >= 4 },
    { id: 'gold', emoji: '🥇', name: 'เข็มทอง', desc: 'ถือเข็ม D.A.R.E. ระดับทอง', earned: !!c.badgeLevel && c.badgeLevel.includes('ทอง') && !c.badgeLevel.includes('แดง') },
    { id: 'scholar', emoji: '📚', name: 'นักเรียนรู้ตลอดชีวิต', desc: 'ชั่วโมงอบรมสะสม 500 ชม. ขึ้นไป', earned: c.trainingHours >= 500 },
  ];
}

// ───────────────────────── ตัวช่วยเรื่องเดือน ─────────────────────────
const TH_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

export const monthKeyOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
export function thaiMonthLabel(key: string) {
  const [y, m] = key.split('-').map(Number);
  return `${TH_MONTHS[m - 1]} ${y + 543}`;
}
export function shiftMonth(key: string, delta: number) {
  const [y, m] = key.split('-').map(Number);
  return monthKeyOf(new Date(y, m - 1 + delta, 1));
}
export function recentMonthKeys(n: number, from = new Date()) {
  const base = monthKeyOf(from);
  return Array.from({ length: n }, (_, i) => shiftMonth(base, -i));
}

// ───────────────────────── ข้อมูลตัวอย่างสาธิต (deterministic) ─────────────────────────
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967295; // 0..1
}

export function demoMonthStat(p: Personnel, monthKey: string): RealMonthStat {
  const base = hash(p.id + '|skill');              // "ความขยัน" ประจำตัวของครู คงที่ทุกเดือน
  const wobble = hash(p.id + '|' + monthKey);      // ความผันผวนรายเดือน
  const hasSchools = (p.assignedSchoolCount || 0) > 0;
  const activeness = hasSchools ? 0.35 + base * 0.65 : base * 0.35;
  const sessions = Math.max(0, Math.round(activeness * (3 + wobble * 9)));
  const classSize = 18 + Math.round(hash(p.id + '|cls') * 28);
  const taught = sessions * classSize;
  const punctual = Math.min(1, 0.55 + base * 0.45 + (wobble - 0.5) * 0.15);
  return { sessions, taught, punctual: Math.round(punctual * 100) / 100, streak: 0 };
}

// ───────────────────────── ข้อมูลจริงจากกิจกรรมในระบบ ─────────────────────────
export function realStatsFromActivities(personnel: Personnel[], activities: Activity[], monthKey: string): Record<string, RealMonthStat> {
  const out: Record<string, RealMonthStat> = {};
  const done = new Set(['completed', 'approved', 'in_progress']);
  const inMonth = activities.filter(a => a.date?.startsWith(monthKey) && done.has(a.status));
  for (const a of inMonth) {
    for (const p of personnel) {
      const full = `${p.firstName} ${p.lastName}`.replace(/\s+/g, ' ').trim();
      const matched = a.instructorIds?.includes(p.id) || (a.instructorNames || []).some(n => n.replace(/\s+/g, ' ').includes(full));
      if (!matched) continue;
      const cur = out[p.id] || { sessions: 0, taught: 0 };
      cur.sessions += 1; cur.taught += a.studentCount || 0;
      // ตรงเวลา: ส่งรายงานภายใน 3 วันหลังวันสอน
      if (a.reportSubmittedAt) {
        const d = (new Date(a.reportSubmittedAt.replace(' ', 'T')).getTime() - new Date(a.date).getTime()) / 86400000;
        const ok = d <= 3 ? 1 : 0;
        cur.punctual = ((cur.punctual ?? 0) * (cur.sessions - 1) + ok) / cur.sessions;
      }
      out[p.id] = cur;
    }
  }
  return out;
}

// ───────────────────────── คำนวณคะแนน ─────────────────────────
export interface RankedTeacher {
  person: Personnel;
  rank: number;
  prevRank: number | null;
  /** + = ขึ้น, - = ลง, 0 = เท่าเดิม, null = ไม่มีข้อมูลเดือนก่อน */
  move: number | null;
  xp: number;
  breakdown: ScoreBreakdown;
  raw: MonthContext;
  totalXp6m: number;
  level: ReturnType<typeof levelFor>;
  achievements: Achievement[];
  history: { key: string; xp: number }[];
}

const clampPer = (value: number, per: number, cap: number) => Math.min(value, cap) * per;

export function scoreTeacher(p: Personnel, stat: RealMonthStat, streak: number): { xp: number; breakdown: ScoreBreakdown; raw: MonthContext } {
  const punctual = stat.punctual ?? (stat.sessions > 0 ? 1 : 0);
  const b: ScoreBreakdown = {
    sessions: clampPer(stat.sessions, 60, 12),
    taught: clampPer(stat.taught, 0.6, 600),
    cared: clampPer(p.studentCount || 0, 0.4, 500),
    schools: clampPer(p.assignedSchoolCount || 0, 40, 6),
    punctual: Math.round(Math.min(1, punctual) * 150),
    streak: clampPer(streak, 25, 6),
    training: Math.min(50, Math.floor((p.trainingHours || 0) / 10)),
  };
  (Object.keys(b) as ScoreKey[]).forEach(k => { b[k] = Math.round(b[k]); });
  const xp = (Object.values(b) as number[]).reduce((s, v) => s + v, 0);
  return {
    xp, breakdown: b,
    raw: { sessions: stat.sessions, taught: stat.taught, cared: p.studentCount || 0, schools: p.assignedSchoolCount || 0, punctual, streak, trainingHours: p.trainingHours || 0, badgeLevel: p.badgeLevel },
  };
}

export interface RankingOptions {
  /** true = ใช้ข้อมูลตัวอย่างสาธิตแทนบันทึกจริง */
  demo: boolean;
  /** ข้อมูลจริงรายเดือน (ถ้ามีแหล่งอื่นนอกจาก activities) — key = monthKey */
  realByMonth?: Record<string, Record<string, RealMonthStat>>;
  activities?: Activity[];
}

function statFor(p: Personnel, monthKey: string, opts: RankingOptions, personnel: Personnel[]): RealMonthStat {
  if (opts.demo) return demoMonthStat(p, monthKey);
  const external = opts.realByMonth?.[monthKey]?.[p.id];
  if (external) return external;
  const fromAct = actStatsCached(personnel, opts.activities || [], monthKey)[p.id];
  return fromAct || { sessions: 0, taught: 0 };
}

// คำนวณสถิติจากกิจกรรมครั้งเดียวต่อเดือน (ไม่ต้องวนซ้ำทุกครู)
const actCache = new WeakMap<Activity[], Map<string, Record<string, RealMonthStat>>>();
function actStatsCached(personnel: Personnel[], activities: Activity[], monthKey: string) {
  let perMonth = actCache.get(activities);
  if (!perMonth) { perMonth = new Map(); actCache.set(activities, perMonth); }
  let v = perMonth.get(monthKey);
  if (!v) { v = realStatsFromActivities(personnel, activities, monthKey); perMonth.set(monthKey, v); }
  return v;
}

function streakAt(p: Personnel, monthKey: string, opts: RankingOptions, personnel: Personnel[]) {
  let s = 0;
  for (let i = 0; i < 6; i++) {
    const k = shiftMonth(monthKey, -i);
    if (statFor(p, k, opts, personnel).sessions > 0) s++; else break;
  }
  return s;
}

function rankMonth(personnel: Personnel[], monthKey: string, opts: RankingOptions) {
  const rows = personnel.filter(p => p.status === 'active').map(p => {
    const stat = statFor(p, monthKey, opts, personnel);
    const streak = streakAt(p, monthKey, opts, personnel);
    return { p, stat, ...scoreTeacher(p, stat, streak) };
  });
  rows.sort((a, b) => b.xp - a.xp || b.stat.taught - a.stat.taught || (a.p.sourceRow ?? 0) - (b.p.sourceRow ?? 0));
  return rows;
}

export function buildMonthlyRanking(personnel: Personnel[], monthKey: string, opts: RankingOptions): RankedTeacher[] {
  const cur = rankMonth(personnel, monthKey, opts);
  const prevKey = shiftMonth(monthKey, -1);
  const prevRank = new Map(rankMonth(personnel, prevKey, opts).map((r, i) => [r.p.id, i + 1] as const));
  const histKeys = Array.from({ length: 6 }, (_, i) => shiftMonth(monthKey, -(5 - i)));
  const histCache = new Map<string, Map<string, number>>();
  for (const k of histKeys) histCache.set(k, new Map(k === monthKey ? cur.map(r => [r.p.id, r.xp] as const) : rankMonth(personnel, k, opts).map(r => [r.p.id, r.xp] as const)));

  return cur.map((r, i) => {
    const history = histKeys.map(k => ({ key: k, xp: histCache.get(k)!.get(r.p.id) ?? 0 }));
    const totalXp6m = history.reduce((s, h) => s + h.xp, 0);
    const pr = prevRank.get(r.p.id) ?? null;
    return {
      person: r.p, rank: i + 1, prevRank: pr, move: pr == null ? null : pr - (i + 1),
      xp: r.xp, breakdown: r.breakdown, raw: r.raw, totalXp6m,
      level: levelFor(totalXp6m), achievements: achievementsFor(r.raw), history,
    };
  });
}

/** รวมคะแนนระดับหน่วย (เฉลี่ย XP ของครูในหน่วยที่มีอย่างน้อย 3 คน) */
export function buildUnitLeague(ranked: RankedTeacher[]) {
  const map = new Map<string, { name: string; total: number; n: number; top: RankedTeacher }>();
  for (const r of ranked) {
    const k = r.person.organizationName || 'ไม่ระบุหน่วย';
    const cur = map.get(k);
    if (!cur) map.set(k, { name: k, total: r.xp, n: 1, top: r });
    else { cur.total += r.xp; cur.n += 1; if (r.xp > cur.top.xp) cur.top = r; }
  }
  return [...map.values()].filter(u => u.n >= 3).map(u => ({ ...u, avg: Math.round(u.total / u.n) })).sort((a, b) => b.avg - a.avg);
}

export function displayName(p: Personnel) {
  return `${p.rank} ${p.firstName} ${p.lastName}`.replace(/\s+/g, ' ').trim();
}

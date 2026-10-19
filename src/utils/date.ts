/**
 * Date/ID helpers.
 * - Thai users are UTC+7, so `new Date().toISOString()` returns *yesterday's* date
 *   between 00:00 and 06:59 local time. Always use these helpers for "today".
 */
const TZ = 'Asia/Bangkok';

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
});

/** Today's date in Bangkok as YYYY-MM-DD (Gregorian). */
export const todayBangkok = (date: Date = new Date()): string => dateFormatter.format(date);

/** Current Bangkok time as `YYYY-MM-DD HH:mm:ss` (used for audit log timestamps). */
export const nowBangkokStamp = (date: Date = new Date()): string => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
};

/** Thai academic year (B.E.). The Thai school year starts in May. */
export const currentAcademicYearBE = (date: Date = new Date()): string => {
  const [y, m] = todayBangkok(date).split('-').map(Number);
  return String(y + 543 - (m >= 5 ? 0 : 1));
};

/** Collision-safe id (the old `Date.now().slice(-4)` repeated every 10 seconds). */
export const newId = (prefix: string): string => {
  const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${rand}`;
};

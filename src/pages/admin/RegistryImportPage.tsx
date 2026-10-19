import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardList, FileJson, FileSpreadsheet, ShieldAlert, Upload, XCircle } from 'lucide-react';
import {
  REGISTRY_COLLECTIONS,
  validateRegistryDocument,
  type RegistryCollection,
} from '../../services/registryDataSchema';

type ParsedRow = { rowNumber: number; data: unknown };
type RowResult = ParsedRow & { id?: string; valid: boolean; errors: string[]; duplicate: boolean };

const collectionOptions: { value: RegistryCollection; label: string; description: string }[] = [
  { value: 'organizations', label: 'หน่วยงาน', description: 'องค์กรและหน่วยงานในโครงสร้าง ตชด.' },
  { value: 'personnel', label: 'บุคลากร / ครู D.A.R.E.', description: 'ทะเบียนครูและบุคลากร' },
  { value: 'schools', label: 'โรงเรียน', description: 'ทะเบียนสถานศึกษาที่เข้าร่วมโครงการ' },
  { value: 'assignments', label: 'การมอบหมาย', description: 'การจับคู่ครูกับโรงเรียน' },
  { value: 'activities', label: 'กิจกรรม', description: 'กิจกรรมและรายงานการดำเนินงาน' },
  { value: 'news', label: 'ข่าวและสื่อ', description: 'ข่าวประชาสัมพันธ์และสื่อ' },
];

function parseCsv(text: string): Record<string, unknown>[] {
  const lines: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      row.push(field); field = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(cell => cell.trim() !== '')) lines.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some(cell => cell.trim() !== '')) lines.push(row);
  if (lines.length < 2) throw new Error('CSV ต้องมีแถวหัวตารางและข้อมูลอย่างน้อย 1 แถว');
  const headers = lines[0].map(h => h.trim().replace(/^\uFEFF/, ''));
  if (headers.some(h => !h)) throw new Error('พบชื่อคอลัมน์ว่างในหัวตาราง');
  if (new Set(headers).size !== headers.length) throw new Error('พบชื่อคอลัมน์ซ้ำในหัวตาราง');
  return lines.slice(1).map(values => Object.fromEntries(headers.map((header, index) => {
    const raw = (values[index] ?? '').trim();
    if (raw === '') return [header, ''];
    if (raw === 'true') return [header, true];
    if (raw === 'false') return [header, false];
    if ((raw.startsWith('[') && raw.endsWith(']')) || (raw.startsWith('{') && raw.endsWith('}'))) {
      try { return [header, JSON.parse(raw)]; } catch { /* keep raw string; validator will flag it */ }
    }
    if (/^-?\d+(\.\d+)?$/.test(raw)) return [header, Number(raw)];
    return [header, raw];
  })));
}

async function readImportFile(file: File): Promise<unknown[]> {
  const text = await file.text();
  if (file.name.toLowerCase().endsWith('.json')) {
    const parsed = JSON.parse(text);
    const rows = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.records) ? parsed.records : null);
    if (!rows) throw new Error('JSON ต้องเป็น array ของรายการ หรือ object ที่มี records เป็น array');
    return rows;
  }
  if (file.name.toLowerCase().endsWith('.csv')) return parseCsv(text);
  throw new Error('รองรับเฉพาะไฟล์ .json และ .csv');
}

export const RegistryImportPage: React.FC = () => {
  const [collection, setCollection] = useState<RegistryCollection>('schools');
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<unknown[]>([]);
  const [error, setError] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const results = useMemo<RowResult[]>(() => {
    const ids = new Set<string>();
    return rows.map((data, index) => {
      const record = data && typeof data === 'object' && !Array.isArray(data) ? data as Record<string, unknown> : {};
      const id = typeof record.id === 'string' ? record.id.trim() : undefined;
      const duplicate = Boolean(id && ids.has(id));
      if (id) ids.add(id);
      const valid = validateRegistryDocument(collection, data);
      const errors: string[] = [];
      if (!data || typeof data !== 'object' || Array.isArray(data)) errors.push('รายการต้องเป็น object');
      if (!id) errors.push('ไม่มี id หรือ id ไม่ใช่ข้อความ');
      if (duplicate) errors.push(`id ซ้ำในไฟล์: ${id}`);
      if (!valid) errors.push('ข้อมูลไม่ตรงกับโครงสร้างที่กำหนดสำหรับคอลเลกชันนี้');
      return { rowNumber: index + 1, data, id, valid: valid && !duplicate && Boolean(id), errors, duplicate };
    });
  }, [rows, collection]);

  const validCount = results.filter(row => row.valid).length;
  const invalidCount = results.length - validCount;

  const handleFile = async (file?: File) => {
    setError('');
    setRows([]);
    setAcknowledged(false);
    setFileName('');
    if (!file) return;
    setIsReading(true);
    try {
      const parsed = await readImportFile(file);
      setRows(parsed);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อ่านไฟล์ไม่สำเร็จ');
    } finally {
      setIsReading(false);
    }
  };

  const selected = collectionOptions.find(option => option.value === collection)!;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">DATA MANAGEMENT / PHASE 10</p>
          <h1 className="mt-1 text-2xl font-black text-slate-900 md:text-3xl">นำเข้าข้อมูลทะเบียนกลาง</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">ตรวจไฟล์ ตรวจข้อมูลซ้ำ และดูตัวอย่างก่อนนำเข้าจริง — ขั้นตอนนี้ยังไม่เขียนข้อมูลลง Firebase</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
          <ShieldAlert size={15}/> Preview / Dry run เท่านั้น
        </span>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={20}/>
          <div className="text-sm leading-6 text-amber-950">
            <p className="font-bold">ยังไม่เชื่อมการนำเข้ากับ Firestore</p>
            <p>กฎความปลอดภัยปัจจุบันยังไม่เปิดคอลเลกชันทะเบียนกลาง หน้านี้จึงทำได้เฉพาะอ่านไฟล์ในเบราว์เซอร์ ตรวจรูปแบบ และแสดงผลจำลอง ไม่อัปโหลดหรือบันทึกข้อมูลจริง</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileSpreadsheet className="text-violet-600" size={20}/>
            <h2 className="font-bold text-slate-900">1. เลือกประเภทข้อมูล</h2>
          </div>
          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="registry-collection">คอลเลกชันปลายทาง</label>
          <select id="registry-collection" value={collection} onChange={e => { setCollection(e.target.value as RegistryCollection); setAcknowledged(false); }} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100">
            {collectionOptions.map(option => <option key={option.value} value={option.value}>{option.label} ({REGISTRY_COLLECTIONS[option.value]})</option>)}
          </select>
          <p className="mt-2 text-sm text-slate-500">{selected.description}</p>

          <div className="mb-3 mt-6 flex items-center gap-2">
            <Upload className="text-violet-600" size={20}/>
            <h2 className="font-bold text-slate-900">2. เลือกไฟล์</h2>
          </div>
          <label htmlFor="registry-file" className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/60 px-5 py-8 text-center transition hover:border-violet-400 hover:bg-violet-50">
            <FileJson size={32} className="mb-3 text-violet-600"/>
            <span className="font-bold text-slate-900">คลิกเพื่อเลือกไฟล์ JSON หรือ CSV</span>
            <span className="mt-1 text-xs text-slate-500">JSON แนะนำสำหรับข้อมูลที่มี array เช่น assignedSchoolIds</span>
            <input id="registry-file" type="file" accept=".json,.csv,application/json,text/csv" className="sr-only" onChange={e => void handleFile(e.target.files?.[0])}/>
          </label>
          {isReading && <p className="mt-3 text-sm text-violet-700">กำลังอ่านไฟล์…</p>}
          {fileName && <p className="mt-3 break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">ไฟล์: <strong>{fileName}</strong></p>}
          {error && <div role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-800"><XCircle size={18} className="mt-0.5 shrink-0"/>{error}</div>}
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" disabled={!rows.length} onClick={() => { setRows([]); setFileName(''); setError(''); setAcknowledged(false); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">ล้างไฟล์</button>
            <button type="button" disabled={!results.length || invalidCount > 0} onClick={() => setAcknowledged(true)} className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-40">ยืนยันผล Preview (ไม่บันทึก)</button>
          </div>
          {acknowledged && <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"><CheckCircle2 className="mr-2 inline" size={17}/>ยืนยันผล Preview แล้ว — ไม่มีการเขียนข้อมูลลงฐานข้อมูล</div>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="text-violet-600" size={20}/>
            <h2 className="font-bold text-slate-900">3. สรุปผลตรวจไฟล์</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">ทั้งหมด</p><p className="mt-1 text-2xl font-black text-slate-900">{results.length}</p></div>
            <div className="rounded-xl bg-emerald-50 p-3"><p className="text-xs text-emerald-700">ผ่าน</p><p className="mt-1 text-2xl font-black text-emerald-700">{validCount}</p></div>
            <div className="rounded-xl bg-rose-50 p-3"><p className="text-xs text-rose-700">ผิดพลาด</p><p className="mt-1 text-2xl font-black text-rose-700">{invalidCount}</p></div>
          </div>
          {!results.length ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">เลือกไฟล์เพื่อดูตัวอย่างและผลตรวจ</div>
          ) : (
            <div className="mt-4 max-h-[420px] space-y-2 overflow-auto pr-1">
              {results.map(row => (
                <div key={`${row.rowNumber}-${row.id ?? 'no-id'}`} className={`rounded-xl border p-3 ${row.valid ? 'border-emerald-100 bg-emerald-50/50' : 'border-rose-100 bg-rose-50/60'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-500">แถวข้อมูล {row.rowNumber}</p>
                      <p className="mt-1 break-all text-sm font-bold text-slate-900">{row.id || 'ไม่มี ID'}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${row.valid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{row.valid ? 'ผ่าน' : 'ผิดพลาด'}</span>
                  </div>
                  {!row.valid && <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-rose-800">{row.errors.map(err => <li key={err}>{err}</li>)}</ul>}
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-semibold text-slate-600">ดูข้อมูลตัวอย่าง</summary>
                    <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-950 p-3 text-[11px] text-slate-100">{JSON.stringify(row.data, null, 2)}</pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <p className="text-xs leading-5 text-slate-500">หมายเหตุ: การตรวจนี้ตรวจรูปแบบและ ID ซ้ำภายในไฟล์เท่านั้น ยังไม่ได้ตรวจ ID ที่มีอยู่แล้วใน Firestore เพราะระบบยังไม่ได้เชื่อมทะเบียนกลาง</p>
    </div>
  );
};

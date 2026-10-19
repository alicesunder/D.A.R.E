import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebaseAuth';
import { createTeachingRecord, deleteTeachingRecord, subscribeToTeachingRecords, updateTeachingRecordForResubmission, type TeachingRecord } from '../../services/teachingRecordsService';
import { TeacherInsights } from '../../components/teacher/TeacherInsights';
import { useApp } from '../../context/AppContext';
import { BookOpen, CalendarDays, ClipboardCheck, Clock3, Plus, Search, CheckCircle2, FileText, School, Users, X, Save, Trash2, ArrowUpRight } from 'lucide-react';

const STORAGE_KEY = 'dare-teaching-records-v1';
const lessons = [
  { n: 1, title: 'รู้จัก D.A.R.E. และการตัดสินใจอย่างปลอดภัย', group: 'พื้นฐาน', time: '1 ชั่วโมง' },
  { n: 2, title: 'การสร้างความมั่นใจและการเห็นคุณค่าในตนเอง', group: 'ทักษะชีวิต', time: '1 ชั่วโมง' },
  { n: 3, title: 'การสื่อสารและการเลือกคบเพื่อน', group: 'ทักษะชีวิต', time: '1 ชั่วโมง' },
  { n: 4, title: 'การรับมือแรงกดดันจากเพื่อน', group: 'ทักษะการปฏิเสธ', time: '1 ชั่วโมง' },
  { n: 5, title: 'การตัดสินใจและการปฏิเสธอย่างเหมาะสม', group: 'ทักษะการปฏิเสธ', time: '1 ชั่วโมง' },
  { n: 6, title: 'การรู้เท่าทันความเสี่ยงและสารเสพติด', group: 'ความปลอดภัย', time: '1 ชั่วโมง' },
];
const today = () => new Date().toISOString().slice(0, 10);

export const TeacherWorkspacePage: React.FC = () => {
  const { schools, currentUser } = useApp();
  const mySchools = useMemo(() => { const pid = currentUser.personnelId; return [...schools].sort((a, b) => Number(!!pid && b.assignedPersonnelIds.includes(pid)) - Number(!!pid && a.assignedPersonnelIds.includes(pid))).slice(0, 400); }, [schools, currentUser.personnelId]);
  const [tab, setTab] = useState<'overview' | 'lessons' | 'records'>('overview');
  const [records, setRecords] = useState<TeachingRecord[]>([]);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [date, setDate] = useState(today());
  const [school, setSchool] = useState('');
  const [lesson, setLesson] = useState(lessons[0].title);
  const [students, setStudents] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [cloudMode, setCloudMode] = useState(false);
  const [syncState, setSyncState] = useState<'checking' | 'cloud' | 'local'>('checking');

  useEffect(() => {
    let unsubscribeRecords: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      unsubscribeRecords?.();
      if (user) {
        setCloudMode(true);
        setSyncState('cloud');
        unsubscribeRecords = subscribeToTeachingRecords(user.uid, setRecords, error => {
          console.error('Teaching record sync failed:', error);
          setMessage('เชื่อมต่อฐานข้อมูลไม่สำเร็จ กรุณาตรวจสอบ Firestore Rules และลองใหม่');
        });
      } else {
        setCloudMode(false);
        setSyncState('local');
        // Clear the previous signed-in user's records before loading this browser's local drafts.
        setRecords([]);
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          setRecords(raw ? JSON.parse(raw) : []);
        } catch {
          setRecords([]); // Ignore malformed local data rather than retaining stale records.
        }
      }
    });
    return () => { unsubscribeAuth(); unsubscribeRecords?.(); };
  }, []);
  useEffect(() => {
    if (!cloudMode) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch { /* storage may be unavailable */ } }
  }, [records, cloudMode]);

  const filtered = useMemo(() => records.filter(r => `${r.school} ${r.lesson} ${r.note}`.toLowerCase().includes(query.toLowerCase())), [records, query]);
  const saveRecord = async (submit: boolean) => {
    if (!school.trim() || students === '' || Number(students) < 0) { setMessage('กรุณากรอกชื่อโรงเรียนและจำนวนนักเรียนให้ครบถ้วน'); return; }
    const record = { date, school: school.trim(), lesson, students: Number(students), note: note.trim(), status: (submit ? 'submitted' : 'draft') as 'draft' | 'submitted' };
    try {
      if (editingRecordId) {
        if (!cloudMode || !submit) throw new Error('รายงานที่ส่งกลับแก้ไขต้องบันทึกและส่งกลับเข้าคิวตรวจ');
        await updateTeachingRecordForResubmission(editingRecordId, { date, school: school.trim(), lesson, students: Number(students), note: note.trim() });
      } else if (cloudMode) await createTeachingRecord(record);
      else setRecords(prev => [{ id: crypto.randomUUID?.() || String(Date.now()), ...record }, ...prev]);
      setSchool(''); setStudents(''); setNote(''); setDate(today()); setShowForm(false); setEditingRecordId(null);
      setMessage(editingRecordId ? 'บันทึกการแก้ไขและส่งกลับเข้าคิวตรวจแล้ว' : (cloudMode ? 'บันทึกลงฐานข้อมูลกลางเรียบร้อยแล้ว' : (submit ? 'บันทึกในเบราว์เซอร์แล้ว' : 'บันทึกฉบับร่างในเบราว์เซอร์แล้ว')));
      setTab('records'); window.setTimeout(() => setMessage(''), 3500);
    } catch (error) { console.error(error); setMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง'); }
  };
  const removeRecord = async (id: string) => {
    if (cloudMode) { try { await deleteTeachingRecord(id); } catch (error) { console.error(error); setMessage('ลบบันทึกไม่สำเร็จ กรุณาตรวจสอบสิทธิ์ฐานข้อมูล'); } }
    else setRecords(prev => prev.filter(r => r.id !== id));
  };

  return <div className="mx-auto w-full max-w-[1500px] space-y-6 pb-10">
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#27104d] via-[#5420a4] to-[#8b5cf6] p-6 text-white shadow-xl sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[36px] border-white/10" />
      <div className="pointer-events-none absolute -bottom-20 right-1/4 h-48 w-48 rounded-full bg-fuchsia-300/15 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide"><BookOpen size={14}/> TEACHER WORKSPACE</div><h1 className="text-2xl font-black leading-tight sm:text-4xl">พื้นที่ทำงานครู D.A.R.E.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-purple-100 sm:text-base">รวมบทเรียน บันทึกการสอน และติดตามงานไว้ในที่เดียว เพื่อให้ครูเตรียมสอนและรายงานผลได้สะดวกขึ้น</p></div>
        <button onClick={() => { setEditingRecordId(null); setDate(today()); setSchool(''); setStudents(''); setNote(''); setLesson(lessons[0].title); setShowForm(true); setMessage(''); }} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ffd66b] px-5 py-3 text-sm font-bold text-[#321653] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#ffe49b]"><Plus size={17}/> บันทึกการสอน</button>
      </div>
    </section>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[{label:'บทเรียนในพื้นที่นี้',value:String(lessons.length),sub:'รายการตัวอย่างสำหรับเริ่มต้น',icon:BookOpen,cls:'bg-violet-100 text-violet-700'},{label:'บันทึกการสอนของฉัน',value:String(records.length),sub:syncState==='cloud'?'ซิงก์กับฐานข้อมูลกลาง':syncState==='checking'?'กำลังตรวจสอบการเชื่อมต่อ':'เก็บไว้ในเบราว์เซอร์นี้',icon:ClipboardCheck,cls:'bg-sky-100 text-sky-700'},{label:'ส่งรายงานแล้ว',value:String(records.filter(r=>r.status==='submitted').length),sub:'จากรายการที่บันทึกไว้',icon:CheckCircle2,cls:'bg-emerald-100 text-emerald-700'}].map((x) => <div key={x.label} className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{x.label}</p><p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{x.value}</p><p className="mt-1 text-xs text-slate-400">{x.sub}</p></div><div className={`rounded-2xl p-3 ${x.cls}`}><x.icon size={23}/></div></div></div>)}
    </div>

    {tab==='overview' && <TeacherInsights records={records}/>}

    <div className="flex flex-wrap gap-2 rounded-2xl border border-violet-100 bg-white p-2 shadow-sm">{([{id:'overview',label:'ภาพรวม',icon:CalendarDays},{id:'lessons',label:'หลักสูตรและบทเรียน',icon:BookOpen},{id:'records',label:'บันทึกการสอน',icon:ClipboardCheck}] as const).map(t => <button key={t.id} onClick={()=>setTab(t.id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab===t.id?'bg-violet-700 text-white shadow-md':'text-slate-600 hover:bg-violet-50 hover:text-violet-800'}`}><t.icon size={16}/>{t.label}</button>)}</div>

    {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{message}</div>}
    {(tab==='overview'||tab==='lessons') && <section className="space-y-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-extrabold text-slate-900">{tab==='overview'?'เริ่มต้นทำงานของคุณ':'หลักสูตรและบทเรียน'}</h2><p className="mt-1 text-sm text-slate-500">เลือกบทเรียนเพื่อใช้เป็นแนวทางเตรียมการสอน</p></div>{tab==='overview'&&<button onClick={()=>setTab('records')} className="text-sm font-bold text-violet-700 hover:text-violet-900">ดูบันทึกทั้งหมด <ArrowUpRight size={15} className="inline"/></button>}</div><div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{lessons.filter(l=>tab==='lessons'||l.n<=3).map(l=><article key={l.n} className="group rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"><div className="flex items-start justify-between gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-lg font-black text-white shadow-md">{String(l.n).padStart(2,'0')}</div><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{l.group}</span></div><h3 className="mt-4 min-h-[3.5rem] font-bold leading-6 text-slate-900">{l.title}</h3><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><Clock3 size={14}/>{l.time}</span><button onClick={()=>{setLesson(l.title);setShowForm(true);}} className="font-bold text-violet-700 hover:text-violet-900">บันทึกการสอน <ArrowUpRight size={13} className="inline"/></button></div></article>)}</div><p className="text-xs leading-5 text-slate-400">หมายเหตุ: รายการบทเรียนนี้เป็นข้อมูลตัวอย่างสำหรับเริ่มต้น ควรตรวจสอบและแทนที่ด้วยหลักสูตรฉบับทางการที่หน่วยงานอนุมัติ</p></section>}

    {tab==='records' && <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-extrabold text-slate-900">บันทึกการสอน</h2><p className="mt-1 text-sm text-slate-500">{cloudMode?'รายการบันทึกที่ซิงก์กับบัญชีของคุณ':'รายการบันทึกในเบราว์เซอร์นี้'}</p></div><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหาโรงเรียนหรือบทเรียน" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:w-72"/></div></div>{filtered.length===0?<div className="px-6 py-14 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><FileText size={25}/></div><h3 className="mt-4 font-bold text-slate-800">ยังไม่มีบันทึกการสอน</h3><p className="mt-1 text-sm text-slate-500">เริ่มบันทึกข้อมูลหลังจากจัดการเรียนการสอน</p><button onClick={()=>setShowForm(true)} className="mt-4 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-800"><Plus size={15} className="mr-1 inline"/> เพิ่มบันทึก</button></div>:<div className="divide-y divide-slate-100">{filtered.map(r=><div key={r.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div className="flex min-w-0 items-start gap-3"><div className="rounded-xl bg-violet-50 p-3 text-violet-700"><School size={20}/></div><div className="min-w-0"><p className="font-bold text-slate-900">{r.school}</p><p className="mt-1 text-sm text-slate-600">{r.lesson}</p><p className="mt-1 text-xs text-slate-400">{r.date} · นักเรียน {r.students} คน {r.note?`· ${r.note}`:''}</p>{r.reviewStatus==='revision_requested'&&r.reviewComment&&<div className="mt-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-800"><span className="font-bold">ข้อเสนอแนะจากผู้ตรวจ:</span> {r.reviewComment}</div>}{r.reviewStatus==='approved'&&<p className="mt-2 text-xs font-semibold text-emerald-700">รายงานนี้ได้รับการอนุมัติแล้ว</p>}</div></div><div className="flex items-center gap-3">{r.reviewStatus==='revision_requested'&&<button onClick={()=>{setEditingRecordId(r.id);setDate(r.date);setSchool(r.school);setLesson(r.lesson);setStudents(String(r.students));setNote(r.note||'');setShowForm(true);setMessage('');}} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100">แก้ไขและส่งใหม่</button>}<div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${r.status==='submitted'?'bg-sky-50 text-sky-700':'bg-amber-50 text-amber-700'}`}>{r.status==='submitted'?'ส่งรายงานแล้ว':'ฉบับร่าง'}</span>{r.status==='submitted'&&<span className={`rounded-full px-3 py-1 text-xs font-bold ${r.reviewStatus==='approved'?'bg-emerald-50 text-emerald-700':r.reviewStatus==='revision_requested'?'bg-rose-50 text-rose-700':'bg-violet-50 text-violet-700'}`}>{r.reviewStatus==='approved'?'อนุมัติแล้ว':r.reviewStatus==='revision_requested'?'รอแก้ไข':'รอตรวจสอบ'}</span>}</div><button aria-label="ลบบันทึก" onClick={()=>removeRecord(r.id)} disabled={r.status==='submitted'} title={r.status==='submitted'?'ไม่สามารถลบรายงานที่ส่งแล้วได้':'ลบบันทึก'} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={16}/></button></div></div>)}</div>}</section>}

    {showForm && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm" onMouseDown={e=>{if(e.target===e.currentTarget)setShowForm(false)}}><section role="dialog" aria-modal="true" aria-labelledby="teaching-form-title" className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl"><div className="flex items-center justify-between bg-gradient-to-r from-violet-800 to-violet-600 px-5 py-4 text-white sm:px-6"><div><h2 id="teaching-form-title" className="text-lg font-extrabold">{editingRecordId ? 'แก้ไขรายงานที่ถูกส่งกลับ' : 'บันทึกผลการสอน'}</h2><p className="mt-1 text-xs text-violet-100">กรอกข้อมูลสรุปการจัดการเรียนรู้</p></div><button onClick={()=>{setShowForm(false);setEditingRecordId(null);}} className="rounded-xl p-2 hover:bg-white/15" aria-label="ปิด"><X size={20}/></button></div><form className="space-y-4 p-5 sm:p-6" onSubmit={e=>{e.preventDefault();saveRecord(false)}}><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-semibold text-slate-700">วันที่สอน<input required type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-violet-400"/></label><label className="space-y-1.5 text-sm font-semibold text-slate-700">จำนวนนักเรียน<input required type="number" min="0" value={students} onChange={e=>setStudents(e.target.value)} placeholder="เช่น 32" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-violet-400"/></label></div><label className="block space-y-1.5 text-sm font-semibold text-slate-700">โรงเรียน<input required list="dare-school-list" value={school} onChange={e=>setSchool(e.target.value)} placeholder="ชื่อโรงเรียน (พิมพ์เพื่อค้นหาจากทะเบียน)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-violet-400"/></label><datalist id="dare-school-list">{mySchools.map(x=><option key={x.id} value={x.name}/>)}</datalist><label className="block space-y-1.5 text-sm font-semibold text-slate-700">บทเรียน<select value={lesson} onChange={e=>setLesson(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-violet-400">{lessons.map(l=><option key={l.n} value={l.title}>บทที่ {l.n} — {l.title}</option>)}</select></label><label className="block space-y-1.5 text-sm font-semibold text-slate-700">บันทึกเพิ่มเติม (ไม่บังคับ)<textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="สรุปกิจกรรมหรือข้อสังเกต โดยไม่ใส่ข้อมูลส่วนบุคคลของนักเรียน" className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-violet-400"/></label><div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={()=>setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">ยกเลิก</button><button type="submit" disabled={!!editingRecordId} className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-bold text-violet-800 hover:bg-violet-100 disabled:opacity-40"><Save size={15} className="mr-1 inline"/> บันทึกฉบับร่าง</button><button type="button" onClick={()=>saveRecord(true)} className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-violet-800"><CheckCircle2 size={15} className="mr-1 inline"/> {editingRecordId ? 'บันทึกและส่งตรวจใหม่' : 'บันทึกส่งแล้ว'}</button></div><p className="text-xs leading-5 text-slate-400">{cloudMode?'ข้อมูลจะบันทึกใน Firebase และซิงก์กับบัญชีที่เข้าสู่ระบบ':'ขณะยังไม่ได้เข้าสู่ระบบ ข้อมูลจะเก็บในเบราว์เซอร์เครื่องนี้เท่านั้น'}</p></form></section></div>}
  </div>;
};

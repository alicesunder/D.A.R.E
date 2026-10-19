import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebaseAuth';
import { reviewTeachingRecord, subscribeToReviewQueue, type ReviewRecord } from '../../services/reportReviewService';
import { CheckCircle2, ClipboardCheck, Clock3, FileText, MessageSquareText, Search, Send, ShieldAlert, XCircle } from 'lucide-react';

export const ReportReviewPage: React.FC = () => {
  const [records, setRecords] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<ReviewRecord | null>(null);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let stop: (() => void) | undefined;
    const stopAuth = onAuthStateChanged(auth, user => {
      stop?.();
      setSignedIn(!!user);
      if (!user) { setRecords([]); setLoading(false); return; }
      setLoading(true);
      stop = subscribeToReviewQueue(items => { setRecords(items); setLoading(false); }, err => {
        console.error(err); setMessage('ไม่สามารถโหลดคิวรายงานได้ โปรดตรวจสอบสิทธิ์ผู้ตรวจใน Firebase Rules'); setLoading(false);
      });
    });
    return () => { stop?.(); stopAuth(); };
  }, []);

  const filtered = records.filter(r => `${r.school} ${r.lesson} ${r.ownerEmail ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  const decide = async (status: 'approved' | 'revision_requested') => {
    if (!active) return;
    if (status === 'revision_requested' && !comment.trim()) { setMessage('กรุณาระบุข้อเสนอแนะก่อนส่งกลับแก้ไข'); return; }
    setBusy(true); setMessage('');
    try {
      await reviewTeachingRecord(active.id, status, comment);
      setMessage(status === 'approved' ? 'อนุมัติรายงานเรียบร้อย' : 'ส่งรายงานกลับแก้ไขแล้ว');
      setActive(null); setComment('');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'ดำเนินการไม่สำเร็จ โปรดตรวจสอบสิทธิ์ผู้ตรวจ');
    } finally { setBusy(false); }
  };

  return <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#241044] via-[#4C1D95] to-[#7C3AED] p-6 text-white shadow-xl sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border-[30px] border-white/5" />
      <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-200">D.A.R.E. THAILAND · REPORT CENTER</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">ตรวจสอบรายงานการสอน</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100">คิวรายงานที่ครูส่งแล้ว สำหรับผู้ตรวจที่ได้รับมอบหมายให้พิจารณา อนุมัติ หรือส่งกลับแก้ไข</p></div><div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3"><ClipboardCheck size={22}/><div><p className="text-2xl font-black">{records.length}</p><p className="text-xs text-violet-100">รอตรวจสอบ</p></div></div></div>
    </section>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[{label:'รายงานในคิว',value:records.length,icon:FileText,cls:'bg-violet-100 text-violet-700'},{label:'กำลังตรวจสอบ',value:active?1:0,icon:Clock3,cls:'bg-amber-100 text-amber-700'},{label:'ระบบตรวจสิทธิ์',value:signedIn?'เข้าสู่ระบบแล้ว':'ยังไม่เข้าสู่ระบบ',icon:ShieldAlert,cls:'bg-sky-100 text-sky-700'}].map(x=><div key={x.label} className="flex items-center justify-between rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"><div><p className="text-sm text-slate-500">{x.label}</p><p className="mt-2 text-2xl font-black text-slate-900">{x.value}</p></div><div className={`rounded-2xl p-3 ${x.cls}`}><x.icon size={22}/></div></div>)}
    </div>
    {message && <div role="status" className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">{message}</div>}
    {!signedIn && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">กรุณาเข้าสู่ระบบด้วยบัญชีผู้ตรวจที่ได้รับสิทธิ์ก่อนใช้งานคิวรายงาน</div>}
    <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-extrabold text-slate-900">รายงานที่รอพิจารณา</h2><p className="mt-1 text-sm text-slate-500">แสดงเฉพาะรายการที่ส่งแล้วและยังไม่มีผลตรวจ</p></div><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหาโรงเรียน บทเรียน หรืออีเมล" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-400 sm:w-80"/></div></div>
      {loading?<div className="p-12 text-center text-sm text-slate-500">กำลังโหลดคิวรายงาน…</div>:filtered.length===0?<div className="p-12 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><CheckCircle2 size={26}/></div><h3 className="mt-4 font-bold text-slate-800">ไม่มีรายงานที่รอตรวจ</h3><p className="mt-1 text-sm text-slate-500">หากควรมีรายการ โปรดตรวจสิทธิ์ reviewer ใน Firebase Rules</p></div>:<div className="divide-y divide-slate-100">{filtered.map(r=><article key={r.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><FileText size={20}/></div><div className="min-w-0"><h3 className="font-bold text-slate-900">{r.school}</h3><p className="mt-1 text-sm text-slate-600">{r.lesson}</p><p className="mt-1 text-xs text-slate-400">{r.date} · นักเรียน {r.students} คน · ผู้ส่ง {r.ownerEmail || 'ไม่ระบุอีเมล'}</p>{r.note&&<p className="mt-2 line-clamp-2 text-sm text-slate-500">{r.note}</p>}</div></div><button onClick={()=>{setActive(r);setComment('');}} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-800">เปิดตรวจรายงาน <MessageSquareText size={16}/></button></article>)}</div>}</section>
    {active&&<div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm" onMouseDown={e=>{if(e.target===e.currentTarget)setActive(null)}}><section role="dialog" aria-modal="true" className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"><div className="flex items-center justify-between bg-gradient-to-r from-violet-900 to-violet-700 px-5 py-4 text-white"><div><h2 className="font-extrabold">พิจารณารายงาน</h2><p className="mt-1 text-xs text-violet-100">ตรวจสอบข้อมูลก่อนเลือกผลการพิจารณา</p></div><button onClick={()=>setActive(null)} aria-label="ปิด" className="rounded-lg p-2 hover:bg-white/10"><XCircle size={20}/></button></div><div className="space-y-4 p-5 sm:p-6"><div className="grid gap-3 sm:grid-cols-2">{[['โรงเรียน',active.school],['วันที่สอน',active.date],['บทเรียน',active.lesson],['จำนวนนักเรียน',`${active.students} คน`],['ผู้ส่ง',active.ownerEmail||'ไม่ระบุ'],['หมายเหตุ',active.note||'ไม่มี']].map(([label,value])=><div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p></div>)}</div><label className="block space-y-1.5 text-sm font-semibold text-slate-700">ข้อเสนอแนะ / เหตุผลส่งกลับแก้ไข<textarea rows={3} value={comment} onChange={e=>setComment(e.target.value)} placeholder="ระบุข้อเสนอแนะให้ครูทราบ (จำเป็นเมื่อส่งกลับแก้ไข)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-violet-400"/></label><div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end"><button disabled={busy} onClick={()=>decide('revision_requested')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800 disabled:opacity-50">ส่งกลับแก้ไข <MessageSquareText size={15}/></button><button disabled={busy} onClick={()=>decide('approved')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">อนุมัติรายงาน <CheckCircle2 size={15}/></button></div></div></section></div>}
  </div>;
};

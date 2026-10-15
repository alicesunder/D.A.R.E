import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MediaNews, UserRole } from '../../types';
import { 
  FileText, 
  Newspaper, 
  ShieldCheck, 
  History, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Search, 
  Plus, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Lock, 
  UserPlus, 
  Filter, 
  AlertCircle,
  BookOpen,
  FolderOpen
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { BppLogo, DareLogo } from '../../components/ui/Logos';

interface Hub5GovernanceProps {
  initialTab?: 'reports' | 'news' | 'rbac' | 'audit' | 'learning' | 'media_vault';
}

export const Hub5Governance: React.FC<Hub5GovernanceProps> = ({ initialTab = 'reports' }) => {
  const { 
    activities, 
    schools, 
    personnel, 
    organizations, 
    news, 
    auditLogs, 
    addNews,
    updateNews,
    currentUser, 
    currentRole,
    switchRole,
    exportActivitiesToGoogleSheets,
    exportRosterToGoogleSheets,
    exportSchoolsToGoogleSheets
  } = useApp();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'reports' | 'news' | 'rbac' | 'audit' | 'learning' | 'media_vault'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Reports state
  const [reportType, setReportType] = useState<'overall' | 'unit' | 'schools'>('overall');
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('2570');

  // News CMS filter & search
  const [newsSearch, setNewsSearch] = useState('');
  const [showNewsEditor, setShowNewsEditor] = useState(false);
  const [editingNews, setEditingNews] = useState<MediaNews | null>(null);
  const [newsDraft, setNewsDraft] = useState<Pick<MediaNews, 'title' | 'category' | 'summary' | 'content' | 'imageUrl' | 'status'>>({
    title: '',
    category: 'news',
    summary: '',
    content: '',
    imageUrl: '',
    status: 'draft',
  });

  // Audit filter
  const [auditActionFilter, setAuditActionFilter] = useState('all');

  // Sheets modal
  const [showSheetsConfirm, setShowSheetsConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<{ url?: string; message: string } | null>(null);

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  const handleExportSheets = async () => {
    setShowSheetsConfirm(false);
    setIsExporting(true);
    setExportNotice(null);
    try {
      let res;
      if (reportType === 'schools') {
        res = await exportSchoolsToGoogleSheets();
      } else if (reportType === 'unit') {
        res = await exportRosterToGoogleSheets();
      } else {
        res = await exportActivitiesToGoogleSheets();
      }

      if (res.success && res.url) {
        setExportNotice({
          url: res.url,
          message: `สร้างและซิงค์รายงานสู่ Google Sheets เรียบร้อยแล้ว`
        });
      } else {
        setExportNotice({ message: res.message });
      }
    } catch {
      setExportNotice({ message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets' });
    } finally {
      setIsExporting(false);
    }
  };

  const openNewsEditor = (item?: MediaNews) => {
    setEditingNews(item || null);
    setNewsDraft(item ? {
      title: item.title,
      category: item.category,
      summary: item.summary,
      content: item.content,
      imageUrl: item.imageUrl,
      status: item.status,
    } : {
      title: '',
      category: activeTab === 'learning' ? 'knowledge' : 'news',
      summary: '',
      content: '',
      imageUrl: '',
      status: 'draft',
    });
    setShowNewsEditor(true);
  };

  const handleSaveNews = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newsDraft.title.trim();
    const summary = newsDraft.summary.trim();
    const body = newsDraft.content.trim();
    if (!title || !summary || !body) return;

    const data = {
      ...newsDraft,
      title,
      summary,
      content: body,
      imageUrl: newsDraft.imageUrl.trim(),
      publishedAt: editingNews?.publishedAt || new Date().toISOString(),
      author: editingNews?.author || currentUser.name,
    };
    if (editingNews) {
      updateNews(editingNews.id, data);
    } else {
      addNews(data);
    }
    setShowNewsEditor(false);
    setEditingNews(null);
  };

  const filteredNews = news.filter((n) => {
    const query = newsSearch.toLowerCase();
    const matchesQuery = n.title.toLowerCase().includes(query) || n.summary.toLowerCase().includes(query);
    const matchesModule = activeTab === 'learning' ? n.category === 'knowledge'
      : activeTab === 'media_vault' ? Boolean(n.imageUrl)
      : true;
    return matchesQuery && matchesModule;
  });

  const filteredAudit = auditLogs.filter((log) => {
    if (auditActionFilter === 'all') return true;
    return log.action === auditActionFilter;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E7E0EF] pb-6">
        <div>
          <div className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider mb-1">
            Hub 5 — Governance, Compliance & Media
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#32145C] tracking-tight">
            สารสนเทศ รายงาน และความปลอดภัย
          </h1>
          <p className="text-sm text-[#756B80] mt-1 font-light">
            ศูนย์รวมรายงานราชการสั่งพิมพ์, การซิงค์ Google Sheets, คลังสื่อสารสนเทศ และบันทึกประวัติการใช้งาน
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-[#E7E0EF] text-xs">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'reports' ? 'bg-[#32145C] text-white shadow-xs' : 'text-[#756B80] hover:text-[#211A2B]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>รายงานราชการ</span>
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'learning' ? 'bg-[#32145C] text-white shadow-xs' : 'text-[#756B80] hover:text-[#211A2B]'}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>สื่อการเรียนรู้</span>
          </button>
          <button
            onClick={() => setActiveTab('media_vault')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'media_vault' ? 'bg-[#32145C] text-white shadow-xs' : 'text-[#756B80] hover:text-[#211A2B]'}`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>คลังสื่อ</span>
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'news' ? 'bg-[#32145C] text-white shadow-xs' : 'text-[#756B80] hover:text-[#211A2B]'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>ข่าวสาร & สื่อ</span>
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'rbac' ? 'bg-[#32145C] text-white shadow-xs' : 'text-[#756B80] hover:text-[#211A2B]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>สิทธิ์ผู้ใช้ (RBAC)</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-[#32145C] text-white shadow-xs' : 'text-[#756B80] hover:text-[#211A2B]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>ประวัติระบบ</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#168A62]" />
            <span>{exportNotice.message}</span>
          </div>
          {exportNotice.url && (
            <a
              href={exportNotice.url}
              target="_blank"
              rel="noreferrer"
              className="text-[#7C3AED] font-bold underline ml-4 hover:text-[#5B2A86]"
            >
              เปิดดู Google Sheets
            </a>
          )}
        </div>
      )}

      {/* 1. OFFICIAL REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-[#E7E0EF] shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-[#756B80] font-medium">รูปแบบรายงาน:</span>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="px-3 py-1.5 text-xs border border-[#E7E0EF] rounded-xl text-[#211A2B] font-semibold focus:outline-none"
              >
                <option value="overall">รายงานสรุปผลการปฏิบัติงานโครงการภาพรวม (บช.ตชด.)</option>
                <option value="unit">รายงานกำลังพลครู D.A.R.E. จำแนกตามกองกำกับการ</option>
                <option value="schools">รายงานความครอบคลุมสถานศึกษาและจำนวนนักเรียน</option>
              </select>

              <select
                value={selectedFiscalYear}
                onChange={(e) => setSelectedFiscalYear(e.target.value)}
                className="px-3 py-1.5 text-xs border border-[#E7E0EF] rounded-xl text-[#211A2B] focus:outline-none"
              >
                <option value="2570">ปีงบประมาณ 2570 (ปัจจุบัน)</option>
                <option value="2569">ปีงบประมาณ 2569</option>
                <option value="2568">ปีงบประมาณ 2568</option>
                <option value="2567">ปีงบประมาณ 2567</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E7E0EF] bg-white hover:bg-gray-50 text-[#32145C] text-xs font-semibold shadow-2xs transition-all"
              >
                <Printer className="w-4 h-4 text-[#7C3AED]" />
                <span>สั่งพิมพ์รายงาน (Print)</span>
              </button>

              <button
                onClick={() => setShowSheetsConfirm(true)}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#32145C] hover:bg-[#250E42] text-[#FFE082] text-xs font-semibold shadow-xs transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#D6B15E]" />
                <span>{isExporting ? 'กำลังซิงค์...' : 'ส่งออก Google Sheets'}</span>
              </button>
            </div>
          </div>

          {/* Printable Official Document Container */}
          <div className="bg-white rounded-2xl border border-[#E7E0EF] shadow-sm p-8 sm:p-12 space-y-8 font-sans print:p-0 print:border-none print:shadow-none">
            {/* Document Header */}
            <div className="text-center space-y-2 border-b-2 border-[#32145C] pb-6">
              <div className="flex justify-center items-center gap-4 mb-2">
                <BppLogo className="h-14" />
                <DareLogo className="h-10" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#211A2B]">
                รายงานสรุปผลการดำเนินงานโครงการ D.A.R.E. ประเทศไทย
              </h2>
              <div className="text-xs text-[#756B80]">
                กองบัญชาการตำรวจตระเวนชายแดน (บช.ตชด.) · ประจำปีงบประมาณ {selectedFiscalYear}
              </div>
              <div className="text-[11px] text-[#756B80]">
                ออกรายงาน ณ วันที่ {new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })}
              </div>
            </div>

            {/* Key Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                <div className="text-[11px] text-[#756B80]">ครู D.A.R.E. ทั้งหมด</div>
                <div className="text-2xl font-extrabold text-[#32145C] mt-1">{personnel.length} นาย</div>
              </div>
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                <div className="text-[11px] text-[#756B80]">สถานศึกษาในเครือข่าย</div>
                <div className="text-2xl font-extrabold text-[#5B2A86] mt-1">{schools.length} แห่ง</div>
              </div>
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                <div className="text-[11px] text-[#756B80]">บันทึกการสอนแล้ว</div>
                <div className="text-2xl font-extrabold text-[#168A62] mt-1">{activities.length} ครั้ง</div>
              </div>
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                <div className="text-[11px] text-[#756B80]">นักเรียนที่ผ่านอบรม</div>
                <div className="text-2xl font-extrabold text-[#D99720] mt-1">
                  {activities.reduce((sum, a) => sum + (a.studentCount || 0), 0).toLocaleString()} คน
                </div>
              </div>
            </div>

            {/* Official Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-[#211A2B] border-b border-gray-300">
                    <th className="py-2.5 px-3 font-bold border-r">ลำดับ</th>
                    <th className="py-2.5 px-3 font-bold border-r">กองบังคับการ / กองกำกับการ</th>
                    <th className="py-2.5 px-3 font-bold border-r text-center">กำลังพลครู (นาย)</th>
                    <th className="py-2.5 px-3 font-bold border-r text-center">โรงเรียนในพื้นที่ (แห่ง)</th>
                    <th className="py-2.5 px-3 font-bold border-r text-center">กิจกรรมที่จัด (ครั้ง)</th>
                    <th className="py-2.5 px-3 font-bold text-center">นักเรียนเป้าหมาย (คน)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {organizations.filter(o => o.level === 'subdivision').map((org, index) => {
                    const orgPersonnel = personnel.filter(p => p.organizationId === org.id);
                    const orgSchools = schools.filter(s => s.organizationId === org.id);
                    const orgActivities = activities.filter(a => a.organizationId === org.id);
                    const orgStudents = orgActivities.reduce((acc, curr) => acc + (curr.studentCount || 0), 0);

                    return (
                      <tr key={org.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 border-r text-center text-gray-500">{index + 1}</td>
                        <td className="py-2 px-3 border-r font-medium text-[#211A2B]">{org.name}</td>
                        <td className="py-2 px-3 border-r text-center">{orgPersonnel.length}</td>
                        <td className="py-2 px-3 border-r text-center">{orgSchools.length}</td>
                        <td className="py-2 px-3 border-r text-center">{orgActivities.length}</td>
                        <td className="py-2 px-3 text-center font-bold text-[#168A62]">
                          {orgStudents.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Official Signatures */}
            <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs text-[#211A2B]">
              <div className="space-y-12">
                <div>(ลงชื่อ) ...........................................................</div>
                <div>
                  <div className="font-bold">พ.ต.อ. สมเกียรติ สถิตพร</div>
                  <div className="text-[11px] text-[#756B80]">หัวหน้าฝ่ายอำนวยการโครงการ D.A.R.E. บช.ตชด.</div>
                </div>
              </div>
              <div className="space-y-12">
                <div>(ลงชื่อ) ...........................................................</div>
                <div>
                  <div className="font-bold">พล.ต.ท. ประชา ปลอดภัย</div>
                  <div className="text-[11px] text-[#756B80]">ผู้บัญชาการตำรวจตระเวนชายแดน</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. NEWS CMS TAB */}
      {(activeTab === 'news' || activeTab === 'learning' || activeTab === 'media_vault') && (
        <div className="bg-white rounded-2xl border border-[#E7E0EF] shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-[#E7E0EF] pb-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={newsSearch}
                onChange={(e) => setNewsSearch(e.target.value)}
                placeholder={activeTab === 'learning' ? 'ค้นหาสื่อการเรียนรู้...' : activeTab === 'media_vault' ? 'ค้นหาคลังสื่อ...' : 'ค้นหาบทความหรือข่าวประชาสัมพันธ์...'}
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E0EF] rounded-xl focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            {currentRole !== 'report_viewer' && (
              <button type="button" onClick={() => openNewsEditor()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#32145C] hover:bg-[#250E42] text-[#FFE082] text-xs font-semibold shadow-xs">
                <Plus className="w-4 h-4" />
                <span>{activeTab === 'learning' ? 'เพิ่มสื่อการเรียนรู้' : activeTab === 'media_vault' ? 'เพิ่มรายการเข้าคลังสื่อ' : 'เขียนข่าวใหม่'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item) => (
              <div key={item.id} className="rounded-xl border border-[#E7E0EF] overflow-hidden hover:border-purple-200 transition-all flex flex-col justify-between">
                <div>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-36 object-cover" />
                  )}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#7C3AED] uppercase">{item.category}</span>
                      <span className="text-gray-400">{new Date(item.publishedAt).toLocaleDateString('th-TH')}</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#211A2B] line-clamp-2">{item.title}</h3>
                    <p className="text-[11px] text-[#756B80] line-clamp-3 leading-relaxed">{item.summary}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-gray-100 flex items-center justify-between mt-2">
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                    {item.status === 'published' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
                  </span>
                  <div className="flex items-center gap-2">
                    {currentRole !== 'report_viewer' && <button type="button" onClick={() => openNewsEditor(item)} className="text-xs text-[#5B2A86] hover:underline font-semibold">แก้ไข</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showNewsEditor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="news-editor-title">
              <form onSubmit={handleSaveNews} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#E7E0EF] pb-3">
                  <h2 id="news-editor-title" className="text-lg font-bold text-[#32145C]">{editingNews ? 'แก้ไขรายการ' : activeTab === 'learning' ? 'เพิ่มสื่อการเรียนรู้' : activeTab === 'media_vault' ? 'เพิ่มรายการเข้าคลังสื่อ' : 'เขียนข่าวใหม่'}</h2>
                  <button type="button" onClick={() => setShowNewsEditor(false)} className="rounded-lg px-3 py-1 text-sm text-gray-500 hover:bg-gray-100" aria-label="ปิดหน้าต่าง">ปิด</button>
                </div>
                <label className="block space-y-1 text-xs font-semibold text-[#32145C]">
                  <span>หัวข้อข่าว *</span>
                  <input required value={newsDraft.title} onChange={(e) => setNewsDraft((draft) => ({ ...draft, title: e.target.value }))} className="w-full rounded-xl border border-[#E7E0EF] px-3 py-2 text-sm font-normal focus:border-[#7C3AED] focus:outline-none" />
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block space-y-1 text-xs font-semibold text-[#32145C]">
                    <span>ประเภทข่าว</span>
                    <select value={newsDraft.category} onChange={(e) => setNewsDraft((draft) => ({ ...draft, category: e.target.value as MediaNews['category'] }))} className="w-full rounded-xl border border-[#E7E0EF] px-3 py-2 text-sm font-normal">
                      <option value="news">ข่าวสาร</option>
                      <option value="activity">กิจกรรม</option>
                      <option value="knowledge">ความรู้</option>
                      <option value="announcement">ประกาศ</option>
                    </select>
                  </label>
                  <label className="block space-y-1 text-xs font-semibold text-[#32145C]">
                    <span>สถานะเผยแพร่</span>
                    <select value={newsDraft.status} onChange={(e) => setNewsDraft((draft) => ({ ...draft, status: e.target.value as MediaNews['status'] }))} className="w-full rounded-xl border border-[#E7E0EF] px-3 py-2 text-sm font-normal">
                      <option value="draft">ฉบับร่าง</option>
                      <option value="published">เผยแพร่แล้ว</option>
                      <option value="archived">เก็บเข้าคลัง</option>
                    </select>
                  </label>
                </div>
                <label className="block space-y-1 text-xs font-semibold text-[#32145C]">
                  <span>คำโปรย / สรุปข่าว *</span>
                  <textarea required rows={2} value={newsDraft.summary} onChange={(e) => setNewsDraft((draft) => ({ ...draft, summary: e.target.value }))} className="w-full rounded-xl border border-[#E7E0EF] px-3 py-2 text-sm font-normal focus:border-[#7C3AED] focus:outline-none" />
                </label>
                <label className="block space-y-1 text-xs font-semibold text-[#32145C]">
                  <span>เนื้อหาข่าว *</span>
                  <textarea required rows={5} value={newsDraft.content} onChange={(e) => setNewsDraft((draft) => ({ ...draft, content: e.target.value }))} className="w-full rounded-xl border border-[#E7E0EF] px-3 py-2 text-sm font-normal focus:border-[#7C3AED] focus:outline-none" />
                </label>
                <label className="block space-y-1 text-xs font-semibold text-[#32145C]">
                  <span>URL รูปภาพ (ถ้ามี)</span>
                  <input type="url" value={newsDraft.imageUrl} onChange={(e) => setNewsDraft((draft) => ({ ...draft, imageUrl: e.target.value }))} placeholder="https://..." className="w-full rounded-xl border border-[#E7E0EF] px-3 py-2 text-sm font-normal focus:border-[#7C3AED] focus:outline-none" />
                </label>
                <div className="flex justify-end gap-3 border-t border-[#E7E0EF] pt-4">
                  <button type="button" onClick={() => setShowNewsEditor(false)} className="rounded-xl border border-[#E7E0EF] px-4 py-2 text-xs font-semibold text-[#756B80] hover:bg-gray-50">ยกเลิก</button>
                  <button type="submit" className="rounded-xl bg-[#32145C] px-5 py-2 text-xs font-semibold text-[#FFE082] hover:bg-[#250E42]">{editingNews ? 'บันทึกการแก้ไข' : 'บันทึกข่าว'}</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 3. RBAC ROLE MANAGEMENT TAB */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-2xl border border-[#E7E0EF] shadow-xs p-6 space-y-6">
          <div className="border-b border-[#E7E0EF] pb-4">
            <h3 className="text-base font-bold text-[#32145C]">การบริหารจัดการสิทธิ์การเข้าถึง (RBAC)</h3>
            <p className="text-xs text-[#756B80] mt-0.5">
              กำหนดระดับอำนาจหน้าที่ตามโครงสร้างสายการบังคับบัญชาของกองบัญชาการตำรวจตระเวนชายแดน
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { role: 'central_admin' as UserRole, title: 'ผู้ดูแลส่วนกลาง (บช.ตชด.)', desc: 'สิทธิ์สูงสุด จัดการโครงสร้าง มอบหมายกำลังพล และดูรายงานทั่วประเทศ' },
              { role: 'unit_admin' as UserRole, title: 'ผู้ดูแลระดับหน่วย (กก.ตชด.)', desc: 'จัดการโรงเรียนและครูเฉพาะในเขตพื้นที่รับผิดชอบของตน' },
              { role: 'dare_instructor' as UserRole, title: 'ครู D.A.R.E. ผู้ปฏิบัติงาน', desc: 'บันทึกตารางการสอน ส่งรายงานผลการจัดกิจกรรม และอัปโหลดภาพ' },
              { role: 'report_viewer' as UserRole, title: 'ผู้ตรวจการ / ดูรายงาน', desc: 'สิทธิ์อ่านอย่างเดียว สำหรับผู้บังคับบัญชาหรือผู้ตรวจราชการ' },
            ].map((r) => {
              const isCurrent = currentRole === r.role;
              return (
                <div 
                  key={r.role}
                  className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                    isCurrent 
                      ? 'border-[#7C3AED] bg-purple-50/70 shadow-xs' 
                      : 'border-[#E7E0EF] hover:border-purple-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Lock className={`w-4 h-4 ${isCurrent ? 'text-[#7C3AED]' : 'text-gray-400'}`} />
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-[#7C3AED] bg-purple-100 px-2 py-0.5 rounded-full">
                          บทบาทปัจจุบัน
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-[#211A2B]">{r.title}</div>
                    <p className="text-[11px] text-[#756B80] leading-relaxed">{r.desc}</p>
                  </div>

                  <button
                    onClick={() => switchRole(r.role)}
                    className={`mt-4 w-full py-2 rounded-lg text-xs font-bold transition-colors ${
                      isCurrent 
                        ? 'bg-[#32145C] text-[#FFE082]' 
                        : 'border border-[#E7E0EF] hover:bg-gray-50 text-[#5B2A86]'
                    }`}
                  >
                    {isCurrent ? 'กำลังใช้งานบทบาทนี้' : 'สลับเพื่อทดสอบบทบาทนี้'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-[#E7E0EF] shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-[#E7E0EF] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#32145C]">ประวัติการปฏิบัติการในระบบ (Audit Trail)</h3>
              <p className="text-xs text-[#756B80]">บันทึกการกระทำที่สำคัญตามมาตรฐานความมั่นคงปลอดภัยสารสนเทศภาครัฐ</p>
            </div>

            <select
              value={auditActionFilter}
              onChange={(e) => setAuditActionFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-[#E7E0EF] rounded-xl text-[#211A2B] focus:outline-none"
            >
              <option value="all">ทุกกิจกรรม</option>
              <option value="create_assignment">การมอบหมายครู</option>
              <option value="export_sheets">การส่งออก Google Sheets</option>
              <option value="approve_activity">การอนุมัติกิจกรรม</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E7E0EF] text-[#756B80] bg-gray-50/70">
                  <th className="py-3 px-4 font-bold">วัน-เวลา</th>
                  <th className="py-3 px-4 font-bold">ผู้กระทำ</th>
                  <th className="py-3 px-4 font-bold">หมวดหมู่</th>
                  <th className="py-3 px-4 font-bold">กิจกรรม</th>
                  <th className="py-3 px-4 font-bold">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E0EF]/60">
                {filteredAudit.map((log) => (
                  <tr key={log.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-4 text-[#756B80] font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('th-TH')}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#211A2B]">{log.userName}</td>
                    <td className="py-3 px-4 text-[#5B2A86] font-semibold">{log.category}</td>
                    <td className="py-3 px-4 font-semibold text-[#32145C]">{log.action}</td>
                    <td className="py-3 px-4 text-gray-600 text-[11px]">{log.details || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Google Sheets Modal */}
      <ConfirmationModal
        isOpen={showSheetsConfirm}
        title="ส่งออกรายงานสู่ Google Sheets"
        description="ระบบจะสร้างเอกสาร Google Spreadsheet ใหม่ใน Google Drive ของท่าน พร้อมส่งออกข้อมูลสรุปทางสถิติและตารางปฏิบัติงานอย่างครบถ้วน"
        type="sheets"
        confirmLabel="ส่งออกข้อมูลทันที"
        cancelLabel="ยกเลิก"
        onConfirm={handleExportSheets}
        onCancel={() => setShowSheetsConfirm(false)}
      />
    </div>
  );
};

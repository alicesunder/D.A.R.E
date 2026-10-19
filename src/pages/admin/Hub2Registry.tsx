import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Personnel, School, Organization, PersonnelStatus, SchoolType } from '../../types';
import { 
  Users, 
  School as SchoolIcon, 
  Building2, 
  Search, 
  Plus, 
  Download, 
  FileSpreadsheet, 
  Eye, 
  Edit, 
  Trash2, 
  X, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown,
  ArrowUpDown,
  Phone,
  Mail,
  MapPin,
  Star,
  LayoutGrid,
  List,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import teacherPhotoMap from '../../data/teacherPhotoMap.json';

interface Hub2RegistryProps {
  initialTab?: 'personnel' | 'schools' | 'units';
}

export const Hub2Registry: React.FC<Hub2RegistryProps> = ({ initialTab = 'personnel' }) => {
  const { 
    personnel, 
    schools, 
    organizations, 
    addPersonnel, 
    updatePersonnel, 
    deletePersonnel,
    addSchool, 
    updateSchool, 
    deleteSchool,
    exportRosterToGoogleSheets,
    exportSchoolsToGoogleSheets,
    currentRole 
  } = useApp();

  // Active Sub-Tab: 'personnel' | 'schools' | 'units'
  const [activeTab, setActiveTab] = useState<'personnel' | 'schools' | 'units'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
    setSearchQuery('');
    setFilterOption('all');
  }, [initialTab]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [personnelView, setPersonnelView] = useState<'grid' | 'list'>('grid');
  const [directorySort, setDirectorySort] = useState<'latest' | 'name' | 'org' | 'favorites'>('latest');
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('dare-teacher-favorites') || '[]'); } catch { return []; } });
  const toggleFavorite = (id: string) => setFavoriteIds(prev => { const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]; try { localStorage.setItem('dare-teacher-favorites', JSON.stringify(next)); } catch {} return next; });

  // Personnel Modals
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);
  const [showPersonDetail, setShowPersonDetail] = useState(false);
  const [showPersonEdit, setShowPersonEdit] = useState(false);
  const [isEditingPerson, setIsEditingPerson] = useState(false);
  const [personFormData, setPersonFormData] = useState({
    rank: 'ร.ต.อ.',
    firstName: '',
    lastName: '',
    policeId: '',
    organizationId: organizations[2]?.id || organizations[0]?.id || '',
    organizationName: organizations[2]?.name || organizations[0]?.name || '',
    province: 'กาญจนบุรี',
    phone: '',
    email: '',
    status: 'active' as PersonnelStatus,
    certifiedYear: 2568,
    batchNumber: 'รุ่นที่ 29',
  });

  // School Modals
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showSchoolDetail, setShowSchoolDetail] = useState(false);
  const [showSchoolEdit, setShowSchoolEdit] = useState(false);
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [schoolFormData, setSchoolFormData] = useState({
    code: '',
    name: '',
    type: 'bpp_school' as SchoolType,
    province: 'เชียงใหม่',
    district: 'เวียงแหง',
    subdistrict: 'เมืองแหง',
    organizationId: organizations[2]?.id || organizations[0]?.id || '',
    organizationName: organizations[2]?.name || organizations[0]?.name || '',
    assignmentStatus: 'unassigned' as School['assignmentStatus'],
    totalStudents: 150,
    gradeLevels: 'ป.1 - ป.6',
    contactPerson: '',
    contactPhone: '',
    notes: '',
  });

  // Delete Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'person' | 'school' } | null>(null);

  // Sheets Export
  const [showSheetsConfirm, setShowSheetsConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [sheetsNotice, setSheetsNotice] = useState<{ url?: string; message: string } | null>(null);

  // Unit Hierarchy Tree state
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'org-hq': true,
    'org-reg-1': true,
    'org-reg-2': true,
    'org-reg-3': true,
    'org-reg-4': true,
  });
  const [selectedUnit, setSelectedUnit] = useState<Organization | null>(organizations[0] || null);

  // Filtered Personnel
  const filteredPersonnel = useMemo(() => {
    return personnel.filter(p => {
      const query = searchQuery.trim().toLowerCase();
      const matchSearch = !query || [p.rank, p.firstName, p.lastName, p.organizationName, p.province, p.batchNumber, p.policeId].some(value => String(value || '').toLowerCase().includes(query));
      const matchFilter = filterOption === 'all' || (filterOption.startsWith('province:') ? p.province === filterOption.slice(9) : filterOption.startsWith('org:') ? p.organizationName === filterOption.slice(4) : p.status === filterOption);
      return matchSearch && matchFilter;
    });
  }, [personnel, searchQuery, filterOption]);

  // Filtered Schools
  const filteredSchools = useMemo(() => {
    return schools.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.province.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = filterOption === 'all' || s.assignmentStatus === filterOption;
      return matchSearch && matchFilter;
    });
  }, [schools, searchQuery, filterOption]);

  const handleOpenAdd = () => {
    if (activeTab === 'personnel') {
      setIsEditingPerson(false);
      setPersonFormData({
        rank: 'ร.ต.อ.',
        firstName: '',
        lastName: '',
        policeId: `POL-${Math.floor(10000 + Math.random() * 90000)}`,
        organizationId: organizations[2]?.id || organizations[0]?.id || '',
        organizationName: organizations[2]?.name || organizations[0]?.name || '',
        province: 'กาญจนบุรี',
        phone: '081-123-4567',
        email: 'officer.dare@bpp.police.go.th',
        status: 'active',
        certifiedYear: 2568,
        batchNumber: 'รุ่นที่ 29',
      });
      setShowPersonEdit(true);
    } else if (activeTab === 'schools') {
      setIsEditingSchool(false);
      setSchoolFormData({
        code: `SCH-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        type: 'bpp_school',
        province: 'เชียงใหม่',
        district: 'เวียงแหง',
        subdistrict: 'เมืองแหง',
        organizationId: organizations[2]?.id || organizations[0]?.id || '',
        organizationName: organizations[2]?.name || organizations[0]?.name || '',
        assignmentStatus: 'unassigned',
        totalStudents: 150,
        gradeLevels: 'ป.1 - ป.6',
        contactPerson: 'ครูใหญ่',
        contactPhone: '081-000-0000',
        notes: '',
      });
      setShowSchoolEdit(true);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      if (deleteTarget.type === 'person') {
        deletePersonnel(deleteTarget.id);
      } else {
        deleteSchool(deleteTarget.id);
      }
      setDeleteTarget(null);
      setShowDeleteModal(false);
    }
  };

  const handleConfirmSheetsExport = async () => {
    try {
      setIsExporting(true);
      const res = activeTab === 'personnel'
        ? await exportRosterToGoogleSheets()
        : await exportSchoolsToGoogleSheets();
      setSheetsNotice({ url: res.url, message: res.message });
      setShowSheetsConfirm(false);
    } catch (err: any) {
      alert(err.message || 'ส่งออก Google Sheets ไม่สำเร็จ');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="dare-registry-page space-y-6 w-full max-w-none mx-auto">
      {/* Header with Segmented Navigation */}
      <div className="dare-registry-heading relative flex flex-col md:flex-row md:items-end justify-between gap-4 overflow-hidden rounded-[28px] border border-[#E8DDF6] bg-gradient-to-r from-white via-[#FBF8FF] to-[#F0E7FF] p-5 sm:p-7 shadow-[0_12px_36px_rgba(72,35,115,0.07)]">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E4D5F7] bg-white/80 px-3 py-1 text-[11px] font-extrabold text-[#6D28D9] tracking-wider shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#D6B15E] shadow-[0_0_0_3px_rgba(214,177,94,.15)]"/> โซนที่ 2 · ฐานข้อมูลและโครงสร้าง
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#25103F] tracking-tight">
            ทะเบียนกำลังพลและสถานศึกษา
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#756887]">ศูนย์รวมทำเนียบครูตำรวจ D.A.R.E. ทะเบียนโรงเรียนในเครือข่าย และผังโครงสร้าง บช.ตชด.</p>
        </div>

        {/* Global Hub Action Buttons */}
        <div className="relative z-10 flex items-center gap-2 flex-wrap">
          {activeTab !== 'units' && (
            <button
              onClick={() => setShowSheetsConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#116630] rounded-lg transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>ส่งออก Google Sheets</span>
            </button>
          )}

          {(currentRole === 'central_admin' || currentRole === 'unit_admin') && activeTab !== 'units' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#1C1726] bg-[#D6B15E] hover:bg-[#C29F4C] rounded-lg transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#250E42]" />
              <span>{activeTab === 'personnel' ? 'เพิ่มครู D.A.R.E.' : 'เพิ่มโรงเรียน'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sheets Notice */}
      {sheetsNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{sheetsNotice.message}</span>
          </div>
          {sheetsNotice.url && (
            <a href={sheetsNotice.url} target="_blank" rel="noreferrer" className="font-bold underline text-emerald-800">
              เปิดดูสเปรดชีต
            </a>
          )}
        </div>
      )}

      {/* Modern Segmented Control Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-2 rounded-xl border border-[#EAE5F2] shadow-2xs">
        <div className="flex flex-wrap items-center gap-1 bg-[#FAF9FD] p-1 rounded-lg border border-[#EAE5F2]">
          <button
            onClick={() => {
              setActiveTab('personnel');
              setSearchQuery('');
              setFilterOption('all');
            }}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === 'personnel'
                ? 'bg-white text-[#250E42] shadow-xs'
                : 'text-[#696075] hover:text-[#1C1726]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#6D28D9]" />
            <span>ทำเนียบครู D.A.R.E. ({personnel.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('schools');
              setSearchQuery('');
              setFilterOption('all');
            }}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === 'schools'
                ? 'bg-white text-[#250E42] shadow-xs'
                : 'text-[#696075] hover:text-[#1C1726]'
            }`}
          >
            <SchoolIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>ทะเบียนโรงเรียน ({schools.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('units');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === 'units'
                ? 'bg-white text-[#250E42] shadow-xs'
                : 'text-[#696075] hover:text-[#1C1726]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            <span>โครงสร้างหน่วยงาน ตชด.</span>
          </button>
        </div>

        {/* Search & Filter for Active Tab */}
        {activeTab !== 'units' && (
          <div className="flex items-center gap-2 text-xs">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8E869B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'personnel' ? 'ค้นหาชื่อ ยศ หรือจังหวัด...' : 'ค้นหาชื่อโรงเรียน หรืออำเภอ...'}
                className="w-full pl-8 pr-3 py-1.5 bg-[#FAF9FD] border border-[#EAE5F2] rounded-lg text-xs"
              />
            </div>

            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
              className="bg-[#FAF9FD] border border-[#EAE5F2] rounded-lg px-2.5 py-1.5 text-xs text-[#1C1726]"
            >
              <option value="all">ทั้งหมด</option>
              {activeTab === 'personnel' ? (
                <>
                  <option value="active">พร้อมปฏิบัติหน้าที่</option>
                  <option value="leave">ลาพัก</option>
                </>
              ) : (
                <>
                  <option value="assigned">มีครูรับผิดชอบแล้ว</option>
                  <option value="unassigned">ยังไม่มีครูรับผิดชอบ</option>
                </>
              )}
            </select>
          </div>
        )}
      </div>

      {/* VIEW 1: D.A.R.E. TEACHER DIRECTORY */}
      {activeTab === 'personnel' && (() => {
        const provinceCount = new Set(personnel.map(p => p.province).filter(Boolean)).size;
        const organizationCount = new Set(personnel.map(p => p.organizationId || p.organizationName).filter(Boolean)).size;
        const totalStudents = 0; // ไม่พบยอดนักเรียนที่ยืนยันได้ในข้อมูลครูชุดนี้
        return <div className="space-y-5">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 text-white bg-gradient-to-br from-[#7B3FC6] via-[#6D28D9] to-[#4C1D95] shadow-lg shadow-purple-200/70 min-h-[104px]">
              <div className="absolute -right-5 -top-7 w-28 h-28 rounded-full bg-white/10"/><div className="absolute right-5 bottom-3 w-12 h-12 rounded-full bg-white/10"/>
              <div className="relative flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0"><Users className="w-6 h-6"/></div><div><div className="text-xs sm:text-sm text-white/85">ครู D.A.R.E. ทั้งหมด</div><div className="text-2xl sm:text-3xl font-black tracking-tight">{personnel.length.toLocaleString('th-TH')} <span className="text-sm font-semibold">คน</span></div></div></div>
            </div>
            <div className="rounded-2xl p-4 sm:p-5 bg-white border border-[#E8E4EF] shadow-sm min-h-[104px] flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-[#EDE4F7] text-[#5B2A86] flex items-center justify-center shrink-0"><Building2 className="w-6 h-6"/></div><div><div className="text-xs sm:text-sm text-[#777184]">หน่วยงานที่เข้าร่วม</div><div className="text-2xl sm:text-3xl font-black text-[#291C45]">{organizationCount.toLocaleString('th-TH')} <span className="text-sm font-semibold">หน่วย</span></div></div></div>
            <div className="rounded-2xl p-4 sm:p-5 bg-white border border-[#E8E4EF] shadow-sm min-h-[104px] flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-[#F1E9FF] text-[#7B3FC6] flex items-center justify-center shrink-0"><MapPin className="w-6 h-6"/></div><div><div className="text-xs sm:text-sm text-[#777184]">จังหวัดที่มีครู</div><div className="text-2xl sm:text-3xl font-black text-[#291C45]">{provinceCount.toLocaleString('th-TH')} <span className="text-sm font-semibold">จังหวัด</span></div></div></div>
            <div className="rounded-2xl p-4 sm:p-5 bg-white border border-[#E8E4EF] shadow-sm min-h-[104px] flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-[#FFF2D7] text-[#B7791F] flex items-center justify-center shrink-0"><GraduationCap className="w-6 h-6"/></div><div><div className="text-xs sm:text-sm text-[#777184]">นักเรียนที่ได้รับการสอน</div><div className="text-2xl sm:text-3xl font-black text-[#291C45]">{totalStudents.toLocaleString('th-TH')} <span className="text-sm font-semibold">คน</span></div><div className="text-[10px] text-[#9A91A8]">ยังไม่มีข้อมูลยืนยันในทะเบียน</div></div></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,1fr)_190px_190px_160px_auto] gap-2.5 bg-white p-3 rounded-2xl border border-[#E8E4EF] shadow-sm">
            <div className="relative"><Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E7CA7]"/><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') e.currentTarget.blur();}} placeholder="ค้นหาชื่อ-นามสกุล ตำแหน่ง หรือหน่วยงาน..." className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#FBFAFD] border border-[#E8E4EF] text-sm text-[#291C45] outline-none focus:ring-2 focus:ring-[#7B3FC6]/20 focus:border-[#7B3FC6]"/></div>
            <select value={filterOption.startsWith('province:') ? filterOption : 'all'} onChange={e=>setFilterOption(e.target.value)} className="h-11 px-3 rounded-xl bg-[#FBFAFD] border border-[#E8E4EF] text-sm text-[#514565]"><option value="all">ทุกจังหวัด / ทุกสถานะ</option>{Array.from(new Set(personnel.map(p=>p.province).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'th')).map(province=><option key={province} value={`province:${province}`}>{province}</option>)}</select>
            <select value={filterOption.startsWith('org:') ? filterOption : 'all'} onChange={e=>setFilterOption(e.target.value)} className="h-11 px-3 rounded-xl bg-[#FBFAFD] border border-[#E8E4EF] text-sm text-[#514565]"><option value="all">ทุกหน่วยงาน</option>{Array.from(new Set(personnel.map(p=>p.organizationName).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'th')).map(org=><option key={org} value={`org:${org}`}>{org}</option>)}</select>
            <select value={filterOption==='active'||filterOption==='leave'?'status:'+filterOption:'all'} onChange={e=>setFilterOption(e.target.value==='all'?'all':e.target.value.replace('status:',''))} className="h-11 px-3 rounded-xl bg-[#FBFAFD] border border-[#E8E4EF] text-sm text-[#514565]"><option value="all">ทุกสถานะ</option><option value="status:active">ปฏิบัติหน้าที่</option><option value="status:leave">ลาพัก</option></select>
            <button onClick={()=>{setSearchQuery('');setFilterOption('all');}} className="h-11 px-5 rounded-xl bg-[#5B2A86] hover:bg-[#48206C] text-white text-sm font-bold transition-colors">ล้างตัวกรอง</button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3"><div className="w-11 h-11 rounded-xl bg-[#EDE4F7] text-[#5B2A86] flex items-center justify-center"><BookOpen className="w-6 h-6"/></div><div><h2 className="text-xl sm:text-2xl font-extrabold text-[#291C45]">รายชื่อครู D.A.R.E.</h2><p className="text-sm text-[#777184]">ครูตำรวจผู้สร้างอนาคตที่ดีให้กับเยาวชนไทย · พบ {filteredPersonnel.length.toLocaleString('th-TH')} จาก {personnel.length.toLocaleString('th-TH')} รายชื่อ</p></div></div>
            <div className="flex items-center gap-2 self-end sm:self-auto"><span className="text-xs text-[#777184]">เรียงตาม</span><select value={directorySort} className="h-10 px-3 rounded-xl bg-white border border-[#E8E4EF] text-sm text-[#514565]" onChange={e=>setDirectorySort(e.target.value as 'latest'|'name'|'org'|'favorites')}><option value="latest">ล่าสุด</option><option value="name">ชื่อ A–Z</option><option value="org">หน่วยงาน</option><option value="favorites">รายการโปรด</option></select><div className="flex rounded-xl border border-[#E8E4EF] bg-white p-1"><button aria-label="Grid view" onClick={()=>setPersonnelView('grid')} className={`w-9 h-8 rounded-lg flex items-center justify-center ${personnelView==='grid'?'bg-[#6D28D9] text-white':'text-[#777184] hover:bg-purple-50'}`}><LayoutGrid className="w-4 h-4"/></button><button aria-label="List view" onClick={()=>setPersonnelView('list')} className={`w-9 h-8 rounded-lg flex items-center justify-center ${personnelView==='list'?'bg-[#6D28D9] text-white':'text-[#777184] hover:bg-purple-50'}`}><List className="w-4 h-4"/></button></div></div>
          </div>
          {(directorySort==='favorites' ? filteredPersonnel.filter(p=>favoriteIds.includes(p.id)) : [...filteredPersonnel].sort((a,b)=>directorySort==='name' ? `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`,'th') : directorySort==='org' ? String(a.organizationName||'').localeCompare(String(b.organizationName||''),'th') : 0)).length===0 ? <div className="bg-white rounded-2xl border border-[#E8E4EF] p-12 text-center"><Users className="w-10 h-10 mx-auto text-[#B9A9D0] mb-3"/><div className="font-bold text-[#291C45]">ไม่พบรายชื่อครูที่ตรงกับการค้นหา</div><button onClick={()=>{setSearchQuery('');setFilterOption('all');}} className="mt-3 text-sm font-bold text-[#6D28D9]">ล้างตัวกรอง</button></div> : <div className={personnelView==='grid'?'grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-5':'flex flex-col gap-3'}>
            {(directorySort==='favorites' ? filteredPersonnel.filter(p=>favoriteIds.includes(p.id)) : [...filteredPersonnel].sort((a,b)=>directorySort==='name' ? `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`,'th') : directorySort==='org' ? String(a.organizationName||'').localeCompare(String(b.organizationName||''),'th') : 0)).map((p,idx)=>{
              const teacherPhoto = p.sourceRow != null ? (teacherPhotoMap as Record<string, string>)[String(p.sourceRow)] : undefined;
              const initials = `${p.firstName?.trim()?.[0]||''}${p.lastName?.trim()?.[0]||''}`;
              return <article key={p.id} className={`group relative bg-white overflow-hidden rounded-[28px] border border-[#E7DDF2] shadow-[0_10px_32px_rgba(67,36,108,0.07)] hover:shadow-[0_22px_48px_rgba(92,48,145,0.17)] hover:-translate-y-1.5 transition-all duration-300 ${personnelView==='list'?'flex items-center gap-4 p-3':''}`}>
                <div className={`relative overflow-hidden ${personnelView==='grid'?'h-60 sm:h-64':'w-24 h-24 rounded-2xl shrink-0'}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E8DFFF] via-[#BCA3F5] to-[#7042B7]" />
                  <div className="absolute -top-10 -right-6 h-40 w-40 rounded-full border-[22px] border-white/20" />
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#2D174B]/65 to-transparent" />
                  {teacherPhoto ? <img src={teacherPhoto} alt={`รูป ${p.rank} ${p.firstName} ${p.lastName}`} loading="lazy" className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]" onError={e=>{e.currentTarget.style.display='none';}} /> : null}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className={`flex items-center justify-center rounded-full border-[5px] border-white/80 bg-white/25 text-white font-black shadow-xl backdrop-blur-sm ${teacherPhoto?'opacity-0':'opacity-100'} ${personnelView==='grid'?'w-24 h-24 text-3xl':'w-14 h-14 text-lg'}`}>{initials}</div></div>
                  <div className="absolute left-4 bottom-4 flex items-center gap-2 text-white"><span className="h-2 w-2 rounded-full bg-[#9EF0C2] ring-4 ring-white/15"/><span className="text-[10px] font-extrabold tracking-[0.18em] uppercase">D.A.R.E. Instructor</span></div>
                  <button onClick={()=>toggleFavorite(p.id)} title={favoriteIds.includes(p.id)?'นำออกจากรายการโปรด':'เพิ่มรายการโปรด'} className={`absolute right-3 top-3 w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/50 shadow-lg transition ${favoriteIds.includes(p.id)?'bg-[#FFD56A] text-[#4E2B78]':'bg-white/70 text-[#67449A] hover:bg-white'}`}><Star className={`w-4 h-4 ${favoriteIds.includes(p.id)?'fill-current':''}`}/></button>
                </div>
                <div className={`p-5 sm:p-6 min-w-0 ${personnelView==='list'?'flex-1':''}`}>
                  <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="text-[10px] font-extrabold tracking-[0.16em] text-[#9A80C3] uppercase">ครูตำรวจ D.A.R.E.</div><h3 className="mt-1.5 text-[17px] font-extrabold leading-snug text-[#291C45] break-words">{p.rank} {p.firstName} {p.lastName}</h3></div><span className={`shrink-0 mt-1 h-2.5 w-2.5 rounded-full ring-4 ${p.status==='active'?'bg-emerald-500 ring-emerald-100':'bg-amber-500 ring-amber-100'}`} title={p.status==='active'?'ปฏิบัติหน้าที่':'ลาพัก'} /></div>
                  <p className="mt-2 text-xs text-[#8A7C9F]">{p.batchNumber || 'ไม่ระบุรุ่น'} <span className="mx-1.5 text-[#D6C9E7]">/</span> อบรมปี {p.certifiedYear || '—'}</p>
                  <div className="mt-4 space-y-3 text-xs text-[#625570]"><div className="flex items-start gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F2EBFC] text-[#7B3FC6]"><Building2 className="w-4 h-4"/></span><span className="pt-1.5 leading-relaxed break-words">{p.organizationName || 'ไม่ระบุหน่วยงาน'}</span></div><div className="flex items-start gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFF3D9] text-[#B7791F]"><MapPin className="w-4 h-4"/></span><span className="pt-1.5">จังหวัด{p.province || 'ไม่ระบุ'}</span></div></div>
                  <div className="mt-4 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3EDFC] text-[#5B2A86] px-3 py-1.5 text-[10px] font-extrabold"><SchoolIcon className="w-3.5 h-3.5"/>{p.assignedSchoolCount>0?`${p.assignedSchoolCount} โรงเรียน`:'ยังไม่ระบุโรงเรียน'}</span><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold ${p.status==='active'?'bg-[#E8F8EF] text-[#197447]':'bg-[#FFF3D9] text-[#9A650D]'}`}>{p.status==='active'?'ปฏิบัติหน้าที่':'ลาพัก'}</span></div>
                  <div className="mt-5 pt-4 border-t border-[#F0EAF6] flex items-center justify-between gap-2"><button onClick={()=>{setSelectedPerson(p);setShowPersonDetail(true);}} className="flex-1 h-10 px-3 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#8B5BD6] text-white hover:from-[#5820B5] hover:to-[#7443C0] text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-purple-200/70 transition"><Eye className="w-4 h-4"/> ดูข้อมูลครู <ChevronRight className="w-3.5 h-3.5"/></button>{(currentRole==='central_admin'||currentRole==='unit_admin')&&<><button onClick={()=>{setSelectedPerson(p);setPersonFormData({rank:p.rank,firstName:p.firstName,lastName:p.lastName,policeId:p.policeId,organizationId:p.organizationId,organizationName:p.organizationName,province:p.province,phone:p.phone,email:p.email,status:p.status,certifiedYear:p.certifiedYear,batchNumber:p.batchNumber});setIsEditingPerson(true);setShowPersonEdit(true);}} title="แก้ไขข้อมูล" className="h-10 w-10 rounded-xl text-[#6842A0] bg-[#F5F0FC] hover:bg-[#EAE0FA] flex items-center justify-center transition"><Edit className="w-4 h-4"/></button><button onClick={()=>{setDeleteTarget({id:p.id,type:'person'});setShowDeleteModal(true);}} title="ลบข้อมูล" className="h-10 w-10 rounded-xl text-[#C2415D] bg-[#FFF0F2] hover:bg-[#FFE0E5] flex items-center justify-center transition"><Trash2 className="w-4 h-4"/></button></>}</div>
                </div>
              </article>;
            })}
          </div>}
        </div>;
      })()}

      {/* VIEW 2: SCHOOL DIRECTORY TABLE */}
      {activeTab === 'schools' && (
        <div className="bg-white rounded-2xl border border-[#EAE5F2] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9FD] text-[#696075] font-semibold border-b border-[#EAE5F2]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">ลำดับ</th>
                  <th className="py-3 px-4">รหัส</th>
                  <th className="py-3 px-4">ชื่อสถานศึกษา</th>
                  <th className="py-3 px-4">ประเภท</th>
                  <th className="py-3 px-4">พื้นที่</th>
                  <th className="py-3 px-4">ครู D.A.R.E. ประจำการ</th>
                  <th className="py-3 px-4 text-center">นักเรียน</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5F2] text-[#1C1726]">
                {filteredSchools.map((s, idx) => {
                  const assignedOfficers = personnel.filter(p => s.assignedPersonnelIds.includes(p.id));
                  return (
                    <tr key={s.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="py-3 px-4 text-center text-[#8E869B] tabular-nums">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#6D28D9]">{s.code}</td>
                      <td className="py-3 px-4 font-bold text-[#1C1726]">{s.name}</td>
                      <td className="py-3 px-4 text-[#696075]">
                        {s.type === 'bpp_school' ? 'รร.ตชด.' : 'สพฐ. ร่วมโครงการ'}
                      </td>
                      <td className="py-3 px-4">อ.{s.district} จ.{s.province}</td>
                      <td className="py-3 px-4">
                        {assignedOfficers.length > 0 ? (
                          <span className="text-[#15803D] font-medium">
                            {assignedOfficers.map(o => `${o.rank} ${o.firstName}`).join(', ')}
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold">ยังไม่มีครู</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold tabular-nums">{s.totalStudents} คน</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedSchool(s);
                              setShowSchoolDetail(true);
                            }}
                            className="p-1 text-[#6D28D9] hover:bg-purple-100 rounded"
                            title="ดูข้อมูล"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(currentRole === 'central_admin' || currentRole === 'unit_admin') && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedSchool(s);
                                  setSchoolFormData({
                                    code: s.code,
                                    name: s.name,
                                    type: s.type,
                                    province: s.province,
                                    district: s.district,
                                    subdistrict: s.subdistrict,
                                    organizationId: s.organizationId,
                                    organizationName: s.organizationName,
                                    assignmentStatus: s.assignmentStatus,
                                    totalStudents: s.totalStudents,
                                    gradeLevels: s.gradeLevels,
                                    contactPerson: s.contactPerson || '',
                                    contactPhone: s.contactPhone || '',
                                    notes: s.notes || '',
                                  });
                                  setIsEditingSchool(true);
                                  setShowSchoolEdit(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="แก้ไข"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTarget({ id: s.id, type: 'school' });
                                  setShowDeleteModal(true);
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: UNIT HIERARCHY TREE */}
      {activeTab === 'units' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#EAE5F2] shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-[#1C1726]">ผังโครงสร้างสายการบังคับบัญชา ตชด.</h3>
            <div className="space-y-2 text-xs">
              {organizations.filter(o => o.level === 'hq').map(hq => (
                <div key={hq.id} className="space-y-2">
                  <div
                    onClick={() => setSelectedUnit(hq)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                      selectedUnit?.id === hq.id ? 'border-[#6D28D9] bg-purple-50/70 ring-1 ring-[#6D28D9]' : 'border-[#EAE5F2]'
                    }`}
                  >
                    <span className="font-bold text-[#250E42] text-sm">{hq.name} ({hq.shortName})</span>
                    <span className="text-[11px] text-[#8E869B]">ส่วนกลาง</span>
                  </div>

                  <div className="pl-6 space-y-2 border-l-2 border-purple-200 ml-4">
                    {organizations.filter(o => o.level === 'region').map(reg => (
                      <div key={reg.id} className="space-y-1">
                        <div
                          onClick={() => setSelectedUnit(reg)}
                          className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer ${
                            selectedUnit?.id === reg.id ? 'border-[#6D28D9] bg-purple-50 font-bold' : 'border-[#EAE5F2] bg-white'
                          }`}
                        >
                          <span className="font-semibold text-[#1C1726]">{reg.name}</span>
                          <span className="text-[10px] text-[#8E869B]">จ.{reg.province}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#EAE5F2] shadow-2xs space-y-4">
            {selectedUnit ? (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-xs text-[#6D28D9] font-semibold">{selectedUnit.code}</div>
                  <h3 className="text-lg font-bold text-[#1C1726]">{selectedUnit.name}</h3>
                  <p className="text-[#696075]">พื้นที่รับผิดชอบ: จ.{selectedUnit.province}</p>
                </div>

                <div className="p-4 bg-[#FAF9FD] rounded-xl border border-[#EAE5F2] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#696075]">ครู D.A.R.E. ในสังกัด:</span>
                    <span className="font-bold tabular-nums">
                      {personnel.filter(p => p.organizationId === selectedUnit.id).length} นาย
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#696075]">โรงเรียนที่รับผิดชอบ:</span>
                    <span className="font-bold tabular-nums">
                      {schools.filter(s => s.organizationId === selectedUnit.id).length} แห่ง
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#8E869B]">เลือกหน่วยงานเพื่อดูสถิติ</div>
            )}
          </div>
        </div>
      )}

      {/* Teacher profile detail — editorial profile layout */}
      {showPersonDetail && selectedPerson && (() => {
        const person = selectedPerson;
        const photo = person.sourceRow != null ? (teacherPhotoMap as Record<string, string>)[String(person.sourceRow)] : undefined;
        const field = (label: string, value?: string | number | null, icon?: React.ReactNode) => <div className="rounded-2xl border border-[#EEE7F7] bg-white p-4"><div className="flex items-center gap-2 text-[11px] font-bold text-[#9A83B9]">{icon}<span>{label}</span></div><div className="mt-2 text-sm font-bold leading-relaxed text-[#302044] break-words">{value || 'ไม่ระบุข้อมูล'}</div></div>;
        return <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#211331]/60 p-0 sm:p-5 backdrop-blur-sm" onMouseDown={e=>{if(e.target===e.currentTarget)setShowPersonDetail(false);}}>
          <section role="dialog" aria-modal="true" aria-label="ข้อมูลครู D.A.R.E." className="relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-[30px] sm:rounded-[30px] bg-[#FBF9FE] shadow-2xl">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#321A51] via-[#5B2A86] to-[#9168D4] px-6 pb-7 pt-6 text-white sm:px-8"><div className="absolute -right-8 -top-16 h-56 w-56 rounded-full border-[30px] border-white/10"/><div className="absolute right-24 -bottom-20 h-48 w-48 rounded-full bg-[#F6D98A]/15 blur-2xl"/><div className="relative flex items-start justify-between gap-4"><div><div className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#F7D98A]">D.A.R.E. THAILAND · TEACHER PROFILE</div><h2 className="mt-2 text-2xl sm:text-3xl font-black">ข้อมูลครูตำรวจ D.A.R.E.</h2><p className="mt-1 text-sm text-white/70">ทำเนียบครูผู้สร้างภูมิคุ้มกันให้เยาวชนไทย</p></div><button onClick={()=>setShowPersonDetail(false)} aria-label="ปิดหน้าต่าง" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20"><X className="w-5 h-5"/></button></div>
              <div className="relative mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-end"><div className="h-32 w-32 shrink-0 overflow-hidden rounded-[28px] border-4 border-white/70 bg-white/20 shadow-xl">{photo?<img src={photo} alt={`${person.rank} ${person.firstName} ${person.lastName}`} className="h-full w-full object-cover object-top" onError={e=>{e.currentTarget.style.display='none';}}/>:<div className="flex h-full w-full items-center justify-center text-4xl font-black">{person.firstName?.[0]}{person.lastName?.[0]}</div>}</div><div className="min-w-0 flex-1 text-center sm:pb-2 sm:text-left"><div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold"><span className={`h-2 w-2 rounded-full ${person.status==='active'?'bg-[#8CF0B7]':'bg-[#FFD66E]'}`}/>{person.status==='active'?'ปฏิบัติหน้าที่':'ลาพัก/สถานะอื่น'}</div><h3 className="mt-3 text-xl sm:text-2xl font-black leading-snug">{person.rank} {person.firstName} {person.lastName}</h3><p className="mt-1 text-sm text-white/75">{person.position || 'ครูตำรวจ D.A.R.E.'}</p></div><div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center sm:min-w-28"><div className="text-[10px] font-bold text-white/65">รหัสประจำตัว</div><div className="mt-1 font-mono text-sm font-extrabold">{person.policeId || '—'}</div></div></div>
            </div>
            <div className="space-y-5 p-5 sm:p-8"><div><div className="mb-3 flex items-center gap-2"><span className="h-7 w-1.5 rounded-full bg-[#8A5AD0]"/><h4 className="font-extrabold text-[#302044]">ข้อมูลประจำตัวและสังกัด</h4></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{field('หน่วยงานต้นสังกัด',person.organizationName,<Building2 className="h-4 w-4"/>)}{field('จังหวัด',person.province,<MapPin className="h-4 w-4"/>)}{field('รุ่นอบรม D.A.R.E.',person.batchNumber,<GraduationCap className="h-4 w-4"/>)}{field('ปีที่ผ่านการอบรม',person.certifiedYear,<BookOpen className="h-4 w-4"/>)}{field('จำนวนโรงเรียนที่รับผิดชอบ',person.assignedSchoolCount?`${person.assignedSchoolCount} โรงเรียน`:'ยังไม่ระบุ',<SchoolIcon className="h-4 w-4"/>)}{field('จำนวนกิจกรรมที่ดำเนินการ',person.totalActivitiesConducted?`${person.totalActivitiesConducted} กิจกรรม`:'ไม่ระบุข้อมูล',<Star className="h-4 w-4"/>)}{field('โทรศัพท์',person.phone,<Phone className="h-4 w-4"/>)}{field('อีเมล',person.email,<Mail className="h-4 w-4"/>)}</div></div><div className="flex flex-col-reverse gap-2 border-t border-[#EAE1F3] pt-4 sm:flex-row sm:justify-end"><button onClick={()=>setShowPersonDetail(false)} className="h-11 rounded-xl border border-[#E5D9F1] bg-white px-5 text-sm font-bold text-[#65458B] hover:bg-[#F5EFFC]">ปิดหน้าต่าง</button>{(currentRole==='central_admin'||currentRole==='unit_admin')&&<button onClick={()=>{setShowPersonDetail(false);setPersonFormData({rank:person.rank,firstName:person.firstName,lastName:person.lastName,policeId:person.policeId,organizationId:person.organizationId,organizationName:person.organizationName,province:person.province,phone:person.phone,email:person.email,status:person.status,certifiedYear:person.certifiedYear,batchNumber:person.batchNumber});setIsEditingPerson(true);setShowPersonEdit(true);}} className="h-11 rounded-xl bg-[#6D28D9] px-5 text-sm font-extrabold text-white shadow-lg shadow-purple-200 hover:bg-[#5721B2]">แก้ไขข้อมูลครู</button>}</div></div>
          </section>
        </div>;
      })()}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="ยืนยันการลบข้อมูล"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้ออกจากระบบ? ข้อมูลการมอบหมายและกิจกรรมที่ผูกพันจะได้รับการปรับปรุงตามลำดับ"
        type="danger"
        confirmLabel="ยืนยันลบ"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Confirmation Modal for Sheets */}
      <ConfirmationModal
        isOpen={showSheetsConfirm}
        title="ส่งออกข้อมูลสู่ Google Sheets"
        description="ระบบจะสร้างเอกสาร Google Spreadsheet ใหม่ใน Google Drive ของคุณ และบันทึกข้อมูลตารางปัจจุบัน"
        type="sheets"
        confirmLabel="ยืนยันสร้างเอกสาร"
        isLoading={isExporting}
        onConfirm={handleConfirmSheetsExport}
        onCancel={() => setShowSheetsConfirm(false)}
      />
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Personnel, PersonnelStatus } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  FileSpreadsheet, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Shield, 
  School, 
  Calendar, 
  CheckCircle2, 
  ArrowUpDown,
  RotateCcw,
  Phone,
  Mail,
  Award,
  MapPin,
  Building2,
  GraduationCap,
  Star,
  LayoutGrid,
  List as ListIcon,
  BookOpen
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import teacherPhotoMap from '../../data/teacherPhotoMap.json';

export const PersonnelPage: React.FC = () => {
  const { 
    personnel, 
    organizations, 
    schools, 
    addPersonnel, 
    updatePersonnel, 
    deletePersonnel,
    exportRosterToGoogleSheets,
    currentRole
  } = useApp();

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [rankFilter, setRankFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('dare-teacher-favorites') || '[]'); } catch { return []; } });

  // Sorting and Pagination
  const [sortField, setSortField] = useState<keyof Personnel>('updatedAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    rank: 'ร.ต.อ.',
    firstName: '',
    lastName: '',
    policeId: '',
    organizationId: organizations[0]?.id || '',
    organizationName: organizations[0]?.name || '',
    province: 'กาญจนบุรี',
    phone: '',
    email: '',
    status: 'active' as PersonnelStatus,
    certifiedYear: 2568,
    batchNumber: 'รุ่นที่ 29',
  });

  // Google Sheets Export confirmation
  const [showSheetsConfirm, setShowSheetsConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [sheetsNotice, setSheetsNotice] = useState<{ url?: string; message: string } | null>(null);

  // Filter Logic
  const filteredPersonnel = useMemo(() => {
    return personnel.filter((p) => {
      const matchSearch =
        p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.policeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.rank.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.province.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRank = rankFilter === 'all' || p.rank === rankFilter;
      const matchOrg = orgFilter === 'all' || p.organizationId === orgFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchProvince = provinceFilter === 'all' || p.province === provinceFilter;
      const matchAssignment =
        assignmentFilter === 'all'
          ? true
          : assignmentFilter === 'assigned'
          ? p.assignedSchoolCount > 0
          : p.assignedSchoolCount === 0;

      return matchSearch && matchRank && matchOrg && matchStatus && matchProvince && matchAssignment;
    });
  }, [personnel, searchQuery, rankFilter, orgFilter, statusFilter, provinceFilter, assignmentFilter]);

  // Sorting
  const sortedPersonnel = useMemo(() => {
    return [...filteredPersonnel].sort((a, b) => {
      const valA = a[sortField] ?? '';
      const valB = b[sortField] ?? '';
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredPersonnel, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedPersonnel.length / pageSize) || 1;
  const paginatedList = sortedPersonnel.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleFavorite = (id: string) => {
    setFavorites(previous => {
      const next = previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id];
      try { localStorage.setItem('dare-teacher-favorites', JSON.stringify(next)); } catch { /* storage may be unavailable */ }
      return next;
    });
  };

  const handleSort = (field: keyof Personnel) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
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
    setShowEditModal(true);
  };

  const handleOpenEdit = (p: Personnel) => {
    setIsEditing(true);
    setSelectedPerson(p);
    setFormData({
      rank: p.rank,
      firstName: p.firstName,
      lastName: p.lastName,
      policeId: p.policeId,
      organizationId: p.organizationId,
      organizationName: p.organizationName,
      province: p.province,
      phone: p.phone,
      email: p.email,
      status: p.status,
      certifiedYear: p.certifiedYear,
      batchNumber: p.batchNumber,
    });
    setShowEditModal(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const org = organizations.find(o => o.id === formData.organizationId);
    const orgName = org ? org.name : formData.organizationName;

    if (isEditing && selectedPerson) {
      updatePersonnel(selectedPerson.id, {
        ...formData,
        organizationName: orgName,
      });
    } else {
      addPersonnel({
        ...formData,
        organizationName: orgName,
      });
    }
    setShowEditModal(false);
  };

  const handleConfirmDelete = () => {
    if (targetDeleteId) {
      deletePersonnel(targetDeleteId);
      setTargetDeleteId(null);
      setShowDeleteModal(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ลำดับ,ยศ,ชื่อ,นามสกุล,รหัสตำรวจ,หน่วยงาน,จังหวัด,สถานะ,รุ่น,จำนวนโรงเรียน'];
    const rows = filteredPersonnel.map((p, idx) =>
      `${idx + 1},"${p.rank}","${p.firstName}","${p.lastName}","${p.policeId}","${p.organizationName}","${p.province}","${p.status}","${p.batchNumber}",${p.assignedSchoolCount}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DARE_Personnel_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmGoogleSheetsExport = async () => {
    try {
      setIsExporting(true);
      const res = await exportRosterToGoogleSheets();
      setSheetsNotice({ url: res.url, message: res.message });
      setShowSheetsConfirm(false);
    } catch (err: any) {
      alert(err.message || 'ส่งออก Google Sheets ไม่สำเร็จ');
    } finally {
      setIsExporting(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setRankFilter('all');
    setOrgFilter('all');
    setStatusFilter('all');
    setProvinceFilter('all');
    setAssignmentFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#32145C] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#5B2A86]" />
            <span>ทำเนียบครูตำรวจ D.A.R.E.</span>
          </h1>
          <p className="text-xs text-[#756B80]">
            ทะเบียนข้าราชการตำรวจ บช.ตชด. ที่ผ่านการฝึกอบรมหลักสูตรวิทยากร D.A.R.E. ทั่วประเทศ
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#5B2A86] bg-white border border-[#E7E0EF] rounded-lg hover:bg-purple-50 transition-colors shadow-2xs"
            title="ดาวน์โหลดไฟล์ CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>

          <button
            onClick={() => setShowSheetsConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#168A62] hover:bg-[#0f6b4b] rounded-lg shadow-2xs transition-colors"
            title="ส่งออก Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>ส่งออก Google Sheets</span>
          </button>

          {(currentRole === 'central_admin' || currentRole === 'unit_admin') && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#211A2B] bg-[#D6B15E] hover:bg-[#c49f48] rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 text-[#32145C]" />
              <span>เพิ่มครู D.A.R.E. ใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 text-white bg-gradient-to-br from-[#7B3FC6] to-[#291447] shadow-lg shadow-purple-900/10">
          <div className="flex items-start justify-between gap-2"><div><p className="text-xs text-white/75">ครู D.A.R.E. ทั้งหมด</p><p className="mt-2 text-2xl sm:text-3xl font-black">{personnel.length.toLocaleString('th-TH')}</p><p className="mt-1 text-[11px] text-white/70">รายชื่อในทะเบียน</p></div><span className="rounded-xl bg-white/15 p-3"><Users className="w-5 h-5" /></span></div>
          <div className="absolute -right-5 -bottom-8 w-24 h-24 rounded-full border-[12px] border-white/10" />
        </div>
        <div className="rounded-2xl p-4 sm:p-5 bg-white border border-[#E8E4EF] shadow-sm"><div className="flex items-start justify-between gap-2"><div><p className="text-xs text-[#777184]">หน่วยงานที่เข้าร่วม</p><p className="mt-2 text-2xl sm:text-3xl font-black text-[#291C45]">{new Set(personnel.map(p => p.organizationId).filter(Boolean)).size.toLocaleString('th-TH')}</p><p className="mt-1 text-[11px] text-[#777184]">จากข้อมูลครูในระบบ</p></div><span className="rounded-xl bg-[#EDE4F7] p-3 text-[#5B2A86]"><Building2 className="w-5 h-5" /></span></div></div>
        <div className="rounded-2xl p-4 sm:p-5 bg-white border border-[#E8E4EF] shadow-sm"><div className="flex items-start justify-between gap-2"><div><p className="text-xs text-[#777184]">จังหวัดที่มีครู</p><p className="mt-2 text-2xl sm:text-3xl font-black text-[#291C45]">{new Set(personnel.map(p => p.province).filter(Boolean)).size.toLocaleString('th-TH')}</p><p className="mt-1 text-[11px] text-[#777184]">จังหวัดที่พบในทะเบียน</p></div><span className="rounded-xl bg-blue-50 p-3 text-blue-600"><MapPin className="w-5 h-5" /></span></div></div>
        <div className="rounded-2xl p-4 sm:p-5 bg-white border border-[#E8E4EF] shadow-sm"><div className="flex items-start justify-between gap-2"><div><p className="text-xs text-[#777184]">โรงเรียนที่รับผิดชอบ</p><p className="mt-2 text-2xl sm:text-3xl font-black text-[#291C45]">{personnel.reduce((sum, p) => sum + (Number(p.assignedSchoolCount) || 0), 0).toLocaleString('th-TH')}</p><p className="mt-1 text-[11px] text-[#777184]">รวมจำนวนการมอบหมาย</p></div><span className="rounded-xl bg-amber-50 p-3 text-amber-600"><GraduationCap className="w-5 h-5" /></span></div></div>
      </div>

      {/* Sheets Notice */}
      {sheetsNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{sheetsNotice.message}</span>
          </div>
          {sheetsNotice.url && (
            <a
              href={sheetsNotice.url}
              target="_blank"
              rel="noreferrer"
              className="font-bold underline text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <span>เปิดดูสเปรดชีต</span>
            </a>
          )}
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E0EF] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#756B80]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ค้นหาชื่อ-นามสกุล ยศ ตำแหน่ง หรือหน่วยงาน..."
              className="w-full pl-9 pr-3 py-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#7C3AED]"
            />
          </div>

          {/* Rank Filter */}
          <div>
            <select
              value={rankFilter}
              onChange={(e) => {
                setRankFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg text-[#211A2B]"
            >
              <option value="all">ทุกยศตำแหน่ง</option>
              <option value="พ.ต.ท.">พ.ต.ท.</option>
              <option value="ร.ต.อ.">ร.ต.อ.</option>
              <option value="ร.ต.อ.หญิง">ร.ต.อ.หญิง</option>
              <option value="ร.ต.ท.">ร.ต.ท.</option>
              <option value="ด.ต.">ด.ต.</option>
              <option value="จ.ส.ต.">จ.ส.ต.</option>
              <option value="ส.ต.ท.">ส.ต.ท.</option>
            </select>
          </div>

          {/* Province Filter */}
          <div>
            <select value={provinceFilter} onChange={(e) => { setProvinceFilter(e.target.value); setCurrentPage(1); }} className="w-full py-2 px-3 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg text-[#211A2B]">
              <option value="all">ทุกจังหวัด</option>
              {[...new Set(personnel.map(p => p.province).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'th')).map(province => <option key={province} value={province}>{province}</option>)}
            </select>
          </div>

          {/* Unit Filter */}
          <div>
            <select
              value={orgFilter}
              onChange={(e) => {
                setOrgFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg text-[#211A2B]"
            >
              <option value="all">ทุกหน่วย ตชด.</option>
              {organizations.filter(o => o.level === 'subdivision').map((org) => (
                <option key={org.id} value={org.id}>{org.shortName}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg text-[#211A2B]"
            >
              <option value="all">ทุกสถานะการปฏิบัติงาน</option>
              <option value="active">ปฏิบัติการปกติ (Active)</option>
              <option value="leave">ลาพัก/ศึกษาต่อ (Leave)</option>
              <option value="transferred">ย้ายสังกัด (Transferred)</option>
              <option value="inactive">พ้นหน้าที่ (Inactive)</option>
            </select>
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex items-center justify-between pt-1 border-t border-[#E7E0EF] text-xs text-[#756B80]">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-[#5B2A86]">สถานะโรงเรียน:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="asgFilter"
                checked={assignmentFilter === 'all'}
                onChange={() => setAssignmentFilter('all')}
              />
              <span>ทั้งหมด</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="asgFilter"
                checked={assignmentFilter === 'assigned'}
                onChange={() => setAssignmentFilter('assigned')}
              />
              <span>มีโรงเรียนรับผิดชอบแล้ว</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="asgFilter"
                checked={assignmentFilter === 'unassigned'}
                onChange={() => setAssignmentFilter('unassigned')}
              />
              <span>ยังไม่มีโรงเรียนมอบหมาย</span>
            </label>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[#756B80] hover:text-[#5B2A86]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ล้างตัวกรอง</span>
          </button>
        </div>
      </div>

      {/* Directory section heading and view switch */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-1">
        <div className="flex items-start gap-3"><div className="p-2.5 rounded-xl bg-[#EDE4F7] text-[#5B2A86]"><BookOpen className="w-5 h-5" /></div><div><h2 className="text-lg font-extrabold text-[#291C45]">รายชื่อครู D.A.R.E.</h2><p className="text-xs text-[#777184] mt-0.5">ครูตำรวจผู้สร้างอนาคตที่ดีให้กับเยาวชนไทย · พบ {filteredPersonnel.length.toLocaleString('th-TH')} รายชื่อ</p></div></div>
        <div className="inline-flex self-start sm:self-auto p-1 bg-white border border-[#E8E4EF] rounded-xl shadow-sm"><button onClick={() => setViewMode('grid')} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${viewMode === 'grid' ? 'bg-[#5B2A86] text-white shadow' : 'text-[#777184] hover:bg-purple-50'}`}><LayoutGrid className="w-4 h-4"/> การ์ด</button><button onClick={() => setViewMode('list')} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${viewMode === 'list' ? 'bg-[#5B2A86] text-white shadow' : 'text-[#777184] hover:bg-purple-50'}`}><ListIcon className="w-4 h-4"/> รายการ</button></div>
      </div>

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {paginatedList.map((p, idx) => {
            const teacherPhoto = p.sourceRow != null ? (teacherPhotoMap as Record<string, string>)[String(p.sourceRow)] : undefined;
            return (
            <article key={p.id} className="group overflow-hidden rounded-2xl bg-white border border-[#E8E4EF] shadow-sm hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-0.5 transition-all duration-200">
              <div className="relative h-28 sm:h-32 overflow-hidden bg-gradient-to-br from-[#5B2A86] via-[#7B3FC6] to-[#BCA1E8]">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 20% 20%, white 0 2px, transparent 3px), radial-gradient(circle at 80% 70%, white 0 2px, transparent 3px)', backgroundSize:'28px 28px'}} />
                <div className="absolute -right-5 -top-8 w-32 h-32 rounded-full border-[18px] border-white/10" />
                {teacherPhoto ? (
                  <img src={teacherPhoto} alt={`รูป ${p.rank} ${p.firstName} ${p.lastName}`} loading={idx < 4 ? 'eager' : 'lazy'} className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 rounded-full border-4 border-white/80 bg-white/20 shadow-lg flex items-center justify-center text-white text-xl font-black backdrop-blur-sm">{`${p.firstName?.slice(0,1) || ''}${p.lastName?.slice(0,1) || ''}`}</div></div>
                )}
                <button onClick={() => toggleFavorite(p.id)} aria-label={favorites.includes(p.id) ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'} className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition ${favorites.includes(p.id) ? 'bg-amber-300 text-amber-900' : 'bg-white/90 text-[#8B8496] hover:text-amber-500'}`}><Star className={`w-4 h-4 ${favorites.includes(p.id) ? 'fill-current' : ''}`} /></button>
                <span className={`absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : p.status === 'leave' ? 'bg-amber-100 text-amber-800' : 'bg-white/90 text-slate-700'}`}><span className={`w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-emerald-500' : p.status === 'leave' ? 'bg-amber-500' : 'bg-slate-400'}`} />{p.status === 'active' ? 'ปฏิบัติหน้าที่' : p.status === 'leave' ? 'ลาพัก/ศึกษาต่อ' : p.status === 'transferred' ? 'ย้ายสังกัด' : 'พ้นหน้าที่'}</span>
              </div>
              <div className="p-4">
                <div className="min-h-[56px]"><h3 className="font-extrabold text-sm text-[#291C45] leading-6 break-words">{p.rank} {p.firstName} {p.lastName}</h3><p className="text-[11px] text-[#777184]">ครูตำรวจ D.A.R.E. · {p.batchNumber || 'ไม่ระบุรุ่น'}</p></div>
                <div className="mt-3 space-y-2 text-xs text-[#655D72]"><p className="flex items-start gap-2"><Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#7B3FC6]"/><span className="line-clamp-2">{p.organizationName || 'ไม่ระบุหน่วยงาน'}</span></p><p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 shrink-0 text-[#7B3FC6]"/><span>{p.province || 'ไม่ระบุจังหวัด'}</span></p></div>
                <div className="mt-4 pt-3 border-t border-[#F0ECF5] flex items-center justify-between gap-2"><span className="rounded-lg bg-[#F3ECFB] px-2.5 py-1.5 text-[10px] font-bold text-[#5B2A86]">ดูแล {p.assignedSchoolCount || 0} โรงเรียน</span><button onClick={() => { setSelectedPerson(p); setShowDetailModal(true); }} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 bg-[#5B2A86] hover:bg-[#432064] text-white text-[11px] font-bold transition">ดูโปรไฟล์ <Eye className="w-3.5 h-3.5"/></button></div>
                {(currentRole === 'central_admin' || currentRole === 'unit_admin') && <div className="mt-2 flex gap-2"><button onClick={() => handleOpenEdit(p)} className="flex-1 py-1.5 rounded-lg border border-[#E8E4EF] text-[11px] font-semibold text-[#5B2A86] hover:bg-purple-50"><Edit className="inline w-3 h-3 mr-1"/>แก้ไข</button><button onClick={() => { setTargetDeleteId(p.id); setShowDeleteModal(true); }} className="px-3 py-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50"><Trash2 className="w-3 h-3"/></button></div>}
              </div>
            </article>
          ); })}
          {paginatedList.length === 0 && <div className="sm:col-span-2 xl:col-span-4 rounded-2xl border border-dashed border-[#D8CBE8] bg-white p-12 text-center"><div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-[#F3ECFB] text-[#7B3FC6] flex items-center justify-center"><Search className="w-5 h-5"/></div><p className="font-bold text-[#291C45]">ไม่พบรายชื่อครูที่ตรงกับการค้นหา</p><p className="mt-1 text-xs text-[#777184]">ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองแล้วค้นหาอีกครั้ง</p><button onClick={resetFilters} className="mt-4 px-4 py-2 rounded-lg bg-[#5B2A86] text-white text-xs font-bold">ล้างตัวกรอง</button></div>}
        </div>
      )}

      {/* Main Data Table */}
      <div className={`${viewMode === 'grid' ? 'hidden' : 'block'} bg-white rounded-xl border border-[#E7E0EF] shadow-2xs overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5FB] text-[#756B80] font-semibold border-b border-[#E7E0EF]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">ลำดับ</th>
                <th className="py-3 px-4 cursor-pointer hover:text-[#32145C]" onClick={() => handleSort('rank')}>
                  <div className="flex items-center gap-1">
                    <span>ยศ - ชื่อ - นามสกุล</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">รหัส ตชด.</th>
                <th className="py-3 px-4 cursor-pointer hover:text-[#32145C]" onClick={() => handleSort('organizationName')}>
                  <div className="flex items-center gap-1">
                    <span>หน่วยต้นสังกัด</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-[#32145C]" onClick={() => handleSort('province')}>
                  <div className="flex items-center gap-1">
                    <span>จังหวัด</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center cursor-pointer hover:text-[#32145C]" onClick={() => handleSort('assignedSchoolCount')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>โรงเรียนที่ดูแล</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4">ปรับปรุงล่าสุด</th>
                <th className="py-3 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0EF] text-[#211A2B]">
              {paginatedList.map((p, idx) => {
                const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr key={p.id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="py-3 px-4 text-center text-[#756B80] font-mono">{globalIndex}</td>
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#32145C]">{p.rank}</span>
                        <span>{p.firstName} {p.lastName}</span>
                      </div>
                      <div className="text-[10px] text-[#756B80]">{p.batchNumber} (อบรมปี {p.certifiedYear})</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#756B80]">{p.policeId}</td>
                    <td className="py-3 px-4">{p.organizationName}</td>
                    <td className="py-3 px-4">{p.province}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        p.assignedSchoolCount > 0 ? 'bg-purple-100 text-[#5B2A86]' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {p.assignedSchoolCount} แห่ง
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        p.status === 'active'
                          ? 'bg-emerald-100 text-[#168A62]'
                          : p.status === 'leave'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {p.status === 'active' ? 'ปฏิบัติหน้าที่' : p.status === 'leave' ? 'ลาพัก' : 'พ้นหน้าที่'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#756B80]">{p.updatedAt}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedPerson(p);
                            setShowDetailModal(true);
                          }}
                          className="p-1 text-[#5B2A86] hover:bg-purple-100 rounded"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(currentRole === 'central_admin' || currentRole === 'unit_admin') && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="แก้ไข"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setTargetDeleteId(p.id);
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

              {paginatedList.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#756B80]">
                    ไม่พบข้อมูลครู D.A.R.E. ตามเงื่อนไขการค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-[#F7F5FB] border-t border-[#E7E0EF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#756B80]">
          <div>
            แสดง {paginatedList.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} ถึง {Math.min(currentPage * pageSize, filteredPersonnel.length)} จากทั้งหมด {filteredPersonnel.length} นาย
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border border-[#E7E0EF] rounded hover:bg-gray-50 disabled:opacity-50"
            >
              ก่อนหน้า
            </button>
            <span className="px-3 py-1 font-semibold text-[#32145C]">
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white border border-[#E7E0EF] rounded hover:bg-gray-50 disabled:opacity-50"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>

      {/* Personnel Detail Modal */}
      {showDetailModal && selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E7E0EF]">
            <div className="p-5 border-b border-[#E7E0EF] flex items-center justify-between bg-[#F7F5FB]">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#5B2A86]" />
                <h3 className="text-base font-bold text-[#32145C]">ประวัติครูตำรวจ D.A.R.E.</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-50 border border-purple-100">
                <div className="w-14 h-14 rounded-full bg-[#5B2A86] text-white flex items-center justify-center text-lg font-bold border-2 border-[#D6B15E]">
                  {selectedPerson.rank.slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#211A2B]">
                    {selectedPerson.rank} {selectedPerson.firstName} {selectedPerson.lastName}
                  </h4>
                  <div className="text-[#756B80]">รหัสประจำตัว: {selectedPerson.policeId}</div>
                  <div className="text-[11px] font-semibold text-[#D6B15E] mt-0.5">
                    {selectedPerson.batchNumber} (อบรมปี {selectedPerson.certifiedYear})
                  </div>
                </div>
              </div>

              {/* Work Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#F7F5FB] border border-[#E7E0EF]">
                  <span className="text-[#756B80] block">หน่วยต้นสังกัด</span>
                  <span className="font-bold text-[#211A2B]">{selectedPerson.organizationName}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#F7F5FB] border border-[#E7E0EF]">
                  <span className="text-[#756B80] block">จังหวัดประจำการ</span>
                  <span className="font-bold text-[#211A2B]">{selectedPerson.province}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#F7F5FB] border border-[#E7E0EF]">
                  <span className="text-[#756B80] block">เบอร์โทรศัพท์ติดต่อ</span>
                  <span className="font-bold text-[#211A2B] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#5B2A86]" />
                    {selectedPerson.phone}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#F7F5FB] border border-[#E7E0EF]">
                  <span className="text-[#756B80] block">อีเมลราชการ</span>
                  <span className="font-bold text-[#211A2B] truncate block">{selectedPerson.email}</span>
                </div>
              </div>

              {/* Assigned Schools */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-bold text-[#32145C]">
                  <span>โรงเรียนที่รับผิดชอบการสอน ({selectedPerson.assignedSchoolCount} แห่ง):</span>
                </div>
                <div className="space-y-1.5">
                  {selectedPerson.assignedSchoolIds.map((sid) => {
                    const sch = schools.find(s => s.id === sid);
                    return sch ? (
                      <div key={sid} className="p-2.5 rounded-lg border border-[#E7E0EF] bg-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <School className="w-4 h-4 text-[#5B2A86]" />
                          <span className="font-semibold text-[#211A2B]">{sch.name}</span>
                        </div>
                        <span className="text-[10px] text-[#756B80]">อ.{sch.district}</span>
                      </div>
                    ) : null;
                  })}
                  {selectedPerson.assignedSchoolCount === 0 && (
                    <div className="p-3 rounded-lg bg-gray-50 text-gray-500 text-center">
                      ยังไม่มีโรงเรียนมอบหมายในภาคการศึกษานี้
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Conducted */}
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900">
                <span className="font-semibold">จำนวนชั่วโมง/กิจกรรมที่บันทึกแล้ว:</span>
                <span className="text-sm font-extrabold">{selectedPerson.totalActivitiesConducted} คาบ</span>
              </div>
            </div>

            <div className="p-4 bg-[#F7F5FB] border-t border-[#E7E0EF] flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#5B2A86] rounded-lg"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E7E0EF]">
            <div className="p-5 border-b border-[#E7E0EF] flex items-center justify-between bg-[#F7F5FB]">
              <h3 className="text-sm font-bold text-[#32145C]">
                {isEditing ? 'แก้ไขข้อมูลครู D.A.R.E.' : 'เพิ่มครู D.A.R.E. เข้าสู่ระบบ'}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">ยศ</label>
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  >
                    <option value="พ.ต.ท.">พ.ต.ท.</option>
                    <option value="ร.ต.อ.">ร.ต.อ.</option>
                    <option value="ร.ต.อ.หญิง">ร.ต.อ.หญิง</option>
                    <option value="ร.ต.ท.">ร.ต.ท.</option>
                    <option value="ด.ต.">ด.ต.</option>
                    <option value="จ.ส.ต.">จ.ส.ต.</option>
                    <option value="ส.ต.ท.">ส.ต.ท.</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">ชื่อ</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">นามสกุล</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">รหัสข้าราชการตำรวจ</label>
                  <input
                    type="text"
                    required
                    value={formData.policeId}
                    onChange={(e) => setFormData({ ...formData, policeId: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">สถานะ</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PersonnelStatus })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  >
                    <option value="active">ปฏิบัติหน้าที่ (Active)</option>
                    <option value="leave">ลาพัก (Leave)</option>
                    <option value="transferred">ย้ายสังกัด (Transferred)</option>
                    <option value="inactive">พ้นหน้าที่ (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">สังกัด ตชด.</label>
                  <select
                    value={formData.organizationId}
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">จังหวัดพื้นที่</label>
                  <input
                    type="text"
                    required
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">อีเมล</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">รุ่นการฝึกอบรม D.A.R.E.</label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">ปีที่ผ่านการรับรอง (พ.ศ.)</label>
                  <input
                    type="number"
                    value={formData.certifiedYear}
                    onChange={(e) => setFormData({ ...formData, certifiedYear: parseInt(e.target.value) || 2568 })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#F7F5FB] border-t border-[#E7E0EF] flex justify-end gap-2 -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-[#E7E0EF] rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5B2A86] text-white font-bold rounded-lg hover:bg-[#441D66]"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="ยืนยันการลบข้อมูลครู D.A.R.E."
        description="คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลครู D.A.R.E. ท่านนี้ออกจากระบบ? การดำเนินการนี้จะยกเลิกการมอบหมายโรงเรียนทั้งหมดของบุคคลนี้ด้วย"
        type="danger"
        confirmLabel="ยืนยันลบข้อมูล"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Confirmation Modal for Google Sheets Export */}
      <ConfirmationModal
        isOpen={showSheetsConfirm}
        title="ส่งออกทำเนียบครู D.A.R.E. สู่ Google Sheets"
        description="ระบบจะสร้างเอกสาร Google Spreadsheet ใหม่ในบัญชีของคุณ พร้อมบันทึกรายชื่อครูตำรวจ D.A.R.E. ทั้งหมดตามตัวกรองปัจจุบัน"
        type="sheets"
        confirmLabel="ยืนยันสร้างเอกสาร"
        isLoading={isExporting}
        details={[
          `จำนวนรายการ: ${filteredPersonnel.length} นาย`,
          'บริการ: Google Sheets API v4',
        ]}
        onConfirm={handleConfirmGoogleSheetsExport}
        onCancel={() => setShowSheetsConfirm(false)}
      />
    </div>
  );
};

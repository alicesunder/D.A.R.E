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
  MapPin
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

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
      const matchSearch = p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.province.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = filterOption === 'all' || p.status === filterOption;
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Segmented Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#EAE5F2]">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[#6D28D9] tracking-wider">
            โซนที่ 2 · ฐานข้อมูลและโครงสร้าง
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1726] tracking-tight">
            ทะเบียนกำลังพลและสถานศึกษา
          </h1>
          <p className="text-xs text-[#696075]">
            ศูนย์รวมทำเนียบครูตำรวจ D.A.R.E. ทะเบียนโรงเรียนในเครือข่าย และผังโครงสร้าง บช.ตชด.
          </p>
        </div>

        {/* Global Hub Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
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
        <div className="flex items-center gap-1 bg-[#FAF9FD] p-1 rounded-lg border border-[#EAE5F2]">
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

      {/* VIEW 1: PERSONNEL ROSTER TABLE */}
      {activeTab === 'personnel' && (
        <div className="bg-white rounded-2xl border border-[#EAE5F2] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9FD] text-[#696075] font-semibold border-b border-[#EAE5F2]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">ลำดับ</th>
                  <th className="py-3 px-4">ยศ - ชื่อ - สกุล</th>
                  <th className="py-3 px-4">สังกัด ตชด.</th>
                  <th className="py-3 px-4">จังหวัด</th>
                  <th className="py-3 px-4 text-center">รร.ที่ดูแล</th>
                  <th className="py-3 px-4 text-center">สอนแล้ว (ครั้ง)</th>
                  <th className="py-3 px-4 text-center">สถานะ</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5F2] text-[#1C1726]">
                {filteredPersonnel.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3 px-4 text-center text-[#8E869B] tabular-nums">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1C1726]">{p.rank} {p.firstName} {p.lastName}</div>
                      <div className="text-[11px] text-[#8E869B]">{p.batchNumber} (อบรมปี {p.certifiedYear})</div>
                    </td>
                    <td className="py-3 px-4">{p.organizationName}</td>
                    <td className="py-3 px-4">{p.province}</td>
                    <td className="py-3 px-4 text-center font-bold tabular-nums">
                      {p.assignedSchoolCount > 0 ? `${p.assignedSchoolCount} แห่ง` : '-'}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-[#15803D] tabular-nums">
                      {p.totalActivitiesConducted}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[11px] font-medium ${
                        p.status === 'active' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {p.status === 'active' ? 'ปฏิบัติหน้าที่' : 'ลาพัก'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedPerson(p);
                            setShowPersonDetail(true);
                          }}
                          className="p-1 text-[#6D28D9] hover:bg-purple-100 rounded"
                          title="ดูประวัติ"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(currentRole === 'central_admin' || currentRole === 'unit_admin') && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedPerson(p);
                                setPersonFormData({
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
                                setIsEditingPerson(true);
                                setShowPersonEdit(true);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="แก้ไข"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget({ id: p.id, type: 'person' });
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

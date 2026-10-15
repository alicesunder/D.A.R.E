import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { School, SchoolType } from '../../types';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Users, 
  RotateCcw,
  ArrowUpDown
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const SchoolRegistryPage: React.FC<{ onNavigateToAssignment?: () => void }> = ({ onNavigateToAssignment }) => {
  const { 
    schools, 
    personnel, 
    organizations, 
    addSchool, 
    updateSchool, 
    deleteSchool,
    exportSchoolsToGoogleSheets,
    currentRole
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'bpp_school' as SchoolType,
    province: 'กาญจนบุรี',
    district: 'ทองผาภูมิ',
    subdistrict: 'ปิล๊อก',
    organizationId: organizations[2]?.id || organizations[0]?.id || '',
    organizationName: organizations[2]?.name || organizations[0]?.name || '',
    assignmentStatus: 'unassigned' as School['assignmentStatus'],
    totalStudents: 120,
    gradeLevels: 'ป.1 - ม.3',
    contactPerson: '',
    contactPhone: '',
    notes: '',
  });

  const [showSheetsConfirm, setShowSheetsConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [sheetsNotice, setSheetsNotice] = useState<{ url?: string; message: string } | null>(null);

  const provinces = useMemo(() => Array.from(new Set(schools.map(s => s.province))), [schools]);

  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.district.toLowerCase().includes(searchQuery.toLowerCase());
      const matchProvince = provinceFilter === 'all' || s.province === provinceFilter;
      const matchType = typeFilter === 'all' || s.type === typeFilter;
      const matchStatus = statusFilter === 'all' || s.assignmentStatus === statusFilter;
      return matchSearch && matchProvince && matchType && matchStatus;
    });
  }, [schools, searchQuery, provinceFilter, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filteredSchools.length / pageSize) || 1;
  const paginatedList = filteredSchools.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAdd = () => {
    setIsEditing(false);
    const codeNum = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      code: `SCH-${codeNum}`,
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
    setShowEditModal(true);
  };

  const handleOpenEdit = (s: School) => {
    setIsEditing(true);
    setSelectedSchool(s);
    setFormData({
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
    setShowEditModal(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const org = organizations.find(o => o.id === formData.organizationId);
    const orgName = org ? org.name : formData.organizationName;

    if (isEditing && selectedSchool) {
      updateSchool(selectedSchool.id, {
        ...formData,
        organizationName: orgName,
      });
    } else {
      addSchool({
        ...formData,
        organizationName: orgName,
      });
    }
    setShowEditModal(false);
  };

  const handleConfirmDelete = () => {
    if (targetDeleteId) {
      deleteSchool(targetDeleteId);
      setTargetDeleteId(null);
      setShowDeleteModal(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ลำดับ,รหัส,ชื่อโรงเรียน,ประเภท,จังหวัด,อำเภอ,สังกัด,สถานะครู,จำนวนนักเรียน'];
    const rows = filteredSchools.map((s, idx) =>
      `${idx + 1},"${s.code}","${s.name}","${s.type}","${s.province}","${s.district}","${s.organizationName}","${s.assignmentStatus}",${s.totalStudents}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DARE_Schools_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmGoogleSheetsExport = async () => {
    try {
      setIsExporting(true);
      const res = await exportSchoolsToGoogleSheets();
      setSheetsNotice({ url: res.url, message: res.message });
      setShowSheetsConfirm(false);
    } catch (err: any) {
      alert(err.message || 'ส่งออก Google Sheets ไม่สำเร็จ');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#32145C] flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#5B2A86]" />
            <span>ทะเบียนสถานศึกษาในโครงการ D.A.R.E.</span>
          </h1>
          <p className="text-xs text-[#756B80]">
            ฐานข้อมูลโรงเรียนตำรวจตระเวนชายแดน และโรงเรียนเครือข่ายความร่วมมือ สพฐ. ทั่วประเทศ
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#5B2A86] bg-white border border-[#E7E0EF] rounded-lg hover:bg-purple-50 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>

          <button
            onClick={() => setShowSheetsConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#168A62] hover:bg-[#0f6b4b] rounded-lg shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>ส่งออก Google Sheets</span>
          </button>

          {(currentRole === 'central_admin' || currentRole === 'unit_admin') && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#211A2B] bg-[#D6B15E] hover:bg-[#c49f48] rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#32145C]" />
              <span>เพิ่มโรงเรียนใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* Sheets Notice */}
      {sheetsNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{sheetsNotice.message}</span>
          </div>
          {sheetsNotice.url && (
            <a href={sheetsNotice.url} target="_blank" rel="noreferrer" className="font-bold underline text-emerald-800">
              เปิดดูสเปรดชีต
            </a>
          )}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E0EF] shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#756B80]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อโรงเรียน หรืออำเภอ..."
            className="w-full pl-9 pr-3 py-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
          />
        </div>

        <div>
          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="w-full py-2 px-3 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
          >
            <option value="all">ทุกจังหวัด</option>
            {provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full py-2 px-3 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
          >
            <option value="all">ทุกประเภทสถานศึกษา</option>
            <option value="bpp_school">รร.ตำรวจตระเวนชายแดน (รร.ตชด.)</option>
            <option value="obec_primary">รร.ประถม สพฐ.</option>
            <option value="obec_expansion">รร.ขยายโอกาส สพฐ.</option>
            <option value="municipal">รร.เทศบาล/ท้องถิ่น</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
          >
            <option value="all">สถานะการมอบหมายครูทั้งหมด</option>
            <option value="assigned">มีครูรับผิดชอบแล้ว (Assigned)</option>
            <option value="unassigned">ยังไม่มีครูรับผิดชอบ (Unassigned)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E7E0EF] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5FB] text-[#756B80] font-semibold border-b border-[#E7E0EF]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">ลำดับ</th>
                <th className="py-3 px-4">รหัส</th>
                <th className="py-3 px-4">ชื่อสถานศึกษา</th>
                <th className="py-3 px-4">ประเภท</th>
                <th className="py-3 px-4">พื้นที่</th>
                <th className="py-3 px-4">ครู D.A.R.E. ผู้รับผิดชอบ</th>
                <th className="py-3 px-4 text-center">นักเรียน</th>
                <th className="py-3 px-4 text-center">กิจกรรม</th>
                <th className="py-3 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0EF] text-[#211A2B]">
              {paginatedList.map((s, idx) => {
                const assignedOfficers = personnel.filter(p => s.assignedPersonnelIds.includes(p.id));
                const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr key={s.id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="py-3 px-4 text-center text-[#756B80] font-mono">{globalIndex}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#5B2A86]">{s.code}</td>
                    <td className="py-3 px-4 font-medium">
                      <div className="font-bold text-[#211A2B]">{s.name}</div>
                      <div className="text-[10px] text-[#756B80]">{s.gradeLevels}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-[#5B2A86] border border-purple-100">
                        {s.type === 'bpp_school' ? 'รร.ตชด.' : 'สพฐ.'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>อ.{s.district}</div>
                      <div className="text-[10px] text-[#756B80]">จ.{s.province}</div>
                    </td>
                    <td className="py-3 px-4">
                      {assignedOfficers.length > 0 ? (
                        <div className="space-y-0.5">
                          {assignedOfficers.map(o => (
                            <span key={o.id} className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-medium mr-1">
                              {o.rank} {o.firstName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-[#C63C4B] text-[10px] font-bold">
                          ยังไม่มีครู
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">{s.totalStudents} คน</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#5B2A86] text-[10px] font-bold">
                        {s.totalActivities} ครั้ง
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedSchool(s);
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
                              onClick={() => handleOpenEdit(s)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="แก้ไข"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setTargetDeleteId(s.id);
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

        {/* Pagination */}
        <div className="p-4 bg-[#F7F5FB] border-t border-[#E7E0EF] flex items-center justify-between text-xs text-[#756B80]">
          <div>แสดง {paginatedList.length} จาก {filteredSchools.length} แห่ง</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border border-[#E7E0EF] rounded disabled:opacity-50"
            >
              ก่อนหน้า
            </button>
            <span className="font-semibold text-[#32145C]">หน้า {currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white border border-[#E7E0EF] rounded disabled:opacity-50"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>

      {/* School Detail Modal */}
      {showDetailModal && selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E7E0EF]">
            <div className="p-5 border-b border-[#E7E0EF] flex items-center justify-between bg-[#F7F5FB]">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#5B2A86]" />
                <h3 className="text-base font-bold text-[#32145C]">ข้อมูลสถานศึกษา</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="font-mono text-[#5B2A86] font-bold">{selectedSchool.code}</span>
                <h4 className="text-base font-bold text-[#211A2B]">{selectedSchool.name}</h4>
                <div className="text-[#756B80] mt-0.5">
                  ต.{selectedSchool.subdistrict} อ.{selectedSchool.district} จ.{selectedSchool.province}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-[#F7F5FB] rounded-lg">
                  <span className="text-[#756B80] block">สังกัดดูแล ตชด.</span>
                  <span className="font-bold text-[#211A2B]">{selectedSchool.organizationName}</span>
                </div>
                <div className="p-3 bg-[#F7F5FB] rounded-lg">
                  <span className="text-[#756B80] block">จำนวนนักเรียน</span>
                  <span className="font-bold text-[#211A2B]">{selectedSchool.totalStudents} คน ({selectedSchool.gradeLevels})</span>
                </div>
              </div>

              {/* Assigned instructors */}
              <div className="p-4 rounded-xl border border-[#E7E0EF] space-y-2">
                <div className="font-bold text-[#32145C]">ครูตำรวจ D.A.R.E. ที่รับผิดชอบ:</div>
                {selectedSchool.assignedPersonnelIds.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedSchool.assignedPersonnelIds.map(pid => {
                      const officer = personnel.find(p => p.id === pid);
                      return officer ? (
                        <div key={pid} className="flex items-center justify-between p-2 rounded bg-purple-50 text-purple-900">
                          <span className="font-bold">{officer.rank} {officer.firstName} {officer.lastName}</span>
                          <span className="text-[10px] text-[#756B80]">{officer.phone}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="text-red-500 font-semibold p-2 bg-red-50 rounded">
                    ยังไม่มีครู D.A.R.E. ประจำโรงเรียนนี้
                  </div>
                )}
              </div>

              {selectedSchool.notes && (
                <div className="p-3 rounded-lg bg-gray-50 text-[#756B80]">
                  <span className="font-bold text-gray-700 block mb-0.5">บันทึกเพิ่มเติม:</span>
                  {selectedSchool.notes}
                </div>
              )}
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
                {isEditing ? 'แก้ไขข้อมูลสถานศึกษา' : 'เพิ่มสถานศึกษาใหม่'}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">รหัสโรงเรียน</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-[#211A2B] block mb-1">ชื่อโรงเรียน</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">ประเภทสถานศึกษา</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SchoolType })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  >
                    <option value="bpp_school">รร.ตำรวจตระเวนชายแดน (รร.ตชด.)</option>
                    <option value="obec_primary">รร.ประถม สพฐ.</option>
                    <option value="obec_expansion">รร.ขยายโอกาส สพฐ.</option>
                    <option value="municipal">รร.เทศบาล/ท้องถิ่น</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">สังกัด กก.ตชด.</label>
                  <select
                    value={formData.organizationId}
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  >
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">จังหวัด</label>
                  <input
                    type="text"
                    required
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">อำเภอ</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">ตำบล</label>
                  <input
                    type="text"
                    value={formData.subdistrict}
                    onChange={(e) => setFormData({ ...formData, subdistrict: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">จำนวนนักเรียน</label>
                  <input
                    type="number"
                    value={formData.totalStudents}
                    onChange={(e) => setFormData({ ...formData, totalStudents: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">ระดับชั้น</label>
                  <input
                    type="text"
                    value={formData.gradeLevels}
                    onChange={(e) => setFormData({ ...formData, gradeLevels: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#211A2B] block mb-1">บันทึกเพิ่มเติม</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                />
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="ยืนยันการลบสถานศึกษา"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบโรงเรียนนี้ออกจากระบบ? ข้อมูลการมอบหมายและกิจกรรมที่เกี่ยวข้องจะถูกปรับปรุงให้สอดคล้องกัน"
        type="danger"
        confirmLabel="ยืนยันลบข้อมูล"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Google Sheets Export Modal */}
      <ConfirmationModal
        isOpen={showSheetsConfirm}
        title="ส่งออกทะเบียนโรงเรียนสู่ Google Sheets"
        description="ระบบจะสร้าง Google Spreadsheet ใหม่ใน Google Drive ของคุณ พร้อมส่งออกข้อมูลสถานศึกษาทั้งหมด"
        type="sheets"
        confirmLabel="ยืนยันสร้างเอกสาร"
        isLoading={isExporting}
        details={[
          `จำนวนสถานศึกษา: ${filteredSchools.length} แห่ง`,
          'สิทธิ์การเข้าถึง: Google Sheets API v4',
        ]}
        onConfirm={handleConfirmGoogleSheetsExport}
        onCancel={() => setShowSheetsConfirm(false)}
      />
    </div>
  );
};

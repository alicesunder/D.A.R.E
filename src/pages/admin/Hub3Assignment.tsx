import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UserCheck, 
  School, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Search, 
  ArrowRight,
  Shield,
  FileSpreadsheet,
  Download,
  Filter,
  Eye,
  Plus
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const Hub3Assignment: React.FC = () => {
  const { 
    personnel, 
    schools, 
    assignments, 
    organizations,
    createAssignment, 
    removeAssignment,
    exportSchoolsToGoogleSheets,
    currentRole 
  } = useApp();

  // Wizard state (Step 1 -> 2 -> 3)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('');
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
  const [academicYear, setAcademicYear] = useState<string>('2568');
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(() => {
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1);
    return end.toISOString().slice(0, 10);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter in Wizard
  const [personSearch, setPersonSearch] = useState('');
  const [personUnitFilter, setPersonUnitFilter] = useState('all');
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolProvinceFilter, setSchoolProvinceFilter] = useState('all');

  // History Tab Filter
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');

  // Google Sheets Export Modal
  const [showSheetsConfirm, setShowSheetsConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<{ url?: string; message: string } | null>(null);

  // Assignment to delete
  const [assignmentToDelete, setAssignmentToDelete] = useState<{ id: string; schoolName: string; officerName: string } | null>(null);

  // Selected officer object
  const selectedOfficer = personnel.find((p) => p.id === selectedPersonnelId);

  // Filter officers
  const filteredPersonnel = personnel.filter((p) => {
    const matchSearch = `${p.rank} ${p.firstName} ${p.lastName}`.toLowerCase().includes(personSearch.toLowerCase()) ||
                        p.policeId.includes(personSearch);
    const matchUnit = personUnitFilter === 'all' || p.organizationId === personUnitFilter;
    return matchSearch && matchUnit && p.status === 'active';
  });

  // Filter schools
  const filteredSchools = schools.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
                        s.district.toLowerCase().includes(schoolSearch.toLowerCase());
    const matchProvince = schoolProvinceFilter === 'all' || s.province === schoolProvinceFilter;
    return matchSearch && matchProvince;
  });

  const provinces = Array.from(new Set(schools.map((s) => s.province)));

  // Conflicts check
  const conflictWarnings = selectedSchoolIds.map((schoolId) => {
    const school = schools.find((s) => s.id === schoolId);
    if (!school) return null;
    const existing = assignments.filter((a) => a.schoolId === schoolId && a.status === 'active');
    if (existing.length > 0) {
      return {
        schoolName: school.name,
        existingCount: existing.length,
        instructors: existing.map((a) => a.personnelName).join(', ')
      };
    }
    return null;
  }).filter(Boolean);

  const handleToggleSchool = (schoolId: string) => {
    if (selectedSchoolIds.includes(schoolId)) {
      setSelectedSchoolIds(selectedSchoolIds.filter((id) => id !== schoolId));
    } else {
      setSelectedSchoolIds([...selectedSchoolIds, schoolId]);
    }
  };

  const handleCompleteAssignment = () => {
    if (!selectedPersonnelId || selectedSchoolIds.length === 0) return;
    setIsSubmitting(true);
    setTimeout(() => {
      createAssignment(selectedPersonnelId, selectedSchoolIds, academicYear, `คำสั่งประจำปีการศึกษา ${academicYear}`);
      setIsSubmitting(false);
      setSuccessMessage(`มอบหมาย ${selectedOfficer?.rank} ${selectedOfficer?.firstName} ดูแล ${selectedSchoolIds.length} โรงเรียนเรียบร้อยแล้ว`);
      // Reset
      setCurrentStep(1);
      setSelectedPersonnelId('');
      setSelectedSchoolIds([]);
      setTimeout(() => setSuccessMessage(null), 5000);
    }, 400);
  };

  const handleConfirmDeleteAssignment = () => {
    if (assignmentToDelete) {
      removeAssignment(assignmentToDelete.id);
      setAssignmentToDelete(null);
    }
  };

  const handleExportSheets = async () => {
    setShowSheetsConfirm(false);
    setIsExporting(true);
    setExportNotice(null);
    try {
      const res = await exportSchoolsToGoogleSheets();
      if (res.success && res.url) {
        setExportNotice({
          url: res.url,
          message: `ส่งออกข้อมูลการจัดสรรและโรงเรียนสู่ Google Sheets สำเร็จ`
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

  const filteredHistory = assignments.filter((a) => {
    const matchSearch = a.personnelName.toLowerCase().includes(historySearch.toLowerCase()) ||
                        a.schoolName.toLowerCase().includes(historySearch.toLowerCase());
    const matchStatus = historyStatusFilter === 'all' || a.status === (historyStatusFilter === 'active' ? 'active' : 'ended');
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Strategic Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E7E0EF] pb-6">
        <div>
          <div className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider mb-1">
            Hub 3 — Assignment & Field Deployment
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#32145C] tracking-tight">
            ระบบจัดสรรและมอบหมายครู ตชด. D.A.R.E.
          </h1>
          <p className="text-sm text-[#756B80] mt-1 font-light">
            กระบวนการ 3 ขั้นตอน จับคู่วิทยากร D.A.R.E. กับโรงเรียนเป้าหมาย พร้อมระบบตรวจสอบความซ้ำซ้อน
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSheetsConfirm(true)}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D6B15E]/60 bg-white hover:bg-[#FAF7EE] text-[#5B2A86] text-xs font-semibold shadow-xs transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#D6B15E]" />
            <span>{isExporting ? 'กำลังซิงค์...' : 'ส่งออกรายงานจัดสรร (Google Sheets)'}</span>
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

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Grid: Left = 3-Step Wizard, Right = Current Active Deployments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Wizard (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7E0EF] shadow-xs p-6 sm:p-8 space-y-6">
          {/* Stepper Progress */}
          <div className="flex items-center justify-between border-b border-[#E7E0EF] pb-4">
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep >= 1 ? 'bg-[#32145C] text-[#FFE082]' : 'bg-gray-100 text-gray-500'
              }`}>
                1
              </span>
              <span className={`text-xs font-semibold ${currentStep >= 1 ? 'text-[#32145C]' : 'text-gray-400'}`}>
                เลือกครู D.A.R.E.
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300" />
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep >= 2 ? 'bg-[#32145C] text-[#FFE082]' : 'bg-gray-100 text-gray-500'
              }`}>
                2
              </span>
              <span className={`text-xs font-semibold ${currentStep >= 2 ? 'text-[#32145C]' : 'text-gray-400'}`}>
                เลือกโรงเรียน
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300" />
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 3 ? 'bg-[#32145C] text-[#FFE082]' : 'bg-gray-100 text-gray-500'
              }`}>
                3
              </span>
              <span className={`text-xs font-semibold ${currentStep === 3 ? 'text-[#32145C]' : 'text-gray-400'}`}>
                ยืนยันคำสั่ง
              </span>
            </div>
          </div>

          {/* STEP 1: Select Instructor */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={personSearch}
                    onChange={(e) => setPersonSearch(e.target.value)}
                    placeholder="ค้นหาชื่อครู, ยศ หรือเลขประจำตัว..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E0EF] rounded-xl focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <select
                  value={personUnitFilter}
                  onChange={(e) => setPersonUnitFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-[#E7E0EF] rounded-xl text-[#211A2B] focus:outline-none"
                >
                  <option value="all">ทุกหน่วยสังกัด</option>
                  {organizations.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {filteredPersonnel.map((p) => {
                  const isSelected = selectedPersonnelId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPersonnelId(p.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'border-[#7C3AED] bg-purple-50/70 shadow-xs' 
                          : 'border-[#E7E0EF] hover:border-purple-200 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-[#32145C] text-[#FFE082]' : 'bg-purple-100 text-[#5B2A86]'
                        }`}>
                          {p.rank}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#211A2B]">
                            {p.rank} {p.firstName} {p.lastName}
                          </div>
                          <div className="text-[11px] text-[#756B80]">
                            {p.organizationName} · จ.{p.province || 'ไม่ระบุพื้นที่'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-medium text-[#5B2A86]">
                          รับผิดชอบแล้ว {p.assignedSchoolCount || 0} โรงเรียน
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  disabled={!selectedPersonnelId}
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#32145C] hover:bg-[#250E42] text-white text-xs font-semibold disabled:opacity-40 transition-all"
                >
                  <span>ต่อไป: เลือกสถานศึกษา</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Schools */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[#756B80]">ครู D.A.R.E. ที่เลือก:</div>
                  <div className="text-xs font-bold text-[#32145C]">
                    {selectedOfficer?.rank} {selectedOfficer?.firstName} {selectedOfficer?.lastName} ({selectedOfficer?.organizationName})
                  </div>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-[#7C3AED] hover:underline font-medium"
                >
                  เปลี่ยน
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={schoolSearch}
                    onChange={(e) => setSchoolSearch(e.target.value)}
                    placeholder="ค้นหาชื่อโรงเรียน หรืออำเภอ..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E0EF] rounded-xl focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <select
                  value={schoolProvinceFilter}
                  onChange={(e) => setSchoolProvinceFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-[#E7E0EF] rounded-xl text-[#211A2B] focus:outline-none"
                >
                  <option value="all">ทุกจังหวัด</option>
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {filteredSchools.map((s) => {
                  const isChecked = selectedSchoolIds.includes(s.id);
                  const isAlreadyAssigned = s.assignedPersonnelIds.length > 0;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleToggleSchool(s.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isChecked 
                          ? 'border-[#7C3AED] bg-purple-50/70' 
                          : 'border-[#E7E0EF] hover:border-purple-200 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by div click
                          className="w-4 h-4 text-[#7C3AED] rounded border-gray-300 focus:ring-[#7C3AED]"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#211A2B]">{s.name}</div>
                          <div className="text-[11px] text-[#756B80]">
                            {s.type === 'bpp_school' ? 'รร.ตชด. ชายแดน' : 'รร. สพฐ./ทั่วไป'} · อ.{s.district} จ.{s.province}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {isAlreadyAssigned ? (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            มีครูประจำแล้ว ({s.assignedPersonnelIds.length} ท่าน)
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ยังไม่มีครูประจำ
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-[#756B80] hover:text-[#211A2B]"
                >
                  ย้อนกลับ
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#756B80]">เลือกแล้ว {selectedSchoolIds.length} แห่ง</span>
                  <button
                    disabled={selectedSchoolIds.length === 0}
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#32145C] hover:bg-[#250E42] text-white text-xs font-semibold disabled:opacity-40 transition-all"
                  >
                    <span>ต่อไป: ตรวจสอบและยืนยัน</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Confirm & Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50/80 rounded-xl p-4 border border-[#E7E0EF] space-y-3">
                <div className="text-xs font-bold text-[#32145C] border-b border-[#E7E0EF] pb-2">
                  สรุปรายละเอียดการมอบหมาย
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#756B80]">ครูผู้รับผิดชอบ:</span>
                    <div className="font-bold text-[#211A2B] mt-0.5">
                      {selectedOfficer?.rank} {selectedOfficer?.firstName} {selectedOfficer?.lastName}
                    </div>
                    <div className="text-[11px] text-[#756B80]">{selectedOfficer?.organizationName}</div>
                  </div>
                  <div>
                    <span className="text-[#756B80]">จำนวนสถานศึกษา:</span>
                    <div className="font-bold text-[#7C3AED] mt-0.5">
                      {selectedSchoolIds.length} แห่ง
                    </div>
                  </div>
                </div>
              </div>

              {/* Conflict Warnings */}
              {conflictWarnings.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>แจ้งเตือน: โรงเรียนมีครู D.A.R.E. ปฏิบัติหน้าที่อยู่แล้ว</span>
                  </div>
                  <ul className="text-[11px] text-amber-700 list-disc list-inside space-y-1 pl-1">
                    {conflictWarnings.map((w, idx) => (
                      <li key={idx}>
                        <span className="font-semibold">{w?.schoolName}</span> (มี {w?.instructors})
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-amber-600 italic">
                    *ระบบอนุญาตให้มีครูช่วยสอนร่วมกันได้ หากเป็นโรงเรียนขนาดใหญ่
                  </p>
                </div>
              )}

              {/* Date Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#756B80] mb-1">ปีการศึกษา</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E7E0EF] rounded-xl focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#756B80] mb-1">วันเริ่มปฏิบัติหน้าที่</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E7E0EF] rounded-xl focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#756B80] mb-1">สิ้นสุด (ประมาณการ)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E7E0EF] rounded-xl focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#E7E0EF]">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-[#756B80] hover:text-[#211A2B]"
                >
                  ย้อนกลับ
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={handleCompleteAssignment}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D6B15E] to-[#BF9636] text-[#211A2B] text-xs font-bold shadow-md hover:scale-[1.02] transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#32145C]" />
                  <span>{isSubmitting ? 'กำลังบันทึก...' : 'อนุมัติและบันทึกคำสั่งมอบหมาย'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Assignments Roster (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E7E0EF] shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E0EF] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="text-xs font-bold text-[#32145C]">ทำเนียบคำสั่งมอบหมายปัจจุบัน</h3>
              </div>
              <span className="text-[11px] text-[#756B80]">
                ทั้งหมด {filteredHistory.length} คำสั่ง
              </span>
            </div>

            {/* Quick search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="ค้นหาคำสั่งมอบหมาย..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E7E0EF] rounded-lg focus:outline-none"
              />
            </div>

            <div className="max-h-[460px] overflow-y-auto space-y-2.5 pr-1">
              {filteredHistory.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 rounded-xl border border-[#E7E0EF] hover:border-purple-200 bg-white hover:bg-gray-50/40 transition-all flex items-start justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#211A2B]">
                      {item.schoolName}
                    </div>
                    <div className="text-[11px] text-[#5B2A86] font-medium">
                      ครูผู้ดูแล: {item.personnelName}
                    </div>
                    <div className="text-[10px] text-[#756B80] flex items-center gap-2">
                      <span>ปีการศึกษา {item.academicYear}</span>
                      <span>·</span>
                      <span>เริ่ม {new Date(item.startDate).toLocaleDateString('th-TH')}</span>
                    </div>
                  </div>

                  {currentRole !== 'report_viewer' && (
                    <button
                      onClick={() => setAssignmentToDelete({ id: item.id, schoolName: item.schoolName, officerName: item.personnelName })}
                      title="ยกเลิกการมอบหมาย"
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              {filteredHistory.length === 0 && (
                <div className="text-center py-8 text-xs text-[#756B80]">
                  ไม่พบข้อมูลคำสั่งมอบหมายที่ตรงกับเงื่อนไข
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {assignmentToDelete && (
        <ConfirmationModal
          isOpen={true}
          title="ยืนยันการยกเลิกคำสั่งมอบหมาย"
          description={`คุณต้องการยกเลิกคำสั่งมอบหมายให้ ${assignmentToDelete.officerName} ปฏิบัติหน้าที่ ณ ${assignmentToDelete.schoolName} หรือไม่?`}
          type="danger"
          confirmLabel="ยกเลิกคำสั่ง"
          cancelLabel="ปิด"
          onConfirm={handleConfirmDeleteAssignment}
          onCancel={() => setAssignmentToDelete(null)}
        />
      )}

      {/* Google Sheets Modal */}
      <ConfirmationModal
        isOpen={showSheetsConfirm}
        title="ส่งออกบัญชีการมอบหมายสู่ Google Sheets"
        description="ระบบจะสร้างเอกสาร Google Spreadsheet ใหม่ใน Google Drive ของท่าน พร้อมส่งออกตารางข้อมูลการจับคู่ครู ตชด. D.A.R.E. และสถานศึกษาอย่างครบถ้วน"
        type="sheets"
        confirmLabel="ส่งออกข้อมูลทันที"
        cancelLabel="ยกเลิก"
        onConfirm={handleExportSheets}
        onCancel={() => setShowSheetsConfirm(false)}
      />
    </div>
  );
};

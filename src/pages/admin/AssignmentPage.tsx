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
  FileText
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const AssignmentPage: React.FC = () => {
  const { 
    personnel, 
    schools, 
    assignments, 
    createAssignment, 
    removeAssignment, 
    currentRole 
  } = useApp();

  // Workflow steps: 1 = Select Officer, 2 = Select Schools, 3 = Terms & Review
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('');
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
  const [academicYear, setAcademicYear] = useState('2568');
  const [note, setNote] = useState('');

  // Search in steps
  const [officerSearch, setOfficerSearch] = useState('');
  const [schoolSearch, setSchoolSearch] = useState('');

  // Result / Notice message
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Remove confirmation modal
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [targetRemoveId, setTargetRemoveId] = useState<string | null>(null);

  const selectedOfficer = personnel.find(p => p.id === selectedPersonnelId);

  // Available officers (active status preferred)
  const filteredOfficers = personnel.filter(p => {
    return (
      p.firstName.toLowerCase().includes(officerSearch.toLowerCase()) ||
      p.lastName.toLowerCase().includes(officerSearch.toLowerCase()) ||
      p.organizationName.toLowerCase().includes(officerSearch.toLowerCase())
    );
  });

  // Available schools
  const filteredSchools = schools.filter(s => {
    return (
      s.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
      s.province.toLowerCase().includes(schoolSearch.toLowerCase()) ||
      s.district.toLowerCase().includes(schoolSearch.toLowerCase())
    );
  });

  const handleToggleSchool = (schoolId: string) => {
    if (selectedSchoolIds.includes(schoolId)) {
      setSelectedSchoolIds(selectedSchoolIds.filter(id => id !== schoolId));
    } else {
      setSelectedSchoolIds([...selectedSchoolIds, schoolId]);
    }
  };

  const handleExecuteAssignment = () => {
    if (!selectedPersonnelId || selectedSchoolIds.length === 0) {
      setActionNotice({ type: 'error', message: 'กรุณาเลือกครูผู้สอนและโรงเรียนอย่างน้อย 1 แห่ง' });
      return;
    }

    const result = createAssignment(selectedPersonnelId, selectedSchoolIds, academicYear, note);
    if (result.success) {
      setActionNotice({ type: 'success', message: result.message });
      // Reset form
      setStep(1);
      setSelectedPersonnelId('');
      setSelectedSchoolIds([]);
      setNote('');
    } else {
      setActionNotice({ type: 'error', message: result.message });
    }
  };

  const handleConfirmRemove = () => {
    if (targetRemoveId) {
      removeAssignment(targetRemoveId);
      setTargetRemoveId(null);
      setShowRemoveModal(false);
      setActionNotice({ type: 'success', message: 'ยกเลิกการมอบหมายเรียบร้อยแล้ว' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#32145C] flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-[#5B2A86]" />
          <span>ระบบการมอบหมายครู D.A.R.E. ประจำสถานศึกษา</span>
        </h1>
        <p className="text-xs text-[#756B80]">
          ขั้นตอนการจัดสรรครูตำรวจตระเวนชายแดนเข้าทำการสอนตามหลักสูตร ตรวจสอบความขัดแย้ง และประวัติการมอบหมาย
        </p>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
          actionNotice.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-red-50 text-red-900 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span className="font-medium">{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-gray-500 hover:text-gray-800 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Multi-Step Wizard Card (Only accessible to Admins) */}
      {(currentRole === 'central_admin' || currentRole === 'unit_admin') && (
        <div className="bg-white rounded-2xl border border-[#E7E0EF] shadow-2xs overflow-hidden">
          {/* Step Indicators */}
          <div className="bg-[#F7F5FB] px-6 py-4 border-b border-[#E7E0EF] flex items-center justify-between">
            <div className="flex items-center space-x-6 text-xs">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'font-bold text-[#5B2A86]' : 'text-gray-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step >= 1 ? 'bg-[#5B2A86] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </span>
                <span>เลือกครู D.A.R.E.</span>
              </div>

              <div className={`flex items-center gap-2 ${step >= 2 ? 'font-bold text-[#5B2A86]' : 'text-gray-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step >= 2 ? 'bg-[#5B2A86] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </span>
                <span>เลือกสถานศึกษา</span>
              </div>

              <div className={`flex items-center gap-2 ${step >= 3 ? 'font-bold text-[#5B2A86]' : 'text-gray-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step >= 3 ? 'bg-[#5B2A86] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </span>
                <span>ตรวจสอบและยืนยัน</span>
              </div>
            </div>

            <span className="text-[11px] text-[#756B80] hidden sm:inline">
              ขั้นตอนที่ {step} จาก 3
            </span>
          </div>

          {/* Step 1: Select Officer */}
          {step === 1 && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#211A2B]">1. เลือกครูตำรวจ D.A.R.E. ที่ต้องการมอบหมาย</h3>
                  <p className="text-xs text-[#756B80]">ตรวจสอบสถานะความพร้อมและจำนวนโรงเรียนที่รับผิดชอบอยู่ในปัจจุบัน</p>
                </div>
                <div className="relative w-64 text-xs">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={officerSearch}
                    onChange={(e) => setOfficerSearch(e.target.value)}
                    placeholder="ค้นหาชื่อหรือสังกัด..."
                    className="w-full pl-8 pr-3 py-1.5 border border-[#E7E0EF] rounded-lg bg-[#F7F5FB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1">
                {filteredOfficers.map((officer) => {
                  const isSelected = selectedPersonnelId === officer.id;
                  const isAvailable = officer.status === 'active';
                  return (
                    <div
                      key={officer.id}
                      onClick={() => isAvailable && setSelectedPersonnelId(officer.id)}
                      className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-[#7C3AED]/30'
                          : isAvailable
                          ? 'border-[#E7E0EF] hover:border-purple-300 bg-white'
                          : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-[#32145C]">{officer.rank} {officer.firstName} {officer.lastName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                        }`}>
                          {officer.status === 'active' ? 'พร้อมปฏิบัติหน้าที่' : 'ไม่พร้อม (ลา)'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#756B80] mt-1">{officer.organizationName}</div>
                      <div className="text-[10px] text-purple-700 mt-2 font-medium">
                        รับผิดชอบอยู่ {officer.assignedSchoolCount} แห่ง
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#E7E0EF] flex justify-end">
                <button
                  disabled={!selectedPersonnelId}
                  onClick={() => setStep(2)}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#5B2A86] hover:bg-[#441D66] rounded-lg disabled:opacity-40 flex items-center gap-1.5"
                >
                  <span>ต่อไป: เลือกสถานศึกษา</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Schools */}
          {step === 2 && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#211A2B]">
                    2. เลือกสถานศึกษาสำหรับ {selectedOfficer?.rank} {selectedOfficer?.firstName}
                  </h3>
                  <p className="text-xs text-[#756B80]">สามารถเลือกได้หลายโรงเรียนในคราวเดียวกัน (เลือกแล้ว {selectedSchoolIds.length} แห่ง)</p>
                </div>
                <div className="relative w-64 text-xs">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={schoolSearch}
                    onChange={(e) => setSchoolSearch(e.target.value)}
                    placeholder="ค้นหาชื่อหรือจังหวัด..."
                    className="w-full pl-8 pr-3 py-1.5 border border-[#E7E0EF] rounded-lg bg-[#F7F5FB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1">
                {filteredSchools.map((sch) => {
                  const isChecked = selectedSchoolIds.includes(sch.id);
                  const isAlreadyAssignedToThisOfficer = sch.assignedPersonnelIds.includes(selectedPersonnelId);
                  return (
                    <div
                      key={sch.id}
                      onClick={() => !isAlreadyAssignedToThisOfficer && handleToggleSchool(sch.id)}
                      className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-[#7C3AED]/30'
                          : isAlreadyAssignedToThisOfficer
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-[#E7E0EF] hover:border-purple-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-[#211A2B]">{sch.name}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isAlreadyAssignedToThisOfficer}
                          onChange={() => {}}
                          className="rounded text-[#5B2A86]"
                        />
                      </div>
                      <div className="text-[11px] text-[#756B80] mt-1">อ.{sch.district} จ.{sch.province}</div>
                      <div className="text-[10px] text-gray-500 mt-2">
                        {isAlreadyAssignedToThisOfficer ? 'มอบหมายครูท่านนี้อยู่แล้ว' : `นักเรียน ${sch.totalStudents} คน`}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#E7E0EF] flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  ย้อนกลับ
                </button>
                <button
                  disabled={selectedSchoolIds.length === 0}
                  onClick={() => setStep(3)}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#5B2A86] hover:bg-[#441D66] rounded-lg disabled:opacity-40 flex items-center gap-1.5"
                >
                  <span>ต่อไป: ตรวจสอบและบันทึก</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review and Confirm */}
          {step === 3 && (
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#211A2B]">3. ตรวจสอบข้อมูลและยืนยันการมอบหมาย</h3>
                <p className="text-xs text-[#756B80]">ตรวจสอบข้อมูลก่อนจัดเก็บเข้าสู่สารบบประวัติการมอบหมาย</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#5B2A86] text-white flex items-center justify-center font-bold">
                    {selectedOfficer?.rank.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#32145C] text-sm">
                      {selectedOfficer?.rank} {selectedOfficer?.firstName} {selectedOfficer?.lastName}
                    </h4>
                    <p className="text-[#756B80]">{selectedOfficer?.organizationName}</p>
                  </div>
                </div>

                <div className="border-t border-purple-200 pt-2 space-y-1">
                  <span className="font-bold text-[#5B2A86]">โรงเรียนที่มอบหมาย ({selectedSchoolIds.length} แห่ง):</span>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-700">
                    {selectedSchoolIds.map(sid => {
                      const s = schools.find(item => item.id === sid);
                      return <li key={sid}>{s?.name} (จ.{s?.province})</li>;
                    })}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">ปีการศึกษาที่มอบหมาย</label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg font-semibold"
                  >
                    <option value="2568">2568</option>
                    <option value="2567">2567</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">หมายเหตุคำสั่ง / วาระการสอน</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="เช่น คำสั่ง บช.ตชด. ที่ 123/2568"
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E7E0EF] flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={handleExecuteAssignment}
                  className="px-6 py-2.5 text-xs font-bold text-[#211A2B] bg-[#D6B15E] hover:bg-[#c49f48] rounded-lg shadow-sm"
                >
                  ยืนยันบันทึกการมอบหมาย
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assignment History Table */}
      <div className="bg-white rounded-xl border border-[#E7E0EF] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#E7E0EF] flex items-center justify-between bg-[#F7F5FB]">
          <h3 className="text-xs font-bold text-[#32145C] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#5B2A86]" />
            <span>ประวัติและรายการมอบหมายครู D.A.R.E. ในระบบ ({assignments.length} รายการ)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5FB] text-[#756B80] font-semibold border-b border-[#E7E0EF]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">ลำดับ</th>
                <th className="py-3 px-4">ครู D.A.R.E.</th>
                <th className="py-3 px-4">สถานศึกษาที่ได้รับมอบหมาย</th>
                <th className="py-3 px-4 text-center">ปีการศึกษา</th>
                <th className="py-3 px-4">วันที่เริ่มมีผล</th>
                <th className="py-3 px-4">คำสั่ง / หมายเหตุ</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0EF] text-[#211A2B]">
              {assignments.map((asg, idx) => (
                <tr key={asg.id} className="hover:bg-purple-50/50 transition-colors">
                  <td className="py-3 px-4 text-center text-[#756B80] font-mono">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium">
                    <span className="font-bold text-[#32145C]">{asg.personnelRank}</span> {asg.personnelName}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#211A2B]">{asg.schoolName}</td>
                  <td className="py-3 px-4 text-center font-mono">{asg.academicYear}</td>
                  <td className="py-3 px-4 text-[#756B80]">{asg.startDate}</td>
                  <td className="py-3 px-4 text-[#756B80]">{asg.note || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-[#168A62]">
                      กำลังปฏิบัติหน้าที่
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {(currentRole === 'central_admin' || currentRole === 'unit_admin') && (
                      <button
                        onClick={() => {
                          setTargetRemoveId(asg.id);
                          setShowRemoveModal(true);
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="ยกเลิกการมอบหมาย"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRemoveModal}
        title="ยืนยันการยกเลิกการมอบหมาย"
        description="คุณต้องการยกเลิกการมอบหมายครู D.A.R.E. ท่านนี้จากสถานศึกษาใช่หรือไม่? ระบบจะปรับปรุงสถานะโรงเรียนและจำนวนโรงเรียนในความรับผิดชอบของครูโดยอัตโนมัติ"
        type="warning"
        confirmLabel="ยืนยันยกเลิก"
        onConfirm={handleConfirmRemove}
        onCancel={() => setShowRemoveModal(false)}
      />
    </div>
  );
};

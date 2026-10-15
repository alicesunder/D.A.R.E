import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  School, 
  Calendar, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ArrowUpRight, 
  FileSpreadsheet, 
  MapPin, 
  FileText,
  ChevronRight
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const AdminDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { 
    personnel, 
    schools, 
    activities, 
    organizations, 
    updateActivityStatus,
    exportActivitiesToGoogleSheets,
    currentRole
  } = useApp();

  // Filters
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('2568');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');

  // Confirmation Modal state for Google Sheets
  const [showSheetsConfirm, setShowSheetsConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<{ url?: string; message: string } | null>(null);

  // Filtered dataset for dashboard
  const filteredActivities = activities.filter((a) => {
    const matchYear = a.fiscalYear === selectedFiscalYear;
    const matchUnit = selectedUnit === 'all' || a.organizationId === selectedUnit;
    const matchProv = selectedProvince === 'all' || true; // Can be joined with school
    return matchYear && matchUnit && matchProv;
  });

  // KPI Calculations from consistent dataset
  const totalOfficers = personnel.length;
  const activeOfficers = personnel.filter(p => p.status === 'active').length;
  const totalSchools = schools.length;
  const unassignedSchools = schools.filter(s => s.assignmentStatus === 'unassigned').length;
  const totalActivities = filteredActivities.length;
  const totalStudents = filteredActivities.reduce((acc, curr) => acc + (curr.studentCount || 0), 0);
  const pendingReports = filteredActivities.filter(a => a.status === 'pending_approval' || a.status === 'submitted').length;

  // Monthly Activity counts (Month 05 to 10 - Thai school semester)
  const monthlyData = [
    { month: 'พ.ค.', count: 3 },
    { month: 'มิ.ย.', count: 5 },
    { month: 'ก.ค.', count: 7 },
    { month: 'ส.ค.', count: 6 },
    { month: 'ก.ย.', count: 8 },
    { month: 'ต.ค.', count: filteredActivities.length },
  ];

  // Unit performance stats
  const unitStats = organizations
    .filter(o => o.level === 'subdivision')
    .map(unit => {
      const actCount = activities.filter(a => a.organizationId === unit.id).length;
      const schCount = schools.filter(s => s.organizationId === unit.id).length;
      return {
        name: unit.shortName,
        activities: actCount,
        schools: schCount,
      };
    });

  // Activity Status breakdown
  const statusCounts = {
    completed: filteredActivities.filter(a => a.status === 'completed').length,
    approved: filteredActivities.filter(a => a.status === 'approved').length,
    pending: filteredActivities.filter(a => a.status === 'pending_approval' || a.status === 'submitted').length,
    draft: filteredActivities.filter(a => a.status === 'draft').length,
  };

  const handleConfirmExport = async () => {
    try {
      setIsExporting(true);
      const res = await exportActivitiesToGoogleSheets();
      setExportNotice({ url: res.url, message: res.message });
      setShowSheetsConfirm(false);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการส่งออก Google Sheets');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#32145C]">
            ภาพรวมระบบศูนย์บัญชาการ D.A.R.E. (บช.ตชด.)
          </h1>
          <p className="text-xs text-[#756B80] mt-0.5">
            ระบบติดตามการเรียนการสอน การมอบหมายครู และสรุปผลรายงานสถานการณ์ประจำปีงบประมาณ
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSheetsConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#168A62] hover:bg-[#0f6b4b] rounded-lg shadow-xs transition-colors"
            title="ส่งออกสรุปรายงานกิจกรรมไปยัง Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ส่งออกสรุป Google Sheets</span>
          </button>
        </div>
      </div>

      {/* Export Success Banner */}
      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{exportNotice.message}</span>
          </div>
          {exportNotice.url && (
            <a
              href={exportNotice.url}
              target="_blank"
              rel="noreferrer"
              className="font-bold underline text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <span>เปิดดูสเปรดชีต</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Global Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E0EF] shadow-2xs flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#5B2A86]">
          <Filter className="w-3.5 h-3.5" />
          <span>ตัวกรองภาพรวม:</span>
        </div>

        {/* Fiscal Year */}
        <div className="flex items-center gap-2">
          <span className="text-[#756B80]">ปีงบประมาณ:</span>
          <select
            value={selectedFiscalYear}
            onChange={(e) => setSelectedFiscalYear(e.target.value)}
            className="bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg px-2.5 py-1 text-[#211A2B] font-semibold"
          >
            <option value="2568">2568 (ปัจจุบัน)</option>
            <option value="2567">2567</option>
          </select>
        </div>

        {/* Responsible Unit */}
        <div className="flex items-center gap-2">
          <span className="text-[#756B80]">หน่วยงาน ตชด.:</span>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg px-2.5 py-1 text-[#211A2B]"
          >
            <option value="all">ทุกหน่วยงาน (ทั่วประเทศ)</option>
            {organizations.filter(o => o.level === 'subdivision').map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 6 Core KPI Cards (Derived from real state) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E0EF] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#756B80]">
            <span className="text-xs">ครู D.A.R.E. ทั้งหมด</span>
            <Users className="w-4 h-4 text-[#5B2A86]" />
          </div>
          <div className="text-2xl font-black text-[#32145C]">{totalOfficers}</div>
          <div className="text-[10px] text-[#168A62]">ปฏิบัติการปกติ {activeOfficers} นาย</div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E0EF] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#756B80]">
            <span className="text-xs">โรงเรียนในระบบ</span>
            <School className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#211A2B]">{totalSchools}</div>
          <div className="text-[10px] text-[#756B80]">รร.ตชด. และ สพฐ. ร่วม</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E0EF] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#756B80]">
            <span className="text-xs">กิจกรรมที่ดำเนินการ</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#168A62]">{totalActivities}</div>
          <div className="text-[10px] text-[#168A62]">100% ตามแผนภาคเรียน</div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E0EF] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#756B80]">
            <span className="text-xs">นักเรียนที่เข้าร่วม</span>
            <UserCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-[#5B2A86]">{totalStudents.toLocaleString()}</div>
          <div className="text-[10px] text-[#756B80]">คน (ผ่านการอบรม)</div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E0EF] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#756B80]">
            <span className="text-xs">รายงานที่รอตรวจสอบ</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-[#D99720]">{pendingReports}</div>
          <div className="text-[10px] text-amber-700">รออนุมัติโดยสารวัตร/ผกก.</div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E0EF] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#756B80]">
            <span className="text-xs">ยังไม่มีครูรับผิดชอบ</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-[#C63C4B]">{unassignedSchools}</div>
          <div className="text-[10px] text-[#C63C4B]">โรงเรียนต้องจัดสรรด่วน</div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Monthly activities bar visualization */}
        <div className="bg-white p-5 rounded-xl border border-[#E7E0EF] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#32145C]">กิจกรรมแยกตามเดือน (ปีงบ 2568)</h3>
            <span className="text-[11px] text-[#756B80]">รวม {totalActivities} กิจกรรม</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
            {monthlyData.map((d, i) => {
              const maxVal = 10;
              const heightPct = Math.max(15, (d.count / maxVal) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <span className="text-[10px] font-bold text-[#5B2A86] group-hover:scale-110 transition-transform">
                    {d.count}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-gradient-to-t from-[#32145C] to-[#7C3AED] rounded-t-md transition-all group-hover:brightness-110"
                  />
                  <span className="text-[10px] text-[#756B80]">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Unit Performance comparison */}
        <div className="bg-white p-5 rounded-xl border border-[#E7E0EF] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#32145C]">ผลการดำเนินงานตามหน่วย ตชด.</h3>
            <span className="text-[11px] text-[#756B80]">กองกำกับการ</span>
          </div>

          <div className="space-y-3 pt-2">
            {unitStats.slice(0, 5).map((unit, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#211A2B]">{unit.name}</span>
                  <span className="text-[11px] text-[#756B80]">
                    {unit.activities} กิจกรรม ({unit.schools} รร.)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#F2ECFA] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (unit.activities / 6) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-[#D6B15E] to-[#5B2A86] rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Activity Status breakdown */}
        <div className="bg-white p-5 rounded-xl border border-[#E7E0EF] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#32145C]">สถานะกิจกรรมทั้งหมด</h3>
            <span className="text-[11px] text-[#756B80]">{totalActivities} รายการ</span>
          </div>

          <div className="space-y-2.5 pt-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#168A62]" />
                <span>เสร็จสิ้นและรายงานแล้ว</span>
              </span>
              <span className="font-bold">{statusCounts.completed}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 text-blue-900">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>อนุมัติแล้ว (เตรียมสอน)</span>
              </span>
              <span className="font-bold">{statusCounts.approved}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 text-amber-900">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D99720]" />
                <span>รอผู้บังคับบัญชาอนุมัติ</span>
              </span>
              <span className="font-bold">{statusCounts.pending}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-gray-700">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                <span>ร่าง / กำลังร่างแผน</span>
              </span>
              <span className="font-bold">{statusCounts.draft}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Lists: Pending Reports & Unassigned Schools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Reports List */}
        <div className="bg-white rounded-xl border border-[#E7E0EF] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#E7E0EF] flex items-center justify-between bg-[#F7F5FB]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-[#32145C]">รายงานที่รอตรวจสอบและอนุมัติ</h3>
            </div>
            <button
              onClick={() => onNavigate('activities')}
              className="text-[11px] font-semibold text-[#5B2A86] hover:underline"
            >
              ดูทั้งหมด ({pendingReports})
            </button>
          </div>

          <div className="divide-y divide-[#E7E0EF]">
            {activities
              .filter(a => a.status === 'pending_approval' || a.status === 'submitted')
              .slice(0, 3)
              .map((act) => (
                <div key={act.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#5B2A86]">{act.code}</span>
                      <h4 className="text-xs font-bold text-[#211A2B]">{act.title}</h4>
                      <p className="text-[11px] text-[#756B80]">{act.schoolName}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                      รออนุมัติ
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-[#756B80]">ผู้สอน: {act.instructorNames.join(', ')}</span>
                    {currentRole === 'central_admin' || currentRole === 'unit_admin' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateActivityStatus(act.id, 'approved', 'อนุมัติผ่านระบบ Command Center')}
                          className="px-2.5 py-1 text-[10px] font-semibold text-white bg-[#168A62] hover:bg-[#0f6b4b] rounded transition-colors"
                        >
                          อนุมัติทันที
                        </button>
                      </div>
                    ) : (
                      <span className="text-[#756B80] italic">เฉพาะผู้บังคับบัญชา</span>
                    )}
                  </div>
                </div>
              ))}

            {pendingReports === 0 && (
              <div className="p-6 text-center text-xs text-[#756B80]">
                ไม่มีรายงานที่รอตรวจสอบในขณะนี้
              </div>
            )}
          </div>
        </div>

        {/* Schools without assigned instructors */}
        <div className="bg-white rounded-xl border border-[#E7E0EF] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#E7E0EF] flex items-center justify-between bg-[#F7F5FB]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-bold text-[#32145C]">โรงเรียนที่ยังไม่มีครู D.A.R.E. รับผิดชอบ</h3>
            </div>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-[11px] font-semibold text-[#5B2A86] hover:underline"
            >
              ไปหน้ามอบหมายครู
            </button>
          </div>

          <div className="divide-y divide-[#E7E0EF]">
            {schools
              .filter(s => s.assignmentStatus === 'unassigned')
              .map((sch) => (
                <div key={sch.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#211A2B]">{sch.name}</h4>
                    <p className="text-[11px] text-[#756B80]">
                      อ.{sch.district} จ.{sch.province} • นักเรียน {sch.totalStudents} คน
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('assignments')}
                    className="px-3 py-1.5 text-xs font-semibold text-[#5B2A86] bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg whitespace-nowrap transition-colors"
                  >
                    จัดสรรครู
                  </button>
                </div>
              ))}

            {unassignedSchools === 0 && (
              <div className="p-6 text-center text-xs text-[#168A62]">
                โรงเรียนทุกแห่งในระบบได้รับการจัดสรรครู D.A.R.E. ครบถ้วนแล้ว
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Google Sheets API (MANDATORY Google Workspace skill requirement) */}
      <ConfirmationModal
        isOpen={showSheetsConfirm}
        title="ส่งออกรายงานสู่ Google Sheets"
        description="ระบบจะสร้างเอกสาร Google Spreadsheet ใหม่ในบัญชี Google Workspace ของคุณ พร้อมเขียนบันทึกสรุปข้อมูลกิจกรรม D.A.R.E. ทั้งหมด"
        type="sheets"
        confirmLabel="ยืนยันสร้าง Google Spreadsheet"
        cancelLabel="ยกเลิก"
        isLoading={isExporting}
        details={[
          `จำนวนรายการกิจกรรมที่จะส่งออก: ${filteredActivities.length} รายการ`,
          `ปีงบประมาณ: ${selectedFiscalYear}`,
          'สิทธิ์ที่ใช้: spreadsheets และ drive.file',
        ]}
        onConfirm={handleConfirmExport}
        onCancel={() => setShowSheetsConfirm(false)}
      />
    </div>
  );
};

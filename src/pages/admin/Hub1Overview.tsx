import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  School, 
  Calendar, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowUpRight, 
  Filter, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

interface Hub1OverviewProps {
  onNavigateHub: (hubId: string) => void;
}

export const Hub1Overview: React.FC<Hub1OverviewProps> = ({ onNavigateHub }) => {
  const { 
    personnel, 
    schools, 
    activities, 
    organizations, 
    updateActivityStatus,
    exportActivitiesToGoogleSheets,
    currentRole
  } = useApp();

  const [selectedFiscalYear, setSelectedFiscalYear] = useState('2568');
  const [selectedUnit, setSelectedUnit] = useState('all');

  const [showSheetsConfirm, setShowSheetsConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<{ url?: string; message: string } | null>(null);

  // Filtered dataset
  const filteredActivities = activities.filter((a) => {
    const matchYear = a.fiscalYear === selectedFiscalYear;
    const matchUnit = selectedUnit === 'all' || a.organizationId === selectedUnit;
    return matchYear && matchUnit;
  });

  const totalOfficers = personnel.length;
  const activeOfficers = personnel.filter(p => p.status === 'active').length;
  const totalSchools = schools.length;
  const unassignedSchools = schools.filter(s => s.assignmentStatus === 'unassigned').length;
  const totalActivities = filteredActivities.length;
  const totalStudents = filteredActivities.reduce((acc, curr) => acc + (curr.studentCount || 0), 0);
  const pendingReports = filteredActivities.filter(a => a.status === 'pending_approval' || a.status === 'submitted').length;

  const monthlyData = [
    { month: 'พ.ค.', count: 3 },
    { month: 'มิ.ย.', count: 5 },
    { month: 'ก.ค.', count: 7 },
    { month: 'ส.ค.', count: 6 },
    { month: 'ก.ย.', count: 8 },
    { month: 'ต.ค.', count: filteredActivities.length },
  ];

  const unitStats = organizations
    .filter(o => o.level === 'subdivision')
    .map(unit => ({
      name: unit.shortName,
      fullName: unit.name,
      province: unit.province,
      activities: activities.filter(a => a.organizationId === unit.id).length,
      schools: schools.filter(s => s.organizationId === unit.id).length,
    }));

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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header with Breathing Room */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#EAE5F2]">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[#6D28D9] tracking-wider">
            โซนที่ 1 · ภาพรวมและวิเคราะห์
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1726] tracking-tight">
            ศูนย์บัญชาการภาพรวม (Command Overview)
          </h1>
          <p className="text-xs text-[#696075]">
            ข้อมูลยุทธศาสตร์การขับเคลื่อนการเรียนการสอน D.A.R.E. บช.ตชด. ประจำปีงบประมาณ {selectedFiscalYear}
          </p>
        </div>

        {/* Action & Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-[#EAE5F2] text-xs">
            <span className="text-[#8E869B] px-2 font-medium">ปีงบประมาณ:</span>
            <select
              value={selectedFiscalYear}
              onChange={(e) => setSelectedFiscalYear(e.target.value)}
              className="bg-transparent font-semibold text-[#1C1726] outline-hidden cursor-pointer"
            >
              <option value="2568">2568 (ปัจจุบัน)</option>
              <option value="2567">2567</option>
            </select>
          </div>

          <button
            onClick={() => setShowSheetsConfirm(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#116630] rounded-lg transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ส่งออกสรุป Google Sheets</span>
          </button>
        </div>
      </div>

      {/* Sheets Notice */}
      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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

      {/* 2. Primary Strategic KPI Strip (Clean, Unboxed, Zero-Pill) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-white rounded-2xl border border-[#EAE5F2] shadow-2xs">
        <div className="space-y-1">
          <div className="text-xs text-[#696075] flex items-center gap-2">
            <span>ครู D.A.R.E. ทั่วประเทศ</span>
            <span className="text-[#8E869B]">·</span>
            <span className="text-emerald-700 font-medium">พร้อม {activeOfficers}</span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1C1726] tabular-nums">
            {totalOfficers}
          </div>
          <div className="text-[11px] text-[#8E869B]">นายตำรวจผู้ผ่านการอบรมวิทยากร</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-[#696075] flex items-center gap-2">
            <span>โรงเรียนในเครือข่าย</span>
            <span className="text-[#8E869B]">·</span>
            <span className={unassignedSchools > 0 ? 'text-amber-700 font-medium' : 'text-emerald-700'}>
              {unassignedSchools > 0 ? `รอจัดสรร ${unassignedSchools}` : 'ครบ 100%'}
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1C1726] tabular-nums">
            {totalSchools}
          </div>
          <div className="text-[11px] text-[#8E869B]">รร.ตชด. และ สพฐ. ขยายโอกาส</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-[#696075] flex items-center gap-2">
            <span>กิจกรรมที่ดำเนินการ</span>
            <span className="text-[#8E869B]">·</span>
            <span className="text-[#6D28D9] font-medium">{selectedFiscalYear}</span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#32145C] tabular-nums">
            {totalActivities}
          </div>
          <div className="text-[11px] text-[#8E869B]">คาบเรียนมาตรฐานและค่ายเยาวชน</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-[#696075] flex items-center gap-2">
            <span>นักเรียนที่สร้างภูมิคุ้มกัน</span>
            <span className="text-[#8E869B]">·</span>
            <span className="text-emerald-700 font-medium">ป.5 - ม.3</span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#15803D] tabular-nums">
            {totalStudents.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#8E869B]">คน ผ่านการฝึกทักษะการตัดสินใจ</div>
        </div>
      </div>

      {/* 3. Visual Insight Grid (Monthly Flow + Regional Performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Activity Progress (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#EAE5F2] shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1C1726]">
                ความก้าวหน้าการเรียนการสอนรายเดือน
              </h3>
              <p className="text-xs text-[#696075]">ภาคเรียนที่ 1 ปีการศึกษา {selectedFiscalYear}</p>
            </div>
            <div className="text-xs text-[#6D28D9] font-semibold">
              เป้าหมายสำเร็จ 100%
            </div>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {monthlyData.map((d, i) => {
              const heightPct = Math.max(18, (d.count / 10) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-xs font-bold text-[#4E2174] tabular-nums transition-transform group-hover:scale-110">
                    {d.count}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-gradient-to-t from-[#250E42] via-[#4E2174] to-[#6D28D9] rounded-t-lg transition-all group-hover:brightness-110"
                  />
                  <span className="text-xs font-medium text-[#696075]">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional Performance (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#EAE5F2] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1C1726]">
                ผลงานรายกองกำกับการ (กก.ตชด.)
              </h3>
              <p className="text-xs text-[#696075]">หน่วยปฏิบัติการหลักในพื้นที่</p>
            </div>
            <button
              onClick={() => onNavigateHub('hub2')}
              className="text-xs font-semibold text-[#6D28D9] hover:underline"
            >
              ดูทั้งหมด
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {unitStats.slice(0, 5).map((unit, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1C1726]">{unit.name} ({unit.province})</span>
                  <span className="text-[#696075] tabular-nums">
                    {unit.activities} กิจกรรม · {unit.schools} รร.
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#FAF9FD] rounded-full overflow-hidden border border-[#EAE5F2]">
                  <div
                    style={{ width: `${Math.min(100, (unit.activities / 6) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-[#D6B15E] to-[#6D28D9] rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Quick Action Operational Cards (Pending Approvals + Allocation Attention) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl border border-[#EAE5F2] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#EAE5F2] flex items-center justify-between bg-[#FAF9FD]/60">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-[#1C1726]">
                รายงานผลการสอนที่รอการอนุมัติ ({pendingReports})
              </h3>
            </div>
            <button
              onClick={() => onNavigateHub('hub4')}
              className="text-xs font-semibold text-[#6D28D9] hover:underline"
            >
              ไปห้องปฏิบัติการสอน
            </button>
          </div>

          <div className="divide-y divide-[#EAE5F2]">
            {activities
              .filter(a => a.status === 'pending_approval' || a.status === 'submitted')
              .slice(0, 3)
              .map((act) => (
                <div key={act.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-mono font-bold text-[#6D28D9]">{act.code}</div>
                      <h4 className="text-xs font-bold text-[#1C1726]">{act.title}</h4>
                      <p className="text-[11px] text-[#696075]">{act.schoolName} · ครู {act.instructorNames.join(', ')}</p>
                    </div>
                    <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                      รออนุมัติ
                    </span>
                  </div>

                  {(currentRole === 'central_admin' || currentRole === 'unit_admin') && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => updateActivityStatus(act.id, 'approved', 'อนุมัติเรียบร้อยโดยผู้บังคับบัญชา')}
                        className="px-3 py-1 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#116630] rounded-lg transition-colors"
                      >
                        อนุมัติกิจกรรม
                      </button>
                    </div>
                  )}
                </div>
              ))}

            {pendingReports === 0 && (
              <div className="p-8 text-center text-xs text-[#8E869B]">
                ไม่มีรายงานที่รอตรวจสอบในขณะนี้
              </div>
            )}
          </div>
        </div>

        {/* Unassigned Schools Attention */}
        <div className="bg-white rounded-2xl border border-[#EAE5F2] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#EAE5F2] flex items-center justify-between bg-[#FAF9FD]/60">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-[#1C1726]">
                โรงเรียนที่ยังไม่มีครู D.A.R.E. ประจำการ ({unassignedSchools})
              </h3>
            </div>
            <button
              onClick={() => onNavigateHub('hub3')}
              className="text-xs font-semibold text-[#6D28D9] hover:underline"
            >
              ไปหน้าระบบมอบหมายครู
            </button>
          </div>

          <div className="divide-y divide-[#EAE5F2]">
            {schools
              .filter(s => s.assignmentStatus === 'unassigned')
              .map((sch) => (
                <div key={sch.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#1C1726]">{sch.name}</h4>
                    <p className="text-[11px] text-[#696075]">
                      อ.{sch.district} จ.{sch.province} · นักเรียน {sch.totalStudents} คน
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateHub('hub3')}
                    className="px-3 py-1.5 text-xs font-semibold text-[#4E2174] bg-purple-50 hover:bg-purple-100 rounded-lg whitespace-nowrap transition-colors"
                  >
                    จัดสรรครู
                  </button>
                </div>
              ))}

            {unassignedSchools === 0 && (
              <div className="p-8 text-center text-xs text-emerald-700">
                โรงเรียนทุกแห่งในระบบได้รับการจัดสรรครู D.A.R.E. ครบถ้วนแล้ว
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Google Sheets API */}
      <ConfirmationModal
        isOpen={showSheetsConfirm}
        title="ส่งออกรายงานภาพรวมสู่ Google Sheets"
        description="ระบบจะสร้างเอกสาร Google Spreadsheet ใหม่ในบัญชี Google Workspace ของคุณ พร้อมบันทึกสรุปข้อมูลสถิติและกิจกรรม D.A.R.E. ทั้งหมด"
        type="sheets"
        confirmLabel="ยืนยันสร้าง Google Spreadsheet"
        cancelLabel="ยกเลิก"
        isLoading={isExporting}
        details={[
          `จำนวนรายการที่จะส่งออก: ${filteredActivities.length} รายการ`,
          `ปีงบประมาณ: ${selectedFiscalYear}`,
          'สิทธิ์ที่ใช้: Google Sheets API v4 (spreadsheets & drive.file)',
        ]}
        onConfirm={handleConfirmExport}
        onCancel={() => setShowSheetsConfirm(false)}
      />
    </div>
  );
};

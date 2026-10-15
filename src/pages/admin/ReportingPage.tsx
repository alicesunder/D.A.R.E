import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  Building2, 
  School, 
  Users, 
  CheckCircle2, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const ReportingPage: React.FC = () => {
  const { 
    personnel, 
    schools, 
    activities, 
    organizations,
    exportActivitiesToGoogleSheets,
    exportRosterToGoogleSheets,
    exportSchoolsToGoogleSheets 
  } = useApp();

  const [reportType, setReportType] = useState<
    'fiscal_year' | 'unit' | 'officer' | 'unassigned' | 'pending'
  >('fiscal_year');

  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('2568');

  const [showSheetsConfirm, setShowSheetsConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [sheetsNotice, setSheetsNotice] = useState<{ url?: string; message: string } | null>(null);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const matchYear = a.fiscalYear === selectedFiscalYear;
      const matchUnit = selectedUnit === 'all' || a.organizationId === selectedUnit;
      return matchYear && matchUnit;
    });
  }, [activities, selectedFiscalYear, selectedUnit]);

  // Aggregate metrics
  const totalOfficers = personnel.filter(p => selectedUnit === 'all' || p.organizationId === selectedUnit).length;
  const totalSchools = schools.filter(s => selectedUnit === 'all' || s.organizationId === selectedUnit).length;
  const totalActs = filteredActivities.length;
  const totalStudents = filteredActivities.reduce((acc, curr) => acc + (curr.studentCount || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers = '';
    let rows: string[] = [];

    if (reportType === 'fiscal_year' || reportType === 'unit') {
      headers = 'ลำดับ,รหัสกิจกรรม,หัวข้อ,ประเภท,สถานศึกษา,สังกัด ตชด.,วันที่,ครูผู้สอน,นักเรียน,สถานะ';
      rows = filteredActivities.map((a, i) =>
        `${i + 1},"${a.code}","${a.title}","${a.category}","${a.schoolName}","${a.organizationName}","${a.date}","${a.instructorNames.join('; ')}",${a.studentCount},"${a.status}"`
      );
    } else if (reportType === 'unassigned') {
      headers = 'ลำดับ,รหัสโรงเรียน,ชื่อโรงเรียน,จังหวัด,อำเภอ,สังกัด ตชด.,จำนวนนักเรียน';
      rows = schools.filter(s => s.assignmentStatus === 'unassigned').map((s, i) =>
        `${i + 1},"${s.code}","${s.name}","${s.province}","${s.district}","${s.organizationName}",${s.totalStudents}`
      );
    } else {
      headers = 'ลำดับ,ยศ,ชื่อ,นามสกุล,สังกัด,โรงเรียนที่รับผิดชอบ,กิจกรรมที่สอน';
      rows = personnel.map((p, i) =>
        `${i + 1},"${p.rank}","${p.firstName}","${p.lastName}","${p.organizationName}",${p.assignedSchoolCount},${p.totalActivitiesConducted}`
      );
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DARE_Report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmGoogleSheetsExport = async () => {
    try {
      setIsExporting(true);
      let res;
      if (reportType === 'unassigned') {
        res = await exportSchoolsToGoogleSheets();
      } else if (reportType === 'officer') {
        res = await exportRosterToGoogleSheets();
      } else {
        res = await exportActivitiesToGoogleSheets();
      }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#32145C] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#5B2A86]" />
            <span>ระบบรายงานผลการปฏิบัติงานราชการ</span>
          </h1>
          <p className="text-xs text-[#756B80]">
            สรุปข้อมูลสถิติสำหรับผู้บังคับบัญชา ตรวจสอบ ติดตาม และส่งออกรายงานมาตรฐาน
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-[#E7E0EF] rounded-lg hover:bg-gray-50 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์รายงาน (Print)</span>
          </button>

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
        </div>
      </div>

      {/* Sheets Notice */}
      {sheetsNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 no-print">
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

      {/* Report Category Selector & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E0EF] shadow-2xs space-y-3 no-print">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'fiscal_year', label: '1. รายงานประจำปีงบประมาณ' },
            { id: 'unit', label: '2. รายงานระดับหน่วย ตชด.' },
            { id: 'officer', label: '3. รายงานผลงานรายบุคคล' },
            { id: 'unassigned', label: '4. รายงานโรงเรียนที่ยังไม่มีครู' },
            { id: 'pending', label: '5. รายงานกิจกรรมรออนุมัติ' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setReportType(r.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                reportType === r.id
                  ? 'bg-[#5B2A86] text-white shadow-xs'
                  : 'bg-[#F7F5FB] text-[#756B80] hover:bg-gray-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E7E0EF] text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#756B80]">ปีงบประมาณ:</span>
            <select
              value={selectedFiscalYear}
              onChange={(e) => setSelectedFiscalYear(e.target.value)}
              className="bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg px-2.5 py-1 text-[#211A2B]"
            >
              <option value="2568">2568</option>
              <option value="2567">2567</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#756B80]">หน่วยงาน:</span>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg px-2.5 py-1 text-[#211A2B]"
            >
              <option value="all">ทุกหน่วยงาน ตชด.</option>
              {organizations.filter(o => o.level === 'subdivision').map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-2xl border border-[#E7E0EF] shadow-sm p-6 sm:p-8 space-y-6">
        {/* Official Report Document Header */}
        <div className="text-center space-y-1 border-b-2 border-gray-900 pb-4">
          <div className="font-bold text-sm sm:text-base text-gray-900">
            กองบัญชาการตำรวจตระเวนชายแดน
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            รายงานผลการปฏิบัติงานโครงการครู D.A.R.E. ประจำปีงบประมาณ พ.ศ. {selectedFiscalYear}
          </h2>
          <div className="text-xs text-gray-600">
            ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Aggregate KPI Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <span className="text-gray-600 block">จำนวนครู D.A.R.E.</span>
            <span className="text-xl font-bold text-gray-900">{totalOfficers} นาย</span>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <span className="text-gray-600 block">สถานศึกษาในโครงการ</span>
            <span className="text-xl font-bold text-gray-900">{totalSchools} แห่ง</span>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <span className="text-gray-600 block">กิจกรรมที่ดำเนินการ</span>
            <span className="text-xl font-bold text-gray-900">{totalActs} ครั้ง</span>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <span className="text-gray-600 block">นักเรียนที่เข้าร่วม</span>
            <span className="text-xl font-bold text-gray-900">{totalStudents.toLocaleString()} คน</span>
          </div>
        </div>

        {/* Detailed Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-gray-300">
            <thead className="bg-gray-100 text-gray-800 font-bold border-b border-gray-300">
              <tr>
                <th className="py-2.5 px-3 border-r border-gray-300 text-center w-12">ลำดับ</th>
                <th className="py-2.5 px-3 border-r border-gray-300">รหัส/รายการ</th>
                <th className="py-2.5 px-3 border-r border-gray-300">สถานศึกษา/หน่วยงาน</th>
                <th className="py-2.5 px-3 border-r border-gray-300">ผู้รับผิดชอบ</th>
                <th className="py-2.5 px-3 border-r border-gray-300 text-center">นักเรียน (คน)</th>
                <th className="py-2.5 px-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {filteredActivities.map((act, idx) => (
                <tr key={act.id}>
                  <td className="py-2 px-3 text-center border-r border-gray-300 font-mono">{idx + 1}</td>
                  <td className="py-2 px-3 border-r border-gray-300">
                    <span className="font-bold">{act.code}:</span> {act.title}
                  </td>
                  <td className="py-2 px-3 border-r border-gray-300">
                    <div>{act.schoolName}</div>
                    <div className="text-[10px] text-gray-500">{act.organizationName}</div>
                  </td>
                  <td className="py-2 px-3 border-r border-gray-300">{act.instructorNames.join(', ')}</td>
                  <td className="py-2 px-3 text-center border-r border-gray-300 font-bold">{act.studentCount}</td>
                  <td className="py-2 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100">
                      {act.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Sign-off block for Print */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-gray-800">
          <div className="space-y-12">
            <div>ลงชื่อ............................................................</div>
            <div>(ครูตำรวจ D.A.R.E. ผู้รายงาน)</div>
          </div>
          <div className="space-y-12">
            <div>ลงชื่อ............................................................</div>
            <div>(ผู้บังคับบัญชา/ผู้กำกับการ ตรวจรับรอง)</div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Google Sheets API */}
      <ConfirmationModal
        isOpen={showSheetsConfirm}
        title="ส่งออกรายงานราชการสู่ Google Sheets"
        description="ระบบจะสร้างเอกสาร Google Spreadsheet ใหม่ใน Google Drive ของคุณ และบันทึกตารางสรุปรายงานราชการฉบับนี้"
        type="sheets"
        confirmLabel="ยืนยันสร้างสเปรดชีต"
        isLoading={isExporting}
        details={[
          `ประเภทรายงาน: ${reportType}`,
          `ปีงบประมาณ: ${selectedFiscalYear}`,
          'สิทธิ์: Google Sheets API v4',
        ]}
        onConfirm={handleConfirmGoogleSheetsExport}
        onCancel={() => setShowSheetsConfirm(false)}
      />
    </div>
  );
};

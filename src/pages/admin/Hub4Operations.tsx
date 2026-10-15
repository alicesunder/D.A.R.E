import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, ActivityStatus } from '../../types';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Users, 
  Eye, 
  X,
  FileCheck,
  RotateCcw,
  BookOpen,
  Camera,
  Layers
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const Hub4Operations: React.FC = () => {
  const { 
    activities, 
    schools, 
    personnel, 
    organizations,
    createActivity, 
    updateActivityStatus, 
    exportActivitiesToGoogleSheets,
    currentRole 
  } = useApp();

  // Mode: 'calendar' | 'approvals'
  const [viewMode, setViewMode] = useState<'calendar' | 'approvals'>('calendar');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Filter in Approval Desk
  const [statusFilter, setStatusFilter] = useState<'all' | ActivityStatus>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // New Activity Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'dare_standard' as const,
    lessonNumber: 1,
    schoolId: schools[0]?.id || '',
    schoolName: schools[0]?.name || '',
    personnelIds: [personnel[0]?.id || ''],
    instructorNames: [`${personnel[0]?.rank} ${personnel[0]?.firstName} ${personnel[0]?.lastName}`],
    organizationId: organizations[0]?.id || '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '11:00',
    targetGrade: 'ป.5',
    studentCount: 35,
    description: '',
  });

  // Google Sheets Export
  const [showSheetsConfirm, setShowSheetsConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<{ url?: string; message: string } | null>(null);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNamesThai = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const currentYearBE = currentDate.getFullYear() + 543;
  const currentMonthName = monthNamesThai[currentDate.getMonth()];

  // Calendar Days calculation
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  const handleSchoolSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sc = schools.find((s) => s.id === e.target.value);
    if (sc) {
      setFormData({
        ...formData,
        schoolId: sc.id,
        schoolName: sc.name,
        organizationId: sc.organizationId
      });
    }
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    createActivity({
      title: formData.title,
      category: formData.category,
      lessonNumber: formData.lessonNumber,
      targetGrade: formData.targetGrade,
      schoolId: formData.schoolId,
      schoolName: formData.schoolName,
      organizationId: formData.organizationId,
      organizationName: schools.find(s => s.id === formData.schoolId)?.organizationName || 'บช.ตชด.',
      instructorIds: formData.personnelIds,
      instructorNames: formData.instructorNames,
      date: formData.date,
      time: `${formData.startTime} - ${formData.endTime} น.`,
      location: formData.schoolName,
      studentCount: formData.studentCount,
      description: formData.description,
      summary: formData.description,
      status: 'pending_approval',
      photoUrls: [
        'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80'
      ],
      fiscalYear: (() => {
        const [year, month] = formData.date.split('-').map(Number);
        return String(year + (month >= 10 ? 544 : 543));
      })()
    });
    setShowAddModal(false);
  };

  const handleExportSheets = async () => {
    setShowSheetsConfirm(false);
    setIsExporting(true);
    setExportNotice(null);
    try {
      const res = await exportActivitiesToGoogleSheets();
      if (res.success && res.url) {
        setExportNotice({
          url: res.url,
          message: `ส่งออกข้อมูลปฏิบัติการสอนสู่ Google Sheets เรียบร้อยแล้ว`
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

  const statusBadges: Record<ActivityStatus, { label: string; bg: string; text: string }> = {
    draft: { label: 'ร่างบันทึก', bg: 'bg-gray-100', text: 'text-gray-700' },
    submitted: { label: 'ส่งรายงานแล้ว', bg: 'bg-blue-50', text: 'text-blue-700' },
    pending_approval: { label: 'รอตรวจอนุมัติ', bg: 'bg-amber-50', text: 'text-amber-800' },
    approved: { label: 'อนุมัติเรียบร้อย', bg: 'bg-emerald-50', text: 'text-emerald-800' },
    in_progress: { label: 'กำลังสอน', bg: 'bg-purple-50', text: 'text-purple-800' },
    completed: { label: 'เสร็จสิ้นสมบูรณ์', bg: 'bg-emerald-50', text: 'text-emerald-900' },
    revision_requested: { label: 'ส่งกลับแก้ไข', bg: 'bg-red-50', text: 'text-red-700' },
    cancelled: { label: 'ยกเลิก', bg: 'bg-gray-100', text: 'text-gray-500' },
  };

  const filteredApprovals = activities.filter((a) => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchSearch = a.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        a.schoolName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        a.instructorNames.some(n => n.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const pendingCount = activities.filter(a => a.status === 'pending_approval' || a.status === 'submitted').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E7E0EF] pb-6">
        <div>
          <div className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider mb-1">
            Hub 4 — Teaching Operations & Approvals
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#32145C] tracking-tight">
            ห้องปฏิบัติการสอนและปฏิทินงาน ตชด.
          </h1>
          <p className="text-sm text-[#756B80] mt-1 font-light">
            ศูนย์กลางติดตามตารางการสอน D.A.R.E. ตรวจทานภาพถ่ายหลักฐาน และอนุมัติผลการปฏิบัติงาน
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View switcher */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-[#E7E0EF] text-xs">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'calendar' ? 'bg-[#32145C] text-white shadow-xs' : 'text-[#756B80] hover:text-[#211A2B]'
              }`}
            >
              ปฏิทินการสอน
            </button>
            <button
              onClick={() => setViewMode('approvals')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'approvals' ? 'bg-[#32145C] text-white shadow-xs' : 'text-[#756B80] hover:text-[#211A2B]'
              }`}
            >
              <span>โต๊ะตรวจอนุมัติ</span>
              {pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#D6B15E] text-[#211A2B] text-[10px] flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => setShowSheetsConfirm(true)}
            disabled={isExporting}
            className="p-2.5 rounded-xl border border-[#D6B15E]/60 bg-white hover:bg-[#FAF7EE] text-[#5B2A86] text-xs font-semibold shadow-xs"
            title="ส่งออก Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#D6B15E]" />
          </button>

          {currentRole !== 'report_viewer' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D6B15E] to-[#BF9636] text-[#211A2B] text-xs font-bold shadow-md hover:scale-[1.02] transition-all"
            >
              <Plus className="w-4 h-4 text-[#32145C]" />
              <span>บันทึกการสอนใหม่</span>
            </button>
          )}
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

      {/* VIEW 1: CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Calendar Grid (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E7E0EF] shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E0EF] pb-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#7C3AED]" />
                <h2 className="text-base font-bold text-[#32145C]">
                  {currentMonthName} พ.ศ. {currentYearBE}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg border border-[#E7E0EF] hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(2025, 4, 1))}
                  className="px-3 py-1.5 text-xs font-semibold text-[#5B2A86] border border-[#E7E0EF] rounded-lg hover:bg-purple-50"
                >
                  พ.ค. 68
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg border border-[#E7E0EF] hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#756B80] py-2 border-b border-gray-100">
              <span className="text-red-500">อา.</span>
              <span>จ.</span>
              <span>อ.</span>
              <span>พ.</span>
              <span>พฤ.</span>
              <span>ศ.</span>
              <span className="text-purple-600">ส.</span>
            </div>

            {/* Date cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-24 bg-gray-50/50 rounded-xl border border-transparent" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `2025-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayActivities = activities.filter((a) => a.date === dateStr);

                return (
                  <div
                    key={`day-${day}`}
                    className={`min-h-24 p-1.5 rounded-xl border transition-all flex flex-col justify-between ${
                      dayActivities.length > 0 
                        ? 'border-purple-200 bg-purple-50/20 hover:border-[#7C3AED]' 
                        : 'border-[#E7E0EF]/60 hover:bg-gray-50/60'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#211A2B]">{day}</span>
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayActivities.map((act) => (
                        <div
                          key={act.id}
                          onClick={() => setSelectedActivity(act)}
                          className="px-1.5 py-1 rounded bg-[#32145C] text-[#FFE082] text-[10px] font-medium truncate cursor-pointer hover:opacity-90 shadow-2xs"
                          title={act.title}
                        >
                          {act.schoolName}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Inspector / Selected Activity Detail (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E7E0EF] shadow-xs p-6 space-y-4">
              <div className="border-b border-[#E7E0EF] pb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#32145C] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#7C3AED]" />
                  <span>รายละเอียดบันทึกการสอน</span>
                </h3>
                {selectedActivity && (
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    statusBadges[selectedActivity.status]?.bg
                  } ${statusBadges[selectedActivity.status]?.text}`}>
                    {statusBadges[selectedActivity.status]?.label}
                  </span>
                )}
              </div>

              {selectedActivity ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="text-[11px] text-[#756B80]">บทเรียน / กิจกรรม</div>
                    <div className="font-bold text-[#211A2B] text-sm mt-0.5">{selectedActivity.title}</div>
                    <div className="text-[11px] text-[#5B2A86] mt-0.5">
                      {selectedActivity.category === 'dare_standard' 
                        ? `บทที่ ${selectedActivity.lessonNumber || '-'} หลักสูตรมาตรฐาน D.A.R.E.` 
                        : 'กิจกรรมรณรงค์พิเศษ'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-gray-50 border border-[#E7E0EF]">
                    <div>
                      <span className="text-[10px] text-[#756B80]">สถานศึกษา:</span>
                      <div className="font-semibold text-[#211A2B]">{selectedActivity.schoolName}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#756B80]">นักเรียนเข้าร่วม:</span>
                      <div className="font-semibold text-[#168A62]">{selectedActivity.studentCount} คน</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#756B80]">วันที่:</span>
                      <div className="font-semibold text-[#211A2B]">{new Date(selectedActivity.date).toLocaleDateString('th-TH')}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#756B80]">เวลา:</span>
                      <div className="font-semibold text-[#211A2B]">{selectedActivity.time}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#756B80]">วิทยากรครู ตชด.:</span>
                    <div className="font-medium text-[#211A2B] mt-0.5">
                      {selectedActivity.instructorNames.join(', ')}
                    </div>
                  </div>

                  {selectedActivity.description && (
                    <div>
                      <span className="text-[10px] text-[#756B80]">สาระการเรียนรู้:</span>
                      <p className="text-[11px] text-[#211A2B] mt-0.5 leading-relaxed bg-purple-50/50 p-2.5 rounded-lg border border-purple-100">
                        {selectedActivity.description}
                      </p>
                    </div>
                  )}

                  {/* Status Actions */}
                  {currentRole !== 'report_viewer' && (
                    <div className="pt-2 border-t border-[#E7E0EF] flex items-center gap-2">
                      {selectedActivity.status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => {
                              updateActivityStatus(selectedActivity.id, 'approved');
                              setSelectedActivity({ ...selectedActivity, status: 'approved' });
                            }}
                            className="flex-1 py-2 rounded-xl bg-[#168A62] text-white font-bold text-xs hover:bg-[#127050] transition-colors"
                          >
                            อนุมัติรายงาน
                          </button>
                          <button
                            onClick={() => {
                              updateActivityStatus(selectedActivity.id, 'revision_requested');
                              setSelectedActivity({ ...selectedActivity, status: 'revision_requested' });
                            }}
                            className="px-3 py-2 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50"
                          >
                            สั่งแก้ไข
                          </button>
                        </>
                      )}
                      {selectedActivity.status === 'approved' && (
                        <button
                          onClick={() => {
                            updateActivityStatus(selectedActivity.id, 'completed');
                            setSelectedActivity({ ...selectedActivity, status: 'completed' });
                          }}
                          className="w-full py-2 rounded-xl bg-[#32145C] text-[#FFE082] font-bold text-xs hover:bg-[#250E42]"
                        >
                          บันทึกเป็นกิจกรรมเสร็จสมบูรณ์
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-[#756B80]">
                  คลิกที่กิจกรรมในปฏิทินเพื่อดูสาระการเรียนรู้และผลการสอน
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: APPROVAL & AUDIT DESK */}
      {viewMode === 'approvals' && (
        <div className="bg-white rounded-2xl border border-[#E7E0EF] shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-[#E7E0EF] pb-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="ค้นหาชื่อเรื่อง, โรงเรียน, หรือชื่อครู..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E0EF] rounded-xl focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-[#756B80]">สถานะ:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs border border-[#E7E0EF] rounded-xl text-[#211A2B] focus:outline-none"
              >
                <option value="all">ทั้งหมด</option>
                <option value="pending_approval">รออนุมัติ ({activities.filter(a => a.status === 'pending_approval').length})</option>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="revision_requested">ส่งกลับแก้ไข</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E7E0EF] text-[#756B80] bg-gray-50/70">
                  <th className="py-3 px-4 font-bold">วันที่ปฏิบัติการ</th>
                  <th className="py-3 px-4 font-bold">บทเรียน / หัวข้อ</th>
                  <th className="py-3 px-4 font-bold">สถานศึกษา</th>
                  <th className="py-3 px-4 font-bold">ครูผู้สอน</th>
                  <th className="py-3 px-4 font-bold text-center">นักเรียน</th>
                  <th className="py-3 px-4 font-bold text-center">สถานะ</th>
                  <th className="py-3 px-4 font-bold text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E0EF]/60">
                {filteredApprovals.map((act) => (
                  <tr key={act.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#211A2B]">
                      {new Date(act.date).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#32145C]">{act.title}</div>
                      <div className="text-[10px] text-[#756B80]">
                        {act.category === 'dare_standard' ? `มาตรฐานบทที่ ${act.lessonNumber || '-'}` : 'กิจกรรมพิเศษ'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#211A2B]">{act.schoolName}</td>
                    <td className="py-3.5 px-4 text-[#5B2A86]">{act.instructorNames.join(', ')}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#168A62]">
                      {act.studentCount}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                        statusBadges[act.status]?.bg
                      } ${statusBadges[act.status]?.text}`}>
                        {statusBadges[act.status]?.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedActivity(act);
                            setViewMode('calendar');
                          }}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {currentRole !== 'report_viewer' && act.status === 'pending_approval' && (
                          <button
                            onClick={() => updateActivityStatus(act.id, 'approved')}
                            className="px-2.5 py-1 rounded-lg bg-[#168A62] text-white text-[11px] font-bold hover:bg-[#127050]"
                          >
                            อนุมัติ
                          </button>
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

      {/* Modal: Add New Activity */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E7E0EF] pb-3">
              <h3 className="text-base font-bold text-[#32145C]">บันทึกผลการปฏิบัติการสอน D.A.R.E.</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#756B80] mb-1">หัวข้อบทเรียน / กิจกรรม</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="เช่น บทที่ 3: ความจริงเกี่ยวกับยาเสพติดและแอลกอฮอล์"
                  className="w-full px-3 py-2 border border-[#E7E0EF] rounded-xl focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#756B80] mb-1">ประเภทหลักสูตร</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#E7E0EF] rounded-xl focus:outline-none"
                  >
                    <option value="dare_standard">หลักสูตรมาตรฐาน D.A.R.E. (10 บทเรียน)</option>
                    <option value="special_camp">ค่ายเยาวชนต้านยาเสพติด</option>
                    <option value="white_school">โครงการโรงเรียนสีขาว</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#756B80] mb-1">บทเรียนที่ (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.lessonNumber}
                    onChange={(e) => setFormData({ ...formData, lessonNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-[#E7E0EF] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#756B80] mb-1">สถานศึกษา</label>
                <select
                  value={formData.schoolId}
                  onChange={handleSchoolSelect}
                  className="w-full px-3 py-2 border border-[#E7E0EF] rounded-xl focus:outline-none"
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.province})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-[#756B80] mb-1">วันที่สอน</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E7E0EF] rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#756B80] mb-1">เวลาเริ่ม</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E7E0EF] rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#756B80] mb-1">เวลาสิ้นสุด</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E7E0EF] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#756B80] mb-1">กลุ่มเป้าหมาย</label>
                  <input
                    type="text"
                    value={formData.targetGrade}
                    onChange={(e) => setFormData({ ...formData, targetGrade: e.target.value })}
                    placeholder="ป.5 หรือ ม.1"
                    className="w-full px-3 py-2 border border-[#E7E0EF] rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#756B80] mb-1">จำนวนนักเรียนที่เข้าเรียน (คน)</label>
                  <input
                    type="number"
                    required
                    value={formData.studentCount}
                    onChange={(e) => setFormData({ ...formData, studentCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[#E7E0EF] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#756B80] mb-1">สรุปสาระการสอนและผลการตอบรับ</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="นักเรียนให้ความร่วมมือดี ฝึกทักษะการปฏิเสธเพื่อน..."
                  className="w-full px-3 py-2 border border-[#E7E0EF] rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E7E0EF] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-gray-500 hover:text-gray-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#32145C] hover:bg-[#250E42] text-[#FFE082] font-bold shadow-xs transition-all"
                >
                  บันทึกและส่งรายงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Sheets Modal */}
      <ConfirmationModal
        isOpen={showSheetsConfirm}
        title="ส่งออกบันทึกการสอนสู่ Google Sheets"
        description="ระบบจะสร้างเอกสาร Google Spreadsheet ใหม่ใน Google Drive ของท่าน พร้อมส่งออกข้อมูลบันทึกการสอน วันที่ สถานศึกษา และจำนวนนักเรียนทั้งหมด"
        type="sheets"
        confirmLabel="ส่งออกข้อมูลทันที"
        cancelLabel="ยกเลิก"
        onConfirm={handleExportSheets}
        onCancel={() => setShowSheetsConfirm(false)}
      />
    </div>
  );
};

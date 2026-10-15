import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity } from '../../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  School, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const ActivityCalendarPage: React.FC = () => {
  const { activities, schools } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 15)); // October 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-10-08');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const thaiYear = year + 543;

  // Days in month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Activities for selected date
  const dayActivities = activities.filter(a => a.date === selectedDateStr);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#32145C] flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-[#5B2A86]" />
            <span>ปฏิทินกิจกรรมการเรียนการสอน D.A.R.E.</span>
          </h1>
          <p className="text-xs text-[#756B80]">
            ตารางการสอนรายเดือน รายสัปดาห์ สำหรับโรงเรียน ตชด. และเครือข่ายความร่วมมือ
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-[#E7E0EF] shadow-2xs">
          <button
            onClick={handlePrevMonth}
            className="p-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-[#32145C] min-w-[140px] text-center">
            {monthNames[month]} {thaiYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E7E0EF] shadow-2xs p-5 space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#756B80] border-b border-[#E7E0EF] pb-2">
            <div className="text-red-500">อา.</div>
            <div>จ.</div>
            <div>อ.</div>
            <div>พ.</div>
            <div>พฤ.</div>
            <div>ศ.</div>
            <div className="text-purple-600">ส.</div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs">
            {/* Empty lead cells */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 sm:h-24 p-1 bg-gray-50/50 rounded-lg" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const acts = activities.filter(a => a.date === dateString);
              const isSelected = selectedDateStr === dateString;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDateStr(dateString)}
                  className={`h-20 sm:h-24 p-1.5 rounded-lg border flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#7C3AED] bg-purple-50/70 ring-2 ring-[#7C3AED]/30 font-bold'
                      : acts.length > 0
                      ? 'border-purple-200 bg-white hover:border-purple-400'
                      : 'border-[#E7E0EF] bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] ${isSelected ? 'text-[#5B2A86] font-extrabold' : 'text-gray-700'}`}>
                      {dayNum}
                    </span>
                    {acts.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#5B2A86] text-white text-[9px] flex items-center justify-center font-bold">
                        {acts.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 overflow-hidden">
                    {acts.slice(0, 2).map(act => (
                      <div
                        key={act.id}
                        className={`text-[9px] px-1 py-0.5 rounded truncate font-medium ${
                          act.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : act.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {act.schoolName.replace('โรงเรียนตำรวจตระเวนชายแดน', 'รร.ตชด.')}
                      </div>
                    ))}
                    {acts.length > 2 && (
                      <div className="text-[8px] text-gray-500 font-bold">+{acts.length - 2} อื่นๆ</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Panel */}
        <div className="bg-white rounded-2xl border border-[#E7E0EF] shadow-2xs p-5 space-y-4">
          <div className="border-b border-[#E7E0EF] pb-3">
            <span className="text-[10px] font-bold text-[#5B2A86] uppercase tracking-wider">
              กิจกรรมประจำวัน
            </span>
            <h3 className="text-sm font-bold text-[#211A2B] mt-0.5">
              วันที่ {selectedDateStr}
            </h3>
            <p className="text-xs text-[#756B80]">
              พบ {dayActivities.length} กิจกรรมการเรียนการสอน
            </p>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {dayActivities.map(act => (
              <div
                key={act.id}
                className="p-4 rounded-xl border border-[#E7E0EF] bg-[#F7F5FB] space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-[#5B2A86]">{act.code}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    act.status === 'completed'
                      ? 'bg-emerald-100 text-[#168A62]'
                      : act.status === 'approved'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {act.status}
                  </span>
                </div>

                <h4 className="font-bold text-[#211A2B] text-xs">{act.title}</h4>

                <div className="space-y-1 text-[#756B80] text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-[#5B2A86]" />
                    <span>{act.schoolName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#5B2A86]" />
                    <span>{act.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#5B2A86]" />
                    <span>ครูผู้สอน: {act.instructorNames.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#5B2A86]" />
                    <span>{act.location}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-purple-900">นักเรียน {act.studentCount} คน</span>
                  <span className="text-[#168A62] font-semibold">
                    {act.lessonNumber ? `บทเรียนที่ ${act.lessonNumber}` : 'กิจกรรมพิเศษ'}
                  </span>
                </div>
              </div>
            ))}

            {dayActivities.length === 0 && (
              <div className="py-12 text-center text-xs text-[#756B80] space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-gray-300" />
                <p>ไม่มีกิจกรรมการเรียนการสอนในวันที่เลือก</p>
                <p className="text-[10px] text-gray-400">คลิกเลือกวันที่มีจุดเครื่องหมายเพื่อดูตารางสอน</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity } from '../../types';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Search, 
  Filter, 
  X, 
  CheckCircle2, 
  Sparkles,
  BookOpen
} from 'lucide-react';

export const PublicActivitiesPage: React.FC = () => {
  const { activities } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Show only published, approved or completed activities
  const publicList = activities.filter(
    a => a.status === 'completed' || a.status === 'approved'
  );

  const filtered = publicList.filter(a => {
    return (
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="dare-public-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F2] text-[#5926B8] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>กิจกรรมการเรียนรู้ในสถานศึกษา</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#171E5B]">
          กิจกรรม D.A.R.E. กองบัญชาการตำรวจตระเวนชายแดน
        </h1>
        <p className="text-sm text-[#64748B]">
          ภาพบรรยากาศการเรียนการสอนจริงของครูตำรวจ ตชด. ที่ลงพื้นที่สร้างทักษะชีวิตให้แก่น้องๆ เยาวชน
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-[#64748B]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาชื่อกิจกรรม หรือโรงเรียน..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E5EAF5] rounded-xl text-xs focus:ring-2 focus:ring-[#E31837]"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((act) => (
          <div
            key={act.id}
            onClick={() => setSelectedActivity(act)}
            className="bg-white rounded-2xl border border-[#E5EAF5] shadow-2xs hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-48 overflow-hidden bg-purple-900/10">
                <img
                  src={act.photoUrls[0] || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80'}
                  alt={act.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold bg-[#171E5B]/90 text-[#FFE082] backdrop-blur-xs">
                  {act.lessonNumber ? `บทเรียนที่ ${act.lessonNumber}` : 'กิจกรรมพิเศษ'}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                  <Calendar className="w-3.5 h-3.5 text-[#5926B8]" />
                  <span>{act.date}</span>
                </div>
                <h3 className="text-sm font-bold text-[#172554] group-hover:text-[#5926B8] line-clamp-2 transition-colors">
                  {act.title}
                </h3>
                <div className="text-xs text-[#64748B] flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#5926B8] shrink-0" />
                  <span className="truncate">{act.schoolName}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F7F9FF] border-t border-[#E5EAF5] flex items-center justify-between text-xs">
              <span className="text-[#168A62] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>นักเรียน {act.studentCount} คน</span>
              </span>
              <span className="text-[#5926B8] font-bold">ดูรายละเอียด</span>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-[#E5EAF5]">
            <div className="relative h-60 bg-purple-900/10">
              <img
                src={selectedActivity.photoUrls[0] || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80'}
                alt={selectedActivity.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedActivity(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#5926B8] uppercase tracking-wider">
                  {selectedActivity.lessonNumber ? `บทเรียนที่ ${selectedActivity.lessonNumber}` : 'กิจกรรมพิเศษ'}
                </span>
                <h3 className="text-base font-bold text-[#172554] mt-0.5">{selectedActivity.title}</h3>
                <div className="text-[#64748B] mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#5926B8]" />
                  <span>{selectedActivity.schoolName} ({selectedActivity.location})</span>
                </div>
              </div>

              <div className="p-3 bg-[#F7F9FF] rounded-xl border border-[#E5EAF5] space-y-1">
                <span className="font-bold text-[#171E5B]">เนื้อหาการจัดกิจกรรม:</span>
                <p className="text-gray-700 leading-relaxed">{selectedActivity.description}</p>
              </div>

              {selectedActivity.summary && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
                  <span className="font-bold text-emerald-950">ผลลัพธ์ที่ได้:</span>
                  <p className="text-emerald-800 leading-relaxed">{selectedActivity.summary}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-[#64748B] pt-2 border-t border-[#E5EAF5]">
                <span>ผู้รับผิดชอบ: {selectedActivity.organizationName}</span>
                <span>จำนวนนักเรียน: {selectedActivity.studentCount} คน</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandIdentity, DareLogo, BppLogo } from '../../components/ui/Logos';
import { 
  Shield, 
  Award, 
  BookOpen, 
  Users, 
  School, 
  ChevronRight, 
  HeartHandshake, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onGoToAdmin: () => void;
  onSelectActivity: (id: string) => void;
  onSelectNews: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onGoToAdmin,
  onSelectActivity,
  onSelectNews,
}) => {
  const { activities, news, schools, personnel, organizations } = useApp();
  const [newsFilter, setNewsFilter] = useState<'all' | 'news' | 'activity' | 'knowledge'>('all');
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');

  // Filtered public activities (only completed/approved)
  const publicActivities = activities.filter(
    (a) => a.status === 'completed' || a.status === 'approved'
  );

  // Statistics calculated from real dataset
  const totalParticipatingSchools = schools.length;
  const totalRecordedActivities = activities.length;
  const totalStudentsReached = activities.reduce((acc, curr) => acc + (curr.studentCount || 0), 0);
  const totalUnits = organizations.filter(o => o.level === 'subdivision').length;

  const filteredNews = news.filter((item) => {
    if (newsFilter === 'all') return item.status === 'published';
    return item.status === 'published' && item.category === newsFilter;
  });

  // Schools for quick lookup
  const filteredSchools = schools.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
                        s.district.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
                        s.province.toLowerCase().includes(schoolSearchQuery.toLowerCase());
    const matchProvince = selectedProvince === 'all' || s.province === selectedProvince;
    return matchSearch && matchProvince;
  });

  const provinces = Array.from(new Set(schools.map((s) => s.province)));

  return (
    <div className="space-y-16 pb-16">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#210B3B] via-[#32145C] to-[#5B2A86] text-white py-16 sm:py-24">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D6B15E_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#D6B15E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#D6B15E]/40 text-[#FFE082] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#D6B15E]" />
                <span>โครงการความร่วมมือระดับสากล บช.ตชด. ประเทศไทย</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                สร้างภูมิคุ้มกัน <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE082] via-[#D6B15E] to-[#FAF5E6]">
                  สร้างอนาคตที่ปลอดภัย
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-purple-100/90 max-w-2xl font-light leading-relaxed">
                โครงการครู D.A.R.E. กองบัญชาการตำรวจตระเวนชายแดน มุ่งส่งเสริมความรู้ ทักษะชีวิต 
                และการป้องกันปัญหายาเสพติดในสถานศึกษา สร้างเยาวชนที่มีสติและกล้าปฏิเสธสิ่งผิดกฎหมาย
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('about')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D6B15E] to-[#BF9636] hover:from-[#c49f48] hover:to-[#a78028] text-[#211A2B] shadow-lg shadow-black/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <BookOpen className="w-4 h-4 text-[#32145C]" />
                  <span>รู้จักโครงการ D.A.R.E.</span>
                </button>
                <button
                  onClick={() => onNavigate('activities')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span>ดูกิจกรรมทั้งหมด</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Safe Public Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-purple-200">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D6B15E]" />
                  <span>หลักสูตรมาตรฐานสากล 10 บทเรียน</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D6B15E]" />
                  <span>ครู ตชด. ผ่านการรับรองวิทยากร</span>
                </div>
              </div>
            </div>

            {/* Right Card / Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl p-1 bg-gradient-to-b from-[#D6B15E]/50 via-purple-500/20 to-transparent shadow-2xl">
                <div className="bg-[#260E43]/90 rounded-2xl p-6 backdrop-blur-md border border-white/10 space-y-6">
                  <div className="flex items-center justify-between border-b border-purple-800/60 pb-4">
                    <div className="flex items-center gap-3">
                      <BppLogo className="h-10" />
                      <div>
                        <div className="text-xs font-bold text-white">กองบัญชาการตำรวจตระเวนชายแดน</div>
                        <div className="text-[10px] text-purple-300">Border Patrol Police Thailand</div>
                      </div>
                    </div>
                    <DareLogo className="h-8" />
                  </div>

                  {/* Highlights Visual Box */}
                  <div className="relative h-48 rounded-xl overflow-hidden group">
                    <img
                      src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80"
                      alt="D.A.R.E. School Activities"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#210B3B] via-[#210B3B]/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#D6B15E] text-[#211A2B] uppercase">
                        การเรียนการสอนจริง
                      </span>
                      <p className="text-xs font-semibold mt-1 truncate">
                        การปลูกฝังทักษะการตัดสินใจใน รร.ตชด. แนวชายแดน
                      </p>
                    </div>
                  </div>

                  {/* Quick stats mini ribbon */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-xl font-bold text-[#FFE082]">{totalParticipatingSchools}</div>
                      <div className="text-[11px] text-purple-200">โรงเรียนในเครือข่าย</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-xl font-bold text-white">{totalRecordedActivities}</div>
                      <div className="text-[11px] text-purple-200">กิจกรรมที่บันทึกแล้ว</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PUBLIC STATISTICS SECTION (Clearly labeled sample data) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E7E0EF]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E7E0EF]">
            <div>
              <h2 className="text-xl font-bold text-[#32145C] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#D6B15E]" />
                <span>สถิติการดำเนินงานโครงการ D.A.R.E.</span>
              </h2>
              <p className="text-xs text-[#756B80] mt-0.5">
                ผลการขับเคลื่อนการป้องกันยาเสพติดในกลุ่มเด็กนักเรียนชายแดน
              </p>
            </div>
            {/* Demo Notice Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>ข้อมูลตัวอย่างสำหรับการสาธิตระบบ</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 rounded-xl bg-[#F7F5FB] border border-[#E7E0EF] text-center sm:text-left">
              <div className="text-xs font-medium text-[#756B80]">โรงเรียนที่เข้าร่วมโครงการ</div>
              <div className="text-3xl font-extrabold text-[#32145C] mt-2">{totalParticipatingSchools}</div>
              <div className="text-[11px] text-[#168A62] mt-1 font-medium">ครอบคลุม 4 กองบังคับการ</div>
            </div>

            <div className="p-5 rounded-xl bg-[#F7F5FB] border border-[#E7E0EF] text-center sm:text-left">
              <div className="text-xs font-medium text-[#756B80]">กิจกรรมที่เผยแพร่</div>
              <div className="text-3xl font-extrabold text-[#5B2A86] mt-2">{totalRecordedActivities}</div>
              <div className="text-[11px] text-[#756B80] mt-1">บทเรียนมาตรฐาน & กิจกรรมพิเศษ</div>
            </div>

            <div className="p-5 rounded-xl bg-[#F7F5FB] border border-[#E7E0EF] text-center sm:text-left">
              <div className="text-xs font-medium text-[#756B80]">จำนวนนักเรียนที่เข้าร่วม</div>
              <div className="text-3xl font-extrabold text-[#168A62] mt-2">{totalStudentsReached.toLocaleString()}</div>
              <div className="text-[11px] text-[#756B80] mt-1">เยาวชนได้รับภูมิคุ้มกันความรู้</div>
            </div>

            <div className="p-5 rounded-xl bg-[#F7F5FB] border border-[#E7E0EF] text-center sm:text-left">
              <div className="text-xs font-medium text-[#756B80]">กองกำกับการ ตชด. ที่ร่วมโครงการ</div>
              <div className="text-3xl font-extrabold text-[#D99720] mt-2">{totalUnits}</div>
              <div className="text-[11px] text-[#756B80] mt-1">หน่วยปฏิบัติการในพื้นที่</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROGRAM INTRODUCTION (4 Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">Core Pillars</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#32145C]">
            แนวคิดและบทบาทสำคัญของโครงการ D.A.R.E.
          </h2>
          <p className="text-sm text-[#756B80]">
            การศึกษาเพื่อต่อต้านการใช้ยาเสพติดในเด็กนักเรียน มุ่งเน้นสร้างเกราะคุ้มกันและทักษะที่ใช้ได้จริง
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E7E0EF] hover:border-[#7C3AED] transition-all hover:shadow-md space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#5B2A86] flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#211A2B]">เกี่ยวกับโครงการ D.A.R.E.</h3>
              <p className="text-xs text-[#756B80] leading-relaxed">
                หลักสูตรสากลริเริ่มขึ้นเพื่อต่อต้านสารเสพติด โดยนำตำรวจผู้ผ่านการอบรมเข้าไปสอนในห้องเรียนโดยตรง เน้นความสัมพันธ์ที่ดีระหว่างตำรวจ ชุมชน และนักเรียน
              </p>
            </div>
            <button
              onClick={() => onNavigate('about')}
              className="text-xs font-semibold text-[#5B2A86] flex items-center gap-1 hover:text-[#32145C] pt-2"
            >
              <span>อ่านเพิ่มเติม</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E7E0EF] hover:border-[#7C3AED] transition-all hover:shadow-md space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#211A2B]">บทบาทของครู D.A.R.E.</h3>
              <p className="text-xs text-[#756B80] leading-relaxed">
                เจ้าหน้าที่ตำรวจตระเวนชายแดนทำหน้าที่เป็น "ครูมิตรภาพ" ร่วมให้ความรู้ เป็นที่ปรึกษา และสร้างแรงบันดาลใจให้เยาวชนเห็นคุณค่าในตัวเอง
              </p>
            </div>
            <button
              onClick={() => onNavigate('about')}
              className="text-xs font-semibold text-[#5B2A86] flex items-center gap-1 hover:text-[#32145C] pt-2"
            >
              <span>อ่านเพิ่มเติม</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E7E0EF] hover:border-[#7C3AED] transition-all hover:shadow-md space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#211A2B]">การสร้างทักษะชีวิต</h3>
              <p className="text-xs text-[#756B80] leading-relaxed">
                ฝึกฝนรูปแบบการตัดสินใจแบบ D.A.R.E. (Define, Assess, Respond, Evaluate) และ 5 ทักษะการปฏิเสธคำชักชวนของเพื่อนอย่างสุภาพแต่มั่นคง
              </p>
            </div>
            <button
              onClick={() => onNavigate('knowledge')}
              className="text-xs font-semibold text-[#5B2A86] flex items-center gap-1 hover:text-[#32145C] pt-2"
            >
              <span>เรียนรู้ทักษะ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E7E0EF] hover:border-[#7C3AED] transition-all hover:shadow-md space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#168A62] flex items-center justify-center">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#211A2B]">การป้องกันในสถานศึกษา</h3>
              <p className="text-xs text-[#756B80] leading-relaxed">
                การสร้างเครือข่ายสถานศึกษาสีขาวในพื้นที่ชายแดน การทำงานร่วมกับผู้นำท้องถิ่น ผู้ปกครอง และครูใหญ่เพื่อตรวจตรารั้วโรงเรียนให้ปลอดภัย
              </p>
            </div>
            <button
              onClick={() => onNavigate('schools')}
              className="text-xs font-semibold text-[#5B2A86] flex items-center gap-1 hover:text-[#32145C] pt-2"
            >
              <span>สำรวจโรงเรียน</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. NEWS AND ACTIVITIES (Responsive Card Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">Updates & News</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#32145C]">ข่าวสารและกิจกรรมล่าสุด</h2>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'news', label: 'ข่าวสาร' },
              { id: 'activity', label: 'กิจกรรม' },
              { id: 'knowledge', label: 'วิชาการ' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setNewsFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  newsFilter === f.id
                    ? 'bg-[#5B2A86] text-white shadow-xs'
                    : 'bg-white text-[#756B80] hover:bg-gray-100 border border-[#E7E0EF]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredNews.map((item) => (
            <article
              key={item.id}
              onClick={() => onSelectNews(item.id)}
              className="bg-white rounded-xl overflow-hidden shadow-xs border border-[#E7E0EF] hover:shadow-md transition-all cursor-pointer flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden bg-purple-900/10">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold bg-[#32145C]/80 text-[#FFE082] backdrop-blur-xs">
                  {item.category === 'news' ? 'ข่าวประชาสัมพันธ์' : item.category === 'activity' ? 'กิจกรรมในโรงเรียน' : 'คลังความรู้'}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-[#756B80]">
                    <Calendar className="w-3.5 h-3.5 text-[#5B2A86]" />
                    <span>{item.publishedAt}</span>
                    <span>•</span>
                    <span>{item.author}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#211A2B] group-hover:text-[#5B2A86] line-clamp-2 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#756B80] line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E7E0EF] flex items-center justify-between text-xs font-semibold text-[#5B2A86]">
                  <span>อ่านต่อ</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. KNOWLEDGE CENTER HIGHLIGHT (Decision Making & Refusal Skills) */}
      <section className="bg-gradient-to-r from-[#F2ECFA] to-[#F7F5FB] py-12 border-y border-[#E7E0EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#5B2A86]">D.A.R.E. Academy</div>
              <h2 className="text-2xl font-bold text-[#32145C]">คลังความรู้และทักษะชีวิต (Life Skills)</h2>
              <p className="text-xs text-[#756B80]">
                บทเรียนและแนวทางปฏิบัติสำหรับนักเรียน คุณครู และผู้ปกครอง
              </p>
            </div>
            <button
              onClick={() => onNavigate('knowledge')}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#5B2A86] text-white hover:bg-[#441D66] transition-colors self-start sm:self-auto"
            >
              เข้าสู่คลังความรู้ทั้งหมด
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Decision Model */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E7E0EF] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-[#5B2A86] flex items-center justify-center font-bold">
                  D
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#211A2B]">รูปแบบการตัดสินใจแบบ D.A.R.E.</h3>
                  <p className="text-xs text-[#756B80]">หลักคิด 4 ขั้นตอนเมื่อต้องเผชิญสถานการณ์กดดัน</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-[#F7F5FB] border border-[#E7E0EF]">
                  <span className="font-extrabold text-[#5B2A86] block">D - Define</span>
                  <span className="text-[10px] text-[#756B80]">ระบุปัญหา</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F7F5FB] border border-[#E7E0EF]">
                  <span className="font-extrabold text-[#5B2A86] block">A - Assess</span>
                  <span className="text-[10px] text-[#756B80]">ประเมินทางเลือก</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F7F5FB] border border-[#E7E0EF]">
                  <span className="font-extrabold text-[#5B2A86] block">R - Respond</span>
                  <span className="text-[10px] text-[#756B80]">ลงมือเลือกทำ</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F7F5FB] border border-[#E7E0EF]">
                  <span className="font-extrabold text-[#5B2A86] block">E - Evaluate</span>
                  <span className="text-[10px] text-[#756B80]">ประเมินผลลัพธ์</span>
                </div>
              </div>
            </div>

            {/* Box 2: Refusal Skills */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E7E0EF] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#168A62] flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#211A2B]">5 วิธีการปฏิเสธอย่างปลอดภัย</h3>
                  <p className="text-xs text-[#756B80]">เทคนิคปฏิเสธสิ่งผิดกฎหมายโดยไม่สูญเสียมิตรภาพ</p>
                </div>
              </div>
              <ul className="text-xs space-y-1.5 text-[#4A3B69]">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-100 text-[#5B2A86] text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>พูดคำว่า "ไม่" อย่างสุภาพ หนักแน่น สบตาผู้ชักชวน</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-100 text-[#5B2A86] text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>ให้เหตุผลสั้นๆ เช่น "หมอบอกว่าฉันแพ้ควัน" หรือ "ต้องไปซ้อมกีฬา"</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-100 text-[#5B2A86] text-[10px] flex items-center justify-center font-bold">3</span>
                  <span>ชวนเปลี่ยนไปทำกิจกรรมสร้างสรรค์อื่นทดแทน</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PARTICIPATING SCHOOLS QUICK LOOKUP (Public Search) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">School Directory</div>
            <h2 className="text-2xl font-bold text-[#32145C]">ค้นหาโรงเรียนในโครงการ D.A.R.E.</h2>
            <p className="text-xs text-[#756B80]">
              ตรวจสอบโรงเรียนที่ได้รับการสนับสนุนหลักสูตรและครูผู้สอน ตชด.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="text-xs bg-white border border-[#E7E0EF] rounded-lg px-3 py-2 text-[#211A2B] focus:outline-hidden focus:ring-2 focus:ring-[#7C3AED]"
            >
              <option value="all">ทุกจังหวัด</option>
              {provinces.map((prov) => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#756B80]" />
          <input
            type="text"
            value={schoolSearchQuery}
            onChange={(e) => setSchoolSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อโรงเรียน หรืออำเภอ เช่น ปิล๊อกคี่, เวียงแหง, สระแก้ว..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#E7E0EF] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#7C3AED]"
          />
        </div>

        {/* Results grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchools.slice(0, 6).map((sch) => (
            <div
              key={sch.id}
              className="bg-white p-4 rounded-xl border border-[#E7E0EF] shadow-2xs hover:border-[#5B2A86] transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-[#5B2A86] border border-purple-100">
                  {sch.type === 'bpp_school' ? 'รร.ตชด.' : 'สพฐ. ร่วมโครงการ'}
                </span>
                <span className="text-[10px] text-[#756B80]">
                  รหัส {sch.code}
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#211A2B] line-clamp-1">{sch.name}</h4>
              <div className="text-[11px] text-[#756B80] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#5B2A86]" />
                <span>อ.{sch.district} จ.{sch.province}</span>
              </div>
              <div className="pt-2 border-t border-[#E7E0EF] flex items-center justify-between text-[11px]">
                <span className="text-[#168A62] font-medium">
                  {sch.assignedPersonnelIds.length > 0 ? '✓ มีครู ตชด. รับผิดชอบ' : 'รอการจัดสรร'}
                </span>
                <span className="text-[#756B80]">นักเรียน {sch.totalStudents} คน</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. ADMIN PORTAL INVITATION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#32145C] to-[#5B2A86] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-[#FFE082] uppercase tracking-wider">
              บช.ตชด. COMMAND CENTER
            </span>
            <h3 className="text-xl sm:text-2xl font-bold">
              สำหรับผู้บังคับบัญชา และครูผู้สอน D.A.R.E.
            </h3>
            <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
              เข้าสู่ระบบศูนย์บัญชาการเพื่อมอบหมายครูผู้สอน จัดการกิจกรรมการเรียนการสอน บันทึกผลการปฏิบัติงาน และส่งออกรายงานสู่ Google Sheets
            </p>
          </div>
          <button
            onClick={onGoToAdmin}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-[#D6B15E] text-[#211A2B] hover:bg-[#c49f48] shadow-md transition-all whitespace-nowrap"
          >
            เข้าสู่ระบบศูนย์บัญชาการ (Admin)
          </button>
        </div>
      </section>
    </div>
  );
};

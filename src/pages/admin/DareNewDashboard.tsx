import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  User,
  Users,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Clock,
  MapPin,
  Play,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  Eye,
  X
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

interface DareNewDashboardProps {
  onNavigateHub: (hubId: string) => void;
}

export const DareNewDashboard: React.FC<DareNewDashboardProps> = ({ onNavigateHub }) => {
  const { 
    schools, 
    personnel, 
    activities, 
    news,
    exportActivitiesToGoogleSheets
  } = useApp();

  const totalStudentsReached = activities.reduce((sum, activity) => sum + (activity.studentCount || 0), 0);
  const yearlyStudentStats = Object.entries(activities.reduce<Record<string, number>>((totals, activity) => {
    const year = activity.fiscalYear || 'ไม่ระบุ';
    totals[year] = (totals[year] || 0) + (activity.studentCount || 0);
    return totals;
  }, {})).filter(([year]) => year !== 'ไม่ระบุ').sort(([a], [b]) => a.localeCompare(b, 'th')).slice(-5);
  const maxYearlyStudents = Math.max(1, ...yearlyStudentStats.map(([, count]) => count));

  // Carousel slide state for featured activities
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Google Sheets Export State
  const [showSheetsConfirm, setShowSheetsConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<{ url?: string; message: string } | null>(null);

  // Media Modal Detail
  const [selectedMedia, setSelectedMedia] = useState<{ title: string; views: string; category: string; desc: string } | null>(null);

  // Featured Carousel items
  const featuredSlides = [
    {
      id: 'slide-1',
      title: 'กิจกรรม D.A.R.E. สัญจร โรงเรียนตำรวจตระเวนชายแดน',
      date: '12 ต.ค. 2569',
      location: 'จ.เชียงราย',
      imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
      badge: 'NEW',
      description: 'โครงการสัญจรอบรมทักษะชีวิต ปลูกฝังการปฏิเสธยาเสพติดให้กับนักเรียนบนดอยสูงในพื้นที่รับผิดชอบของ กก.ตชด.32'
    },
    {
      id: 'slide-2',
      title: 'ค่ายเยาวชนพิทักษ์ชายแดนปลอดภัย D.A.R.E. Camp',
      date: '15 ต.ค. 2569',
      location: 'จ.อุบลราชธานี',
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
      badge: 'POPULAR',
      description: 'ฝึกอบรมทักษะการเป็นผู้นำเยาวชน การตระหนักรู้เกี่ยวกับโทษของสารเสพติด และทักษะการตัดสินใจแบบ D.D.M.M.'
    },
    {
      id: 'slide-3',
      title: 'พิธีมอบประกาศนียบัตรนักเรียนสำเร็จหลักสูตร D.A.R.E. 10 สัปดาห์',
      date: '18 ต.ค. 2569',
      location: 'จ.กาญจนบุรี',
      imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
      badge: 'GRADUATION',
      description: 'นักเรียนชั้น ป.5 สำเร็จการศึกษาตามหลักสูตรมาตรฐานสากล พร้อมปฏิญาณตนไม่ยุ่งเกี่ยวกับยาเสพติด'
    }
  ];

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % featuredSlides.length);
  };
  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + featuredSlides.length) % featuredSlides.length);
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
          message: 'ส่งออกข้อมูลแดชบอร์ด D.A.R.E. สู่ Google Sheets เรียบร้อยแล้ว'
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

  return (
    <div className="dare-dashboard mx-auto w-full min-w-0 space-y-6 pb-10 font-sans text-[#211936]">
      {/* Google Sheets Export Alert Banner if exported */}
      {exportNotice && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center justify-between shadow-xs">
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

      {/* 1. HERO BANNER — use the exact user-provided D.A.R.E. classroom artwork */}
      <section className="relative isolate min-h-[350px] overflow-hidden rounded-[28px] border border-white bg-[#eaf4ff] shadow-[0_18px_50px_rgba(37,14,66,0.14)] sm:min-h-[380px] xl:min-h-[400px]">
        <img
          src="/dare-classroom-hero.svg"
          alt="ครูช้าง D.A.R.E. กำลังสอนนักเรียนในห้องเรียน"
          className="absolute inset-0 h-full w-full object-cover object-[68%_center] sm:object-[68%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F8F5FC]/94 via-[#F8F5FC]/64 to-[#F8F5FC]/6" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#250E42]/20 via-transparent to-transparent" />
        
        
        
        <div className="relative z-10 flex min-h-[350px] items-center px-5 py-10 sm:min-h-[380px] sm:px-10 xl:min-h-[400px] xl:px-12">
          <div className="max-w-[92%] sm:max-w-[58%] lg:max-w-[55%]">
            <h1 className="max-w-3xl text-3xl font-black leading-[1.12] tracking-tight text-[#250E42] [text-shadow:0_1px_0_rgba(255,255,255,0.9)] sm:text-4xl xl:text-[42px]">
              สร้างภูมิคุ้มกันให้เด็กไทย
            </h1>
            <div className="mt-2 inline-block">
              <span className="text-3xl font-black leading-tight tracking-tight text-[#6D28D9] [text-shadow:0_1px_0_rgba(255,255,255,0.8)] sm:text-4xl xl:text-[43px]">ห่างไกลยาเสพติด</span>
              <div className="mt-3 h-[5px] max-w-[320px] rounded-full bg-gradient-to-r from-[#6D28D9] via-[#8B5CF6] to-[#D6B15E]" />
            </div>
            <p className="mt-4 max-w-xl text-sm font-bold leading-6 text-[#14265D] [text-shadow:0_1px_2px_rgba(255,255,255,0.9)] sm:text-base">
              “รู้คิด รู้เท่าทัน เลือกสิ่งที่ดี เพื่ออนาคตที่สดใสของเยาวชนไทย”
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => onNavigateHub('hub-overview')} className="inline-flex items-center gap-2 rounded-xl bg-[#32145C] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-950/20 transition hover:-translate-y-0.5 hover:bg-[#4E2174] hover:shadow-xl">
                ดูข้อมูลโครงการ <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => onNavigateHub('hub-operations')} className="inline-flex items-center gap-2 rounded-xl border border-[#D8CDE7] bg-white/95 px-5 py-3 text-sm font-bold text-[#32145C] shadow-sm transition hover:-translate-y-0.5 hover:bg-white">
                <BookOpen className="h-4 w-4" /> สื่อการเรียนรู้
              </button>
              <button
                type="button"
                onClick={() => setShowSheetsConfirm(true)}
                disabled={isExporting}
                title="ส่งออก Google Sheets"
                aria-label="ส่งออก Google Sheets"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/90 bg-white/85 text-[#5B2A86] shadow-sm transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
              >
                <FileSpreadsheet className="h-4 w-4" />
              </button>
            </div>
          </div>
          
        </div>
      </section>

      {/* 2. TOP 4 METRIC CARDS (Exact match to Mockup) */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: โรงเรียนที่เข้าร่วมโครงการ */}
        <div 
          onClick={() => onNavigateHub('hub-registry')}
          className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#EAE5F2] bg-white p-4 shadow-[0_8px_26px_rgba(37,14,66,0.06)] transition-all hover:border-purple-300 hover:shadow-lg group"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#8B5CF6] text-white shadow-xs sm:h-[72px] sm:w-[72px]">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">โรงเรียนที่เข้าร่วมโครงการ</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#172F81] sm:text-[28px]">{schools.length.toLocaleString()}</span>
              </div>
              <div className="text-[11px] text-[#94A3B8] font-normal">แห่ง ทั่วประเทศ</div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-gray-50 group-hover:bg-purple-100 group-hover:text-[#7C3AED] flex items-center justify-center text-gray-400 transition-colors shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: ครู D.A.R.E. */}
        <div 
          onClick={() => onNavigateHub('hub-registry')}
          className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#EAE5F2] bg-white p-4 shadow-[0_8px_26px_rgba(37,14,66,0.06)] transition-all hover:border-rose-300 hover:shadow-md group"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#EF4444] text-white shadow-xs sm:h-[72px] sm:w-[72px]">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">ครู D.A.R.E.</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#172F81] sm:text-[28px]">{personnel.length.toLocaleString()}</span>
              </div>
              <div className="text-[11px] text-[#94A3B8] font-normal">นาย / นาง / คน</div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-gray-50 group-hover:bg-rose-100 group-hover:text-[#EF4444] flex items-center justify-center text-gray-400 transition-colors shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: นักเรียนที่ได้รับความรู้ */}
        <div 
          onClick={() => onNavigateHub('hub-operations')}
          className="flex cursor-pointer items-center justify-between rounded-[20px] border border-[#E7E0EF] bg-white p-3 shadow-2xs transition-all hover:border-blue-300 hover:shadow-md group"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#3B82F6] text-white shadow-xs sm:h-[72px] sm:w-[72px]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">นักเรียนที่ได้รับความรู้</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#172F81] sm:text-[28px]">{totalStudentsReached.toLocaleString()}</span>
              </div>
              <div className="text-[11px] text-[#94A3B8] font-normal">คน</div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-gray-50 group-hover:bg-blue-100 group-hover:text-[#3B82F6] flex items-center justify-center text-gray-400 transition-colors shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: สื่อการเรียนรู้ */}
        <div 
          onClick={() => onNavigateHub('hub-operations')}
          className="flex cursor-pointer items-center justify-between rounded-[20px] border border-[#E7E0EF] bg-white p-3 shadow-2xs transition-all hover:border-amber-300 hover:shadow-md group"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F59E0B] text-white shadow-xs sm:h-[72px] sm:w-[72px]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">สื่อการเรียนรู้</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#172F81] sm:text-[28px]">{news.length.toLocaleString()}</span>
              </div>
              <div className="text-[11px] text-[#94A3B8] font-normal">รายการข่าวและสื่อ</div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-gray-50 group-hover:bg-amber-100 group-hover:text-[#F59E0B] flex items-center justify-center text-gray-400 transition-colors shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* 3. MIDDLE SECTION: กิจกรรมล่าสุด (Left) & สื่อการเรียนรู้ยอดนิยม (Right) */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Left Column: กิจกรรมล่าสุด (8 cols) */}
        <div className="rounded-2xl border border-[#EAE5F2] bg-white p-5 shadow-[0_10px_30px_rgba(37,14,66,0.05)] sm:p-4 xl:col-span-8 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E7E0EF] pb-3">
            <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
              <span className="text-amber-500">⭐️</span>
              <span>กิจกรรมล่าสุด</span>
            </h2>
            <button 
              onClick={() => onNavigateHub('hub-operations')}
              className="text-xs font-semibold text-[#7C3AED] hover:underline flex items-center gap-1"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Featured Activity Carousel (7 cols) */}
            <div className="relative group flex min-h-[220px] flex-col justify-end overflow-hidden rounded-xl bg-slate-800 lg:col-span-7">
              <img
                src={featuredSlides[carouselIndex].imageUrl}
                alt={featuredSlides[carouselIndex].title}
                className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080d25]/95 via-[#080d25]/35 to-transparent" />

              {/* Tag Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#EF4444] text-white uppercase tracking-wider shadow-sm">
                  {featuredSlides[carouselIndex].badge}
                </span>
              </div>

              {/* Prev / Next Buttons */}
              <button
                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20"
                title="ก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20"
                title="ถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Content overlay */}
              <div className="relative z-10 p-4 text-white space-y-1">
                <h3 className="text-xs sm:text-sm font-bold line-clamp-1 leading-snug">
                  {featuredSlides[carouselIndex].title}
                </h3>
                <div className="flex items-center gap-3 text-[11px] text-gray-300">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{featuredSlides[carouselIndex].date}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{featuredSlides[carouselIndex].location}</span>
                  </span>
                </div>

                {/* Carousel indicator dots */}
                <div className="flex items-center justify-center gap-1.5 pt-2">
                  {featuredSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCarouselIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === carouselIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* List of 3 Activity items (5 cols) */}
            <div className="flex flex-col gap-2.5 lg:col-span-5">
              {[
                {
                  id: 'item-1',
                  title: 'ครู D.A.R.E. จัดกิจกรรม "คิดดี เลือกได้ ชีวิตสดใส"',
                  date: '10 ต.ค. 2569',
                  location: 'จ.ขอนแก่น',
                  img: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80'
                },
                {
                  id: 'item-2',
                  title: 'อบรมครู D.A.R.E. รุ่นที่ 3/2569 เสริมศักยภาพการสอน',
                  date: '8 ต.ค. 2569',
                  location: 'กรุงเทพฯ',
                  img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=200&q=80'
                },
                {
                  id: 'item-3',
                  title: 'มอบสื่อการเรียนรู้ให้โรงเรียนในพื้นที่ชายแดน',
                  date: '5 ต.ค. 2569',
                  location: 'จ.ตาก',
                  img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=200&q=80'
                }
              ].map((act) => (
                <div
                  key={act.id}
                  onClick={() => onNavigateHub('hub-operations')}
                  className="group flex min-h-[68px] items-center gap-3 rounded-xl border border-[#EAECF5] p-2 text-left transition hover:border-purple-200 hover:bg-purple-50/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={act.img} alt={act.title} className="h-12 w-12 shrink-0 rounded-lg object-cover sm:h-14 sm:w-14" />
                    <div className="min-w-0">
                      <div className="line-clamp-2 block text-xs font-bold leading-snug text-[#172554] transition group-hover:text-purple-700 sm:text-sm">
                        {act.title}
                      </div>
                      <div className="text-[10px] text-[#64748B] flex items-center gap-2 mt-0.5">
                        <span>{act.date}</span>
                        <span>·</span>
                        <span>{act.location}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#7C3AED] shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: สื่อการเรียนรู้ยอดนิยม (4 cols) */}
        <div className="space-y-3 rounded-[22px] border border-white bg-white p-4 shadow-[0_9px_30px_rgba(40,55,105,0.07)] sm:p-4 xl:col-span-4">
          <div className="flex items-center justify-between border-b border-[#E7E0EF] pb-3">
            <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
              <span className="text-[#8B5CF6]">📢</span>
              <span>สื่อการเรียนรู้ยอดนิยม</span>
            </h2>
            <button 
              onClick={() => onNavigateHub('hub-governance')}
              className="text-xs font-semibold text-[#7C3AED] hover:underline flex items-center gap-1"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Media 1: รู้จักยาเสพติด */}
            <div 
              onClick={() => setSelectedMedia({
                title: 'รู้จักยาเสพติดและโทษภัย',
                views: '12.4K',
                category: 'บทเรียนที่ 1',
                desc: 'วิดีโอแอนิเมชันสำหรับเด็กนักเรียน อธิบายประเภทของสารเสพติดและผลกระทบต่อร่างกายอย่างเข้าใจง่าย'
              })}
              className="rounded-2xl border border-purple-100 overflow-hidden bg-gradient-to-b from-[#8B5CF6] to-[#6D28D9] text-white p-2.5 flex flex-col justify-between cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all relative group"
            >
              <div>
                <div className="text-[11px] font-black text-center truncate">รู้จักยาเสพติด</div>
                <div className="h-20 flex items-center justify-center">
                  <span className="text-3xl select-none group-hover:scale-110 transition-transform">👦👧</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/20">
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3" />
                  <span>12.4K</span>
                </span>
                <Play className="w-3 h-3 fill-white" />
              </div>
            </div>

            {/* Media 2: ทักษะการปฏิเสธ (บอก NO) */}
            <div 
              onClick={() => setSelectedMedia({
                title: 'ทักษะการปฏิเสธอย่างมั่นใจ (Say NO)',
                views: '9.8K',
                category: 'บทเรียนที่ 5',
                desc: 'แบบฝึกหัดสถานการณ์จำลอง 5 รูปแบบการปฏิเสธคำชักชวนของเพื่อนอย่างสุภาพแต่มั่นคง'
              })}
              className="rounded-2xl border border-rose-100 overflow-hidden bg-gradient-to-b from-[#EF4444] to-[#B91C1C] text-white p-2.5 flex flex-col justify-between cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all relative group"
            >
              <div>
                <div className="text-[11px] font-black text-center truncate">ทักษะการปฏิเสธ</div>
                <div className="text-[9px] text-center font-bold text-rose-200">(บอก NO)</div>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-3xl select-none group-hover:scale-110 transition-transform">✋🚫</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/20">
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3" />
                  <span>9.8K</span>
                </span>
                <Play className="w-3 h-3 fill-white" />
              </div>
            </div>

            {/* Media 3: เพื่อนดี มีได้เยอะ */}
            <div 
              onClick={() => setSelectedMedia({
                title: 'เพื่อนดี มีได้เยอะ: การสร้างมิตรภาพสร้างสรรค์',
                views: '8.6K',
                category: 'บทเรียนที่ 8',
                desc: 'การเลือกคบเพื่อน การจัดการความกดดันจากกลุ่มเพื่อน และการสร้างพลังบวกในกลุ่มวัยรุ่น'
              })}
              className="rounded-2xl border border-blue-100 overflow-hidden bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] text-white p-2.5 flex flex-col justify-between cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all relative group"
            >
              <div>
                <div className="text-[11px] font-black text-center truncate">เพื่อนดี</div>
                <div className="text-[9px] text-center font-bold text-blue-200">มีได้เยอะ</div>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-3xl select-none group-hover:scale-110 transition-transform">🤝✨</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/20">
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3" />
                  <span>8.6K</span>
                </span>
                <Play className="w-3 h-3 fill-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BOTTOM ANALYTICS & CALENDAR STRIP (3 Boxes) */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Box 1: แผนที่โรงเรียนที่เข้าร่วม (4 cols) */}
        <div className="rounded-[22px] border border-white bg-white p-4 shadow-[0_9px_30px_rgba(40,55,105,0.07)] sm:p-4 xl:col-span-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#E7E0EF] pb-3">
              <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                <span className="text-[#8B5CF6]">🗺️</span>
                <span>แผนที่โรงเรียนที่เข้าร่วม</span>
              </h3>
              <button 
                onClick={() => onNavigateHub('hub-registry')}
                className="text-xs font-semibold text-[#7C3AED] hover:underline flex items-center gap-1"
              >
                <span>ดูแผนที่ทั้งหมด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-12 items-center gap-2 pt-2">
              {/* Thailand map stylized graphic (5 cols) */}
              <div className="col-span-4 flex justify-center">
                <svg viewBox="0 0 100 160" className="h-auto w-full max-w-[105px] drop-shadow-sm">
                  {/* Thailand Map Silhouette */}
                  <path
                    d="M 40 10 C 55 12, 70 20, 65 35 C 75 40, 85 50, 75 65 C 65 75, 55 70, 50 85 C 45 95, 42 120, 40 145 C 38 155, 34 158, 32 150 C 30 135, 36 100, 32 80 C 25 70, 20 50, 25 35 C 30 20, 35 15, 40 10 Z"
                    fill="#C7D2FE"
                    stroke="#818CF8"
                    strokeWidth="1.5"
                  />
                  {/* Regional pinpoint markers */}
                  <circle cx="48" cy="28" r="4" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="68" cy="48" r="4" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="45" cy="65" r="4" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="36" cy="125" r="4" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="58" cy="72" r="3.5" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="32" cy="55" r="3.5" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Regional breakdown table (7 cols) */}
              <div className="col-span-8 space-y-2">
                {[
                  { region: 'ภาคเหนือ', count: '620' },
                  { region: 'ภาคตะวันออกเฉียงเหนือ', count: '980' },
                  { region: 'ภาคกลาง', count: '730' },
                  { region: 'ภาคใต้', count: '420' },
                  { region: 'ภาคตะวันออก', count: '310' },
                  { region: 'ภาคตะวันตก', count: '190' },
                ].map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 border-b border-slate-50 pb-1.5 text-[10px] sm:text-xs">
                    <span className="font-medium truncate">{r.region}</span>
                    <span className="font-bold text-[#1E293B] tabular-nums whitespace-nowrap">{r.count} โรงเรียน</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Box 2: สถิตินักเรียนรายปี (4 cols) */}
        <div className="flex flex-col justify-between space-y-3 rounded-2xl border border-[#EAE5F2] bg-white p-5 shadow-[0_10px_30px_rgba(37,14,66,0.05)] sm:p-4 xl:col-span-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#E7E0EF] pb-3">
              <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                <span className="text-[#8B5CF6]">📊</span>
                <span>สถิตินักเรียนรายปี</span>
              </h3>
              <button 
                onClick={() => onNavigateHub('hub-governance')}
                className="text-xs font-semibold text-[#7C3AED] hover:underline flex items-center gap-1"
              >
                <span>ดูรายละเอียด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Peak Count Badge */}
            <div className="text-right pt-2">
              <span className="text-sm font-black text-[#1E293B] tabular-nums">{totalStudentsReached.toLocaleString()}</span>
              <span className="text-[10px] text-gray-500 block">ยอดนักเรียนจากกิจกรรมที่บันทึก</span>
            </div>

            {/* Bar Chart */}
            <div className="flex h-[152px] items-end justify-between gap-2 border-b border-slate-200 px-2 pt-2">
              {yearlyStudentStats.length > 0 ? yearlyStudentStats.map(([year, count], idx) => (
                <div key={year} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 transition group-hover:opacity-100">
                    {count.toLocaleString()}
                  </span>
                  <div
                    style={{ height: `${Math.max(8, (count / maxYearlyStudents) * 100)}%` }}
                    className={`w-full max-w-[48px] rounded-t-xl transition-all ${idx === yearlyStudentStats.length - 1 ? 'bg-gradient-to-t from-[#6D28D9] to-[#8B5CF6]' : 'bg-gradient-to-t from-[#9698FA] to-[#7367F0]'}`}
                    title={`${year}: ${count.toLocaleString()} คน`}
                  />
                  <span className="pb-2 text-[10px] font-semibold text-slate-500 sm:text-xs">{year}</span>
                </div>
              )) : <div className="w-full flex items-center justify-center text-xs text-[#94A3B8]">ยังไม่มีข้อมูลกิจกรรมสำหรับสถิติรายปี</div>}
            </div>
          </div>
        </div>

        {/* Box 3: ปฏิทินกิจกรรม (4 cols) */}
        <div className="rounded-2xl border border-[#EAE5F2] bg-white p-5 shadow-[0_10px_30px_rgba(37,14,66,0.05)] sm:p-4 xl:col-span-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#E7E0EF] pb-3">
              <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                <span className="text-[#EF4444]">📅</span>
                <span>ปฏิทินกิจกรรม</span>
              </h3>
              <button 
                onClick={() => onNavigateHub('hub-operations')}
                className="text-xs font-semibold text-[#7C3AED] hover:underline flex items-center gap-1"
              >
                <span>ดูทั้งหมด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 pt-1 sm:space-y-3.5">
              {[
                {
                  day: '17',
                  month: 'ต.ค.',
                  title: 'อบรมครู D.A.R.E. รุ่นที่ 4/2569',
                  location: 'กรุงเทพมหานคร'
                },
                {
                  day: '21',
                  month: 'ต.ค.',
                  title: 'กิจกรรม D.A.R.E. ในโรงเรียน',
                  location: 'จ.นครราชสีมา'
                },
                {
                  day: '29',
                  month: 'ต.ค.',
                  title: 'ประชุมผู้ประสานงานโครงการ',
                  location: 'รูปแบบออนไลน์'
                }
              ].map((ev, idx) => (
                <div 
                  key={idx}
                  onClick={() => onNavigateHub('hub-operations')}
                  className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {/* Date badge */}
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-purple-100 bg-purple-50">
                    <span className="text-base font-black leading-none text-purple-700">{ev.day}</span>
                    <span className="mt-1 text-[9px] font-medium text-slate-500">{ev.month}</span>
                  </div>
                  <div>
                    <div className="block text-xs font-bold leading-snug text-[#172554] sm:text-sm">
                      • {ev.title}
                    </div>
                    <div className="mt-1 block text-[10px] text-slate-400 sm:text-xs">
                      {ev.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wide">
                {selectedMedia.category}
              </span>
              <button onClick={() => setSelectedMedia(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#1E293B]">{selectedMedia.title}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">{selectedMedia.desc}</p>
              <div className="pt-2 flex items-center gap-2 text-xs text-[#16A34A] font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>ยอดรับชมสะสม {selectedMedia.views} ครั้งในสถานศึกษา</span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedMedia(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                ปิด
              </button>
              <button
                onClick={() => {
                  setSelectedMedia(null);
                  onNavigateHub('hub-operations');
                }}
                className="px-5 py-2 rounded-xl bg-[#6D28D9] text-white text-xs font-bold shadow-xs hover:bg-[#5B21B6]"
              >
                เปิดสื่อการสอนเต็มรูปแบบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets Modal */}
      <ConfirmationModal
        isOpen={showSheetsConfirm}
        title="ส่งออกรายงานสถิติ D.A.R.E. สู่ Google Sheets"
        description="ระบบจะสร้างเอกสาร Google Spreadsheet ใหม่ใน Google Drive ของท่าน พร้อมส่งออกสถิติ 3,250 โรงเรียน, 5,840 ครู ตชด. และ 412,600 นักเรียนอย่างครบถ้วน"
        type="sheets"
        confirmLabel="ส่งออกข้อมูลทันที"
        cancelLabel="ยกเลิก"
        onConfirm={handleExportSheets}
        onCancel={() => setShowSheetsConfirm(false)}
      />
    </div>
  );
};

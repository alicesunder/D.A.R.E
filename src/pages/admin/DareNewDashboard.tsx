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
  Calendar, 
  FileSpreadsheet, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Shield,
  Eye,
  X
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { DareElephantMascot } from '../../components/ui/MascotArt';

interface DareNewDashboardProps {
  onNavigateHub: (hubId: string) => void;
}

export const DareNewDashboard: React.FC<DareNewDashboardProps> = ({ onNavigateHub }) => {
  const { 
    schools, 
    personnel, 
    activities, 
    exportActivitiesToGoogleSheets,
    exportSchoolsToGoogleSheets,
    exportRosterToGoogleSheets
  } = useApp();

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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
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

      {/* 1. HERO BANNER: 3D D.A.R.E. Cartoon Mascot & Thai Students Scene */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#DCEBFE] via-[#E8F2FE] to-[#F1F6FF] border border-blue-100 shadow-sm p-6 sm:p-10">
        {/* Subtle decorative doodles in background */}
        <div className="absolute top-4 left-6 text-2xl select-none opacity-40">✨</div>
        <div className="absolute top-12 left-1/3 text-xl select-none opacity-40">✈️</div>
        <div className="absolute bottom-6 left-1/4 text-2xl select-none opacity-30">⭐️</div>
        <div className="absolute top-6 right-1/3 text-xl select-none opacity-30">💡</div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Text & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-4 text-center sm:text-left">
            {/* Main Headline with 3D Pop Typography */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl font-black text-[#1E1B4B] tracking-tight leading-tight">
                สร้างภูมิคุ้มกันให้เด็กไทย
              </h1>
              <div className="inline-block relative">
                <span className="text-3xl sm:text-5xl font-black text-[#E11D48] tracking-tight leading-tight drop-shadow-sm">
                  ห่างไกลยาเสพติด
                </span>
                {/* Underline brush effect */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#E11D48] to-[#FB7185] rounded-full mt-0.5 opacity-80" />
              </div>
            </div>

            {/* Subtitle Quote */}
            <p className="text-sm sm:text-base text-[#475569] font-medium leading-relaxed max-w-xl">
              “รู้คิด รู้เท่าทัน เลือกสิ่งที่ดี เพื่ออนาคตที่สดใสของเยาวชนไทย”
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 pt-2">
              <button
                onClick={() => onNavigateHub('hub-overview')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#f43f5e] hover:to-[#e11d48] text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-900/20 flex items-center gap-2 transition-transform hover:-translate-y-0.5"
              >
                <span>ดูข้อมูลโครงการ</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateHub('hub-operations')}
                className="px-5 py-3 rounded-2xl bg-white/80 hover:bg-white text-[#32145C] border border-purple-200 text-xs sm:text-sm font-bold shadow-xs flex items-center gap-2 transition-all hover:border-purple-300"
              >
                <span>สื่อการเรียนรู้</span>
                <span className="text-base">📖</span>
              </button>

              <button
                onClick={() => setShowSheetsConfirm(true)}
                disabled={isExporting}
                className="px-4 py-3 rounded-2xl bg-[#32145C] hover:bg-[#250E42] text-[#FFE082] text-xs font-bold shadow-xs flex items-center gap-2 transition-colors ml-auto sm:ml-0"
                title="ส่งออก Google Sheets"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#D6B15E]" />
                <span className="hidden sm:inline">{isExporting ? 'กำลังซิงค์...' : 'ส่งออก Sheets'}</span>
              </button>
            </div>
          </div>

          {/* Right 3D Visual Mascot & Students Composition (5 cols) */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            {/* Thought speech bubble "คิดดี เลือกได้ ชีวิตสดใส" */}
            <div className="absolute -top-6 right-2 sm:right-6 bg-white/95 rounded-2xl p-2.5 sm:p-3 shadow-md border border-purple-100 flex items-center gap-2 z-20">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">
                💡
              </div>
              <div className="text-[11px] sm:text-xs font-black text-[#32145C] whitespace-nowrap">
                คิดดี เลือกได้ <br />
                <span className="text-[#E11D48]">ชีวิตสดใส</span>
              </div>
            </div>

            {/* Main Mascot Card with 3D Illustration */}
            <div className="relative rounded-3xl p-3 bg-white/70 backdrop-blur-md border border-white shadow-xl flex items-center justify-center">
              <div className="flex flex-col items-center">
                <DareElephantMascot size={150} />
                <div className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E1B4B] text-white text-[10px] font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                  <span>ครูช้าง ตชด. D.A.R.E.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TOP 4 METRIC CARDS (Exact match to Mockup) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: โรงเรียนที่เข้าร่วมโครงการ */}
        <div 
          onClick={() => onNavigateHub('hub-registry')}
          className="bg-white rounded-2xl p-5 border border-[#E7E0EF] shadow-2xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-[#8B5CF6] text-white flex items-center justify-center shadow-xs shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">โรงเรียนที่เข้าร่วมโครงการ</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#1E293B]">3,250</span>
                <span className="text-[11px] font-bold text-[#16A34A] bg-emerald-50 px-1.5 py-0.5 rounded">↑ +12%</span>
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
          className="bg-white rounded-2xl p-5 border border-[#E7E0EF] shadow-2xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-[#EF4444] text-white flex items-center justify-center shadow-xs shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">ครู D.A.R.E.</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#1E293B]">5,840</span>
                <span className="text-[11px] font-bold text-[#16A34A] bg-emerald-50 px-1.5 py-0.5 rounded">↑ +8%</span>
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
          className="bg-white rounded-2xl p-5 border border-[#E7E0EF] shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-[#3B82F6] text-white flex items-center justify-center shadow-xs shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">นักเรียนที่ได้รับความรู้</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#1E293B]">412,600</span>
                <span className="text-[11px] font-bold text-[#16A34A] bg-emerald-50 px-1.5 py-0.5 rounded">↑ +15%</span>
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
          className="bg-white rounded-2xl p-5 border border-[#E7E0EF] shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-[#F59E0B] text-white flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">สื่อการเรียนรู้</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#1E293B]">235</span>
                <span className="text-[11px] font-bold text-[#16A34A] bg-emerald-50 px-1.5 py-0.5 rounded">↑ +20%</span>
              </div>
              <div className="text-[11px] text-[#94A3B8] font-normal">รายการ</div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-gray-50 group-hover:bg-amber-100 group-hover:text-[#F59E0B] flex items-center justify-center text-gray-400 transition-colors shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* 3. MIDDLE SECTION: กิจกรรมล่าสุด (Left) & สื่อการเรียนรู้ยอดนิยม (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: กิจกรรมล่าสุด (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#E7E0EF] shadow-sm space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* Featured Activity Carousel (7 cols) */}
            <div className="md:col-span-7 rounded-2xl overflow-hidden border border-gray-100 relative group flex flex-col justify-end bg-gray-900 min-h-[220px]">
              <img
                src={featuredSlides[carouselIndex].imageUrl}
                alt={featuredSlides[carouselIndex].title}
                className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

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
            <div className="md:col-span-5 flex flex-col justify-between space-y-2">
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
                  className="p-2.5 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={act.img} alt={act.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1E293B] group-hover:text-[#7C3AED] truncate transition-colors">
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
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E7E0EF] shadow-sm space-y-4">
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
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Box 1: แผนที่โรงเรียนที่เข้าร่วม (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E7E0EF] shadow-sm space-y-4 flex flex-col justify-between">
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

            <div className="grid grid-cols-12 gap-3 items-center pt-3">
              {/* Thailand map stylized graphic (5 cols) */}
              <div className="col-span-5 relative flex justify-center">
                <svg viewBox="0 0 100 160" className="w-24 h-auto drop-shadow-sm">
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
              <div className="col-span-7 space-y-1.5 text-xs">
                {[
                  { region: 'ภาคเหนือ', count: '620' },
                  { region: 'ภาคตะวันออกเฉียงเหนือ', count: '980' },
                  { region: 'ภาคกลาง', count: '730' },
                  { region: 'ภาคใต้', count: '420' },
                  { region: 'ภาคตะวันออก', count: '310' },
                  { region: 'ภาคตะวันตก', count: '190' },
                ].map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] text-[#475569] border-b border-gray-50 pb-1">
                    <span className="font-medium truncate">{r.region}</span>
                    <span className="font-bold text-[#1E293B] tabular-nums whitespace-nowrap">{r.count} โรงเรียน</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Box 2: สถิตินักเรียนรายปี (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E7E0EF] shadow-sm space-y-4 flex flex-col justify-between">
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
              <span className="text-sm font-black text-[#1E293B] tabular-nums">412,600</span>
              <span className="text-[10px] text-gray-500 block">ยอดสะสมปี 2569</span>
            </div>

            {/* Bar Chart */}
            <div className="pt-4 flex items-end justify-between gap-2 h-36">
              {[
                { year: '2565', count: '120,500', heightPct: 30 },
                { year: '2566', count: '245,300', heightPct: 50 },
                { year: '2567', count: '318,400', heightPct: 70 },
                { year: '2568', count: '389,200', heightPct: 85 },
                { year: '2569', count: '412,600', heightPct: 100 },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[9px] text-gray-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                    {item.count}
                  </span>
                  <div 
                    style={{ height: `${item.heightPct}%` }}
                    className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                      item.year === '2569' 
                        ? 'bg-[#6D28D9] shadow-sm shadow-purple-900/20' 
                        : 'bg-[#A78BFA] group-hover:bg-[#8B5CF6]'
                    }`}
                  />
                  <span className="text-[10px] font-bold text-[#64748B] mt-1">{item.year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Box 3: ปฏิทินกิจกรรม (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E7E0EF] shadow-sm space-y-4 flex flex-col justify-between">
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

            <div className="space-y-3.5 pt-3">
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
                  <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex flex-col items-center justify-center text-center shrink-0">
                    <span className="text-sm font-black text-[#6D28D9] leading-none">{ev.day}</span>
                    <span className="text-[9px] text-[#64748B] font-medium mt-0.5">{ev.month}</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1E293B] hover:text-[#7C3AED] transition-colors">
                      • {ev.title}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] ml-2 mt-0.5">
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

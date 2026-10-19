import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  BarChart3,
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
  X,
  Activity,
  ShieldCheck,
  Search,
  Medal,
  Sparkles,
  CalendarDays,
  Trophy
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { CountUp } from '../../components/ui/CountUp';
import { DashboardIntro } from '../../components/ui/DashboardIntro';
import { TeacherFace } from '../../components/ui/TeacherAvatar';
import { buildMonthlyRanking, displayName, monthKeyOf, realStatsFromActivities, thaiMonthLabel } from '../../services/rankingService';

const TEACHER_STATUS_UNITS: { name: string; count: number }[] = [{"name": "บก.ตชด.ภาค 1", "count": 2}, {"name": "กก.ตชด.11", "count": 16}, {"name": "กก.ตชด.12", "count": 10}, {"name": "กก.ตชด.13", "count": 11}, {"name": "กก.ตชด.14", "count": 11}, {"name": "บก.ตชด.ภาค 2", "count": 3}, {"name": "กก.ตชด.21", "count": 14}, {"name": "กก.ตชด.22", "count": 11}, {"name": "กก.ตชด.23", "count": 11}, {"name": "กก.ตชด.24", "count": 15}, {"name": "บก.ตชด.ภาค 3", "count": 4}, {"name": "กก.ตชด.31", "count": 8}, {"name": "กก.ตชด.32", "count": 14}, {"name": "กก.ตชด.33", "count": 19}, {"name": "กก.ตชด.34", "count": 17}, {"name": "บก.ตชด.ภาค 4", "count": 2}, {"name": "กก.ตชด.41", "count": 14}, {"name": "กก.ตชด.42", "count": 15}, {"name": "กก.ตชด.43", "count": 12}, {"name": "กก.ตชด.44", "count": 12}, {"name": "บก.สอ.บช.ตชด.", "count": 1}, {"name": "กก.1 บก.กฝ.บช.ตชด.", "count": 3}, {"name": "กก.2 บก.กฝ.บช.ตชด.", "count": 1}, {"name": "กก.3 บก.กฝ.บช.ตชด.", "count": 2}, {"name": "กก.4 บก.กฝ.บช.ตชด.", "count": 4}, {"name": "กก.5 บก.กฝ.บช.ตชด.", "count": 2}, {"name": "กก.6 บก.กฝ.บช.ตชด.", "count": 2}, {"name": "กก.7 บก.กฝ.บช.ตชด.", "count": 3}, {"name": "กก.8 บก.กฝ.บช.ตชด.", "count": 6}, {"name": "กก.9 บก.กฝ.บช.ตชด.", "count": 2}, {"name": "ฝอ.1 บก.อก.บช.ตชด.", "count": 1}, {"name": "ฝอ.5 บก.อก.บช.ตชด.", "count": 1}, {"name": "ฝสสน.5 บก.สสน.บช.ตชด.", "count": 1}];
const TEACHER_STATUS_LEVELS = [
  { label: 'ระดับทอง / เข็มทอง', count: 162, color: '#8B5CF6' },
  { label: 'ระดับเงิน / เข็มเงิน', count: 18, color: '#64748B' },
  { label: 'ระดับทองแดง / เข็มทองแดง', count: 13, color: '#C17A45' },
  { label: 'ระดับต้น / เริ่มต้น', count: 51, color: '#0EA5E9' },
  { label: 'อื่น ๆ / รอตรวจสอบ', count: 6, color: '#F59E0B' },
];

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

  // ── Phase 25: ครูดีเด่นประจำเดือน + ศูนย์บัญชาการอัจฉริยะ ──
  const nowMonth = monthKeyOf(new Date());
  const hasRealMonth = useMemo(() => Object.keys(realStatsFromActivities(personnel, activities, nowMonth)).length > 0, [personnel, activities, nowMonth]);
  const monthlyRanking = useMemo(() => buildMonthlyRanking(personnel, nowMonth, { demo: !hasRealMonth, activities }), [personnel, activities, nowMonth, hasRealMonth]);
  const topTeacher = monthlyRanking[0];
  const topFive = monthlyRanking.slice(0, 5);
  const thaiYear = new Date().getFullYear() + 543;
  const insights = useMemo(() => {
    const unassignedTeachers = personnel.filter(p => p.status === 'active' && (p.assignedSchoolCount || 0) === 0).length;
    const retiring = personnel.filter(p => p.retirementYear && p.retirementYear > 2500 && p.retirementYear >= thaiYear && p.retirementYear <= thaiYear + 2).length;
    const pendingReports = activities.filter(a => a.status === 'submitted' || a.status === 'pending_approval').length;
    const schoolsNoTeacher = schools.filter(sc => sc.assignmentStatus !== 'assigned').length;
    return [
      { c: '#F59E0B', ico: '🧑‍🏫', n: unassignedTeachers, lbl: 'ครูที่ยังไม่มีโรงเรียนรับผิดชอบ', sub: 'จัดมอบหมายเพื่อใช้กำลังครูให้เต็มที่', go: 'hub-assignment' },
      { c: '#EF4444', ico: '🏫', n: schoolsNoTeacher, lbl: 'โรงเรียนที่ยังไม่มีครูประจำ', sub: 'ตามสถานะการมอบหมายในทะเบียน', go: 'schools' },
      { c: '#8B5CF6', ico: '📝', n: pendingReports, lbl: 'รายงานรอตรวจ / รออนุมัติ', sub: 'ตรวจเร็ว ครูได้รับ XP เร็ว', go: 'report-review' },
      { c: '#0EA5E9', ico: '🎖️', n: retiring, lbl: 'ครูที่จะเกษียณใน 2 ปี', sub: 'วางแผนอบรมครูรุ่นใหม่ทดแทน', go: 'hub-registry' },
    ];
  }, [personnel, activities, schools, thaiYear]);

  // scroll-reveal + hero parallax
  const rootRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const els = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('.rv') ?? []);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.06, rootMargin: '0px 0px -4% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
  const onHeroMove = (e: React.MouseEvent<HTMLElement>) => {
    const img = heroImgRef.current; if (!img) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * -16; const y = ((e.clientY - r.top) / r.height - 0.5) * -10;
    img.style.transform = `scale(1.07) translate(${x}px, ${y}px)`;
  };
  const onHeroLeave = () => { if (heroImgRef.current) heroImgRef.current.style.transform = 'scale(1.07)'; };

  // Carousel slide state for featured activities
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [teacherUnitFilter, setTeacherUnitFilter] = useState('ทั้งหมด');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [showAllTeacherUnits, setShowAllTeacherUnits] = useState(false);

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
      imageUrl: '/dare-classroom-hero.webp',
      badge: 'NEW',
      description: 'โครงการสัญจรอบรมทักษะชีวิต ปลูกฝังการปฏิเสธยาเสพติดให้กับนักเรียนบนดอยสูงในพื้นที่รับผิดชอบของ กก.ตชด.32'
    },
    {
      id: 'slide-2',
      title: 'ค่ายเยาวชนพิทักษ์ชายแดนปลอดภัย D.A.R.E. Camp',
      date: '15 ต.ค. 2569',
      location: 'จ.อุบลราชธานี',
      imageUrl: '/images/dare-elephant-mascot.png',
      badge: 'POPULAR',
      description: 'ฝึกอบรมทักษะการเป็นผู้นำเยาวชน การตระหนักรู้เกี่ยวกับโทษของสารเสพติด และทักษะการตัดสินใจแบบ D.D.M.M.'
    },
    {
      id: 'slide-3',
      title: 'พิธีมอบประกาศนียบัตรนักเรียนสำเร็จหลักสูตร D.A.R.E. 10 สัปดาห์',
      date: '18 ต.ค. 2569',
      location: 'จ.กาญจนบุรี',
      imageUrl: '/images/media-friendship.webp',
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
    <div ref={rootRef} className="dare-dashboard mx-auto w-full max-w-[1720px] min-w-0 space-y-5 px-4 pb-10 pt-[88px] font-sans text-[#211936] sm:space-y-6 sm:px-5 sm:pt-5 2xl:px-7">
      <style>{`
        @keyframes dare-float-in { from { opacity: 0; transform: translateY(14px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes dare-bar-grow { from { width: 0; } }
        @keyframes dare-glow { 0%,100% { box-shadow: 0 18px 50px rgba(37,14,66,.14); } 50% { box-shadow: 0 22px 58px rgba(124,58,237,.22); } }
        .dare-hero { animation: dare-float-in .65s ease-out both, dare-glow 8s ease-in-out 1s infinite; }
        .dare-stat-card { animation: dare-float-in .55s ease-out both; }
        .dare-stat-card:nth-child(2) { animation-delay: 70ms; }
        .dare-stat-card:nth-child(3) { animation-delay: 140ms; }
        .dare-stat-card:nth-child(4) { animation-delay: 210ms; }
        .dare-reveal { animation: dare-float-in .65s ease-out both; }
        .dare-level-row { animation: dare-float-in .5s ease-out both; }
        .dare-level-bar { animation: dare-bar-grow .9s cubic-bezier(.2,.8,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .dare-hero, .dare-stat-card, .dare-reveal, .dare-level-row, .dare-level-bar { animation: none !important; transition: none !important; } }
      `}</style>
      <DashboardIntro teachers={personnel.length} schools={schools.length} students={totalStudentsReached} />
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
      <section onMouseMove={onHeroMove} onMouseLeave={onHeroLeave} className="dare-hero relative isolate min-h-[360px] overflow-hidden rounded-[28px] border border-white/80 bg-[#eaf4ff] shadow-[0_18px_50px_rgba(37,14,66,0.12)] sm:min-h-[390px] xl:min-h-[410px]">
        <img
          ref={heroImgRef}
          style={{ transform: 'scale(1.07)' }}
          src="/dare-classroom-hero.webp"
          alt="ครูช้าง D.A.R.E. กำลังสอนนักเรียนในห้องเรียน"
          className="dare-hero-img absolute inset-0 h-full w-full object-cover object-[66%_center] sm:object-[66%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F8F5FC]/92 via-[#F8F5FC]/60 to-[#F8F5FC]/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#250E42]/28 via-transparent to-transparent" />
        
        
        
        <div className="relative z-10 flex min-h-[360px] items-center px-5 py-9 sm:min-h-[390px] sm:px-10 xl:min-h-[410px] xl:px-12">
          <div className="max-w-[94%] sm:max-w-[54%] lg:max-w-[51%]">
            <h1 className="max-w-3xl text-3xl font-black leading-[1.12] tracking-tight text-[#250E42] [text-shadow:0_1px_0_rgba(255,255,255,0.9)] sm:text-[46px] xl:text-[54px]">
              สร้างภูมิคุ้มกันให้เด็กไทย
            </h1>
            <div className="mt-2 inline-block">
              <span className="text-3xl font-black leading-tight tracking-tight text-[#6D28D9] [text-shadow:0_1px_0_rgba(255,255,255,0.8)] sm:text-[46px] xl:text-[54px]">ห่างไกลยาเสพติด</span>
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
              <button onClick={() => onNavigateHub('leaderboard')} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFB020] to-[#EC4899] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/25 transition hover:-translate-y-0.5">
                <Trophy className="h-4 w-4" /> อันดับครูแดร์
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
          className="dare-stat-card flex cursor-pointer items-center justify-between rounded-2xl border border-[#EAE5F2] bg-white p-4 shadow-[0_8px_26px_rgba(37,14,66,0.05)] transition-all hover:border-purple-300 hover:shadow-lg group"
        >
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-[#A855F7] via-[#7C3AED] to-[#5B21B6] text-white shadow-[0_8px_18px_rgba(124,58,237,.25)] sm:h-[72px] sm:w-[72px]">
              <Building2 className="w-8 h-8 stroke-[1.8] drop-shadow-sm" />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">โรงเรียนที่เข้าร่วมโครงการ</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#172F81] sm:text-[28px]"><CountUp value={schools.length} /></span>
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
          className="dare-stat-card flex cursor-pointer items-center justify-between rounded-2xl border border-[#EAE5F2] bg-white p-4 shadow-[0_8px_26px_rgba(37,14,66,0.05)] transition-all hover:border-rose-300 hover:shadow-md group"
        >
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-[#FB7185] via-[#EF4444] to-[#BE123C] text-white shadow-[0_8px_18px_rgba(239,68,68,.22)] sm:h-[72px] sm:w-[72px]">
              <div className="flex flex-col items-center"><User className="w-7 h-7 stroke-[2.2]" /><span className="mt-[-3px] text-[8px] font-black tracking-wide">D.A.R.E.</span></div>
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">ครู D.A.R.E.</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#172F81] sm:text-[28px]"><CountUp value={personnel.length} /></span>
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
          className="dare-stat-card flex cursor-pointer items-center justify-between rounded-[20px] border border-[#E7E0EF] bg-white p-3 shadow-2xs transition-all hover:border-blue-300 hover:shadow-md group"
        >
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-[#60A5FA] via-[#3B82F6] to-[#1D4ED8] text-white shadow-[0_8px_18px_rgba(59,130,246,.24)] sm:h-[72px] sm:w-[72px]">
              <Users className="w-8 h-8 stroke-[1.8] drop-shadow-sm" />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">นักเรียนที่ได้รับความรู้</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#172F81] sm:text-[28px]"><CountUp value={totalStudentsReached} /></span>
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
          className="dare-stat-card flex cursor-pointer items-center justify-between rounded-[20px] border border-[#E7E0EF] bg-white p-3 shadow-2xs transition-all hover:border-amber-300 hover:shadow-md group"
        >
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-[#FBBF24] via-[#F59E0B] to-[#D97706] text-white shadow-[0_8px_18px_rgba(245,158,11,.25)] sm:h-[72px] sm:w-[72px]">
              <BookOpen className="w-8 h-8 stroke-[1.8] drop-shadow-sm" />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">ข่าวและสื่อ</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#172F81] sm:text-[28px]"><CountUp value={news.length} /></span>
              </div>
              <div className="text-[11px] text-[#94A3B8] font-normal">รายการข่าวและสื่อ</div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-gray-50 group-hover:bg-amber-100 group-hover:text-[#F59E0B] flex items-center justify-center text-gray-400 transition-colors shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* Phase 25A: ศูนย์บัญชาการอัจฉริยะ — คำนวณจากทะเบียนจริงในระบบ */}
      <section className="rv" aria-label="ศูนย์บัญชาการอัจฉริยะ">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-base font-black text-[#21115E]">🧭 ศูนย์บัญชาการอัจฉริยะ</h2>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">คำนวณจากทะเบียนจริง</span>
        </div>
        <div className="ins-grid">
          {insights.map((it, i) => (
            <button key={it.lbl} className="ins" style={{ ['--c' as any]: it.c, ['--i' as any]: i }} onClick={() => onNavigateHub(it.go)}>
              <span className="ins-ico">{it.ico}</span>
              <span className="ins-num"><CountUp value={it.n} /></span>
              <span className="ins-lbl">{it.lbl}</span>
              <span className="ins-sub">{it.sub}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Phase 25B: ครูแดร์ดีเด่นประจำเดือน */}
      {topTeacher && (
        <section className="rv sp-card" aria-label="ครูแดร์ดีเด่นประจำเดือน">
          <div className="grid gap-4 lg:grid-cols-12 lg:items-center">
            <div className="flex items-center gap-4 lg:col-span-7">
              <div className="relative shrink-0">
                <span className="lb-crown" style={{ left: '50%', marginLeft: '-1rem' }} aria-hidden="true">👑</span>
                <div className="lb-av" style={{ width: '6.2rem', height: '6.2rem', borderWidth: 5, boxShadow: '0 0 0 4px #FFE27A,0 0 30px 6px rgba(255,214,102,.6)' }}><TeacherFace person={topTeacher.person} /></div>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-amber-200"><Trophy className="h-3.5 w-3.5" /> ครูแดร์ดีเด่นประจำเดือน{thaiMonthLabel(nowMonth)}{!hasRealMonth && <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] text-white">ตัวอย่างสาธิต</span>}</div>
                <div className="mt-0.5 text-lg font-black leading-snug sm:text-2xl">{displayName(topTeacher.person)}</div>
                <div className="truncate text-xs text-white/80">{topTeacher.person.organizationName}</div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-bold">
                  <span className="rounded-full bg-white/15 px-2.5 py-1">{topTeacher.level.current.emoji} {topTeacher.level.current.name}</span>
                  <span className="rounded-full bg-amber-300 px-2.5 py-1 text-[#5B3A00]"><CountUp value={topTeacher.xp} /> XP</span>
                  <span className="rounded-full bg-white/15 px-2.5 py-1">🎓 {topTeacher.raw.sessions} ครั้ง</span>
                  <span className="rounded-full bg-white/15 px-2.5 py-1">🧒 {topTeacher.raw.taught.toLocaleString()} คน</span>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 lg:col-span-5">
              {topFive.slice(1).map((t, i) => (
                <div key={t.person.id} className="sp-mini">
                  <span className="text-center text-sm font-black text-amber-200">{i + 2}</span>
                  <div className="lb-av" style={{ width: '2.2rem', height: '2.2rem', borderWidth: 2 }}><TeacherFace person={t.person} /></div>
                  <div className="min-w-0"><div className="truncate text-xs font-bold">{displayName(t.person)}</div><div className="truncate text-[10px] text-white/70">{t.person.organizationName}</div></div>
                  <div className="text-right text-xs font-black text-amber-200">{t.xp.toLocaleString()}<span className="ml-0.5 text-[9px] font-semibold text-white/70">XP</span></div>
                </div>
              ))}
              <button onClick={() => onNavigateHub('leaderboard')} className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black text-[#5B21B6] shadow-[0_4px_0_rgba(0,0,0,.25)]">
                ดูอันดับครูแดร์ทั้งหมด <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Phase 8: transparent data provenance — these dashboard entities currently come from AppContext/localStorage, not Firestore. */}
      <div className="flex flex-col gap-1 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-xs text-amber-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <span aria-hidden="true" className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700">i</span>
          <div>
            <p className="font-bold">แหล่งข้อมูลสถิติ: ข้อมูลในระบบเบราว์เซอร์</p>
            <p className="mt-0.5 leading-relaxed text-amber-800">ตัวเลขด้านบนคำนวณจาก AppContext และ LocalStorage ของเครื่องนี้ ยังไม่ได้เชื่อมกับฐานข้อมูลกลาง Firebase สำหรับโรงเรียน ครู กิจกรรม และข่าว</p>
          </div>
        </div>
        <span className="shrink-0 self-start rounded-full border border-amber-200 bg-white/80 px-2 py-1 font-semibold text-amber-800 sm:self-center">ยังไม่ใช่ข้อมูลกลาง</span>
      </div>

      {/* 4. MIDDLE SECTION: กิจกรรมล่าสุด & สื่อการเรียนรู้ยอดนิยม */}
      <section className="rv grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Left Column: กิจกรรมล่าสุด (8 cols) */}
        <div className="rounded-2xl border border-[#EAE5F2] bg-white p-5 shadow-[0_10px_30px_rgba(37,14,66,0.05)] sm:p-4 xl:col-span-8 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E7E0EF] pb-3">
            <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
              <span className="text-amber-500">⭐️</span>
              <span>กิจกรรมล่าสุด</span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">ตัวอย่าง UI</span>
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
                  img: '/images/dare-elephant-mascot.png'
                },
                {
                  id: 'item-2',
                  title: 'อบรมครู D.A.R.E. รุ่นที่ 3/2569 เสริมศักยภาพการสอน',
                  date: '8 ต.ค. 2569',
                  location: 'กรุงเทพฯ',
                  img: '/dare-classroom-hero.webp'
                },
                {
                  id: 'item-3',
                  title: 'มอบสื่อการเรียนรู้ให้โรงเรียนในพื้นที่ชายแดน',
                  date: '5 ต.ค. 2569',
                  location: 'จ.ตาก',
                  img: '/images/media-drug-awareness.webp'
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
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 ring-1 ring-violet-200">ตัวอย่างยอดรับชม</span>
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
              className="relative aspect-[3/5] min-h-[190px] overflow-hidden rounded-2xl border border-purple-100 bg-[#6D28D9] text-white p-0 flex flex-col justify-end cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group"
            >
              <img
                src="/images/media-drug-awareness.webp"
                alt="รู้จักยาเสพติด เรียนรู้ร่วมกัน"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#13072b]/75 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between text-[10px] border-t border-white/25 bg-black/20 px-2 py-2 backdrop-blur-[2px]">
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
              className="relative aspect-[3/5] min-h-[190px] overflow-hidden rounded-2xl border border-rose-100 bg-[#B91C1C] text-white p-0 flex flex-col justify-end cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group"
            >
              <img
                src="/images/media-refusal.webp"
                alt="ทักษะการปฏิเสธ บอก NO"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#25070b]/75 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between text-[10px] border-t border-white/25 bg-black/20 px-2 py-2 backdrop-blur-[2px]">
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
              className="relative aspect-[3/5] min-h-[190px] overflow-hidden rounded-2xl border border-blue-100 bg-[#1D4ED8] text-white p-0 flex flex-col justify-end cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group"
            >
              <img
                src="/images/media-friendship.webp"
                alt="เพื่อนดี มีได้เยอะ"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07162e]/75 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between text-[10px] border-t border-white/25 bg-black/20 px-2 py-2 backdrop-blur-[2px]">
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
      <section className="rv grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Box 1: Regional school map — redesigned to match the premium Thailand map reference */}
        <div className="relative overflow-hidden rounded-[26px] border border-violet-100 bg-gradient-to-br from-[#F7F2FF] via-white to-[#F2F5FF] p-4 shadow-[0_12px_34px_rgba(83,54,160,.10)] sm:p-5 xl:col-span-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-violet-100/70 via-white/20 to-fuchsia-100/60" />
          <div className="relative flex items-center justify-between gap-3 border-b border-violet-100/80 pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-md shadow-violet-200">
                <MapPin className="h-6 w-6 stroke-[2.3]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black tracking-tight text-[#21115E] sm:text-lg">แผนที่โรงเรียนที่เข้าร่วม</h3>
                <p className="text-[11px] text-slate-500 sm:text-xs">จำนวนโรงเรียนที่เข้าร่วมโครงการ แยกตามภูมิภาค</p>
              </div>
            </div>
            <button onClick={() => onNavigateHub('hub-registry')} className="flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-[#6D28D9] px-3 py-2 text-[11px] font-bold text-white shadow-md shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-lg sm:px-4 sm:text-xs">
              ดูแผนที่ทั้งหมด <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="relative grid grid-cols-1 gap-4 pt-4 sm:grid-cols-[minmax(220px,1.12fr)_minmax(0,1fr)]">
            {/* Reference map asset: preserve the supplied artwork and scale it to the dashboard column */}
            <div className="group/map relative flex min-h-[360px] items-center justify-center overflow-visible rounded-2xl border border-violet-100/70 bg-gradient-to-b from-white/90 via-violet-50/50 to-indigo-50/60 px-2 py-3 sm:min-h-[420px] sm:px-3">
              <img
                src="/images/thailand-six-regions-map.png"
                alt="แผนที่ประเทศไทย 6 ภูมิภาค พร้อมป้ายชื่อภูมิภาค"
                loading="lazy"
                decoding="async"
                className="relative z-10 h-[390px] w-full max-w-[420px] origin-center object-contain drop-shadow-[0_10px_18px_rgba(91,33,182,.24)] transition-transform duration-300 ease-out group-hover/map:scale-[1.07] sm:h-[440px] sm:max-w-[460px] xl:h-[490px] xl:max-w-[500px]"
              />
              <div className="absolute bottom-2 left-2 rounded-full border border-violet-100 bg-white/90 px-2.5 py-1 text-[10px] font-bold text-violet-700 shadow-sm">ประเทศไทย · 6 ภูมิภาค</div>
            </div>
            <div className="space-y-2">
              {[
                { region: 'ภาคเหนือ', count: 620, color: '#7C3AED', bg: 'bg-violet-100', Icon: Sparkles },
                { region: 'ภาคตะวันออกเฉียงเหนือ', count: 980, color: '#DB2777', bg: 'bg-pink-100', Icon: Building2 },
                { region: 'ภาคกลาง', count: 730, color: '#D97706', bg: 'bg-amber-100', Icon: Medal },
                { region: 'ภาคใต้', count: 420, color: '#16A34A', bg: 'bg-green-100', Icon: MapPin },
                { region: 'ภาคตะวันออก', count: 310, color: '#0284C7', bg: 'bg-sky-100', Icon: Activity },
                { region: 'ภาคตะวันตก', count: 190, color: '#9333EA', bg: 'bg-purple-100', Icon: ShieldCheck },
              ].map((r) => {
                const percent = Math.round((r.count / 3250) * 100);
                return <div key={r.region} className="group rounded-xl border border-white/90 bg-white/90 p-2.5 shadow-[0_3px_12px_rgba(76,29,149,.045)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md sm:p-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${r.bg}`} style={{color:r.color}}><r.Icon className="h-4 w-4 stroke-[2.2]" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2"><span className="truncate text-[11px] font-bold text-[#21115E] sm:text-xs">{r.region}</span><span className="whitespace-nowrap text-sm font-black text-[#21115E] sm:text-base">{r.count.toLocaleString()} <span className="text-[10px] font-medium text-slate-500">โรงเรียน</span></span></div>
                      <div className="mt-1.5 flex items-center gap-2"><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="fun-bar-grow h-full rounded-full transition-all duration-500" style={{width:`${percent}%`,backgroundColor:r.color}} /></div><span className="w-8 text-right text-[10px] font-bold" style={{color:r.color}}>{percent}%</span></div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-violet-400 transition group-hover:translate-x-0.5" />
                  </div>
                </div>;
              })}
            </div>
          </div>
          <p className="relative mt-3 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-[10px] leading-relaxed text-amber-800">หมายเหตุ: จำนวนโรงเรียนแยกภูมิภาคในส่วนนี้เป็นข้อมูลตัวอย่างเพื่อแสดงรูปแบบหน้าจอ ไม่ใช่ยอดยืนยันจากทะเบียนกลาง</p>
        </div>

        {/* Box 2: สถิตินักเรียนรายปี — redesigned premium analytics card */}
        <div className="relative isolate overflow-hidden rounded-[26px] border border-violet-100 bg-gradient-to-br from-white via-[#FBF9FF] to-[#F1EBFF] p-5 shadow-[0_14px_38px_rgba(76,29,149,.10)] sm:p-5 xl:col-span-3">
          <div className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full bg-violet-200/35 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-fuchsia-200/30 blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3 border-b border-violet-100 pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-200"><BarChart3 className="h-5 w-5" /></div>
                <div><h3 className="text-sm font-black tracking-tight text-[#21115E] sm:text-base">สถิตินักเรียนรายปี</h3><p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">สรุปนักเรียนที่ได้รับความรู้จากกิจกรรม</p></div>
              </div>
              <button onClick={() => onNavigateHub('hub-governance')} className="flex shrink-0 items-center gap-1 rounded-full border border-violet-100 bg-white/80 px-2.5 py-1.5 text-[10px] font-bold text-violet-700 transition hover:border-violet-300 hover:bg-violet-50 sm:text-xs"><span>รายละเอียด</span><ChevronRight className="h-3.5 w-3.5" /></button>
            </div>

            <div className="mt-4 rounded-2xl bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#9333EA] p-4 text-white shadow-lg shadow-violet-200/70">
              <div className="flex items-end justify-between gap-3">
                <div><p className="text-[11px] font-medium text-violet-100">นักเรียนที่ได้รับความรู้ทั้งหมด</p><div className="mt-1 text-3xl font-black tracking-tight tabular-nums sm:text-4xl"><CountUp value={totalStudentsReached} /></div><p className="mt-1 text-[10px] text-violet-100/90">คน · จากกิจกรรมที่บันทึกไว้</p></div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15"><Users className="h-6 w-6" /></div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between"><div><p className="text-xs font-extrabold text-[#21115E]">แนวโน้มรายปี</p><p className="text-[10px] text-slate-500">จำนวนผู้เข้าร่วมแยกตามปี</p></div><span className="rounded-full border border-violet-100 bg-white/80 px-2.5 py-1 text-[10px] font-bold text-violet-700">{yearlyStudentStats.length} ปี</span></div>
            <div className="mt-3 rounded-2xl border border-violet-100/80 bg-white/85 px-3 pb-3 pt-4 shadow-inner shadow-violet-100/60">
              <div className="relative flex h-[178px] items-stretch justify-around gap-2 border-b border-slate-200/90 px-1 sm:gap-3">
                {yearlyStudentStats.length > 0 ? yearlyStudentStats.map(([year, count], idx) => (
                  <div key={year} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2 pb-2">
                    <div className="relative flex h-[138px] w-full max-w-[54px] items-end justify-center rounded-t-lg bg-violet-50/60">
                      <div style={{ height: `${Math.max(7, (count / maxYearlyStudents) * 100)}%`, animationDelay: `${idx * 90}ms` }} className={`fun-bar-rise w-[72%] rounded-t-xl transition-all duration-500 group-hover:scale-x-110 group-hover:brightness-110 ${idx === yearlyStudentStats.length - 1 ? 'bg-gradient-to-t from-violet-700 via-violet-600 to-fuchsia-400 shadow-md shadow-violet-200' : 'bg-gradient-to-t from-indigo-500 to-violet-300'}`} title={`${year}: ${count.toLocaleString()} คน`} />
                      <span className="absolute -top-2 whitespace-nowrap rounded-md bg-[#21115E] px-1.5 py-0.5 text-[9px] font-bold text-white opacity-0 shadow transition group-hover:-translate-y-1 group-hover:opacity-100">{count.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 sm:text-xs">{year}</span>
                  </div>
                )) : <div className="flex w-full items-center justify-center text-center text-xs text-slate-400">ยังไม่มีข้อมูลกิจกรรมสำหรับสถิติรายปี</div>}
              </div>
            </div>
            <p className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-slate-500"><span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-violet-500" />สถิตินี้คำนวณจากข้อมูลกิจกรรมที่บันทึกในระบบ ตัวเลขอาจเปลี่ยนตามข้อมูลที่ได้รับการปรับปรุง</p>
          </div>
        </div>

        {/* Box 3: ปฏิทินกิจกรรม (4 cols) */}
        <div className="relative overflow-hidden rounded-[26px] border border-violet-100 bg-gradient-to-br from-white via-[#FFFCFF] to-[#F5F0FF] p-5 shadow-[0_12px_34px_rgba(83,54,160,.09)] sm:p-5 xl:col-span-4">
          <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-fuchsia-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-violet-200/35 blur-3xl" />
          <div>
            <div className="relative flex items-center justify-between border-b border-violet-100 pb-3">
              <h3 className="flex items-center gap-3 text-sm font-black text-[#21115E]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-200"><CalendarDays className="h-5 w-5" /></span>
                <span><span className="block">ปฏิทินกิจกรรม</span><span className="mt-0.5 block text-[10px] font-medium text-slate-500">กิจกรรมที่กำลังจะมาถึง</span></span>
              </h3>
              <button 
                onClick={() => onNavigateHub('hub-operations')}
                className="text-xs font-semibold text-[#7C3AED] hover:underline flex items-center gap-1"
              >
                <span>ดูทั้งหมด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative space-y-2.5 pt-3 sm:space-y-3">
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
                  className="group flex items-start gap-3 rounded-2xl border border-white/90 bg-white/85 p-3 shadow-[0_3px_12px_rgba(76,29,149,.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-white hover:shadow-md cursor-pointer"
                >
                  {/* Date badge */}
                  <div className="flex h-[58px] w-[58px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50 to-fuchsia-50 shadow-sm transition-transform group-hover:scale-105">
                    <span className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 py-1 text-center text-[9px] font-bold text-white">{ev.month}</span>
                    <span className="mt-0.5 text-xl font-black leading-none text-violet-800">{ev.day}</span>
                  </div>
                  <div>
                    <div className="flex items-start gap-1.5 text-xs font-extrabold leading-snug text-[#172554] sm:text-sm">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-fuchsia-500" />{ev.title}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-500 sm:text-xs">
                      <MapPin className="h-3 w-3 shrink-0 text-violet-500" />{ev.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. TEACHER STATUS — summarized from uploaded workbook */}
      <section className="rv overflow-hidden rounded-[24px] border border-violet-100 bg-white shadow-[0_10px_30px_rgba(56,32,100,0.06)]">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#24134E] via-[#48217B] to-[#7550DB] px-5 py-4 text-white sm:px-7">
          <div className="pointer-events-none absolute -right-8 -top-14 h-48 w-48 rounded-full border-[22px] border-white/10" />
          <div className="pointer-events-none absolute right-24 -bottom-20 h-44 w-44 rounded-full bg-fuchsia-400/10 blur-2xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20"><ShieldCheck className="h-6 w-6 text-amber-200" /></div>
              <div>
                <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-black sm:text-xl">สถานภาพครูตำรวจ D.A.R.E.</h2><span className="rounded-full bg-emerald-300/15 px-2.5 py-1 text-[10px] font-bold text-emerald-100 ring-1 ring-emerald-200/25">ข้อมูลสรุป</span></div>
                <p className="mt-1 text-xs text-violet-100 sm:text-sm">อ้างอิงบัญชีสถานภาพครูตำรวจ D.A.R.E. ณ 30 ก.ย. 2569</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs"><span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/15"><Activity className="h-3.5 w-3.5 text-emerald-200" /> ครูในบัญชี 250 นาย</span><span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/15"><Building2 className="h-3.5 w-3.5 text-amber-200" /> 33 หน่วยในสรุป</span></div>
          </div>
        </div>
        <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-extrabold text-[#24134E]"><Medal className="h-4 w-4 text-violet-600" /> ภาพรวมระดับเข็ม</h3><span className="text-[10px] text-slate-400">สรุปจากบัญชีรายชื่อ</span></div>
            <div className="space-y-2.5">
              {TEACHER_STATUS_LEVELS.map((level, index) => <div key={level.label} className="dare-level-row" style={{ animationDelay: `${index * 70}ms` }}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="font-semibold text-slate-600">{level.label}</span><span className="font-black tabular-nums text-[#24134E]">{level.count} <span className="font-medium text-slate-400">นาย</span></span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="dare-level-bar h-full rounded-full" style={{ width: `${(level.count / 250) * 100}%`, background: level.color, animationDelay: `${index * 100}ms` }} /></div>
              </div>)}
            </div>
            <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-[10px] leading-relaxed text-amber-800"><Sparkles className="mr-1 inline h-3.5 w-3.5" /> ตัวเลขระดับเข็มเป็นการจัดกลุ่มเบื้องต้นจากข้อมูลต้นทาง ควรตรวจทานก่อนใช้เป็นรายงานทางการ</p>
          </div>
          <div className="xl:col-span-7">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#24134E]"><Users className="h-4 w-4 text-violet-600" /> จำนวนครูแยกตามหน่วย</h3>
              <div className="flex flex-wrap gap-2">
                <label className="relative block min-w-0 flex-1 sm:w-48 sm:flex-none"><Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" /><input value={teacherSearch} onChange={e => setTeacherSearch(e.target.value)} placeholder="ค้นหาหน่วย..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs outline-none transition focus:border-violet-400 focus:bg-white" /></label>
                <select value={teacherUnitFilter} onChange={e => setTeacherUnitFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 outline-none focus:border-violet-400"><option>ทั้งหมด</option><option>บก.ตชด.ภาค</option><option>กก.ตชด.</option><option>หน่วยอื่น</option></select>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {TEACHER_STATUS_UNITS.filter(unit => unit.name.toLowerCase().includes(teacherSearch.trim().toLowerCase())).filter(unit => teacherUnitFilter === 'ทั้งหมด' || (teacherUnitFilter === 'บก.ตชด.ภาค' ? unit.name.startsWith('บก.ตชด.ภาค') : teacherUnitFilter === 'กก.ตชด.' ? unit.name.startsWith('กก.ตชด.') : !unit.name.startsWith('บก.ตชด.ภาค') && !unit.name.startsWith('กก.ตชด.'))).sort((a,b) => b.count-a.count).slice(0, showAllTeacherUnits ? 33 : 8).map((unit,index) => <div key={unit.name} className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/70">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[10px] font-black text-violet-600 shadow-sm ring-1 ring-violet-100">{index+1}</div>
                <div className="min-w-0 flex-1"><div className="truncate text-[11px] font-bold text-slate-700">{unit.name}</div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="fun-bar-grow h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-all duration-700" style={{width:`${(unit.count/19)*100}%`}} /></div></div>
                <div className="text-sm font-black tabular-nums text-[#24134E]">{unit.count}<span className="ml-1 text-[9px] font-medium text-slate-400">นาย</span></div>
              </div>)}
            </div>
            <div className="mt-3 flex items-center justify-between gap-2"><span className="text-[10px] text-slate-400">รวมตามบัญชีสรุป 250 นาย</span><button onClick={() => setShowAllTeacherUnits(v => !v)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold text-violet-700 transition hover:bg-violet-50">{showAllTeacherUnits ? 'แสดงน้อยลง' : 'ดูทุกหน่วย'} <ChevronRight className={`h-3.5 w-3.5 transition-transform ${showAllTeacherUnits ? 'rotate-90' : ''}`} /></button></div>
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

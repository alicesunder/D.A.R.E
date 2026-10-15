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
  MapPin, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  Sparkles,
  HeartHandshake,
  Compass,
  ArrowUpRight,
  GraduationCap
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onGoToAdmin: () => void;
  onSelectActivity: (id: string) => void;
  onSelectNews: (id: string) => void;
}

// 4 Border Patrol Police Operational Regions
interface RegionData {
  id: string;
  name: string;
  thaiRegion: string;
  bppCommand: string;
  provinces: string[];
  headquarters: string;
  highlightSchools: {
    name: string;
    location: string;
    terrain: string;
    students: number;
    instructor: string;
  }[];
  activeSchoolsCount: number;
  instructorCount: number;
  studentsReached: number;
  coveragePercent: number;
}

const BORDER_REGIONS: RegionData[] = [
  {
    id: 'region-1',
    name: 'ชายแดนภาคกลาง & ภาคตะวันตก',
    thaiRegion: 'ภาคกลาง / ตะวันตก',
    bppCommand: 'บก.ตชด. ภาค 1',
    headquarters: 'ค่ายพระรามหก ชะอำ / กาญจนบุรี',
    provinces: ['กาญจนบุรี', 'ประจวบคีรีขันธ์', 'เพชรบุรี', 'ราชบุรี'],
    activeSchoolsCount: 18,
    instructorCount: 24,
    studentsReached: 2150,
    coveragePercent: 94,
    highlightSchools: [
      {
        name: 'รร.ตชด.บ้านปิล๊อกคี่',
        location: 'อ.ทองผาภูมิ จ.กาญจนบุรี',
        terrain: 'แนวเทือกเขาตะนาวศรี ติดชายแดนพม่า',
        students: 142,
        instructor: 'ร.ต.อ. ธนากร มั่นคง'
      },
      {
        name: 'รร.ตชด.บ้านเขารวก',
        location: 'อ.ทับสะแก จ.ประจวบคีรีขันธ์',
        terrain: 'พื้นที่หุบเขาแนวรอยต่อชายแดน',
        students: 118,
        instructor: 'ด.ต. สมศักดิ์ ใจกล้า'
      }
    ]
  },
  {
    id: 'region-2',
    name: 'ชายแดนภาคตะวันออกเฉียงเหนือ',
    thaiRegion: 'ภาคอีสาน & ตะวันออก',
    bppCommand: 'บก.ตชด. ภาค 2',
    headquarters: 'ขอนแก่น / อุบลราชธานี',
    provinces: ['อุบลราชธานี', 'นครพนม', 'หนองคาย', 'สระแก้ว', 'บึงกาฬ'],
    activeSchoolsCount: 26,
    instructorCount: 32,
    studentsReached: 3480,
    coveragePercent: 91,
    highlightSchools: [
      {
        name: 'รร.ตชด.บ้านควนมีชัย',
        location: 'อ.น้ำยืน จ.อุบลราชธานี',
        terrain: 'แนวเทือกเขาพนมดงรัก สามเหลี่ยมมรกต',
        students: 165,
        instructor: 'พ.ต.ต. ณัฐวุฒิ สิทธิชัย'
      },
      {
        name: 'รร.ตชด.วังศรีทอง',
        location: 'อ.วังสมบูรณ์ จ.สระแก้ว',
        terrain: 'พื้นที่ราบเชิงเขาชายแดนกัมพูชา',
        students: 130,
        instructor: 'ร.ต.อ. ยรรยง ศรีสมบูรณ์'
      }
    ]
  },
  {
    id: 'region-3',
    name: 'ชายแดนภาคเหนือตอนบน & ตอนล่าง',
    thaiRegion: 'ภาคเหนือ',
    bppCommand: 'บก.ตชด. ภาค 3',
    headquarters: 'ค่ายดารารัศมี อ.แม่ริม จ.เชียงใหม่',
    provinces: ['เชียงใหม่', 'เชียงราย', 'แม่ฮ่องสอน', 'ตาก', 'พะเยา'],
    activeSchoolsCount: 38,
    instructorCount: 46,
    studentsReached: 4890,
    coveragePercent: 96,
    highlightSchools: [
      {
        name: 'รร.ตชด.เบญจมะ 1',
        location: 'อ.เวียงแหง จ.เชียงใหม่',
        terrain: 'ยอดดอยสูงติดแนวรอยต่อรัฐฉาน',
        students: 198,
        instructor: 'พ.ต.ต. อุดมเดช แก้วมณี'
      },
      {
        name: 'รร.ตชด.เจ้าพ่อหลวงอุปถัมภ์ 2',
        location: 'อ.พร้าว จ.เชียงใหม่',
        terrain: 'ถิ่นทุรกันดารบนสันเขา',
        students: 124,
        instructor: 'ร.ต.อ. ชาญวิทย์ รักชาติ'
      }
    ]
  },
  {
    id: 'region-4',
    name: 'ชายแดนภาคใต้ & จังหวัดชายแดนใต้',
    thaiRegion: 'ภาคใต้',
    bppCommand: 'บก.ตชด. ภาค 4',
    headquarters: 'ค่ายรามคำแหง สงขลา / ยะลา',
    provinces: ['ยะลา', 'นราธิวาส', 'ปัตตานี', 'สงขลา', 'สตูล'],
    activeSchoolsCount: 22,
    instructorCount: 28,
    studentsReached: 2840,
    coveragePercent: 88,
    highlightSchools: [
      {
        name: 'รร.บ้านตาบา (เครือข่าย ตชด.)',
        location: 'อ.ตากใบ จ.นราธิวาส',
        terrain: 'ริมแม่น้ำโก-ลก ชายแดนไทย-มาเลเซีย',
        students: 210,
        instructor: 'ร.ต.ท. ประสิทธิ์ เกียรติภูมิ'
      },
      {
        name: 'รร.ตชด.บ้านปาเต๊ะ',
        location: 'อ.สุไหงโก-ลก จ.นราธิวาส',
        terrain: 'พื้นที่ชุมชนชายแดนความมั่นคง',
        students: 156,
        instructor: 'ด.ต. อิบรอฮีม สุไลมาน'
      }
    ]
  }
];

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onGoToAdmin,
  onSelectActivity,
  onSelectNews,
}) => {
  const { activities, news, schools, personnel, organizations } = useApp();
  
  // Interactive Region Selection
  const [activeRegionId, setActiveRegionId] = useState<string>('region-3');
  
  // School Quick Search
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');

  const selectedRegion = BORDER_REGIONS.find((r) => r.id === activeRegionId) || BORDER_REGIONS[0];

  // Calculated Real Totals
  const totalParticipatingSchools = schools.length;
  const totalRecordedActivities = activities.length;
  const totalStudentsReached = activities.reduce((acc, curr) => acc + (curr.studentCount || 0), 0);
  const totalOfficers = personnel.length;

  // Filtered Schools for Quick Lookup
  const filteredSchools = schools.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
                        s.district.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
                        s.province.toLowerCase().includes(schoolSearchQuery.toLowerCase());
    const matchProvince = selectedProvince === 'all' || s.province === selectedProvince;
    return matchSearch && matchProvince;
  });

  const provinces = Array.from(new Set(schools.map((s) => s.province)));

  return (
    <div className="space-y-20 pb-20 text-[#211A2B] bg-[#FAF9FD]">
      {/* 1. CINEMATIC ARTFUL HERO SECTION */}
      <section className="relative overflow-hidden bg-[#220B3B] text-white pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-purple-900/40">
        {/* Deep ambient background textures */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#D6B15E_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-[#D6B15E]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              {/* Organization Header Pill */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#D6B15E]/40 text-[#FFE082] text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-[#D6B15E] animate-pulse" />
                <span>กองบัญชาการตำรวจตระเวนชายแดน (บช.ตชด.)</span>
              </div>

              {/* Headline */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                  สร้างภูมิคุ้มกันเยาวชน <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE082] via-[#D6B15E] to-[#FFF9E6]">
                    ตามแนวชายแดนไทย
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-purple-100/90 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                  ระบบบริหารจัดการและการเรียนการสอนโครงการ D.A.R.E. เพื่อปลูกฝังทักษะชีวิต 
                  การตัดสินใจ และสร้างเกราะป้องกันยาเสพติดให้กับนักเรียนในถิ่นทุรกันดาร
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('about')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-[#D6B15E] text-[#211A2B] hover:bg-[#e0bc68] shadow-lg shadow-black/20 flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                >
                  <BookOpen className="w-4 h-4 text-[#32145C]" />
                  <span>รู้จักหลักสูตร D.A.R.E.</span>
                </button>
                <button
                  onClick={() => onNavigate('schools')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>สำรวจโรงเรียนชายแดน</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-purple-200/80 font-light">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D6B15E]" />
                  <span>10 บทเรียนมาตรฐานสากล</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D6B15E]" />
                  <span>ครู ตชด. ผ่านการรับรองวิทยากร</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D6B15E]" />
                  <span>ครอบคลุม 4 ภาคทั่วประเทศ</span>
                </div>
              </div>
            </div>

            {/* Right Visual Card Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl p-1 bg-gradient-to-b from-[#D6B15E]/40 via-purple-500/20 to-transparent shadow-2xl">
                <div className="bg-[#2B0F4C]/95 rounded-3xl p-7 backdrop-blur-md border border-white/10 space-y-6">
                  {/* Top Logos Header */}
                  <div className="flex items-center justify-between border-b border-purple-800/60 pb-5">
                    <div className="flex items-center gap-3">
                      <BppLogo className="h-11" />
                      <div>
                        <div className="text-xs font-bold text-white tracking-wide">
                          กองบัญชาการตำรวจตระเวนชายแดน
                        </div>
                        <div className="text-[10px] text-purple-300 font-light">
                          Border Patrol Police Thailand
                        </div>
                      </div>
                    </div>
                    <DareLogo className="h-9" />
                  </div>

                  {/* High-Resolution Story Image */}
                  <div className="relative h-52 rounded-2xl overflow-hidden group shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=80"
                      alt="D.A.R.E. School Activities"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#220B3B] via-[#220B3B]/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-[10px] font-bold text-[#FFE082] uppercase tracking-wider">
                        การลงพื้นที่จริง
                      </div>
                      <div className="text-xs font-semibold mt-0.5 truncate">
                        ครู ตชด. ถ่ายทอดทักษะชีวิต ณ โรงเรียนตำรวจตระเวนชายแดน
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Ribbon */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
                      <div className="text-2xl font-extrabold text-[#FFE082]">
                        {totalParticipatingSchools}
                      </div>
                      <div className="text-[11px] text-purple-200/80 font-light mt-0.5">
                        โรงเรียนในเครือข่าย ตชด.
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
                      <div className="text-2xl font-extrabold text-white">
                        {totalStudentsReached.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-purple-200/80 font-light mt-0.5">
                        เยาวชนได้รับภูมิคุ้มกัน (คน)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE BORDER REGIONS & SCHOOLS STRIP (Requested Focus) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E7E0EF] pb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
              Border Patrol Operational Grid
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#32145C] tracking-tight mt-1">
              สถิติและโรงเรียน D.A.R.E. ตามแนวชายแดน 4 ภาค
            </h2>
            <p className="text-xs sm:text-sm text-[#756B80] mt-1 font-light">
              เลือกภาคเพื่อตรวจสอบการกระจายกำลังครู ตชด. และโรงเรียนเป้าหมายในถิ่นทุรกันดาร
            </p>
          </div>

          <div className="text-xs text-[#756B80]">
            ข้อมูลอัปเดตประจำปีงบประมาณ 2568
          </div>
        </div>

        {/* Region Selector Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {BORDER_REGIONS.map((region) => {
            const isSelected = activeRegionId === region.id;
            return (
              <button
                key={region.id}
                onClick={() => setActiveRegionId(region.id)}
                className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'border-[#7C3AED] bg-white shadow-md shadow-purple-900/5 ring-2 ring-[#7C3AED]/20' 
                    : 'border-[#E7E0EF] bg-white/70 hover:bg-white hover:border-purple-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider">
                      {region.bppCommand}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#168A62]" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-[#211A2B]">{region.thaiRegion}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[#756B80]">ความครอบคลุม:</span>
                  <span className="font-extrabold text-[#32145C]">{region.coveragePercent}%</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Selected Region Showcase Banner */}
        <div className="bg-white rounded-3xl border border-[#E7E0EF] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#E7E0EF] pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#5B2A86]">
                <MapPin className="w-4 h-4 text-[#D6B15E]" />
                <span>{selectedRegion.bppCommand} · {selectedRegion.name}</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#32145C]">
                {selectedRegion.name}
              </h3>
              <p className="text-xs text-[#756B80]">
                กองบัญชาการ/ที่ตั้งหลัก: {selectedRegion.headquarters} · จังหวัดรับผิดชอบ: {selectedRegion.provinces.join(', ')}
              </p>
            </div>

            {/* Region KPI Pill Trio */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                <div className="text-xl font-bold text-[#32145C]">{selectedRegion.activeSchoolsCount}</div>
                <div className="text-[10px] text-[#756B80] mt-0.5">โรงเรียนในพื้นที่</div>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                <div className="text-xl font-bold text-[#5B2A86]">{selectedRegion.instructorCount}</div>
                <div className="text-[10px] text-[#756B80] mt-0.5">ครู ตชด. ปฏิบัติการ</div>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                <div className="text-xl font-bold text-[#168A62]">{selectedRegion.studentsReached.toLocaleString()}</div>
                <div className="text-[10px] text-[#756B80] mt-0.5">นักเรียนเป้าหมาย</div>
              </div>
            </div>
          </div>

          {/* Highlighted Remote Border Schools in this Region */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#32145C]">
              <span>สถานศึกษาชายแดนโดดเด่นในเขตพื้นที่นี้:</span>
              <button 
                onClick={() => onNavigate('schools')}
                className="text-[#7C3AED] hover:underline font-semibold flex items-center gap-1"
              >
                <span>ดูทะเบียนโรงเรียนทั้งหมด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedRegion.highlightSchools.map((sch, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-[#FAF9FD] border border-[#E7E0EF] hover:border-purple-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#211A2B]">{sch.name}</h4>
                      <div className="text-xs text-[#756B80] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#7C3AED]" />
                        <span>{sch.location}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#168A62] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      นักเรียน {sch.students} คน
                    </span>
                  </div>

                  <p className="text-[11px] text-[#756B80] leading-relaxed bg-white p-2.5 rounded-xl border border-gray-100">
                    ภูมิประเทศ: {sch.terrain}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[#5B2A86] font-medium">ครู D.A.R.E. ประจำการ:</span>
                    <span className="font-bold text-[#32145C]">{sch.instructor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. D.A.R.E. CURRICULUM & LIFE SKILLS (Editorial Clean Presentation) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
            Educational Blueprint
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#32145C] tracking-tight">
            เสาหลักการเรียนรู้และทักษะชีวิต D.A.R.E.
          </h2>
          <p className="text-xs sm:text-sm text-[#756B80] font-light">
            กระบวนการ 10 บทเรียนที่ได้รับการพิสูจน์แล้วว่าสร้างภูมิคุ้มกันทางความคิดอย่างยั่งยืน
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Decision Model */}
          <div className="bg-white rounded-3xl p-7 border border-[#E7E0EF] shadow-xs hover:border-[#7C3AED] transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#5B2A86] flex items-center justify-center font-bold text-lg">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#32145C]">รูปแบบการตัดสินใจแบบ D.A.R.E.</h3>
              <p className="text-xs text-[#756B80] leading-relaxed">
                แบบจำลองทางความคิด 4 ขั้นตอน ฝึกให้นักเรียนวิเคราะห์ผลกระทบก่อนตัดสินใจในสถานการณ์เสี่ยง
              </p>

              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#5B2A86]">D - Define</span>
                  <span className="text-[#756B80]">ระบุปัญหาให้ชัดเจน</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#5B2A86]">A - Assess</span>
                  <span className="text-[#756B80]">ประเมินทางเลือกและผลที่จะตามมา</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#5B2A86]">R - Respond</span>
                  <span className="text-[#756B80]">เลือกตอบสนองอย่างถูกต้อง</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#5B2A86]">E - Evaluate</span>
                  <span className="text-[#756B80]">ประเมินผลลัพธ์ที่เกิดขึ้น</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('knowledge')}
              className="text-xs font-semibold text-[#7C3AED] hover:text-[#5B2A86] flex items-center gap-1.5 pt-2"
            >
              <span>อ่านคู่มือการตัดสินใจ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 2: 5 Refusal Skills */}
          <div className="bg-white rounded-3xl p-7 border border-[#E7E0EF] shadow-xs hover:border-[#7C3AED] transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#168A62] flex items-center justify-center font-bold text-lg">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#32145C]">5 ทักษะการปฏิเสธอย่างปลอดภัย</h3>
              <p className="text-xs text-[#756B80] leading-relaxed">
                กลยุทธ์การปฏิเสธคำชักชวนของเพื่อนหรือบุคคลภายนอกอย่างสุภาพ แต่เด็ดขาดและปลอดภัย
              </p>

              <ul className="space-y-2 pt-2 border-t border-gray-100 text-xs text-[#756B80]">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-50 text-[#168A62] text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>ปฏิเสธด้วยคำว่า "ไม่" หนักแน่นพร้อมสบตา</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-50 text-[#168A62] text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>ให้เหตุผลที่สมเหตุสมผลและสั้นกระชับ</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-50 text-[#168A62] text-[10px] flex items-center justify-center font-bold">3</span>
                  <span>ชวนเปลี่ยนไปทำกิจกรรมสร้างสรรค์อื่น</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-50 text-[#168A62] text-[10px] flex items-center justify-center font-bold">4</span>
                  <span>เดินเลี่ยงออกจากสถานการณ์เสี่ยงทันที</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate('knowledge')}
              className="text-xs font-semibold text-[#168A62] hover:text-[#127050] flex items-center gap-1.5 pt-2"
            >
              <span>เรียนรู้ทักษะการปฏิเสธ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 3: Police & Community Bond */}
          <div className="bg-white rounded-3xl p-7 border border-[#E7E0EF] shadow-xs hover:border-[#7C3AED] transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#32145C]">ครูตำรวจมิตรภาพแห่งชายแดน</h3>
              <p className="text-xs text-[#756B80] leading-relaxed">
                การเปลี่ยนบทบาทของเจ้าหน้าที่ตำรวจจากการปราบปรามมาเป็นมิตรแท้ ที่คอยรับฟังและให้คำปรึกษา
              </p>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs space-y-1">
                <div className="font-bold text-amber-900">กล่องคำถาม D.A.R.E. Box</div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  เปิดโอกาสให้นักเรียนหย่อนคำถามส่วนตัว ข้อกังวล หรือปัญหาในชีวิตโดยไม่ต้องระบุชื่อ เพื่อให้ครู ตชด. ช่วยไขข้อข้องใจ
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('about')}
              className="text-xs font-semibold text-[#D99720] hover:text-[#b37a15] flex items-center gap-1.5 pt-2"
            >
              <span>ทำความรู้จักครู D.A.R.E.</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. REAL-TIME SCHOOL LOOKUP (Direct, Simple, Uncluttered) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white rounded-3xl border border-[#E7E0EF] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E0EF] pb-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                Live School Registry
              </div>
              <h3 className="text-xl font-extrabold text-[#32145C] mt-0.5">
                ค้นหาสถานศึกษาในโครงการ D.A.R.E. บช.ตชด.
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="px-3 py-2 text-xs border border-[#E7E0EF] rounded-xl text-[#211A2B] focus:outline-none focus:border-[#7C3AED]"
              >
                <option value="all">ทุกจังหวัด ({provinces.length} จังหวัด)</option>
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search bar input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={schoolSearchQuery}
              onChange={(e) => setSchoolSearchQuery(e.target.value)}
              placeholder="พิมพ์ชื่อโรงเรียน เช่น ปิล๊อกคี่, เวียงแหง, บ้านควนมีชัย หรือชื่ออำเภอ..."
              className="w-full pl-11 pr-4 py-3 text-xs border border-[#E7E0EF] rounded-2xl focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          {/* School cards list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchools.slice(0, 6).map((sch) => (
              <div
                key={sch.id}
                className="p-4 rounded-2xl border border-[#E7E0EF] hover:border-purple-300 hover:shadow-xs transition-all space-y-2 bg-[#FAF9FD]"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-[#5B2A86]">
                    {sch.type === 'bpp_school' ? 'รร.ตชด. ชายแดน' : 'รร. สพฐ./ทั่วไป'}
                  </span>
                  <span className="text-gray-400">รหัส {sch.code}</span>
                </div>

                <div className="text-xs font-bold text-[#211A2B] truncate">{sch.name}</div>
                
                <div className="text-[11px] text-[#756B80] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#7C3AED]" />
                  <span>อ.{sch.district} จ.{sch.province}</span>
                </div>

                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-[#168A62] font-semibold">
                    {sch.assignedPersonnelIds.length > 0 ? '✓ มีครู ตชด. ประจำการ' : 'รอการจัดสรร'}
                  </span>
                  <span className="text-[#756B80]">นักเรียน {sch.totalStudents} คน</span>
                </div>
              </div>
            ))}
          </div>

          {filteredSchools.length > 6 && (
            <div className="text-center pt-2">
              <button
                onClick={() => onNavigate('schools')}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#7C3AED] hover:underline"
              >
                <span>ดูทะเบียนโรงเรียนทั้งหมด {filteredSchools.length} แห่ง</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 5. STREAMLINED EXECUTIVE INVITATION (Admin Gateway) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#2B0F4C] via-[#32145C] to-[#5B2A86] p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#D6B15E]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 text-center md:text-left relative z-10">
            <div className="text-xs font-bold text-[#FFE082] uppercase tracking-wider">
              บช.ตชด. COMMAND CENTER
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              ระบบศูนย์บัญชาการสำหรับผู้บริหารและครู ตชด. D.A.R.E.
            </h3>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-xl font-light">
              จัดการ 5 โซนยุทธศาสตร์: วิเคราะห์ข้อมูล · ทะเบียนกำลังพล · ระบบมอบหมายงาน · บันทึกการสอน และรายงาน Google Sheets
            </p>
          </div>

          <button
            onClick={onGoToAdmin}
            className="px-7 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-[#D6B15E] text-[#211A2B] hover:bg-[#e0bc68] shadow-lg transition-transform hover:-translate-y-0.5 whitespace-nowrap relative z-10"
          >
            เข้าสู่ระบบศูนย์บัญชาการ (Admin)
          </button>
        </div>
      </section>
    </div>
  );
};

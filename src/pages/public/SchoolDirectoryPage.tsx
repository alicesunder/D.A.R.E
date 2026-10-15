import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  School, 
  Search, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Sparkles,
  Users
} from 'lucide-react';

export const SchoolDirectoryPage: React.FC = () => {
  const { schools } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const provinces = Array.from(new Set(schools.map(s => s.province)));

  const filtered = schools.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchProvince = selectedProvince === 'all' || s.province === selectedProvince;
    const matchType = selectedType === 'all' || s.type === selectedType;
    return matchSearch && matchProvince && matchType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2ECFA] text-[#5B2A86] text-xs font-semibold">
          <School className="w-3.5 h-3.5" />
          <span>ทำเนียบโรงเรียนในเครือข่าย</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#32145C]">
          โรงเรียนที่เข้าร่วมโครงการ D.A.R.E. ทั่วประเทศ
        </h1>
        <p className="text-sm text-[#756B80]">
          ตรวจสอบรายชื่อโรงเรียนตำรวจตระเวนชายแดน และโรงเรียนเครือข่ายความร่วมมือ สพฐ. ที่ได้รับการบรรจุหลักสูตร D.A.R.E.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E0EF] shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#756B80]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อโรงเรียน หรืออำเภอ..."
            className="w-full pl-9 pr-3 py-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
          />
        </div>

        <div>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="w-full py-2 px-3 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
          >
            <option value="all">ทุกจังหวัด</option>
            {provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full py-2 px-3 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
          >
            <option value="all">ทุกประเภทโรงเรียน</option>
            <option value="bpp_school">รร.ตำรวจตระเวนชายแดน (รร.ตชด.)</option>
            <option value="obec_primary">รร.ประถม สพฐ.</option>
            <option value="obec_expansion">รร.ขยายโอกาส สพฐ.</option>
            <option value="municipal">รร.เทศบาล/ท้องถิ่น</option>
          </select>
        </div>
      </div>

      {/* Schools Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-white p-5 rounded-2xl border border-[#E7E0EF] shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-[#5B2A86] border border-purple-100">
                  {s.type === 'bpp_school' ? 'รร.ตชด.' : 'สพฐ. ร่วมโครงการ'}
                </span>
                <span className="text-[10px] text-[#756B80] font-mono">รหัส {s.code}</span>
              </div>
              <h3 className="text-sm font-bold text-[#211A2B]">{s.name}</h3>
              <div className="text-xs text-[#756B80] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#5B2A86] shrink-0" />
                <span>ต.{s.subdistrict} อ.{s.district} จ.{s.province}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E7E0EF] flex items-center justify-between text-xs">
              <span className="text-[#168A62] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{s.assignedPersonnelIds.length > 0 ? 'มีครู ตชด. ประจำการ' : 'รอจัดสรรครู'}</span>
              </span>
              <span className="text-[#756B80] font-medium">นักเรียน {s.totalStudents} คน</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

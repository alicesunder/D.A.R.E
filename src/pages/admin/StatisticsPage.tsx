import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  ShieldCheck, 
  School, 
  Users,
  MapPin
} from 'lucide-react';

export const StatisticsPage: React.FC = () => {
  const { personnel, schools, activities, organizations } = useApp();

  const totalStudents = activities.reduce((acc, curr) => acc + (curr.studentCount || 0), 0);
  const totalSchools = schools.length;
  const coveredSchools = schools.filter(s => s.assignmentStatus === 'assigned').length;
  const coverageRate = Math.round((coveredSchools / (totalSchools || 1)) * 100);

  // Region Breakdown
  const regionBreakdown = [
    { name: 'บก.ตชด.ภาค 1 (ภาคกลาง/ตะวันออก)', schools: 4, officers: 3, activities: 8 },
    { name: 'บก.ตชด.ภาค 2 (ภาคอีสาน)', schools: 3, officers: 2, activities: 5 },
    { name: 'บก.ตชด.ภาค 3 (ภาคเหนือ)', schools: 4, officers: 3, activities: 9 },
    { name: 'บก.ตชด.ภาค 4 (ภาคใต้)', schools: 3, officers: 2, activities: 7 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#32145C] flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#5B2A86]" />
          <span>สถิติและการวิเคราะห์เชิงลึก (Analytics)</span>
        </h1>
        <p className="text-xs text-[#756B80]">
          ดัชนีชี้วัดความครอบคลุม ประสิทธิผลการสอน และการเข้าถึงกลุ่มเป้าหมายนักเรียนชายแดน
        </p>
      </div>

      {/* High-level Analytics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E7E0EF] shadow-2xs space-y-1">
          <span className="text-xs text-[#756B80]">อัตราความครอบคลุมโรงเรียน</span>
          <div className="text-3xl font-black text-[#5B2A86]">{coverageRate}%</div>
          <div className="w-full h-2 bg-[#F2ECFA] rounded-full overflow-hidden mt-2">
            <div style={{ width: `${coverageRate}%` }} className="h-full bg-[#5B2A86] rounded-full" />
          </div>
          <span className="text-[10px] text-[#168A62] block pt-1">เป้าหมายประจำปี 85%</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E7E0EF] shadow-2xs space-y-1">
          <span className="text-xs text-[#756B80]">นักเรียนที่ผ่านการอบรมรวม</span>
          <div className="text-3xl font-black text-[#168A62]">{totalStudents.toLocaleString()}</div>
          <span className="text-[10px] text-[#756B80] block pt-1">คน (ระดับชั้น ป.5 - ม.3)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E7E0EF] shadow-2xs space-y-1">
          <span className="text-xs text-[#756B80]">ชั่วโมงการสอนเฉลี่ยต่อครู</span>
          <div className="text-3xl font-black text-[#D99720]">32.4</div>
          <span className="text-[10px] text-[#756B80] block pt-1">คาบเรียน / ภาคการศึกษา</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E7E0EF] shadow-2xs space-y-1">
          <span className="text-xs text-[#756B80]">คะแนนความพึงพอใจประเมินผล</span>
          <div className="text-3xl font-black text-blue-600">4.85 / 5</div>
          <span className="text-[10px] text-blue-700 block pt-1">จากแบบสอบถามนักเรียนและครูใหญ่</span>
        </div>
      </div>

      {/* Regional Comparison Table & Cards */}
      <div className="bg-white rounded-2xl border border-[#E7E0EF] shadow-2xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#32145C] flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#5B2A86]" />
          <span>การเปรียบเทียบผลการดำเนินงานรายภาค (บก.ตชด. ภาค 1 - 4)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5FB] text-[#756B80] font-semibold border-b border-[#E7E0EF]">
              <tr>
                <th className="py-3 px-4">กองบังคับการ</th>
                <th className="py-3 px-4 text-center">โรงเรียนในพื้นที่</th>
                <th className="py-3 px-4 text-center">ครู D.A.R.E. ประจำการ</th>
                <th className="py-3 px-4 text-center">กิจกรรมที่จัดแล้ว</th>
                <th className="py-3 px-4 text-center">สถานะความก้าวหน้า</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0EF] text-[#211A2B]">
              {regionBreakdown.map((r, idx) => (
                <tr key={idx} className="hover:bg-purple-50/50">
                  <td className="py-3.5 px-4 font-bold text-[#32145C]">{r.name}</td>
                  <td className="py-3.5 px-4 text-center font-semibold">{r.schools} แห่ง</td>
                  <td className="py-3.5 px-4 text-center">{r.officers} นาย</td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#168A62]">{r.activities} ครั้ง</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      เป็นไปตามแผนงาน
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

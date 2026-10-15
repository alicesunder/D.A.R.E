import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { ShieldCheck, Check, X, Users, Lock, ShieldAlert, Key } from 'lucide-react';

export const UserRolesPage: React.FC = () => {
  const { currentRole, switchRole, currentUser } = useApp();

  const roleDefinitions: {
    role: UserRole;
    name: string;
    description: string;
    scope: string;
    badgeColor: string;
  }[] = [
    {
      role: 'central_admin',
      name: 'ผู้ดูแลระบบส่วนกลาง (Central Administrator)',
      description: 'ผู้ดูแลระบบส่วนกลาง กองบัญชาการตำรวจตระเวนชายแดน มีอำนาจสูงสุดในการบริหารจัดการทั่วประเทศ',
      scope: 'ครอบคลุมทุก บก.ตชด. ภาค 1-4 และทุก กก.ตชด. ทั่วประเทศ',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    },
    {
      role: 'unit_admin',
      name: 'ผู้ดูแลระดับหน่วย (Unit Administrator)',
      description: 'ผู้กำกับการหรือสารวัตรผู้รับผิดชอบงาน D.A.R.E. ระดับกองกำกับการ (กก.ตชด.)',
      scope: 'จำกัดเฉพาะบุคลากร โรงเรียน และกิจกรรมภายในหน่วยตนเอง',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    {
      role: 'dare_instructor',
      name: 'ครู D.A.R.E. ผู้ปฏิบัติงาน (D.A.R.E. Instructor)',
      description: 'ข้าราชการตำรวจผู้ผ่านการรับรองและลงพื้นที่ทำการสอนในห้องเรียน',
      scope: 'ดูเฉพาะโรงเรียนที่ตนเองได้รับมอบหมาย และส่งรายงานผลการสอน',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      role: 'report_viewer',
      name: 'ผู้ตรวจการ/ดูรายงาน (Report Viewer)',
      description: 'จเรตำรวจ ผู้บังคับบัญชาระดับนโยบาย หรือผู้แทนหน่วยงานภาคีเครือข่าย',
      scope: 'สิทธิ์ดูรายงานและสถิติภาพรวมเท่านั้น (Read-Only)',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
  ];

  const permissionsMatrix = [
    { module: 'ภาพรวมระบบ (Dashboard)', central: true, unit: true, instructor: true, viewer: true },
    { module: 'จัดการโครงสร้างหน่วยงาน ตชด.', central: true, unit: false, instructor: false, viewer: false },
    { module: 'เพิ่ม/แก้ไข/ลบ ทำเนียบครู D.A.R.E.', central: true, unit: true, instructor: false, viewer: false },
    { module: 'ลงทะเบียนสถานศึกษา', central: true, unit: true, instructor: false, viewer: false },
    { module: 'จัดสรร/มอบหมายครูลงพื้นที่', central: true, unit: true, instructor: false, viewer: false },
    { module: 'สร้างกิจกรรมและบันทึกผลการสอน', central: true, unit: true, instructor: true, viewer: false },
    { module: 'อนุมัติรายงานผลการปฏิบัติงาน', central: true, unit: true, instructor: false, viewer: false },
    { module: 'ส่งออก Google Sheets รายงานราชการ', central: true, unit: true, instructor: false, viewer: true },
    { module: 'จัดการข่าวสารและสื่อ CMS', central: true, unit: true, instructor: false, viewer: false },
    { module: 'ดูประวัติการใช้งาน (Audit Logs)', central: true, unit: false, instructor: false, viewer: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#32145C] flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#5B2A86]" />
          <span>การกำหนดสิทธิ์และการควบคุมการเข้าถึง (RBAC)</span>
        </h1>
        <p className="text-xs text-[#756B80]">
          Role-Based Access Control แยกแยะอำนาจหน้าที่ตามโครงสร้างราชการตำรวจ บช.ตชด.
        </p>
      </div>

      {/* Role Testing Interactive Switcher */}
      <div className="bg-gradient-to-r from-purple-900 to-[#32145C] text-white p-6 rounded-2xl shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-[#FFE082] uppercase tracking-wider">
              RBAC Live Simulation Sandbox
            </span>
            <h3 className="text-base font-bold">สลับบทบาทผู้ใช้งานเพื่อทดสอบการแสดงผลและสิทธิ์</h3>
          </div>
          <div className="text-xs text-purple-200">
            บทบาทปัจจุบัน: <span className="font-bold text-[#FFE082]">{currentUser.name} ({currentRole})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roleDefinitions.map((r) => {
            const isActive = currentRole === r.role;
            return (
              <button
                key={r.role}
                onClick={() => switchRole(r.role)}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  isActive
                    ? 'bg-white text-[#211A2B] border-[#D6B15E] shadow-lg ring-2 ring-[#D6B15E]'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-[#5B2A86] text-white' : 'bg-white/20 text-[#FFE082]'
                  }`}>
                    {r.role}
                  </span>
                  {isActive && <Check className="w-4 h-4 text-[#168A62]" />}
                </div>
                <div className="font-bold text-xs line-clamp-1">{r.name.split(' (')[0]}</div>
                <div className={`text-[10px] mt-1 line-clamp-2 ${isActive ? 'text-gray-600' : 'text-purple-200'}`}>
                  {r.scope}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-2xl border border-[#E7E0EF] shadow-2xs overflow-hidden space-y-3 p-6">
        <h3 className="text-sm font-bold text-[#32145C] flex items-center gap-2">
          <Key className="w-4 h-4 text-[#5B2A86]" />
          <span>ตารางสิทธิ์การเข้าถึงข้อมูลตามบทบาท (Access Control Matrix)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5FB] text-[#756B80] font-semibold border-b border-[#E7E0EF]">
              <tr>
                <th className="py-3 px-4">โมดูลการทำงาน</th>
                <th className="py-3 px-4 text-center">ส่วนกลาง (Central)</th>
                <th className="py-3 px-4 text-center">ระดับหน่วย (Unit)</th>
                <th className="py-3 px-4 text-center">ครู D.A.R.E.</th>
                <th className="py-3 px-4 text-center">ผู้ตรวจการ (Viewer)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0EF] text-[#211A2B]">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-purple-50/50">
                  <td className="py-3 px-4 font-medium">{item.module}</td>
                  <td className="py-3 px-4 text-center">
                    {item.central ? <Check className="w-4 h-4 text-[#168A62] mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.unit ? <Check className="w-4 h-4 text-[#168A62] mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.instructor ? <Check className="w-4 h-4 text-[#168A62] mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.viewer ? <Check className="w-4 h-4 text-[#168A62] mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
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

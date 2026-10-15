import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  RotateCcw, 
  FileSpreadsheet, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Save, 
  ExternalLink 
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const SystemSettingsPage: React.FC = () => {
  const { 
    googleUser, 
    handleGoogleSignIn, 
    handleGoogleSignOut, 
    resetDemoData 
  } = useApp();

  const [fiscalYear, setFiscalYear] = useState('2568');
  const [semester, setSemester] = useState('1');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#32145C] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#5B2A86]" />
          <span>การตั้งค่าระบบ (System Configuration)</span>
        </h1>
        <p className="text-xs text-[#756B80]">
          กำหนดค่าพารามิเตอร์การทำงาน การเชื่อมต่อบริการภายนอก และการจัดการข้อมูลสภาพแวดล้อม
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>บันทึกการตั้งค่าระบบเรียบร้อยแล้ว</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-[#E7E0EF] shadow-2xs p-6 space-y-5 text-xs">
        <h3 className="text-sm font-bold text-[#32145C] border-b border-[#E7E0EF] pb-3">
          1. ข้อมูลปีการศึกษาและงวดการประเมิน
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-[#211A2B] block mb-1">ปีงบประมาณปัจจุบัน (พ.ศ.)</label>
            <input
              type="text"
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg font-bold"
            />
          </div>
          <div>
            <label className="font-semibold text-[#211A2B] block mb-1">ภาคการศึกษาที่เปิดสอน</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
            >
              <option value="1">ภาคเรียนที่ 1</option>
              <option value="2">ภาคเรียนที่ 2</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#5B2A86] text-white font-bold rounded-lg hover:bg-[#441D66]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>บันทึกการตั้งค่า</span>
          </button>
        </div>
      </form>

      {/* Google Workspace Integration Settings */}
      <div className="bg-white rounded-2xl border border-[#E7E0EF] shadow-2xs p-6 space-y-4 text-xs">
        <h3 className="text-sm font-bold text-[#32145C] border-b border-[#E7E0EF] pb-3 flex items-center justify-between">
          <span>2. การเชื่อมต่อบริการ Google Workspace (Google Sheets API)</span>
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
        </h3>

        <p className="text-[#756B80] leading-relaxed">
          เชื่อมต่อกับบัญชี Google Workspace ของคุณเพื่อส่งออกข้อมูลทำเนียบครู ทะเบียนโรงเรียน และรายงานกิจกรรมเข้าสู่สเปรดชีตอัตโนมัติ
        </p>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-emerald-950">
                {googleUser ? `เชื่อมต่อแล้ว: ${googleUser.email}` : 'ยังไม่ได้เชื่อมต่อ Google Account'}
              </div>
              <div className="text-[11px] text-emerald-800">
                ขอบเขตสิทธิ์ (Scopes): spreadsheets, drive.file
              </div>
            </div>
          </div>

          <div>
            {googleUser ? (
              <button
                type="button"
                onClick={handleGoogleSignOut}
                className="px-3 py-1.5 text-xs font-semibold bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                ตัดการเชื่อมต่อ
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="px-4 py-2 text-xs font-bold text-white bg-[#168A62] hover:bg-[#0f6b4b] rounded-lg shadow-xs"
              >
                เข้าสู่ระบบด้วย Google
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="bg-white rounded-2xl border border-red-200 shadow-2xs p-6 space-y-4 text-xs">
        <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
          <ShieldAlert className="w-4 h-4" />
          <span>การจัดการข้อมูลทดสอบ (Demo Sandbox)</span>
        </div>
        <p className="text-[#756B80] leading-relaxed">
          หากต้องการล้างข้อมูลที่ได้เพิ่มหรือแก้ไขในการสาธิตทั้งหมด แล้วคืนค่ากลับสู่ข้อมูลสมมติตั้งต้นของระบบ บช.ตชด.
        </p>
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>คืนค่าข้อมูลจำลองเริ่มต้น (Reset Mock Data)</span>
        </button>
      </div>

      {/* Confirmation Modal for Reset */}
      <ConfirmationModal
        isOpen={showResetConfirm}
        title="ยืนยันการคืนค่าข้อมูลเริ่มต้น"
        description="การดำเนินการนี้จะรีเซ็ตข้อมูลครู โรงเรียน การมอบหมาย และกิจกรรมที่ได้สร้างในระหว่างการทดสอบ ให้กลับไปเป็นข้อมูลสาธิตเริ่มต้นทั้งหมด"
        type="danger"
        confirmLabel="ยืนยันรีเซ็ตข้อมูล"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};

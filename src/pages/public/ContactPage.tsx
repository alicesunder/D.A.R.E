import React, { useState } from 'react';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Building2, 
  Clock, 
  Shield 
} from 'lucide-react';
import { BrandIdentity } from '../../components/ui/Logos';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    schoolOrUnit: '',
    topic: 'request_training',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold text-[#32145C]">
          ติดต่อโครงการครู D.A.R.E. บช.ตชด.
        </h1>
        <p className="text-sm text-[#756B80]">
          สอบถามข้อมูลการจัดตั้งโครงการในโรงเรียน การประสานงานวิทยากร หรือขอรับการสนับสนุนสื่อการเรียนการสอน
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-[#E7E0EF] shadow-2xs space-y-4">
            <BrandIdentity variant="dark" />
            <div className="space-y-3 text-xs text-gray-700 pt-2 border-t border-[#E7E0EF]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#5B2A86] shrink-0 mt-0.5" />
                <span>
                  กองบัญชาการตำรวจตระเวนชายแดน (บช.ตชด.)<br />
                  ถนนพหลโยธิน แขวงพญาไท เขตพญาไท กรุงเทพฯ 10400
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#5B2A86] shrink-0" />
                <span>วันจันทร์ - วันศุกร์ เวลา 08:30 - 16:30 น.</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#5B2A86] shrink-0" />
                <span>dare.contact@bpp.police.go.th</span>
              </div>
            </div>
          </div>

          {/* Regional Contacts */}
          <div className="bg-[#F2ECFA] p-6 rounded-2xl border border-purple-200 space-y-3 text-xs">
            <h4 className="font-bold text-[#32145C] flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#5B2A86]" />
              <span>สายตรงกองบังคับการตำรวจตระเวนชายแดน</span>
            </h4>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between border-b border-purple-200/60 pb-1">
                <span>บก.ตชด.ภาค 1 (ปทุมธานี/ตะวันออก)</span>
                <span className="font-bold text-[#5B2A86]">02-529-xxxx</span>
              </div>
              <div className="flex justify-between border-b border-purple-200/60 pb-1">
                <span>บก.ตชด.ภาค 2 (ขอนแก่น/อีสาน)</span>
                <span className="font-bold text-[#5B2A86]">043-24xxxx</span>
              </div>
              <div className="flex justify-between border-b border-purple-200/60 pb-1">
                <span>บก.ตชด.ภาค 3 (เชียงใหม่/เหนือ)</span>
                <span className="font-bold text-[#5B2A86]">053-21xxxx</span>
              </div>
              <div className="flex justify-between">
                <span>บก.ตชด.ภาค 4 (สงขลา/ใต้)</span>
                <span className="font-bold text-[#5B2A86]">074-31xxxx</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E0EF] shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#211A2B]">ส่งข้อความติดต่อสำเร็จ</h3>
              <p className="text-xs text-[#756B80] max-w-sm mx-auto">
                เจ้าหน้าที่ฝ่ายประสานงานโครงการ D.A.R.E. บช.ตชด. ได้รับข้อมูลเรียบร้อยแล้ว และจะติดต่อกลับตามข้อมูลที่ระบุ
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 text-xs font-semibold text-[#5B2A86] bg-purple-50 rounded-lg hover:bg-purple-100"
              >
                ส่งข้อความใหม่
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-[#32145C] border-b border-[#E7E0EF] pb-3">
                แบบฟอร์มติดต่อประสานงาน
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">ชื่อ - นามสกุล</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="เช่น อาจารย์สมศรี มีสุข"
                    className="w-full p-2.5 bg-[#F7F5FB] border border-[#E7E0EF] rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">โรงเรียน / หน่วยงาน</label>
                  <input
                    type="text"
                    required
                    value={formData.schoolOrUnit}
                    onChange={(e) => setFormData({ ...formData, schoolOrUnit: e.target.value })}
                    placeholder="ชื่อสถานศึกษา"
                    className="w-full p-2.5 bg-[#F7F5FB] border border-[#E7E0EF] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08X-XXX-XXXX"
                    className="w-full p-2.5 bg-[#F7F5FB] border border-[#E7E0EF] rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">อีเมล</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your-email@school.ac.th"
                    className="w-full p-2.5 bg-[#F7F5FB] border border-[#E7E0EF] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#211A2B] block mb-1">เรื่องที่ต้องการติดต่อ</label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full p-2.5 bg-[#F7F5FB] border border-[#E7E0EF] rounded-xl"
                >
                  <option value="request_training">ขอรับการสนับสนุนครู D.A.R.E. เข้าสอนในโรงเรียน</option>
                  <option value="curriculum">สอบถามข้อมูลหลักสูตรและสื่อการเรียนรู้</option>
                  <option value="visit">ขอเข้าศึกษาดูงานศูนย์ฝึกอบรม ตชด.</option>
                  <option value="other">เรื่องอื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#211A2B] block mb-1">รายละเอียดข้อความ</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="พิมพ์รายละเอียดที่ต้องการประสานงาน..."
                  className="w-full p-2.5 bg-[#F7F5FB] border border-[#E7E0EF] rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 font-bold text-xs bg-[#5B2A86] hover:bg-[#441D66] text-white rounded-xl shadow-xs flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ส่งข้อความติดต่อ</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

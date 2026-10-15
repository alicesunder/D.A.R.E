import React from 'react';
import { BrandIdentity } from '../ui/Logos';
import { Shield, PhoneCall, ExternalLink, Info, Award } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#1F0B38] text-purple-200 border-t border-[#5B2A86]/40">
      {/* Top Banner Notice */}
      <div className="bg-[#2A0F4C] border-b border-purple-900/50 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-purple-300 gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center">
            <Info className="w-4 h-4 text-[#D6B15E] shrink-0" />
            <span>โหมดการทำงาน: ข้อมูลตัวอย่างสำหรับการสาธิตระบบ — D.A.R.E. Command Center Simulation</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>สายด่วน ป.ป.ส. โทร 1386</span>
            <span className="text-purple-600">|</span>
            <span>สายด่วน ตชด. โทร 1599</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Identity */}
          <div className="space-y-4 md:col-span-1">
            <BrandIdentity variant="light" />
            <p className="text-xs text-purple-300/80 leading-relaxed">
              โครงการการศึกษาเพื่อต่อต้านการใช้ยาเสพติดในเด็กนักเรียน (D.A.R.E. ประเทศไทย) 
              กองบัญชาการตำรวจตระเวนชายแดน มุ่งสร้างภูมิคุ้มกันทางความคิดและทักษะชีวิตที่เข้มแข็งแก่เยาวชนไทยในทุกพื้นที่ชายแดน
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D6B15E]">
              <Award className="w-4 h-4" />
              <span>โครงการความร่วมมือระดับสากล</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase border-b border-purple-800/60 pb-1.5 inline-block">
              เนื้อหาหลัก
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  หน้าแรก
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  เกี่ยวกับโครงการ D.A.R.E.
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('knowledge')} className="hover:text-white transition-colors">
                  คลังความรู้ & ทักษะการปฏิเสธ
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('activities')} className="hover:text-white transition-colors">
                  กิจกรรมการเรียนการสอน
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('schools')} className="hover:text-white transition-colors">
                  ทำเนียบโรงเรียนในโครงการ
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase border-b border-purple-800/60 pb-1.5 inline-block">
              เครือข่ายความร่วมมือ
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://www.bpp.go.th" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white">
                  <span>กองบัญชาการตำรวจตระเวนชายแดน</span>
                  <ExternalLink className="w-3 h-3 text-purple-400" />
                </a>
              </li>
              <li>
                <a href="https://www.oncb.go.th" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white">
                  <span>สำนักงาน ป.ป.ส.</span>
                  <ExternalLink className="w-3 h-3 text-purple-400" />
                </a>
              </li>
              <li>
                <a href="https://dare.org" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white">
                  <span>D.A.R.E. International</span>
                  <ExternalLink className="w-3 h-3 text-purple-400" />
                </a>
              </li>
              <li>
                <a href="https://www.obec.go.th" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white">
                  <span>สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)</span>
                  <ExternalLink className="w-3 h-3 text-purple-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Policy */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase border-b border-purple-800/60 pb-1.5 inline-block">
              ติดต่อหน่วยงาน
            </h4>
            <div className="text-xs space-y-2 text-purple-300">
              <p>กองบัญชาการตำรวจตระเวนชายแดน (บช.ตชด.)</p>
              <p>ถนนพหลโยธิน แขวงพญาไท เขตพญาไท กรุงเทพมหานคร 10400</p>
              <div className="pt-2 flex items-center gap-2 text-[#D6B15E]">
                <PhoneCall className="w-4 h-4" />
                <span>สายตรงโครงการ D.A.R.E. บช.ตชด.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-10 pt-6 border-t border-purple-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-purple-400 gap-4">
          <p>© 2568 กองบัญชาการตำรวจตระเวนชายแดน (Border Patrol Police). สงวนลิขสิทธิ์ตามกฎหมาย</p>
          <div className="flex items-center space-x-6 text-[11px]">
            <span className="hover:text-purple-200 cursor-pointer">นโยบายความเป็นส่วนตัว</span>
            <span className="hover:text-purple-200 cursor-pointer">ข้อกำหนดการใช้งาน</span>
            <span className="hover:text-purple-200 cursor-pointer">การเข้าถึงสำหรับทุกคน (Accessibility)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

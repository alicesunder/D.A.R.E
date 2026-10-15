import React from 'react';
import { DareLogo, BppLogo } from '../../components/ui/Logos';
import { Shield, BookOpen, CheckCircle, Target, Award, HeartHandshake, Sparkles } from 'lucide-react';

export const AboutPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const lessons = [
    { num: 1, title: 'บทนำ: จุดประสงค์และกฎกติกา D.A.R.E.', desc: 'ทำความเข้าใจบทบาทของโครงการและครูตำรวจ D.A.R.E.' },
    { num: 2, title: 'ความจริงเกี่ยวกับบุหรี่และยาสูบ', desc: 'ผลกระทบต่อร่างกาย ระบบทางเดินหายใจ และกลลวงการตลาด' },
    { num: 3, title: 'ความจริงเกี่ยวกับเครื่องดื่มแอลกอฮอล์', desc: 'พิษภัยต่อสมองและพฤติกรรมเสี่ยงเมื่อขาดสติ' },
    { num: 4, title: 'รูปแบบการตัดสินใจแบบ D.A.R.E.', desc: 'กระบวนการ 4 ขั้นตอน: Define, Assess, Respond, Evaluate' },
    { num: 5, title: 'แรงกดดันจากเพื่อนและคนรอบข้าง', desc: 'ทำความเข้าใจแรงกดดันทางตรงและทางอ้อม' },
    { num: 6, title: '5 วิธีการปฏิเสธอย่างปลอดภัย', desc: 'ฝึกการตอบปฏิเสธอย่างมั่นใจและรักษาสัมพันธภาพ' },
    { num: 7, title: 'การจัดการกับความเครียดและอารมณ์โกรธ', desc: 'วิธีระบายความเครียดเชิงบวกโดยไม่พึ่งพาสารเสพติด' },
    { num: 8, title: 'การสื่อสารอย่างมั่นใจและเด็ดขาด', desc: 'ภาษาท่าทาง นัยน์ตา และน้ำเสียงเพื่อแสดงจุดยืน' },
    { num: 9, title: 'การช่วยเหลือผู้อื่นและการเป็นแบบอย่าง', desc: 'บทบาทของแกนนำเยาวชนในการปกป้องเพื่อนร่วมโรงเรียน' },
    { num: 10, title: 'พิธีมอบสัมฤทธิบัตรและการปฏิญาณตน', desc: 'สรุปการเรียนรู้และความภาคภูมิใจในการเป็นนักเรียน D.A.R.E.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="bg-[#32145C] text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#FFE082] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#D6B15E]" />
            <span>ประวัติและหลักสูตร D.A.R.E. ประเทศไทย</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            โครงการครู D.A.R.E. กองบัญชาการตำรวจตระเวนชายแดน
          </h1>
          <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed font-light">
            Drug Abuse Resistance Education (D.A.R.E.) เป็นโครงการระดับสากลที่นำตำรวจมาฝึกอบรมเป็นวิทยากรผู้สอน
            เพื่อถ่ายทอดทักษะการตัดสินใจและภูมิคุ้มกันทางจิตใจให้แก่นักเรียนระดับประถมศึกษาในพื้นที่ห่างไกลและแนวชายแดน
          </p>
        </div>
      </div>

      {/* Origin & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#5B2A86] uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>พันธกิจและเป้าหมาย</span>
          </div>
          <h2 className="text-2xl font-bold text-[#211A2B]">
            ทำไมต้องเป็นตำรวจตระเวนชายแดน?
          </h2>
          <p className="text-sm text-[#756B80] leading-relaxed">
            กองบัญชาการตำรวจตระเวนชายแดน (บช.ตชด.) มีโรงเรียนตำรวจตระเวนชายแดนตั้งอยู่ในถิ่นทุรกันดารตามแนวตะเข็บชายแดน 
            ซึ่งมักเป็นเส้นทางผ่านหรือจุดพักของขบวนการค้ายาเสพติด การให้ความรู้เชิงป้องกันจึงเป็น "กำแพงมนุษย์" ที่มั่นคงที่สุด
          </p>
          <div className="space-y-2 pt-2">
            {[
              'ป้องกันกลุ่มเสี่ยงเด็กและเยาวชนก่อนที่จะเริ่มทดลองสารเสพติด',
              'สร้างทักษะการปฏิเสธคำชักชวนของเพื่อนและผู้ไม่หวังดี',
              'สร้างความไว้วางใจระหว่างเด็กนักเรียนและเจ้าหน้าที่ตำรวจผู้พิทักษ์สันติราษฎร์',
              'สนับสนุนนโยบายสถานศึกษาสีขาว ปลอดยาเสพติดและอบายมุข',
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#211A2B]">
                <CheckCircle className="w-4 h-4 text-[#168A62] shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E7E0EF] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E0EF]">
            <BppLogo className="h-10" />
            <DareLogo className="h-8" />
          </div>
          <div className="space-y-3 text-xs text-[#756B80] leading-relaxed">
            <p>
              โครงการ D.A.R.E. ประเทศไทย เริ่มต้นอย่างเป็นทางการตั้งแต่ปี พ.ศ. 2542 โดยความร่วมมือระหว่างสำนักงานตำรวจแห่งชาติ 
              สำนักงาน ป.ป.ส. และ D.A.R.E. America
            </p>
            <p>
              สำหรับ บช.ตชด. ได้จัดสรรข้าราชการตำรวจเข้ารับการฝึกอบรมเป็นครู D.A.R.E. อย่างต่อเนื่อง 
              โดยใช้เทคนิคการสอนแบบ Active Learning การจำลองสถานการณ์ (Role Playing) และการทำงานกลุ่ม
            </p>
          </div>
        </div>
      </div>

      {/* 10 Standard Lessons */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-[#32145C]">
            โครงสร้างหลักสูตร 10 สัปดาห์
          </h2>
          <p className="text-xs text-[#756B80]">
            ครูตำรวจ D.A.R.E. จะเข้าทำการสอนสัปดาห์ละ 1 ชั่วโมง รวม 10 สัปดาห์ต่อภาคการศึกษา
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lessons.map((lesson) => (
            <div
              key={lesson.num}
              className="bg-white p-4 rounded-xl border border-[#E7E0EF] flex items-start gap-3 shadow-2xs hover:border-[#5B2A86] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F2ECFA] text-[#5B2A86] font-bold flex items-center justify-center shrink-0 text-xs">
                {lesson.num}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-[#211A2B]">{lesson.title}</h3>
                <p className="text-[11px] text-[#756B80]">{lesson.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

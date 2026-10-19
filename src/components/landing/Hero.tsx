import { motion } from 'motion/react';
import { ArrowRight, BookOpen, GraduationCap, Newspaper, Play, Search, ShieldCheck, Users, UserRound, ChevronRight, Lightbulb, Ban, Shield, Menu } from 'lucide-react';
import { HeroNavbar } from './Navbar';

interface HeroProps {
  onNavigate: (tab: string) => void;
  onGoToAdmin: () => void;
}

const stats = [
  { label: 'โรงเรียนที่เข้าร่วมโครงการ', value: '368', unit: 'แห่ง ทั่วประเทศ', icon: GraduationCap, color: 'violet', tab: 'schools' },
  { label: 'ครู D.A.R.E.', value: '250', unit: 'นาย / นาง / คน', icon: Users, color: 'red', tab: 'schools' },
  { label: 'นักเรียนที่ได้รับความรู้', value: '490', unit: 'คน', icon: UserRound, color: 'blue', tab: 'about' },
  { label: 'ข่าวและสื่อ', value: '3', unit: 'รายการข่าวและสื่อ', icon: Newspaper, color: 'gold', tab: 'activities' },
];

const learning = [
  { title: 'รู้เท่าทันยาเสพติด', desc: 'เรียนรู้พิษภัยของยาเสพติด และวิธีป้องกันตนเอง', icon: Ban, color: 'red', image: '/images/dare-purple-police-elephant.webp', tab: 'knowledge' },
  { title: 'ทักษะชีวิต', desc: 'เสริมสร้างความมั่นใจ การตัดสินใจ และการแก้ปัญหา', icon: Lightbulb, color: 'blue', image: '/images/dare-purple-police-elephant.webp', tab: 'knowledge' },
  { title: 'กล้าปฏิเสธอย่างมั่นใจ', desc: 'เลือกสิ่งที่ดีให้กับตัวเองและเพื่อน ๆ', icon: Shield, color: 'gold', image: '/images/dare-purple-police-elephant.webp', tab: 'knowledge' },
];

export function Hero({ onNavigate, onGoToAdmin }: HeroProps) {
  return (
    <div className="dare-home">
      <section className="dare-home-hero">
        <img src="/images/dare-school-background.webp" alt="โรงเรียนไทยท่ามกลางธรรมชาติ เป็นพื้นที่แห่งการเรียนรู้ของเด็กไทย" className="dare-home-bg" />
        <div className="dare-home-shade" />
        <HeroNavbar onNavigate={onNavigate} onGoToAdmin={onGoToAdmin} />
        <div className="dare-home-copy">
          <motion.div className="dare-home-kicker" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .55 }}>
            <span />โครงการการศึกษาเพื่อการป้องกันยาเสพติด
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, delay: .12 }}>
            สร้างภูมิคุ้มกันให้เด็กไทย
            <strong>เติบโตอย่างมั่นใจ</strong>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .25 }}>
            D.A.R.E. สอนให้เด็กและเยาวชนรู้เท่าทันยาเสพติด<br className="desktop-break" />
            มีทักษะชีวิต และสามารถเลือกเส้นทางที่ปลอดภัยให้กับตัวเอง
          </motion.p>
          <motion.div className="dare-home-actions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .38 }}>
            <button className="dare-primary-cta" onClick={() => onNavigate('about')}>รู้จักโครงการ D.A.R.E. <ChevronRight size={20} /></button>
            <button className="dare-video-cta" onClick={() => onNavigate('knowledge')}><span><Play size={15} fill="currentColor" /></span> ชมวิดีโอแนะนำ</button>
          </motion.div>
        </div>
        <motion.img src="/images/dare-purple-police-elephant.webp" alt="มาสคอตช้างตำรวจ D.A.R.E. พร้อมเด็กนักเรียน" className="dare-home-mascot" initial={{ opacity: 0, y: 24, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .9, delay: .2 }} />
        <div className="dare-home-slogan">เด็กไทย<br/>คิดเป็น<br/>เลือกได้<br/><b>ไปได้ไกล</b><span>↗</span></div>
      </section>

      <section className="dare-home-content">
        <div className="dare-home-stats" aria-label="สถิติโครงการ D.A.R.E.">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return <motion.button key={stat.label} className={`dare-stat-card ${stat.color}`} onClick={() => onNavigate(stat.tab)} whileHover={{ y: -5, scale: 1.015 }} whileTap={{ scale: .99 }} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, delay: .08 * i }}>
              <span className="dare-stat-icon"><Icon size={32} strokeWidth={1.8}/></span>
              <span className="dare-stat-text"><span className="dare-stat-label">{stat.label}</span><strong>{stat.value}</strong><small>{stat.unit}</small></span>
              <span className="dare-stat-arrow"><ChevronRight size={20}/></span>
            </motion.button>
          })}
        </div>

        <motion.button
          type="button"
          className="dare-learning-artwork"
          onClick={() => onNavigate('knowledge')}
          whileHover={{ y: -3, scale: 1.003 }}
          whileTap={{ scale: .995 }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .55, delay: .12 }}
          aria-label="เรียนรู้กับ D.A.R.E. ทั้ง 3 หัวข้อ: รู้เท่าทันยาเสพติด ทักษะชีวิต และกล้าปฏิเสธอย่างมั่นใจ"
        >
          <img
            src="/images/dare-learning-topics-banner.webp"
            alt="เรียนรู้กับ D.A.R.E. — รู้เท่าทันยาเสพติด ทักษะชีวิต และกล้าปฏิเสธอย่างมั่นใจ ด้วยภาพประกอบช้างครู D.A.R.E. และเด็กนักเรียน"
            loading="lazy"
          />
        </motion.button>
        <div className="dare-home-footnote"><ShieldCheck size={17}/> ดำเนินโครงการโดยตำรวจตระเวนชายแดน เพื่อสร้างภูมิคุ้มกันและทักษะชีวิตให้เด็กไทย</div>
      </section>
    </div>
  );
}

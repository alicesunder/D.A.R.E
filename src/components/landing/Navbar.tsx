import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronDown, Home, Menu, Search, UserRound, X } from 'lucide-react';

interface HeroNavbarProps {
  onNavigate: (tab: string) => void;
  onGoToAdmin: () => void;
}

export function HeroNavbar({ onNavigate, onGoToAdmin }: HeroNavbarProps) {
  const [open, setOpen] = useState(false);
  const links = [
    { label: 'หน้าแรก', tab: 'home', home: true },
    { label: 'รู้จัก D.A.R.E.', tab: 'about' },
    { label: 'หลักสูตร', tab: 'knowledge' },
    { label: 'ข่าวสาร', tab: 'activities' },
    { label: 'เครือข่ายโรงเรียน', tab: 'schools' },
    { label: 'สื่อความรู้', tab: 'knowledge' },
  ];
  const navigate = (tab: string) => { onNavigate(tab); setOpen(false); };
  return (
    <nav className="dare-home-nav">
      <button className="dare-home-brand" onClick={() => navigate('home')} aria-label="D.A.R.E. Thailand หน้าแรก">
        <img src="/images/bpp-dare-logo-pair.webp" alt="ตำรวจตระเวนชายแดน และ D.A.R.E. Thailand"/>
      </button>
      <div className="dare-home-nav-links">
        {links.map(link => <button key={link.label} onClick={() => navigate(link.tab)} className={link.home ? 'active' : ''}>{link.home && <Home size={15} fill="currentColor"/>}{link.label}</button>)}
      </div>
      <div className="dare-home-nav-actions">
        <button className="dare-search-btn" aria-label="ค้นหา" onClick={() => navigate('knowledge')}><Search size={22}/></button>
        <motion.button whileHover={{ scale: 1.025 }} whileTap={{ scale: .98 }} className="dare-login-btn" onClick={onGoToAdmin}><UserRound size={21}/> <span>เข้าสู่ระบบ</span><ArrowRight size={19}/></motion.button>
        <button className="dare-mobile-menu" onClick={() => setOpen(v => !v)} aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'}>{open ? <X/> : <Menu/>}</button>
      </div>
      {open && <div className="dare-mobile-nav">{links.map(link => <button key={link.label} onClick={() => navigate(link.tab)}>{link.label}<ArrowRight size={16}/></button>)}<button onClick={() => { onGoToAdmin(); setOpen(false); }}>เข้าสู่ระบบเจ้าหน้าที่<ArrowRight size={16}/></button></div>}
    </nav>
  );
}

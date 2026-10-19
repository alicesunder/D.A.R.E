import { motion } from 'motion/react';
import { ArrowUpRight, ChevronRight } from 'lucide-react';

export function BottomRightCorner({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="dare-hero-bottom-right">
      <div className="pointer-events-none absolute -top-6 right-0 h-6 w-6 sm:-top-8 sm:h-8 sm:w-8 md:-top-14 md:h-14 md:w-14"><svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z" fill="#f0f0f0" /></svg></div>
      <div className="pointer-events-none absolute bottom-0 -left-6 h-6 w-6 sm:-left-8 sm:h-8 sm:w-8 md:-left-14 md:h-14 md:w-14"><svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M56 56H0C30.9279 56 56 30.9279 56 0V56Z" fill="#f0f0f0" /></svg></div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e325a]/10 bg-[#1e325a]/5 md:h-14 md:w-14"><ArrowUpRight className="h-5 w-5 text-[#1e325a]/80 md:h-6 md:w-6" /></div>
      <button onClick={() => onNavigate('knowledge')} className="group text-left">
        <div className="text-sm font-medium text-[#1e325a] md:text-xl">คลังความรู้ D.A.R.E.</div>
        <div className="flex items-center gap-1 text-[#1e325a]/60 transition-colors group-hover:text-[#1e325a]/90"><span className="text-xs md:text-sm">สื่อการเรียนรู้สำหรับนักเรียน</span><ChevronRight className="h-4 w-4" /></div>
      </button>
    </motion.div>
  );
}

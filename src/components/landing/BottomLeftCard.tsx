import { motion } from 'motion/react';
import { ArrowUpRight, BookOpen } from 'lucide-react';

export function BottomLeftCard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="dare-hero-bottom-left">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/55 text-[#28375e] md:h-12 md:w-12"><BookOpen className="h-5 w-5 md:h-6 md:w-6" /></div>
        <div className="min-w-0"><div className="text-xl font-semibold tracking-tight text-[#1e325a] md:text-2xl">เรียนรู้เพื่ออนาคต</div><div className="text-[10px] uppercase tracking-wider text-[#1e325a]/70 md:text-xs">Good Choices · Bright Future</div></div>
      </div>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onNavigate('knowledge')} className="mt-3 flex items-center gap-2 self-start rounded-full bg-white py-1.5 pl-1.5 pr-4 text-[#1e325a] shadow-sm transition hover:bg-white/90 md:mt-4 md:pr-5">
        <span className="rounded-full bg-[#1e325a]/10 p-1"><ArrowUpRight className="h-4 w-4" /></span><span className="text-xs font-medium md:text-sm">สำรวจคลังความรู้</span>
      </motion.button>
    </motion.div>
  );
}

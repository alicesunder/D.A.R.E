import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export function HeroBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="dare-hero-badge"
    >
      <Sparkles className="h-4 w-4 text-violet-900" />
      <span>โครงการ D.A.R.E. THAILAND</span>
    </motion.div>
  );
}

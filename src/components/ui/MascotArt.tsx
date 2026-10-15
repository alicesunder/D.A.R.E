import React from 'react';

/**
 * 3D-styled Cartoon Mascot: ครูช้าง ตชด. D.A.R.E. (Police Elephant Mascot)
 * Features official BPP beret, uniform, friendly smile, and D.A.R.E. insignia
 */
export const DareElephantMascot: React.FC<{ className?: string; size?: number }> = ({ 
  className = "w-28 h-28", 
  size 
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`} style={size ? { width: size, height: size } : undefined}>
      <svg viewBox="0 0 240 240" className="w-full h-full overflow-visible drop-shadow-md">
        <defs>
          {/* Gradients for 3D elephant effect */}
          <radialGradient id="elephantSkinGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="40%" stopColor="#A78BFA" />
            <stop offset="85%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#5B21B6" />
          </radialGradient>
          <radialGradient id="elephantEarInner" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FBCFE8" />
            <stop offset="70%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#DB2777" />
          </radialGradient>
          <linearGradient id="beretGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="50%" stopColor="#1F2937" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
          <linearGradient id="uniformGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="70%" stopColor="#1F2937" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
          <radialGradient id="eyePupil" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#1F2937" />
            <stop offset="80%" stopColor="#030712" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <filter id="shadow3D" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* 1. Large Fluffy Ears Behind */}
        {/* Left Ear */}
        <ellipse cx="50" cy="100" rx="36" ry="46" fill="url(#elephantSkinGrad)" transform="rotate(-15 50 100)" />
        <ellipse cx="52" cy="100" rx="22" ry="32" fill="url(#elephantEarInner)" transform="rotate(-15 52 100)" opacity="0.85" />
        {/* Right Ear */}
        <ellipse cx="190" cy="100" rx="36" ry="46" fill="url(#elephantSkinGrad)" transform="rotate(15 190 100)" />
        <ellipse cx="188" cy="100" rx="22" ry="32" fill="url(#elephantEarInner)" transform="rotate(15 188 100)" opacity="0.85" />

        {/* 2. Police Uniform Body (ตชด. Dark Gray/Navy Uniform) */}
        <g id="body">
          <path d="M 65 180 C 65 155, 95 150, 120 150 C 145 150, 175 155, 175 180 L 185 235 C 185 240, 55 240, 55 235 Z" fill="url(#uniformGrad)" filter="url(#shadow3D)" />
          {/* Uniform Collar */}
          <path d="M 95 155 L 120 180 L 85 175 Z" fill="#4B5563" />
          <path d="M 145 155 L 120 180 L 155 175 Z" fill="#4B5563" />
          {/* Red Tie / Trim */}
          <path d="M 115 175 L 125 175 L 123 210 L 117 210 Z" fill="#EF4444" />
          {/* Name Tag "ครู ตชด." */}
          <rect x="75" y="190" width="34" height="12" rx="3" fill="#000000" stroke="#D6B15E" strokeWidth="1" />
          <text x="92" y="199" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ครู ตชด.</text>
          {/* D.A.R.E. Badge on chest */}
          <rect x="135" y="190" width="28" height="12" rx="3" fill="#DC2626" />
          <text x="149" y="199" fill="#FFFFFF" fontSize="6.5" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">D.A.R.E.</text>
        </g>

        {/* 3. Elephant Head */}
        <g id="head" filter="url(#shadow3D)">
          <ellipse cx="120" cy="115" rx="56" ry="50" fill="url(#elephantSkinGrad)" />
          {/* Cheeks */}
          <circle cx="82" cy="132" r="12" fill="#F472B6" opacity="0.4" />
          <circle cx="158" cy="132" r="12" fill="#F472B6" opacity="0.4" />

          {/* Big Cartoon Eyes */}
          {/* Left Eye */}
          <ellipse cx="96" cy="104" rx="14" ry="17" fill="#FFFFFF" />
          <ellipse cx="98" cy="104" rx="9" ry="12" fill="url(#eyePupil)" />
          <circle cx="94" cy="98" r="4" fill="#FFFFFF" />
          <circle cx="102" cy="108" r="1.8" fill="#FFFFFF" />

          {/* Right Eye */}
          <ellipse cx="144" cy="104" rx="14" ry="17" fill="#FFFFFF" />
          <ellipse cx="142" cy="104" rx="9" ry="12" fill="url(#eyePupil)" />
          <circle cx="138" cy="98" r="4" fill="#FFFFFF" />
          <circle cx="146" cy="108" r="1.8" fill="#FFFFFF" />

          {/* Friendly Smile Behind Trunk */}
          <path d="M 100 138 Q 120 156 140 138" stroke="#4C1D95" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Elephant Trunk (งวงช้าง ยิ้มชูขึ้นน่ารัก) */}
          <path 
            d="M 112 122 
               C 110 135, 108 152, 114 162 
               C 120 172, 138 174, 144 165 
               C 148 158, 144 150, 138 150 
               C 132 150, 126 156, 124 152 
               C 122 144, 124 135, 128 122 Z" 
            fill="url(#elephantSkinGrad)" 
            stroke="#6D28D9" 
            strokeWidth="1.5"
          />
          {/* Cute Tusks (งาช้างน้อยสีขาว) */}
          <path d="M 104 140 C 98 144, 98 152, 106 148 Z" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M 136 140 C 142 144, 142 152, 134 148 Z" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
        </g>

        {/* 4. Official Police Beret (หมวกเบเรต์ ตชด. สีดำ มีตราหน้าหมวก) */}
        <g id="beret" filter="url(#shadow3D)">
          {/* Beret slouch to the right */}
          <path 
            d="M 70 82 
               C 65 62, 85 45, 120 45 
               C 160 45, 185 55, 180 75 
               C 178 82, 160 88, 120 86 
               C 85 85, 75 88, 70 82 Z" 
            fill="url(#beretGrad)" 
          />
          {/* Beret Rim/Band */}
          <path 
            d="M 80 82 
               C 95 86, 145 86, 162 80 
               C 163 83, 145 89, 80 85 Z" 
            fill="#111827" 
          />
          {/* Gold Police Emblem on Beret */}
          <circle cx="102" cy="68" r="8" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
          <polygon points="102,62 104,66 108,66 105,69 106,73 102,70 98,73 99,69 96,66 100,66" fill="#FEF08A" />
        </g>
      </svg>
    </div>
  );
};

/**
 * Sidebar Mascot Badge: ครูช้าง ตชด. + Red D.A.R.E. Banner + "GOOD CHOICES BRIGHTER FUTURE"
 */
export const SidebarMascotCard: React.FC = () => {
  return (
    <div className="relative mt-auto pt-4 px-3 pb-3">
      <div className="relative rounded-2xl bg-gradient-to-b from-[#2D165B] to-[#180A33] border border-purple-500/30 p-3 text-center overflow-hidden shadow-lg">
        {/* Soft Background glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 bg-[#7C3AED]/30 rounded-full blur-xl pointer-events-none" />

        {/* Mascot Avatar */}
        <div className="relative z-10 flex justify-center -mt-2 mb-1">
          <DareElephantMascot size={96} />
        </div>

        {/* Red D.A.R.E. Ribbon */}
        <div className="relative z-10 -mt-2">
          <span className="inline-block px-3 py-1 rounded-md bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white font-black text-xs tracking-wider shadow-md transform -rotate-1">
            D.A.R.E.
          </span>
          <div className="text-[10px] text-purple-200 font-bold uppercase tracking-widest mt-0.5">
            THAILAND
          </div>
        </div>

        {/* Motto slogan */}
        <div className="mt-2 pt-2 border-t border-purple-400/20 text-center">
          <div className="text-[11px] font-black text-[#FFE082] uppercase tracking-wide leading-tight">
            GOOD CHOICES
          </div>
          <div className="text-[10px] font-bold text-white uppercase tracking-wider">
            BRIGHTER FUTURE
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

/**
 * Authentic D.A.R.E. THAILAND Official Logo (ธงไตรรงค์และริบบิ้นสีขาว)
 * Directly matches the official insignia provided by the organization
 */
export const DareLogo: React.FC<{ className?: string; size?: number; variant?: 'color' | 'monochrome' }> = ({ 
  className = "h-11", 
  size,
}) => {
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg 
        viewBox="0 0 540 310" 
        className="h-full w-auto overflow-visible select-none drop-shadow-sm"
        style={size ? { height: `${size}px` } : undefined}
      >
        <defs>
          <filter id="logoShadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="1.5" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.3" />
          </filter>
          <filter id="dareTextShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="3" dy="4" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.85" />
          </filter>
          <linearGradient id="whiteRibbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="80%" stopColor="#F8F8FC" />
            <stop offset="100%" stopColor="#E9E9F0" />
          </linearGradient>
          <linearGradient id="innerLoopGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7A0C14" />
            <stop offset="50%" stopColor="#AD141E" />
            <stop offset="100%" stopColor="#D61C27" />
          </linearGradient>
        </defs>

        {/* 1. BACK FOLD OF THAI FLAG (Top Left Wave) */}
        <g id="thaiFlagWave">
          {/* Red Stripe Top */}
          <path d="M 45 130 C 45 70, 100 25, 230 25 C 275 25, 315 45, 330 90 C 295 80, 245 80, 215 95 C 130 95, 80 115, 45 130 Z" fill="#D61C27" />
          {/* White Stripe 1 */}
          <path d="M 42 165 C 50 120, 110 50, 230 50 C 285 50, 310 75, 325 105 C 285 92, 230 90, 195 105 C 120 105, 75 140, 42 165 Z" fill="#FFFFFF" />
          {/* Blue Center Stripe (Royal Blue) */}
          <path d="M 38 215 C 45 170, 95 90, 220 90 C 275 90, 305 105, 318 125 C 265 110, 210 115, 175 130 C 105 130, 65 185, 38 215 Z" fill="#1C2B78" />
          {/* White Stripe 2 */}
          <path d="M 34 245 C 40 210, 80 145, 185 145 C 235 145, 275 150, 295 160 C 245 145, 190 145, 155 165 C 95 165, 55 220, 34 245 Z" fill="#FFFFFF" />
          {/* Red Bottom Stripe */}
          <path d="M 30 270 C 35 240, 70 185, 155 185 C 200 185, 245 185, 265 190 C 220 180, 170 180, 135 200 C 75 205, 45 255, 30 270 Z" fill="#D61C27" />
        </g>

        {/* 2. RIBBON 3D INNER ROLL / LOOP */}
        <g id="ribbonLoop">
          <path d="M 330 90 C 330 115, 315 135, 275 150 C 235 165, 185 170, 130 170 C 120 170, 115 165, 125 150 C 150 115, 210 95, 290 85 C 315 82, 330 85, 330 90 Z" fill="url(#innerLoopGrad)" />
          <path d="M 315 105 C 315 125, 280 145, 225 158 C 170 170, 140 172, 125 172 C 120 172, 118 168, 124 158 C 145 125, 195 108, 270 98 C 295 95, 310 100, 315 105 Z" fill="#FFFFFF" opacity="0.9" />
        </g>

        {/* 3. MAIN FOREGROUND WHITE SCROLL / BANNER */}
        <g id="mainBanner" filter="url(#logoShadow)">
          {/* Main White Scroll Surface */}
          <path d="M 125 120 
                   C 170 100, 235 90, 310 95 
                   C 385 100, 460 115, 505 105 
                   C 505 155, 495 210, 485 248 
                   C 435 255, 350 250, 255 272 
                   C 185 288, 135 295, 118 290 
                   C 112 288, 118 260, 125 210 
                   Z" 
                fill="url(#whiteRibbonGrad)" 
                stroke="#EAEAEA" 
                strokeWidth="1.5" />

          {/* Top Red Trim Line */}
          <path d="M 125 120 
                   C 170 100, 235 90, 310 95 
                   C 385 100, 460 115, 505 105 
                   L 508 122 
                   C 460 130, 385 116, 310 111 
                   C 235 106, 170 116, 125 136 
                   Z" 
                fill="#D61C27" />

          {/* Bottom Red Trim Line */}
          <path d="M 118 274 
                   C 145 278, 195 270, 255 255 
                   C 350 232, 435 237, 485 230 
                   L 485 250 
                   C 435 257, 350 252, 255 275 
                   C 185 291, 135 298, 118 292 
                   Z" 
                fill="#D61C27" />
        </g>

        {/* 4. "D.A.R.E." BRUSH-STYLE RED LETTERING WITH BLACK SHADOW */}
        <g id="dareLettering" filter="url(#dareTextShadow)">
          <text x="185" y="245"
                fontFamily="'Impact', 'Arial Black', sans-serif"
                fontWeight="900"
                fontStyle="italic"
                fontSize="118"
                letterSpacing="5"
                fill="#E01E2B"
                stroke="#8A0C16"
                strokeWidth="2"
                transform="rotate(-5 200 220)">
            D.A.R.E.
          </text>
        </g>

        {/* 5. "THAILAND" CURVING BLUE TEXT */}
        <g id="thailandLettering">
          <text x="255" y="268"
                fontFamily="'Arial Black', 'Impact', sans-serif"
                fontWeight="900"
                fontSize="21"
                letterSpacing="5"
                fill="#1C2B78"
                transform="rotate(-4 255 268)">
            THAILAND
          </text>
        </g>
      </svg>
    </div>
  );
};

/**
 * Border Patrol Police Thailand Emblem (ตราสัญลักษณ์ บช.ตชด.)
 */
export const BppLogo: React.FC<{ className?: string; size?: number }> = ({ 
  className = "h-11", 
  size 
}) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg 
        viewBox="0 0 100 110" 
        className="h-full w-auto select-none"
        style={size ? { height: `${size}px` } : undefined}
      >
        <defs>
          <linearGradient id="bppShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#32145C" />
            <stop offset="50%" stopColor="#5B2A86" />
            <stop offset="100%" stopColor="#250E42" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="50%" stopColor="#D6B15E" />
            <stop offset="100%" stopColor="#A8822B" />
          </linearGradient>
        </defs>

        {/* Outer Shield with Gold Rim */}
        <path
          d="M50 5 L88 20 C88 65 65 92 50 105 C35 92 12 65 12 20 Z"
          fill="url(#goldGrad)"
          stroke="#8C6B1F"
          strokeWidth="1.5"
        />

        {/* Inner Shield Purple */}
        <path
          d="M50 10 L83 23 C83 62 62 87 50 98 C38 87 17 62 17 23 Z"
          fill="url(#bppShieldGrad)"
          stroke="#FFE082"
          strokeWidth="1"
        />

        {/* Royal Police Star (เข็ม/ดาวตำรวจแปดแฉก) */}
        <g transform="translate(50, 48) scale(0.85)">
          {/* Star rays */}
          <polygon 
            points="0,-28 7,-10 26,-10 11,2 17,20 0,9 -17,20 -11,2 -26,-10 -7,-10" 
            fill="url(#goldGrad)" 
            stroke="#8C6B1F" 
            strokeWidth="0.8"
          />
          {/* Center Chakra / Disc */}
          <circle cx="0" cy="0" r="10" fill="#B30E1A" stroke="#FFE082" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="5" fill="#FFE082" />
        </g>

        {/* Thai BPP Ribbon at Bottom */}
        <path
          d="M20 90 Q50 82 80 90 L85 100 Q50 92 15 100 Z"
          fill="#D6B15E"
          stroke="#684D0D"
          strokeWidth="0.8"
        />
        <text
          x="50"
          y="95"
          fill="#211A2B"
          fontFamily="'Sarabun', 'Prompt', sans-serif"
          fontWeight="bold"
          fontSize="6"
          textAnchor="middle"
        >
          บช.ตชด.
        </text>
      </svg>
    </div>
  );
};

/**
 * Combined Brand Header Component (D.A.R.E. THAILAND + BPP)
 */
export const BrandIdentity: React.FC<{ 
  variant?: 'light' | 'dark';
  subtitle?: boolean;
}> = ({ variant = 'light', subtitle = true }) => {
  const isLight = variant === 'light';

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 shrink-0">
        <BppLogo className="h-10 sm:h-11 w-auto" />
        <div className="h-8 w-px bg-purple-300/30 hidden sm:block" />
        <div className="p-0.5 rounded-lg bg-white/10 backdrop-blur-xs">
          <DareLogo className="h-9 sm:h-10 w-auto" />
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className={`font-bold tracking-tight text-sm sm:text-base ${isLight ? 'text-white' : 'text-[#32145C]'}`}>
            D.A.R.E. COMMAND CENTER
          </span>
          <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#D6B15E]/20 text-[#D6B15E] border border-[#D6B15E]/40">
            บช.ตชด.
          </span>
        </div>
        {subtitle && (
          <p className={`text-[11px] leading-tight truncate ${isLight ? 'text-purple-200' : 'text-[#756B80]'}`}>
            กองบัญชาการตำรวจตระเวนชายแดน
          </p>
        )}
      </div>
    </div>
  );
};

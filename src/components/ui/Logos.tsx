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
    <div className={`inline-flex items-center justify-center select-none ${className}`} style={size ? { height: `${size}px` } : undefined}>
      <img
        src="/images/dare-thailand-logo.webp"
        alt="D.A.R.E. Thailand"
        className="block h-full w-auto max-w-full object-contain"
        draggable={false}
      />
    </div>
  );
};

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

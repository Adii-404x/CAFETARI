import React from 'react';

interface CafetariLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'responsive';
  showSubtitle?: boolean;
  subtitleText?: string;
  iconOnly?: boolean;
  framed?: boolean;
  variant?: 'gold' | 'purple' | 'white' | 'adaptive';
}

export const CafetariLogo: React.FC<CafetariLogoProps> = ({
  className = '',
  size = 'responsive',
  showSubtitle = false,
  subtitleText = 'INDIYA • Floor 4th',
  iconOnly = false,
  framed = true,
  variant = 'gold'
}) => {
  // Brand color definition from the new golden-caramel logo
  const goldPrimary = '#CAA16A'; // Authentic golden caramel from official logo
  const goldSecondary = '#B88F58';
  const goldLight = '#DFBA85';

  const isWhite = variant === 'white';
  const isPurple = variant === 'purple';
  
  const strokeColor = isWhite ? '#ffffff' : isPurple ? '#7c3aed' : goldPrimary;
  const textColor = isWhite ? '#ffffff' : isPurple ? '#4a154b' : goldPrimary;
  const badgeBorderColor = isWhite ? 'rgba(255,255,255,0.7)' : isPurple ? 'rgba(124,58,237,0.5)' : goldPrimary;

  // Sizing scale configurations
  const scaleMap = {
    xs: {
      height: 28,
      iconW: 24,
      iconH: 18,
      textSize: 'text-xs',
      badgePadding: 'px-2 py-0.5',
      rounded: 'rounded-xl',
      borderW: 'border-[1.5px]'
    },
    sm: {
      height: 34,
      iconW: 30,
      iconH: 22,
      textSize: 'text-sm',
      badgePadding: 'px-2.5 py-1',
      rounded: 'rounded-2xl',
      borderW: 'border-[2px]'
    },
    md: {
      height: 44,
      iconW: 38,
      iconH: 28,
      textSize: 'text-base sm:text-lg',
      badgePadding: 'px-3.5 py-1.5',
      rounded: 'rounded-2xl',
      borderW: 'border-[2px]'
    },
    lg: {
      height: 54,
      iconW: 48,
      iconH: 36,
      textSize: 'text-xl sm:text-2xl',
      badgePadding: 'px-4 py-2',
      rounded: 'rounded-3xl',
      borderW: 'border-[2.5px]'
    },
    xl: {
      height: 70,
      iconW: 62,
      iconH: 46,
      textSize: 'text-3xl sm:text-4xl',
      badgePadding: 'px-6 py-3',
      rounded: 'rounded-3xl',
      borderW: 'border-[3px]'
    },
    responsive: {
      height: 38,
      iconW: 32,
      iconH: 24,
      textSize: 'text-sm sm:text-base md:text-lg',
      badgePadding: 'px-2.5 sm:px-3.5 py-1 sm:py-1.5',
      rounded: 'rounded-2xl sm:rounded-3xl',
      borderW: 'border-[2px]'
    }
  }[size];

  // Precision Graduation Cap SVG based on official Cafetari mark
  const GraduationCapSvg = (
    <svg
      viewBox="0 0 100 75"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: `${scaleMap.iconW}px`, height: `${scaleMap.iconH}px` }}
      className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      aria-hidden="true"
    >
      {/* Mortarboard Diamond Top */}
      <path
        d="M50 12 L88 28 L50 44 L12 28 Z"
        stroke={strokeColor}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Skull Cap Base Arc */}
      <path
        d="M26 36 V48 C26 58 74 58 74 48 V36"
        stroke={strokeColor}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Tassel Draped over Right Side */}
      <path
        d="M50 28 Q 78 30, 84 38 Q 88 44, 82 52 Q 86 60, 83 66"
        stroke={strokeColor}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Tassel End Drop Accent */}
      <circle
        cx="83"
        cy="66"
        r="3.5"
        fill={strokeColor}
      />
    </svg>
  );

  return (
    <div className={`inline-flex flex-col select-none shrink-0 ${className}`}>
      {/* Main Logo Container (Framed Pill Badge or Frameless) */}
      <div
        className={`inline-flex items-center space-x-2 sm:space-x-3 transition-all duration-200 ${
          framed
            ? `${scaleMap.badgePadding} ${scaleMap.rounded} ${scaleMap.borderW} bg-white/90 dark:bg-slate-900/90 shadow-xs hover:shadow-sm`
            : ''
        }`}
        style={framed ? { borderColor: badgeBorderColor } : undefined}
      >
        {/* Graduation Cap Emblem */}
        {GraduationCapSvg}

        {/* Wordmark: Cafetari */}
        {!iconOnly && (
          <span
            className={`${scaleMap.textSize} font-bold tracking-tight leading-none`}
            style={{
              color: textColor,
              fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              letterSpacing: '-0.01em'
            }}
          >
            Cafetari
          </span>
        )}
      </div>

      {/* Optional Subtitle */}
      {showSubtitle && !iconOnly && (
        <div className="flex items-center space-x-1 mt-1 px-1">
          <span
            className={`text-[9px] sm:text-[10px] tracking-wider uppercase font-extrabold whitespace-nowrap truncate ${
              isWhite ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {subtitleText}
          </span>
        </div>
      )}
    </div>
  );
};

import React from 'react';

interface CafetariLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'responsive';
  showSubtitle?: boolean;
  subtitleText?: string;
  iconOnly?: boolean;
  variant?: 'purple' | 'white';
}

export const CafetariLogo: React.FC<CafetariLogoProps> = ({
  className = '',
  size = 'responsive',
  showSubtitle = false,
  subtitleText = 'INDIYA • Floor 4th',
  iconOnly = false,
  variant = 'purple'
}) => {
  const isWhite = variant === 'white';
  const primaryColor = isWhite ? '#ffffff' : '#4a154b'; // Deep royal purple brand
  const capColor = isWhite ? '#e9d5ff' : '#7c3aed'; // Vibrant violet graduation cap
  const accentAColor = isWhite ? '#c084fc' : '#9333ea';

  // Responsive vs fixed size classes
  const isResponsive = size === 'responsive';

  const iconClasses = isResponsive
    ? 'w-7 h-5 sm:w-8 sm:h-6 md:w-9 md:h-7 shrink-0'
    : {
        xs: 'w-5 h-3.5 shrink-0',
        sm: 'w-6 h-4.5 shrink-0',
        md: 'w-8 h-6 shrink-0',
        lg: 'w-10 h-7.5 shrink-0',
        xl: 'w-14 h-10 shrink-0'
      }[size];

  const fontClasses = isResponsive
    ? 'text-base sm:text-lg md:text-xl font-black tracking-wider leading-tight whitespace-nowrap'
    : {
        xs: 'text-xs font-black tracking-wider leading-tight whitespace-nowrap',
        sm: 'text-sm font-black tracking-wider leading-tight whitespace-nowrap',
        md: 'text-lg md:text-xl font-black tracking-wider leading-tight whitespace-nowrap',
        lg: 'text-2xl font-black tracking-wider leading-tight whitespace-nowrap',
        xl: 'text-3xl font-black tracking-wider leading-tight whitespace-nowrap'
      }[size];

  const subtitleClasses = isResponsive
    ? 'text-[9px] sm:text-[10px] tracking-wider uppercase font-bold whitespace-nowrap truncate'
    : 'text-[10px] tracking-wider uppercase font-bold whitespace-nowrap truncate';

  return (
    <div className={`inline-flex items-center space-x-1.5 sm:space-x-2.5 select-none shrink-0 ${className}`}>
      {/* Brand Graduation Cap Emblem */}
      <svg
        viewBox="0 0 80 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconClasses} transition-transform duration-200 group-hover:scale-105`}
        aria-label="CAFETARI Graduation Cap Logo"
      >
        {/* Top diamond of mortarboard */}
        <polygon
          points="40,6 76,22 40,38 4,22"
          fill={isWhite ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.08)'}
          stroke={capColor}
          strokeWidth="6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Cap skull cap underlayer */}
        <path
          d="M18,29 V44 C18,44 26,52 40,52 C54,52 62,44 62,44 V29"
          fill="none"
          stroke={capColor}
          strokeWidth="5.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Tassel line & drop */}
        <path
          d="M74,23 L74,40 M71,40 H77 V46 H71 Z"
          stroke={capColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={capColor}
        />
      </svg>

      {/* Brand Wordmark: CAFETARI */}
      {!iconOnly && (
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center leading-none">
            <span
              className={fontClasses}
              style={{
                color: primaryColor,
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '0.06em'
              }}
            >
              <span className="text-purple-950">CAFE</span>
              <span style={{ color: accentAColor }}>T</span>
              <span className="text-purple-900">ARI</span>
            </span>
          </div>

          {showSubtitle && (
            <div className="flex items-center space-x-1 mt-0.5">
              <span
                className={`${subtitleClasses} ${
                  isWhite ? 'text-purple-200' : 'text-purple-700/80'
                }`}
              >
                {subtitleText}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


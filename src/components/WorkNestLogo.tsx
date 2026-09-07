import React, { useState } from 'react';

export const WORKNEST_LOGO_PATH = '/assets/branding/worknest-logo.png';
export const WORKNEST_LOGO_2X_PATH = '/assets/branding/worknest-logo-2x.png';
export const WORKNEST_LOGO_DARK_PATH = '/assets/branding/worknest-logo-dark.png';
export const WORKNEST_LOGO_DARK_2X_PATH = '/assets/branding/worknest-logo-dark-2x.png';

export const WORKNEST_ICON_PATH = '/assets/branding/worknest-icon.png';
export const WORKNEST_ICON_2X_PATH = '/assets/branding/worknest-icon-2x.png';
export const WORKNEST_ICON_DARK_PATH = '/assets/branding/worknest-icon-dark.png';
export const WORKNEST_ICON_DARK_2X_PATH = '/assets/branding/worknest-icon-dark-2x.png';

export interface WorkNestLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'mark-only' | 'stacked';
  showTagline?: boolean;
  className?: string;
  isDark?: boolean;
  alt?: string;
}

export const WorkNestLogo: React.FC<WorkNestLogoProps> = ({
  size = 'md',
  variant = 'full',
  showTagline = false,
  className = '',
  isDark,
  alt = 'WorkNest'
}) => {
  const [hasError, setHasError] = useState(false);

  const isIconOnly = variant === 'icon' || variant === 'mark-only';

  // Responsive size mappings tailored for full horizontal logos vs standalone icon marks
  const fullSizeMap = {
    xs: 'h-7 sm:h-8 max-w-[130px]',
    sm: 'h-9 sm:h-10 max-w-[170px]',
    md: 'h-12 sm:h-14 max-w-[230px]',
    lg: 'h-16 sm:h-20 max-w-[300px]',
    xl: 'h-24 sm:h-28 max-w-[380px]'
  };

  const iconSizeMap = {
    xs: 'h-6 w-6 sm:h-7 sm:w-7',
    sm: 'h-8 w-8 sm:h-9 sm:w-9',
    md: 'h-10 w-10 sm:h-12 sm:w-12',
    lg: 'h-14 w-14 sm:h-16 sm:w-16',
    xl: 'h-20 w-20 sm:h-24 sm:w-24'
  };

  const currentSizeClass = isIconOnly ? iconSizeMap[size] : fullSizeMap[size];

  const lightImgPath = isIconOnly ? WORKNEST_ICON_PATH : WORKNEST_LOGO_PATH;
  const lightImg2x = isIconOnly ? WORKNEST_ICON_2X_PATH : WORKNEST_LOGO_2X_PATH;
  const darkImgPath = isIconOnly ? WORKNEST_ICON_DARK_PATH : WORKNEST_LOGO_DARK_PATH;
  const darkImg2x = isIconOnly ? WORKNEST_ICON_DARK_2X_PATH : WORKNEST_LOGO_DARK_2X_PATH;

  if (hasError) {
    return (
      <div 
        id="worknest-logo-error-container"
        className="p-2 border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs rounded-lg font-bold flex items-center justify-center space-x-1.5"
        role="alert"
      >
        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
        <span>WorkNest</span>
      </div>
    );
  }

  // Explicit dark mode prop passed
  if (isDark === true) {
    return (
      <div 
        id="worknest-logo-container"
        className={`inline-flex items-center justify-center select-none ${className}`}
      >
        <img
          id="worknest-logo-img-dark-forced"
          src={darkImgPath}
          srcSet={`${darkImgPath} 1x, ${darkImg2x} 2x`}
          alt={alt}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className={`${currentSizeClass} w-auto object-contain transition-all duration-200 block drop-shadow-[0_0_14px_rgba(59,130,246,0.25)]`}
        />
      </div>
    );
  }

  // Explicit light mode prop passed
  if (isDark === false) {
    return (
      <div 
        id="worknest-logo-container"
        className={`inline-flex items-center justify-center select-none ${className}`}
      >
        <img
          id="worknest-logo-img-light-forced"
          src={lightImgPath}
          srcSet={`${lightImgPath} 1x, ${lightImg2x} 2x`}
          alt={alt}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className={`${currentSizeClass} w-auto object-contain transition-all duration-200 block`}
        />
      </div>
    );
  }

  // Automatic adaptive dark/light mode rendering via CSS classes
  return (
    <div 
      id="worknest-logo-container"
      className={`inline-flex items-center justify-center select-none ${className}`}
    >
      {/* Light Mode Logo (Visible in light mode, hidden in dark mode) */}
      <img
        id="worknest-logo-img-light"
        src={lightImgPath}
        srcSet={`${lightImgPath} 1x, ${lightImg2x} 2x`}
        alt={alt}
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`${currentSizeClass} w-auto object-contain transition-all duration-200 block dark:hidden`}
      />

      {/* Dark Mode Logo (Hidden in light mode, visible in dark mode with luminous glow) */}
      <img
        id="worknest-logo-img-dark"
        src={darkImgPath}
        srcSet={`${darkImgPath} 1x, ${darkImg2x} 2x`}
        alt={alt}
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`${currentSizeClass} w-auto object-contain transition-all duration-200 hidden dark:block dark:drop-shadow-[0_0_14px_rgba(59,130,246,0.22)]`}
      />
    </div>
  );
};


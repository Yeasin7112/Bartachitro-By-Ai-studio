import React, { useState, useEffect } from 'react';

interface SiteLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showSubtitle?: boolean;
  logoUrl?: string;
}

export const SiteLogo: React.FC<SiteLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
  logoUrl
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error status if logoUrl changes
  useEffect(() => {
    setHasError(false);
  }, [logoUrl]);

  // Height presets maintaining exact aspect ratio
  const sizeClasses = {
    xs: 'h-6 sm:h-7 w-auto',
    sm: 'h-9 sm:h-10 w-auto',
    md: 'h-12 sm:h-14 md:h-16 w-auto',
    lg: 'h-16 sm:h-20 md:h-24 w-auto',
    xl: 'h-24 sm:h-28 md:h-32 w-auto',
    custom: ''
  };

  const hasCustomLogo = Boolean(logoUrl && logoUrl.trim() && !hasError);

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <div className="relative flex items-center">
        {hasCustomLogo ? (
          <img 
            src={logoUrl} 
            alt="বার্তাচিত্র - BartaChitro" 
            className={`${sizeClasses[size]} object-contain select-none transition-transform duration-200 group-hover:scale-102 drop-shadow-xs max-w-[280px] max-h-[80px]`}
            loading="eager"
            onError={() => {
              setHasError(true);
            }}
          />
        ) : (
          <img 
            src="/logo.svg" 
            alt="বার্তাচিত্র - BartaChitro" 
            className={`${sizeClasses[size]} object-contain select-none transition-transform duration-200 group-hover:scale-102 drop-shadow-xs max-w-[280px] max-h-[80px]`}
            loading="eager"
            onError={(e) => {
              // Hide image tag and fallback to SVG text if file not accessible
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        )}

        {/* Guaranteed CSS/SVG Text Fallback if both custom and file fail */}
        <div 
          style={{ display: 'none' }} 
          className="items-center font-bengali-display font-black text-2xl sm:text-3xl text-red-600 tracking-tight"
        >
          <span>বার্তা</span>
          <span className="text-gray-900">চিত্র</span>
        </div>
      </div>

      {showSubtitle && (
        <span className="text-[10px] text-gray-500 font-semibold tracking-wider font-bengali-body pl-1 mt-0.5">
          সত্যের সংবাদ, সবার ভাষায়
        </span>
      )}
    </div>
  );
};

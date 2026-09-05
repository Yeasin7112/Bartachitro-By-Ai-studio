import React from 'react';

interface SiteLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showSubtitle?: boolean;
}

export const SiteLogo: React.FC<SiteLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false
}) => {
  // Height presets maintaining exact 2:1 aspect ratio of original wave emblem
  const sizeClasses = {
    sm: 'h-9 sm:h-10 w-auto',
    md: 'h-12 sm:h-14 md:h-16 w-auto',
    lg: 'h-16 sm:h-20 md:h-24 w-auto',
    xl: 'h-24 sm:h-28 md:h-32 w-auto',
    custom: ''
  };

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <div className="relative flex items-center">
        {/* Original uncropped wave-shaped emblem logo matching IMG-20260905-WA0005.jpg */}
        <img 
          src="/logo.svg" 
          alt="বার্তাচিত্র - BartaChitro | সময়ের সাথে.." 
          className={`${sizeClasses[size]} object-contain select-none transition-transform duration-200 group-hover:scale-102 drop-shadow-xs`}
          loading="eager"
        />
      </div>

      {showSubtitle && (
        <span className="text-[10px] text-gray-500 font-semibold tracking-wider font-bengali-body pl-1 mt-0.5">
          সত্যের সংবাদ, সবার ভাষায়
        </span>
      )}
    </div>
  );
};

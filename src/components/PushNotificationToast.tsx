import React, { useEffect, useState } from 'react';
import { Bell, BellRing, X, ExternalLink, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { PushNotification } from '../types';

interface PushNotificationToastProps {
  notification: PushNotification | null;
  onClose: () => void;
  onClick: (notification: PushNotification) => void;
  autoCloseDuration?: number; // milliseconds
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notification,
  onClose,
  onClick,
  autoCloseDuration = 9000
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!notification) return;

    setProgress(100);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / autoCloseDuration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [notification, autoCloseDuration, onClose]);

  if (!notification) return null;

  return (
    <aside
      aria-label="পুশ নোটিফিকেশন বিজ্ঞপ্তি"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-slide-up font-bengali-ui"
    >
      {/* Top Banner Indicator */}
      <div className={`px-4 py-2 flex items-center justify-between text-xs font-bold text-white ${
        notification.is_breaking ? 'bg-red-600' : 'bg-slate-900 dark:bg-slate-800'
      }`}>
        <div className="flex items-center gap-1.5">
          {notification.is_breaking ? (
            <>
              <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse shrink-0" />
              <span className="tracking-wide">জরুরি ব্রেকিং নিউজ নোটিফিকেশন</span>
            </>
          ) : (
            <>
              <BellRing className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="tracking-wide">বার্তাচিত্র সরাসরি পুশ বিজ্ঞপ্তি</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-white/80 hover:text-white p-0.5 rounded hover:bg-white/10 cursor-pointer transition-colors"
          title="নোটিফিকেশন বন্ধ করুন"
          aria-label="Close Notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notification Body */}
      <div 
        onClick={() => onClick(notification)}
        className="p-3.5 sm:p-4 flex gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
      >
        {notification.image_url ? (
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <img 
              src={notification.image_url} 
              alt="" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-12 h-12 shrink-0 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center font-bold">
            <Bell className="w-6 h-6" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {notification.category_name && (
            <span className="inline-block text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full mb-1">
              {notification.category_name}
            </span>
          )}

          <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">
            {notification.title}
          </h4>

          <p className="text-[11px] sm:text-xs text-gray-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
            {notification.body}
          </p>

          <div className="flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-400 mt-2">
            <span>পুরো সংবাদটি পড়ুন</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Auto-close Progress Bar */}
      <div className="h-1 bg-gray-100 dark:bg-slate-800 w-full overflow-hidden">
        <div 
          className={`h-full transition-all ease-linear ${notification.is_breaking ? 'bg-red-600' : 'bg-indigo-600'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </aside>
  );
};

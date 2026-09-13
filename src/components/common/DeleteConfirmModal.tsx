import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemTitle?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  itemTitle,
  confirmButtonText = 'হ্যাঁ, মুছে ফেলুন',
  cancelButtonText = 'বাতিল',
  isDeleting = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onCancel();
        }
      }}
    >
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-200 transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Danger Icon */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-bengali-display">
                {title}
              </h3>
              <p className="text-[11px] text-red-400 font-medium">
                এই কাজটি পুনরায় ফেরানো যাবে না (Irreversible)
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Details */}
        <div className="space-y-3 mb-6">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {message}
          </p>

          {itemTitle && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs">
              <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider font-semibold">
                নির্বাচিত আইটেম:
              </span>
              <p className="font-bold text-white line-clamp-2 leading-snug">
                "{itemTitle}"
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelButtonText}
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-md shadow-red-950/50 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'মুছে ফেলা হচ্ছে...' : confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

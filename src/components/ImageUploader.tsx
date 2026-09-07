import React, { useState, useRef } from 'react';
import { 
  UploadCloud, Image, Link, Check, X, 
  Sparkles, RefreshCw, Eye, AlertCircle 
} from 'lucide-react';

interface ImageUploaderProps {
  currentImage: string;
  onImageChange?: (url: string) => void;
  onImageSelected?: (url: string) => void;
  label?: string;
  helperText?: string;
}

const SAMPLE_NEWS_PRESETS = [
  {
    title: 'জাতীয় ও রাজনীতি',
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80'
  },
  {
    title: 'আন্তর্জাতিক',
    url: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=800&q=80'
  },
  {
    title: 'খেলাধুলা (ফুটবল)',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80'
  },
  {
    title: 'বিনোদন ও শোবিজ',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80'
  },
  {
    title: 'অর্থনীতি ও ব্যবসা',
    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80'
  },
  {
    title: 'প্রযুক্তি ও এআই',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80'
  }
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  onImageChange,
  onImageSelected,
  label = 'ফিচার্ড ছবি (Featured Image)',
  helperText = 'কম্পিউটার বা মোবাইল থেকে ছবি আপলোড করুন অথবা সরাসরি ইমেজ ইউআরএল প্রদান করুন'
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState(currentImage || '');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerChange = (url: string) => {
    setUploadError('');
    if (typeof onImageChange === 'function') {
      onImageChange(url);
    }
    if (typeof onImageSelected === 'function') {
      onImageSelected(url);
    }
  };

  const handleFileSelect = (file: File) => {
    setUploadError('');
    if (!file.type.startsWith('image/')) {
      setUploadError('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPEG, PNG, WebP) নির্বাচন করুন।');
      return;
    }

    setFileName(file.name);
    const sizeInKb = (file.size / 1024).toFixed(1);
    setFileSize(`${sizeInKb} KB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        triggerChange(result);
        setUrlInput(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      triggerChange(urlInput.trim());
      setFileName('');
      setFileSize('');
    }
  };

  const handleRemoveImage = () => {
    triggerChange('');
    setUrlInput('');
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-bold text-slate-300">{label}</label>
        <div className="flex gap-1 text-[11px] bg-slate-900 p-0.5 rounded border border-slate-700">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
              activeMode === 'upload' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ছবি আপলোড
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
              activeMode === 'url' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ইমেজ লিংক (URL)
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('presets')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
              activeMode === 'presets' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            প্রিসেট গ্যালারি
          </button>
        </div>
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      )}

      {uploadError && (
        <div className="bg-red-950/80 border border-red-750 text-red-300 text-xs p-2.5 rounded-lg flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* MODE 1: FILE UPLOAD (DRAG & DROP) */}
      {activeMode === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-red-500 bg-red-950/20' 
              : 'border-slate-700 hover:border-slate-500 bg-slate-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center text-red-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">
                ছবি নির্বাচন করতে ক্লিক করুন বা ড্র্যাগ করুন
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                PNG, JPG, WebP সমর্থিত • সর্বোচ্চ ৫ MB
              </p>
            </div>
            <button
              type="button"
              className="mt-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-1.5 rounded-lg border border-slate-600 transition-colors pointer-events-none"
            >
              ডিভাইস থেকে ব্রাউজ করুন
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: IMAGE URL */}
      {activeMode === 'url' && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-600"
            />
          </div>
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="bg-red-700 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            সেট করুন
          </button>
        </div>
      )}

      {/* MODE 3: PRESETS GALLERY */}
      {activeMode === 'presets' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SAMPLE_NEWS_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                triggerChange(preset.url);
                setUrlInput(preset.url);
                setFileName(preset.title);
              }}
              className="group relative rounded-lg overflow-hidden border border-slate-700 hover:border-red-500 transition-all text-left cursor-pointer"
            >
              <img src={preset.url} alt={preset.title} className="w-full h-16 object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-1.5">
                <span className="text-[10px] text-white font-bold truncate">
                  {preset.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* IMAGE PREVIEW CARD */}
      {currentImage && (
        <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-16 h-12 rounded overflow-hidden bg-slate-800 shrink-0 border border-slate-600">
              <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-200 truncate">
                  {fileName || 'ছবি প্রস্তুত'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                {fileSize ? `সাইজ: ${fileSize} • ` : ''}
                {currentImage.startsWith('data:') ? 'লোকাল আপলোড' : 'ওয়েব লিঙ্ক'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800 transition-colors"
              title="নতুন ছবি নির্বাচন করুন"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-slate-800 transition-colors"
              title="ছবি মুছে ফেলুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

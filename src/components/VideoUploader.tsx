import React, { useState, useRef } from 'react';
import { 
  Video, UploadCloud, Link as LinkIcon, Check, X, 
  AlertCircle, Loader2, PlayCircle, Youtube 
} from 'lucide-react';
import { uploadMediaFile } from '../utils/api';

interface VideoUploaderProps {
  currentVideo: string;
  onVideoChange: (url: string) => void;
  label?: string;
  helperText?: string;
}

// Helper to extract YouTube embed URL
export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) 
    ? `https://www.youtube-nocookie.com/embed/${match[2]}` 
    : null;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  currentVideo,
  onVideoChange,
  label = 'সংবাদের ভিডিও (Video Upload / Link)',
  helperText = 'কম্পিউটার বা মোবাইল থেকে ভিডিও আপলোড করুন (MP4, WebM) অথবা ইউটিউব লিংক পেস্ট করুন'
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(currentVideo || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerChange = (url: string) => {
    setUploadError('');
    onVideoChange(url);
  };

  const handleFileSelect = async (file: File) => {
    setUploadError('');
    
    // Check type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi'];

    if (!file.type.startsWith('video/') && (!ext || !validExts.includes(ext))) {
      setUploadError('অনুগ্রহ করে শুধুমাত্র ভিডিও ফাইল (MP4, WebM, MOV, OGG) নির্বাচন করুন।');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError('ভিডিও ফাইলের সাইজ ৫০MB এর চেয়ে বেশি হওয়া যাবে না। দীর্ঘ ভিডিওর ক্ষেত্রে ইউটিউব লিংক ব্যবহার করুন।');
      return;
    }

    setFileName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMb} MB`);
    setIsUploading(true);

    try {
      const uploadedUrl = await uploadMediaFile(file);
      triggerChange(uploadedUrl);
      setUrlInput(uploadedUrl);
    } catch (err: any) {
      console.error('Video upload error:', err);
      setUploadError(err?.message || 'ভিডিও আপলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন বা সরাসরি ইউটিউব লিংক ব্যবহার করুন।');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (urlInput.trim()) {
      triggerChange(urlInput.trim());
    }
  };

  const handleRemove = () => {
    triggerChange('');
    setUrlInput('');
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const ytEmbed = getYouTubeEmbedUrl(currentVideo);
  const isDirectVideo = currentVideo && (
    currentVideo.startsWith('/uploads/') || 
    currentVideo.endsWith('.mp4') || 
    currentVideo.endsWith('.webm') || 
    currentVideo.endsWith('.mov') ||
    currentVideo.startsWith('data:video/')
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-200">
            {label}
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {helperText}
          </p>
        </div>
        {currentVideo && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer font-medium"
          >
            <X className="w-3.5 h-3.5" /> ভিডিও মুছে ফেলুন
          </button>
        )}
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-700 w-fit text-xs">
        <button
          type="button"
          onClick={() => setActiveMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            activeMode === 'upload'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" /> ভিডিও আপলোড
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            activeMode === 'url'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Youtube className="w-3.5 h-3.5 text-red-400" /> ইউটিউব / অনলাইন লিংক
        </button>
      </div>

      {/* Upload Mode */}
      {activeMode === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-red-500 bg-red-950/20'
              : isUploading
              ? 'border-amber-500/50 bg-slate-900/40 cursor-wait'
              : 'border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-900'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mov"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          {isUploading ? (
            <div className="py-3 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              <p className="text-xs font-bold text-slate-200">ভিডিও ফাইল আপলোড হচ্ছে...</p>
              <p className="text-[11px] text-slate-400">
                {fileName} {fileSize ? `(${fileSize})` : ''} - অনুগ্রহ করে অপেক্ষা করুন
              </p>
            </div>
          ) : (
            <div className="py-2 flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">
                  ভিডিও ফাইল টেনে এনে ফেলুন অথবা ক্লিক করে আপলোড করুন
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  সাপোর্টেড ফরম্যাট: MP4, WebM, MOV (সর্বোচ্চ ৫০MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL Mode */}
      {activeMode === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="যেমন: https://www.youtube.com/watch?v=..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> যুক্ত করুন
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            টিপস: ইউটিউব ভিডিও লিংক অথবা যে কোনো পাবলিক MP4 ভিডিও ইউআরএল এখানে পেস্ট করে &quot;যুক্ত করুন&quot; বাটনে চাপুন।
          </p>
        </form>
      )}

      {/* Upload Error Message */}
      {uploadError && (
        <div className="flex items-center gap-2 p-2.5 bg-red-950/40 border border-red-800/80 rounded-lg text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Video Preview */}
      {currentVideo && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <PlayCircle className="w-4 h-4" /> নির্বাচিত ভিডিও প্রিভিউ
            </span>
            <span className="text-[11px] text-slate-500 truncate max-w-xs font-mono">
              {currentVideo}
            </span>
          </div>

          <div className="rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
            {ytEmbed ? (
              <iframe
                src={ytEmbed}
                title="YouTube video player"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : isDirectVideo ? (
              <video
                src={currentVideo}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs">
                <Video className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                <p>ভিডিও লিংক যুক্ত করা হয়েছে</p>
                <a 
                  href={currentVideo} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-red-400 underline text-[11px] mt-1 inline-block"
                >
                  ভিডিও ওপেন করে দেখুন
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

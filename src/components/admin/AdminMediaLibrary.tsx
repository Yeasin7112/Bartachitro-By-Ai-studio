import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, Search, Trash2, Copy, Check, 
  ExternalLink, UploadCloud, Filter, Grid, List, 
  Eye, Edit3, X, AlertCircle, Info, RefreshCw, FileText, CheckCircle2 
} from 'lucide-react';
import { MediaItem, NewsArticle, BlogPost, Advertisement, AdminUser, SiteSettings } from '../../types';
import { 
  scanAndSyncMediaLibrary, addMediaItem, updateMediaItem, 
  deleteMediaItem, formatBytes 
} from '../../utils/mediaStore';
import { uploadImageFile } from '../../utils/api';
import { bnNum } from '../../utils/bengaliHelpers';

interface AdminMediaLibraryProps {
  newsList: NewsArticle[];
  blogs: BlogPost[];
  ads?: Advertisement[];
  users?: AdminUser[];
  settings?: SiteSettings;
  onSelectImage?: (url: string, mediaItem?: MediaItem) => void;
  isSelectionMode?: boolean;
}

export const AdminMediaLibrary: React.FC<AdminMediaLibraryProps> = ({
  newsList,
  blogs,
  ads = [],
  users = [],
  settings,
  onSelectImage,
  isSelectionMode = false
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    return scanAndSyncMediaLibrary({ newsList, blogs, ads, users, settings });
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'upload' | 'news' | 'blog' | 'ad' | 'user'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [deletingMedia, setDeletingMedia] = useState<MediaItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync media items if parent news/blogs change
  useEffect(() => {
    const synced = scanAndSyncMediaLibrary({ newsList, blogs, ads, users, settings });
    setMediaItems(synced);
  }, [newsList.length, blogs.length, ads.length]);

  // Toast auto-hide
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Filtered & Searched Media Items
  const filteredMedia = useMemo(() => {
    let result = [...mediaItems];

    if (sourceFilter !== 'all') {
      result = result.filter(item => item.source === sourceFilter);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(item => 
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.filename && item.filename.toLowerCase().includes(q)) ||
        (item.alt_text && item.alt_text.toLowerCase().includes(q)) ||
        (item.caption && item.caption.toLowerCase().includes(q)) ||
        (item.url && item.url.toLowerCase().includes(q))
      );
    }

    return result;
  }, [mediaItems, sourceFilter, searchQuery]);

  // Copy URL to clipboard
  const handleCopyUrl = (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setSuccessToast('ছবির লিঙ্ক ক্লিপবোর্ডে কপি করা হয়েছে!');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Upload New File(s)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        // Extract native dimensions using Image constructor
        const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = new Image();
          const objUrl = URL.createObjectURL(file);
          img.onload = () => {
            resolve({ width: img.naturalWidth || 1200, height: img.naturalHeight || 800 });
            URL.revokeObjectURL(objUrl);
          };
          img.onerror = () => {
            resolve({ width: 1200, height: 800 });
            URL.revokeObjectURL(objUrl);
          };
          img.src = objUrl;
        });

        // Upload through standard API
        const uploadedUrl = await uploadImageFile(file);

        // Add to media store
        const newItem = addMediaItem({
          url: uploadedUrl,
          title: file.name.replace(/\.[^/.]+$/, ''),
          filename: file.name,
          file_size: file.size,
          width: dimensions.width,
          height: dimensions.height,
          alt_text: file.name.replace(/\.[^/.]+$/, ''),
          caption: '',
          source: 'upload'
        });

        setMediaItems(prev => [newItem, ...prev]);
      }

      setSuccessToast('নতুন ছবি সফলভাবে মিডিয়া লাইব্রেরিতে যুক্ত করা হয়েছে!');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadError(err?.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Media
  const handleConfirmDelete = () => {
    if (!deletingMedia) return;
    const updated = deleteMediaItem(deletingMedia.id);
    setMediaItems(updated);
    if (selectedMedia?.id === deletingMedia.id) setSelectedMedia(null);
    if (editingMedia?.id === deletingMedia.id) setEditingMedia(null);
    setDeletingMedia(null);
    setSuccessToast('ছবি মিডিয়া লাইব্রেরি থেকে অপসারণ করা হয়েছে।');
  };

  // Save Edited Alt Text & Metadata
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;

    const updated = updateMediaItem(editingMedia.id, {
      title: editingMedia.title,
      alt_text: editingMedia.alt_text,
      caption: editingMedia.caption
    });

    setMediaItems(updated);
    if (selectedMedia?.id === editingMedia.id) {
      setSelectedMedia(editingMedia);
    }
    setEditingMedia(null);
    setSuccessToast('ছবির অল্টারনেটিভ টেক্সট ও বিবরণ আপডেট করা হয়েছে!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ImageIcon className="w-6 h-6 text-red-400" />
              <h1 className="text-xl sm:text-2xl font-black text-white font-bengali-display">
                প্রফেশনাল মিডিয়া লাইব্রেরি (Media Library)
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              সাইটের সকল ফিচার্ড ইমেজ, কভার ও আপলোডকৃত ছবি এক নজরে দেখুন, সার্চ করুন, অল্টারনেটিভ টেক্সট (Alt text) যুক্ত করুন এবং সরাসরি সংবাদ বা ব্লগে পুনঃব্যবহার (Reuse) করুন।
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-red-700 hover:bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>আপলোড হচ্ছে...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>নতুন ছবি আপলোড করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-700/70 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-750">
            <span className="text-slate-400 block text-[11px]">মোট মিডিয়া ফাইল:</span>
            <span className="text-base font-bold text-white">{bnNum(mediaItems.length)} টি</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-750">
            <span className="text-slate-400 block text-[11px]">সংবাদ ফিচার্ড ছবি:</span>
            <span className="text-base font-bold text-red-400">
              {bnNum(mediaItems.filter(m => m.source === 'news').length)} টি
            </span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-750">
            <span className="text-slate-400 block text-[11px]">ব্লগ ও কলাম কভার:</span>
            <span className="text-base font-bold text-amber-400">
              {bnNum(mediaItems.filter(m => m.source === 'blog').length)} টি
            </span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-750">
            <span className="text-slate-400 block text-[11px]">সরাসরি আপলোডকৃত:</span>
            <span className="text-base font-bold text-emerald-400">
              {bnNum(mediaItems.filter(m => m.source === 'upload').length)} টি
            </span>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* Error Alert */}
      {uploadError && (
        <div className="bg-rose-950/90 border border-rose-600 text-rose-200 text-xs px-4 py-3 rounded-xl flex items-center justify-between gap-2.5 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="text-rose-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Controls Bar */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ছবির নাম, Alt text, ক্যাপশন বা ফাইলনেম দিয়ে খুঁজুন..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Source Filter Tabs & View Toggle */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
                sourceFilter === 'all' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              সকল ({bnNum(mediaItems.length)})
            </button>
            <button
              onClick={() => setSourceFilter('upload')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
                sourceFilter === 'upload' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              আপলোড
            </button>
            <button
              onClick={() => setSourceFilter('news')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
                sourceFilter === 'news' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              সংবাদ
            </button>
            <button
              onClick={() => setSourceFilter('blog')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
                sourceFilter === 'blog' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ব্লগ
            </button>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700 text-slate-400">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-800 text-white' : 'hover:text-white'
              }`}
              title="গ্রিড ভিউ"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-slate-800 text-white' : 'hover:text-white'
              }`}
              title="লিস্ট ভিউ"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Gallery Grid or List */}
      {filteredMedia.length === 0 ? (
        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-500">
            <ImageIcon className="w-6 h-6" />
          </div>
          <p className="text-slate-300 text-sm font-semibold">কোনো মিডিয়া ফাইল খুঁজে পাওয়া যায়নি</p>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            আপনার অনুসন্ধানের সাথে মিল রেখে কোনো ছবি নেই অথবা এখনো কোনো নতুন ছবি আপলোড করা হয়নি।
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSourceFilter('all'); }}
            className="mt-2 bg-slate-700 hover:bg-slate-600 text-white text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
          >
            অনুসন্ধান রিসেট করুন
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className={`group bg-slate-800/90 border rounded-xl overflow-hidden hover:border-red-500 transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md ${
                selectedMedia?.id === item.id ? 'border-red-500 ring-2 ring-red-500/30' : 'border-slate-700'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="aspect-[4/3] bg-slate-950 overflow-hidden relative">
                <img
                  src={item.url}
                  alt={item.alt_text || item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to placeholder if broken image
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80';
                  }}
                />

                {/* Top Badges */}
                <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-center pointer-events-none">
                  <span className="bg-slate-900/80 backdrop-blur-xs text-[9px] font-bold text-slate-200 px-1.5 py-0.5 rounded uppercase">
                    {item.format || 'JPG'}
                  </span>
                  {item.used_in_count !== undefined && item.used_in_count > 0 && (
                    <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {bnNum(item.used_in_count)} স্থানে ব্যবহৃত
                    </span>
                  )}
                </div>

                {/* Hover Quick Action Overlay */}
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl(item.url, e);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
                    title="লিঙ্ক কপি করুন (Reuse Image)"
                  >
                    {copiedUrl === item.url ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingMedia(item);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
                    title="Alt Text ও বিবরণ সম্পাদনা"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingMedia(item);
                    }}
                    className="p-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer"
                    title="ছবি মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-3 text-left space-y-1">
                <p className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors" title={item.title}>
                  {item.title}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{item.width && item.height ? `${item.width}×${item.height}` : '১২০০×৭৫০'}</span>
                  <span>{formatBytes(item.file_size)}</span>
                </div>
                {item.alt_text && (
                  <p className="text-[10px] text-slate-400 italic truncate" title={`Alt: ${item.alt_text}`}>
                    Alt: {item.alt_text}
                  </p>
                )}

                {/* Selection Mode Button */}
                {isSelectionMode && onSelectImage && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectImage(item.url, item);
                    }}
                    className="w-full mt-2 bg-red-700 hover:bg-red-600 text-white text-[11px] font-bold py-1.5 rounded transition-colors cursor-pointer"
                  >
                    এই ছবিটি নির্বাচন করুন
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 w-16">ছবি</th>
                  <th className="p-3">শিরোনাম ও ফাইলনেম</th>
                  <th className="p-3">Alt Text (বিকল্প টেক্সট)</th>
                  <th className="p-3">রেজোলিউশন / ডাইমেনশন</th>
                  <th className="p-3">সাইজ</th>
                  <th className="p-3">উৎস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/80 text-slate-200">
                {filteredMedia.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-750/50 transition-colors">
                    <td className="p-3">
                      <div 
                        onClick={() => setSelectedMedia(item)}
                        className="w-12 h-10 rounded bg-slate-950 overflow-hidden cursor-pointer border border-slate-700"
                      >
                        <img src={item.url} alt={item.alt_text || item.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-3 font-semibold max-w-xs">
                      <p className="text-white truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{item.filename}</p>
                    </td>
                    <td className="p-3 text-slate-300 max-w-[200px] truncate text-[11px]">
                      {item.alt_text ? (
                        <span className="text-slate-300">{item.alt_text}</span>
                      ) : (
                        <span className="text-amber-400 text-[10px] italic">অল্টারনেটিভ টেক্সট নেই</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-300">
                      {item.width && item.height ? `${item.width} × ${item.height} px` : '1200 × 750 px'}
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      {formatBytes(item.file_size)}
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-750">
                        {item.source === 'news' ? 'সংবাদ' : item.source === 'blog' ? 'ব্লগ' : item.source === 'ad' ? 'বিজ্ঞাপন' : 'আপলোড'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isSelectionMode && onSelectImage && (
                          <button
                            onClick={() => onSelectImage(item.url, item)}
                            className="bg-red-700 hover:bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded cursor-pointer"
                          >
                            সিলেক্ট
                          </button>
                        )}
                        <button
                          onClick={() => handleCopyUrl(item.url)}
                          className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="লিঙ্ক কপি করুন (Reuse Image)"
                        >
                          {copiedUrl === item.url ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setEditingMedia(item)}
                          className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Alt Text ও বিবরণ সম্পাদনা"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedMedia(item)}
                          className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="বিস্তারিত ও প্রিভিউ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingMedia(item)}
                          className="p-1.5 rounded hover:bg-rose-950 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL / PREVIEW MODAL */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-red-400" />
                <h3 className="font-bold text-white text-sm">মিডিয়া ফাইলের বিবরণ ও প্রিভিউ</h3>
              </div>
              <button 
                onClick={() => setSelectedMedia(null)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Full Image Preview */}
              <div className="w-full max-h-72 rounded-xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
                <img 
                  src={selectedMedia.url} 
                  alt={selectedMedia.alt_text || selectedMedia.title}
                  className="max-h-72 w-auto object-contain"
                />
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block text-[11px]">ডাইমেনশন / রেজোলিউশন:</span>
                  <span className="font-mono font-bold text-white">
                    {selectedMedia.width && selectedMedia.height ? `${selectedMedia.width} × ${selectedMedia.height} px` : '1200 × 750 px'}
                  </span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block text-[11px]">ফাইলের আকার (Size):</span>
                  <span className="font-mono font-bold text-white">{formatBytes(selectedMedia.file_size)}</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block text-[11px]">ফরম্যাট:</span>
                  <span className="font-mono font-bold text-white">{selectedMedia.format || 'JPG'}</span>
                </div>
              </div>

              {/* Alt text and Caption Details */}
              <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-750 text-xs space-y-2">
                <div>
                  <span className="text-slate-400 font-bold block text-[11px]">অল্টারনেটিভ টেক্সট (Alt Text):</span>
                  <p className="text-slate-200 mt-0.5">
                    {selectedMedia.alt_text || <span className="text-amber-400 italic">কোনো Alt Text সেট করা হয়নি (SEO এর জন্য যুক্ত করুন)</span>}
                  </p>
                </div>
                {selectedMedia.caption && (
                  <div>
                    <span className="text-slate-400 font-bold block text-[11px]">ছবির ক্যাপশন:</span>
                    <p className="text-slate-200 mt-0.5">{selectedMedia.caption}</p>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 font-bold block text-[11px]">সরাসরি ইমেজ ইউআরএল:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={selectedMedia.url}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-300 font-mono"
                    />
                    <button
                      onClick={() => handleCopyUrl(selectedMedia.url)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded text-xs font-semibold cursor-pointer shrink-0"
                    >
                      কপি
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMedia(selectedMedia);
                    setSelectedMedia(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Alt Text ও তথ্য পরিবর্তন</span>
                </button>

                <div className="flex items-center gap-2">
                  {isSelectionMode && onSelectImage && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectImage(selectedMedia.url, selectedMedia);
                        setSelectedMedia(null);
                      }}
                      className="bg-red-700 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                    >
                      এই ছবিটি ব্যবহার করুন
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingMedia(selectedMedia);
                      setSelectedMedia(null);
                    }}
                    className="bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer"
                  >
                    মুছে ফেলুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ALT TEXT & METADATA MODAL */}
      {editingMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-red-400" />
                <h3 className="font-bold text-white text-sm">ছবির Alt Text ও বিবরণ সম্পাদনা</h3>
              </div>
              <button 
                onClick={() => setEditingMedia(null)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <img src={editingMedia.url} alt="Preview" className="w-16 h-12 rounded object-cover border border-slate-700" />
                <div className="overflow-hidden text-xs">
                  <p className="font-bold text-white truncate">{editingMedia.filename}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {editingMedia.width && editingMedia.height ? `${editingMedia.width}×${editingMedia.height} px • ` : ''}
                    {formatBytes(editingMedia.file_size)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ছবির শিরোনাম (Title)</label>
                <input
                  type="text"
                  value={editingMedia.title}
                  onChange={(e) => setEditingMedia({ ...editingMedia, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  অল্টারনেটিভ টেক্সট (Alt Text) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editingMedia.alt_text || ''}
                  onChange={(e) => setEditingMedia({ ...editingMedia, alt_text: e.target.value })}
                  placeholder="ছবির বিষয়বস্তুর সংক্ষিপ্ত বর্ণনা (এসইও ও অন্ধ পাঠকের স্ক্রিন রিডারের জন্য)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  গুগল সার্চ ও সোশ্যাল মিডিয়ায় ছবি সূচীকরণের জন্য Alt Text অত্যন্ত গুরুত্বপূর্ণ।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ছবির ক্যাপশন (Image Caption)</label>
                <textarea
                  rows={2}
                  value={editingMedia.caption || ''}
                  onChange={(e) => setEditingMedia({ ...editingMedia, caption: e.target.value })}
                  placeholder="সংবাদের নিচে প্রদর্শিত ছবির ক্যাপশন..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-red-700 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer shadow"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-white text-sm">ছবিটি মুছে ফেলতে নিশ্চিত?</h3>
              <p className="text-xs text-slate-400">
                "{deletingMedia.title}" মিডিয়া লাইব্রেরি থেকে স্থায়ীভাবে মুছে ফেলা হবে।
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMedia(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-lg cursor-pointer"
              >
                না, রাখুন
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer shadow"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

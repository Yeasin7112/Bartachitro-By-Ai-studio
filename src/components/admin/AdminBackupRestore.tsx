import React, { useState, useRef } from 'react';
import { 
  Database, Upload, Server, CheckCircle2, 
  AlertTriangle, RefreshCw, FileJson, Layers, Check, Code, ShieldCheck
} from 'lucide-react';
import { NewsArticle, Category, SiteSettings, BlogPost, AdminUser } from '../../types';
import { BackupData, parseBackupFile } from '../../utils/zipExporter';
import { bnNum } from '../../utils/bengaliHelpers';

interface AdminBackupRestoreProps {
  newsList: NewsArticle[];
  blogs: BlogPost[];
  categories: Category[];
  settings: SiteSettings;
  users: AdminUser[];
  onImportBackup: (backup: BackupData) => void;
}

export const AdminBackupRestore: React.FC<AdminBackupRestoreProps> = ({
  newsList,
  blogs,
  categories,
  settings,
  users,
  onImportBackup
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [parsedPreview, setParsedPreview] = useState<{
    data: BackupData;
    newsCount: number;
    blogsCount: number;
    categoriesCount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handling for Single Click Import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const res = await parseBackupFile(file);
    setIsImporting(false);

    if (res.success && res.data) {
      setParsedPreview({
        data: res.data,
        newsCount: res.data.news?.length || 0,
        blogsCount: res.data.blogs?.length || 0,
        categoriesCount: res.data.categories?.length || 0
      });
      setFeedback({
        type: 'success',
        message: `ব্যাকআপ ফাইল সফলভাবে লোড হয়েছে! ${bnNum(res.data.news?.length || 0)}টি সংবাদ ও ${bnNum(res.data.blogs?.length || 0)}টি ব্লগ পাওয়া গেছে। নিচের রিস্টোর বাটনে ক্লিক করুন।`
      });
    } else {
      setParsedPreview(null);
      setFeedback({
        type: 'error',
        message: res.error || 'ফাইলের ফরম্যাট সঠিক নয়। অনুগ্রহ করে বার্তাচিত্রের ব্যাকআপ JSON ফাইল নির্বাচন করুন।'
      });
    }
  };

  // Confirm and Apply Restore
  const handleConfirmRestore = () => {
    if (!parsedPreview) return;
    try {
      onImportBackup(parsedPreview.data);
      setFeedback({
        type: 'success',
        message: 'অভিনন্দন! আপনার সকল সংবাদ ও ব্লগ সফলভাবে সাইটে রিস্টোর (Import) করা হয়েছে!'
      });
      setParsedPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'ডাটা রিস্টোরে সমস্যা হয়েছে। ফাইলটি পুনরায় যাচাই করুন।'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl sm:text-2xl font-black text-white font-bengali-display">
            ডাটাবেস স্থিতি ও cPanel হোস্টিং ব্যবস্থাপনা
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          আপনার ওয়েবসাইটের বর্তমান লাইভ ডাটাবেস স্ট্যাটাস নিরীক্ষণ করুন, প্রয়োজনে পূর্বের ব্যাকআপ ফাইল থেকে রিস্টোর (Import) করুন এবং cPanel সংযোগ পর্যবেক্ষণ করুন।
        </p>
      </div>

      {/* Alert / Feedback */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in border ${
          feedback.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200' 
            : 'bg-rose-950/80 border-rose-600 text-rose-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 2 Main Action Columns: Live Database Status vs 1-Click Backup Import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Live System & Database Metrics */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white font-bengali-display">
                  সিস্টেম ও ডাটাবেস স্ট্যাটাস
                </h2>
              </div>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                সক্রিয় (Active)
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              আপনার ওয়েবসাইটের বর্তমান ডাটাবেস রেকর্ড ও টেবিল মেট্রিক্স:
            </p>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-slate-900/80 border border-slate-750 p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">সংবাদ কন্টেন্ট:</span>
                <span className="text-lg font-bold text-white">{bnNum(newsList.length)}টি</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-750 p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">ব্লগ ও কলাম:</span>
                <span className="text-lg font-bold text-white">{bnNum(blogs.length)}টি</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-750 p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">ক্যাটাগরি:</span>
                <span className="text-base font-bold text-white">{bnNum(categories.length)}টি</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-750 p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">অ্যাডমিন ইউজার:</span>
                <span className="text-base font-bold text-white">{bnNum(users.length)} জন</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>ডাটাবেস এনকোডিং:</span>
              <span className="text-slate-200 font-mono">utf8mb4_unicode_ci</span>
            </div>
            <div className="flex items-center justify-between">
              <span>সার্ভার ইঞ্জিন:</span>
              <span className="text-slate-200 font-mono">cPanel / Apache / PHP 8+ / Node.js</span>
            </div>
          </div>
        </div>

        {/* Right: 1-Click Import / Restore Section */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white font-bengali-display">
                  ১-ক্লিকে ব্যাকআপ ইমপোর্ট ও রিস্টোর (Import)
                </h2>
              </div>
              <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                ইনস্ট্যান্ট রিস্টোর
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              পূর্বে সংরক্ষিত বার্তাচিত্র JSON ব্যাকআপ ফাইল থেকে সরাসরি সকল সংবাদ, কলাম, ক্যাটাগরি ও সেটিংস রিস্টোর করুন:
            </p>

            {/* Hidden Native File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />

            {/* File Dropzone / Click Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-900/70 hover:bg-slate-900 rounded-xl p-5 text-center cursor-pointer transition-all space-y-2"
            >
              <div className="w-10 h-10 rounded-full bg-blue-950/60 border border-blue-800 flex items-center justify-center mx-auto text-blue-400">
                <FileJson className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="text-blue-400 font-bold block">ব্যাকআপ ফাইল (JSON) নির্বাচন করুন</span>
                <span className="text-[11px] text-slate-400">ক্লিক করে আপনার কম্পিউটার বা ফোন থেকে ফাইলটি দিন</span>
              </div>
            </div>

            {/* Loaded Preview Box */}
            {parsedPreview && (
              <div className="bg-blue-950/40 border border-blue-800/80 p-3.5 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-blue-200">
                  <span>ফাইলের বিবরণ:</span>
                  <span className="text-[11px] bg-blue-900/60 px-2 py-0.5 rounded">ভ্যালিড ব্যাকআপ</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300 pt-1">
                  <div>সংবাদ: <strong className="text-white">{bnNum(parsedPreview.newsCount)}</strong>টি</div>
                  <div>ব্লগ: <strong className="text-white">{bnNum(parsedPreview.blogsCount)}</strong>টি</div>
                  <div>ক্যাটাগরি: <strong className="text-white">{bnNum(parsedPreview.categoriesCount)}</strong>টি</div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-700/80">
            <button
              onClick={handleConfirmRestore}
              disabled={!parsedPreview || isImporting}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                parsedPreview 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-md active:scale-98' 
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
              <span>{isImporting ? 'ডাটা প্রসেস হচ্ছে...' : 'সকল ডাটা সম্পূর্ণ রিস্টোর করুন (Apply Restore)'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* cPanel Deployment & Configuration Guide */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
        <div className="pb-4 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Server className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-white font-bengali-display">
              cPanel হোস্টিং ও MySQL ডাটাবেস ইন্টিগ্রেশন গাইড
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            আপনার cPanel হোস্টিংয়ে React ফ্রন্টএন্ড এবং PHP / Node.js ব্যাকএন্ড একযোগে পরিচালনার নির্দেশনা:
          </p>
        </div>

        {/* 4-Step cPanel Configuration Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-red-900/60 text-red-300 font-bold flex items-center justify-center text-xs">
              ১
            </span>
            <h3 className="font-bold text-white">public_html ফোল্ডার</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              cPanel এর <strong>File Manager</strong> এ গিয়ে <code>public_html</code> ফোল্ডারে বিল্ডকৃত ফাইলসমূহ আপলোড করুন। <code>.htaccess</code> ফাইল স্বয়ংক্রিয়ভাবে রুট রাউটিং পরিচালনা করে।
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-red-900/60 text-red-300 font-bold flex items-center justify-center text-xs">
              ২
            </span>
            <h3 className="font-bold text-white">MySQL ডাটাবেস তৈরি</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              cPanel এর <strong>MySQL® Databases</strong> উইজার্ডে গিয়ে একটি নতুন ডাটাবেস ও ইউজার তৈরি করুন এবং <em>All Privileges</em> প্রদান করুন।
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-red-900/60 text-red-300 font-bold flex items-center justify-center text-xs">
              ৩
            </span>
            <h3 className="font-bold text-white">PHP 8+ / Node.js সাপোর্ট</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              cPanel এর <strong>Select PHP Version</strong> থেকে PHP 8.1+ সক্রিয় রাখুন অথবা <strong>Setup Node.js App</strong> টুল ব্যবহার করে সরাসরি Node.js অ্যাপ্লিকেশন রান করতে পারেন।
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-red-900/60 text-red-300 font-bold flex items-center justify-center text-xs">
              ৪
            </span>
            <h3 className="font-bold text-white">লাইভ ওয়েবসাইট সক্রিয়</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              আপনার ডোমেইনে প্রবেশ করলেই সম্পূর্ণ বার্তাচিত্র পোর্টাল এবং অ্যাডমিন প্যানেল সরাসরি চালু হয়ে যাবে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

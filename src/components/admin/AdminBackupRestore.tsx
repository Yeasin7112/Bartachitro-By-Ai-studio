import React, { useState, useRef } from 'react';
import { 
  Database, Download, Upload, Server, FileCode, CheckCircle2, 
  AlertTriangle, RefreshCw, HardDrive, FileJson, Shield, ArrowRight,
  Copy, Check, FileCheck, Layers
} from 'lucide-react';
import { NewsArticle, Category, SiteSettings, BlogPost, AdminUser } from '../../types';
import { 
  BackupData, 
  downloadBackupJson, 
  downloadSqlDump, 
  downloadCpanelBundle, 
  parseBackupFile 
} from '../../utils/zipExporter';
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
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [parsedPreview, setParsedPreview] = useState<{
    data: BackupData;
    newsCount: number;
    blogsCount: number;
    categoriesCount: number;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1-Click JSON Backup Export
  const handleExportJson = () => {
    try {
      setIsExporting(true);
      downloadBackupJson(newsList, blogs, categories, settings, users);
      setFeedback({
        type: 'success',
        message: 'সম্পূর্ণ নিউজ ও ব্লগ ব্যাকআপ ফাইল (JSON) সফলভাবে ডাউনলোড হয়েছে!'
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'ব্যাকআপ ডাউনলোডে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
      });
    } finally {
      setIsExporting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // 1-Click MySQL SQL Dump
  const handleExportSql = () => {
    try {
      setIsExporting(true);
      downloadSqlDump(newsList, blogs, categories, settings, users);
      setFeedback({
        type: 'success',
        message: 'MySQL ডাটাবেস স্ক্রিপ্ট (database.sql) সফলভাবে ডাউনলোড হয়েছে! এটি সরাসরি phpMyAdmin এ ইমপোর্ট করা যাবে।'
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'SQL ডাম্প তৈরিতে সমস্যা হয়েছে।'
      });
    } finally {
      setIsExporting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // 1-Click cPanel Bundle
  const handleExportCpanel = async () => {
    try {
      setIsExporting(true);
      await downloadCpanelBundle(newsList, blogs, categories, settings, users);
      setFeedback({
        type: 'success',
        message: 'অভিনন্দন! আপনার cPanel হোস্টিং এর জন্য পূর্ণাঙ্গ রেডি প্যাকেজ (ZIP) ডাউনলোড শুরু হয়েছে।'
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'cPanel বান্ডেল প্যাকেজ তৈরিতে ত্রুটি ঘটেছে।'
      });
    } finally {
      setIsExporting(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

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
        message: res.error || 'ফাইলের ফরম্যাট সঠিক নয়। অনুগ্রহ করে বার্তাচিত্রের ব্যাকআপ JSON ফাইল আপলোড করুন।'
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
            নিউজ ও ব্লগ ব্যাকআপ এবং cPanel হোস্টিং এক্সপোর্ট
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          এক ক্লিকে সকল সংবাদ, কলাম, ছবি ও সেটিংস ব্যাকআপ ফাইল হিসেবে এক্সপোর্ট করুন অথবা পূর্বের ব্যাকআপ ফাইল থেকে রিস্টোর (Import) করুন। আপনার নিজস্ব cPanel হোস্টিং ও MySQL ডাটাবেসে সাইটটি হোস্ট করার সম্পূর্ণ ফাইলও এখানে প্রস্তুত করা আছে।
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

      {/* 2 Main Action Columns: 1-Click Backup Export vs 1-Click Backup Import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: 1-Click Export Section */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white font-bengali-display">
                  ১-ক্লিকে ব্যাকআপ এক্সপোর্ট (Export)
                </h2>
              </div>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                রেডি টু ডাউনলোড
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              আপনার ওয়েবসাইটের বর্তমান সকল ডাটা নিরাপদে সংরক্ষণ করে রাখুন:
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

          <div className="space-y-2.5 pt-4 border-t border-slate-700/80">
            <button
              onClick={handleExportJson}
              disabled={isExporting}
              className="w-full bg-emerald-700 hover:bg-emerald-600 active:scale-98 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
            >
              <FileJson className="w-4 h-4" />
              <span>১-ক্লিকে সকল সংবাদ ও ব্লগ ডাউনলোড (JSON Backup)</span>
            </button>

            <button
              onClick={handleExportSql}
              disabled={isExporting}
              className="w-full bg-slate-700 hover:bg-slate-600 active:scale-98 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span>MySQL ডাটাবেস স্ক্রিপ্ট ডাউনলোড (.sql dump)</span>
            </button>
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
              পূর্বের যে কোনো JSON ব্যাকআপ ফাইল নির্বাচন করুন। এক ক্লিকেই পূর্বের সকল সংবাদ ও ব্লগ সাইটে ফিরে আসবে।
            </p>

            {/* File Drop / Select Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 hover:border-blue-500 bg-slate-900/60 hover:bg-slate-900 p-6 rounded-2xl text-center cursor-pointer transition-colors space-y-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileCode className="w-8 h-8 text-slate-400 group-hover:text-blue-400 mx-auto transition-colors" />
              <div>
                <p className="text-xs font-bold text-white">
                  {isImporting ? 'ফাইল যাচাই করা হচ্ছে...' : 'ব্যাকআপ JSON ফাইল সিলেক্ট করুন'}
                </p>
                <p className="text-[11px] text-slate-400">
                  অথবা ফাইলটি টেনে এনে এখানে ছেড়ে দিন
                </p>
              </div>
            </div>

            {/* Preview of Loaded File */}
            {parsedPreview && (
              <div className="bg-slate-900 border border-blue-900/70 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-300 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-400" /> ফাইলে পাওয়া গেছে:
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {parsedPreview.data.exported_at ? new Date(parsedPreview.data.exported_at).toLocaleDateString('bn-BD') : ''}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <span className="bg-slate-800 px-2.5 py-1 rounded">
                    📰 সংবাদ: <strong>{bnNum(parsedPreview.newsCount)}টি</strong>
                  </span>
                  <span className="bg-slate-800 px-2.5 py-1 rounded">
                    ✍️ ব্লগ: <strong>{bnNum(parsedPreview.blogsCount)}টি</strong>
                  </span>
                  <span className="bg-slate-800 px-2.5 py-1 rounded">
                    📂 ক্যাটাগরি: <strong>{bnNum(parsedPreview.categoriesCount)}টি</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-700/80">
            <button
              onClick={handleConfirmRestore}
              disabled={!parsedPreview}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow ${
                parsedPreview
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-98 animate-pulse'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>এখনই ব্যাকআপ থেকে রিস্টোর করুন (Restore All)</span>
            </button>
          </div>
        </div>

      </div>

      {/* cPanel Deployment & MySQL Setup Section */}
      <div className="bg-linear-to-b from-slate-850 to-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Server className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold text-white font-bengali-display">
                cPanel হোস্টিং ও MySQL ডাটাবেসে সাইট ডিপ্লয়মেন্ট
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              আপনি যেকোনো সাধারণ cPanel শেয়ার্ড হোস্টিং বা ভিপিএস-এ এই ওয়েবসাইট ও এর MySQL ডাটাবেস এক ক্লিকেই রান করতে পারেন।
            </p>
          </div>

          <button
            onClick={handleExportCpanel}
            disabled={isExporting}
            className="bg-amber-600 hover:bg-amber-500 text-gray-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0 self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>সম্পূর্ণ cPanel ডিপ্লয় প্যাকেজ (ZIP)</span>
          </button>
        </div>

        {/* 4-Step cPanel Deployment Guide */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-red-900/60 text-red-300 font-bold flex items-center justify-center text-xs">
              ১
            </span>
            <h3 className="font-bold text-white">ZIP ডাউনলোড ও আপলোড</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              উপরের 'cPanel ডিপ্লয় প্যাকেজ' বাটনে ক্লিক করে জিপ ফাইলটি ডাউনলোড করুন এবং cPanel এর File Manager এ <code>public_html</code> ফোল্ডারে Extract করুন।
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-red-900/60 text-red-300 font-bold flex items-center justify-center text-xs">
              ২
            </span>
            <h3 className="font-bold text-white">MySQL ডাটাবেস তৈরি</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              cPanel এর <strong>MySQL® Databases</strong> এ গিয়ে একটি নতুন ডাটাবেস ও ইউজার তৈরি করুন এবং ইউজারকে All Privileges দিন।
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-red-900/60 text-red-300 font-bold flex items-center justify-center text-xs">
              ৩
            </span>
            <h3 className="font-bold text-white">phpMyAdmin এ SQL ইমপোর্ট</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>phpMyAdmin</strong> ওপেন করে আপনার তৈরি করা ডাটাবেসটি সিলেক্ট করুন এবং জিপে থাকা <code>database.sql</code> ফাইলটি Import করে নিন।
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-red-900/60 text-red-300 font-bold flex items-center justify-center text-xs">
              ৪
            </span>
            <h3 className="font-bold text-white">config.php কনফিগারেশন</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <code>config.php</code> ফাইলটিতে আপনার MySQL ডাটাবেসের নাম, ইউজারনেম ও পাসওয়ার্ড বসিয়ে সেভ করুন। ব্যস, সাইট লাইভ!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

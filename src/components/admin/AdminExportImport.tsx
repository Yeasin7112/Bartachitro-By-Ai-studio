import React, { useState, useRef } from 'react';
import { 
  Download, Upload, FileJson, FileSpreadsheet, Database, 
  CheckCircle2, AlertTriangle, RefreshCw, FileText, 
  BookOpen, ShieldCheck, ArrowRight, HelpCircle, Layers 
} from 'lucide-react';
import { NewsArticle, BlogPost, Category, SiteSettings, AdminUser, Advertisement } from '../../types';
import { downloadJsonBackup, parseBackupFile, BackupData, downloadSqlDump } from '../../utils/zipExporter';
import { bnNum } from '../../utils/bengaliHelpers';

interface AdminExportImportProps {
  newsList: NewsArticle[];
  blogs: BlogPost[];
  categories: Category[];
  settings: SiteSettings;
  users?: AdminUser[];
  ads?: Advertisement[];
  onImportBackup: (backup: BackupData, mode?: 'replace' | 'merge') => void;
}

export const AdminExportImport: React.FC<AdminExportImportProps> = ({
  newsList,
  blogs,
  categories,
  settings,
  users = [],
  ads = [],
  onImportBackup
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [parsedPreview, setParsedPreview] = useState<{
    data: BackupData;
    newsCount: number;
    blogsCount: number;
    categoriesCount: number;
    sampleHeadlines: string[];
    exportDate?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. One Click Complete JSON Download
  const handleDownloadAll = () => {
    try {
      downloadJsonBackup(newsList, blogs, categories, settings, ads, users);
      setFeedback({
        type: 'success',
        message: `সকল সংবাদ (${bnNum(newsList.length)}টি) ও ব্লগ (${bnNum(blogs.length)}টি) সফলভাবে ডাউনলোড হয়েছে!`
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'ডাউনলোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।'
      });
    }
  };

  // 2. Export News Only (JSON)
  const handleExportNewsJson = () => {
    const payload = {
      export_type: 'news_only',
      site_name: settings.site_name,
      export_date: new Date().toISOString(),
      total: newsList.length,
      news: newsList
    };
    downloadFileBlob(
      JSON.stringify(payload, null, 2),
      `bartachitro-news-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
    setFeedback({
      type: 'success',
      message: `${bnNum(newsList.length)}টি সংবাদ JSON ফাইলে এক্সপোর্ট করা হয়েছে!`
    });
  };

  // 3. Export News CSV (Spreadsheet)
  const handleExportNewsCsv = () => {
    const headers = ['ID', 'Title', 'Category', 'Author', 'Views', 'Status', 'Published Date', 'Featured Image'];
    const rows = newsList.map(n => [
      n.id,
      `"${(n.title || '').replace(/"/g, '""')}"`,
      `"${(n.category_name || '').replace(/"/g, '""')}"`,
      `"${(n.author_name || '').replace(/"/g, '""')}"`,
      n.views || 0,
      n.status || 'published',
      `"${n.published_at || ''}"`,
      `"${n.featured_image || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFileBlob(
      csvContent,
      `bartachitro-news-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8'
    );
    setFeedback({
      type: 'success',
      message: `${bnNum(newsList.length)}টি সংবাদ এক্সেল/সিএসভি ফাইলে এক্সপোর্ট করা হয়েছে!`
    });
  };

  // 4. Export Blogs Only (JSON)
  const handleExportBlogsJson = () => {
    const payload = {
      export_type: 'blogs_only',
      site_name: settings.site_name,
      export_date: new Date().toISOString(),
      total: blogs.length,
      blogs: blogs
    };
    downloadFileBlob(
      JSON.stringify(payload, null, 2),
      `bartachitro-blogs-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
    setFeedback({
      type: 'success',
      message: `${bnNum(blogs.length)}টি ব্লগ ও কলাম JSON ফাইলে এক্সপোর্ট করা হয়েছে!`
    });
  };

  // 5. Export Blogs CSV
  const handleExportBlogsCsv = () => {
    const headers = ['ID', 'Title', 'Tag', 'Author', 'Role', 'Views', 'Likes', 'Published Date'];
    const rows = blogs.map(b => [
      b.id,
      `"${(b.title || '').replace(/"/g, '""')}"`,
      `"${(b.category_tag || '').replace(/"/g, '""')}"`,
      `"${(b.author_name || '').replace(/"/g, '""')}"`,
      `"${(b.author_role || '').replace(/"/g, '""')}"`,
      b.views || 0,
      b.likes || 0,
      `"${b.published_at || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFileBlob(
      csvContent,
      `bartachitro-blogs-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8'
    );
    setFeedback({
      type: 'success',
      message: `${bnNum(blogs.length)}টি ব্লগ ও কলাম এক্সেল/সিএসভি ফাইলে এক্সপোর্ট করা হয়েছে!`
    });
  };

  // Helper for downloading blob
  const downloadFileBlob = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // File Upload & Parse
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setFeedback(null);
    const res = await parseBackupFile(file);
    setIsImporting(false);

    if (res.success && res.data) {
      const sampleNews = (res.data.news || []).slice(0, 3).map(n => n.title);
      setParsedPreview({
        data: res.data,
        newsCount: res.data.news?.length || 0,
        blogsCount: res.data.blogs?.length || 0,
        categoriesCount: res.data.categories?.length || 0,
        sampleHeadlines: sampleNews,
        exportDate: res.data.export_date
      });
      setFeedback({
        type: 'success',
        message: `ব্যাকআপ ফাইল সফলভাবে লোড হয়েছে! ${bnNum(res.data.news?.length || 0)}টি সংবাদ ও ${bnNum(res.data.blogs?.length || 0)}টি ব্লগ পাওয়া গেছে। নিচের রিস্টোর বাটনে ক্লিক করে ডাটাবেস পুনরুদ্ধার করুন।`
      });
    } else {
      setParsedPreview(null);
      setFeedback({
        type: 'error',
        message: res.error || 'ফাইলের ফরম্যাট সঠিক নয়। অনুগ্রহ করে বার্তাচিত্র ব্যাকআপ JSON ফাইল নির্বাচন করুন।'
      });
    }
  };

  // Apply Restore to Database
  const handleConfirmRestore = () => {
    if (!parsedPreview) return;
    try {
      onImportBackup(parsedPreview.data, importMode);
      setFeedback({
        type: 'success',
        message: importMode === 'replace'
          ? 'অভিনন্দন! আপনার সকল সংবাদ ও ব্লগ সফলভাবে প্রতিস্থাপন ও রিস্টোর করা হয়েছে!'
          : 'অভিনন্দন! আপনার ব্যাকআপের সংবাদ ও ব্লগ সফলভাবে বর্তমান ডাটাবেসে মার্জ (যুক্ত) করা হয়েছে!'
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
      {/* Header Banner */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl sm:text-2xl font-black text-white font-bengali-display">
            সংবাদ ও ব্লগ এক্সপোর্ট-ইমপোর্ট এবং ডাটাবেস রিকভারি
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          ১-ক্লিকে সাইটের সকল সংবাদ ও ব্লগ ডাউনলোড করুন। ভবিষ্যতে হোস্টিং, সার্ভার বা ডাটাবেসের কোনো সমস্যা হলে পূর্বের সংরক্ষিত ফাইল আপলোড করে এক ক্লিকেই সম্পূর্ণ সাইট রিস্টোর করতে পারবেন।
        </p>
      </div>

      {/* Feedback Alerts */}
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
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* 2 MAIN SECTIONS: 1-CLICK DOWNLOAD VS 1-CLICK UPLOAD / RECOVER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT COLUMN: 1-CLICK EXPORT / DOWNLOAD */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 sm:p-6 space-y-5 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white font-bengali-display">
                  ১-ক্লিকে ডাউনলোড ও এক্সপোর্ট (Export)
                </h2>
              </div>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                তাত্ক্ষণিক ব্যাকআপ
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              আপনার পোর্টালের বর্তমান <strong>{bnNum(newsList.length)}টি সংবাদ</strong> এবং <strong>{bnNum(blogs.length)}টি ব্লগ</strong> একটি ফাইলে ডাউনলোড করে কম্পিউটারে নিরাপদ ব্যাকআপ রাখুন:
            </p>

            {/* MASTER 1-CLICK DOWNLOAD BUTTON */}
            <button
              onClick={handleDownloadAll}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-4 rounded-xl shadow-lg transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-3 font-bold text-sm"
            >
              <Download className="w-5 h-5" />
              <span>১-ক্লিকে সকল সংবাদ ও ব্লগ ডাউনলোড (JSON)</span>
            </button>

            {/* GRANULAR EXPORT OPTIONS */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                আলাদা আলাদা ফরম্যাটে এক্সপোর্ট করুন:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* News JSON */}
                <button
                  onClick={handleExportNewsJson}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-emerald-500 p-2.5 rounded-xl flex items-center gap-2 text-slate-200 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <FileJson className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold block">সংবাদ (News JSON)</span>
                    <span className="text-[10px] text-slate-400">{bnNum(newsList.length)}টি প্রতিবেদন</span>
                  </div>
                </button>

                {/* News CSV */}
                <button
                  onClick={handleExportNewsCsv}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-emerald-500 p-2.5 rounded-xl flex items-center gap-2 text-slate-200 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold block">সংবাদ (Excel / CSV)</span>
                    <span className="text-[10px] text-slate-400">স্প্রেডশীটে খোলার উপযোগী</span>
                  </div>
                </button>

                {/* Blogs JSON */}
                <button
                  onClick={handleExportBlogsJson}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-teal-500 p-2.5 rounded-xl flex items-center gap-2 text-slate-200 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <BookOpen className="w-4 h-4 text-teal-400 shrink-0" />
                  <div>
                    <span className="font-bold block">ব্লগ ও কলাম (JSON)</span>
                    <span className="text-[10px] text-slate-400">{bnNum(blogs.length)}টি লেখা</span>
                  </div>
                </button>

                {/* Blogs CSV */}
                <button
                  onClick={handleExportBlogsCsv}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-teal-500 p-2.5 rounded-xl flex items-center gap-2 text-slate-200 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-teal-400 shrink-0" />
                  <div>
                    <span className="font-bold block">ব্লগ (Excel / CSV)</span>
                    <span className="text-[10px] text-slate-400">কলামিস্টদের তালিকা সহ</span>
                  </div>
                </button>
              </div>

              {/* MySQL Dump */}
              <button
                onClick={() => downloadSqlDump(newsList, blogs, categories, settings, users, ads)}
                className="w-full mt-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-750 hover:border-slate-600 p-2.5 rounded-xl flex items-center justify-between text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>cPanel phpMyAdmin MySQL ডাটাবেস ডাম্প (.sql) ডাউনলোড</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700/80 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>সকল ইমেজ লিংক, ক্যাটাগরি আইডি, লেখক নাম ও তারিখ অপরিবর্তিত থাকবে।</span>
          </div>
        </div>

        {/* RIGHT COLUMN: 1-CLICK UPLOAD / RECOVER / IMPORT */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 sm:p-6 space-y-5 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white font-bengali-display">
                  ফাইল আপলোড ও ডাটাবেস রিস্টোর (Import)
                </h2>
              </div>
              <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                জরুরি রিকভারি
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              হোস্টিং সমস্যা, ডাটা মুছে যাওয়া বা ডাটাবেস ক্র্যাশ হলে পূর্বে ডাউনলোডকৃত বার্তাচিত্র JSON ব্যাকআপ ফাইল নির্বাচন করে মুহূর্তেই রিস্টোর করুন:
            </p>

            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />

            {/* Drop / Click Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-900/70 hover:bg-slate-900/90 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2.5"
            >
              <div className="w-12 h-12 rounded-full bg-blue-950/70 border border-blue-800 flex items-center justify-center mx-auto text-blue-400">
                {isImporting ? <RefreshCw className="w-6 h-6 animate-spin" /> : <FileJson className="w-6 h-6" />}
              </div>
              <div className="text-xs">
                <span className="text-blue-400 font-bold block text-sm">
                  {isImporting ? 'ফাইল বিশ্লেষণ হচ্ছে...' : 'ব্যাকআপ JSON ফাইল নির্বাচন করুন'}
                </span>
                <span className="text-[11px] text-slate-400">
                  ক্লিক করে কম্পিউটার বা মোবাইল থেকে ব্যাকআপ ফাইল দিন
                </span>
              </div>
            </div>

            {/* File Preview Card & Mode Toggle */}
            {parsedPreview && (
              <div className="bg-blue-950/40 border border-blue-800/90 p-4 rounded-xl space-y-3 text-xs animate-in fade-in">
                <div className="flex items-center justify-between font-bold text-blue-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    ব্যাকআপ বিশ্লেষণ সফল
                  </span>
                  <span className="text-[10px] bg-blue-900/80 px-2 py-0.5 rounded text-blue-200">
                    রেডি টু রিস্টোর
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-slate-900/70 p-2.5 rounded-lg">
                  <div>
                    <span className="text-slate-400 block text-[10px]">সংবাদ:</span>
                    <strong className="text-white text-sm">{bnNum(parsedPreview.newsCount)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ব্লগ:</span>
                    <strong className="text-white text-sm">{bnNum(parsedPreview.blogsCount)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ক্যাটাগরি:</span>
                    <strong className="text-white text-sm">{bnNum(parsedPreview.categoriesCount)}</strong>
                  </div>
                </div>

                {parsedPreview.sampleHeadlines.length > 0 && (
                  <div className="text-[11px] text-slate-300">
                    <span className="text-slate-400 block mb-1">নমুনা শিরোনাম:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-200">
                      {parsedPreview.sampleHeadlines.map((h, i) => (
                        <li key={i} className="truncate">{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Import Mode Selection */}
                <div className="pt-2 border-t border-blue-900/70">
                  <span className="text-[11px] font-bold text-slate-300 block mb-1.5">
                    রিস্টোর পদ্ধতি নির্বাচন করুন:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setImportMode('replace')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                        importMode === 'replace'
                          ? 'bg-blue-900/60 border-blue-500 text-white font-bold'
                          : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="block text-[11px]">সম্পূর্ণ প্রতিস্থাপন</span>
                      <span className="text-[9px] font-normal text-slate-400">বর্তমান ডাটা মুছে নতুনটি বসবে</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportMode('merge')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                        importMode === 'merge'
                          ? 'bg-blue-900/60 border-blue-500 text-white font-bold'
                          : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="block text-[11px]">মার্জ / যুক্ত করুন</span>
                      <span className="text-[9px] font-normal text-slate-400">বিদ্যমান ডাটার সাথে যুক্ত হবে</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Button */}
          <div className="pt-3 border-t border-slate-700/80">
            <button
              onClick={handleConfirmRestore}
              disabled={!parsedPreview || isImporting}
              className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                parsedPreview
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg active:scale-98'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
              <span>{isImporting ? 'ডাটা রিস্টোর হচ্ছে...' : 'ডাটাবেস রিস্টোর ও রিকভার করুন (Apply Restore)'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* DISASTER RECOVERY & DATABASE TROUBLESHOOTING GUIDE */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-amber-400">
          <HelpCircle className="w-5 h-5" />
          <h3 className="font-bold text-white text-sm">ডাটাবেস সমস্যা সমাধানের জরুরি টিপস (Database Recovery Tips):</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-750 space-y-1">
            <h4 className="font-bold text-white">১. নিয়মিত ব্যাকআপ রাখুন</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              প্রতি সপ্তাহে বা নতুন অনেক সংবাদ লেখার পর একবার ‘১-ক্লিকে ডাউনলোড’ বোতামে ক্লিক করে ব্যাকআপ ফাইলটি আপনার গুগল ড্রাইভ বা পিসিতে রাখুন।
            </p>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-750 space-y-1">
            <h4 className="font-bold text-white">২. সার্ভার পরিবর্তন বা মাইগ্রেশন</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              এক হোস্টিং থেকে অন্য হোস্টিংয়ে যাওয়ার সময় এই ব্যাকআপ ফাইল ডাউনলোড করে নতুন সার্ভারের অ্যাডমিন প্যানেলে আপলোড করলেই সম্পূর্ণ ডাটা চালু হয়ে যাবে।
            </p>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-750 space-y-1">
            <h4 className="font-bold text-white">৩. ইমেজ লিংক সংরক্ষণ</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ব্যাকআপের মধ্যে প্রতিটি খবরের ফিচার্ড ইমেজ ও ব্লগের কভার ছবির সঠিক লিংক সংরক্ষিত থাকে, ফলে রিস্টোরের পর কোনো ছবি হারিয়ে যাবে না।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

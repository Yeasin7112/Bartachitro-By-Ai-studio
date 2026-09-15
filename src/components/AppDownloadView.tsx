import React, { useState } from 'react';
import { SiteSettings, AndroidAppConfig } from '../types';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft, 
  Bell, 
  Zap, 
  BookOpen, 
  Moon, 
  Newspaper, 
  FileText,
  Share2,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { SiteLogo } from './SiteLogo';

interface AppDownloadViewProps {
  settings: SiteSettings;
  onNavigateHome: () => void;
  onNavigateEpaper?: () => void;
}

export const AppDownloadView: React.FC<AppDownloadViewProps> = ({
  settings,
  onNavigateHome,
  onNavigateEpaper
}) => {
  const app: AndroidAppConfig = settings.android_app || {
    enabled: true,
    app_name: 'বার্তাচিত্র - BartaChitro',
    version_name: 'v1.2.0',
    version_code: 12,
    apk_filename: 'bartachitro-v1.2.0.apk',
    apk_url: '/uploads/bartachitro-v1.2.0.apk',
    file_size_formatted: '14.8 MB',
    uploaded_at: '2026-09-14',
    min_android: 'Android 6.0 (Marshmallow) বা তার পরবর্তী',
    package_name: 'com.bartachitro.news',
    download_count: 1450,
    release_notes: 'সর্বশেষ সংস্করণ v1.2.0: অতি দ্রুত সংবাদ লোডিং, ব্রেকিং নিউজ নোটিফিকেশন অ্যালার্ট, ডার্ক মোড এবং অফলাইন রিডিং ফিচার যুক্ত করা হয়েছে।',
    warning_text: 'প্লে স্টোরের বাইরে সরাসরি APK ফাইল ডাউনলোড করার সময় অ্যান্ড্রয়েড সিকিউরিটি প্রম্পট ("File might be harmful" বা "অজানা উৎস") দেখাতে পারে। এটি অ্যান্ড্রয়েডের একটি স্বাভাবিক নিরাপত্তা প্রটোকল। নির্দ্বিধায় "Download anyway" চাপুন এবং সেটিংসে "Allow from this source" সক্রিয় করে ইনস্টলেশন সম্পন্ন করুন। বার্তাচিত্র অ্যাপটি ১০০% নিরাপদ ও ভাইরাসমুক্ত।',
    instruction_text: 'বার্তাচিত্র মোবাইল অ্যাপটি আপনার অ্যান্ড্রয়েড ফোনে খুব সহজে ইনস্টল করতে নিচের ৪টি ধাপ অনুসরণ করুন:',
    instruction_steps: [
      {
        step: 1,
        title: 'APK ফাইলটি ডাউনলোড করুন',
        description: 'নিচের "ডাউনলোড এপিকে (.APK)" বাটনে ট্যাপ করুন। ব্রাউজারে "File might be harmful" সতর্কবার্তা দেখালে "Download anyway" বাটনে চাপ দিন।'
      },
      {
        step: 2,
        title: 'ডাউনলোডকৃত ফাইলে ট্যাপ করুন',
        description: 'ডাউনলোড সম্পন্ন হওয়ার পর আপনার ফোনের নোটিফিকেশন বারে অথবা Downloads ফোল্ডারে গিয়ে APK ফাইলটিতে ক্লিক করুন।'
      },
      {
        step: 3,
        title: 'Unknown Sources বা অজানা উৎস অন করুন',
        description: 'যদি ফোন সেটিংসে "Install unknown apps" অনুমতি চায়, তবে Settings এ গিয়ে "Allow from this source" অপশনটি চালু (ON) করে দিন।'
      },
      {
        step: 4,
        title: 'ইনস্টলেশন শেষ করুন ও অ্যাপ উপভোগ করুন',
        description: 'স্ক্রিনে "Install" বাটনে ক্লিক করুন। কয়েক সেকেন্ডেই ইনস্টল সম্পন্ন হয়ে যাবে। এবার "Open" চাপ দিয়ে যেকোনো সময় দেশ-বিদেশের ব্রেকিং নিউজ পড়ুন।'
      }
    ],
    features: [
      'মুহূর্তের মধ্যে ব্রেকিং নিউজ পুশ নোটিফিকেশন',
      'অল্প ডেটা খরচ ও সুপার ফাস্ট পেইজ লোডিং স্পিড',
      'ইন্টারনেট সংযোগ ছাড়াও অফলাইনে সংবাদ পড়ার ব্যবস্থা',
      'রাতে চোখের ক্লান্তিমুক্ত পড়ার জন্য আকর্ষণীয় ডার্ক মোড',
      'অনলাইন ই-পত্রিকা ও লাইভ ফটো গ্যালারি ব্রাউজিং'
    ]
  };

  const [downloadCount, setDownloadCount] = useState(app.download_count || 1450);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleDownloadClick = () => {
    setDownloadCount(prev => prev + 1);
    setDownloadStarted(true);

    // Create programmatic anchor click to download the APK
    const link = document.createElement('a');
    link.href = app.apk_url || '/uploads/bartachitro-v1.2.0.apk';
    link.download = app.apk_filename || 'bartachitro-v1.2.0.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const steps = app.instruction_steps && app.instruction_steps.length > 0 
    ? app.instruction_steps 
    : [
        {
          step: 1,
          title: 'APK ফাইলটি ডাউনলোড করুন',
          description: 'নিচের "ডাউনলোড এপিকে (.APK)" বাটনে ট্যাপ করুন। ব্রাউজারে "File might be harmful" সতর্কবার্তা দেখালে "Download anyway" বাটনে চাপ দিন।'
        },
        {
          step: 2,
          title: 'ডাউনলোডকৃত ফাইলে ট্যাপ করুন',
          description: 'ডাউনলোড সম্পন্ন হওয়ার পর আপনার ফোনের নোটিফিকেশন বারে অথবা Downloads ফোল্ডারে গিয়ে APK ফাইলটিতে ক্লিক করুন।'
        },
        {
          step: 3,
          title: 'Unknown Sources বা অজানা উৎস অন করুন',
          description: 'যদি ফোন সেটিংসে "Install unknown apps" অনুমতি চায়, তবে Settings এ গিয়ে "Allow from this source" অপশনটি চালু (ON) করে দিন।'
        },
        {
          step: 4,
          title: 'ইনস্টলেশন শেষ করুন ও অ্যাপ উপভোগ করুন',
          description: 'স্ক্রিনে "Install" বাটনে ক্লিক করুন। কয়েক সেকেন্ডেই ইনস্টল সম্পন্ন হয়ে যাবে। এবার "Open" চাপ দিয়ে যেকোনো সময় দেশ-বিদেশের ব্রেকিং নিউজ পড়ুন।'
        }
      ];

  const featuresList = app.features && app.features.length > 0 ? app.features : [
    'মুহূর্তের মধ্যে ব্রেকিং নিউজ পুশ নোটিফিকেশন',
    'অল্প ডেটা খরচ ও সুপার ফাস্ট পেইজ লোডিং স্পিড',
    'ইন্টারনেট সংযোগ ছাড়াও অফলাইনে সংবাদ পড়ার ব্যবস্থা',
    'রাতে চোখের ক্লান্তিমুক্ত পড়ার জন্য আকর্ষণীয় ডার্ক মোড',
    'অনলাইন ই-পত্রিকা ও লাইভ ফটো গ্যালারি ব্রাউজিং'
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-gray-600 hover:text-red-700 font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>হোমপেজে ফিরে যান</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-gray-500" />
            <span>{copiedLink ? 'লিংক কপি হয়েছে!' : 'বন্ধুদের সাথে শেয়ার করুন'}</span>
          </button>
        </div>

        {/* HERO CARD: Official App Download Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle decorative background accent */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-red-50 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            {/* Left: App Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
              {/* App Icon Mockup */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-red-700 via-red-800 to-rose-900 text-white flex flex-col items-center justify-center p-2 shadow-xl shadow-red-900/20 border-2 border-white ring-4 ring-red-100 shrink-0 group hover:scale-105 transition-transform">
                <Smartphone className="w-10 h-10 text-white" />
                <span className="text-[10px] font-black tracking-tight mt-1 text-amber-200 uppercase">বার্তাচিত্র</span>
              </div>

              {/* Title & Specs */}
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> অফিসিয়াল অ্যান্ড্রয়েড রিলিজ
                  </span>
                  <span className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-gray-200">
                    ভার্সন: {app.version_name || 'v1.2.0'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 font-bengali-display tracking-tight">
                  {app.app_name || 'বার্তাচিত্র - BartaChitro মোবাইল অ্যাপ'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
                  দেশ ও বিশ্বের মুহূর্তের ব্রেকিং নিউজ, বিশ্লেষণধর্মী কলাম ও দৈনিক ই-পত্রিকা পড়ুন অতি সহজে, দ্রুততম গতিতে।
                </p>

                {/* Meta details */}
                <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs text-gray-500 mt-3 flex-wrap">
                  <span>আকার: <strong className="text-gray-800">{app.file_size_formatted || '14.8 MB'}</strong></span>
                  <span>•</span>
                  <span>প্রয়োজন: <strong className="text-gray-800">{app.min_android || 'Android 6.0+'}</strong></span>
                  <span>•</span>
                  <span>মোট ডাউনলোড: <strong className="text-gray-800">{downloadCount.toLocaleString('bn-BD')}+</strong> বার</span>
                </div>
              </div>
            </div>

            {/* Right: Big Download Action Button */}
            <div className="w-full md:w-auto flex flex-col items-center shrink-0">
              <button
                type="button"
                onClick={handleDownloadClick}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-black text-sm sm:text-base rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-700/30 hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer border border-emerald-400/30"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Download className="w-4 h-4 text-white animate-bounce" />
                </div>
                <div className="text-left">
                  <div className="leading-tight">ডাউনলোড এপিকে (.APK)</div>
                  <div className="text-[11px] font-normal text-emerald-100">
                    সাইজ: {app.file_size_formatted || '14.8 MB'} (সরাসরি ডাউনলোড)
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>১০০% নিরাপদ ও ভাইরাসমুক্ত পরীক্ষিত ফাইল</span>
              </div>
            </div>
          </div>

          {/* Download Started Feedback Toast */}
          {downloadStarted && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>ডাউনলোড শুরু হয়েছে!</strong> আপনার ব্রাউজারের নোটিফিকেশন বা 'Downloads' ফোল্ডার চেক করুন। নিচের ৪টি ধাপ অনুসরণ করে অ্যাপটি ইনস্টল করুন।
                </span>
              </div>
              <button
                onClick={() => setDownloadStarted(false)}
                className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1 text-xs"
              >
                ঠিক আছে
              </button>
            </div>
          )}
        </div>

        {/* STEP-BY-STEP INSTALLATION GUIDE */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>সহজ ইনস্টলেশন নির্দেশিকা</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-bengali-display mt-1">
              কীভাবে আপনার ফোনে অ্যাপটি ইনস্টল করবেন?
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {app.instruction_text || 'বার্তাচিত্র মোবাইল অ্যাপটি আপনার অ্যান্ড্রয়েড ফোনে খুব সহজে ইনস্টল করতে নিচের ৪টি ধাপ অনুসরণ করুন:'}
            </p>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {steps.map((st, idx) => (
              <div 
                key={idx}
                className="bg-gray-50/90 hover:bg-gray-50 border border-gray-200/80 rounded-xl p-4 sm:p-5 transition-all flex flex-col justify-between relative group hover:border-red-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-lg bg-red-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {(idx + 1).toLocaleString('bn-BD')}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      ধাপ {(idx + 1).toLocaleString('bn-BD')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 mt-2 font-bengali-display">
                    {st.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                    {st.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* SECURITY & UNKNOWN SOURCES NOTICE */}
          <div className="bg-amber-50/80 border border-amber-300/80 rounded-xl p-4 sm:p-5 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>জরুরি তথ্য: "File might be harmful" বা "Unknown sources" সতর্কবার্তা দেখালে কী করবেন?</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-800/90">
              {app.warning_text || 'প্লে স্টোরের বাইরে সরাসরি APK ফাইল ডাউনলোড করার সময় অ্যান্ড্রয়েড সিকিউরিটি প্রম্পট ("File might be harmful" বা "অজানা উৎস") দেখাতে পারে। এটি অ্যান্ড্রয়েডের একটি স্বাভাবিক নিরাপত্তা প্রটোকল। নির্দ্বিধায় "Download anyway" চাপুন এবং সেটিংসে "Allow from this source" সক্রিয় করে ইনস্টলেশন সম্পন্ন করুন। বার্তাচিত্র অ্যাপটি ১০০% নিরাপদ ও ভাইরাসমুক্ত।'}
            </p>
            <div className="pt-2 border-t border-amber-200/60 flex items-center gap-4 text-[11px] text-amber-900/80 font-medium">
              <span>১. "Download anyway" ক্লিক করুন</span>
              <span>→</span>
              <span>২. সেটিংস থেকে অনুমতি দিন</span>
              <span>→</span>
              <span>৩. ইনস্টল সম্পন্ন করুন</span>
            </div>
          </div>
        </div>

        {/* WHAT'S NEW / RELEASE NOTES */}
        {app.release_notes && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-6">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-red-700" />
              <span>নতুন ভার্সনে যা থাকছে ({app.version_name || 'v1.2.0'})</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              {app.release_notes}
            </p>
          </div>
        )}

        {/* APP FEATURES GRID */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-5">
          <div>
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">অ্যাপের সুবিধা ও বৈশিষ্ট্য</span>
            <h2 className="text-xl font-black text-gray-900 font-bengali-display mt-0.5">
              কেন বার্তাচিত্র মোবাইল অ্যাপ ব্যবহার করবেন?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900">মুহূর্তেই ব্রেকিং নোটিফিকেশন</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">গুরুত্বপূর্ণ জাতীয় ও আন্তর্জাতিক ঘটনা ঘটার সাথে সাথে ফোনে অ্যালার্ট পান।</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900">অতি দ্রুত ও সাশ্রয়ী</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">অল্প ইন্টারনেট খরচে পলকের মধ্যে যেকোনো সংবাদ ও ছবি লোড হয়।</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900">চোখের সুরক্ষায় ডার্ক মোড</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">রাতে চোখ ক্লান্ত না করে স্বচ্ছন্দে পড়ার জন্য রয়েছে পরিচ্ছন্ন ডার্ক থিম।</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900">অফলাইন সেভ ও বুকমার্ক</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">ইন্টারনেট সংযোগ ছাড়াই পরবর্তীতে পড়ার জন্য পছন্দের প্রতিবেদন সংরক্ষণ করুন।</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Newspaper className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900">দৈনিক ই-পত্রিকা সংস্করণ</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">মুদ্রিত পত্রিকার আদলে প্রতিদিনের মূল ই-পেপার সরাসরি অ্যাপে উল্টিয়ে পড়ুন।</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900">ব্যবহারবান্ধব ইন্টারফেস</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">সহজ এক ক্লিকে ক্যাটাগরি ব্রাউজিং ও বন্ধুদের সাথে দ্রুত শেয়ারিং সুবিধা।</p>
            </div>
          </div>
        </div>

        {/* BOTTOM CALL TO ACTION */}
        <div className="bg-gradient-to-br from-gray-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-lg sm:text-xl font-black font-bengali-display">
              এখনই বার্তাচিত্র অ্যাপ ইনস্টল করুন
            </h3>
            <p className="text-xs text-gray-400 max-w-md">
              ফ্রি ডাউনলোড করুন এবং সার্বক্ষণিক সঠিক ও বস্তুনিষ্ঠ সংবাদের সাথে যুক্ত থাকুন।
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadClick}
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>সরাসরি APK ডাউনলোড ({app.file_size_formatted || '14.8 MB'})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

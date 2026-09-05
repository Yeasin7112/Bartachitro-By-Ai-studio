import React from 'react';
import { Shield, Award, Users, CheckCircle, ArrowLeft } from 'lucide-react';
import { SiteSettings } from '../types';

interface AboutViewProps {
  settings: SiteSettings;
  onNavigateHome: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  settings,
  onNavigateHome
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <button 
        onClick={onNavigateHome}
        className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-red-700 mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> প্রচ্ছদে ফিরে যান
      </button>

      <div className="border-b-2 border-red-700 pb-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-950 font-bengali-display">
          আমাদের সম্পর্কে (About BartaChitro)
        </h1>
        <p className="text-xs text-gray-600 mt-1">সত্যের সংবাদ, সবার ভাষায় - নিরপেক্ষ ও নির্ভীক সাংবাদিকতার অঙ্গীকার।</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm space-y-6 text-gray-800 leading-relaxed">
          <h2 className="text-xl font-bold text-gray-950 font-bengali-display text-red-700">
            ‘বার্তাচিত্র’-এর লক্ষ্য ও আদর্শ
          </h2>
          <p>
            ‘বার্তাচিত্র’ (BartaChitro) বাংলাদেশের অন্যতম আধুনিক, দ্রুত ও নিরপেক্ষ ডিজিটাল অনলাইন সংবাদপত্র এবং ই-পত্রিকা। বস্তুনিষ্ঠ সাংবাদিকতা, জাতীয় স্বার্থরক্ষা এবং সর্বস্তরের পাঠকের কাছে নির্ভরযোগ্য তথ্য তুলে ধরাই আমাদের প্রধান উদ্দেশ্য।
          </p>
          <p>
            আমরা বিশ্বাস করি—সংবাদ কেবল ঘটনা নয়, এটি নাগরিকের অধিকার ও সচেতনতার অন্যতম মাধ্যম। রাজনীতি, অর্থনীতি, আন্তর্জাতিক পরিস্থিতি থেকে শুরু করে খেলাধুলা, বিজ্ঞান ও বিনোদন—প্রতিটি খাতের সঠিক ও পুঙ্খানুপুঙ্খ বিশ্লেষণ আমাদের সম্পাদকীয় দলের মূল শক্তি।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                <Shield className="w-4 h-4 text-red-700" />
                বস্তুনিষ্ঠতা
              </div>
              <p className="text-xs text-gray-600">সব সময় যাচাইকৃত ও নির্ভরযোগ্য তথ্য প্রকাশে আমরা আপসহীন।</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                <Award className="w-4 h-4 text-red-700" />
                পাঠকের আস্থা
              </div>
              <p className="text-xs text-gray-600">লক্ষাধিক দৈনিক পাঠকের অবিচল ভালোবাসাই আমাদের পথচলার প্রেরণা।</p>
            </div>
          </div>
        </div>

        {/* Editorial Board Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 font-bengali-display mb-4 border-b-2 border-red-700 pb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-red-700" />
            সম্পাদকীয় পর্ষদ
          </h3>

          <div className="space-y-4 text-sm">
            <div>
              <span className="text-xs font-bold text-red-700 block">প্রধান সম্পাদক:</span>
              <p className="font-bold text-gray-900 text-base">{settings.editor_name}</p>
            </div>

            <div>
              <span className="text-xs font-bold text-red-700 block">নির্বাহী সম্পাদক:</span>
              <p className="font-bold text-gray-900 text-base">{settings.executive_editor}</p>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-600">
              <p>বার্তা সম্পাদক: মাহমুদুর রহমান</p>
              <p>প্রধান বার্তা প্রতিবেদক: নাজমুল হুদা</p>
              <p>ডিজিটাল ও আইটি প্রধান: আশিকুর রহমান</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { SiteSettings, Category } from '../types';
import { Mail, Phone, MapPin, Newspaper, ShieldCheck } from 'lucide-react';
import { SiteLogo } from './SiteLogo';

interface FooterProps {
  settings: SiteSettings;
  categories: Category[];
  onSelectCategory: (slug: string) => void;
  onNavigateHome: () => void;
  onNavigateEpaper: () => void;
  onNavigateContact: () => void;
  onNavigateAbout: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  categories,
  onSelectCategory,
  onNavigateHome,
  onNavigateEpaper,
  onNavigateContact,
  onNavigateAbout,
  onOpenAdmin
}) => {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t-2 border-red-700 px-4 sm:px-6 py-8 text-xs">
      {/* High Density Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 pb-6 border-b border-gray-800">
        {/* Categories Col 1 */}
        <div>
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-800">
            জাতীয় ও রাজনীতি
          </h4>
          <div className="flex flex-col gap-1.5 text-[11px]">
            {categories.slice(0, 4).map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCategory(c.slug)}
                className="text-left text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Col 2 */}
        <div>
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-800">
            অন্যান্য বিভাগ
          </h4>
          <div className="flex flex-col gap-1.5 text-[11px]">
            {categories.slice(4, 8).map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCategory(c.slug)}
                className="text-left text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Special Services */}
        <div>
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-800">
            ডিজিটাল সেবা
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <button 
                onClick={onNavigateEpaper} 
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Newspaper className="w-3 h-3" /> আজকের ই-পত্রিকা
              </button>
            </li>
            <li>
              <button onClick={onNavigateAbout} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                আমাদের সম্পর্কে
              </button>
            </li>
            <li>
              <button onClick={onNavigateContact} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                যোগাযোগ ও বার্তা
              </button>
            </li>
            <li>
              <button 
                onClick={onOpenAdmin} 
                className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3 text-red-500" /> অ্যাডমিন লগইন
              </button>
            </li>
          </ul>
        </div>

        {/* Office Contact */}
        <div>
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-800">
            যোগাযোগ
          </h4>
          <div className="text-[11px] text-gray-400 space-y-1.5">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{settings.address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-red-500 shrink-0" />
              <span>{settings.phone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-red-500 shrink-0" />
              <span>{settings.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* High Density Bottom Masthead Bar with Official Site Logo */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
          {/* Original wave-shaped logo */}
          <div 
            onClick={onNavigateHome} 
            className="cursor-pointer inline-flex items-center hover:opacity-95 transition-opacity"
            title="বার্তাচিত্র"
          >
            <SiteLogo size="md" />
          </div>
          <p className="text-gray-400 text-[11px]">
            © ২০২৬ বার্তাচিত্র মিডিয়া লিমিটেড | সর্বস্বত্ব সংরক্ষিত
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-1.5">
          <div className="flex gap-4 uppercase font-bold text-[10px] tracking-wider">
            <button onClick={onNavigateAbout} className="hover:text-white transition-colors cursor-pointer">
              আমাদের সম্পর্কে
            </button>
            <button onClick={onNavigateContact} className="hover:text-white transition-colors cursor-pointer">
              গোপনীয়তা
            </button>
            <button onClick={onNavigateContact} className="hover:text-white transition-colors cursor-pointer">
              যোগাযোগ
            </button>
          </div>
          <p className="italic text-[10px] text-gray-400 text-center md:text-right">
            সম্পাদক: {settings.editor_name || 'আহমেদ রফিক চৌধুরী'} • নির্বাহী সম্পাদক: {settings.executive_editor || 'শাহনেওয়াজ করিম'}
          </p>
        </div>
      </div>
    </footer>
  );
};

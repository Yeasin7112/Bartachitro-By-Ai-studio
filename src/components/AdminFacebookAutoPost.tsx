import React, { useState } from 'react';
import { 
  Share2, CheckCircle2, AlertCircle, RefreshCw, Send, Eye, EyeOff, 
  ExternalLink, Sparkles, Copy, Check, ShieldCheck, Rss, Layers, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react';
import { SiteSettings, FacebookAutoPostConfig, NewsArticle } from '../types';
import { testFacebookConnection, postArticleToFacebook } from '../utils/api';
import { bnNum } from '../utils/bengaliHelpers';

interface AdminFacebookAutoPostProps {
  settings: SiteSettings;
  newsList: NewsArticle[];
  onUpdateSettings: (settings: SiteSettings) => Promise<void>;
  onUpdateNewsArticle?: (article: NewsArticle) => Promise<void>;
}

export const AdminFacebookAutoPost: React.FC<AdminFacebookAutoPostProps> = ({
  settings,
  newsList,
  onUpdateSettings,
  onUpdateNewsArticle
}) => {
  const defaultConfig: FacebookAutoPostConfig = {
    enabled: false,
    page_id: '',
    page_access_token: '',
    auto_post_on_create: true,
    auto_post_on_breaking: true,
    post_type: 'photo',
    default_hashtags: '#বার্তাচিত্র #সংবাদ #বাংলাদেশ',
    test_mode: false,
    last_post_status: 'idle'
  };

  const [config, setConfig] = useState<FacebookAutoPostConfig>(() => ({
    ...defaultConfig,
    ...(settings.facebook_auto_post || {})
  }));

  const [showToken, setShowToken] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; page?: any } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [copiedRss, setCopiedRss] = useState(false);

  // Manual On-demand Posting States
  const [selectedArticleId, setSelectedArticleId] = useState<number>(() => {
    const firstPublished = newsList.find(n => n.status === 'published');
    return firstPublished ? firstPublished.id : 0;
  });
  const [customPostType, setCustomPostType] = useState<'photo' | 'link'>(config.post_type || 'photo');
  const [customHashtags, setCustomHashtags] = useState<string>(config.default_hashtags || '#বার্তাচিত্র #সংবাদ #বাংলাদেশ');
  const [postingNow, setPostingNow] = useState(false);
  const [manualPostFeedback, setManualPostFeedback] = useState<{ success: boolean; message: string; post_url?: string } | null>(null);

  const selectedArticle = newsList.find(n => n.id === selectedArticleId);

  // RSS Feed URL
  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://bartachitro.com';
  const rssUrl = `${currentHost}/rss.xml`;

  // Test Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testFacebookConnection({
        page_id: config.page_id.trim(),
        page_access_token: config.page_access_token.trim(),
        test_mode: config.test_mode
      });
      setTestResult({
        success: true,
        message: res.message,
        page: res.page
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'ফেসবুক পেজ সংযোগ ব্যর্থ হয়েছে।'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);
    try {
      const updatedSettings: SiteSettings = {
        ...settings,
        facebook_auto_post: config
      };
      await onUpdateSettings(updatedSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'সেটিংস সংরক্ষণে সমস্যা হয়েছে');
    }
  };

  // Manual Post Article
  const handleManualPostArticle = async () => {
    if (!selectedArticle) return;
    setPostingNow(true);
    setManualPostFeedback(null);
    try {
      const res = await postArticleToFacebook({
        article_id: selectedArticle.id,
        page_id: config.page_id,
        page_access_token: config.page_access_token,
        post_type: customPostType,
        title: selectedArticle.title,
        summary: selectedArticle.summary || '',
        slug: selectedArticle.slug,
        image_url: selectedArticle.featured_image,
        hashtags: customHashtags,
        test_mode: config.test_mode
      });

      setManualPostFeedback({
        success: true,
        message: res.message || 'ফেসবুক পেজে সফলভাবে পোস্ট করা হয়েছে!',
        post_url: res.post_url
      });

      if (onUpdateNewsArticle && res.post_id) {
        await onUpdateNewsArticle({
          ...selectedArticle,
          facebook_post_id: res.post_id,
          facebook_posted_at: new Date().toISOString(),
          facebook_post_url: res.post_url,
          facebook_post_status: 'posted'
        });
      }
    } catch (err: any) {
      setManualPostFeedback({
        success: false,
        message: err.message || 'পোস্ট পাঠাতে সমস্যা হয়েছে।'
      });
    } finally {
      setPostingNow(false);
    }
  };

  // Copy RSS
  const handleCopyRss = () => {
    navigator.clipboard.writeText(rssUrl);
    setCopiedRss(true);
    setTimeout(() => setCopiedRss(false), 2000);
  };

  // Recently posted articles
  const facebookPostedNews = newsList.filter(n => n.facebook_post_id || n.facebook_post_status === 'posted');

  return (
    <div className="space-y-6 text-slate-100 font-bengali-body">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-950/60 border border-blue-800/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>মেটা গ্রাফ এপিআই ও আরএসএস অটোমেশন</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-bengali-display text-white">
              ফেসবুক পেজ অটো-পোস্ট ও সোশ্যাল শেয়ারিং কনফিগারেশন
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              নতুন কোনো সংবাদ সাইটে পাবলিশ হওয়ার সাথে সাথে আপনার অফিসিয়াল ফেসবুক পেজে সম্পূর্ণ স্বয়ংক্রিয়ভাবে ছবি, শিরোনাম ও বিস্তারিত লিংক সহ পোস্ট হয়ে যাবে।
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
              config.enabled 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${config.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
              {config.enabled ? 'অটো-পোস্ট সক্রিয় (Active)' : 'অটো-পোস্ট নিষ্ক্রিয় (Off)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Settings Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-lg">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                মেটা গ্রাফ এপিআই ক্রেডেনশিয়াল (Credentials)
              </h3>
              <span className="text-[11px] text-slate-400">API v19.0</span>
            </div>

            {/* Enable Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">স্বয়ংক্রিয় ফেসবুক পোস্টিং চালু করুন</span>
                <span className="text-xs text-slate-400">সংবাদ প্রকাশের সাথে সাথে পেজে স্বয়ংক্রিয় পোস্ট হবে</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Test / Demo Mode Toggle */}
            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/40 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-blue-200 block flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  সিমুলেশন / টেস্ট মোড (Simulation Mode)
                </span>
                <span className="text-xs text-slate-400">আসল মেটা টোকেন ছাড়াই সিস্টেম যাচাই ও টেস্ট পোস্ট করতে এটি চালু রাখুন</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.test_mode}
                  onChange={(e) => setConfig({ ...config, test_mode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Page ID */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ফেসবুক পেজ আইডি (Facebook Page ID) *
              </label>
              <input
                type="text"
                required={!config.test_mode}
                value={config.page_id}
                onChange={(e) => setConfig({ ...config, page_id: e.target.value })}
                placeholder="যেমন: 104523984576123 বা আপনার পেজের আইডি"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                আপনার ফেসবুক পেজের About &gt; Page Transparency সেকশনে সংখ্যাসূচক পেজ আইডি পাওয়া যাবে।
              </p>
            </div>

            {/* Page Access Token */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  পেজ পার্মানেন্ট এক্সেস টোকেন (Page Access Token) *
                </label>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                >
                  {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showToken ? 'লুকান' : 'দেখুন'}
                </button>
              </div>
              <input
                type={showToken ? 'text' : 'password'}
                required={!config.test_mode}
                value={config.page_access_token}
                onChange={(e) => setConfig({ ...config, page_access_token: e.target.value })}
                placeholder={config.test_mode ? "টেস্ট মোডে টোকেন ঐচ্ছিক (e.g. test_token)" : "EAA..."}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Meta for Developers (developers.facebook.com) থেকে Graph API Explorer বা System User এর মাধ্যমে 'pages_manage_posts' ও 'pages_read_engagement' পারমিশন সহ সংগৃহীত টোকেন।
              </p>
            </div>

            {/* Post Format Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                পোস্ট ফরম্যাট (Post Format Style)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`border rounded-xl p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                  config.post_type === 'photo' 
                    ? 'border-blue-500 bg-blue-950/20 text-white' 
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="post_type"
                    value="photo"
                    checked={config.post_type === 'photo'}
                    onChange={() => setConfig({ ...config, post_type: 'photo' })}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <span className="text-xs font-bold block flex items-center gap-1 text-white">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                      ফটো পোস্ট (ছবি ও ক্যাপশন)
                    </span>
                    <span className="text-[11px] text-slate-400">সর্বোচ্চ এনগেজমেন্ট ও রিচ পেতে ফেসবুক ফিডে বড় ফটো কার্ড আকারে পোস্ট হবে। (প্রস্তাবিত)</span>
                  </div>
                </label>

                <label className={`border rounded-xl p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                  config.post_type === 'link' 
                    ? 'border-blue-500 bg-blue-950/20 text-white' 
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="post_type"
                    value="link"
                    checked={config.post_type === 'link'}
                    onChange={() => setConfig({ ...config, post_type: 'link' })}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <span className="text-xs font-bold block flex items-center gap-1 text-white">
                      <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                      লিংক পোস্ট (Feed Link Preview)
                    </span>
                    <span className="text-[11px] text-slate-400">ফেসবুকের স্ট্যান্ডার্ড লিংক কার্ড তৈরি হবে যা ক্লিক করলে সরাসরি ওয়েবসাইটে নিয়ে যাবে।</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Triggers & Hashtags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">স্বয়ংক্রিয় পোস্টিং ট্রিগার</label>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={config.auto_post_on_create}
                      onChange={(e) => setConfig({ ...config, auto_post_on_create: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-blue-600"
                    />
                    <span>নতুন সংবাদ পাবলিশ হলে সাথে সাথে পোস্ট</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={config.auto_post_on_breaking}
                      onChange={(e) => setConfig({ ...config, auto_post_on_breaking: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-blue-600"
                    />
                    <span>ব্রেকিং নিউজ হলে নিশ্চিত পোস্ট</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ডিফল্ট হ্যাশট্যাগ (Default Hashtags)
                </label>
                <input
                  type="text"
                  value={config.default_hashtags}
                  onChange={(e) => setConfig({ ...config, default_hashtags: e.target.value })}
                  placeholder="#বার্তাচিত্র #সংবাদ #বাংলাদেশ"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-500">পোস্টের নিচে এই হ্যাশট্যাগগুলো যুক্ত থাকবে</span>
              </div>
            </div>

            {/* Test Connection Button & Status */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {testingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>{testingConnection ? 'যাচাই করা হচ্ছে...' : 'সংযোগ পরীক্ষা করুন (Test Connection)'}</span>
              </button>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" /> সেটিংস সংরক্ষণ করুন
              </button>
            </div>

            {/* Feedback Messages */}
            {saveSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>ফেসবুক সেটিংস সফলভাবে আপডেট ও সংরক্ষণ করা হয়েছে!</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{saveError}</span>
              </div>
            )}

            {testResult && (
              <div className={`p-4 rounded-xl border text-xs ${
                testResult.success 
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' 
                  : 'bg-red-950/30 border-red-500/40 text-red-200'
              }`}>
                <div className="flex items-start gap-2.5">
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">{testResult.message}</p>
                    {testResult.page && (
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-emerald-500/20">
                        {testResult.page.picture?.data?.url && (
                          <img 
                            src={testResult.page.picture.data.url} 
                            alt="Page Avatar" 
                            className="w-10 h-10 rounded-full border border-emerald-500/40"
                          />
                        )}
                        <div>
                          <div className="font-bold text-white text-sm">{testResult.page.name}</div>
                          <div className="text-[11px] text-emerald-300">
                            পেজ আইডি: {testResult.page.id} {testResult.page.followers_count ? `· ফলোয়ার: ${bnNum(testResult.page.followers_count)}` : ''}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* RSS Feed Integration Card (Zapier / Buffer / Make) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                  <Rss className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">আরএসএস ফিড লিঙ্ক (RSS 2.0 XML Feed)</h3>
                  <p className="text-[11px] text-slate-400">বিনা খরচে Zapier, Make, Buffer বা IFTTT এর মাধ্যমে অটো-পোস্ট করতে ব্যবহার করুন</p>
                </div>
              </div>
              <a 
                href="/rss.xml" 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                ফিড দেখুন <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={rssUrl}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono"
              />
              <button
                type="button"
                onClick={handleCopyRss}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer border border-slate-700"
              >
                {copiedRss ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRss ? 'কপি হয়েছে' : 'কপি লিঙ্ক'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              💡 <strong>টিপস:</strong> আপনি যদি মেটা ডেভেলপার এপিআই দিয়ে জটিলতা এড়াতে চান, তবে <a href="https://buffer.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">Buffer</a> বা <a href="https://zapier.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">Zapier</a>-এ আপনার ফেসবুক পেজ যুক্ত করে এই আরএসএস লিংকটি 'RSS-to-Social' অপশনে বসিয়ে দিন। প্রতিবার নতুন সংবাদ প্রকাশিত হলেই তা পেজে স্বয়ংক্রিয়ভাবে পোস্ট হয়ে যাবে।
            </p>
          </div>
        </div>

        {/* Right Column: One-Click Manual Poster & Live FB Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Manual Post Tool */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-[#1877f2]" />
                যেকোনো সংবাদ সরাসরি পেজে পোস্ট করুন
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">সংবাদ নির্বাচন করুন</label>
              <select
                value={selectedArticleId}
                onChange={(e) => {
                  setSelectedArticleId(Number(e.target.value));
                  setManualPostFeedback(null);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {newsList.filter(n => n.status === 'published').slice(0, 30).map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title} {article.facebook_post_id ? '✓ (পূর্বে পোস্ট হয়েছে)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedArticle && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomPostType('photo')}
                    className={`text-xs py-1.5 px-3 rounded-lg font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      customPostType === 'photo' 
                        ? 'bg-blue-600 text-white border-blue-500' 
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" /> ফটো পোস্ট
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomPostType('link')}
                    className={`text-xs py-1.5 px-3 rounded-lg font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      customPostType === 'link' 
                        ? 'bg-blue-600 text-white border-blue-500' 
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" /> লিংক প্রিভিউ
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">কাস্টম হ্যাশট্যাগ</label>
                  <input
                    type="text"
                    value={customHashtags}
                    onChange={(e) => setCustomHashtags(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Post Action Button */}
                <button
                  type="button"
                  onClick={handleManualPostArticle}
                  disabled={postingNow || !selectedArticle}
                  className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md cursor-pointer disabled:opacity-50"
                >
                  {postingNow ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{postingNow ? 'ফেসবুকে পাঠানো হচ্ছে...' : 'এই সংবাদটি ফেসবুক পেজে পোস্ট করুন'}</span>
                </button>

                {manualPostFeedback && (
                  <div className={`p-3 rounded-xl border text-xs ${
                    manualPostFeedback.success 
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                      : 'bg-red-950/40 border-red-500/40 text-red-200'
                  }`}>
                    <p className="font-bold flex items-center gap-1.5">
                      {manualPostFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                      {manualPostFeedback.message}
                    </p>
                    {manualPostFeedback.post_url && (
                      <a 
                        href={manualPostFeedback.post_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-1 mt-1.5 text-[11px] font-semibold"
                      >
                        পোস্টটি ফেসবুকে ওপেন করুন <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Facebook Live Post Simulator */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white text-slate-900 shadow-xl">
            <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 font-bold">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1877f2]"></span>
                ফেসবুক ফিড প্রিভিউ (Live Preview)
              </span>
              <span className="text-[11px] text-slate-500">{customPostType === 'photo' ? 'Photo Post' : 'Link Post'}</span>
            </div>

            <div className="p-3.5">
              {/* Profile Bar */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-9 h-9 rounded-full bg-[#1877f2] text-white flex items-center justify-center font-bold text-sm">
                  {settings.site_name ? settings.site_name.slice(0, 1) : 'ব'}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {settings.site_name || 'বার্তাচিত্র - BartaChitro'}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1877f2] fill-[#1877f2]/20" />
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span>এইমাত্র</span>
                    <span>·</span>
                    <span>🌐</span>
                  </div>
                </div>
              </div>

              {/* Caption Text */}
              {selectedArticle && (
                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line mb-3 line-clamp-4">
                  {selectedArticle.title}
                  {'\n\n'}
                  {selectedArticle.summary}
                  {'\n\n'}
                  বিস্তারিত পড়ুন: {`${currentHost}/article.php?slug=${encodeURIComponent(selectedArticle.slug)}`}
                  {'\n\n'}
                  {customHashtags}
                </div>
              )}
            </div>

            {/* Image Preview */}
            {selectedArticle?.featured_image && (
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                <img 
                  src={selectedArticle.featured_image} 
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Link Bottom Bar */}
            <div className="bg-slate-100 p-3 border-t border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                {window.location.hostname || 'BARTACHITRO.COM'}
              </div>
              <div className="font-bold text-slate-900 text-xs line-clamp-1 mt-0.5">
                {selectedArticle?.title}
              </div>
              <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                {selectedArticle?.summary}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Table: Articles posted to Facebook */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              ফেসবুক পেজে সাম্প্রতিক পোস্টের হিস্টোরি
            </h3>
            <p className="text-xs text-slate-400">যেসব সংবাদ ইতিমধ্যে ফেসবুক পেজে সফলভাবে পোস্ট করা হয়েছে</p>
          </div>
          <span className="text-xs text-blue-400 font-bold bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-800/40">
            মোট পোস্ট: {bnNum(facebookPostedNews.length)} টি
          </span>
        </div>

        {facebookPostedNews.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            এখনও ফেসবুক পেজে কোনো সংবাদ পোস্ট করা হয়নি। উপরের "সরাসরি পেজে পোস্ট করুন" বা নতুন সংবাদ প্রকাশ করুন।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">সংবাদ শিরোনাম</th>
                  <th className="py-2.5 px-3">ক্যাটাগরি</th>
                  <th className="py-2.5 px-3">পোস্ট স্ট্যাটাস</th>
                  <th className="py-2.5 px-3">ফেসবুক পোস্ট আইডি</th>
                  <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {facebookPostedNews.slice(0, 15).map((article) => (
                  <tr key={article.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-white max-w-xs truncate">
                      {article.title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {article.category_name}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        পোস্ট হয়েছে
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {article.facebook_post_id}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {article.facebook_post_url ? (
                        <a
                          href={article.facebook_post_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold text-xs"
                        >
                          ফেসবুকে দেখুন <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

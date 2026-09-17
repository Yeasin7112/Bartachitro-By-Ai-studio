import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TrendingUp, Users, Eye, Calendar, 
  Award, BarChart3, Clock, 
  FolderTree, CheckCircle, Download, 
  RefreshCw, Radio, Smartphone, Monitor, Tablet, Trash2, 
  AlertTriangle, Check, Activity
} from 'lucide-react';
import { NewsArticle, BlogPost, Category, AdminUser } from '../../types';
import { bnNum, bnDate, timeAgoBn } from '../../utils/bengaliHelpers';
import { 
  fetchAnalyticsSummary, 
  resetAllViews, 
  AnalyticsSummary 
} from '../../utils/api';

interface AdminAnalyticsDashboardProps {
  newsList: NewsArticle[];
  blogs: BlogPost[];
  categories: Category[];
  users?: AdminUser[];
  onSelectArticle?: (article: NewsArticle) => void;
  onRefreshData?: () => void;
}

export const AdminAnalyticsDashboard: React.FC<AdminAnalyticsDashboardProps> = ({
  newsList,
  blogs,
  categories,
  users = [],
  onSelectArticle,
  onRefreshData
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'weekly' | 'monthly' | 'all'>('weekly');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ day: string; views: number; x: number; y: number } | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  // Reset confirmation modal state
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string>('');

  // 1. Fetch Real Analytics Data from API
  const loadAnalytics = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      const data = await fetchAnalyticsSummary(timeRange);
      if (data && data.metrics) {
        setAnalyticsData(data);
        const now = new Date();
        setLastUpdated(`${bnNum(now.getHours().toString().padStart(2, '0'))}:${bnNum(now.getMinutes().toString().padStart(2, '0'))}:${bnNum(now.getSeconds().toString().padStart(2, '0'))}`);
      }
    } catch (err) {
      console.warn('Could not fetch real analytics data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadAnalytics(true);
  }, [loadAnalytics]);

  // Auto-refresh every 25 seconds for real-time live monitoring
  useEffect(() => {
    const timer = setInterval(() => {
      loadAnalytics(false);
    }, 25000);
    return () => clearInterval(timer);
  }, [loadAnalytics]);

  // 2. Computed Core Totals
  const localNewsViews = useMemo(() => newsList.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0), [newsList]);
  const localBlogViews = useMemo(() => blogs.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0), [blogs]);
  const grandTotalViews = analyticsData?.metrics?.grand_total_views ?? (localNewsViews + localBlogViews);

  // Real Counts (No synthetic simulation math!)
  const todayViews = analyticsData?.metrics?.today_views ?? 0;
  const todayUnique = analyticsData?.metrics?.today_unique ?? 0;
  const weeklyViews = analyticsData?.metrics?.weekly_views ?? todayViews;
  const monthlyViews = analyticsData?.metrics?.monthly_views ?? weeklyViews;

  // 3. Published vs Draft Metrics
  const publishedNewsCount = useMemo(() => newsList.filter(n => n.status === 'published').length, [newsList]);
  const draftNewsCount = useMemo(() => newsList.filter(n => n.status === 'draft').length, [newsList]);
  const publishedBlogsCount = useMemo(() => blogs.filter(b => b.status === 'published').length, [blogs]);
  const draftBlogsCount = useMemo(() => blogs.filter(b => b.status === 'draft').length, [blogs]);

  const totalContent = newsList.length + blogs.length;
  const publishedTotal = publishedNewsCount + publishedBlogsCount;
  const draftTotal = draftNewsCount + draftBlogsCount;
  const publishedPercent = totalContent > 0 ? Math.round((publishedTotal / totalContent) * 100) : 100;

  // 4. Most Read News (Top 8 based on actual views)
  const mostReadNews = useMemo(() => {
    return [...newsList]
      .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
      .slice(0, 8);
  }, [newsList]);

  const topArticleMaxViews = mostReadNews[0]?.views || 1;

  // 5. Most Popular Categories by Actual Views
  const categoryStats = useMemo(() => {
    const map = new Map<number, { id: number; name: string; views: number; count: number }>();

    categories.forEach(c => {
      map.set(c.id, { id: c.id, name: c.name, views: 0, count: 0 });
    });

    newsList.forEach(n => {
      const existing = map.get(n.category_id);
      if (existing) {
        existing.views += Number(n.views) || 0;
        existing.count += 1;
      } else if (n.category_name) {
        map.set(n.category_id, {
          id: n.category_id,
          name: n.category_name,
          views: Number(n.views) || 0,
          count: 1
        });
      }
    });

    return Array.from(map.values())
      .filter(item => item.count > 0 || item.views > 0)
      .sort((a, b) => b.views - a.views);
  }, [categories, newsList]);

  // 6. Top Authors / Reporters by Actual Views
  const authorLeaderboard = useMemo(() => {
    const map = new Map<string, { name: string; count: number; views: number; avatar?: string }>();

    newsList.forEach(n => {
      const author = (n.author_name || 'বার্তাচিত্র প্রতিবেদক').trim();
      const existing = map.get(author);
      const views = Number(n.views) || 0;
      if (existing) {
        existing.count += 1;
        existing.views += views;
      } else {
        const matchedUser = users.find(u => u.name === author);
        map.set(author, {
          name: author,
          count: 1,
          views: views,
          avatar: matchedUser?.avatar
        });
      }
    });

    blogs.forEach(b => {
      const author = (b.author_name || 'কলামিস্ট').trim();
      const existing = map.get(author);
      const views = Number(b.views) || 0;
      if (existing) {
        existing.count += 1;
        existing.views += views;
      } else {
        map.set(author, {
          name: author,
          count: 1,
          views: views,
          avatar: b.author_avatar
        });
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);
  }, [newsList, blogs, users]);

  // 7. Real Traffic Trends Chart Data (Directly from backend daily_traffic logs)
  const chartData = useMemo(() => {
    if (analyticsData?.chart_data && analyticsData.chart_data.length > 0) {
      return analyticsData.chart_data.map(p => ({
        day: p.day,
        views: p.views || 0,
        news_views: p.news_views || 0,
        blog_views: p.blog_views || 0
      }));
    }

    // Default fallback points for the last 7 days with genuine 0 count if no visits yet
    const daysCount = timeRange === 'monthly' ? 14 : timeRange === 'today' ? 1 : 7;
    const bengaliDays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
    const now = new Date();
    const fallback: { day: string; views: number }[] = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = bengaliDays[d.getDay()];
      const dateNum = bnNum(d.getDate());
      fallback.push({
        day: `${dayName} (${dateNum})`,
        views: i === 0 ? todayViews : 0
      });
    }
    return fallback;
  }, [analyticsData, timeRange, todayViews]);

  // SVG Chart Calculation
  const maxChartVal = Math.max(...chartData.map(p => p.views), 10);
  const minChartVal = 0;
  const chartHeight = 180;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 25;

  const svgPoints = chartData.map((p, idx) => {
    const x = paddingX + (idx / Math.max(chartData.length - 1, 1)) * (chartWidth - paddingX * 2);
    const normalizedY = (p.views - minChartVal) / (maxChartVal - minChartVal || 1);
    const y = chartHeight - paddingY - normalizedY * (chartHeight - paddingY * 2);
    return { x, y, ...p };
  });

  const pathD = svgPoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = svgPoints.length > 0 
    ? `${pathD} L ${svgPoints[svgPoints.length - 1]?.x},${chartHeight - paddingY} L ${svgPoints[0]?.x},${chartHeight - paddingY} Z`
    : '';

  // Device Stats Calculation
  const deviceStats = analyticsData?.device_stats || { desktop: 0, mobile: 0, tablet: 0 };
  const totalLoggedDevices = (deviceStats.desktop + deviceStats.mobile + deviceStats.tablet) || 1;
  const desktopPercent = Math.round((deviceStats.desktop / totalLoggedDevices) * 100);
  const mobilePercent = Math.round((deviceStats.mobile / totalLoggedDevices) * 100);
  const tabletPercent = Math.round((deviceStats.tablet / totalLoggedDevices) * 100);

  // Handle Reset All Demo Views
  const handleConfirmResetViews = async () => {
    setIsResetting(true);
    try {
      const res = await resetAllViews();
      setResetSuccessMessage(res.message || 'সকল ডেমো ভিউ সফলভাবে রিসেট করা হয়েছে।');
      await loadAnalytics(true);
      if (onRefreshData) onRefreshData();
      setTimeout(() => {
        setShowResetModal(false);
        setResetSuccessMessage('');
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'রিসেট করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsResetting(false);
    }
  };

  // Export Analytics Summary Report
  const handleExportAnalytics = () => {
    const report = {
      title: 'বার্তাচিত্র - রিয়েল-টাইম অ্যাডমিন অ্যানালিটিক্স রিপোর্ট',
      export_date: new Date().toISOString(),
      summary: {
        total_views: grandTotalViews,
        today_views: todayViews,
        today_unique_visitors: todayUnique,
        weekly_views: weeklyViews,
        monthly_views: monthlyViews,
        total_news: newsList.length,
        published_news: publishedNewsCount,
        draft_news: draftNewsCount,
        total_blogs: blogs.length,
        published_blogs: publishedBlogsCount,
        draft_blogs: draftBlogsCount
      },
      chart_history: chartData,
      most_read_news: mostReadNews.map(n => ({
        id: n.id,
        title: n.title,
        category: n.category_name,
        author: n.author_name,
        views: n.views,
        published_at: n.published_at
      })),
      category_breakdown: categoryStats,
      top_authors: authorLeaderboard
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bartachitro-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <BarChart3 className="w-6 h-6 text-red-400" />
              <h1 className="text-xl sm:text-2xl font-black text-white font-bengali-display">
                অ্যাডমিন অ্যানালিটিক্স ও রিয়েল-টাইম ট্রাফিক কাউন্টার
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                লাইভ ট্র্যাকিং
              </span>
            </div>
            <p className="text-xs text-slate-400">
              প্রকৃত ডাটাবেজ লগ ও ভিজিটর সেশন অনুযায়ী প্রতিটি সংবাদ পাঠের আসল পরিসংখ্যান। কোনো ডেমো বা কাল্পনিক সংখ্যা নয়।
            </p>
          </div>

          {/* Controls: Timeframe, Refresh & Demo Reset */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Live Refresh Status */}
            <button
              onClick={() => loadAnalytics(true)}
              disabled={isRefreshing}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-slate-300 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isRefreshing ? 'রিফ্রেশ হচ্ছে...' : lastUpdated ? `আপডেট: ${lastUpdated}` : 'রিফ্রেশ'}
              </span>
            </button>

            {/* Timeframe Toggles */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setTimeRange('today')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-bold ${
                  timeRange === 'today' ? 'bg-red-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                আজকে
              </button>
              <button
                onClick={() => setTimeRange('weekly')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-bold ${
                  timeRange === 'weekly' ? 'bg-red-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ৭ দিন
              </button>
              <button
                onClick={() => setTimeRange('monthly')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-bold ${
                  timeRange === 'monthly' ? 'bg-red-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ৩০ দিন
              </button>
              <button
                onClick={() => setTimeRange('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-bold ${
                  timeRange === 'all' ? 'bg-red-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                সর্বমোট
              </button>
            </div>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => setShowResetModal(true)}
              className="bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="সকল ডেমো ভিউ রিসেট করে শূন্য থেকে গণনা শুরু করুন"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">ডেমো ডাটা রিসেট</span>
            </button>

            {/* Export JSON Report */}
            <button
              onClick={handleExportAnalytics}
              className="bg-slate-700 hover:bg-slate-600 text-white p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="অ্যানালিটিক্স রিপোর্ট ডাউনলোড"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">রিপোর্ট</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 PRIMARY METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Reader Views */}
        <div className="bg-slate-800/90 border border-slate-700 p-4 sm:p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">আসল সর্বমোট পাঠক ভিউ</span>
            <div className="w-8 h-8 rounded-full bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-bengali-display">
            {bnNum(grandTotalViews)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>সংবাদ: {bnNum(analyticsData?.metrics?.total_news_views ?? localNewsViews)} • ব্লগ: {bnNum(analyticsData?.metrics?.total_blog_views ?? localBlogViews)}</span>
          </div>
        </div>

        {/* Metric 2: Today's Actual Views & Unique Visitors */}
        <div className="bg-slate-800/90 border border-slate-700 p-4 sm:p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">আজকের আসল ভিউ</span>
            <div className="w-8 h-8 rounded-full bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 font-bengali-display">
            {bnNum(todayViews)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 mt-2">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>আজকের ইউনিক পাঠক: <strong>{bnNum(todayUnique)} জন</strong></span>
          </div>
        </div>

        {/* Metric 3: Weekly Views */}
        <div className="bg-slate-800/90 border border-slate-700 p-4 sm:p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">সাপ্তাহিক আসল ভিউ (৭ দিন)</span>
            <div className="w-8 h-8 rounded-full bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-400 font-bengali-display">
            {bnNum(weeklyViews)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
            <span>গত ৩০ দিনের ভিউ: <strong className="text-blue-300">{bnNum(monthlyViews)}</strong></span>
          </div>
        </div>

        {/* Metric 4: Published vs Draft */}
        <div className="bg-slate-800/90 border border-slate-700 p-4 sm:p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">প্রকাশিত কন্টেন্ট স্ট্যাটাস</span>
            <div className="w-8 h-8 rounded-full bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-bengali-display">
            {bnNum(publishedTotal)} <span className="text-xs font-normal text-slate-400">/ {bnNum(totalContent)}</span>
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-2">
            <span className="text-emerald-400 font-bold">{bnNum(publishedPercent)}% প্রকাশিত</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400">{bnNum(draftTotal)} ড্রাফট</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE TRAFFIC TRENDS CHART (Real Daily Logs) */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-700">
          <div>
            <h2 className="text-base font-bold text-white font-bengali-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              প্রকৃত দৈনিক ভিজিটর ট্রাফিক গ্রাফ (Real Daily Traffic)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ডাটাবেজে সংরক্ষিত প্রতিটি দিনের আসল পাঠক উপস্থিতির পরিসংখ্যান।
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>দৈনিক পাঠক সংখ্যা (আসল লগ)</span>
            </div>
          </div>
        </div>

        {/* SVG Interactive Chart Box */}
        <div className="relative w-full overflow-hidden pt-4 pb-2">
          {chartData.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              কোনো ট্রাফিক ডাটা এখনও জমা হয়নি। পাঠকেরা সংবাদ পড়লে স্বয়ংক্রিয়ভাবে গ্রাফ আপডেট হবে।
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 sm:h-52 overflow-visible"
            >
              <defs>
                <linearGradient id="viewsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Background Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
                return (
                  <line
                    key={idx}
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="#334155"
                    strokeDasharray="3 3"
                    strokeWidth="0.8"
                  />
                );
              })}

              {/* Gradient Fill Area */}
              {areaD && <path d={areaD} fill="url(#viewsAreaGrad)" />}

              {/* Line Path */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Points */}
              {svgPoints.map((pt, idx) => (
                <g key={idx} className="cursor-pointer">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill="#ffffff"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    className="hover:r-6 transition-all"
                    onMouseEnter={() => setHoveredDataPoint(pt)}
                    onMouseLeave={() => setHoveredDataPoint(null)}
                  />
                  {/* X Axis Day Label */}
                  <text
                    x={pt.x}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {pt.day}
                  </text>
                </g>
              ))}
            </svg>
          )}

          {/* Hover Tooltip */}
          {hoveredDataPoint && (
            <div 
              className="absolute bg-slate-900 border border-red-500 text-white px-3 py-1.5 rounded-lg shadow-xl text-xs pointer-events-none -translate-x-1/2 -translate-y-full mb-2 z-10 font-sans"
              style={{
                left: `${(hoveredDataPoint.x / chartWidth) * 100}%`,
                top: `${(hoveredDataPoint.y / chartHeight) * 100}%`
              }}
            >
              <span className="text-slate-400 block text-[10px]">{hoveredDataPoint.day}</span>
              <span className="font-bold text-red-400">{bnNum(hoveredDataPoint.views)} ভিউ</span>
            </div>
          )}
        </div>
      </div>

      {/* REAL-TIME VISITOR LOG FEED & DEVICE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-Time View Stream */}
        <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white font-bengali-display">
                সর্বশেষ পাঠক উপস্থিতি ও পাঠের ইতিহাস (Live Reader Activity)
              </h2>
            </div>
            <span className="text-xs text-slate-400">রিয়েল-টাইম লগ</span>
          </div>

          {(!analyticsData?.recent_views || analyticsData.recent_views.length === 0) ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              এখনও কোনো সাম্প্রতিক ভিউ লগ রেকর্ড হয়নি। পোর্টালের যেকোনো সংবাদ ওপেন করলে এখানে লাইভ দেখা যাবে।
            </div>
          ) : (
            <div className="space-y-2.5">
              {analyticsData.recent_views.map((log) => (
                <div 
                  key={log.id} 
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-750 flex items-center justify-between gap-3 text-xs hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-slate-300">
                      {log.device_type === 'mobile' ? (
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                      ) : log.device_type === 'tablet' ? (
                        <Tablet className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Monitor className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-100 truncate">
                        {log.content_title || 'সংবাদ পাঠ'}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="text-red-400 font-semibold">{log.category_name || 'সাধারণ'}</span>
                        <span>•</span>
                        <span className="capitalize">{log.device_type || 'Desktop'}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {timeAgoBn(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Device Breakdown */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white font-bengali-display">
                  ডিভাইস বিন্যাস (Devices)
                </h2>
              </div>
              <span className="text-xs text-slate-400">আসল ট্রাফিক</span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              পাঠকেরা কোন ধরনের ডিভাইসের মাধ্যমে আপনার পোর্টালে সংবাদ পড়ছেন:
            </p>

            <div className="space-y-4">
              {/* Mobile */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2 text-white">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>স্মার্টফোন (Mobile)</span>
                  </div>
                  <span className="font-bold text-emerald-400">{bnNum(mobilePercent)}% ({bnNum(deviceStats.mobile)})</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${mobilePercent}%` }}></div>
                </div>
              </div>

              {/* Desktop */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2 text-white">
                    <Monitor className="w-4 h-4 text-blue-400" />
                    <span>কম্পিউটার (Desktop)</span>
                  </div>
                  <span className="font-bold text-blue-400">{bnNum(desktopPercent)}% ({bnNum(deviceStats.desktop)})</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${desktopPercent}%` }}></div>
                </div>
              </div>

              {/* Tablet */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2 text-white">
                    <Tablet className="w-4 h-4 text-cyan-400" />
                    <span>ট্যাবলেট (Tablet)</span>
                  </div>
                  <span className="font-bold text-cyan-400">{bnNum(tabletPercent)}% ({bnNum(deviceStats.tablet)})</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${tabletPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-700/80 bg-slate-900/50 p-3 rounded-xl text-[11px] text-slate-400">
            💡 তথ্য: প্রতিটি পাঠক ভিজিটে ইউজার-এজেন্ট হেডার বিশ্লেষণ করে ডিভাইস রেকর্ড করা হয়।
          </div>
        </div>
      </div>

      {/* 2-COLUMN SECTION: MOST READ NEWS & POPULAR CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Most Read News Leaderboard */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white font-bengali-display">
                  সর্বাধিক পঠিত সংবাদ (Most Read News)
                </h2>
              </div>
              <span className="text-xs text-slate-400">আসল ভিউ অনুযায়ী টপ {bnNum(mostReadNews.length)}টি</span>
            </div>

            <div className="space-y-3">
              {mostReadNews.map((article, idx) => {
                const ratio = Math.max(10, Math.min(100, Math.round(((article.views || 0) / (topArticleMaxViews || 1)) * 100)));
                return (
                  <div
                    key={article.id}
                    onClick={() => onSelectArticle && onSelectArticle(article)}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-750 hover:border-slate-600 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                          idx === 0 ? 'bg-amber-500 text-slate-950 font-black' :
                          idx === 1 ? 'bg-slate-300 text-slate-950 font-black' :
                          idx === 2 ? 'bg-amber-700 text-white font-black' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {bnNum(idx + 1)}
                        </span>
                        <p className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                          {article.title}
                        </p>
                      </div>

                      <span className="text-xs font-black text-amber-400 shrink-0 font-mono">
                        {bnNum(article.views)} ভিউ
                      </span>
                    </div>

                    {/* Progress relative to top */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${ratio}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="text-red-400 font-semibold">{article.category_name}</span>
                      <span>{article.author_name}</span>
                      <span>{bnDate(article.published_at, false)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Most Popular Categories Breakdown */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white font-bengali-display">
                  জনপ্রিয় ক্যাটাগরি (Popular Categories)
                </h2>
              </div>
              <span className="text-xs text-slate-400">{bnNum(categoryStats.length)}টি বিভাগ</span>
            </div>

            <div className="space-y-3">
              {categoryStats.slice(0, 8).map((cat) => {
                const percent = grandTotalViews > 0 ? Math.round((cat.views / grandTotalViews) * 100) : 0;
                return (
                  <div key={cat.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-750">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{cat.name}</span>
                        <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded">
                          {bnNum(cat.count)}টি সংবাদ
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold font-mono">{bnNum(cat.views)} ভিউ</span>
                        <span className="text-slate-400 text-[11px]">({bnNum(percent)}%)</span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, percent)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Published vs Draft Comparison Pill */}
          <div className="mt-4 pt-4 border-t border-slate-700/80 bg-slate-900/50 p-3 rounded-xl">
            <span className="text-[11px] font-bold text-slate-300 block mb-2">কন্টেন্ট পাবলিকেশন স্ট্যাটাস:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-200">
                <span>প্রকাশিত সংবাদ:</span>
                <strong className="font-bold text-emerald-300">{bnNum(publishedNewsCount)}টি</strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200">
                <span>ড্রাফট সংবাদ:</span>
                <strong className="font-bold text-amber-300">{bnNum(draftNewsCount)}টি</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* TOP AUTHORS / REPORTERS LEADERBOARD */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white font-bengali-display">
              শীর্ষ প্রতিবেদক ও কলামিস্ট (Top Authors & Reporters)
            </h2>
          </div>
          <span className="text-xs text-slate-400">প্রকৃত পাঠক ভিউ ও কন্টেন্ট সংখ্যা অনুযায়ী র‍্যাংকিং</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {authorLeaderboard.map((author, idx) => {
            const avgViews = author.count > 0 ? Math.round(author.views / author.count) : 0;
            return (
              <div
                key={author.name}
                className="bg-slate-900/80 border border-slate-750 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {author.avatar ? (
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-900/80 text-white flex items-center justify-center font-bold text-xs border border-red-700">
                        {author.name.charAt(0)}
                      </div>
                    )}
                    <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold text-white flex items-center justify-center border border-slate-600">
                      {bnNum(idx + 1)}
                    </span>
                  </div>

                  <div className="overflow-hidden">
                    <h3 className="text-xs font-bold text-white truncate">{author.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      মোট কন্টেন্ট: <strong className="text-slate-200">{bnNum(author.count)}</strong>টি
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-emerald-400 font-mono">
                    {bnNum(author.views)} ভিউ
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    গড়: {bnNum(avgViews)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RESET CONFIRMATION MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-bengali-display">
                  ডেমো ভিউ রিসেট ও লাইভ কাউন্টিং
                </h3>
                <p className="text-xs text-slate-400">ভবিষ্যত ট্র্যাকিং কনফিগারেশন</p>
              </div>
            </div>

            {resetSuccessMessage ? (
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{resetSuccessMessage}</span>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-300 leading-relaxed">
                  আপনি কি নিশ্চিত যে সকল ডেমো পাঠক সংখ্যা মুছে <strong>শূন্য (০)</strong> থেকে সম্পূর্ণ লাইভ কাউন্টিং শুরু করতে চান? 
                </p>
                <div className="p-3 bg-slate-800/80 rounded-xl text-[11px] text-slate-400 space-y-1 border border-slate-700">
                  <p>• সকল সংবাদের ভিউ সংখ্যা ০ হবে।</p>
                  <p>• দৈনিক ট্রাফিক ও পাঠক লগ ক্লিন হবে।</p>
                  <p>• এখন থেকে নতুন কোনো পাঠক আসলেই কেবল সংখ্যা বৃদ্ধি পাবে।</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    disabled={isResetting}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmResetViews}
                    disabled={isResetting}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {isResetting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>রিসেট হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>হ্যাঁ, রিসেট করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

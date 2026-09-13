import React, { useState, useMemo } from 'react';
import {
  Mail, MailCheck, MailOpen, Trash2, Check, Clock,
  Search, X, ExternalLink, Eye, Phone, User,
  CheckCheck, AlertCircle, MessageSquare, Send, Copy, RefreshCw
} from 'lucide-react';
import { ContactMessage } from '../../types';

interface AdminMessagesInboxProps {
  messages: ContactMessage[];
  onMarkMessageRead: (id: number) => Promise<void> | void;
  onDeleteMessage: (id: number) => Promise<void> | void;
  setFeedback: (msg: string) => void;
  setErrorMessage: (msg: string) => void;
}

// Bengali number conversion helper
const bnNum = (n: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, d => bnDigits[Number(d)]);
};

// Bengali date formatting helper
const formatBengaliDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const day = bnNum(d.getDate());
    const month = months[d.getMonth()];
    const year = bnNum(d.getFullYear());
    let hours = d.getHours();
    const minutes = bnNum(d.getMinutes().toString().padStart(2, '0'));
    const ampm = hours >= 12 ? 'বিকাল' : 'সকাল';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    return `${day} ${month}, ${year} (${ampm} ${bnNum(hours)}:${minutes})`;
  } catch {
    return dateStr;
  }
};

export const AdminMessagesInbox: React.FC<AdminMessagesInboxProps> = ({
  messages,
  onMarkMessageRead,
  onDeleteMessage,
  setFeedback,
  setErrorMessage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Computed counts
  const totalCount = messages.length;
  const unreadCount = messages.filter(m => !m.is_read).length;
  const readCount = totalCount - unreadCount;

  // Filtered messages
  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      // Status filter
      if (statusFilter === 'unread' && m.is_read) return false;
      if (statusFilter === 'read' && !m.is_read) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = m.name.toLowerCase().includes(query);
        const matchEmail = m.email.toLowerCase().includes(query);
        const matchSubject = m.subject.toLowerCase().includes(query);
        const matchPhone = m.phone ? m.phone.toLowerCase().includes(query) : false;
        const matchMsg = m.message.toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchSubject && !matchPhone && !matchMsg) {
          return false;
        }
      }

      return true;
    });
  }, [messages, statusFilter, searchQuery]);

  // Handle Mark Read
  const handleToggleRead = async (msg: ContactMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (msg.is_read) return; // already read
    setProcessingId(msg.id);
    try {
      await onMarkMessageRead(msg.id);
      setFeedback('বার্তাটি পঠিত হিসেবে চিহ্নিত করা হয়েছে।');
      setTimeout(() => setFeedback(''), 2500);
      if (selectedMessage && selectedMessage.id === msg.id) {
        setSelectedMessage({ ...selectedMessage, is_read: true });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'বার্তা আপডেট করতে ব্যর্থ হয়েছে।');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Mark All as Read
  const handleMarkAllAsRead = async () => {
    const unreadList = messages.filter(m => !m.is_read);
    if (unreadList.length === 0) return;
    try {
      for (const m of unreadList) {
        await onMarkMessageRead(m.id);
      }
      setFeedback('সকল বার্তা পঠিত হিসেবে চিহ্নিত করা হয়েছে।');
      setTimeout(() => setFeedback(''), 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'সকল বার্তা আপডেট করতে ত্রুটি দেখা দিয়েছে।');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Handle Delete Message
  const handleDelete = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('আপনি কি এই বার্তাটি মুছে ফেলতে চান? এটি পুনরুদ্ধার করা যাবে না।')) {
      return;
    }
    setProcessingId(id);
    try {
      await onDeleteMessage(id);
      setFeedback('বার্তাটি সফলভাবে মুছে ফেলা হয়েছে।');
      setTimeout(() => setFeedback(''), 2500);
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'বার্তা মুছতে ব্যর্থ হয়েছে।');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  // Copy Email to clipboard
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. TOP HEADER & METRICS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-1 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-950/70 border border-red-700/60 text-red-400 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white font-bengali-display">
                পাঠকদের বার্তা ইনবক্স
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ওয়েবসাইটের যোগাযোগ ফরম ও পাঠকদের মতামত সরাসরি ইনবক্স।
          </p>
        </div>

        {/* Action button if unread messages exist */}
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            title="ইনবক্সের সব অপঠিত বার্তা একসাথে পঠিত করুন"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>সবগুলো পঠিত মার্ক করুন</span>
          </button>
        )}
      </div>

      {/* 2. STATS CHIPS BAR */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-800 border-red-600/70 shadow-md ring-1 ring-red-500/50'
              : 'bg-slate-850/80 border-slate-700/80 hover:bg-slate-800/80'
          }`}
        >
          <span className="text-[10px] sm:text-xs text-slate-400 block">মোট বার্তা</span>
          <span className="text-base sm:text-xl font-black text-white font-mono">{bnNum(totalCount)}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('unread')}
          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
            statusFilter === 'unread'
              ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/60'
              : 'bg-slate-850/80 border-slate-700/80 hover:bg-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-amber-300 block">অপঠিত বার্তা</span>
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping hidden sm:inline-block" />
            )}
          </div>
          <span className="text-base sm:text-xl font-black text-amber-300 font-mono">{bnNum(unreadCount)}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('read')}
          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'read'
              ? 'bg-slate-800 border-emerald-500/70 shadow-md ring-1 ring-emerald-500/50'
              : 'bg-slate-850/80 border-slate-700/80 hover:bg-slate-800/80'
          }`}
        >
          <span className="text-[10px] sm:text-xs text-slate-400 block">পঠিত বার্তা</span>
          <span className="text-base sm:text-xl font-black text-emerald-300 font-mono">{bnNum(readCount)}</span>
        </button>
      </div>

      {/* 3. SEARCH & FILTER CONTROLS */}
      <div className="bg-slate-800/80 border border-slate-700/90 rounded-xl p-3 sm:p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="প্রেরকের নাম, ইমেইল, মোবাইল বা বিষয় লিখে খুঁজুন..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 shrink-0">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-750'
              }`}
            >
              সব ({bnNum(totalCount)})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                statusFilter === 'unread'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-900 text-amber-400 hover:bg-slate-750'
              }`}
            >
              <span>অপঠিত</span>
              {unreadCount > 0 && (
                <span className="bg-amber-950 text-amber-200 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {bnNum(unreadCount)}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('read')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === 'read'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-750'
              }`}
            >
              পঠিত ({bnNum(readCount)})
            </button>
          </div>
        </div>

        {/* Results summary if searching */}
        {searchQuery.trim() && (
          <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-700/60 pt-2">
            <span>
              খোঁজা হচ্ছে: <strong className="text-white font-mono">"{searchQuery}"</strong> — {bnNum(filteredMessages.length)}টি বার্তা পাওয়া গেছে
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-red-400 hover:underline cursor-pointer"
            >
              রিসেট করুন
            </button>
          </div>
        )}
      </div>

      {/* 4. MESSAGES LIST CONTAINER */}
      {filteredMessages.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-slate-500 mx-auto flex items-center justify-center mb-3">
            <MailOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white mb-1">
            কোনো বার্তা পাওয়া যায়নি
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'আপনার অনুসন্ধান অনুযায়ী কোনো বার্তা মেলেনি। ভিন্ন শব্দ দিয়ে অনুসন্ধান করুন।'
              : statusFilter === 'unread'
                ? 'বর্তমানে কোনো নতুন বা অপঠিত বার্তা নেই। সব বার্তা পঠিত হয়েছে!'
                : 'পাঠকদের পাঠানো কোনো বার্তা এখনো জমা হয়নি।'}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              সকল বার্তা প্রদর্শন করুন
            </button>
          )}
        </div>
      ) : (
        <>
          {/* MOBILE VIEW (CARD FEED FOR PHONES < sm SCREEN) */}
          <div className="block sm:hidden space-y-3">
            {filteredMessages.map((m) => {
              const isUnread = !m.is_read;
              const isBusy = processingId === m.id;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMessage(m)}
                  className={`border rounded-xl p-3.5 transition-all cursor-pointer relative shadow-sm ${
                    isUnread
                      ? 'bg-slate-800/95 border-amber-500/50 shadow-amber-950/20'
                      : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800'
                  }`}
                >
                  {/* Unread Top Highlight Strip */}
                  {isUnread && (
                    <div className="absolute top-0 left-4 right-4 h-0.5 bg-amber-400 rounded-t-full" />
                  )}

                  {/* Header: Sender & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isUnread ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs truncate leading-snug">
                          {m.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {m.email}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isUnread
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : 'bg-slate-700/60 text-slate-400 border border-slate-600/40'
                      }`}>
                        {isUnread ? 'নতুন' : 'পঠিত'}
                      </span>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="mb-2">
                    <h4 className="text-xs font-bold text-red-300 leading-snug line-clamp-1">
                      {m.subject || 'কোনো বিষয় উল্লেখ নেই'}
                    </h4>
                  </div>

                  {/* Message Snippet */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50 mb-3">
                    {m.message}
                  </p>

                  {/* Footer Meta & Actions */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-750">
                    <div className="flex items-center gap-1 text-[10px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{formatBengaliDate(m.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {/* Mark Read */}
                      {isUnread && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={(e) => handleToggleRead(m, e)}
                          className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="পঠিত হিসেবে চিহ্নিত করুন"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Reply Email */}
                      <a
                        href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'বার্তাচিত্র পত্রিকা বার্তা')}`}
                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs flex items-center gap-1 transition-colors"
                        title="ইমেইলে উত্তর দিন"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-400" />
                      </a>

                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => setSelectedMessage(m)}
                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="সম্পূর্ণ বার্তা দেখুন"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-300" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={(e) => handleDelete(m.id, e)}
                        className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="বার্তাটি মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP VIEW (TABLE FOR sm+ SCREENS) */}
          <div className="hidden sm:block bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-700">
                  <tr>
                    <th className="p-3.5 w-56">প্রেরক ও যোগাযোগ</th>
                    <th className="p-3.5">বিষয় ও বার্তা</th>
                    <th className="p-3.5 w-36">তারিখ ও সময়</th>
                    <th className="p-3.5 w-24 text-center">স্ট্যাটাস</th>
                    <th className="p-3.5 w-32 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/80 text-slate-200">
                  {filteredMessages.map((m) => {
                    const isUnread = !m.is_read;
                    const isBusy = processingId === m.id;

                    return (
                      <tr
                        key={m.id}
                        onClick={() => setSelectedMessage(m)}
                        className={`transition-colors cursor-pointer ${
                          isUnread ? 'bg-amber-950/20 hover:bg-amber-950/30' : 'hover:bg-slate-750/50'
                        }`}
                      >
                        {/* Sender info */}
                        <td className="p-3.5">
                          <div className="flex items-start gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                              isUnread ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-700 text-slate-300'
                            }`}>
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-xs truncate">{m.name}</p>
                              <a
                                href={`mailto:${m.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[11px] text-slate-400 hover:text-cyan-400 truncate block mt-0.5 font-mono"
                              >
                                {m.email}
                              </a>
                              {m.phone && (
                                <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                  <Phone className="w-2.5 h-2.5" />
                                  <span>{m.phone}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Subject & snippet */}
                        <td className="p-3.5 max-w-sm">
                          <p className={`font-bold text-xs leading-snug truncate ${
                            isUnread ? 'text-amber-300' : 'text-slate-200'
                          }`}>
                            {m.subject || 'কোনো বিষয় উল্লেখ নেই'}
                          </p>
                          <p className="text-slate-400 text-[11px] line-clamp-1 mt-1 leading-relaxed">
                            {m.message}
                          </p>
                        </td>

                        {/* Date */}
                        <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                          {formatBengaliDate(m.created_at)}
                        </td>

                        {/* Status */}
                        <td className="p-3.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isUnread
                              ? 'bg-amber-950/90 text-amber-300 border border-amber-700/70'
                              : 'bg-slate-700 text-slate-400'
                          }`}>
                            {isUnread ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                <span>নতুন</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3 text-slate-400" />
                                <span>পঠিত</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {isUnread && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={(e) => handleToggleRead(m, e)}
                                className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                                title="পঠিত হিসেবে মার্ক করুন"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            <a
                              href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'বার্তাচিত্র পত্রিকা')}`}
                              className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-slate-700 rounded transition-colors"
                              title="ইমেইলে সরাসরি উত্তর দিন"
                            >
                              <Send className="w-4 h-4" />
                            </a>

                            <button
                              type="button"
                              onClick={() => setSelectedMessage(m)}
                              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                              title="সম্পূর্ণ বার্তা পড়ুন"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={(e) => handleDelete(m.id, e)}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 5. FULL MESSAGE READER MODAL (100% RESPONSIVE) */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-900/90 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-red-950/70 border border-red-700/60 text-red-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white font-bengali-display truncate">
                    পাঠক বার্তা বিস্তারিত
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    তারিখ: {formatBengaliDate(selectedMessage.created_at)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-200">
              {/* Sender Info Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">প্রেরকের তথ্য:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    !selectedMessage.is_read
                      ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                  }`}>
                    {!selectedMessage.is_read ? 'নতুন বার্তা' : 'পঠিত বার্তা'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="font-bold text-white text-sm">{selectedMessage.name}</span>
                </div>

                <div className="flex items-center justify-between gap-2 text-slate-300">
                  <div className="flex items-center gap-2 min-w-0 font-mono text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedMessage.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(selectedMessage.email)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                    title="ইমেইল কপি করুন"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {selectedMessage.phone && (
                  <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`tel:${selectedMessage.phone}`} className="hover:underline text-cyan-300">
                      {selectedMessage.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">বার্তা বিষয়:</label>
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 font-bold text-white text-sm leading-snug">
                  {selectedMessage.subject || 'কোনো বিষয় উল্লেখ নেই'}
                </div>
              </div>

              {/* Full Message Text */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">বার্তার বিষয়বস্তু:</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                {!selectedMessage.is_read && (
                  <button
                    type="button"
                    onClick={() => handleToggleRead(selectedMessage)}
                    className="px-3 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>পঠিত মার্ক করুন</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="px-3 py-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>মুছে ফেলুন</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'বার্তাচিত্র পত্রিকা')}`}
                  className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ইমেইলে উত্তর দিন</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

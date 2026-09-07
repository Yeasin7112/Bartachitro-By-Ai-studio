import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Clock, CheckCircle } from 'lucide-react';
import { bnNum } from '../utils/bengaliHelpers';

export interface ArticleComment {
  id: string;
  articleId: number;
  userName: string;
  commentText: string;
  timestamp: string;
}

interface ArticleCommentsProps {
  articleId: number;
}

export const ArticleComments: React.FC<ArticleCommentsProps> = ({ articleId }) => {
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [name, setName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Load comments for this article from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`bartachitro_comments_${articleId}`);
      if (stored) {
        setComments(JSON.parse(stored));
      } else {
        // Initial sample comments for realism
        const initialSamples: ArticleComment[] = [
          {
            id: 'c-1',
            articleId,
            userName: 'মো. রফিকুল ইসলাম',
            commentText: 'সময়োপযোগী ও গুরুত্বপূর্ণ প্রতিবেদন। আশা করি সংশ্লিষ্ট কর্তৃপক্ষ বিষয়টি দ্রুত বিবেচনা করবেন।',
            timestamp: 'আজ সকাল ১০:১৫'
          },
          {
            id: 'c-2',
            articleId,
            userName: 'ফারহানা আহমেদ',
            commentText: 'তথ্যবহুল সংবাদ প্রকাশের জন্য বার্তাচিত্রকে ধন্যবাদ।',
            timestamp: 'আজ দুপুর ১২:৩০'
          }
        ];
        setComments(initialSamples);
      }
    } catch {
      setComments([]);
    }
  }, [articleId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !commentText.trim()) return;

    const now = new Date();
    const timeString = `আজ ${now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;

    const newComment: ArticleComment = {
      id: `comment-${Date.now()}`,
      articleId,
      userName: name.trim(),
      commentText: commentText.trim(),
      timestamp: timeString
    };

    const updated = [newComment, ...comments];
    setComments(updated);

    try {
      localStorage.setItem(`bartachitro_comments_${articleId}`, JSON.stringify(updated));
    } catch {}

    setName('');
    setCommentText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-red-700" />
          <h3 className="text-base sm:text-lg font-bold text-gray-950 font-bengali-display">
            পাঠক মন্তব্য ({bnNum(comments.length)})
          </h3>
        </div>
        <span className="text-xs text-gray-500">আপনার মতামত প্রকাশ করুন</span>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 mb-6 space-y-3">
        {submitted && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-2.5 rounded-lg flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>আপনার মন্তব্যটি সফলভাবে প্রকাশিত হয়েছে!</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">আপনার নাম *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="আপনার পূর্ণ নাম লিখুন"
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-red-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">মন্তব্য *</label>
          <textarea
            required
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="এই সংবাদ সম্পর্কে আপনার সুচিন্তিত মতামত লিখুন..."
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-red-600"
          />
        </div>

        <button
          type="submit"
          className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>মন্তব্য পোস্ট করুন</span>
        </button>
      </form>

      {/* Timestamped Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-400 py-3 text-center">এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-xs text-gray-900">{comment.userName}</span>
                </div>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {comment.timestamp}
                </span>
              </div>
              <p className="text-xs text-gray-700 pl-9 leading-relaxed whitespace-pre-wrap">
                {comment.commentText}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

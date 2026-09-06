import React, { useState, useRef, useEffect } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Image as ImageIcon, Link as LinkIcon,
  Quote, Code, Eye, Palette, Highlighter, Heading1, Heading2,
  Heading3, Type, Undo, Redo, Sparkles, X, Plus, AlertCircle
} from 'lucide-react';
import { bnNum } from '../utils/bengaliHelpers';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const PRESET_COLORS = [
  { name: 'কালো (ডিফল্ট)', color: '#1e293b' },
  { name: 'গাঢ় লাল', color: '#b91c1c' },
  { name: 'উজ্জ্বল লাল', color: '#dc2626' },
  { name: 'গাঢ় নীল', color: '#1d4ed8' },
  { name: 'সবুজ', color: '#047857' },
  { name: 'কমলা / সোনালী', color: '#d97706' },
  { name: 'বেগুনি', color: '#7e22ce' },
  { name: 'ধূসর', color: '#64748b' },
];

const PRESET_HIGHLIGHTS = [
  { name: 'কোনোটি নয়', color: 'transparent' },
  { name: 'হলুদ হাইলাইট', color: '#fef08a' },
  { name: 'হালকা সবুজ', color: '#bbf7d0' },
  { name: 'হালকা নীল', color: '#bae6fd' },
  { name: 'হালকা গোলাপী', color: '#fbcfe8' },
  { name: 'হালকা কমলা', color: '#fed7aa' },
];

const SAMPLE_INLINE_IMAGES = [
  { label: 'সংবাদ সম্মেলন / প্রেস ব্রিফিং', url: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1000&q=80' },
  { label: 'সচিবালয় / সরকারি ভবন', url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1000&q=80' },
  { label: 'আদালত ও আইন', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1000&q=80' },
  { label: 'প্রযুক্তি ও কম্পিউটার', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&q=80' },
  { label: 'বাংলাদেশ পতাকা / সংসদ ভবন', url: 'https://images.unsplash.com/photo-1584282479901-52f1b40280f2?w=1000&q=80' },
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'এখানে সংবাদের বিস্তারিত বিবরণ লিখুন...',
  minHeight = '320px'
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Image inserter states
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlign, setImageAlign] = useState<'center' | 'left' | 'right'>('center');

  // Link inserter states
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Initialize and keep editor in sync with value
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    if (viewMode !== 'visual') return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    handleInput();
  };

  const applyHeading = (tag: string) => {
    if (tag === 'p') {
      exec('formatBlock', '<p>');
    } else {
      exec('formatBlock', `<${tag}>`);
    }
  };

  const applyTextColor = (color: string) => {
    exec('foreColor', color);
    setShowColorPicker(false);
  };

  const applyHighlight = (color: string) => {
    exec('hiliteColor', color);
    setShowHighlightPicker(false);
  };

  const insertQuote = () => {
    const selection = window.getSelection()?.toString() || 'এখানে গুরুত্বপূর্ণ উক্তি বা কোটেশন লিখুন...';
    const quoteHtml = `<blockquote class="border-l-4 border-red-700 pl-4 py-2 my-4 italic text-slate-200 bg-slate-800/80 rounded-r font-bengali-body text-base">"${selection}"</blockquote><p><br></p>`;
    exec('insertHTML', quoteHtml);
  };

  const insertCallout = () => {
    const selection = window.getSelection()?.toString() || 'এখানে বিশেষ তথ্য বা জরুরি নোট লিখুন...';
    const calloutHtml = `<div class="bg-amber-950/40 border-l-4 border-amber-500 p-4 my-4 rounded-r text-amber-200 text-sm font-medium"><strong>বিশেষ তথ্য:</strong> ${selection}</div><p><br></p>`;
    exec('insertHTML', calloutHtml);
  };

  const handleInsertImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    let alignClasses = 'w-full my-5 text-center';
    let imgClasses = 'w-full max-h-[450px] object-cover rounded-xl border border-slate-700 shadow-md';

    if (imageAlign === 'left') {
      alignClasses = 'float-left mr-5 mb-4 max-w-[48%] my-3';
      imgClasses = 'w-full max-h-[280px] object-cover rounded-lg border border-slate-700';
    } else if (imageAlign === 'right') {
      alignClasses = 'float-right ml-5 mb-4 max-w-[48%] my-3';
      imgClasses = 'w-full max-h-[280px] object-cover rounded-lg border border-slate-700';
    }

    const captionHtml = imageCaption.trim()
      ? `<figcaption class="text-xs text-slate-400 mt-2 italic font-bengali-body text-center">${imageCaption.trim()}</figcaption>`
      : '';

    const figureHtml = `<figure class="${alignClasses} inline-block">${captionHtml ? `<img src="${imageUrl.trim()}" alt="${imageCaption.trim()}" class="${imgClasses}" />` : `<img src="${imageUrl.trim()}" class="${imgClasses}" />`}${captionHtml}</figure><p><br></p>`;

    if (viewMode === 'visual') {
      exec('insertHTML', figureHtml);
    } else {
      onChange(value + '\n' + figureHtml);
    }

    setImageUrl('');
    setImageCaption('');
    setShowImageModal(false);
  };

  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    const label = linkText.trim() || linkUrl.trim();
    const linkHtml = `<a href="${linkUrl.trim()}" target="_blank" rel="noopener noreferrer" class="text-red-400 hover:text-red-300 underline font-bold">${label}</a>`;

    if (viewMode === 'visual') {
      exec('insertHTML', linkHtml);
    } else {
      onChange(value + ' ' + linkHtml);
    }

    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  // Word and Char calculations
  const plainText = (value || '').replace(/<[^>]+>/g, ' ').trim();
  const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const chars = plainText.length;

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900 shadow-md">
      {/* Office Style Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 p-2 flex flex-wrap items-center gap-1 sm:gap-1.5 select-none text-slate-200">
        {/* Headings & Font Sizes */}
        <div className="flex items-center gap-1 border-r border-slate-700 pr-1.5 mr-0.5">
          <select
            onChange={(e) => applyHeading(e.target.value)}
            defaultValue="p"
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer"
            title="লেখার সাইজ / হেডিং"
          >
            <option value="p">সাধারণ প্যারাগ্রাফ (P)</option>
            <option value="h2">বড় শিরোনাম (H2)</option>
            <option value="h3">মাঝারি শিরোনাম (H3)</option>
            <option value="h4">ছোট শিরোনাম (H4)</option>
          </select>
        </div>

        {/* Font Weight and Styles */}
        <div className="flex items-center gap-0.5 border-r border-slate-700 pr-1.5 mr-0.5">
          <button
            type="button"
            onClick={() => exec('bold')}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="বোল্ড (Ctrl+B)"
          >
            <Bold className="w-4 h-4 font-black" />
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="ইটালিক (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('underline')}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="আন্ডারলাইন (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('strikeThrough')}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="কেটে দেওয়া (Strikethrough)"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Text Color & Highlight Palettes */}
        <div className="relative flex items-center gap-0.5 border-r border-slate-700 pr-1.5 mr-0.5">
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowHighlightPicker(false);
            }}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
            title="টেক্সট রঙ নির্বাচন করুন (Font Color)"
          >
            <Palette className="w-4 h-4" />
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white/40" />
          </button>

          {showColorPicker && (
            <div className="absolute top-9 left-0 z-30 bg-slate-800 border border-slate-700 p-2.5 rounded-lg shadow-xl grid grid-cols-4 gap-1.5 min-w-[170px]">
              {PRESET_COLORS.map((item) => (
                <button
                  key={item.color}
                  type="button"
                  onClick={() => applyTextColor(item.color)}
                  className="w-7 h-7 rounded border border-slate-600 hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: item.color }}
                  title={item.name}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowColorPicker(false);
            }}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
            title="হাইলাইট মার্কার (Background Highlight)"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          {showHighlightPicker && (
            <div className="absolute top-9 left-10 z-30 bg-slate-800 border border-slate-700 p-2.5 rounded-lg shadow-xl grid grid-cols-3 gap-1.5 min-w-[150px]">
              {PRESET_HIGHLIGHTS.map((item) => (
                <button
                  key={item.color}
                  type="button"
                  onClick={() => applyHighlight(item.color)}
                  className="h-6 rounded border border-slate-600 hover:scale-105 transition-transform text-[10px] font-bold text-slate-900 cursor-pointer flex items-center justify-center"
                  style={{ backgroundColor: item.color === 'transparent' ? '#334155' : item.color, color: item.color === 'transparent' ? '#fff' : '#000' }}
                  title={item.name}
                >
                  {item.color === 'transparent' ? 'বাতিল' : 'রং'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 border-r border-slate-700 pr-1.5 mr-0.5">
          <button
            type="button"
            onClick={() => exec('justifyLeft')}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="বামে সারিবদ্ধ"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyCenter')}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="মাঝখানে সারিবদ্ধ"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyRight')}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="ডানে সারিবদ্ধ"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyFull')}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="উভয়পাশে সমান (Justify)"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center gap-0.5 border-r border-slate-700 pr-1.5 mr-0.5">
          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="বুলেট পয়েন্ট তালিকা"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="সংখ্যাযুক্ত তালিকা"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={insertQuote}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            title="উদ্ধৃতি / কোটেশন বক্স যোগ করুন"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={insertCallout}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
            title="বিশেষ তথ্য বক্স যোগ করুন"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Inline Image & Links */}
        <div className="flex items-center gap-0.5 border-r border-slate-700 pr-1.5 mr-0.5">
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="p-1.5 rounded bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold px-2 cursor-pointer"
            title="সংবাদের ভেতরে ছবি যোগ করুন"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ছবি যোগ</span>
          </button>
          <button
            type="button"
            onClick={() => setShowLinkModal(true)}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="লিংক যুক্ত করুন"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 border-r border-slate-700 pr-1.5 mr-0.5">
          <button
            type="button"
            onClick={() => exec('undo')}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="আগের অবস্থায় ফিরুন (Undo)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('redo')}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="পরের অবস্থায় যান (Redo)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Mode Toggle: Visual vs HTML Source */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'visual' ? 'code' : 'visual')}
            className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'code'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
            title="ভিজ্যুয়াল এডিটর বনাম HTML কোড মোড"
          >
            {viewMode === 'visual' ? (
              <>
                <Code className="w-3.5 h-3.5" /> <span>HTML কোড</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" /> <span>ভিজ্যুয়াল ভিউ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative">
        {viewMode === 'visual' ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            className="p-4 sm:p-5 text-sm sm:text-base text-slate-100 font-bengali-body leading-relaxed focus:outline-none overflow-y-auto prose prose-invert max-w-none prose-p:my-2 prose-headings:font-bengali-display prose-headings:text-white prose-a:text-red-400 prose-img:rounded-lg"
            style={{ minHeight }}
            data-placeholder={placeholder}
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="সরাসরি HTML কোড লিখুন..."
            className="w-full p-4 font-mono text-xs text-amber-200 bg-slate-950 focus:outline-none leading-relaxed resize-y border-none"
            style={{ minHeight }}
          />
        )}
      </div>

      {/* Editor Footer Status Bar */}
      <div className="bg-slate-800/80 border-t border-slate-700 px-3.5 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>শব্দ সংখ্যা: <strong className="text-slate-200">{bnNum(words)}</strong></span>
          <span>অক্ষর সংখ্যা: <strong className="text-slate-200">{bnNum(chars)}</strong></span>
          <span className="hidden sm:inline">পড়ার আনুমানিক সময়: <strong className="text-amber-400">{bnNum(Math.max(1, Math.ceil(words / 150)))} মিনিট</strong></span>
        </div>
        <div className="text-[10px] text-slate-500 italic">
          এম এস অফিসের মতো টেক্সট ফরম্যাট, হেডিং ও সংবাদের ভেতরে ছবি যোগ করতে উপরের টুলবার ব্যবহার করুন
        </div>
      </div>

      {/* MODAL: INSERT INLINE IMAGE */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <ImageIcon className="w-5 h-5 text-red-500" />
                <span>সংবাদের মাঝে ছবি যোগ করুন</span>
              </div>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertImage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ছবির URL (ওয়েব লিংক) *
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Quick Sample Presets */}
              <div>
                <span className="block text-[11px] text-slate-400 mb-1.5">দ্রুত নমুনা ছবি নির্বাচন করুন:</span>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {SAMPLE_INLINE_IMAGES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setImageUrl(sample.url);
                        if (!imageCaption) setImageCaption(sample.label);
                      }}
                      className="text-left bg-slate-800 hover:bg-slate-700 p-2 rounded border border-slate-700 text-[11px] text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <img src={sample.url} alt="sample" className="w-8 h-8 rounded object-cover shrink-0" />
                      <span className="truncate">{sample.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ছবির ক্যাপশন (Caption) - অপশনাল
                </label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="যেমন: ফাইল ছবি / সংগৃহীত"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ছবির অবস্থান (Alignment)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setImageAlign('center')}
                    className={`py-2 text-xs font-bold rounded border cursor-pointer ${
                      imageAlign === 'center'
                        ? 'bg-red-700 text-white border-red-600'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    মাঝখানে (ফুল-উইডথ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageAlign('left')}
                    className={`py-2 text-xs font-bold rounded border cursor-pointer ${
                      imageAlign === 'left'
                        ? 'bg-red-700 text-white border-red-600'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    বামে ভাসমান (Left Float)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageAlign('right')}
                    className={`py-2 text-xs font-bold rounded border cursor-pointer ${
                      imageAlign === 'right'
                        ? 'bg-red-700 text-white border-red-600'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    ডানে ভাসমান (Right Float)
                  </button>
                </div>
              </div>

              {imageUrl && (
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">প্রিভিউ:</span>
                  <img src={imageUrl} alt="preview" className="max-h-32 mx-auto rounded object-contain" />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-red-700 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Plus className="w-4 h-4" /> সংবাদের ভেতর যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSERT LINK */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <LinkIcon className="w-4 h-4 text-red-500" />
                <span>হাইপারলিংক যোগ করুন</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertLink} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  লিংক ঠিকানা (Web URL) *
                </label>
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  প্রদর্শিত টেক্সট (Display Text)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="যেমন: বিস্তারিত খবর পড়ুন..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-red-700 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-xs font-bold cursor-pointer"
                >
                  লিংক যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

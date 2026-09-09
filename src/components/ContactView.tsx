import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import { SiteSettings, ContactMessage } from '../types';

interface ContactViewProps {
  settings: SiteSettings;
  onNavigateHome: () => void;
  onSubmitMessage: (msg: Omit<ContactMessage, 'id' | 'is_read' | 'created_at'>) => Promise<void> | void;
}

export const ContactView: React.FC<ContactViewProps> = ({
  settings,
  onNavigateHome,
  onSubmitMessage
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onSubmitMessage(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      setErrorMessage(err.message || 'বার্তা পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          যোগাযোগ ও সম্পাদকীয় কার্যালয়
        </h1>
        <p className="text-xs text-gray-600 mt-1">বার্তাচিত্র পরিবারে আপনার যেকোনো প্রশ্ন, মতামত বা সংবাদ বিজ্ঞপ্তি পাঠান।</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 font-bengali-display mb-4 border-b border-gray-100 pb-2">
              কার্যালয়ের ঠিকানা
            </h3>
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <MapPin className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 font-bengali-display mb-4 border-b border-gray-100 pb-2">
              যোগাযোগ মাধ্যম
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-red-700 shrink-0" />
                <span>{settings.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-red-700 shrink-0" />
                <span>{settings.email}</span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded p-4 border border-red-100 text-xs text-gray-700 space-y-1">
            <p className="font-bold text-red-900">বিজ্ঞাপন ও সার্কুলেশন সংক্রান্ত:</p>
            <p>বিজ্ঞাপন শাখা: ads@bartachitro.com</p>
            <p>হটলাইন: +৮৮০ ২ ৯৮৭৬৫৪৩ (এক্সটেশন: ১০২)</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 font-bengali-display mb-4">
            আমাদের বার্তা পাঠান
          </h3>

          {submitted && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded mb-6 flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে! আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।</span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-6 flex items-center gap-2 text-sm">
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">আপনার পূর্ণ নাম *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ইমেইল ঠিকানা *</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">মোবাইল নম্বর</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">বার্তার বিষয় *</label>
                <input 
                  type="text" 
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">আপনার বার্তা লিখুন *</label>
              <textarea 
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-700"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-2.5 rounded text-sm flex items-center gap-2 transition-colors cursor-pointer ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <Send className="w-4 h-4" /> {isSubmitting ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

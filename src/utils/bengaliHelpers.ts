/**
 * BartaChitro (বার্তাচিত্র) - Bengali Localization Helpers
 */

export function bnNum(num: number | string): string {
  const enDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  
  let str = String(num);
  for (let i = 0; i < 10; i++) {
    str = str.replaceAll(enDigits[i], bnDigits[i]);
  }
  return str;
}

export function bnDate(dateStr: string, includeTime = true): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const bnMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const bnDays = [
    'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
  ];

  const day = bnNum(date.getDate());
  const month = bnMonths[date.getMonth()];
  const year = bnNum(date.getFullYear());
  const dayName = bnDays[date.getDay()];

  let formatted = `${day} ${month} ${year}, ${dayName}`;

  if (includeTime) {
    let hours = date.getHours();
    const minutes = bnNum(String(date.getMinutes()).padStart(2, '0'));
    const ampm = hours >= 12 ? 'সন্ধ্যা/রাত' : 'সকাল';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    formatted += ` | ${ampm} ${bnNum(hours)}:${minutes}`;
  }

  return formatted;
}

export function timeAgoBn(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSecs < 60) {
    return 'কিছুক্ষণ আগে';
  } else if (diffSecs < 3600) {
    return `${bnNum(Math.floor(diffSecs / 60))} মিনিট আগে`;
  } else if (diffSecs < 86400) {
    return `${bnNum(Math.floor(diffSecs / 3600))} ঘণ্টা আগে`;
  } else if (diffSecs < 2592000) {
    return `${bnNum(Math.floor(diffSecs / 86400))} দিন আগে`;
  } else {
    return bnDate(dateStr, false);
  }
}

export function limitWords(str: string, wordLimit = 20): string {
  if (!str) return '';
  const words = str.split(/\s+/);
  if (words.length <= wordLimit) return str;
  return words.slice(0, wordLimit).join(' ') + '...';
}

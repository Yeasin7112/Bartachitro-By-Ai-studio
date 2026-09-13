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

/**
 * Convert any Date or string to Bangladesh Standard Time (BST, UTC+6)
 */
export function toBangladeshDate(dateInput: string | Date = new Date()): Date {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return new Date();
  try {
    const dhakaStr = d.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    return new Date(dhakaStr);
  } catch {
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 6));
  }
}

/**
 * Get Bangladeshi time-of-day period in Bengali: ভোর, সকাল, দুপুর, বিকাল, সন্ধ্যা, রাত
 */
export function getBangladeshiPeriod(hours24: number): string {
  if (hours24 >= 4 && hours24 < 6) return 'ভোর';
  if (hours24 >= 6 && hours24 < 12) return 'দিন (সকাল)';
  if (hours24 >= 12 && hours24 < 15) return 'দিন (দুপুর)';
  if (hours24 >= 15 && hours24 < 18) return 'দিন (বিকাল)';
  if (hours24 >= 18 && hours24 < 20) return 'সন্ধ্যা';
  return 'রাত';
}

/**
 * Upper header date & time representation matching user instruction:
 * "তারিখঃ সময়। সন্ধ্যা/দিন"
 */
export function getBangladeshiHeaderDate(dateInput: string | Date = new Date()): {
  dateLabel: string;
  timeLabel: string;
  period: string;
  fullDisplay: string;
} {
  const date = toBangladeshDate(dateInput);

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

  const dateLabel = `তারিখঃ ${day} ${month} ${year}, ${dayName}`;

  const hours24 = date.getHours();
  const minutes = bnNum(String(date.getMinutes()).padStart(2, '0'));
  const period = getBangladeshiPeriod(hours24);

  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;

  const timeLabel = `সময়ঃ ${period} ${bnNum(hours12)}:${minutes}`;
  const fullDisplay = `${dateLabel} | ${timeLabel}`;

  return { dateLabel, timeLabel, period, fullDisplay };
}

export function bnDate(dateStr: string | Date = new Date(), includeTime = true): string {
  const date = toBangladeshDate(dateStr);
  if (isNaN(date.getTime())) return typeof dateStr === 'string' ? dateStr : '';

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
    const hours24 = date.getHours();
    const minutes = bnNum(String(date.getMinutes()).padStart(2, '0'));
    const period = getBangladeshiPeriod(hours24);
    let hours12 = hours24 % 12;
    if (hours12 === 0) hours12 = 12;
    formatted += ` | ${period} ${bnNum(hours12)}:${minutes}`;
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

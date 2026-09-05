import JSZip from 'jszip';

export async function downloadPhpProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Project readme
  zip.file('README.txt', `=====================================================
বার্তাচিত্র (BartaChitro) - PHP 8+ & MySQL 8+ নিউজপেপার ও ই-পত্রিকা পোর্টাল
=====================================================
ব্র্যান্ড নাম: বার্তাচিত্র (BartaChitro)
স্লোগান: "সত্যের সংবাদ, সবার ভাষায়"

১. ইনস্টলেশন নির্দেশিকা (cPanel / Apache / Nginx):
-----------------------------------------------------
১) cPanel এর phpMyAdmin-এ গিয়ে একটি নতুন ডাটাবেজ তৈরি করুন (Collation: utf8mb4_unicode_ci)।
২) 'database/database.sql' ফাইলটি phpMyAdmin-এ Import করুন।
৩) 'config/database.php' ফাইলে আপনার ডাটাবেজের নাম, ইউজার ও পাসওয়ার্ড দিন:
   DB_HOST = 'localhost';
   DB_USER = 'your_cpanel_db_user';
   DB_PASS = 'your_cpanel_db_password';
   DB_NAME = 'your_cpanel_db_name';
৪) সকল ফাইল আপনার ডোমেইনের public_html ফোল্ডারে আপলোড করুন।

২. অ্যাডমিন লগইন ক্রেডেনশিয়াল:
-----------------------------------------------------
ইউআরএল: yourdomain.com/admin/login.php
ইউজারনেম: admin
পাসওয়ার্ড: admin123

ধন্যবাদ!
বার্তাচিত্র মিডিয়া টিম।
`);

  // We can fetch files directly or provide complete code in the zip bundle
  const filesToFetch = [
    'config/config.php',
    'config/database.php',
    'database/database.sql',
    'includes/functions.php',
    'includes/auth.php',
    'includes/db.php',
    'includes/header.php',
    'includes/navbar.php',
    'includes/breaking-news.php',
    'includes/footer.php',
    'assets/css/style.css',
    'assets/css/admin.css',
    'assets/js/main.js',
    'assets/js/admin.js',
    'index.php',
    'article.php',
    'category.php',
    'search.php',
    'archive.php',
    'epaper.php',
    'contact.php',
    'about.php',
    'privacy.php',
    'api/search-suggest.php',
    'api/increment-view.php',
    'admin/login.php',
    'admin/logout.php',
    'admin/header.php',
    'admin/footer.php',
    'admin/index.php',
    'admin/news.php',
    'admin/news-add.php',
    'admin/news-edit.php',
    'admin/categories.php',
    'admin/breaking.php',
    'admin/epaper.php',
    'admin/ads.php',
    'admin/settings.php',
    'admin/messages.php',
    'admin/profile.php'
  ];

  for (const relPath of filesToFetch) {
    try {
      // In Vite dev, we can request /bartachitro/<relPath>
      const response = await fetch(`/bartachitro/${relPath}`);
      if (response.ok) {
        const text = await response.text();
        zip.file(relPath, text);
      }
    } catch {
      // Fallback
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'bartachitro-php-mysql-portal.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

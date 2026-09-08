<?php
require_once __DIR__ . '/config.php';

$db = getDb();
$method = $_SERVER['REQUEST_METHOD'];

// Fallback initial settings
$defaultSettings = [
    'site_name' => 'বার্তাচিত্র',
    'site_name_en' => 'BartaChitro',
    'site_tagline' => 'সত্যের সংবাদ, সবার ভাষায়',
    'tagline' => 'সত্যের সংবাদ, সবার ভাষায়',
    'editor_name' => 'আহমেদ রফিক চৌধুরী',
    'executive_editor' => 'শাহনেওয়াজ করিম',
    'email' => 'editor@bartachitro.com',
    'phone' => '+৮৮০ ২ ৯৮৭৬৫৪৩, ০১৭১১-০০০০০০',
    'address' => 'বার্তাচিত্র ভবন, ৪৪ কারওয়ান বাজার, ঢাকা-১২১৫, বাংলাদেশ',
    'facebook_url' => 'https://facebook.com/bartachitro',
    'twitter_url' => 'https://x.com/bartachitro',
    'youtube_url' => 'https://youtube.com/bartachitro',
    'instagram_url' => 'https://instagram.com/bartachitro',
    'meta_title' => 'বার্তাচিত্র | সত্যের সংবাদ, সবার ভাষায়',
    'meta_description' => 'বার্তাচিত্র - বাংলাদেশের অন্যতম জনপ্রিয় বাংলা অনলাইন সংবাদপত্র ও ডিজিটাল ই-পত্রিকা।',
    'meta_keywords' => 'বার্তাচিত্র, বাংলা সংবাদ, বাংলাদেশ, ই-পত্রিকা, ব্রেকিং নিউজ',
    'site_logo' => '',
    'logo_url' => '',
    'favicon_url' => '',
    'watermark_url' => '',
    'copyright_text' => '© ২০২৬ বার্তাচিত্র মিডিয়া লিমিটেড। সর্বস্বত্ব সংরক্ষিত।',
    'disable_ads' => false
];

if (!$db) {
    sendResponse(['error' => 'Database connection failed'], 500);
}

try {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT key_name, key_value FROM settings");
        $settings = $defaultSettings;
        while ($row = $stmt->fetch()) {
            $key = $row['key_name'];
            $val = $row['key_value'];
            if ($key === 'disable_ads') {
                $settings[$key] = ($val === '1' || $val === 'true');
            } else {
                $settings[$key] = $val;
            }
        }
        sendResponse(['status' => 'ok', 'data' => $settings, 'source' => 'mysql']);
    } 
    elseif ($method === 'POST' || $method === 'PUT') {
        if (!checkAdminAuth()) {
            sendResponse(['error' => 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে অ্যাডমিন হিসেবে লগইন করুন।'], 401);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            sendResponse(['error' => 'Invalid JSON input'], 400);
        }

        $stmt = $db->prepare("INSERT INTO settings (key_name, key_value) 
                              VALUES (:key, :val) 
                              ON DUPLICATE KEY UPDATE key_value = :val");

        foreach ($input as $key => $val) {
            $valStr = is_bool($val) ? ($val ? '1' : '0') : (string)$val;
            $stmt->execute([':key' => $key, ':val' => $valStr]);
        }

        sendResponse(['status' => 'ok', 'message' => 'Settings saved successfully', 'data' => $input]);
    }
} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}

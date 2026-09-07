<?php
require_once __DIR__ . '/config.php';

$db = getDb();
$method = $_SERVER['REQUEST_METHOD'];

// Fallback initial settings
$defaultSettings = [
    'site_name' => 'বার্তাচিত্র',
    'site_tagline' => 'সত্যের সংবাদ, সবার ভাষায়',
    'editor_name' => 'আহমেদ রফিক চৌধুরী',
    'executive_editor' => 'শাহনেওয়াজ করিম',
    'email' => 'editor@bartachitro.com',
    'phone' => '+৮৮০ ২ ৯৮৭৬৫৪৩',
    'address' => 'বার্তাচিত্র ভবন, ৪৪ কারওয়ান বাজার, ঢাকা-১২১৫, বাংলাদেশ',
    'facebook_url' => 'https://facebook.com',
    'twitter_url' => 'https://twitter.com',
    'youtube_url' => 'https://youtube.com',
    'meta_description' => 'বার্তাচিত্র - বাংলাদেশের অন্যতম জনপ্রিয় বাংলা অনলাইন সংবাদপত্র ও ডিজিটাল ই-পত্রিকা।',
    'meta_keywords' => 'বার্তাচিত্র, বাংলা সংবাদ, বাংলাদেশ, ই-পত্রিকা, ব্রেকিং নিউজ',
    'logo_url' => '',
    'favicon_url' => '',
    'disable_ads' => false
];

if (!$db) {
    // If DB is not connected yet, respond with default
    sendResponse(['status' => 'ok', 'data' => $defaultSettings, 'source' => 'default']);
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

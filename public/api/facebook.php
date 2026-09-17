<?php
/**
 * BartaChitro (বার্তাচিত্র) - Facebook Graph API & Auto-Post Backend
 * Fully compatible with cPanel / Apache / LiteSpeed / PHP 7.4 - 8.3+ & MySQL
 */

require_once __DIR__ . '/config.php';

$db = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($method !== 'POST') {
    sendResponse(['status' => 'error', 'message' => 'Method not allowed. Only POST is accepted.'], 405);
}

// Determine action (test vs post) from query param, PATH_INFO, or URI
$action = $_GET['action'] ?? '';
$uri = $_SERVER['REQUEST_URI'] ?? '';

if (empty($action)) {
    if (strpos($uri, '/test') !== false) {
        $action = 'test';
    } elseif (strpos($uri, '/post') !== false) {
        $action = 'post';
    } else {
        $action = 'post';
    }
}

// Read JSON input body
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?: [];

// Fetch settings from database if available
$fbConfig = [];
if ($db) {
    try {
        $stmt = $db->prepare("SELECT key_value FROM settings WHERE key_name = 'facebook_auto_post' LIMIT 1");
        $stmt->execute();
        $row = $stmt->fetch();
        if ($row && !empty($row['key_value'])) {
            $fbConfig = json_decode($row['key_value'], true) ?: [];
        }
    } catch (Exception $e) {
        // Table or row not found
    }
}

// ==========================================
// 1. TEST CONNECTION (Graph API Page Check)
// ==========================================
if ($action === 'test') {
    $pageId = trim($body['page_id'] ?? $fbConfig['page_id'] ?? '');
    $token = trim($body['page_access_token'] ?? $fbConfig['page_access_token'] ?? '');
    $testMode = !empty($body['test_mode']) || !empty($fbConfig['test_mode']);

    if (empty($pageId)) {
        sendResponse(['status' => 'error', 'message' => 'ফেসবুক পেজ আইডি (Page ID) প্রদান করুন।'], 400);
    }

    // Test / Demo Simulation Mode
    if ($testMode || strpos($token, 'test_') === 0 || strpos($token, 'demo_') === 0 || $token === 'simulated_token') {
        $demoPage = [
            'id' => $pageId,
            'name' => 'বার্তাচিত্র - BartaChitro (ভেরিফায়েড পেজ)',
            'link' => "https://facebook.com/{$pageId}",
            'picture' => [
                'data' => [
                    'url' => 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=100&h=100&fit=crop'
                ]
            ],
            'followers_count' => 52400,
            'is_simulated' => true
        ];
        sendResponse([
            'status' => 'ok',
            'message' => 'টেস্ট মোড সফল! আপনার ডেমো ফেসবুক পেজ ভেরিফিকেশন সম্পন্ন হয়েছে।',
            'page' => $demoPage
        ]);
    }

    if (empty($token)) {
        sendResponse(['status' => 'error', 'message' => 'ফেসবুক পেজ অ্যাক্সেস টোকেন (Page Access Token) প্রয়োজন।'], 400);
    }

    // Call real Meta Graph API v19.0 via cURL
    $graphUrl = "https://graph.facebook.com/v19.0/" . rawurlencode($pageId) . "?fields=id,name,link,picture,followers_count&access_token=" . rawurlencode($token);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $graphUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'BartaChitro-CMS/1.0 (cPanel-Production)');
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($response === false || !empty($curlErr)) {
        sendResponse([
            'status' => 'error',
            'message' => 'সার্ভার থেকে ফেসবুক সার্ভারে সংযোগ করা যায়নি: ' . ($curlErr ?: 'টাইমআউট')
        ], 500);
    }

    $fbData = json_decode($response, true);

    if ($httpCode >= 400 || !empty($fbData['error'])) {
        $errDetails = $fbData['error']['message'] ?? 'ফেসবুক পেজ যাচাই করতে সমস্যা হয়েছে।';
        $userFriendly = $errDetails;
        if (strpos($errDetails, 'Invalid OAuth') !== false || strpos($errDetails, 'access token') !== false) {
            $userFriendly = 'ফেসবুক টোকেনটি সঠিক নয় বা মেয়াদোত্তীর্ণ হয়ে গেছে। মেটা ডেভেলপার থেকে নতুন পার্মানেন্ট পেজ টোকেন সংগ্রহ করুন।';
        } elseif (strpos($errDetails, 'Cannot find') !== false || strpos($errDetails, 'Object with ID') !== false) {
            $userFriendly = 'ফেসবুক পেজ আইডি (Page ID) খুঁজে পাওয়া যায়নি। আপনার পেজের About সেকশন থেকে সংখ্যাসূচক আইডি নিশ্চিত করুন।';
        }
        sendResponse([
            'status' => 'error',
            'message' => $userFriendly,
            'raw_error' => $fbData['error'] ?? null
        ], 400);
    }

    sendResponse([
        'status' => 'ok',
        'message' => 'অভিনন্দন! "' . ($fbData['name'] ?? 'Facebook Page') . '" ফেসবুক পেজের সাথে সফলভাবে সংযোগ স্থাপিত হয়েছে।',
        'page' => $fbData
    ]);
}

// ==========================================
// 2. POST ARTICLE TO FACEBOOK GRAPH API
// ==========================================
if ($action === 'post') {
    $pageId = trim($body['page_id'] ?? $fbConfig['page_id'] ?? '');
    $token = trim($body['page_access_token'] ?? $fbConfig['page_access_token'] ?? '');
    $postType = $body['post_type'] ?? $fbConfig['post_type'] ?? 'photo';
    $articleId = !empty($body['article_id']) ? (int)$body['article_id'] : 0;
    $testMode = !empty($body['test_mode']) || !empty($fbConfig['test_mode']);

    if (empty($pageId)) {
        sendResponse(['status' => 'error', 'message' => 'ফেসবুক পেজ আইডি কনফিগার করা নেই।'], 400);
    }

    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
    $host = $_SERVER['HTTP_HOST'] ?? 'bartachitro.com';
    $siteHost = $protocol . $host;

    $articleTitle = $body['title'] ?? 'শিরোনামবিহীন সংবাদ';
    $articleSummary = $body['summary'] ?? '';
    $slug = $body['slug'] ?? '';
    $articleUrl = $body['url'] ?? ($slug ? "{$siteHost}/article.php?slug=" . rawurlencode($slug) : "{$siteHost}/news/{$articleId}");
    $imageUrl = $body['image_url'] ?? $body['featured_image'] ?? '';
    $hashtags = $body['hashtags'] ?? $fbConfig['default_hashtags'] ?? '#বার্তাচিত্র #সংবাদ #বাংলাদেশ';

    $fullMessage = $body['custom_message'] ?? trim("{$articleTitle}\n\n{$articleSummary}\n\nবিস্তারিত পড়ুন: {$articleUrl}\n\n{$hashtags}");

    // Simulation / Test Mode Handling
    if ($testMode || strpos($token, 'test_') === 0 || strpos($token, 'demo_') === 0 || $token === 'simulated_token') {
        $simulatedPostId = "{$pageId}_" . time();
        $simulatedUrl = "https://facebook.com/{$pageId}/posts/" . time();

        if ($articleId > 0 && $db) {
            try {
                $upStmt = $db->prepare("UPDATE news SET 
                    facebook_post_id = :pid, 
                    facebook_posted_at = NOW(), 
                    facebook_post_url = :purl, 
                    facebook_post_status = 'posted' 
                    WHERE id = :id");
                $upStmt->execute([':pid' => $simulatedPostId, ':purl' => $simulatedUrl, ':id' => $articleId]);
            } catch (Exception $e) {}
        }

        sendResponse([
            'status' => 'ok',
            'is_simulated' => true,
            'post_id' => $simulatedPostId,
            'post_url' => $simulatedUrl,
            'message' => 'ফেসবুক পেজে সফলভাবে টেস্ট পোস্ট পাবলিশ করা হয়েছে (সিমুলেশন মোড)!'
        ]);
    }

    if (empty($token)) {
        sendResponse(['status' => 'error', 'message' => 'ফেসবুক পেজ অ্যাক্সেস টোকেন প্রয়োজন।'], 400);
    }

    // Determine target Graph endpoint & parameters
    $isPhoto = ($postType === 'photo' && !empty($imageUrl));
    if ($isPhoto) {
        $fbPostEndpoint = "https://graph.facebook.com/v19.0/" . rawurlencode($pageId) . "/photos";
        $fullImg = (strpos($imageUrl, 'http') === 0) ? $imageUrl : "{$siteHost}{$imageUrl}";
        $postParams = [
            'url' => $fullImg,
            'caption' => $fullMessage,
            'access_token' => $token
        ];
    } else {
        $fbPostEndpoint = "https://graph.facebook.com/v19.0/" . rawurlencode($pageId) . "/feed";
        $postParams = [
            'message' => $fullMessage,
            'link' => $articleUrl,
            'access_token' => $token
        ];
    }

    // Execute Graph API POST via cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $fbPostEndpoint);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postParams));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 25);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'BartaChitro-CMS/1.0 (cPanel-Production)');
    $resStr = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($resStr === false || !empty($curlErr)) {
        sendResponse([
            'status' => 'error',
            'message' => 'ফেসবুক সার্ভার সংযোগ ত্রুটি: ' . ($curlErr ?: 'টাইমআউট')
        ], 500);
    }

    $postData = json_decode($resStr, true);

    if ($httpCode >= 400 || !empty($postData['error'])) {
        $errMsg = $postData['error']['message'] ?? 'ফেসবুকে পোস্ট করতে ব্যর্থ হয়েছে।';

        if ($articleId > 0 && $db) {
            try {
                $failStmt = $db->prepare("UPDATE news SET 
                    facebook_post_status = 'failed', 
                    facebook_post_error = :err 
                    WHERE id = :id");
                $failStmt->execute([':err' => $errMsg, ':id' => $articleId]);
            } catch (Exception $e) {}
        }

        sendResponse([
            'status' => 'error',
            'message' => $errMsg,
            'raw_error' => $postData['error'] ?? null
        ], 400);
    }

    $postId = $postData['id'] ?? $postData['post_id'] ?? '';
    $postPermalink = $postId ? "https://facebook.com/{$postId}" : "https://facebook.com/{$pageId}";

    // Update news record in MySQL
    if ($articleId > 0 && $db) {
        try {
            $upStmt = $db->prepare("UPDATE news SET 
                facebook_post_id = :pid, 
                facebook_posted_at = NOW(), 
                facebook_post_url = :purl, 
                facebook_post_status = 'posted',
                facebook_post_error = NULL
                WHERE id = :id");
            $upStmt->execute([':pid' => $postId, ':purl' => $postPermalink, ':id' => $articleId]);
        } catch (Exception $e) {}
    }

    // Update settings last post stats
    if ($db) {
        try {
            $fbConfig['last_post_id'] = $postId;
            $fbConfig['last_post_time'] = date('c');
            $fbConfig['last_post_status'] = 'success';
            $setStmt = $db->prepare("INSERT INTO settings (key_name, key_value) 
                VALUES ('facebook_auto_post', :val) 
                ON DUPLICATE KEY UPDATE key_value = :val");
            $setStmt->execute([':val' => json_encode($fbConfig, JSON_UNESCAPED_UNICODE)]);
        } catch (Exception $e) {}
    }

    sendResponse([
        'status' => 'ok',
        'post_id' => $postId,
        'post_url' => $postPermalink,
        'message' => 'ফেসবুক পেজে সফলভাবে পোস্ট করা হয়েছে!'
    ]);
}

sendResponse(['status' => 'error', 'message' => 'Invalid action'], 400);

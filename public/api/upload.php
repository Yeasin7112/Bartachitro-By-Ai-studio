<?php
require_once __DIR__ . '/config.php';

$uploadDir = dirname(__DIR__) . '/uploads';

if (!file_exists($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

// Ensure .htaccess prevents any script execution in uploads directory
$htaccessFile = $uploadDir . '/.htaccess';
if (!file_exists($htaccessFile)) {
    $htaccessContent = <<<HTACCESS
# Block execution of any server scripts in uploads directory
<FilesMatch "\.(php|phtml|php3|php4|php5|php7|php8|phps|cgi|pl|py|sh|bash|exe|asp|aspx|jsp|phar)$">
    Require all denied
</FilesMatch>

RemoveHandler .php .phtml .php3 .php4 .php5 .php7 .php8 .phps .cgi .pl .py .sh
RemoveType .php .phtml .php3 .php4 .php5 .php7 .php8 .phps .cgi .pl .py .sh
<IfModule mod_php7.c>
    php_flag engine off
</IfModule>
<IfModule mod_php8.c>
    php_flag engine off
</IfModule>

Options -Indexes -ExecCGI
HTACCESS;
    @file_put_contents($htaccessFile, $htaccessContent);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendResponse(['error' => 'Method not allowed. Use POST.'], 405);
}

if (!checkAdminAuth()) {
    sendResponse(['error' => 'অননুমোদিত অ্যাক্সেস। ফাইল আপলোড করতে অনুগ্রহ করে অ্যাডমিন হিসেবে লগইন করুন।'], 401);
}

$allowedMimes = [
    'image/jpeg' => 'jpg',
    'image/pjpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
    'image/svg+xml' => 'svg',
    'image/x-icon' => 'ico',
    'image/vnd.microsoft.icon' => 'ico',
    'application/pdf' => 'pdf',
    'video/mp4' => 'mp4',
    'video/webm' => 'webm',
    'video/ogg' => 'ogg',
    'video/quicktime' => 'mov'
];

try {
    // 1. Check if multipart file was uploaded
    $uploadedFile = $_FILES['file'] ?? $_FILES['image'] ?? $_FILES['video'] ?? null;

    if ($uploadedFile && isset($uploadedFile['tmp_name']) && is_uploaded_file($uploadedFile['tmp_name'])) {
        if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
            sendResponse(['error' => 'File upload error code: ' . $uploadedFile['error']], 400);
        }

        // Validate real MIME type via finfo
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $detectedMime = finfo_file($finfo, $uploadedFile['tmp_name']);
        finfo_close($finfo);

        if (!$detectedMime || !isset($allowedMimes[$detectedMime])) {
            sendResponse(['error' => 'নিরাপত্তাজনিত কারণে এই ধরণের ফাইল আপলোড নিষিদ্ধ। শুধু ছবি (JPG, PNG, WebP, SVG, GIF) বা ভিডিও (MP4, WebM) অনুমোদিত।'], 400);
        }

        $cleanExt = $allowedMimes[$detectedMime];
        $isVideo = in_array($cleanExt, ['mp4', 'webm', 'ogg', 'mov']);

        // Size limits: 50MB for video, 15MB for image/pdf
        $maxSize = $isVideo ? (50 * 1024 * 1024) : (15 * 1024 * 1024);
        if ($uploadedFile['size'] > $maxSize) {
            sendResponse(['error' => 'ফাইল সাইজ অনুমোদিত সীমার বেশি। ছবি সর্বোচ্চ ১৫ মেগাবাইট এবং ভিডিও সর্বোচ্চ ৫০ মেগাবাইট।'], 400);
        }

        // If SVG, check for embedded scripts or dangerous markup
        if ($cleanExt === 'svg') {
            $svgContent = file_get_contents($uploadedFile['tmp_name']);
            if (preg_match('/<script|javascript:|onload=|onerror=|onclick=|<iframe|<embed|<object/i', $svgContent)) {
                sendResponse(['error' => 'নিরাপত্তাজনিত কারণে বিপজ্জনক স্ক্রিপ্টযুক্ত SVG ফাইল গ্রহণ করা হয়নি।'], 400);
            }
        }

        $prefix = $isVideo ? 'video-' : 'upload-';
        $randomHex = bin2hex(random_bytes(8));
        $filename = $prefix . time() . '-' . $randomHex . '.' . $cleanExt;
        $targetPath = $uploadDir . '/' . $filename;

        if (move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
            @chmod($targetPath, 0644);
            $url = '/uploads/' . $filename;
            sendResponse([
                'status' => 'ok',
                'url' => $url,
                'filename' => $filename,
                'size' => $uploadedFile['size'],
                'message' => 'File uploaded successfully'
            ]);
        } else {
            sendResponse(['error' => 'Failed to save uploaded file. Check directory permissions.'], 500);
        }
    }

    // 2. Check if sent as JSON base64 data
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    $base64Input = $data['image'] ?? $data['video'] ?? $data['file'] ?? null;

    if ($data && !empty($base64Input)) {
        if (preg_match('/^data:([^;]+);base64,(.+)$/s', $base64Input, $matches)) {
            $headerMime = strtolower(trim($matches[1]));
            $base64Data = $matches[2];

            if (!isset($allowedMimes[$headerMime])) {
                sendResponse(['error' => 'অননুমোদিত মিডিয়া ফরম্যাট।'], 400);
            }

            $decoded = base64_decode($base64Data, true);
            if ($decoded === false) {
                sendResponse(['error' => 'Base64 decode failed'], 400);
            }

            $cleanExt = $allowedMimes[$headerMime];
            $isVideo = in_array($cleanExt, ['mp4', 'webm', 'ogg', 'mov']);
            $maxSize = $isVideo ? (50 * 1024 * 1024) : (15 * 1024 * 1024);

            if (strlen($decoded) > $maxSize) {
                sendResponse(['error' => 'ফাইলের আকার অনুমোদিত সীমার বাইরে।'], 400);
            }

            // Verify MIME with finfo on decoded buffer
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $verifiedMime = finfo_buffer($finfo, $decoded);
            finfo_close($finfo);

            // Allow match if verified MIME is allowed or matches svg/xml
            if ($verifiedMime && !isset($allowedMimes[$verifiedMime]) && strpos($verifiedMime, 'text/plain') === false && strpos($verifiedMime, 'text/xml') === false) {
                sendResponse(['error' => 'ফাইল কনটেন্ট যাচাইকরণে ত্রুটি হয়েছে।'], 400);
            }

            if ($cleanExt === 'svg' && preg_match('/<script|javascript:|onload=|onerror=|onclick=|<iframe|<embed|<object/i', $decoded)) {
                sendResponse(['error' => 'বিপজ্জনক স্ক্রিপ্টযুক্ত SVG ফাইল গ্রহণ করা হয়নি।'], 400);
            }

            $prefix = $isVideo ? 'video-' : 'upload-';
            $randomHex = bin2hex(random_bytes(8));
            $filename = $prefix . time() . '-' . $randomHex . '.' . $cleanExt;
            $targetPath = $uploadDir . '/' . $filename;

            if (file_put_contents($targetPath, $decoded)) {
                @chmod($targetPath, 0644);
                $url = '/uploads/' . $filename;
                sendResponse([
                    'status' => 'ok',
                    'url' => $url,
                    'filename' => $filename,
                    'size' => strlen($decoded),
                    'message' => 'File saved successfully'
                ]);
            } else {
                sendResponse(['error' => 'Failed to write media file'], 500);
            }
        } else {
            sendResponse(['error' => 'Invalid base64 media data URI format'], 400);
        }
    }

    sendResponse(['error' => 'No file or image data received'], 400);
} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}

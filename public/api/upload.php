<?php
require_once __DIR__ . '/config.php';

$uploadDir = dirname(__DIR__) . '/uploads';

if (!file_exists($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendResponse(['error' => 'Method not allowed. Use POST.'], 405);
}

if (!checkAdminAuth()) {
    sendResponse(['error' => 'অননুমোদিত অ্যাক্সেস। ফাইল আপলোড করতে অনুগ্রহ করে অ্যাডমিন হিসেবে লগইন করুন।'], 401);
}

try {
    // 1. Check if multipart file was uploaded
    $uploadedFile = $_FILES['file'] ?? $_FILES['image'] ?? $_FILES['video'] ?? null;

    if ($uploadedFile && isset($uploadedFile['tmp_name']) && is_uploaded_file($uploadedFile['tmp_name'])) {
        if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
            sendResponse(['error' => 'File upload error code: ' . $uploadedFile['error']], 400);
        }

        // Limit size to 50MB for videos, 15MB for images
        if ($uploadedFile['size'] > 50 * 1024 * 1024) {
            sendResponse(['error' => 'File size exceeds 50MB limit'], 400);
        }

        $origName = basename($uploadedFile['name']);
        $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'ico', 'pdf', 'mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi'];

        if (!in_array($ext, $allowedExtensions)) {
            sendResponse(['error' => 'Invalid file type. Allowed: images (jpg, png, webp, svg, gif, ico) and videos (mp4, webm, mov, ogg)'], 400);
        }

        $prefix = in_array($ext, ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi']) ? 'video-' : 'upload-';
        $filename = $prefix . time() . '-' . substr(md5(uniqid(rand(), true)), 0, 8) . '.' . $ext;
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
            $mime = strtolower(trim($matches[1]));
            $base64Data = $matches[2];
            
            $ext = 'jpg';
            $prefix = 'upload-';
            if (strpos($mime, 'png') !== false) $ext = 'png';
            elseif (strpos($mime, 'webp') !== false) $ext = 'webp';
            elseif (strpos($mime, 'svg') !== false) $ext = 'svg';
            elseif (strpos($mime, 'gif') !== false) $ext = 'gif';
            elseif (strpos($mime, 'ico') !== false) $ext = 'ico';
            elseif (strpos($mime, 'mp4') !== false) { $ext = 'mp4'; $prefix = 'video-'; }
            elseif (strpos($mime, 'webm') !== false) { $ext = 'webm'; $prefix = 'video-'; }
            elseif (strpos($mime, 'ogg') !== false) { $ext = 'ogg'; $prefix = 'video-'; }
            elseif (strpos($mime, 'quicktime') !== false || strpos($mime, 'mov') !== false) { $ext = 'mov'; $prefix = 'video-'; }

            $decoded = base64_decode($base64Data);
            if ($decoded === false) {
                sendResponse(['error' => 'Base64 decode failed'], 400);
            }

            $filename = $prefix . time() . '-' . substr(md5(uniqid(rand(), true)), 0, 8) . '.' . $ext;
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

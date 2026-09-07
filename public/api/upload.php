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

try {
    // 1. Check if multipart file was uploaded
    $uploadedFile = $_FILES['file'] ?? $_FILES['image'] ?? null;

    if ($uploadedFile && isset($uploadedFile['tmp_name']) && is_uploaded_file($uploadedFile['tmp_name'])) {
        if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
            sendResponse(['error' => 'File upload error code: ' . $uploadedFile['error']], 400);
        }

        // Limit size to 10MB
        if ($uploadedFile['size'] > 10 * 1024 * 1024) {
            sendResponse(['error' => 'File size exceeds 10MB limit'], 400);
        }

        $origName = basename($uploadedFile['name']);
        $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'ico', 'pdf'];

        if (!in_array($ext, $allowedExtensions)) {
            sendResponse(['error' => 'Invalid file type. Allowed: jpg, jpeg, png, webp, svg, gif, ico'], 400);
        }

        $filename = 'upload-' . time() . '-' . substr(md5(uniqid(rand(), true)), 0, 8) . '.' . $ext;
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

    if ($data && !empty($data['image'])) {
        $base64 = $data['image'];
        if (preg_match('/^data:image\/(\w+);base64,/', $base64, $type)) {
            $base64 = substr($base64, strpos($base64, ',') + 1);
            $ext = strtolower($type[1]);
            if ($ext === 'jpeg') $ext = 'jpg';
            
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'];
            if (!in_array($ext, $allowedExtensions)) {
                $ext = 'png';
            }

            $decoded = base64_decode($base64);
            if ($decoded === false) {
                sendResponse(['error' => 'Base64 decode failed'], 400);
            }

            $filename = 'img-' . time() . '-' . substr(md5(uniqid(rand(), true)), 0, 8) . '.' . $ext;
            $targetPath = $uploadDir . '/' . $filename;

            if (file_put_contents($targetPath, $decoded)) {
                @chmod($targetPath, 0644);
                $url = '/uploads/' . $filename;
                sendResponse([
                    'status' => 'ok',
                    'url' => $url,
                    'filename' => $filename,
                    'message' => 'Image saved successfully'
                ]);
            } else {
                sendResponse(['error' => 'Failed to write image file'], 500);
            }
        } else {
            sendResponse(['error' => 'Invalid base64 image data URI format'], 400);
        }
    }

    sendResponse(['error' => 'No file or image data received'], 400);
} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}

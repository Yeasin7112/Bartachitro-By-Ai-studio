<?php
require_once __DIR__ . '/config.php';

$db = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if (!$db) {
    sendResponse(['error' => 'Database connection failed'], 500);
}

try {
    if ($method === 'GET') {
        $position = isset($_GET['position']) ? trim($_GET['position']) : null;
        $status = isset($_GET['status']) ? trim($_GET['status']) : null;

        $sql = "SELECT * FROM ads WHERE 1=1";
        $params = [];

        if ($position) {
            $sql .= " AND position = :pos";
            $params[':pos'] = $position;
        }
        if ($status && $status !== 'all') {
            $sql .= " AND status = :status";
            $params[':status'] = $status;
        }

        $sql .= " ORDER BY id DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $ads = $stmt->fetchAll();

        $ads = array_map(function($ad) {
            $ad['id'] = (int)$ad['id'];
            $ad['clicks'] = (int)($ad['clicks'] ?? 0);
            return $ad;
        }, $ads);

        sendResponse(['status' => 'ok', 'data' => $ads]);
    }
    elseif ($method === 'POST') {
        if (!checkAdminAuth()) {
            sendResponse(['error' => 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে অ্যাডমিন হিসেবে লগইন করুন।'], 401);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['image_url'])) {
            sendResponse(['error' => 'Image URL is required'], 400);
        }

        $stmt = $db->prepare("INSERT INTO ads (title, position, image_url, target_url, status, start_date, end_date, clicks, created_at) 
                              VALUES (:title, :position, :image_url, :target_url, :status, :start_date, :end_date, 0, NOW())");
        $stmt->execute([
            ':title' => $input['title'] ?? 'বিজ্ঞাপন',
            ':position' => $input['position'] ?? 'sidebar',
            ':image_url' => $input['image_url'],
            ':target_url' => $input['target_url'] ?? '#',
            ':status' => $input['status'] ?? 'active',
            ':start_date' => $input['start_date'] ?? date('Y-m-d'),
            ':end_date' => $input['end_date'] ?? date('Y-m-d', strtotime('+30 days'))
        ]);

        $newId = (int)$db->lastInsertId();
        sendResponse([
            'status' => 'ok',
            'id' => $newId,
            'data' => array_merge($input, ['id' => $newId, 'clicks' => 0]),
            'message' => 'Ad created successfully'
        ], 201);
    }
    elseif ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = isset($_GET['id']) ? (int)$_GET['id'] : (int)($input['id'] ?? 0);

        if (!$id) {
            sendResponse(['error' => 'Ad ID is required'], 400);
        }

        // Special case: increment click count (public)
        if (isset($input['action']) && $input['action'] === 'click') {
            $stmt = $db->prepare("UPDATE ads SET clicks = clicks + 1 WHERE id = :id");
            $stmt->execute([':id' => $id]);
            sendResponse(['status' => 'ok', 'message' => 'Click registered']);
        }

        if (!checkAdminAuth()) {
            sendResponse(['error' => 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে অ্যাডমিন হিসেবে লগইন করুন।'], 401);
        }

        $stmt = $db->prepare("UPDATE ads SET 
            title = :title, 
            position = :position, 
            image_url = :image_url, 
            target_url = :target_url, 
            status = :status 
            WHERE id = :id");

        $stmt->execute([
            ':title' => $input['title'] ?? 'বিজ্ঞাপন',
            ':position' => $input['position'] ?? 'sidebar',
            ':image_url' => $input['image_url'] ?? '',
            ':target_url' => $input['target_url'] ?? '#',
            ':status' => $input['status'] ?? 'active',
            ':id' => $id
        ]);

        sendResponse(['status' => 'ok', 'message' => 'Ad updated successfully', 'data' => $input]);
    }
    elseif ($method === 'DELETE') {
        if (!checkAdminAuth()) {
            sendResponse(['error' => 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে অ্যাডমিন হিসেবে লগইন করুন।'], 401);
        }
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if (!$id) {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = (int)($input['id'] ?? 0);
        }

        if (!$id) {
            sendResponse(['error' => 'Ad ID is required'], 400);
        }

        $stmt = $db->prepare("DELETE FROM ads WHERE id = :id");
        $stmt->execute([':id' => $id]);

        sendResponse(['status' => 'ok', 'message' => 'Ad deleted successfully', 'id' => $id]);
    }
} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}

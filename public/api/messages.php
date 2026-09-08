<?php
require_once __DIR__ . '/config.php';

$db = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if (!$db) {
    sendResponse(['error' => 'Database connection failed'], 500);
}

try {
    if ($method === 'GET') {
        if (!checkAdminAuth()) {
            sendResponse(['error' => 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে অ্যাডমিন হিসেবে লগইন করুন।'], 401);
        }

        $stmt = $db->query("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200");
        $msgs = $stmt->fetchAll();

        $msgs = array_map(function($m) {
            $m['id'] = (int)$m['id'];
            $m['is_read'] = (bool)$m['is_read'];
            return $m;
        }, $msgs);

        sendResponse(['status' => 'ok', 'data' => $msgs]);
    }
    elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['name']) || empty($input['message'])) {
            sendResponse(['error' => 'Name and message are required'], 400);
        }

        $stmt = $db->prepare("INSERT INTO contact_messages (name, email, phone, subject, message, is_read, created_at) 
                              VALUES (:name, :email, :phone, :subject, :message, 0, NOW())");
        $stmt->execute([
            ':name' => $input['name'],
            ':email' => $input['email'] ?? '',
            ':phone' => $input['phone'] ?? '',
            ':subject' => $input['subject'] ?? 'সাধারণ অনুসন্ধান',
            ':message' => $input['message']
        ]);

        $newId = (int)$db->lastInsertId();
        sendResponse([
            'status' => 'ok',
            'id' => $newId,
            'message' => 'Message sent successfully'
        ], 201);
    }
    elseif ($method === 'PUT') {
        if (!checkAdminAuth()) {
            sendResponse(['error' => 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে অ্যাডমিন হিসেবে লগইন করুন।'], 401);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $id = isset($_GET['id']) ? (int)$_GET['id'] : (int)($input['id'] ?? 0);

        if (!$id) {
            sendResponse(['error' => 'Message ID is required'], 400);
        }

        $isRead = isset($input['is_read']) ? ($input['is_read'] ? 1 : 0) : 1;

        $stmt = $db->prepare("UPDATE contact_messages SET is_read = :is_read WHERE id = :id");
        $stmt->execute([':is_read' => $isRead, ':id' => $id]);

        sendResponse(['status' => 'ok', 'message' => 'Message updated successfully']);
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
            sendResponse(['error' => 'Message ID is required'], 400);
        }

        $stmt = $db->prepare("DELETE FROM contact_messages WHERE id = :id");
        $stmt->execute([':id' => $id]);

        sendResponse(['status' => 'ok', 'message' => 'Message deleted successfully', 'id' => $id]);
    }
} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}

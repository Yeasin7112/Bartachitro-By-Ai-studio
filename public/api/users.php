<?php
require_once __DIR__ . '/config.php';

$db = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if (!$db) {
    sendResponse(['error' => 'Database connection failed'], 500);
}

try {
    if (!checkAdminAuth()) {
        sendResponse(['error' => 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে অ্যাডমিন হিসেবে লগইন করুন।'], 401);
    }

    if ($method === 'GET') {
        $stmt = $db->query("SELECT id, name, username, email, role, avatar, status, created_at FROM users ORDER BY id ASC");
        $users = $stmt->fetchAll();

        $users = array_map(function($u) {
            $u['id'] = (int)$u['id'];
            // Normalize role to frontend type
            if ($u['role'] === 'admin') $u['role'] = 'super_admin';
            return $u;
        }, $users);

        sendResponse(['status' => 'ok', 'data' => $users]);
    }
    elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['username']) || empty($input['name'])) {
            sendResponse(['error' => 'Username and Name are required'], 400);
        }

        $password = !empty($input['password']) ? $input['password'] : 'Admin@' . rand(1000, 9999);
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $role = $input['role'] === 'super_admin' ? 'admin' : ($input['role'] ?? 'editor');

        $stmt = $db->prepare("INSERT INTO users (name, username, email, password, role, avatar, status, created_at) 
                              VALUES (:name, :username, :email, :password, :role, :avatar, :status, NOW())");
        $stmt->execute([
            ':name' => $input['name'],
            ':username' => $input['username'],
            ':email' => $input['email'] ?? ($input['username'] . '@bartachitro.com'),
            ':password' => $passwordHash,
            ':role' => $role,
            ':avatar' => $input['avatar'] ?? '',
            ':status' => $input['status'] ?? 'active'
        ]);

        $newId = (int)$db->lastInsertId();
        sendResponse([
            'status' => 'ok',
            'id' => $newId,
            'message' => 'User created successfully',
            'data' => [
                'id' => $newId,
                'name' => $input['name'],
                'username' => $input['username'],
                'email' => $input['email'] ?? '',
                'role' => $input['role'] ?? 'editor',
                'status' => $input['status'] ?? 'active'
            ]
        ], 201);
    }
    elseif ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = isset($_GET['id']) ? (int)$_GET['id'] : (int)($input['id'] ?? 0);

        if (!$id) {
            sendResponse(['error' => 'User ID is required'], 400);
        }

        $role = ($input['role'] ?? '') === 'super_admin' ? 'admin' : ($input['role'] ?? 'editor');

        if (!empty($input['password'])) {
            $hash = password_hash($input['password'], PASSWORD_BCRYPT);
            $stmt = $db->prepare("UPDATE users SET name = :name, email = :email, role = :role, status = :status, avatar = :avatar, password = :pwd WHERE id = :id");
            $stmt->execute([
                ':name' => $input['name'] ?? '',
                ':email' => $input['email'] ?? '',
                ':role' => $role,
                ':status' => $input['status'] ?? 'active',
                ':avatar' => $input['avatar'] ?? '',
                ':pwd' => $hash,
                ':id' => $id
            ]);
        } else {
            $stmt = $db->prepare("UPDATE users SET name = :name, email = :email, role = :role, status = :status, avatar = :avatar WHERE id = :id");
            $stmt->execute([
                ':name' => $input['name'] ?? '',
                ':email' => $input['email'] ?? '',
                ':role' => $role,
                ':status' => $input['status'] ?? 'active',
                ':avatar' => $input['avatar'] ?? '',
                ':id' => $id
            ]);
        }

        sendResponse(['status' => 'ok', 'message' => 'User updated successfully']);
    }
    elseif ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if (!$id) {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = (int)($input['id'] ?? 0);
        }

        if (!$id) {
            sendResponse(['error' => 'User ID is required'], 400);
        }

        // Protect primary admin account (ID 1)
        if ($id === 1) {
            sendResponse(['error' => 'Cannot delete the primary administrator account'], 403);
        }

        $stmt = $db->prepare("DELETE FROM users WHERE id = :id");
        $stmt->execute([':id' => $id]);

        sendResponse(['status' => 'ok', 'message' => 'User deleted successfully', 'id' => $id]);
    }
} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}

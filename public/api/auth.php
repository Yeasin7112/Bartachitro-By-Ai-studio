<?php
require_once __DIR__ . '/config.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$db = getDb();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? ($_POST['action'] ?? '');

if (!$db) {
    sendResponse(['error' => 'Database connection failed'], 500);
}

try {
    if ($method === 'POST' && ($action === 'login' || empty($action))) {
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($username) || empty($password)) {
            sendResponse(['error' => 'ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন'], 400);
        }

        $stmt = $db->prepare("SELECT * FROM users WHERE (username = :u OR email = :e) AND status = 'active' LIMIT 1");
        $stmt->execute([':u' => $username, ':e' => $username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_id'] = (int)$user['id'];
            $_SESSION['admin_user'] = $user['username'];
            $_SESSION['admin_role'] = $user['role'];

            $sanitizedUser = [
                'id' => (int)$user['id'],
                'name' => $user['name'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => ($user['role'] === 'admin' ? 'super_admin' : $user['role']),
                'avatar' => $user['avatar'] ?? '',
                'status' => $user['status'],
                'created_at' => $user['created_at']
            ];

            sendResponse([
                'status' => 'ok',
                'message' => 'লগইন সফল হয়েছে',
                'user' => $sanitizedUser,
                'token' => session_id()
            ]);
        } else {
            sendResponse(['error' => 'ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়'], 401);
        }
    }
    elseif ($action === 'me' || ($method === 'GET' && empty($action))) {
        if (!empty($_SESSION['admin_logged_in']) && !empty($_SESSION['admin_id'])) {
            $stmt = $db->prepare("SELECT id, name, username, email, role, avatar, status, created_at FROM users WHERE id = :id AND status = 'active' LIMIT 1");
            $stmt->execute([':id' => $_SESSION['admin_id']]);
            $user = $stmt->fetch();
            if ($user) {
                $user['id'] = (int)$user['id'];
                if ($user['role'] === 'admin') $user['role'] = 'super_admin';
                sendResponse(['status' => 'ok', 'authenticated' => true, 'user' => $user]);
            }
        }
        sendResponse(['status' => 'guest', 'authenticated' => false], 200);
    }
    elseif ($action === 'logout' || ($method === 'POST' && $action === 'logout')) {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        sendResponse(['status' => 'ok', 'message' => 'লগআউট সফল হয়েছে']);
    }
} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}

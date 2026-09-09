<?php
/**
 * BartaChitro (বার্তাচিত্র) - cPanel MySQL Database & API Configuration
 * Compatible with PHP 7.4, 8.0, 8.1, 8.2, 8.3+ & MySQL / MariaDB
 */

header('Content-Type: application/json; charset=utf-8');

// Start secure session with cookie security
if (session_status() === PHP_SESSION_NONE) {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? ''));

    if (!empty($authHeader) && preg_match('/Bearer\s+([a-zA-Z0-9,-]{16,128})/i', $authHeader, $matches)) {
        @session_id(trim($matches[1]));
    }

    @session_start([
        'cookie_lifetime' => 86400 * 7,
        'cookie_httponly' => true,
        'cookie_samesite' => 'Lax'
    ]);
}

// Dynamic CORS handling - supports credentials and production domains
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Default cPanel credentials - customize or set in .env / cPanel environment
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'bartachitro_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

function getDb() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // Return null if database connection failed
            return null;
        }
    }
    return $pdo;
}

function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Check admin authorization for write/update/delete requests
 */
function checkAdminAuth() {
    if (session_status() === PHP_SESSION_NONE) {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? ''));

        if (!empty($authHeader) && preg_match('/Bearer\s+([a-zA-Z0-9,-]{16,128})/i', $authHeader, $matches)) {
            $sessId = trim($matches[1]);
            session_id($sessId);
        }

        @session_start([
            'cookie_lifetime' => 86400 * 7,
            'cookie_httponly' => true,
            'cookie_samesite' => 'Lax'
        ]);
    }

    if (!empty($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true && !empty($_SESSION['admin_id'])) {
        return true;
    }

    return false;
}

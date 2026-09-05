<?php
/**
 * BartaChitro (বার্তাচিত্র) - Global Configuration
 */

// Error reporting (turn off for production display)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Start secure session if not started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Timezone (Dhaka, Bangladesh UTC+6)
date_default_timezone_set('Asia/Dhaka');

// Application Constants
define('APP_NAME', 'বার্তাচিত্র');
define('APP_NAME_EN', 'BartaChitro');
define('APP_TAGLINE', 'সত্যের সংবাদ, সবার ভাষায়');
define('APP_VERSION', '1.0.0');

// Dynamic Base URL detection (works automatically on localhost subfolder or cPanel root domain)
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443)) ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
// Normalize base path
$basePath = preg_replace('#/(admin|api|includes|config)$#', '', $scriptDir);
if ($basePath === '/' || $basePath === '\\') {
    $basePath = '';
}
define('BASE_URL', rtrim($protocol . $host . $basePath, '/'));
define('ADMIN_URL', BASE_URL . '/admin');
define('UPLOADS_URL', BASE_URL . '/uploads');
define('ROOT_PATH', realpath(__DIR__ . '/..'));
define('UPLOADS_PATH', ROOT_PATH . '/uploads');

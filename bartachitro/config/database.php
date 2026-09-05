<?php
/**
 * BartaChitro (বার্তাচিত্র) - Database Connection using PDO
 * Supports MySQL 8+ with utf8mb4 collation
 */

require_once __DIR__ . '/config.php';

// Database Credentials
// Update these with your cPanel or local XAMPP/WAMP settings
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'bartachitro_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                // Return clean error without exposing passwords
                error_log("Database Connection Error: " . $e->getMessage());
                die("<div style='font-family:sans-serif;padding:30px;text-align:center;background:#fff1f2;border:1px solid #fda4af;margin:50px auto;max-width:600px;border-radius:8px;'>
                    <h2 style='color:#b91c1c;margin-top:0;'>ডাটাবেজ সংযোগ ত্রুটি (Database Connection Error)</h2>
                    <p style='color:#4b5563;font-size:15px;line-height:1.6;'>ডাটাবেজের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি। অনুগ্রহ করে <code>config/database.php</code> ফাইলে আপনার MySQL ইউজারনেম, পাসওয়ার্ড এবং ডাটাবেজের নাম যাচাই করুন।</p>
                    <p style='color:#6b7280;font-size:13px;'>If on localhost or cPanel, ensure <code>bartachitro_db</code> has been imported from <code>database/database.sql</code>.</p>
                </div>");
            }
        }
        return self::$instance;
    }
}

// Global helper for PDO instance
function getDB(): PDO {
    return Database::getConnection();
}

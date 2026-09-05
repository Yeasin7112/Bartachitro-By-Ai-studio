<?php
/**
 * BartaChitro (বার্তাচিত্র) - Authentication & Admin Security
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

function isLoggedIn(): bool {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true && !empty($_SESSION['admin_id']);
}

function requireAuth(): void {
    if (!isLoggedIn()) {
        $loginUrl = BASE_URL . '/admin/login.php';
        header("Location: " . $loginUrl);
        exit;
    }
}

function getAuthUser(): ?array {
    if (!isLoggedIn()) return null;
    return [
        'id' => $_SESSION['admin_id'],
        'name' => $_SESSION['admin_name'] ?? 'Admin',
        'username' => $_SESSION['admin_user'] ?? 'admin',
        'role' => $_SESSION['admin_role'] ?? 'editor',
        'email' => $_SESSION['admin_email'] ?? ''
    ];
}

<?php
/**
 * BartaChitro (বার্তাচিত্র) - AJAX Search Suggestions API
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/database.php';

$query = trim($_GET['q'] ?? '');

if (mb_strlen($query, 'UTF-8') < 2) {
    echo json_encode([]);
    exit;
}

try {
    $db = getDB();
    $stmt = $db->prepare("SELECT n.title, n.slug, c.name as category 
                          FROM news n 
                          JOIN categories c ON n.category_id = c.id 
                          WHERE n.status = 'published' AND (n.title LIKE :q OR n.summary LIKE :q) 
                          ORDER BY n.published_at DESC LIMIT 5");
    $stmt->execute([':q' => "%{$query}%"]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode([]);
}

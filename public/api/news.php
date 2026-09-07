<?php
require_once __DIR__ . '/config.php';

$db = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if (!$db) {
    sendResponse(['status' => 'ok', 'data' => [], 'source' => 'fallback']);
}

try {
    if ($method === 'GET') {
        $catId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : null;
        $isBreaking = isset($_GET['is_breaking']) ? (int)$_GET['is_breaking'] : null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;

        $sql = "SELECT n.*, c.name AS category_name, c.slug AS category_slug 
                FROM news n 
                LEFT JOIN categories c ON n.category_id = c.id 
                WHERE n.status = 'published'";

        $params = [];
        if ($catId) {
            $sql .= " AND n.category_id = :cat_id";
            $params[':cat_id'] = $catId;
        }
        if ($isBreaking !== null) {
            $sql .= " AND n.is_breaking = :is_breaking";
            $params[':is_breaking'] = $isBreaking;
        }

        $sql .= " ORDER BY n.published_at DESC LIMIT " . $limit;
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $news = $stmt->fetchAll();

        sendResponse(['status' => 'ok', 'data' => $news]);
    }
    elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['title'])) {
            sendResponse(['error' => 'Title is required'], 400);
        }

        $stmt = $db->prepare("INSERT INTO news (category_id, title, slug, summary, content, author_name, featured_image, is_featured, is_breaking, status, published_at, seo_title, seo_description, seo_keywords) 
                              VALUES (:category_id, :title, :slug, :summary, :content, :author_name, :featured_image, :is_featured, :is_breaking, :status, :published_at, :seo_title, :seo_description, :seo_keywords)");
        $stmt->execute([
            ':category_id' => (int)($input['category_id'] ?? 1),
            ':title' => $input['title'],
            ':slug' => $input['slug'] ?? substr(preg_replace('/[^a-z0-9]+/i', '-', $input['title']), 0, 50),
            ':summary' => $input['summary'] ?? '',
            ':content' => $input['content'] ?? '',
            ':author_name' => $input['author_name'] ?? 'নিজস্ব প্রতিবেদক',
            ':featured_image' => $input['featured_image'] ?? '',
            ':is_featured' => !empty($input['is_featured']) ? 1 : 0,
            ':is_breaking' => !empty($input['is_breaking']) ? 1 : 0,
            ':status' => $input['status'] ?? 'published',
            ':published_at' => $input['published_at'] ?? date('Y-m-d H:i:s'),
            ':seo_title' => $input['seo_title'] ?? $input['title'],
            ':seo_description' => $input['seo_description'] ?? ($input['summary'] ?? ''),
            ':seo_keywords' => $input['seo_keywords'] ?? ''
        ]);

        $newId = $db->lastInsertId();
        sendResponse(['status' => 'ok', 'id' => $newId, 'message' => 'Article created']);
    }
} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}

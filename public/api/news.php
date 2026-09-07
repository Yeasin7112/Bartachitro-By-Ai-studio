<?php
require_once __DIR__ . '/config.php';

$db = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if (!$db) {
    sendResponse(['status' => 'ok', 'data' => [], 'source' => 'fallback']);
}

try {
    if ($method === 'GET') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        $slug = isset($_GET['slug']) ? trim($_GET['slug']) : null;
        $catId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : null;
        $catSlug = isset($_GET['category_slug']) ? trim($_GET['category_slug']) : null;
        $isBreaking = isset($_GET['is_breaking']) ? (int)$_GET['is_breaking'] : null;
        $isFeatured = isset($_GET['is_featured']) ? (int)$_GET['is_featured'] : null;
        $search = isset($_GET['search']) ? trim($_GET['search']) : null;
        $status = isset($_GET['status']) ? trim($_GET['status']) : null;
        $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 200) : 100;

        // Fetch single article
        if ($id) {
            $stmt = $db->prepare("SELECT n.*, c.name AS category_name, c.slug AS category_slug 
                                  FROM news n 
                                  LEFT JOIN categories c ON n.category_id = c.id 
                                  WHERE n.id = :id LIMIT 1");
            $stmt->execute([':id' => $id]);
            $item = $stmt->fetch();
            if ($item) {
                // Auto-cast types
                $item['id'] = (int)$item['id'];
                $item['category_id'] = (int)$item['category_id'];
                $item['author_id'] = (int)($item['author_id'] ?? 1);
                $item['views'] = (int)$item['views'];
                $item['is_featured'] = (bool)$item['is_featured'];
                $item['is_breaking'] = (bool)$item['is_breaking'];
                sendResponse(['status' => 'ok', 'data' => $item]);
            } else {
                sendResponse(['status' => 'error', 'message' => 'Article not found'], 404);
            }
        }

        if ($slug) {
            $stmt = $db->prepare("SELECT n.*, c.name AS category_name, c.slug AS category_slug 
                                  FROM news n 
                                  LEFT JOIN categories c ON n.category_id = c.id 
                                  WHERE n.slug = :slug LIMIT 1");
            $stmt->execute([':slug' => $slug]);
            $item = $stmt->fetch();
            if ($item) {
                $item['id'] = (int)$item['id'];
                $item['category_id'] = (int)$item['category_id'];
                $item['author_id'] = (int)($item['author_id'] ?? 1);
                $item['views'] = (int)$item['views'];
                $item['is_featured'] = (bool)$item['is_featured'];
                $item['is_breaking'] = (bool)$item['is_breaking'];
                sendResponse(['status' => 'ok', 'data' => $item]);
            } else {
                sendResponse(['status' => 'error', 'message' => 'Article not found'], 404);
            }
        }

        // List articles query
        $sql = "SELECT n.*, c.name AS category_name, c.slug AS category_slug 
                FROM news n 
                LEFT JOIN categories c ON n.category_id = c.id 
                WHERE 1=1";

        $params = [];

        if ($status && $status !== 'all') {
            $sql .= " AND n.status = :status";
            $params[':status'] = $status;
        } elseif (!$status) {
            // Default to published articles
            $sql .= " AND n.status = 'published'";
        }

        if ($catId) {
            $sql .= " AND n.category_id = :cat_id";
            $params[':cat_id'] = $catId;
        }

        if ($catSlug && $catSlug !== 'home') {
            $sql .= " AND c.slug = :cat_slug";
            $params[':cat_slug'] = $catSlug;
        }

        if ($isBreaking !== null) {
            $sql .= " AND n.is_breaking = :is_breaking";
            $params[':is_breaking'] = $isBreaking;
        }

        if ($isFeatured !== null) {
            $sql .= " AND n.is_featured = :is_featured";
            $params[':is_featured'] = $isFeatured;
        }

        if ($search) {
            $sql .= " AND (n.title LIKE :search OR n.summary LIKE :search OR n.content LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }

        $sql .= " ORDER BY n.published_at DESC LIMIT " . $limit;
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rawList = $stmt->fetchAll();

        $news = array_map(function($item) {
            $item['id'] = (int)$item['id'];
            $item['category_id'] = (int)$item['category_id'];
            $item['author_id'] = (int)($item['author_id'] ?? 1);
            $item['views'] = (int)$item['views'];
            $item['is_featured'] = (bool)$item['is_featured'];
            $item['is_breaking'] = (bool)$item['is_breaking'];
            return $item;
        }, $rawList);

        sendResponse(['status' => 'ok', 'data' => $news]);
    }
    elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['title'])) {
            sendResponse(['error' => 'Title is required'], 400);
        }

        $authorId = (int)($input['author_id'] ?? $input['user_id'] ?? 1);
        $slug = !empty($input['slug']) ? $input['slug'] : ('news-' . time() . '-' . rand(100, 999));

        $stmt = $db->prepare("INSERT INTO news 
            (category_id, author_id, title, slug, summary, content, author_name, featured_image, image_caption, views, is_featured, is_breaking, status, published_at, seo_title, seo_description, seo_keywords) 
            VALUES 
            (:category_id, :author_id, :title, :slug, :summary, :content, :author_name, :featured_image, :image_caption, :views, :is_featured, :is_breaking, :status, :published_at, :seo_title, :seo_description, :seo_keywords)");
        
        $stmt->execute([
            ':category_id' => (int)($input['category_id'] ?? 1),
            ':author_id' => $authorId,
            ':title' => $input['title'],
            ':slug' => $slug,
            ':summary' => $input['summary'] ?? '',
            ':content' => $input['content'] ?? '',
            ':author_name' => $input['author_name'] ?? 'বার্তাচিত্র প্রতিবেদক',
            ':featured_image' => $input['featured_image'] ?? '',
            ':image_caption' => $input['image_caption'] ?? '',
            ':views' => (int)($input['views'] ?? 0),
            ':is_featured' => !empty($input['is_featured']) ? 1 : 0,
            ':is_breaking' => !empty($input['is_breaking']) ? 1 : 0,
            ':status' => $input['status'] ?? 'published',
            ':published_at' => !empty($input['published_at']) ? $input['published_at'] : date('Y-m-d H:i:s'),
            ':seo_title' => $input['seo_title'] ?? $input['title'],
            ':seo_description' => $input['seo_description'] ?? ($input['summary'] ?? ''),
            ':seo_keywords' => $input['seo_keywords'] ?? ''
        ]);

        $newId = (int)$db->lastInsertId();
        sendResponse([
            'status' => 'ok',
            'id' => $newId,
            'data' => array_merge($input, ['id' => $newId, 'author_id' => $authorId, 'slug' => $slug]),
            'message' => 'Article created successfully'
        ], 201);
    }
    elseif ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = isset($_GET['id']) ? (int)$_GET['id'] : (int)($input['id'] ?? 0);
        
        if (!$id) {
            sendResponse(['error' => 'Article ID is required for update'], 400);
        }

        // Special case: increment view count
        if (isset($input['action']) && $input['action'] === 'increment_view') {
            $stmt = $db->prepare("UPDATE news SET views = views + 1 WHERE id = :id");
            $stmt->execute([':id' => $id]);
            sendResponse(['status' => 'ok', 'message' => 'Views incremented']);
        }

        $authorId = (int)($input['author_id'] ?? $input['user_id'] ?? 1);

        $stmt = $db->prepare("UPDATE news SET 
            category_id = :category_id,
            author_id = :author_id,
            title = :title,
            slug = :slug,
            summary = :summary,
            content = :content,
            author_name = :author_name,
            featured_image = :featured_image,
            image_caption = :image_caption,
            is_featured = :is_featured,
            is_breaking = :is_breaking,
            status = :status,
            seo_title = :seo_title,
            seo_description = :seo_description,
            seo_keywords = :seo_keywords
            WHERE id = :id");

        $stmt->execute([
            ':category_id' => (int)($input['category_id'] ?? 1),
            ':author_id' => $authorId,
            ':title' => $input['title'] ?? '',
            ':slug' => $input['slug'] ?? ('news-' . $id),
            ':summary' => $input['summary'] ?? '',
            ':content' => $input['content'] ?? '',
            ':author_name' => $input['author_name'] ?? 'বার্তাচিত্র প্রতিবেদক',
            ':featured_image' => $input['featured_image'] ?? '',
            ':image_caption' => $input['image_caption'] ?? '',
            ':is_featured' => !empty($input['is_featured']) ? 1 : 0,
            ':is_breaking' => !empty($input['is_breaking']) ? 1 : 0,
            ':status' => $input['status'] ?? 'published',
            ':seo_title' => $input['seo_title'] ?? ($input['title'] ?? ''),
            ':seo_description' => $input['seo_description'] ?? ($input['summary'] ?? ''),
            ':seo_keywords' => $input['seo_keywords'] ?? '',
            ':id' => $id
        ]);

        sendResponse(['status' => 'ok', 'message' => 'Article updated successfully', 'data' => $input]);
    }
    elseif ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if (!$id) {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = (int)($input['id'] ?? 0);
        }

        if (!$id) {
            sendResponse(['error' => 'Article ID is required for deletion'], 400);
        }

        $stmt = $db->prepare("DELETE FROM news WHERE id = :id");
        $stmt->execute([':id' => $id]);

        sendResponse(['status' => 'ok', 'message' => 'Article deleted successfully', 'id' => $id]);
    }
} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}

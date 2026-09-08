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

        if ($id) {
            $stmt = $db->prepare("SELECT * FROM blogs WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $id]);
            $item = $stmt->fetch();
            if ($item) {
                $item['id'] = (int)$item['id'];
                $item['reading_time_min'] = (int)$item['reading_time_min'];
                $item['views'] = (int)$item['views'];
                $item['likes'] = (int)$item['likes'];
                $item['is_featured'] = (bool)$item['is_featured'];
                $item['tags'] = !empty($item['tags']) ? explode(',', $item['tags']) : [];
                sendResponse(['status' => 'ok', 'data' => $item]);
            } else {
                sendResponse(['error' => 'Blog not found'], 404);
            }
        }

        if ($slug) {
            $stmt = $db->prepare("SELECT * FROM blogs WHERE slug = :slug LIMIT 1");
            $stmt->execute([':slug' => $slug]);
            $item = $stmt->fetch();
            if ($item) {
                $item['id'] = (int)$item['id'];
                $item['reading_time_min'] = (int)$item['reading_time_min'];
                $item['views'] = (int)$item['views'];
                $item['likes'] = (int)$item['likes'];
                $item['is_featured'] = (bool)$item['is_featured'];
                $item['tags'] = !empty($item['tags']) ? explode(',', $item['tags']) : [];
                sendResponse(['status' => 'ok', 'data' => $item]);
            } else {
                sendResponse(['error' => 'Blog not found'], 404);
            }
        }

        $stmt = $db->query("SELECT * FROM blogs ORDER BY published_at DESC LIMIT 100");
        $blogs = $stmt->fetchAll();

        $blogs = array_map(function($b) {
            $b['id'] = (int)$b['id'];
            $b['reading_time_min'] = (int)$b['reading_time_min'];
            $b['views'] = (int)$b['views'];
            $b['likes'] = (int)$b['likes'];
            $b['is_featured'] = (bool)$b['is_featured'];
            $b['tags'] = !empty($b['tags']) ? explode(',', $b['tags']) : [];
            return $b;
        }, $blogs);

        sendResponse(['status' => 'ok', 'data' => $blogs]);
    }
    elseif ($method === 'POST') {
        if (!checkAdminAuth()) {
            sendResponse(['error' => 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে অ্যাডমিন হিসেবে লগইন করুন।'], 401);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['title'])) {
            sendResponse(['error' => 'Title is required'], 400);
        }

        $slug = !empty($input['slug']) ? $input['slug'] : ('blog-' . time());
        $tags = isset($input['tags']) && is_array($input['tags']) ? implode(',', $input['tags']) : ($input['tags'] ?? '');

        $stmt = $db->prepare("INSERT INTO blogs 
            (title, slug, summary, content, author_name, author_role, author_avatar, cover_image, video_url, category_tag, reading_time_min, views, likes, is_featured, status, tags, seo_title, seo_description, seo_keywords, published_at, created_at) 
            VALUES 
            (:title, :slug, :summary, :content, :author_name, :author_role, :author_avatar, :cover_image, :video_url, :category_tag, :reading_time_min, :views, :likes, :is_featured, :status, :tags, :seo_title, :seo_description, :seo_keywords, :published_at, NOW())");

        $stmt->execute([
            ':title' => $input['title'],
            ':slug' => $slug,
            ':summary' => $input['summary'] ?? '',
            ':content' => $input['content'] ?? '',
            ':author_name' => $input['author_name'] ?? 'বার্তাচিত্র কলামিস্ট',
            ':author_role' => $input['author_role'] ?? 'কলামিস্ট ও বিশ্লেষক',
            ':author_avatar' => $input['author_avatar'] ?? '',
            ':cover_image' => $input['cover_image'] ?? '',
            ':video_url' => $input['video_url'] ?? '',
            ':category_tag' => $input['category_tag'] ?? 'মতামত',
            ':reading_time_min' => (int)($input['reading_time_min'] ?? 4),
            ':views' => (int)($input['views'] ?? 0),
            ':likes' => (int)($input['likes'] ?? 0),
            ':is_featured' => !empty($input['is_featured']) ? 1 : 0,
            ':status' => $input['status'] ?? 'published',
            ':tags' => $tags,
            ':seo_title' => $input['seo_title'] ?? $input['title'],
            ':seo_description' => $input['seo_description'] ?? ($input['summary'] ?? ''),
            ':seo_keywords' => $input['seo_keywords'] ?? '',
            ':published_at' => !empty($input['published_at']) ? $input['published_at'] : date('Y-m-d H:i:s')
        ]);

        $newId = (int)$db->lastInsertId();
        sendResponse([
            'status' => 'ok',
            'id' => $newId,
            'data' => array_merge($input, ['id' => $newId, 'slug' => $slug]),
            'message' => 'Blog created successfully'
        ], 201);
    }
    elseif ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = isset($_GET['id']) ? (int)$_GET['id'] : (int)($input['id'] ?? 0);

        if (!$id) {
            sendResponse(['error' => 'Blog ID is required'], 400);
        }

        // Special: Like blog (public)
        if (isset($input['action']) && $input['action'] === 'like') {
            $stmt = $db->prepare("UPDATE blogs SET likes = likes + 1 WHERE id = :id");
            $stmt->execute([':id' => $id]);
            sendResponse(['status' => 'ok', 'message' => 'Blog liked']);
        }

        // Special: Increment views (public)
        if (isset($input['action']) && $input['action'] === 'view') {
            $stmt = $db->prepare("UPDATE blogs SET views = views + 1 WHERE id = :id");
            $stmt->execute([':id' => $id]);
            sendResponse(['status' => 'ok', 'message' => 'Blog view counted']);
        }

        if (!checkAdminAuth()) {
            sendResponse(['error' => 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে অ্যাডমিন হিসেবে লগইন করুন।'], 401);
        }

        $tags = isset($input['tags']) && is_array($input['tags']) ? implode(',', $input['tags']) : ($input['tags'] ?? '');

        $stmt = $db->prepare("UPDATE blogs SET 
            title = :title, 
            slug = :slug, 
            summary = :summary, 
            content = :content, 
            author_name = :author_name, 
            author_role = :author_role, 
            author_avatar = :author_avatar, 
            cover_image = :cover_image, 
            video_url = :video_url, 
            category_tag = :category_tag, 
            reading_time_min = :reading_time_min, 
            is_featured = :is_featured, 
            status = :status, 
            tags = :tags, 
            seo_title = :seo_title, 
            seo_description = :seo_description, 
            seo_keywords = :seo_keywords 
            WHERE id = :id");

        $stmt->execute([
            ':title' => $input['title'] ?? '',
            ':slug' => $input['slug'] ?? ('blog-' . $id),
            ':summary' => $input['summary'] ?? '',
            ':content' => $input['content'] ?? '',
            ':author_name' => $input['author_name'] ?? 'বার্তাচিত্র কলামিস্ট',
            ':author_role' => $input['author_role'] ?? 'কলামিস্ট ও বিশ্লেষক',
            ':author_avatar' => $input['author_avatar'] ?? '',
            ':cover_image' => $input['cover_image'] ?? '',
            ':video_url' => $input['video_url'] ?? '',
            ':category_tag' => $input['category_tag'] ?? 'মতামত',
            ':reading_time_min' => (int)($input['reading_time_min'] ?? 4),
            ':is_featured' => !empty($input['is_featured']) ? 1 : 0,
            ':status' => $input['status'] ?? 'published',
            ':tags' => $tags,
            ':seo_title' => $input['seo_title'] ?? ($input['title'] ?? ''),
            ':seo_description' => $input['seo_description'] ?? ($input['summary'] ?? ''),
            ':seo_keywords' => $input['seo_keywords'] ?? '',
            ':id' => $id
        ]);

        sendResponse(['status' => 'ok', 'message' => 'Blog updated successfully', 'data' => $input]);
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
            sendResponse(['error' => 'Blog ID is required'], 400);
        }

        $stmt = $db->prepare("DELETE FROM blogs WHERE id = :id");
        $stmt->execute([':id' => $id]);

        sendResponse(['status' => 'ok', 'message' => 'Blog deleted successfully', 'id' => $id]);
    }
} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}

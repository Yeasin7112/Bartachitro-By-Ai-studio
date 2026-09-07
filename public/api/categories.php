<?php
require_once __DIR__ . '/config.php';

$db = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if (!$db) {
    sendResponse(['status' => 'ok', 'data' => [], 'source' => 'fallback']);
}

try {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM categories WHERE status = 'active' ORDER BY display_order ASC, id ASC");
        $categories = $stmt->fetchAll();

        // Typecast
        $categories = array_map(function($cat) {
            $cat['id'] = (int)$cat['id'];
            $cat['display_order'] = (int)$cat['display_order'];
            return $cat;
        }, $categories);

        sendResponse(['status' => 'ok', 'data' => $categories]);
    }
    elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['name'])) {
            sendResponse(['error' => 'Category name is required'], 400);
        }

        $slug = !empty($input['slug']) ? $input['slug'] : ('cat-' . time());
        $displayOrder = (int)($input['display_order'] ?? 99);
        $nameEn = $input['name_en'] ?? '';

        $stmt = $db->prepare("INSERT INTO categories (name, slug, name_en, display_order, status, created_at) 
                              VALUES (:name, :slug, :name_en, :display_order, 'active', NOW())");
        $stmt->execute([
            ':name' => $input['name'],
            ':slug' => $slug,
            ':name_en' => $nameEn,
            ':display_order' => $displayOrder
        ]);

        $newId = (int)$db->lastInsertId();
        sendResponse([
            'status' => 'ok',
            'id' => $newId,
            'data' => [
                'id' => $newId,
                'name' => $input['name'],
                'slug' => $slug,
                'name_en' => $nameEn,
                'display_order' => $displayOrder,
                'status' => 'active'
            ],
            'message' => 'Category created successfully'
        ], 201);
    }
    elseif ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = isset($_GET['id']) ? (int)$_GET['id'] : (int)($input['id'] ?? 0);

        if (!$id) {
            sendResponse(['error' => 'Category ID is required'], 400);
        }

        $stmt = $db->prepare("UPDATE categories SET 
            name = :name, 
            slug = :slug, 
            name_en = :name_en, 
            display_order = :display_order 
            WHERE id = :id");

        $stmt->execute([
            ':name' => $input['name'] ?? '',
            ':slug' => $input['slug'] ?? '',
            ':name_en' => $input['name_en'] ?? '',
            ':display_order' => (int)($input['display_order'] ?? 0),
            ':id' => $id
        ]);

        sendResponse(['status' => 'ok', 'message' => 'Category updated successfully', 'data' => $input]);
    }
    elseif ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if (!$id) {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = (int)($input['id'] ?? 0);
        }

        if (!$id) {
            sendResponse(['error' => 'Category ID is required'], 400);
        }

        $stmt = $db->prepare("DELETE FROM categories WHERE id = :id");
        $stmt->execute([':id' => $id]);

        sendResponse(['status' => 'ok', 'message' => 'Category deleted successfully', 'id' => $id]);
    }
} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}

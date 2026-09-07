<?php
require_once __DIR__ . '/config.php';

$db = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if (!$db) {
    sendResponse(['status' => 'ok', 'data' => null, 'source' => 'fallback']);
}

try {
    if ($method === 'GET') {
        $date = isset($_GET['date']) ? trim($_GET['date']) : null;
        
        $sql = "SELECT * FROM epapers WHERE status = 'published'";
        $params = [];
        if ($date) {
            $sql .= " AND edition_date = :date";
            $params[':date'] = $date;
        }
        $sql .= " ORDER BY edition_date DESC LIMIT 1";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $epaper = $stmt->fetch();

        if ($epaper) {
            $epaperId = (int)$epaper['id'];
            $pStmt = $db->prepare("SELECT * FROM epaper_pages WHERE epaper_id = :eid ORDER BY page_number ASC");
            $pStmt->execute([':eid' => $epaperId]);
            $pages = $pStmt->fetchAll();

            $pages = array_map(function($p) {
                return [
                    'id' => (int)$p['id'],
                    'page_number' => (int)$p['page_number'],
                    'page_title' => $p['page_title'],
                    'image_url' => $p['image_url']
                ];
            }, $pages);

            $result = [
                'id' => $epaperId,
                'title' => $epaper['title'],
                'edition_date' => $epaper['edition_date'],
                'total_pages' => (int)$epaper['total_pages'],
                'cover_image' => $epaper['cover_image'],
                'pages' => $pages
            ];

            sendResponse(['status' => 'ok', 'data' => $result]);
        } else {
            sendResponse(['status' => 'ok', 'data' => null]);
        }
    }
    elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            sendResponse(['error' => 'Invalid data'], 400);
        }

        $title = $input['title'] ?? 'দৈনিক বার্তাচিত্র';
        $editionDate = $input['edition_date'] ?? date('Y-m-d');
        $pages = $input['pages'] ?? [];
        $totalPages = count($pages) > 0 ? count($pages) : (int)($input['total_pages'] ?? 1);
        $coverImage = $input['cover_image'] ?? ($pages[0]['image_url'] ?? '');

        // Insert or update epaper by edition_date
        $stmt = $db->prepare("INSERT INTO epapers (title, edition_date, cover_image, total_pages, status, created_at) 
                              VALUES (:title, :edition_date, :cover_image, :total_pages, 'published', NOW())
                              ON DUPLICATE KEY UPDATE title = :title2, cover_image = :cover2, total_pages = :total2");
        $stmt->execute([
            ':title' => $title,
            ':edition_date' => $editionDate,
            ':cover_image' => $coverImage,
            ':total_pages' => $totalPages,
            ':title2' => $title,
            ':cover2' => $coverImage,
            ':total2' => $totalPages
        ]);

        // Get epaper ID
        $eStmt = $db->prepare("SELECT id FROM epapers WHERE edition_date = :ed LIMIT 1");
        $eStmt->execute([':ed' => $editionDate]);
        $eRow = $eStmt->fetch();
        $epaperId = $eRow ? (int)$eRow['id'] : (int)$db->lastInsertId();

        if (!empty($pages)) {
            // Remove previous pages for this edition and insert fresh
            $dStmt = $db->prepare("DELETE FROM epaper_pages WHERE epaper_id = :eid");
            $dStmt->execute([':eid' => $epaperId]);

            $pInsert = $db->prepare("INSERT INTO epaper_pages (epaper_id, page_number, page_title, image_url, created_at) 
                                     VALUES (:eid, :pnum, :ptitle, :purl, NOW())");
            foreach ($pages as $index => $p) {
                $pInsert->execute([
                    ':eid' => $epaperId,
                    ':pnum' => (int)($p['page_number'] ?? ($index + 1)),
                    ':ptitle' => $p['page_title'] ?? ('পৃষ্ঠা ' . ($index + 1)),
                    ':purl' => $p['image_url'] ?? ''
                ]);
            }
        }

        sendResponse(['status' => 'ok', 'message' => 'E-paper updated successfully', 'id' => $epaperId]);
    }
} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}

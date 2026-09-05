<?php
/**
 * BartaChitro (বার্তাচিত্র) - Increment View API
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../includes/functions.php';

$newsId = isset($_POST['id']) ? (int)$_POST['id'] : 0;

if ($newsId > 0) {
    recordNewsView($newsId);
    echo json_encode(['status' => 'success', 'news_id' => $newsId]);
} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid ID']);
}

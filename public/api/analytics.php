<?php
/**
 * BartaChitro (বার্তাচিত্র) - Real-Time Analytics & Traffic Counting API
 * Handles real-time pageviews, article hits, blog reads, device breakdown and historical daily metrics.
 */

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDb();

// Ensure analytics tables exist in database
try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS `daily_traffic` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `view_date` DATE NOT NULL UNIQUE,
            `total_views` INT NOT NULL DEFAULT 0,
            `news_views` INT NOT NULL DEFAULT 0,
            `blog_views` INT NOT NULL DEFAULT 0,
            `page_views` INT NOT NULL DEFAULT 0,
            `unique_visitors` INT NOT NULL DEFAULT 0,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX (`view_date`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS `view_logs` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `content_type` ENUM('news', 'blog', 'page') NOT NULL DEFAULT 'news',
            `content_id` INT NULL,
            `content_title` VARCHAR(255) NULL,
            `category_id` INT NULL,
            `category_name` VARCHAR(100) NULL,
            `ip_hash` VARCHAR(64) NULL,
            `user_agent` VARCHAR(255) NULL,
            `device_type` VARCHAR(30) DEFAULT 'desktop',
            `view_date` DATE NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (`view_date`),
            INDEX (`content_type`, `content_id`),
            INDEX (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
} catch (Exception $e) {
    // Non-fatal if user has limited DDL privileges
}

// ----------------------------------------------------
// GET: Fetch Real Analytics Metrics & Chart Points
// ----------------------------------------------------
if ($method === 'GET') {
    $range = $_GET['range'] ?? 'weekly'; // today, weekly, monthly, all
    $today = date('Y-m-d');

    // 1. All-time views from news and blogs tables
    $newsViewsStmt = $db->query("SELECT COALESCE(SUM(views), 0) as total, COUNT(*) as count FROM news");
    $newsData = $newsViewsStmt->fetch() ?: ['total' => 0, 'count' => 0];
    $totalNewsViews = (int)$newsData['total'];
    $totalNewsCount = (int)$newsData['count'];

    $blogViewsStmt = $db->query("SELECT COALESCE(SUM(views), 0) as total, COUNT(*) as count FROM blogs");
    $blogData = $blogViewsStmt->fetch() ?: ['total' => 0, 'count' => 0];
    $totalBlogViews = (int)$blogData['total'];
    $totalBlogCount = (int)$blogData['count'];

    $grandTotalViews = $totalNewsViews + $totalBlogViews;

    // 2. Today's actual views and unique visitors
    $todayStmt = $db->prepare("SELECT * FROM daily_traffic WHERE view_date = :today");
    $todayStmt->execute([':today' => $today]);
    $todayRow = $todayStmt->fetch();

    $todayViews = $todayRow ? (int)$todayRow['total_views'] : 0;
    $todayNewsViews = $todayRow ? (int)$todayRow['news_views'] : 0;
    $todayBlogViews = $todayRow ? (int)$todayRow['blog_views'] : 0;
    $todayUnique = $todayRow ? (int)$todayRow['unique_visitors'] : 0;

    // 3. Weekly views (last 7 days actual sum)
    $weeklyStmt = $db->prepare("SELECT COALESCE(SUM(total_views), 0) as total FROM daily_traffic WHERE view_date >= DATE_SUB(:today, INTERVAL 6 DAY)");
    $weeklyStmt->execute([':today' => $today]);
    $weeklyTotal = (int)($weeklyStmt->fetch()['total'] ?? 0);

    // 4. Monthly views (last 30 days actual sum)
    $monthlyStmt = $db->prepare("SELECT COALESCE(SUM(total_views), 0) as total FROM daily_traffic WHERE view_date >= DATE_SUB(:today, INTERVAL 29 DAY)");
    $monthlyStmt->execute([':today' => $today]);
    $monthlyTotal = (int)($monthlyStmt->fetch()['total'] ?? 0);

    // If daily_traffic was just started and total views exist on news, fallback gracefully without fake simulation
    if ($weeklyTotal === 0 && $grandTotalViews > 0) {
        $weeklyTotal = $todayViews;
    }
    if ($monthlyTotal === 0 && $grandTotalViews > 0) {
        $monthlyTotal = $weeklyTotal;
    }

    // 5. Chart points: Real daily breakdown
    $daysCount = 7;
    if ($range === 'today') $daysCount = 1;
    elseif ($range === 'monthly') $daysCount = 14;
    elseif ($range === 'all') $daysCount = 30;

    $chartPoints = [];
    $bengaliDays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

    for ($i = $daysCount - 1; $i >= 0; $i--) {
        $dateStr = date('Y-m-d', strtotime("-{$i} days"));
        $timestamp = strtotime($dateStr);
        $dayOfWeek = (int)date('w', $timestamp);
        $dayNum = date('j', $timestamp);
        $dayName = $bengaliDays[$dayOfWeek];

        $stmt = $db->prepare("SELECT total_views, news_views, blog_views FROM daily_traffic WHERE view_date = :date");
        $stmt->execute([':date' => $dateStr]);
        $row = $stmt->fetch();

        $pointViews = $row ? (int)$row['total_views'] : 0;

        $chartPoints[] = [
            'date' => $dateStr,
            'day' => "{$dayName} ({$dayNum})",
            'views' => $pointViews,
            'news_views' => $row ? (int)$row['news_views'] : 0,
            'blog_views' => $row ? (int)$row['blog_views'] : 0
        ];
    }

    // 6. Recent 8 live views (Real-time activity feed)
    $recentStmt = $db->query("
        SELECT id, content_type, content_id, content_title, category_name, device_type, created_at 
        FROM view_logs 
        ORDER BY id DESC 
        LIMIT 8
    ");
    $recentViews = $recentStmt ? $recentStmt->fetchAll() : [];

    // 7. Device breakdown (Real counts from logs)
    $deviceStmt = $db->query("
        SELECT device_type, COUNT(*) as count 
        FROM view_logs 
        WHERE view_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
        GROUP BY device_type
    ");
    $deviceRows = $deviceStmt ? $deviceStmt->fetchAll() : [];
    $deviceStats = ['desktop' => 0, 'mobile' => 0, 'tablet' => 0];
    foreach ($deviceRows as $row) {
        $dtype = strtolower($row['device_type'] ?? 'desktop');
        if (isset($deviceStats[$dtype])) {
            $deviceStats[$dtype] = (int)$row['count'];
        }
    }

    sendResponse([
        'status' => 'ok',
        'metrics' => [
            'grand_total_views' => $grandTotalViews,
            'total_news_views' => $totalNewsViews,
            'total_blog_views' => $totalBlogViews,
            'today_views' => $todayViews,
            'today_news_views' => $todayNewsViews,
            'today_blog_views' => $todayBlogViews,
            'today_unique' => $todayUnique,
            'weekly_views' => $weeklyTotal,
            'monthly_views' => $monthlyTotal,
            'total_news_count' => $totalNewsCount,
            'total_blog_count' => $totalBlogCount
        ],
        'chart_data' => $chartPoints,
        'recent_views' => $recentViews,
        'device_stats' => $deviceStats,
        'server_time' => date('Y-m-d H:i:s')
    ]);
}

// ----------------------------------------------------
// POST: Record Real View Hit or Reset Counters
// ----------------------------------------------------
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true) ?: $_POST;

    $action = $input['action'] ?? 'record';

    // A. Reset All Demo Counters to 0 (Admin Protected)
    if ($action === 'reset_views') {
        if (!checkAdminAuth()) {
            sendResponse(['error' => 'অননুমোদিত অ্যাক্সেস। কাউন্টার রিসেট করতে অ্যাডমিন লগইন প্রয়োজন।'], 401);
        }

        $db->exec("UPDATE news SET views = 0");
        $db->exec("UPDATE blogs SET views = 0");
        $db->exec("DELETE FROM daily_traffic");
        $db->exec("DELETE FROM view_logs");

        sendResponse([
            'status' => 'ok',
            'message' => 'সকল ডেমো ভিউ কাউন্টার সফলভাবে রিসেট করা হয়েছে। এখন থেকে সম্পূর্ণ রিয়েল-টাইম ভিউ গণনা হবে।'
        ]);
    }

    // B. Record a Real View Hit
    $contentType = in_array($input['type'] ?? '', ['news', 'blog', 'page']) ? $input['type'] : 'news';
    $contentId = isset($input['id']) ? (int)$input['id'] : null;
    $contentTitle = trim($input['title'] ?? '');
    $categoryId = isset($input['category_id']) ? (int)$input['category_id'] : null;
    $categoryName = trim($input['category_name'] ?? '');

    $today = date('Y-m-d');
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $ipHash = hash('sha256', $ip . '-' . $today);
    $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 250);

    // Detect device type
    $deviceType = 'desktop';
    if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i', $userAgent)) {
        $deviceType = 'tablet';
    } elseif (preg_match('/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|NetFront|Silk-Accelerated/i', $userAgent)) {
        $deviceType = 'mobile';
    }

    // 1. Increment in content table
    if ($contentType === 'news' && $contentId > 0) {
        $stmt = $db->prepare("UPDATE news SET views = views + 1 WHERE id = :id");
        $stmt->execute([':id' => $contentId]);

        // If title not passed, fetch it
        if (empty($contentTitle)) {
            $tStmt = $db->prepare("SELECT title, category_id, (SELECT name FROM categories WHERE id = news.category_id) as cname FROM news WHERE id = :id");
            $tStmt->execute([':id' => $contentId]);
            if ($row = $tStmt->fetch()) {
                $contentTitle = $row['title'];
                $categoryId = (int)$row['category_id'];
                $categoryName = $row['cname'] ?? '';
            }
        }
    } elseif ($contentType === 'blog' && $contentId > 0) {
        $stmt = $db->prepare("UPDATE blogs SET views = views + 1 WHERE id = :id");
        $stmt->execute([':id' => $contentId]);

        if (empty($contentTitle)) {
            $tStmt = $db->prepare("SELECT title, category_tag FROM blogs WHERE id = :id");
            $tStmt->execute([':id' => $contentId]);
            if ($row = $tStmt->fetch()) {
                $contentTitle = $row['title'];
                $categoryName = $row['category_tag'] ?? 'মতামত';
            }
        }
    }

    // 2. Insert into view_logs
    try {
        $logStmt = $db->prepare("
            INSERT INTO view_logs 
            (content_type, content_id, content_title, category_id, category_name, ip_hash, user_agent, device_type, view_date, created_at)
            VALUES 
            (:content_type, :content_id, :content_title, :category_id, :category_name, :ip_hash, :user_agent, :device_type, :view_date, NOW())
        ");
        $logStmt->execute([
            ':content_type' => $contentType,
            ':content_id' => $contentId,
            ':content_title' => $contentTitle ?: 'পোর্টাল ভিজিট',
            ':category_id' => $categoryId,
            ':category_name' => $categoryName ?: 'সাধারণ',
            ':ip_hash' => $ipHash,
            ':user_agent' => $userAgent,
            ':device_type' => $deviceType,
            ':view_date' => $today
        ]);
    } catch (Exception $e) {
        // Continue even if logging fails
    }

    // 3. Upsert into daily_traffic
    try {
        $isUnique = false;
        $uniqueCheck = $db->prepare("SELECT COUNT(*) as count FROM view_logs WHERE view_date = :today AND ip_hash = :ip_hash");
        $uniqueCheck->execute([':today' => $today, ':ip_hash' => $ipHash]);
        $uniqueCount = (int)($uniqueCheck->fetch()['count'] ?? 1);
        if ($uniqueCount <= 1) {
            $isUnique = true;
        }

        $newsInc = ($contentType === 'news') ? 1 : 0;
        $blogInc = ($contentType === 'blog') ? 1 : 0;
        $pageInc = ($contentType === 'page') ? 1 : 0;
        $uniqueInc = $isUnique ? 1 : 0;

        $upsertStmt = $db->prepare("
            INSERT INTO daily_traffic (view_date, total_views, news_views, blog_views, page_views, unique_visitors)
            VALUES (:today, 1, :news_inc, :blog_inc, :page_inc, :unique_inc)
            ON DUPLICATE KEY UPDATE 
                total_views = total_views + 1,
                news_views = news_views + :news_inc2,
                blog_views = blog_views + :blog_inc2,
                page_views = page_views + :page_inc2,
                unique_visitors = unique_visitors + :unique_inc2
        ");
        $upsertStmt->execute([
            ':today' => $today,
            ':news_inc' => $newsInc,
            ':blog_inc' => $blogInc,
            ':page_inc' => $pageInc,
            ':unique_inc' => $uniqueInc,
            ':news_inc2' => $newsInc,
            ':blog_inc2' => $blogInc,
            ':page_inc2' => $pageInc,
            ':unique_inc2' => $uniqueInc
        ]);
    } catch (Exception $e) {
        // Non-fatal
    }

    sendResponse([
        'status' => 'ok',
        'message' => 'View counted successfully',
        'content_type' => $contentType,
        'content_id' => $contentId
    ]);
}

sendResponse(['error' => 'Method not allowed'], 405);

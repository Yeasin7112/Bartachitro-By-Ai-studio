<?php
/**
 * BartaChitro (বার্তাচিত্র) - Core Helper Functions
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Convert English digits to Bengali digits
 */
function bnNum($number): string {
    $en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    $bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str_replace($en, $bn, (string)$number);
}

/**
 * Convert Bengali digits to English digits
 */
function enNum($number): string {
    $bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    $en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return str_replace($bn, $en, (string)$number);
}

/**
 * Format datetime to Bengali string
 */
function bnDate($datetime, $showTime = true): string {
    if (empty($datetime)) return '';
    $timestamp = is_numeric($datetime) ? $datetime : strtotime($datetime);

    $monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    $monthsBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

    $daysEn = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    $daysBn = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'];

    $dayName = $daysBn[array_search(date('l', $timestamp), $daysEn)];
    $dayNum  = bnNum(date('j', $timestamp));
    $month   = $monthsBn[array_search(date('F', $timestamp), $monthsEn)];
    $year    = bnNum(date('Y', $timestamp));

    $dateStr = "{$dayNum} {$month} {$year}";
    if ($showTime) {
        $hour = (int)date('g', $timestamp);
        $minute = date('i', $timestamp);
        $ampm = date('A', $timestamp);
        $period = ($ampm === 'AM') ? ($hour < 6 ? 'রাত' : ($hour < 12 ? 'সকাল' : 'দুপুর')) : ($hour < 4 ? 'দুপুর' : ($hour < 7 ? 'বিকাল' : 'রাত'));
        $timeStr = "{$period} " . bnNum($hour) . ":" . bnNum($minute);
        return "{$dateStr}, {$timeStr}";
    }

    return "{$dayName}, {$dateStr}";
}

/**
 * Relative time in Bengali (যেমন: ২ ঘণ্টা আগে, ১০ মিনিট আগে)
 */
function timeAgoBn($datetime): string {
    if (empty($datetime)) return '';
    $timestamp = is_numeric($datetime) ? $datetime : strtotime($datetime);
    $diff = time() - $timestamp;

    if ($diff < 60) {
        return 'এইমাত্র';
    } elseif ($diff < 3600) {
        $mins = floor($diff / 60);
        return bnNum($mins) . ' মিনিট আগে';
    } elseif ($diff < 86400) {
        $hours = floor($diff / 3600);
        return bnNum($hours) . ' ঘণ্টা আগে';
    } elseif ($diff < 604800) {
        $days = floor($diff / 86400);
        return bnNum($days) . ' দিন আগে';
    } else {
        return bnDate($datetime, false);
    }
}

/**
 * Generate a clean URL slug from title
 */
function makeSlug(string $text): string {
    $text = trim($text);
    $text = preg_replace('/[^\p{L}\p{N}\s\-_]+/u', '', $text);
    $text = preg_replace('/[\s\-_]+/u', '-', $text);
    return strtolower(trim($text, '-')) ?: 'news-' . time();
}

/**
 * Word limiter
 */
function limitWords(string $text, int $limit = 25): string {
    $text = strip_tags($text);
    $words = preg_split('/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY);
    if (count($words) > $limit) {
        return implode(' ', array_slice($words, 0, $limit)) . '...';
    }
    return $text;
}

/**
 * Fetch a site setting
 */
function getSetting(string $key, string $default = ''): string {
    static $settingsCache = null;
    if ($settingsCache === null) {
        try {
            $db = getDB();
            $stmt = $db->query("SELECT `key_name`, `key_value` FROM `settings`");
            $settingsCache = $stmt->fetchAll(PDO::FETCH_KEY_PAIR) ?: [];
        } catch (Exception $e) {
            $settingsCache = [];
        }
    }
    return $settingsCache[$key] ?? $default;
}

/**
 * Fetch all active categories
 */
function getCategories(): array {
    static $cats = null;
    if ($cats === null) {
        try {
            $db = getDB();
            $stmt = $db->query("SELECT * FROM `categories` WHERE `status` = 'active' ORDER BY `display_order` ASC");
            $cats = $stmt->fetchAll();
        } catch (Exception $e) {
            $cats = [];
        }
    }
    return $cats;
}

/**
 * Fetch breaking news items
 */
function getBreakingNews(int $limit = 5): array {
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT id, title, slug, published_at FROM news WHERE status = 'published' AND is_breaking = 1 ORDER BY published_at DESC LIMIT :limit");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    } catch (Exception $e) {
        return [];
    }
}

/**
 * Record a unique view for an article in the current session
 */
function recordNewsView(int $newsId): void {
    if (!isset($_SESSION['viewed_news'])) {
        $_SESSION['viewed_news'] = [];
    }

    if (!in_array($newsId, $_SESSION['viewed_news'])) {
        $_SESSION['viewed_news'][] = $newsId;
        try {
            $db = getDB();
            $stmt = $db->prepare("UPDATE news SET views = views + 1 WHERE id = :id");
            $stmt->execute([':id' => $newsId]);

            // Optional log
            $ipHash = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
            $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 250);
            $logStmt = $db->prepare("INSERT INTO news_views (news_id, ip_hash, user_agent) VALUES (:news_id, :ip_hash, :ua)");
            $logStmt->execute([':news_id' => $newsId, ':ip_hash' => $ipHash, ':ua' => $ua]);
        } catch (Exception $e) {
            // Silently fail view increment
        }
    }
}

/**
 * Render Ad by Position
 */
function renderAd(string $position): string {
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM ads WHERE position = :pos AND status = 'active' AND (start_date IS NULL OR start_date <= CURDATE()) AND (end_date IS NULL OR end_date >= CURDATE()) ORDER BY RAND() LIMIT 1");
        $stmt->execute([':pos' => $position]);
        $ad = $stmt->fetch();
        if ($ad) {
            $target = htmlspecialchars($ad['target_url']);
            $img = htmlspecialchars($ad['image_url']);
            $title = htmlspecialchars($ad['title']);
            return "<div class='ad-block ad-{$position} my-4 text-center'>
                <a href='{$target}' target='_blank' rel='noopener nofollow' title='{$title}' class='inline-block overflow-hidden rounded shadow-sm hover:opacity-95 transition-opacity'>
                    <img src='{$img}' alt='{$title}' class='max-w-full h-auto mx-auto' loading='lazy'>
                </a>
            </div>";
        }
    } catch (Exception $e) {}
    return '';
}

/**
 * CSRF Protection Helpers
 */
function csrfField(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars($_SESSION['csrf_token']) . '">';
}

function verifyCsrfToken(): bool {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $token = $_POST['csrf_token'] ?? '';
        return !empty($token) && hash_equals($_SESSION['csrf_token'] ?? '', $token);
    }
    return true;
}

/**
 * Sanitize output
 */
function e(?string $string): string {
    return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
}

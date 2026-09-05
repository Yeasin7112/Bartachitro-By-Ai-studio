<?php
/**
 * BartaChitro (বার্তাচিত্র) - E-Paper Digital Viewer
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';

$db = getDB();

$date = $_GET['date'] ?? '';
$pageNum = isset($_GET['page']) ? (int)$_GET['page'] : 1;

if (!empty($date)) {
    $stmt = $db->prepare("SELECT * FROM epapers WHERE edition_date = :date AND status = 'published' LIMIT 1");
    $stmt->execute([':date' => $date]);
} else {
    $stmt = $db->prepare("SELECT * FROM epapers WHERE status = 'published' ORDER BY edition_date DESC LIMIT 1");
    $stmt->execute();
}
$epaper = $stmt->fetch();

$pages = [];
$currentPageData = null;

if ($epaper) {
    $pStmt = $db->prepare("SELECT * FROM epaper_pages WHERE epaper_id = :eid ORDER BY page_number ASC");
    $pStmt->execute([':eid' => $epaper['id']]);
    $pages = $pStmt->fetchAll();

    $totalPages = count($pages);
    $pageNum = max(1, min($pageNum, max(1, $totalPages)));

    foreach ($pages as $p) {
        if ((int)$p['page_number'] === $pageNum) {
            $currentPageData = $p;
            break;
        }
    }
}

$customTitle = $epaper ? "ই-পত্রিকা · " . bnDate($epaper['edition_date'], false) : "ই-পত্রিকা";
include __DIR__ . '/includes/header.php';
?>

<div class="container" style="margin-top:10px;margin-bottom:60px;">
    <?php if ($epaper && $currentPageData): ?>
    <div class="epaper-container">
        <!-- Top Toolbar -->
        <div class="epaper-toolbar">
            <div class="epaper-info-badge">
                <i class="fa-solid fa-newspaper text-red"></i> 
                ই-পত্রিকা · <?= bnDate($epaper['edition_date'], false) ?>
                <span style="font-size:13px;color:#a1a1aa;font-weight:400;margin-left:8px;">(<?= e($currentPageData['page_title'] ?: 'পৃষ্ঠা ' . bnNum($pageNum)) ?>)</span>
            </div>

            <div class="epaper-page-controls">
                <!-- Previous Button -->
                <?php if ($pageNum > 1): ?>
                    <a href="?date=<?= urlencode($epaper['edition_date']) ?>&page=<?= $pageNum - 1 ?>" class="epaper-btn">
                        <i class="fa-solid fa-chevron-left"></i> পূর্ববর্তী
                    </a>
                <?php else: ?>
                    <button class="epaper-btn" disabled style="opacity:0.4;cursor:not-allowed;">
                        <i class="fa-solid fa-chevron-left"></i> পূর্ববর্তী
                    </button>
                <?php endif; ?>

                <span style="font-size:14px;font-weight:700;color:#ffffff;padding:0 8px;">
                    পৃষ্ঠা <?= bnNum($pageNum) ?> / <?= bnNum($epaper['total_pages']) ?>
                </span>

                <!-- Next Button -->
                <?php if ($pageNum < $epaper['total_pages']): ?>
                    <a href="?date=<?= urlencode($epaper['edition_date']) ?>&page=<?= $pageNum + 1 ?>" class="epaper-btn">
                        পরবর্তী <i class="fa-solid fa-chevron-right"></i>
                    </a>
                <?php else: ?>
                    <button class="epaper-btn" disabled style="opacity:0.4;cursor:not-allowed;">
                        পরবর্তী <i class="fa-solid fa-chevron-right"></i>
                    </button>
                <?php endif; ?>

                <!-- Zoom Controls -->
                <button type="button" class="epaper-btn" id="epaperZoomIn" title="বড় করুন">
                    <i class="fa-solid fa-magnifying-glass-plus"></i>
                </button>
                <button type="button" class="epaper-btn" id="epaperZoomOut" title="ছোট করুন">
                    <i class="fa-solid fa-magnifying-glass-minus"></i>
                </button>
                <button type="button" class="epaper-btn" id="epaperFullscreen" title="ফুলস্ক্রিন">
                    <i class="fa-solid fa-expand"></i>
                </button>
            </div>
        </div>

        <!-- Newspaper Viewer Stage -->
        <div class="epaper-stage-wrap" id="epaperStageWrap">
            <img src="<?= e($currentPageData['image_url']) ?>" alt="বার্তাচিত্র ই-পত্রিকা পৃষ্ঠা <?= $pageNum ?>" id="epaperImage" class="epaper-sheet-img">
        </div>

        <!-- Thumbnails Strip -->
        <div style="display:flex;gap:12px;overflow-x:auto;padding:16px 4px 4px;margin-top:10px;justify-content:center;">
            <?php foreach ($pages as $pg): ?>
                <a href="?date=<?= urlencode($epaper['edition_date']) ?>&page=<?= $pg['page_number'] ?>" style="border:2px solid <?= ($pg['page_number'] == $pageNum) ? '#b91c1c' : '#3f3f46' ?>;border-radius:6px;overflow:hidden;width:80px;height:105px;flex-shrink:0;transition:border-color 0.2s;">
                    <img src="<?= e($pg['image_url']) ?>" alt="পৃষ্ঠা <?= $pg['page_number'] ?>" style="width:100%;height:100%;object-fit:cover;">
                </a>
            <?php endforeach; ?>
        </div>
    </div>
    <?php else: ?>
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:50px;text-align:center;">
            <i class="fa-solid fa-newspaper" style="font-size:48px;color:#9ca3af;margin-bottom:14px;"></i>
            <h2 style="font-size:22px;color:#111827;margin-bottom:8px;">কোনো ই-পত্রিকা সংস্করণ পাওয়া যায়নি</h2>
            <p style="color:#6b7280;margin-bottom:20px;">আজকের ই-পত্রিকা সংস্করণ প্রকাশের প্রক্রিয়াধীন রয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।</p>
            <a href="<?= BASE_URL ?>/" class="admin-badge-btn" style="padding:10px 20px;">প্রচ্ছদে ফিরুন</a>
        </div>
    <?php endif; ?>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>

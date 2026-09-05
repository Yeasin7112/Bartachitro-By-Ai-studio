<?php
/**
 * BartaChitro (বার্তাচিত্র) - E-Paper Management
 */

$adminTitle = "ই-পত্রিকা সংস্করণ ও পাতা ব্যবস্থাপনা";
require_once __DIR__ . '/header.php';

$db = getDB();
$message = '';
$error = '';

// Handle Delete Edition
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $delId = (int)$_GET['id'];
    $db->prepare("DELETE FROM epaper_pages WHERE epaper_id = :id")->execute([':id' => $delId]);
    $db->prepare("DELETE FROM epapers WHERE id = :id")->execute([':id' => $delId]);
    $message = 'ই-পত্রিকা সংস্করণ এবং এর পাতাগুলো মুছে ফেলা হয়েছে।';
}

// Handle Add New Edition
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create_edition') {
    if (!verifyCsrfToken()) {
        $error = 'অবৈধ সিকিউরিটি টোকেন।';
    } else {
        $editionDate = $_POST['edition_date'] ?? date('Y-m-d');
        $title = trim($_POST['title'] ?? 'দৈনিক বার্তাচিত্র');
        $totalPages = (int)($_POST['total_pages'] ?? 1);
        $status = $_POST['status'] ?? 'published';

        // Check if date already exists
        $check = $db->prepare("SELECT id FROM epapers WHERE edition_date = :d");
        $check->execute([':d' => $editionDate]);
        if ($check->fetch()) {
            $error = 'এই তারিখের একটি ই-পত্রিকা সংস্করণ ইতিমধ্যে বিদ্যমান!';
        } else {
            $stmt = $db->prepare("INSERT INTO epapers (title, edition_date, total_pages, status) VALUES (:t, :d, :tp, :s)");
            $stmt->execute([
                ':t' => $title,
                ':d' => $editionDate,
                ':tp' => $totalPages,
                ':s' => $status
            ]);
            $newEpaperId = $db->lastInsertId();

            // Insert initial placeholder pages
            for ($i = 1; $i <= $totalPages; $i++) {
                $pStmt = $db->prepare("INSERT INTO epaper_pages (epaper_id, page_number, page_title, image_url) VALUES (:eid, :pn, :pt, :img)");
                $pStmt->execute([
                    ':eid' => $newEpaperId,
                    ':pn' => $i,
                    ':pt' => ($i === 1) ? 'প্রথম পাতা (প্রধান সংবাদ)' : 'পাতা ' . bnNum($i),
                    ':img' => 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80'
                ]);
            }

            $message = 'নতুন ই-পত্রিকা সংস্করণ সফলভাবে তৈরি হয়েছে!';
        }
    }
}

// Fetch all editions
$epapers = $db->query("SELECT * FROM epapers ORDER BY edition_date DESC")->fetchAll();
?>

<?php if (!empty($message)): ?>
    <div style="background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;padding:12px 16px;border-radius:6px;margin-bottom:20px;">
        <i class="fa-solid fa-circle-check"></i> <?= e($message) ?>
    </div>
<?php endif; ?>

<?php if (!empty($error)): ?>
    <div style="background:#fee2e2;border:1px solid #fecaca;color:#b91c1c;padding:12px 16px;border-radius:6px;margin-bottom:20px;">
        <i class="fa-solid fa-triangle-exclamation"></i> <?= e($error) ?>
    </div>
<?php endif; ?>

<div style="display:grid;grid-template-columns:1fr 2fr;gap:24px;align-items:flex-start;">
    <!-- Create Edition Card -->
    <div class="admin-card">
        <div class="admin-card-header">
            <h3><i class="fa-regular fa-newspaper"></i> নতুন ই-পত্রিকা প্রকাশ</h3>
        </div>
        <div class="admin-card-body">
            <form action="<?= BASE_URL ?>/admin/epaper.php" method="POST">
                <?= csrfField() ?>
                <input type="hidden" name="action" value="create_edition">

                <div class="form-group">
                    <label class="form-label">সংস্করণের শিরোনাম</label>
                    <input type="text" name="title" required class="form-control" value="দৈনিক বার্তাচিত্র">
                </div>

                <div class="form-group">
                    <label class="form-label">সংস্করণের তারিখ *</label>
                    <input type="date" name="edition_date" required class="form-control" value="<?= date('Y-m-d') ?>">
                </div>

                <div class="form-group">
                    <label class="form-label">মোট পাতার সংখ্যা</label>
                    <input type="number" name="total_pages" min="1" max="16" class="form-control" value="4">
                </div>

                <div class="form-group">
                    <label class="form-label">স্ট্যাটাস</label>
                    <select name="status" class="form-control">
                        <option value="published">সরাসরি প্রকাশিত (Published)</option>
                        <option value="draft">খসড়া (Draft)</option>
                    </select>
                </div>

                <button type="submit" class="btn-admin-primary" style="width:100%;justify-content:center;padding:12px;">
                    <i class="fa-solid fa-plus"></i> সংস্করণ তৈরি করুন
                </button>
            </form>
        </div>
    </div>

    <!-- Editions Table -->
    <div class="admin-card">
        <div class="admin-card-header">
            <h3>সকল ই-পত্রিকা সংস্করণ (<?= bnNum(count($epapers)) ?>)</h3>
        </div>
        <div class="admin-card-body" style="padding:0;overflow-x:auto;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>তারিখ</th>
                        <th>শিরোনাম</th>
                        <th>মোট পাতা</th>
                        <th>স্ট্যাটাস</th>
                        <th>অ্যাকশন</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!empty($epapers)): ?>
                        <?php foreach ($epapers as $ep): ?>
                        <tr>
                            <td><strong><?= bnDate($ep['edition_date'], false) ?></strong></td>
                            <td><?= e($ep['title']) ?></td>
                            <td><?= bnNum($ep['total_pages']) ?> পাতা</td>
                            <td>
                                <span class="badge-status <?= ($ep['status'] === 'published') ? 'badge-published' : 'badge-draft' ?>">
                                    <?= ($ep['status'] === 'published') ? 'প্রকাশিত' : 'ড্রাফট' ?>
                                </span>
                            </td>
                            <td>
                                <a href="<?= BASE_URL ?>/epaper.php?date=<?= urlencode($ep['edition_date']) ?>" target="_blank" class="btn-admin-outline" style="padding:4px 8px;font-size:12px;">
                                    <i class="fa-solid fa-eye"></i> দেখুন
                                </a>
                                <a href="?action=delete&id=<?= $ep['id'] ?>" class="btn-admin-danger confirm-delete" style="padding:4px 8px;font-size:12px;">
                                    <i class="fa-solid fa-trash"></i>
                                </a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="5" style="text-align:center;padding:30px;color:#64748b;">কোনো ই-পত্রিকা সংস্করণ পাওয়া যায়নি।</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>

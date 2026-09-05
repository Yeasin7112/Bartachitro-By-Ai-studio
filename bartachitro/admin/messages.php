<?php
/**
 * BartaChitro (বার্তাচিত্র) - Contact Messages Inbox
 */

$adminTitle = "পাঠকদের বার্তা ও মতামত";
require_once __DIR__ . '/header.php';

$db = getDB();
$message = '';

// Handle Delete
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $delId = (int)$_GET['id'];
    $db->prepare("DELETE FROM contact_messages WHERE id = :id")->execute([':id' => $delId]);
    $message = 'বার্তাটি মুছে ফেলা হয়েছে।';
}

// Handle Mark Read
if (isset($_GET['action']) && $_GET['action'] === 'mark_read' && isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    $db->prepare("UPDATE contact_messages SET is_read = 1 WHERE id = :id")->execute([':id' => $id]);
    $message = 'পঠিত হিসেবে চিহ্নিত করা হয়েছে।';
}

$messages = $db->query("SELECT * FROM contact_messages ORDER BY created_at DESC")->fetchAll();
?>

<?php if (!empty($message)): ?>
    <div style="background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;padding:12px 16px;border-radius:6px;margin-bottom:20px;">
        <i class="fa-solid fa-circle-check"></i> <?= e($message) ?>
    </div>
<?php endif; ?>

<div class="admin-card">
    <div class="admin-card-header">
        <h3><i class="fa-regular fa-envelope"></i> বার্তা ইনবক্স (মোট: <?= bnNum(count($messages)) ?>)</h3>
    </div>
    <div class="admin-card-body" style="padding:0;overflow-x:auto;">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>প্রেরকের নাম</th>
                    <th>যোগাযোগ</th>
                    <th>বিষয় ও বার্তা</th>
                    <th>তারিখ</th>
                    <th>স্ট্যাটাস</th>
                    <th>অ্যাকশন</th>
                </tr>
            </thead>
            <tbody>
                <?php if (!empty($messages)): ?>
                    <?php foreach ($messages as $msg): ?>
                    <tr style="<?= !$msg['is_read'] ? 'background-color:#fef2f2;' : '' ?>">
                        <td><strong><?= e($msg['name']) ?></strong></td>
                        <td>
                            <div style="font-size:13px;"><?= e($msg['email']) ?></div>
                            <div style="font-size:12px;color:#64748b;"><?= e($msg['phone'] ?: '-') ?></div>
                        </td>
                        <td style="max-width:350px;">
                            <div style="font-weight:600;color:#0f172a;"><?= e($msg['subject']) ?></div>
                            <div style="font-size:13px;color:#475569;margin-top:4px;white-space:pre-line;"><?= e($msg['message']) ?></div>
                        </td>
                        <td style="font-size:12px;color:#64748b;white-space:nowrap;"><?= bnDate($msg['created_at']) ?></td>
                        <td>
                            <span class="badge-status <?= $msg['is_read'] ? 'badge-draft' : 'badge-breaking' ?>">
                                <?= $msg['is_read'] ? 'পঠিত' : 'নতুন' ?>
                            </span>
                        </td>
                        <td>
                            <div style="display:flex;gap:6px;">
                                <?php if (!$msg['is_read']): ?>
                                    <a href="?action=mark_read&id=<?= $msg['id'] ?>" class="btn-admin-outline" style="padding:4px 8px;font-size:12px;" title="পঠিত হিসেবে মার্ক করুন">
                                        <i class="fa-solid fa-check"></i>
                                    </a>
                                <?php endif; ?>
                                <a href="?action=delete&id=<?= $msg['id'] ?>" class="btn-admin-danger confirm-delete" style="padding:4px 8px;font-size:12px;" title="মুছে ফেলুন">
                                    <i class="fa-solid fa-trash"></i>
                                </a>
                            </div>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="6" style="text-align:center;padding:30px;color:#64748b;">ইনবক্সে কোনো বার্তা নেই।</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>

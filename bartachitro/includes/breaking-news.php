<?php
/**
 * BartaChitro (বার্তাচিত্র) - Breaking News Ticker Component
 */
$breakingItems = getBreakingNews(6);
?>
<?php if (!empty($breakingItems)): ?>
<div class="breaking-ticker-wrap">
    <div class="container breaking-inner">
        <div class="breaking-badge">
            <span class="badge-pulse"><i class="fa-solid fa-bolt"></i></span>
            <span class="badge-text">ব্রেকিং</span>
        </div>
        <div class="ticker-content" id="breakingTickerTrack">
            <ul class="ticker-list">
                <?php foreach ($breakingItems as $item): ?>
                    <li class="ticker-item">
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($item['slug']) ?>">
                            <?= e($item['title']) ?>
                        </a>
                        <span class="ticker-dot">•</span>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>
    </div>
</div>
<?php endif; ?>

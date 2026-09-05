<?php
/**
 * BartaChitro (বার্তাচিত্র) - Footer Component
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/functions.php';
?>
    </main><!-- /.main-content-wrapper -->

    <!-- Newspaper Footer -->
    <footer class="site-footer">
        <div class="footer-top-strip">
            <div class="container footer-strip-inner">
                <div class="footer-brand-box">
                    <a href="<?= BASE_URL ?>/" class="footer-logo">বার্তাচিত্র</a>
                    <p class="footer-tagline"><?= e(getSetting('tagline', APP_TAGLINE)) ?></p>
                </div>
                <div class="footer-social-box">
                    <span class="follow-label">অনুসরণ করুন:</span>
                    <div class="footer-social-icons">
                        <a href="<?= e(getSetting('facebook_url', '#')) ?>" target="_blank" rel="noopener" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                        <a href="<?= e(getSetting('twitter_url', '#')) ?>" target="_blank" rel="noopener" aria-label="X / Twitter"><i class="fa-brands fa-x-twitter"></i></a>
                        <a href="<?= e(getSetting('youtube_url', '#')) ?>" target="_blank" rel="noopener" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
                        <a href="<?= e(getSetting('instagram_url', '#')) ?>" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                        <a href="#" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer-main">
            <div class="container footer-grid">
                <!-- Column 1: Editorial Info -->
                <div class="footer-col">
                    <h4 class="footer-heading">সম্পাদকীয় নেতৃত্ব</h4>
                    <ul class="editorial-list">
                        <li>
                            <span class="designation">প্রধান সম্পাদক:</span>
                            <span class="name"><?= e(getSetting('editor_name', 'আহমেদ রফিক চৌধুরী')) ?></span>
                        </li>
                        <li>
                            <span class="designation">নির্বাহী সম্পাদক:</span>
                            <span class="name"><?= e(getSetting('executive_editor', 'শাহনেওয়াজ করিম')) ?></span>
                        </li>
                        <li>
                            <span class="designation">প্রকাশক:</span>
                            <span class="name">বার্তাচিত্র মিডিয়া লিমিটেড</span>
                        </li>
                    </ul>
                </div>

                <!-- Column 2: Quick Links -->
                <div class="footer-col">
                    <h4 class="footer-heading">প্রয়োজনীয় লিংক</h4>
                    <ul class="footer-nav-links">
                        <li><a href="<?= BASE_URL ?>/"><i class="fa-solid fa-angle-right"></i> প্রচ্ছদ (হোম)</a></li>
                        <li><a href="<?= BASE_URL ?>/archive.php"><i class="fa-solid fa-angle-right"></i> পুরোনো খবর (আর্কাইভ)</a></li>
                        <li><a href="<?= BASE_URL ?>/epaper.php"><i class="fa-solid fa-angle-right"></i> ডিজিটাল ই-পত্রিকা</a></li>
                        <li><a href="<?= BASE_URL ?>/about.php"><i class="fa-solid fa-angle-right"></i> আমাদের সম্পর্কে</a></li>
                        <li><a href="<?= BASE_URL ?>/contact.php"><i class="fa-solid fa-angle-right"></i> যোগাযোগ ও বিজ্ঞাপন</a></li>
                        <li><a href="<?= BASE_URL ?>/privacy.php"><i class="fa-solid fa-angle-right"></i> গোপনীয়তা ও নীতিমালা</a></li>
                        <li><a href="<?= BASE_URL ?>/admin/login.php"><i class="fa-solid fa-angle-right"></i> অ্যাডমিন লগইন</a></li>
                    </ul>
                </div>

                <!-- Column 3: Contact & Corporate Address -->
                <div class="footer-col">
                    <h4 class="footer-heading">যোগাযোগ ও কার্যালয়</h4>
                    <address class="footer-address">
                        <p><i class="fa-solid fa-location-dot"></i> <?= e(getSetting('address', 'বার্তাচিত্র ভবন, ৪৪ কারওয়ান বাজার, ঢাকা-১২১৫, বাংলাদেশ')) ?></p>
                        <p><i class="fa-solid fa-phone"></i> ফোন: <?= e(getSetting('phone', '+৮৮০ ২ ৯৮৭৬৫৪৩')) ?></p>
                        <p><i class="fa-solid fa-envelope"></i> ইমেইল: <a href="mailto:<?= e(getSetting('email', 'editor@bartachitro.com')) ?>"><?= e(getSetting('email', 'editor@bartachitro.com')) ?></a></p>
                    </address>
                </div>
            </div>
        </div>

        <div class="footer-bottom">
            <div class="container footer-bottom-inner">
                <p class="copyright-notice">
                    <?= e(getSetting('copyright_text', '© ২০২৬ বার্তাচিত্র মিডিয়া লিমিটেড। সর্বস্বত্ব সংরক্ষিত।')) ?>
                </p>
                <p class="terms-disclaimer">
                    বার্তাচিত্রে প্রকাশিত সকল সংবাদ, ছবি ও ভিডিও বার্তাচিত্র কর্তৃপক্ষের নিজস্ব সম্পদ। অনুমতি ব্যতীত যেকোনো উপায়ে পুনরুৎপাদন বা ব্যবহার আইনত দণ্ডনীয়।
                </p>
            </div>
        </div>
    </footer>

    <!-- Floating Back to Top Button -->
    <button type="button" class="back-to-top-btn" id="backToTopBtn" aria-label="উপরে যান">
        <i class="fa-solid fa-arrow-up"></i>
    </button>

    <!-- Main JavaScript -->
    <script src="<?= BASE_URL ?>/assets/js/main.js?v=<?= APP_VERSION ?>"></script>
</body>
</html>

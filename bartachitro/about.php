<?php
/**
 * BartaChitro (বার্তাচিত্র) - About Us Page
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';

$customTitle = "আমাদের সম্পর্কে";
include __DIR__ . '/includes/header.php';
?>

<div class="container" style="max-width:900px;margin-top:10px;margin-bottom:60px;">
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:36px;box-shadow:var(--shadow-sm);">
        <h1 class="section-title" style="margin-bottom:20px;">বার্তাচিত্র সম্পর্কে</h1>
        
        <div style="font-size:17px;line-height:1.8;color:#374151;">
            <p style="margin-bottom:16px;">
                <strong>বার্তাচিত্র (BartaChitro)</strong> বাংলাদেশের একটি আধুনিক, নিরপেক্ষ এবং প্রগতিশীল ডিজিটাল সংবাদপত্র ও ই-পত্রিকা পোর্টাল। আমাদের লক্ষ্য বস্তুনিষ্ঠ ও সৎ সাংবাদিকতার মাধ্যমে দেশের প্রতিটি প্রান্তের সংবাদ সবার ভাষায় নির্ভুলভাবে জনগণের সামনে তুলে ধরা।
            </p>
            <p style="margin-bottom:16px;">
                আমাদের মূল স্লোগান—<em>"সত্যের সংবাদ, সবার ভাষায়"</em>। রাজনৈতিক পক্ষপাতহীনতা, অর্থনৈতিক স্বচ্ছতা ও সামাজিক দায়বদ্ধতাই আমাদের সম্পাদকীয় নীতির প্রধান স্তম্ভ।
            </p>

            <h2 style="font-family:var(--font-display);font-size:22px;font-weight:700;margin:28px 0 12px;color:#111827;border-bottom:2px solid #b91c1c;padding-bottom:6px;">সম্পাদকীয় নীতিমালা</h2>
            <ul style="padding-left:20px;margin-bottom:20px;">
                <li style="margin-bottom:8px;">সর্বদা তথ্যের সঠিকতা ও নির্ভরযোগ্য উৎস নিশ্চিতকরণ।</li>
                <li style="margin-bottom:8px;">ব্যক্তিগত গোপনীয়তা রক্ষা এবং কোনো প্রকার অপপ্রচার বা বিভ্রান্তিকর কনটেন্ট না ছড়ানো।</li>
                <li style="margin-bottom:8px;">প্রতিটি সংবাদের নিরপেক্ষ ভারসাম্য রক্ষা ও সংশ্লিষ্ট পক্ষের বক্তব্য প্রকাশ।</li>
            </ul>

            <h2 style="font-family:var(--font-display);font-size:22px;font-weight:700;margin:28px 0 12px;color:#111827;border-bottom:2px solid #b91c1c;padding-bottom:6px;">নেতৃত্ব ও সম্পাদকীয় পর্ষদ</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px;">
                <div style="background:#f9fafb;padding:16px;border-radius:6px;border:1px solid #e5e7eb;">
                    <span style="font-size:13px;color:#b91c1c;font-weight:700;">প্রধান সম্পাদক</span>
                    <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;"><?= e(getSetting('editor_name', 'আহমেদ রফিক চৌধুরী')) ?></h3>
                    <p style="font-size:13px;color:#6b7280;margin-top:4px;">জাতীয় পুরস্কারপ্রাপ্ত জ্যেষ্ঠ সাংবাদিক ও লেখক।</p>
                </div>
                <div style="background:#f9fafb;padding:16px;border-radius:6px;border:1px solid #e5e7eb;">
                    <span style="font-size:13px;color:#b91c1c;font-weight:700;">নির্বাহী সম্পাদক</span>
                    <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;"><?= e(getSetting('executive_editor', 'শাহনেওয়াজ করিম')) ?></h3>
                    <p style="font-size:13px;color:#6b7280;margin-top:4px;">ডিজিটাল মিডিয়া বিশেষজ্ঞ ও কলামিস্ট।</p>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>

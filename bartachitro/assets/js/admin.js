/**
 * BartaChitro (বার্তাচিত্র) - Admin Panel JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Auto slug generator from title
    const titleInput = document.getElementById('newsTitleInput');
    const slugInput = document.getElementById('newsSlugInput');

    if (titleInput && slugInput && !slugInput.value) {
        titleInput.addEventListener('input', (e) => {
            const title = e.target.value.trim();
            // Transliterate/clean slug
            const slug = title
                .toLowerCase()
                .replace(/[^\p{L}\p{N}\s\-_]+/gu, '')
                .replace(/[\s\-_]+/gu, '-')
                .replace(/^-+|-+$/g, '');
            slugInput.value = slug;
        });
    }

    // 2. Image URL Preview
    const imgUrlInput = document.getElementById('featuredImageInput');
    const imgPreview = document.getElementById('featuredImagePreview');

    if (imgUrlInput && imgPreview) {
        imgUrlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url) {
                imgPreview.src = url;
                imgPreview.style.display = 'block';
            } else {
                imgPreview.style.display = 'none';
            }
        });
    }

    // 3. Confirm Delete Prompts
    const deleteButtons = document.querySelectorAll('.confirm-delete');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!confirm('আপনি কি নিশ্চিত যে আপনি এটি মুছে ফেলতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।')) {
                e.preventDefault();
            }
        });
    });
});

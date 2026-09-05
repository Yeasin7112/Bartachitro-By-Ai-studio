/**
 * BartaChitro (বার্তাচিত্র) - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation Drawer
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavDrawer = document.getElementById('mobileNavDrawer');
    const mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');
    const closeDrawerBtn = document.getElementById('closeDrawerBtn');

    function openDrawer() {
        if (mobileNavDrawer && mobileDrawerOverlay) {
            mobileNavDrawer.classList.add('open');
            mobileDrawerOverlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeDrawer() {
        if (mobileNavDrawer && mobileDrawerOverlay) {
            mobileNavDrawer.classList.remove('open');
            mobileDrawerOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openDrawer);
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
    if (mobileDrawerOverlay) mobileDrawerOverlay.addEventListener('click', closeDrawer);

    // 2. Back To Top Button
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'flex';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 3. Search Autocomplete / Suggestions
    const searchInput = document.getElementById('headerSearchInput');
    const suggestionsBox = document.getElementById('searchSuggestions');

    if (searchInput && suggestionsBox) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(debounceTimer);

            if (query.length < 2) {
                suggestionsBox.style.display = 'none';
                suggestionsBox.innerHTML = '';
                return;
            }

            debounceTimer = setTimeout(() => {
                fetch(`api/search-suggest.php?q=${encodeURIComponent(query)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            let html = '<ul style="list-style:none;margin:0;padding:8px 0;">';
                            data.forEach(item => {
                                html += `<li style="padding:8px 14px;border-bottom:1px solid #f3f4f6;font-size:14px;">
                                    <a href="article.php?slug=${encodeURIComponent(item.slug)}" style="color:#111827;display:block;">
                                        <span style="color:#b91c1c;font-weight:600;font-size:11px;margin-right:4px;">[${item.category}]</span>
                                        ${item.title}
                                    </a>
                                </li>`;
                            });
                            html += '</ul>';
                            suggestionsBox.innerHTML = html;
                            suggestionsBox.style.display = 'block';
                        } else {
                            suggestionsBox.style.display = 'none';
                        }
                    })
                    .catch(() => {
                        suggestionsBox.style.display = 'none';
                    });
            }, 300);
        });

        // Close suggestions on outside click
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.style.display = 'none';
            }
        });
    }

    // 4. Social Sharing: Copy Link
    const copyLinkBtn = document.getElementById('copyArticleLinkBtn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                const originalText = copyLinkBtn.innerHTML;
                copyLinkBtn.innerHTML = '<i class="fa-solid fa-check"></i> কপি হয়েছে!';
                setTimeout(() => {
                    copyLinkBtn.innerHTML = originalText;
                }, 2000);
            }).catch(err => {
                alert('লিংক কপি করা যায়নি: ' + url);
            });
        });
    }

    // 5. Print Article
    const printBtn = document.getElementById('printArticleBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // 6. E-Paper Interactive Viewer
    const epaperImage = document.getElementById('epaperImage');
    const zoomInBtn = document.getElementById('epaperZoomIn');
    const zoomOutBtn = document.getElementById('epaperZoomOut');
    const fullscreenBtn = document.getElementById('epaperFullscreen');
    const stageWrap = document.getElementById('epaperStageWrap');

    if (epaperImage && zoomInBtn && zoomOutBtn) {
        let zoomScale = 1.0;

        zoomInBtn.addEventListener('click', () => {
            if (zoomScale < 2.5) {
                zoomScale += 0.25;
                epaperImage.style.transform = `scale(${zoomScale})`;
            }
        });

        zoomOutBtn.addEventListener('click', () => {
            if (zoomScale > 0.6) {
                zoomScale -= 0.25;
                epaperImage.style.transform = `scale(${zoomScale})`;
            }
        });

        if (fullscreenBtn && stageWrap) {
            fullscreenBtn.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    stageWrap.requestFullscreen().catch(err => {
                        console.warn('Fullscreen request failed:', err);
                    });
                } else {
                    document.exitFullscreen();
                }
            });
        }
    }
});

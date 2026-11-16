/**
 * cyber-effects.js
 * Advanced Cybernetic Animation Engine:
 * 1. 3D Card Tilt & Interactive Spotlight Glare
 * 2. Kinetic Typewriter Role Animation
 * 3. Sci-Fi Floating Section HUD Dots
 * 4. Magnetic Interactive Micro-Interactions
 * 5. Interactive Terminal Telemetry Stream
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        initKineticTypewriter();
        init3DCardTilt();
        initHudSectionDots();
        initMagneticButtons();
        initTerminalStream();
    });

    // 1. Kinetic Typewriter in Hero
    function initKineticTypewriter() {
        const target = document.getElementById('typewriter-role');
        if (!target) return;

        const roles = [
            "AI/ML & Deep Learning Engineer",
            "Computer Vision & YOLOv8 Specialist",
            "Full-Stack Django & Next.js Architect",
            "Cloud Microservices & Vercel Developer",
            "Algorithmic Problem Solver (340+ LeetCode)"
        ];

        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 70;

        function typeLoop() {
            const currentRole = roles[roleIndex];

            if (isDeleting) {
                target.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 35;
            } else {
                target.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 75;
            }

            if (!isDeleting && charIndex === currentRole.length) {
                // Pause at complete text
                typingSpeed = 2200;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typingSpeed = 400;
            }

            setTimeout(typeLoop, typingSpeed);
        }

        typeLoop();
    }

    // 2. 3D Tilt & Specular Spotlight Glare on Cards
    function init3DCardTilt() {
        const tiltCards = document.querySelectorAll(
            '.project-item-card, .project-grid-card, .dense-card, .profile-card-cinematic, .terminal-card, .github-console, .gh-repo-chip'
        );

        tiltCards.forEach(card => {
            // Create specular highlight overlay if not present
            if (!card.querySelector('.specular-glare')) {
                const glare = document.createElement('div');
                glare.className = 'specular-glare';
                glare.style.cssText = `
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    pointer-events: none;
                    border-radius: inherit;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 5;
                `;
                card.style.position = 'relative';
                card.appendChild(glare);
            }

            const glare = card.querySelector('.specular-glare');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -7; // max 7 deg
                const rotateY = ((x - centerX) / centerX) * 7;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
                
                if (glare) {
                    glare.style.opacity = '1';
                    glare.style.background = `radial-gradient(circle 350px at ${x}px ${y}px, rgba(6, 182, 212, 0.16), transparent 70%)`;
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
                card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                if (glare) {
                    glare.style.opacity = '0';
                }
            });

            card.addEventListener('mouseenter', () => {
                card.style.transition = 'none';
            });
        });
    }

    // 3. Sci-Fi Floating Section HUD Dots
    function initHudSectionDots() {
        const sections = document.querySelectorAll('section[id]');
        if (sections.length < 3) return;

        // Create HUD container
        const hud = document.createElement('div');
        hud.id = 'hud-section-nav';
        hud.className = 'hud-section-nav d-none d-xl-flex';
        hud.style.cssText = `
            position: fixed;
            right: 1.8rem;
            top: 50%;
            transform: translateY(-50%);
            z-index: 950;
            flex-direction: column;
            gap: 1.2rem;
            align-items: center;
        `;

        const labelsMap = {
            'hero': 'Terminal',
            'about': 'Focus',
            'skills': 'Arsenal',
            'projects': 'Projects',
            'github-hub': 'GitHub',
            'ai-lab': 'AI Lab',
            'achievements': 'Metrics',
            'resume': 'Resume',
            'contact': 'Contact'
        };

        sections.forEach(sec => {
            const id = sec.id;
            const dot = document.createElement('a');
            dot.href = `#${id}`;
            dot.className = 'hud-dot';
            dot.setAttribute('data-target', id);
            dot.title = labelsMap[id] || id;

            dot.style.cssText = `
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.4);
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
                display: block;
                text-decoration: none;
            `;

            // Hover tooltip
            const tip = document.createElement('span');
            tip.className = 'hud-tooltip';
            tip.textContent = labelsMap[id] || id.toUpperCase();
            tip.style.cssText = `
                position: absolute;
                right: 22px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(15, 23, 42, 0.95);
                border: 1px solid var(--c-cyan);
                color: var(--c-cyan);
                font-family: var(--font-mono);
                font-size: 0.7rem;
                padding: 0.2rem 0.5rem;
                border-radius: 4px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease, transform 0.2s ease;
            `;
            dot.appendChild(tip);

            dot.addEventListener('mouseenter', () => {
                tip.style.opacity = '1';
                tip.style.transform = 'translateY(-50%) translateX(-4px)';
            });
            dot.addEventListener('mouseleave', () => {
                tip.style.opacity = '0';
                tip.style.transform = 'translateY(-50%)';
            });

            hud.appendChild(dot);
        });

        document.body.appendChild(hud);

        // Scroll highlight
        const dots = hud.querySelectorAll('.hud-dot');
        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY + window.innerHeight * 0.35;
            sections.forEach(sec => {
                const top = sec.offsetTop;
                const height = sec.offsetHeight;
                const id = sec.id;
                if (scrollPos >= top && scrollPos < top + height) {
                    dots.forEach(d => {
                        if (d.getAttribute('data-target') === id) {
                            d.style.background = 'var(--c-cyan)';
                            d.style.borderColor = 'var(--c-cyan)';
                            d.style.transform = 'scale(1.5)';
                            d.style.boxShadow = '0 0 12px var(--c-cyan)';
                        } else {
                            d.style.background = 'rgba(255, 255, 255, 0.2)';
                            d.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                            d.style.transform = 'scale(1)';
                            d.style.boxShadow = 'none';
                        }
                    });
                }
            });
        }, { passive: true });
    }

    // 4. Magnetic Micro-Interaction on Key Buttons
    function initMagneticButtons() {
        const magnets = document.querySelectorAll('.btn-premium.primary, .ai-core-widget');

        magnets.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px) scale(1.04)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0px, 0px) scale(1)';
                btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            });

            btn.addEventListener('mouseenter', () => {
                btn.style.transition = 'none';
            });
        });
    }

    // 5. Interactive Terminal Telemetry Stream
    function initTerminalStream() {
        const term = document.querySelector('.terminal-body');
        if (!term) return;

        // Add copy telemetry shortcut button
        const header = document.querySelector('.terminal-header');
        if (header && !header.querySelector('.term-copy-btn')) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn btn-sm btn-link text-secondary p-0 ms-auto text-decoration-none term-copy-btn';
            copyBtn.style.fontSize = '0.75rem';
            copyBtn.innerHTML = '<i class="bi bi-clipboard me-1"></i>Copy';
            copyBtn.title = 'Copy Telemetry';

            copyBtn.addEventListener('click', () => {
                const text = term.innerText;
                navigator.clipboard.writeText(text).then(() => {
                    copyBtn.innerHTML = '<i class="bi bi-check2 text-success me-1"></i>Copied!';
                    copyBtn.classList.remove('text-secondary');
                    copyBtn.classList.add('text-success');
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="bi bi-clipboard me-1"></i>Copy';
                        copyBtn.classList.remove('text-success');
                        copyBtn.classList.add('text-secondary');
                    }, 2500);
                });
            });

            header.appendChild(copyBtn);
        }
    }

    // 6. Dock Magnification & Section Tracking
    function initDockMagnification() {
        const dock = document.getElementById('cyber-dock');
        if (!dock) return;

        const items = dock.querySelectorAll('.dock-item');
        const sections = document.querySelectorAll('section[id]');

        // Active Section Tracker via Scroll
        window.addEventListener('scroll', () => {
            let current = '';
            const scrollPos = window.scrollY + 200;

            sections.forEach(section => {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                if (scrollPos >= top && scrollPos < top + height) {
                    current = section.getAttribute('id');
                }
            });

            items.forEach(item => {
                item.classList.remove('active');
                const href = item.getAttribute('href');
                if (href && href.includes('#' + current)) {
                    item.classList.add('active');
                }
            });
        }, { passive: true });
    }

    // 7. Global Toast Notification
    window.showToast = function(message) {
        const toast = document.getElementById('cyber-toast');
        const toastText = document.getElementById('cyber-toast-text');
        if (!toast || !toastText) return;

        toastText.textContent = message;
        toast.classList.add('show');

        clearTimeout(window._toastTimer);
        window._toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };

    // 8. Copy to Clipboard Utility
    window.copyToClipboard = function(text, label) {
        if (!navigator.clipboard) {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            window.showToast(`Copied ${label || text} to clipboard!`);
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            window.showToast(`Copied ${label || text} to clipboard!`);
        }).catch(() => {
            window.showToast(`Could not copy ${label || text}`);
        });
    };

    // 9. Saved Projects / Dossier Manager
    let savedProjects = [];
    try {
        savedProjects = JSON.parse(localStorage.getItem('chiranjeeb_saved_projects') || '[]');
    } catch(e) { savedProjects = []; }

    function updateSavedBadge() {
        const badge = document.getElementById('dock-saved-count');
        const countText = document.getElementById('saved-counter-text');
        if (badge) badge.textContent = savedProjects.length;
        if (countText) countText.textContent = savedProjects.length;

        // Update all bookmark button visual states on page
        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            const id = btn.getAttribute('data-id');
            if (savedProjects.some(p => String(p.id) === String(id))) {
                btn.classList.add('bookmarked');
                btn.innerHTML = '<i class="bi bi-bookmark-star-fill"></i>';
            } else {
                btn.classList.remove('bookmarked');
                btn.innerHTML = '<i class="bi bi-bookmark-star"></i>';
            }
        });
    }

    window.toggleBookmark = function(id, title, category, github, live, image) {
        const index = savedProjects.findIndex(p => String(p.id) === String(id));
        if (index > -1) {
            savedProjects.splice(index, 1);
            window.showToast(`Removed "${title}" from Saved Dossier`);
        } else {
            savedProjects.push({ id, title, category, github, live, image });
            window.showToast(`Added "${title}" to Saved Dossier!`);
        }

        try {
            localStorage.setItem('chiranjeeb_saved_projects', JSON.stringify(savedProjects));
        } catch(e) {}

        updateSavedBadge();
        renderSavedDrawer();
    };

    function renderSavedDrawer() {
        const container = document.getElementById('saved-items-container');
        if (!container) return;

        if (savedProjects.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="bi bi-bookmark-star display-4 mb-3 d-block text-secondary"></i>
                    <p class="small">No projects bookmarked yet.<br>Click the star icon on any project to curate your dossier.</p>
                </div>
            `;
            return;
        }

        let html = '';
        savedProjects.forEach(p => {
            html += `
                <div class="saved-item-row">
                    <div>
                        <span class="badge bg-dark border border-secondary text-cyan small mb-1">${p.category || 'SYSTEM'}</span>
                        <h6 class="text-white fw-bold mb-1">${p.title}</h6>
                        <div class="d-flex gap-2">
                            ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener noreferrer" class="text-cyan small text-decoration-none"><i class="bi bi-github me-1"></i>Repo</a>` : ''}
                            ${p.live ? `<a href="${p.live}" target="_blank" rel="noopener noreferrer" class="text-success small text-decoration-none"><i class="bi bi-box-arrow-up-right me-1"></i>Live</a>` : ''}
                        </div>
                    </div>
                    <button class="btn btn-sm btn-link text-danger p-0" onclick="toggleBookmark('${p.id}', '${p.title}')" title="Remove">
                        <i class="bi bi-trash fs-5"></i>
                    </button>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    window.toggleSavedDrawer = function() {
        const drawer = document.getElementById('saved-drawer');
        if (!drawer) return;
        drawer.classList.toggle('open');
        renderSavedDrawer();
    };

    window.copySavedProjectsList = function() {
        if (savedProjects.length === 0) {
            window.showToast("Your dossier is empty.");
            return;
        }

        let summary = "=== CHIRANJEEB SATAPATHY — CURATED PROJECT DOSSIER ===\n\n";
        savedProjects.forEach((p, i) => {
            summary += `${i+1}. ${p.title} (${p.category})\n`;
            if (p.github) summary += `   GitHub: ${p.github}\n`;
            if (p.live) summary += `   Live Demo: ${p.live}\n`;
            summary += `\n`;
        });
        summary += "Candidate: Chiranjeeb Satapathy | chiranjeebsatapathy123@gmail.com\n";
        summary += "GitHub: https://github.com/chiranjeebsatapathy123-sudo\n";

        window.copyToClipboard(summary, "Curated Dossier Summary");
    };

    window.clearSavedProjects = function() {
        savedProjects = [];
        try { localStorage.removeItem('chiranjeeb_saved_projects'); } catch(e) {}
        updateSavedBadge();
        renderSavedDrawer();
        window.showToast("Dossier bookmarks cleared.");
    };

    // 10. Project Specification Modal
    window.openProjectModal = function(id) {
        const modal = document.getElementById('project-spec-modal');
        const body = document.getElementById('project-modal-body');
        if (!modal || !body) return;

        // Look up project data from window.PROJECTS_DATA or DOM
        const data = (window.PROJECTS_DATA && window.PROJECTS_DATA[id]) || null;
        if (!data) return;

        body.innerHTML = `
            <div class="row g-4 items-center">
                <div class="col-lg-6">
                    <div class="rounded-4 overflow-hidden border border-secondary shadow-lg bg-black" style="max-height: 380px;">
                        <img src="${data.image || '/static/images/placeholder.png'}" alt="${data.title}" class="w-100 h-100 object-fit-cover">
                    </div>
                </div>
                <div class="col-lg-6">
                    <span class="editorial-eyebrow">${data.category || 'PRODUCTION SYSTEM'}</span>
                    <h3 class="text-white fw-bold mb-2">${data.title}</h3>
                    <p class="text-muted small mb-4" style="line-height: 1.6;">${data.description}</p>
                    
                    <h6 class="text-white fw-bold mb-2 small font-monospace text-uppercase">// Key Engineering Deliverables</h6>
                    <ul class="curated-deliverables-list mb-4">
                        ${(data.deliverables || ['Full-Stack decoupled API architecture', 'Real-time telemetry and state synchronization', 'Responsive edge deployment on Vercel']).map(d => `<li><i class="bi bi-check2-circle"></i><span>${d}</span></li>`).join('')}
                    </ul>

                    <div class="d-flex flex-wrap gap-1 mb-4">
                        ${(data.technologies || []).map(t => `<span class="badge bg-dark border border-secondary text-cyan small">${t}</span>`).join('')}
                    </div>

                    <div class="d-flex gap-2 flex-wrap">
                        ${data.github ? `<a href="${data.github}" target="_blank" rel="noopener noreferrer" class="btn-premium flex-fill justify-content-center"><i class="bi bi-github me-1"></i> SOURCE CODE ↗</a>` : ''}
                        ${data.live ? `<a href="${data.live}" target="_blank" rel="noopener noreferrer" class="btn-premium primary flex-fill justify-content-center"><i class="bi bi-box-arrow-up-right me-1"></i> LIVE DEMO ↗</a>` : ''}
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('open');
    };

    window.closeProjectModal = function() {
        const modal = document.getElementById('project-spec-modal');
        if (modal) modal.classList.remove('open');
    };

    // Close modal on clicking backdrop
    window.addEventListener('click', (e) => {
        const pModal = document.getElementById('project-spec-modal');
        const cModal = document.getElementById('certificate-modal');
        const sDrawer = document.getElementById('saved-drawer');
        if (e.target === pModal) window.closeProjectModal();
        if (e.target === cModal) window.closeCertificateModal();
        if (e.target === sDrawer) window.toggleSavedDrawer();
    });

    // 11. Certificate Modal
    window.openCertificateModal = function(imgUrl, title, desc, link) {
        const modal = document.getElementById('certificate-modal');
        const img = document.getElementById('cert-modal-img');
        const titleEl = document.getElementById('cert-modal-title');
        const descEl = document.getElementById('cert-modal-desc');
        const linkEl = document.getElementById('cert-modal-link');

        if (img) img.src = imgUrl;
        if (titleEl) titleEl.textContent = title;
        if (descEl) descEl.textContent = desc || 'Verified engineering credential issued to Chiranjeeb Satapathy.';
        if (linkEl) {
            linkEl.href = link || '#';
            linkEl.style.display = link ? 'inline-flex' : 'none';
        }

        if (modal) modal.classList.add('open');
    };

    window.closeCertificateModal = function() {
        const modal = document.getElementById('certificate-modal');
        if (modal) modal.classList.remove('open');
    };

    // 12. Journey Dual-Track Tabs
    window.switchJourneyTab = function(tabName) {
        const academicTab = document.getElementById('journey-track-academic');
        const milestonesTab = document.getElementById('journey-track-milestones');
        const btnAcademic = document.getElementById('btn-tab-academic');
        const btnMilestones = document.getElementById('btn-tab-milestones');

        if (tabName === 'academic') {
            if (academicTab) academicTab.style.display = 'block';
            if (milestonesTab) milestonesTab.style.display = 'none';
            if (btnAcademic) btnAcademic.classList.add('active');
            if (btnMilestones) btnMilestones.classList.remove('active');
        } else {
            if (academicTab) academicTab.style.display = 'none';
            if (milestonesTab) milestonesTab.style.display = 'block';
            if (btnAcademic) btnAcademic.classList.remove('active');
            if (btnMilestones) btnMilestones.classList.add('active');
        }
    };

    // 13. Numbered Accordion Toggle (Areas of Focus)
    window.toggleAccordion = function(index) {
        const item = document.getElementById('accordion-item-' + index);
        if (!item) return;

        const isOpen = item.classList.contains('open');
        // Close others in group if desired, or toggle
        document.querySelectorAll('.accordion-editorial-item').forEach(el => el.classList.remove('open'));
        if (!isOpen) {
            item.classList.add('open');
        }
    };

    // 14. Real GitHub Projects Category Filter & Real-Time Search
    function initProjectFilterAndSearch() {
        const filterBtns = document.querySelectorAll('.filter-pill');
        const searchInput = document.getElementById('project-search-input');
        const countBadge = document.getElementById('filtered-projects-count');
        const cards = document.querySelectorAll('.system-matrix-col');

        let currentCategory = 'all';
        let currentQuery = '';

        function applyFilter() {
            let visibleCount = 0;
            cards.forEach(card => {
                const cat = card.getAttribute('data-category') || '';
                const title = (card.getAttribute('data-title') || '').toLowerCase();
                const tech = (card.getAttribute('data-tech') || '').toLowerCase();

                const matchesCat = (currentCategory === 'all') || (cat.toLowerCase().includes(currentCategory.toLowerCase()));
                const matchesQuery = !currentQuery || title.includes(currentQuery) || tech.includes(currentQuery);

                if (matchesCat && matchesQuery) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            if (countBadge) countBadge.textContent = `${visibleCount} Systems Displayed`;
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.getAttribute('data-filter') || 'all';
                applyFilter();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentQuery = e.target.value.toLowerCase().trim();
                applyFilter();
            });
        }
    }

    // Initialize all components on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        initDockMagnification();
        updateSavedBadge();
        initProjectFilterAndSearch();
    });

})();



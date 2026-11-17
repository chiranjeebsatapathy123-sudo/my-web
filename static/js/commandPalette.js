document.addEventListener('DOMContentLoaded', () => {
    const cpSearch = document.getElementById('cp-search');
    const cpResults = document.getElementById('cp-results');
    let debounceTimer;

    // Base routing commands available even without typing
    const defaultCommands = [
        { title: 'Home', url: '/', icon: 'bi-house', type: 'COMMAND' },
        { title: 'Recruiter Mode', url: '/recruiter/', icon: 'bi-briefcase-fill', type: 'RECRUITER' },
        { title: 'Projects', url: '/#projects', icon: 'bi-briefcase', type: 'COMMAND' },
        { title: 'Technical Universe', url: '/technical-universe/', icon: 'bi-globe', type: 'COMMAND' },
        { title: 'AI Lab', url: '/ai-lab/', icon: 'bi-cpu', type: 'COMMAND' },
        { title: 'Skills', url: '/skills/', icon: 'bi-code-slash', type: 'COMMAND' },
        { title: 'Certificates', url: '/certificates/', icon: 'bi-award', type: 'COMMAND' },
        { title: 'Resume', url: '/resume/', icon: 'bi-file-person', type: 'COMMAND' },
        { title: 'Blog', url: '/blog/', icon: 'bi-journal-text', type: 'COMMAND' },
    ];

    function renderResults(results) {
        cpResults.innerHTML = '';
        if (results.length === 0) {
            cpResults.innerHTML = '<div class="p-3 text-muted">No results found.</div>';
            return;
        }

        results.forEach((res, index) => {
            const div = document.createElement('div');
            div.className = 'cp-result-item d-flex align-items-center gap-3 p-2 mb-1 rounded cursor-pointer';
            // Hover effect styling
            div.style.transition = "background 0.2s";
            div.addEventListener('mouseenter', () => div.style.background = 'rgba(255,255,255,0.1)');
            div.addEventListener('mouseleave', () => div.style.background = 'transparent');
            
            div.innerHTML = `
                <div class="cp-icon bg-dark border border-secondary rounded d-flex align-items-center justify-content-center" style="width:40px; height:40px;">
                    <i class="bi ${res.icon} text-primary"></i>
                </div>
                <div class="flex-grow-1 overflow-hidden">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-white fw-bold text-truncate">${res.title}</span>
                        <span class="badge bg-secondary opacity-75" style="font-size: 0.65rem;">${res.type}</span>
                    </div>
                    ${res.description ? `<div class="text-muted small text-truncate" style="font-size:0.8rem;">${res.description}</div>` : ''}
                </div>
            `;
            
            div.addEventListener('click', () => {
                window.location.href = res.url;
            });
            
            cpResults.appendChild(div);
        });
    }

    cpSearch.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        
        clearTimeout(debounceTimer);
        
        if (!query) {
            renderResults(defaultCommands);
            return;
        }

        cpResults.innerHTML = '<div class="p-3 text-muted"><span class="spinner-border spinner-border-sm me-2"></span> Searching...</div>';

        // Check if it's a known command navigation
        const matchedCommands = defaultCommands.filter(c => c.title.toLowerCase().includes(query) || c.type.toLowerCase().includes(query));
        
        debounceTimer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search/?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                
                // Combine commands and API results
                let combined = [...matchedCommands, ...data.results];
                renderResults(combined);
            } catch (err) {
                console.error(err);
                cpResults.innerHTML = '<div class="p-3 text-danger">Search failed.</div>';
            }
        }, 300); // 300ms debounce
    });

    // Render defaults on load
    renderResults(defaultCommands);
});

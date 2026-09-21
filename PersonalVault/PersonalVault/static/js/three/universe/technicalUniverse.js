document.addEventListener('DOMContentLoaded', async () => {
    // 1. Mobile Fallback Logic
    if (window.innerWidth <= 768) {
        document.getElementById('universe-loader').style.display = 'none';
        const fallbackEl = document.getElementById('fallback-content');
        try {
            const res = await fetch(apiDataUrl);
            const data = await res.json();
            
            let html = '<div class="row g-3">';
            // Group by type for fallback
            const domains = data.nodes.filter(n => n.type === 'domain');
            const projects = data.nodes.filter(n => n.type === 'project');
            const skills = data.nodes.filter(n => n.type === 'skill');
            
            html += '<div class="col-12"><h4 class="text-white mt-4 border-bottom border-secondary pb-2">Domains</h4></div>';
            domains.forEach(d => { html += `<div class="col-6"><div class="p-2 border border-danger border-opacity-50 rounded text-center small text-danger">${d.name}</div></div>`; });
            
            html += '<div class="col-12"><h4 class="text-white mt-4 border-bottom border-secondary pb-2">Projects</h4></div>';
            projects.forEach(p => { html += `<div class="col-12"><div class="p-3 border border-info border-opacity-50 rounded"><h6 class="text-info">${p.name}</h6><p class="small text-muted mb-0">${p.description || ''}</p></div></div>`; });
            
            html += '<div class="col-12"><h4 class="text-white mt-4 border-bottom border-secondary pb-2">Technologies</h4></div>';
            skills.forEach(s => { html += `<div class="col-6"><div class="p-2 border border-success border-opacity-50 rounded text-center small text-success">${s.name}</div></div>`; });
            
            html += '</div>';
            fallbackEl.innerHTML = html;
        } catch (e) {
            fallbackEl.innerHTML = '<p class="text-danger">Failed to load ecosystem data.</p>';
        }
        return;
    }

    // 2. Desktop 3D Graph Initialization
    const container = document.getElementById('universe-container');
    const panel = document.getElementById('node-panel');
    let graphData = { nodes: [], links: [] };
    let Graph = null;
    let currentNode = null;

    // Node Colors based on Type
    const getColor = (type) => {
        if (type === 'domain') return '#e11d48'; // Rose
        if (type === 'project') return '#06b6d4'; // Cyan
        if (type === 'skill') return '#10b981'; // Emerald
        return '#aaaaaa';
    };

    try {
        const response = await fetch(apiDataUrl);
        graphData = await response.json();
        
        // Hide loader
        const loader = document.getElementById('universe-loader');
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);

        // Initialize 3D Force Graph
        Graph = ForceGraph3D()(container)
            .graphData(graphData)
            .nodeColor(node => getColor(node.type))
            .nodeVal(node => node.val)
            .nodeLabel(node => `<div style="background:rgba(0,0,0,0.8); padding:5px 10px; border-radius:4px; border:1px solid ${getColor(node.type)}">${node.name}</div>`)
            .linkWidth(0.5)
            .linkColor(() => 'rgba(255,255,255,0.1)')
            .linkDirectionalParticles(2)
            .linkDirectionalParticleWidth(1.5)
            .linkDirectionalParticleSpeed(0.005)
            .onNodeClick(node => {
                focusNode(node);
            })
            .onBackgroundClick(() => {
                closePanel();
                Graph.zoomToFit(1000); // Reset camera
            });
            
        // Post-processing for a cinematic look (using Three.js directly via Graph API)
        const scene = Graph.scene();
        scene.fog = new THREE.FogExp2(0x050510, 0.003);
        
        // Slight rotation for ambient feel
        let angle = 0;
        setInterval(() => {
            if (!panel.classList.contains('active')) {
                angle += 0.001;
                Graph.cameraPosition({
                    x: 200 * Math.cos(angle),
                    z: 200 * Math.sin(angle)
                });
            }
        }, 30);

    } catch (error) {
        console.error("Failed to initialize Technical Universe:", error);
    }

    // 3. UI Interactions
    window.focusNode = (node) => {
        currentNode = node;
        
        // Move Camera
        const distance = 50;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
        Graph.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, 
            node, 
            1500  // ms transition
        );

        // Update Panel
        document.getElementById('panel-type').innerText = node.type;
        document.getElementById('panel-type').style.color = getColor(node.type);
        document.getElementById('panel-title').innerText = node.name;
        
        let desc = '';
        if(node.type === 'project') {
            desc = node.description || 'No description available.';
        } else {
            // Find connections
            const connected = graphData.links.filter(l => l.source.id === node.id || l.target.id === node.id)
                .map(l => l.source.id === node.id ? l.target.name : l.source.name);
            desc = `Connected to: ${connected.join(', ')}`;
        }
        document.getElementById('panel-desc').innerText = desc;
        
        const linkBtn = document.getElementById('panel-link');
        if (node.url) {
            linkBtn.href = node.url;
            linkBtn.style.display = 'block';
        } else {
            linkBtn.style.display = 'none';
        }

        // Reset AI
        document.getElementById('ai-response').style.display = 'none';
        document.getElementById('ai-input').value = '';

        panel.classList.add('active');
    };

    window.closePanel = () => {
        panel.classList.remove('active');
        currentNode = null;
    };

    // 4. Search Functionality
    document.getElementById('universe-search').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if(!query) return;
        
        const found = graphData.nodes.find(n => n.name.toLowerCase().includes(query));
        if (found) {
            focusNode(found);
        }
    });

    // 5. Ask AI Functionality
    window.askUniverseAI = async () => {
        if(!currentNode) return;
        const q = document.getElementById('ai-input').value.trim();
        if(!q) return;

        const resBox = document.getElementById('ai-response');
        resBox.style.display = 'block';
        resBox.innerHTML = '<span class="spinner-border spinner-border-sm text-primary"></span> Thinking...';

        try {
            const response = await fetch(aiAskUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    node_id: currentNode.id,
                    node_type: currentNode.type,
                    node_name: currentNode.name,
                    question: q
                })
            });
            const data = await response.json();
            if(data.error) {
                resBox.innerHTML = `<span class="text-danger">${data.error}</span>`;
            } else {
                resBox.innerHTML = typeof marked !== 'undefined' ? marked.parse(data.answer) : data.answer;
            }
        } catch(e) {
            resBox.innerHTML = '<span class="text-danger">Failed to connect to AI.</span>';
        }
    };
});

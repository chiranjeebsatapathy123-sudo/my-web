document.addEventListener('DOMContentLoaded', async () => {
    // Node Colors based on Type
    const getColor = (type) => {
        if (type === 'core') return '#ffffff'; // White
        if (type === 'domain') return '#e11d48'; // Rose
        if (type === 'project') return '#06b6d4'; // Cyan
        if (type === 'skill') return '#10b981'; // Emerald
        if (type === 'certificate') return '#f59e0b'; // Amber
        if (type === 'article') return '#8b5cf6'; // Purple
        return '#aaaaaa';
    };

    // 1. Mobile Fallback Logic
    if (window.innerWidth <= 768) {
        document.getElementById('universe-loader').style.display = 'none';
        const fallbackEl = document.getElementById('fallback-content');
        try {
            const res = await fetch(apiDataUrl);
            const data = await res.json();
            
            let html = '<div class="row g-3">';
            const domains = data.nodes.filter(n => n.type === 'domain');
            const projects = data.nodes.filter(n => n.type === 'project');
            const skills = data.nodes.filter(n => n.type === 'skill');
            const certificates = data.nodes.filter(n => n.type === 'certificate');
            const articles = data.nodes.filter(n => n.type === 'article');
            
            html += '<div class="col-12"><h4 class="text-white mt-4 border-bottom border-secondary pb-2">Domains</h4></div>';
            domains.forEach(d => { html += `<div class="col-6"><a href="${d.url}" class="d-block p-2 border border-danger border-opacity-50 rounded text-center small text-danger text-decoration-none">${d.name}</a></div>`; });
            
            html += '<div class="col-12"><h4 class="text-white mt-4 border-bottom border-secondary pb-2">Projects</h4></div>';
            projects.forEach(p => { html += `<div class="col-12"><a href="${p.url}" class="d-block p-3 border border-info border-opacity-50 rounded text-decoration-none"><h6 class="text-info">${p.name}</h6><p class="small text-muted mb-0">${p.description || ''}</p></a></div>`; });
            
            html += '<div class="col-12"><h4 class="text-white mt-4 border-bottom border-secondary pb-2">Technologies</h4></div>';
            skills.forEach(s => { html += `<div class="col-6"><a href="${s.url}" class="d-block p-2 border border-success border-opacity-50 rounded text-center small text-success text-decoration-none">${s.name}</a></div>`; });
            
            if (certificates.length > 0) {
                html += '<div class="col-12"><h4 class="text-white mt-4 border-bottom border-secondary pb-2">Certificates</h4></div>';
                certificates.forEach(c => { html += `<div class="col-12"><a href="${c.url}" class="d-block p-2 border border-warning border-opacity-50 rounded small text-warning text-decoration-none">${c.name}</a></div>`; });
            }
            
            if (articles.length > 0) {
                html += '<div class="col-12"><h4 class="text-white mt-4 border-bottom border-secondary pb-2">Articles</h4></div>';
                articles.forEach(a => { html += `<div class="col-12"><a href="${a.url}" class="d-block p-2 border border-purple border-opacity-50 rounded small text-purple text-decoration-none" style="color: #8b5cf6;">${a.name}</a></div>`; });
            }

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
    let currentFilter = 'all';
    let currentView = 'graph';
    let rotationInterval = null;
    const rotatingGroups = [];
    
    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
            .nodeThreeObject(node => {
                const group = new THREE.Group();
                const color = getColor(node.type);
                const isCluster = node.id.startsWith('cluster_');
                
                // Base Sphere
                let radius = Math.cbrt(node.val) * 1.5 || 3;
                if(isCluster) radius *= 1.2;
                
                const geometry = new THREE.SphereGeometry(radius, 32, 32);
                const material = new THREE.MeshPhongMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.9,
                    emissive: color,
                    emissiveIntensity: (node.type === 'core' || isCluster) ? 0.8 : 0.2
                });
                const sphere = new THREE.Mesh(geometry, material);
                group.add(sphere);

                // Glow Effect
                const glowGeometry = new THREE.SphereGeometry(radius * 1.5, 32, 32);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: (node.type === 'core' || isCluster) ? 0.4 : 0.1,
                    blending: THREE.AdditiveBlending
                });
                const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                group.add(glow);

                // Optional Ring for Core and Clusters
                if (node.type === 'core' || isCluster) {
                    const ringGeometry = new THREE.RingGeometry(radius * 1.6, radius * 1.8, 64);
                    const ringMaterial = new THREE.MeshBasicMaterial({
                        color: color,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.6,
                        blending: THREE.AdditiveBlending
                    });
                    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                    ring.rotation.x = Math.PI / 2;
                    
                    const rings = [ring];
                    
                    // Add second outer ring for Core
                    if(node.type === 'core') {
                        const ring2 = new THREE.Mesh(new THREE.RingGeometry(radius * 2.2, radius * 2.3, 64), ringMaterial);
                        ring2.rotation.y = Math.PI / 3;
                        group.add(ring2);
                        rings.push(ring2);
                    }
                    
                    group.add(ring);
                    
                    // Add animation data to group to rotate rings
                    group.userData = { isRotating: true, rings: rings, speed: (Math.random() - 0.5) * 0.01 + 0.01 };
                    rotatingGroups.push(group);
                }

                return group;
            })
            .nodeVisibility(node => {
                if(currentFilter === 'all') return true;
                if(currentFilter === node.type) return true;
                // For core, keep visible
                if(node.type === 'core') return true;
                return false;
            })
            .nodeLabel(node => {
                const connected = graphData.links.filter(l => l.source.id === node.id || l.target.id === node.id).length;
                return `<div style="background:rgba(0,0,0,0.8); padding:8px 12px; border-radius:4px; border:1px solid ${getColor(node.type)}; min-width: 150px;">
                    <div style="font-family: monospace; font-size: 0.7rem; color: ${getColor(node.type)}; text-transform: uppercase;">${node.type}</div>
                    <div style="font-weight: bold; color: white;">${node.name}</div>
                    <div style="font-size: 0.8rem; color: #aaa; margin-top: 4px;">Connections: ${connected}</div>
                </div>`;
            })
            .linkWidth(link => currentView === 'constellation' ? 1.5 : 0.5)
            .linkColor(() => currentView === 'constellation' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)')
            .linkDirectionalParticles(link => {
                if(prefersReducedMotion) return 0;
                return currentView === 'constellation' ? 0 : 2;
            })
            .linkDirectionalParticleWidth(1.5)
            .linkDirectionalParticleSpeed(0.005)
            .onNodeClick(node => {
                focusNode(node);
            })
            .onBackgroundClick(() => {
                closePanel();
                Graph.zoomToFit(1000);
            });
            
        // Post-processing for a cinematic look
        const scene = Graph.scene();
        scene.fog = new THREE.FogExp2(0x050510, 0.002);
        
        // Add Starfield Environment
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 2000;
        const posArray = new Float32Array(starsCount * 3);
        for(let i = 0; i < starsCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 2000;
        }
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const starsMaterial = new THREE.PointsMaterial({
            size: 1.5,
            color: 0x88ccff,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        const starMesh = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(starMesh);
        
        // Add Ambient Nebulous Glow (large faint spheres)
        const nebulaGeo = new THREE.SphereGeometry(400, 32, 32);
        const nebulaMat = new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            transparent: true,
            opacity: 0.02,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
        scene.add(nebula);

        // Ambient rotation unless reduced motion
        if(!prefersReducedMotion) {
            let angle = 0;
            rotationInterval = setInterval(() => {
                // Always rotate rings
                rotatingGroups.forEach(g => {
                    if(g.userData && g.userData.isRotating) {
                        g.userData.rings.forEach((r, i) => {
                            // Rotate opposite directions for multiple rings
                            const dir = (i % 2 === 0) ? 1 : -1;
                            r.rotation.z += g.userData.speed * dir;
                        });
                    }
                });

                if (!document.getElementById('node-panel').classList.contains('active')) {
                    angle += 0.0005;
                    Graph.cameraPosition({
                        x: 300 * Math.cos(angle),
                        z: 300 * Math.sin(angle)
                    });
                    starMesh.rotation.y = angle * 0.5;
                }
            }, 30);
        }

    } catch (error) {
        console.error("Failed to initialize Technical Universe 3D, falling back to 2D:", error);
        document.getElementById('universe-container').style.display = 'none';
        document.querySelector('.universe-hud').style.display = 'none';
        document.getElementById('universe-loader').style.display = 'none';
        document.getElementById('mobile-fallback').style.display = 'block';
        
        // Execute the fallback HTML generation
        const fallbackEl = document.getElementById('fallback-content');
        let html = '<div class="row g-3">';
        const domains = graphData.nodes.filter(n => n.type === 'domain');
        const projects = graphData.nodes.filter(n => n.type === 'project');
        const skills = graphData.nodes.filter(n => n.type === 'skill');
        const certificates = graphData.nodes.filter(n => n.type === 'certificate');
        const articles = graphData.nodes.filter(n => n.type === 'article');
        
        html += '<div class="col-12"><h4 class="text-white mt-4 border-bottom border-secondary pb-2">Domains</h4></div>';
        domains.forEach(d => { html += `<div class="col-6"><a href="${d.url}" class="d-block p-2 border border-danger border-opacity-50 rounded text-center small text-danger text-decoration-none">${d.name}</a></div>`; });
        html += '<div class="col-12"><h4 class="text-white mt-4 border-bottom border-secondary pb-2">Projects</h4></div>';
        projects.forEach(p => { html += `<div class="col-12"><a href="${p.url}" class="d-block p-3 border border-info border-opacity-50 rounded text-decoration-none"><h6 class="text-info">${p.name}</h6><p class="small text-muted mb-0">${p.description || ''}</p></a></div>`; });
        html += '<div class="col-12"><h4 class="text-white mt-4 border-bottom border-secondary pb-2">Technologies</h4></div>';
        skills.forEach(s => { html += `<div class="col-6"><a href="${s.url}" class="d-block p-2 border border-success border-opacity-50 rounded text-center small text-success text-decoration-none">${s.name}</a></div>`; });
        html += '</div>';
        fallbackEl.innerHTML = html;
    }

    // 3. UI Interactions
    window.focusNode = (node) => {
        currentNode = node;
        
        // Move Camera
        const distance = 80;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
        
        if(!prefersReducedMotion) {
            Graph.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, 
                node, 
                1500  // ms transition
            );
        } else {
            Graph.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, 
                node
            );
        }

        // Update Panel
        document.getElementById('panel-empty-state').style.display = 'none';
        document.getElementById('panel-active-state').style.display = 'block';
        
        document.getElementById('panel-type').innerText = node.type;
        document.getElementById('panel-type').style.color = getColor(node.type);
        
        // Handle newline in cluster names
        document.getElementById('panel-title').innerHTML = node.name.replace('\n', ' <span class="fs-6 text-muted">') + (node.name.includes('\n') ? '</span>' : '');
        
        let desc = '';
        if(node.type === 'project') {
            desc = node.description || 'No description available.';
            document.getElementById('architecture-panel').style.display = 'block';
            document.getElementById('architecture-content').innerText = "Architecture information is not documented for this project.";
        } else {
            document.getElementById('architecture-panel').style.display = 'none';
            // Find connections
            const connectedLinks = graphData.links.filter(l => l.source.id === node.id || l.target.id === node.id);
            const connectedNames = connectedLinks.map(l => {
                const targetNode = l.source.id === node.id ? l.target : l.source;
                return targetNode.name ? targetNode.name.replace('\n', ' ') : targetNode.id; 
            });
            desc = `<strong>Connections (${connectedNames.length}):</strong><br>${connectedNames.join(', ')}`;
            if(node.description) desc = node.description + "<br><br>" + desc;
        }
        document.getElementById('panel-desc').innerHTML = desc;
        
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

    window.focusCurrentNode = () => {
        if(currentNode) focusNode(currentNode);
    };

    window.closePanel = () => {
        panel.classList.remove('active');
        currentNode = null;
    };

    // Global ESC handler
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape') {
            if(panel.classList.contains('active')) {
                closePanel();
            } else {
                window.history.back();
            }
        }
    });

    // 4. Search Functionality
    document.getElementById('universe-search').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if(!query) {
            // Re-render to clear search
            Graph.nodeVisibility(node => {
                if(currentFilter === 'all') return true;
                if(currentFilter === node.type) return true;
                if(node.type === 'core') return true;
                return false;
            });
            return;
        }
        
        Graph.nodeVisibility(node => {
            return node.name.toLowerCase().includes(query) || node.type.toLowerCase().includes(query) || node.type === 'core';
        });

        // Find first match to focus
        const found = graphData.nodes.find(n => n.name.toLowerCase().includes(query));
        if (found) focusNode(found);
    });

    // 5. Filter Logic
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            
            Graph.nodeVisibility(node => {
                if(currentFilter === 'all') return true;
                if(currentFilter === node.type) return true;
                if(node.type === 'core') return true;
                return false;
            });
        });
    });

    // 6. View Mode Logic
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.target.closest('.view-btn');
            if(!button) return;
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            currentView = button.dataset.view;
            
            if(currentView === 'constellation') {
                Graph.linkColor(() => 'rgba(255,255,255,0.4)')
                     .linkWidth(1.5)
                     .linkDirectionalParticles(0)
                     .d3Force('charge').strength(-20)
                     .d3Force('x', null)
                     .d3Force('y', null)
                     .d3Force('z', null); 
            } else if(currentView === 'timeline') {
                Graph.linkColor(() => 'rgba(255,255,255,0.1)')
                     .linkWidth(0.5)
                     .linkDirectionalParticles(0)
                     .d3Force('charge').strength(-50);
                
                // Sort projects/certs/articles roughly by ID to simulate chronology
                const chronologicalNodes = graphData.nodes.filter(n => ['project', 'certificate', 'article'].includes(n.type));
                
                Graph.d3Force('x', d3.forceX(node => {
                    const idx = chronologicalNodes.findIndex(n => n.id === node.id);
                    if(idx !== -1) {
                        return (idx - chronologicalNodes.length/2) * 50;
                    }
                    if(node.type === 'core') return 0;
                    return (Math.random() - 0.5) * 200; // Scatter non-timeline elements
                }).strength(1))
                .d3Force('y', d3.forceY(0).strength(0.5))
                .d3Force('z', d3.forceZ(0).strength(0.5));
                
            } else {
                // Graph View
                Graph.linkColor(() => 'rgba(255,255,255,0.1)')
                     .linkWidth(0.5)
                     .linkDirectionalParticles(prefersReducedMotion ? 0 : 2)
                     .d3Force('charge').strength(-120)
                     .d3Force('x', null)
                     .d3Force('y', null)
                     .d3Force('z', null);
            }
            Graph.numDimensions(3); // force re-heat
        });
    });
    
    // Immersive Mode
    window.toggleImmersive = () => {
        const hud = document.getElementById('universe-hud');
        if(hud.classList.contains('immersive-mode')) {
            hud.classList.remove('immersive-mode');
            document.querySelector('.hud-sidebar-left').style.display = 'flex';
            document.querySelector('.hud-bottom').style.display = 'flex';
            document.getElementById('immersive-btn').innerHTML = '<i class="bi bi-arrows-fullscreen"></i>';
        } else {
            hud.classList.add('immersive-mode');
            document.querySelector('.hud-sidebar-left').style.display = 'none';
            document.querySelector('.hud-bottom').style.display = 'none';
            document.getElementById('immersive-btn').innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
            closePanel();
        }
    };
    
    window.resetCamera = () => {
        closePanel();
        Graph.zoomToFit(1000, 50, node => {
            if(currentFilter === 'all') return true;
            return node.type === currentFilter || node.type === 'core';
        });
    };
    
    // Hover interactions
    Graph.onNodeHover(node => {
        container.style.cursor = node ? 'pointer' : null;
    });

    // 7. Ask AI Integration
    window.askUniverseAI = async () => {
        const input = document.getElementById('ai-input');
        const query = input.value.trim();
        if(!query || !currentNode) return;
        
        const responseBox = document.getElementById('ai-response');
        responseBox.style.display = 'block';
        responseBox.innerHTML = '<div class="spinner-border spinner-border-sm text-primary" role="status"></div> Thinking...';
        input.value = '';
        
        try {
            const formData = new FormData();
            formData.append('question', query);
            formData.append('context_node', currentNode.name);
            formData.append('context_type', currentNode.type);
            
            const res = await fetch(aiAskUrl, {
                method: 'POST',
                headers: { 'X-CSRFToken': csrfToken },
                body: formData
            });
            
            if(!res.ok) throw new Error('API Error');
            const data = await res.json();
            
            if(data.answer) {
                responseBox.innerHTML = `<strong>AI:</strong> ${data.answer}`;
            } else {
                responseBox.innerHTML = '<span class="text-warning">Could not process request.</span>';
            }
        } catch(e) {
            responseBox.innerHTML = '<span class="text-danger">AI service unavailable.</span>';
        }
    };

    // Prevent enter on search form submitting something
    document.getElementById('ai-input').addEventListener('keypress', (e) => {
        if(e.key === 'Enter') askUniverseAI();
    });
    
    // Ctrl+K shortcut for search
    document.addEventListener('keydown', (e) => {
        if((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('universe-search').focus();
        }
    });

});

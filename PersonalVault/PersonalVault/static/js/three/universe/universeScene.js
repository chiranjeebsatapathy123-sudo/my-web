/**
 * universeScene.js
 * Specialized 3D WebGL Engine for the Project Universe.
 * Spawns interactive nodes representing projects.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Check if on mobile (width < 768px). The CSS already hides this, but we skip JS execution.
    if (window.innerWidth <= 768) return;

    const container = document.getElementById('universe-container');
    if (!container) return;

    const loader = document.getElementById('universe-loader');
    const overlay = document.getElementById('project-info-overlay');
    const titleEl = document.getElementById('pi-title');
    const descEl = document.getElementById('pi-desc');
    const linkEl = document.getElementById('pi-link');
    const numberEl = document.getElementById('pi-number');

    // Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.015);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 50;
    controls.minDistance = 5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 1, 100); // Cyan
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x4f46e5, 1, 100); // Indigo
    pointLight2.position.set(-10, -10, -10);
    scene.add(pointLight2);

    // Background Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Project Nodes Array
    const nodes = [];
    let projectsData = [];

    // Fetch Data
    try {
        const response = await fetch('/api/projects/universe-data/');
        const data = await response.json();
        projectsData = data.projects;
    } catch (err) {
        console.error("Failed to load project universe data:", err);
    }

    // Spawn Nodes
    const nodeGeometry = new THREE.IcosahedronGeometry(1.5, 1);
    
    projectsData.forEach((project, index) => {
        // Distribute in a spherical or spiral arrangement
        const phi = Math.acos(-1 + (2 * index) / projectsData.length);
        const theta = Math.sqrt(projectsData.length * Math.PI) * phi;
        
        const radius = 10;
        
        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);

        // Material (Cyan base, Indigo for featured)
        const material = new THREE.MeshPhysicalMaterial({
            color: project.is_featured ? 0x4f46e5 : 0x06b6d4,
            metalness: 0.5,
            roughness: 0.2,
            transmission: 0.5,
            thickness: 0.5,
            wireframe: false
        });

        const mesh = new THREE.Mesh(nodeGeometry, material);
        mesh.position.set(x, y, z);
        mesh.userData = { project: project, index: index, originalScale: 1 };
        
        scene.add(mesh);
        nodes.push(mesh);
        
        // Add wireframe outline
        const wireframeGeom = new THREE.WireframeGeometry(nodeGeometry);
        const wireframeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
        const wireframe = new THREE.LineSegments(wireframeGeom, wireframeMat);
        mesh.add(wireframe);
    });

    // Raycaster for Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredNode = null;

    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('click', () => {
        if (hoveredNode) {
            const url = hoveredNode.userData.project.url;
            window.location.href = url;
        }
    });

    // Remove Loader
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 800);
    }

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();

        controls.update();

        // Slowly rotate particles
        particlesMesh.rotation.y = elapsedTime * 0.02;
        particlesMesh.rotation.x = elapsedTime * 0.01;

        // Interaction Logic
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodes);

        if (intersects.length > 0) {
            if (hoveredNode !== intersects[0].object) {
                // Restore previous hovered node
                if (hoveredNode) {
                    hoveredNode.scale.set(1, 1, 1);
                    hoveredNode.material.emissive.setHex(0x000000);
                }
                
                hoveredNode = intersects[0].object;
                
                // Animate Hover
                hoveredNode.scale.set(1.2, 1.2, 1.2);
                hoveredNode.material.emissive.setHex(0x06b6d4);
                hoveredNode.material.emissiveIntensity = 0.5;
                document.body.style.cursor = 'pointer';

                // Update UI Overlay
                const p = hoveredNode.userData.project;
                numberEl.textContent = `PROJECT #${String(p.index).padStart(2, '0')}`;
                titleEl.textContent = p.title;
                descEl.textContent = p.description;
                linkEl.href = p.url;
                
                overlay.classList.add('active');
            }
        } else {
            if (hoveredNode) {
                hoveredNode.scale.set(1, 1, 1);
                hoveredNode.material.emissive.setHex(0x000000);
                hoveredNode = null;
                document.body.style.cursor = 'default';
                overlay.classList.remove('active');
            }
        }

        // Float animation for all nodes
        nodes.forEach(node => {
            if (node !== hoveredNode) {
                node.position.y += Math.sin(elapsedTime * 2 + node.userData.index) * 0.005;
                node.rotation.x += 0.002;
                node.rotation.y += 0.003;
            } else {
                node.rotation.x += 0.01;
                node.rotation.y += 0.01;
            }
        });

        renderer.render(scene, camera);
    }

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            window.location.href = '/projects/'; // Bail out on resize to small screen
        }
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});

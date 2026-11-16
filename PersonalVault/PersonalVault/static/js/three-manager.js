/**
 * three-manager.js
 * High-Performance Cinematic 3D Background Engine
 * Features: Glowing Starfield Nebula, 3D Geodesic Wireframe Node, Floating Wave Particles & Cursor Parallax
 */

class ThreeManager {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.container = document.getElementById(canvasId);
        this.isActive = false;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!this.container) return;
        
        if (!this.isWebGLAvailable() || this.prefersReducedMotion) {
            this.setupFallback();
            return;
        }

        this.init();
    }

    isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    setupFallback() {
        this.container.style.background = 'radial-gradient(circle at 70% 30%, #0f172a 0%, #050508 100%)';
    }

    createCircleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(6, 182, 212, 0.85)');
        gradient.addColorStop(0.5, 'rgba(79, 70, 229, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    init() {
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded.');
            return;
        }

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050508, 0.0018);

        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 35);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        const particleTexture = this.createCircleTexture();

        // 1. Nebula Particle System (1,200 Glowing Celestial Nodes)
        const particleCount = 1200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const originalY = new Float32Array(particleCount);

        const palette = [
            new THREE.Color(0x06b6d4), // Cyan
            new THREE.Color(0x4f46e5), // Indigo
            new THREE.Color(0x8b5cf6), // Violet
            new THREE.Color(0x10b981), // Emerald
            new THREE.Color(0x38bdf8)  // Sky
        ];

        for (let i = 0; i < particleCount; i++) {
            const x = (Math.random() - 0.5) * 120;
            const y = (Math.random() - 0.5) * 90;
            const z = (Math.random() - 0.5) * 80;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            originalY[i] = y;

            const color = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.originalY = originalY;

        const material = new THREE.PointsMaterial({
            size: 1.4,
            map: particleTexture,
            transparent: true,
            opacity: 0.85,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // 2. 3D Floating Cyber Icosahedron (Neural Geometric Core)
        const icoGeo = new THREE.IcosahedronGeometry(10, 1);
        const icoWireMat = new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            wireframe: true,
            transparent: true,
            opacity: 0.18,
            blending: THREE.AdditiveBlending
        });
        this.icoMesh = new THREE.Mesh(icoGeo, icoWireMat);
        this.icoMesh.position.set(28, 12, -15);
        this.scene.add(this.icoMesh);

        // Inner glowing core
        const coreGeo = new THREE.SphereGeometry(4, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0x4f46e5,
            wireframe: true,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending
        });
        this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
        this.icoMesh.add(this.coreMesh);

        // Mouse & Scroll coordinates with damping
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.scrollY = 0;
        this.clock = new THREE.Clock();

        this.bindEvents();
        this.isActive = true;
        this.animate();
    }

    bindEvents() {
        window.addEventListener('resize', this.onWindowResize.bind(this));

        window.addEventListener('mousemove', (e) => {
            this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
        }, { passive: true });
    }

    onWindowResize() {
        if (!this.isActive) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        if (!this.isActive) return;

        requestAnimationFrame(this.animate.bind(this));

        const elapsedTime = this.clock.getElapsedTime();

        // Smooth mouse lerp
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

        // Particle wave drift
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length / 3; i++) {
            const x = positions[i * 3];
            positions[i * 3 + 1] = this.originalY[i] + Math.sin(elapsedTime * 0.8 + x * 0.05) * 1.5;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;

        // Particle global rotation
        this.particles.rotation.y = elapsedTime * 0.03 + this.mouseX * 0.2;
        this.particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05 - this.mouseY * 0.15;

        // 3D Geometric Node Rotation
        if (this.icoMesh) {
            this.icoMesh.rotation.x = elapsedTime * 0.12;
            this.icoMesh.rotation.y = elapsedTime * 0.18;
            this.icoMesh.position.y = 12 + Math.sin(elapsedTime * 0.6) * 1.8 - (this.scrollY * 0.015);
            this.icoMesh.position.x = 28 + this.mouseX * 3;

            if (this.coreMesh) {
                this.coreMesh.rotation.y = -elapsedTime * 0.25;
                this.coreMesh.rotation.z = elapsedTime * 0.15;
            }
        }

        // Camera Parallax
        const scrollOffset = this.scrollY * 0.008;
        this.camera.position.x += (this.mouseX * 4 - this.camera.position.x) * 0.05;
        this.camera.position.y += (-this.mouseY * 3 - scrollOffset - this.camera.position.y) * 0.05;

        this.renderer.render(this.scene, this.camera);
    }
}

// Auto-initialize when ready
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioThree = new ThreeManager('three-canvas-container');
});

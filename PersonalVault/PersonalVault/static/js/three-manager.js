/**
 * three-manager.js
 * Centralized Three.js controller for the cinematic portfolio.
 * Handles lazy initialization, pixel ratio limits, and WebGL fallbacks.
 */

class ThreeManager {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.container = document.getElementById(canvasId);
        this.isActive = false;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!this.container) return;
        
        // Don't initialize if WebGL is unsupported or user prefers reduced motion
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
        // Fallback CSS gradient or static image if WebGL fails
        this.container.style.background = 'radial-gradient(circle at center, #0f111a 0%, #050508 100%)';
        console.info('Three.js: WebGL disabled or fallback mode active.');
    }

    init() {
        // We will load Three.js via CDN in the base template
        if (typeof THREE === 'undefined') {
            console.warn('THREE is not defined. Ensure Three.js is loaded.');
            return;
        }

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050508, 0.002);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 30;

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        // Performance limit: Don't exceed pixel ratio of 2 (prevents thermal throttling on high DPI screens)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        this.container.appendChild(this.renderer.domElement);

        this.createParticles();
        
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.bindEvents();
        this.isActive = true;
        
        this.animate();
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const particlesCount = 700;
        
        const posArray = new Float32Array(particlesCount * 3);
        
        for(let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 100;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.05,
            color: 0x06b6d4, // Cyan
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        this.particlesMesh = new THREE.Points(geometry, material);
        this.scene.add(this.particlesMesh);
    }

    bindEvents() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        document.addEventListener('mousemove', (event) => {
            this.mouseX = event.clientX / window.innerWidth - 0.5;
            this.mouseY = event.clientY / window.innerHeight - 0.5;
        });

        // Scroll hook for camera movement
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
        });
        this.scrollY = 0;
    }

    onWindowResize() {
        if(!this.isActive) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        if(!this.isActive) return;
        
        requestAnimationFrame(this.animate.bind(this));
        
        // Parallax effect (mouse)
        const targetX = this.mouseX * 2;
        const targetY = this.mouseY * 2;
        
        this.particlesMesh.rotation.y += 0.0005;
        this.particlesMesh.rotation.x += 0.0002;
        
        // Scroll effect (move camera down/up on Y axis and slight Z)
        const scrollFactor = this.scrollY * 0.005;
        
        // Interpolate camera position
        this.camera.position.x += (targetX - this.camera.position.x) * 0.05;
        this.camera.position.y += (-targetY - scrollFactor - this.camera.position.y) * 0.05;
        this.camera.position.z += (30 - (this.scrollY * 0.002) - this.camera.position.z) * 0.05;
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioThree = new ThreeManager('three-canvas-container');
});

/**
 * three/core/engine.js
 * Base WebGL engine handling initialization, render loop, resizing, and fallbacks.
 */

class WebGLEngine {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        this.isActive = false;
        
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!this.canvas) return;

        if (!this.isWebGLAvailable()) {
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
        console.warn('WebGL not available or fallback triggered.');
        // Notify any listeners that WebGL failed so they can activate CSS fallbacks
        document.dispatchEvent(new CustomEvent('webgl-fallback'));
    }

    init() {
        if (typeof THREE === 'undefined') {
            console.error('THREE.js must be loaded before initializing WebGLEngine.');
            return;
        }

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // Position camera back slightly so we can see the scene
        this.camera.position.z = 20;

        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            alpha: true, 
            antialias: true 
        });

        // Limit pixel ratio to 2 for performance, specifically on high DPI screens (phones, Macs)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.clock = new THREE.Clock();
        
        // Render objects array for custom update logic
        this.updatables = [];

        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        this.isActive = true;
        this.animate();
    }

    onWindowResize() {
        if (!this.isActive) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    add(object) {
        if (object.mesh) this.scene.add(object.mesh);
        if (object.update) this.updatables.push(object);
    }

    animate() {
        if (!this.isActive) return;
        requestAnimationFrame(this.animate.bind(this));
        
        const delta = this.clock.getDelta();
        
        for (const obj of this.updatables) {
            obj.update(delta);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Export to global scope
window.WebGLEngine = WebGLEngine;

/**
 * 3D Engine for PersonalVault (Cinematic WebGL Experience)
 * Powered by Three.js & GSAP
 */

class WebGLEngine {
    constructor() {
        this.container = document.getElementById('webgl-container');
        if (!this.container) return;

        // Core Three.js Setup
        this.scene = new THREE.Scene();
        
        // Add subtle fog for depth (default dark)
        this.scene.fog = new THREE.FogExp2(0x050505, 0.002);
        this.scene.background = new THREE.Color(0x050505);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 30;

        // Accessibility Check
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance optimization
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambientLight);

        this.pointLight1 = new THREE.PointLight(0x6366f1, 1.5, 100);
        this.pointLight1.position.set(10, 10, 10);
        this.scene.add(this.pointLight1);
        
        this.pointLight2 = new THREE.PointLight(0x10b981, 1, 100);
        this.pointLight2.position.set(-10, -10, 10);
        this.scene.add(this.pointLight2);

        // Current Theme State
        this.currentTheme = 'dark';

        // Mouse Parallax tracking
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;

        // Elements
        this.particles = null;
        this.mascot = null;

        // Initialization
        this.initParticles();
        this.bindEvents();
        
        // Page specific logic
        this.isLoginPage = document.getElementById('login-panel') !== null;
        
        this.createProceduralMascot();

        if (this.isLoginPage) {
            this.initLoginCinematic();
        } else {
            // Position mascot in bottom right for Copilot
            this.positionMascotForCopilot();
            this.bindAIStates();
        }

        // Start Loop
        this.clock = new THREE.Clock();
        
        // Listen for OS reduced motion changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
            this.prefersReducedMotion = e.matches;
        });

        this.animate();
    }

    setTheme(mode) {
        if (this.currentTheme === mode) return;
        this.currentTheme = mode;

        const targetFogColor = mode === 'light' ? new THREE.Color(0xf8fafc) : new THREE.Color(0x050505);
        const targetBgColor = mode === 'light' ? new THREE.Color(0xf8fafc) : new THREE.Color(0x050505);
        
        gsap.to(this.scene.fog.color, {
            r: targetFogColor.r, g: targetFogColor.g, b: targetFogColor.b, duration: 1
        });
        gsap.to(this.scene.background, {
            r: targetBgColor.r, g: targetBgColor.g, b: targetBgColor.b, duration: 1
        });

        if (mode === 'light') {
            gsap.to(this.ambientLight, { intensity: 0.8, duration: 1 });
            gsap.to(this.pointLight1, { intensity: 0.8, duration: 1 });
        } else {
            gsap.to(this.ambientLight, { intensity: 0.4, duration: 1 });
            gsap.to(this.pointLight1, { intensity: 1.5, duration: 1 });
        }
    }

    initParticles() {
        const geometry = new THREE.BufferGeometry();
        const particlesCount = window.innerWidth < 768 ? 400 : 1200; // Performance scaling
        const posArray = new Float32Array(particlesCount * 3);
        const colorsArray = new Float32Array(particlesCount * 3);

        const colorPalette = [
            new THREE.Color(0x6366f1), // Primary
            new THREE.Color(0x10b981), // Success
            new THREE.Color(0xf59e0b), // Warning
            new THREE.Color(0x3b82f6)  // Info
        ];

        for(let i = 0; i < particlesCount * 3; i+=3) {
            // Position
            posArray[i] = (Math.random() - 0.5) * 100;
            posArray[i+1] = (Math.random() - 0.5) * 100;
            posArray[i+2] = (Math.random() - 0.5) * 100;

            // Color
            const mixedColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colorsArray[i] = mixedColor.r;
            colorsArray[i+1] = mixedColor.g;
            colorsArray[i+2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createProceduralMascot() {
        this.mascot = new THREE.Group();

        // Main Body (Orb)
        const bodyGeo = new THREE.SphereGeometry(2, 64, 64);
        const bodyMat = new THREE.MeshPhysicalMaterial({ 
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        
        // Eyes
        const eyeGeo = new THREE.CapsuleGeometry(0.3, 0.8, 4, 16);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
        
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.8, 0.5, 1.8);
        leftEye.rotation.z = Math.PI / 2;
        
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.8, 0.5, 1.8);
        rightEye.rotation.z = Math.PI / 2;

        // Orbiting Ring
        const ringGeo = new THREE.TorusGeometry(3.5, 0.1, 16, 100);
        const ringMat = new THREE.MeshPhysicalMaterial({
            color: 0x6366f1,
            emissive: 0x6366f1,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        this.ring = new THREE.Mesh(ringGeo, ringMat);
        this.ring.rotation.x = Math.PI / 2;

        this.mascot.add(body);
        this.mascot.add(leftEye);
        this.mascot.add(rightEye);
        this.mascot.add(this.ring);

        // Position mascot off-screen initially for login
        this.mascot.position.set(0, -15, 0); 
        this.scene.add(this.mascot);
    }

    positionMascotForCopilot() {
        // Place in bottom right corner (relative to camera perspective)
        const aspect = window.innerWidth / window.innerHeight;
        this.mascot.position.set(12 * aspect, -8, 15);
        this.mascot.scale.set(0.5, 0.5, 0.5);
    }

    bindAIStates() {
        // Listen to custom events from script.js
        window.addEventListener('ai-idle', () => {
            gsap.to(this.ring.material, { emissiveIntensity: 0.5, duration: 1 });
            gsap.to(this.mascot.scale, { x: 0.5, y: 0.5, z: 0.5, duration: 1, ease: "power2.out" });
        });

        window.addEventListener('ai-thinking', () => {
            gsap.to(this.ring.material, { emissiveIntensity: 2.0, duration: 0.5, yoyo: true, repeat: -1 });
            gsap.to(this.mascot.scale, { x: 0.55, y: 0.55, z: 0.55, duration: 0.5, yoyo: true, repeat: -1 });
        });

        window.addEventListener('ai-responding', () => {
            gsap.killTweensOf(this.ring.material);
            gsap.killTweensOf(this.mascot.scale);
            
            gsap.to(this.ring.material, { emissiveIntensity: 1.5, duration: 0.2 });
            gsap.to(this.mascot.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 0.3, ease: "back.out(1.7)" });
            
            setTimeout(() => {
                window.dispatchEvent(new Event('ai-idle'));
            }, 2000);
        });
    }

    initLoginCinematic() {
        const loginPanel = document.getElementById('login-panel');
        if (loginPanel) {
            // Hide HTML login panel initially via GSAP
            gsap.set(loginPanel, { 
                autoAlpha: 0, 
                y: 100, 
                rotationX: -15,
                transformPerspective: 1000 
            });
        }

        this.createProceduralMascot();

        // Cinematic Timeline
        const tl = gsap.timeline({ delay: 1 });

        // 1. Mascot enters
        tl.to(this.mascot.position, {
            y: 0,
            duration: 2,
            ease: "back.out(1.2)"
        });

        // 2. Mascot "throws" colors (simulate by exploding particles toward camera)
        tl.add(() => {
            gsap.to(this.particles.material, {
                size: 0.8,
                duration: 0.5,
                yoyo: true,
                repeat: 1
            });
            gsap.to(this.camera.position, {
                z: 15,
                duration: 1.5,
                ease: "power2.inOut"
            });
        }, "+=1");

        // 3. Mascot moves aside
        tl.to(this.mascot.position, {
            x: -8,
            y: 2,
            z: -5,
            duration: 1.5,
            ease: "power3.inOut"
        }, "+=0.5");

        // 4. Login Panel Emerges
        if (loginPanel) {
            tl.to(loginPanel, {
                autoAlpha: 1,
                y: 0,
                rotationX: 0,
                duration: 1.5,
                ease: "expo.out"
            }, "-=1");
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // Intercept links for smooth 3D page transitions
        document.querySelectorAll('a').forEach(link => {
            if (link.hostname === window.location.hostname && 
                !link.hasAttribute('target') && 
                !link.getAttribute('href').startsWith('#')) {
                
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const destination = link.getAttribute('href');
                    const overlay = document.getElementById('page-transition-overlay');
                    
                    // Cinematic exit
                    gsap.to(this.camera.position, {
                        z: 5,
                        duration: 0.8,
                        ease: "power2.in"
                    });

                    if (overlay) {
                        overlay.style.opacity = '1';
                        overlay.style.pointerEvents = 'all';
                    }

                    setTimeout(() => {
                        window.location.href = destination;
                    }, 800);
                });
            }
        });

        // Fade out overlay on load
        window.addEventListener('load', () => {
            const overlay = document.getElementById('page-transition-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => { overlay.style.pointerEvents = 'none'; }, 800);
            }
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        const elapsedTime = this.clock.getElapsedTime();

        if (!this.prefersReducedMotion) {
            // Parallax easing
            this.targetX = this.mouseX * 2;
            this.targetY = this.mouseY * 2;
            
            this.camera.position.x += (this.targetX - this.camera.position.x) * 0.05;
            this.camera.position.y += (this.targetY - this.camera.position.y) * 0.05;
            this.camera.lookAt(0, 0, 0);

            // Particle subtle rotation
            if (this.particles) {
                this.particles.rotation.y = elapsedTime * 0.05;
                this.particles.rotation.x = elapsedTime * 0.02;
            }

            // Mascot idle animation
            if (this.mascot) {
                this.mascot.position.y += Math.sin(elapsedTime * 2) * 0.01; // Bobbing
                
                // Mascot looks at cursor
                this.mascot.rotation.y = this.mouseX * 0.5;
                this.mascot.rotation.x = -this.mouseY * 0.5;

                // Ring rotation
                if (this.ring) {
                    this.ring.rotation.z = elapsedTime * 0.5;
                }
            }
        } else {
            // If reduced motion is on, just look at center
            this.camera.lookAt(0,0,0);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize Engine when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.vault3DEngine = new WebGLEngine();
});

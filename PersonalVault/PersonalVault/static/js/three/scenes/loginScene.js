/**
 * three/scenes/loginScene.js
 * Contains the logic for the 3D assets on the login page: Particles, AI Core, Identity Frame.
 */

class LoginScene {
    constructor(engine) {
        this.engine = engine;
        
        // Mouse tracking for subtle parallax
        this.mouseX = 0;
        this.mouseY = 0;
        
        // State parameters
        this.coreActive = false;
        this.authActive = false;
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        this.initParticles();
        this.initAICore();
        
        // Add self to engine updatables
        this.engine.add(this);
    }

    initParticles() {
        const particleCount = this.engine.prefersReducedMotion ? 200 : 1500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for(let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 150;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.1,
            color: 0x06b6d4, // Cyan
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.engine.scene.add(this.particles);
    }

    initAICore() {
        // Create a geometric AI Core (e.g. an Icosahedron wireframe glowing)
        const geometry = new THREE.IcosahedronGeometry(3, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            wireframe: true,
            transparent: true,
            opacity: 0, // Starts hidden in Stage 1
        });
        
        this.aiCore = new THREE.Mesh(geometry, material);
        
        // Add an inner glowing sphere
        const innerGeo = new THREE.IcosahedronGeometry(2, 0);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0x4f46e5, // Indigo
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });
        this.innerCore = new THREE.Mesh(innerGeo, innerMat);
        this.aiCore.add(this.innerCore);

        this.engine.scene.add(this.aiCore);
    }

    // Called by the loginFlow to transition states
    activateCore() {
        this.coreActive = true;
        
        // Simple GSAP animation (assuming GSAP is loaded)
        if (window.gsap) {
            gsap.to(this.aiCore.material, { opacity: 0.8, duration: 2 });
            gsap.to(this.innerCore.material, { opacity: 0.5, duration: 2 });
        } else {
            this.aiCore.material.opacity = 0.8;
            this.innerCore.material.opacity = 0.5;
        }
    }

    triggerAuthMode() {
        this.authActive = true;
        // Shift camera and rotate core faster
        if (window.gsap) {
            gsap.to(this.engine.camera.position, { z: 25, y: -5, duration: 2, ease: "power2.inOut" });
            gsap.to(this.aiCore.position, { y: 10, duration: 2, ease: "power2.inOut" });
        }
    }

    triggerSuccess() {
        if (window.gsap) {
            // Explode particles forward, move core into camera
            gsap.to(this.engine.camera.position, { z: 0, duration: 1.5, ease: "power3.in" });
            gsap.to(this.aiCore.scale, { x: 5, y: 5, z: 5, duration: 1.5 });
            gsap.to(this.innerCore.material, { opacity: 1, duration: 1 });
        }
    }

    update(delta) {
        // Rotate particles slowly
        if (this.particles && !this.engine.prefersReducedMotion) {
            this.particles.rotation.y += 0.0005;
            this.particles.rotation.x += 0.0002;
        }

        // Rotate AI Core
        if (this.coreActive && this.aiCore) {
            const speed = this.authActive ? 0.02 : 0.005;
            this.aiCore.rotation.y += speed;
            this.aiCore.rotation.x += speed * 0.5;
            this.innerCore.rotation.y -= speed * 1.5;
        }

        // Subtle Parallax Camera Movement
        if (!this.engine.prefersReducedMotion) {
            const targetX = this.mouseX * 3;
            const targetY = this.mouseY * 3;
            
            this.engine.camera.position.x += (targetX - this.engine.camera.position.x) * 0.02;
            // Only adjust Y if we aren't in auth mode (which hard-sets Y)
            if (!this.authActive) {
                this.engine.camera.position.y += (targetY - this.engine.camera.position.y) * 0.02;
            }
        }
    }
}

window.LoginScene = LoginScene;

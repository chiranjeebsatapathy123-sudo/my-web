/**
 * three/login/loginFlow.js
 * Manages the 6-stage cinematic login flow and form submission.
 */

class LoginFlow {
    constructor(scene) {
        this.scene = scene; // LoginScene instance
        
        this.stages = {
            1: document.getElementById('stage-1'), // Initialization
            2: document.getElementById('stage-2'), // AI Core / Identity
            3: document.getElementById('stage-3')  // Auth Panel
        };

        this.currentStage = 1;
        this.form = document.getElementById('auth-form');
        this.btnSubmit = document.getElementById('btn-submit');
        this.skipBtn = document.getElementById('skip-intro-btn');
        
        this.bindEvents();
        this.startSequence();
    }

    bindEvents() {
        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', () => this.skipIntro());
        }

        if (this.form) {
            this.form.addEventListener('submit', this.handleAuthSubmit.bind(this));
            
            // Password focus animation trigger
            const passInput = this.form.querySelector('input[type="password"]');
            if (passInput) {
                passInput.addEventListener('focus', () => {
                    // Slight visual reaction to password focus
                    if (this.scene && window.gsap) {
                        gsap.to(this.scene.innerCore.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.3, yoyo: true, repeat: 1 });
                    }
                });
            }
        }
        
        // Listen for WebGL fallback event to skip intro immediately
        document.addEventListener('webgl-fallback', () => {
            console.log('WebGL Fallback detected. Skipping 3D intro.');
            this.skipIntro();
        });
    }

    startSequence() {
        // Stage 1: Initialization (2 seconds)
        setTimeout(() => {
            if (this.currentStage === 1) this.advanceToStage(2);
        }, 2000);
    }

    advanceToStage(stageNum) {
        if (this.currentStage === stageNum) return;
        
        // Hide all stages
        Object.values(this.stages).forEach(stage => {
            if (stage) stage.classList.remove('active');
        });

        this.currentStage = stageNum;
        
        const targetStage = this.stages[stageNum];
        if (targetStage) {
            targetStage.classList.add('active');
        }

        // Trigger 3D logic based on stage
        if (stageNum === 2 && this.scene) {
            this.scene.activateCore();
            // Automatically advance to Auth after 3 seconds
            setTimeout(() => {
                if (this.currentStage === 2) this.advanceToStage(3);
            }, 3000);
        } else if (stageNum === 3 && this.scene) {
            this.scene.triggerAuthMode();
            if (this.skipBtn) this.skipBtn.style.opacity = 0;
        }
    }

    skipIntro() {
        this.advanceToStage(3);
    }

    async handleAuthSubmit(e) {
        e.preventDefault();
        
        if (!this.form || !this.btnSubmit) return;
        
        // Disable button, show loading
        const originalText = this.btnSubmit.innerHTML;
        this.btnSubmit.disabled = true;
        this.btnSubmit.innerHTML = 'AUTHENTICATING...';
        
        // Slight 3D rotation speedup for authentication
        if (this.scene) {
            this.scene.aiCore.rotation.y += 0.1;
        }

        try {
            const formData = new FormData(this.form);
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();

            if (data.success) {
                // STAGE 5 & 6: ACCESS GRANTED -> TRANSITION
                this.btnSubmit.innerHTML = 'ACCESS GRANTED';
                this.btnSubmit.style.background = 'var(--c-cyan)';
                
                // Trigger success 3D camera move
                if (this.scene) this.scene.triggerSuccess();

                // Wait for transition before redirecting
                setTimeout(() => {
                    window.location.href = data.redirect_url || '/dashboard/';
                }, 1500);

            } else {
                // Invalid login
                this.btnSubmit.innerHTML = 'AUTHENTICATION FAILED';
                this.btnSubmit.style.background = '#ef4444'; // Red
                
                // Shake 3D core
                if (this.scene && window.gsap) {
                    gsap.to(this.scene.aiCore.position, { x: 1, duration: 0.1, yoyo: true, repeat: 3 });
                }

                // Reset after 2 seconds
                setTimeout(() => {
                    this.btnSubmit.disabled = false;
                    this.btnSubmit.innerHTML = originalText;
                    this.btnSubmit.style.background = '';
                }, 2000);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.btnSubmit.innerHTML = 'SYSTEM ERROR';
            this.btnSubmit.style.background = '#ef4444';
            
            setTimeout(() => {
                this.btnSubmit.disabled = false;
                this.btnSubmit.innerHTML = originalText;
                this.btnSubmit.style.background = '';
            }, 2000);
        }
    }
}

window.LoginFlow = LoginFlow;

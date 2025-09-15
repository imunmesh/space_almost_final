// Animation Controller
class AnimationController {
    constructor() {
        this.animations = {};
        this.particles = [];
        this.animationFrame = null;
        this.isRunning = false;
    }

    init() {
        this.createSpacecraftAnimation();
        this.createParticleSystem();
        this.setupScrollAnimations();
        this.startAnimationLoop();
    }

    createSpacecraftAnimation() {
        // Create moving spacecraft element
        const spacecraft = document.createElement('div');
        spacecraft.className = 'spacecraft-moving';
        spacecraft.innerHTML = '<i class="fas fa-rocket"></i>';
        document.body.appendChild(spacecraft);

        // Add to animations registry
        this.animations.spacecraft = spacecraft;
    }

    createParticleSystem() {
        // Create particle container
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particles';
        document.body.appendChild(particleContainer);

        // Generate initial particles
        this.generateParticles(particleContainer, 15);
        
        // Regenerate particles periodically
        setInterval(() => {
            this.generateParticles(particleContainer, 3);
        }, 5000);

        this.animations.particles = particleContainer;
    }

    generateParticles(container, count) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random size and position
            const size = Math.random() * 3 + 1;
            const left = Math.random() * 100;
            const delay = Math.random() * 10;
            const duration = Math.random() * 5 + 10;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${left}%;
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
            `;
            
            container.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (container.contains(particle)) {
                    container.removeChild(particle);
                }
            }, (delay + duration) * 1000);
        }
    }

    setupScrollAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, { threshold: 0.1 });

        // Observe elements with scroll animations
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });

        this.animations.scrollObserver = observer;
    }

    startAnimationLoop() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.animate();
    }

    animate() {
        // Update custom animations here
        this.updateHeartbeatAnimations();
        this.updateGlowAnimations();
        this.updateRadarSweep();
        
        // Continue animation loop
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    updateHeartbeatAnimations() {
        // Make heart rate icons pulse with actual heart rate
        const heartRateElements = document.querySelectorAll('.heart-rate .vital-icon');
        heartRateElements.forEach(element => {
            // Get current heart rate for dynamic animation speed
            const heartRateValue = document.getElementById('heartRate')?.textContent;
            if (heartRateValue) {
                const bpm = parseInt(heartRateValue);
                const animationDuration = 60 / Math.max(bpm, 60); // seconds per beat
                element.style.animationDuration = `${animationDuration}s`;
            }
        });
    }

    updateGlowAnimations() {
        // Update glow effects based on system status
        const statusIndicators = document.querySelectorAll('.status-indicator');
        statusIndicators.forEach(indicator => {
            if (indicator.classList.contains('critical')) {
                // Add urgent pulsing for critical status
                indicator.style.animation = 'pulse 0.5s ease-in-out infinite';
            } else if (indicator.classList.contains('warning')) {
                indicator.style.animation = 'pulse 1s ease-in-out infinite';
            } else {
                indicator.style.animation = 'pulse 2s ease-in-out infinite';
            }
        });
    }

    updateRadarSweep() {
        // The radar sweep is handled by CSS animation, but we can sync it with data updates
        const radarSweep = document.querySelector('.radar-sweep');
        if (radarSweep) {
            // Speed up sweep during active scanning
            const isScanning = window.navigationSystem && window.navigationSystem.obstacles.length > 0;
            radarSweep.style.animationDuration = isScanning ? '3s' : '4s';
        }
    }

    // Visual Effects
    createExplosionEffect(x, y, color = '#ff6b35') {
        const explosion = document.createElement('div');
        explosion.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: radial-gradient(circle, ${color}, transparent);
            pointer-events: none;
            z-index: 10000;
            animation: explosion 0.6s ease-out forwards;
        `;
        
        document.body.appendChild(explosion);
        
        setTimeout(() => {
            document.body.removeChild(explosion);
        }, 600);
    }

    createRippleEffect(element, color = 'rgba(33, 150, 243, 0.3)') {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        
        ripple.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: ${color};
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 100;
            animation: ripple 0.6s ease-out forwards;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            element.removeChild(ripple);
        }, 600);
    }

    createFloatingAlert(message, type = 'warning') {
        const alert = document.createElement('div');
        alert.className = `floating-alert floating-alert-${type}`;
        alert.textContent = message;
        
        alert.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: var(--gradient-${type === 'critical' ? 'critical' : 'warning'});
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 1.1rem;
            box-shadow: var(--shadow-strong);
            z-index: 10000;
            animation: float-in 0.5s ease forwards, float-out 0.5s ease forwards 3s;
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (document.body.contains(alert)) {
                document.body.removeChild(alert);
            }
        }, 4000);
    }

    // Interactive Animations
    animateVitalCard(cardElement, status = 'normal') {
        cardElement.classList.remove('normal', 'warning', 'critical');
        cardElement.classList.add(status);
        
        if (status === 'warning') {
            this.createRippleEffect(cardElement, 'rgba(255, 215, 0, 0.3)');
        } else if (status === 'critical') {
            this.createRippleEffect(cardElement, 'rgba(255, 51, 51, 0.3)');
            // Add shake effect
            cardElement.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                cardElement.style.animation = '';
            }, 500);
        }
    }

    animateAlert(alertElement, severity = 'medium') {
        // Slide in animation
        alertElement.style.transform = 'translateX(-100%)';
        alertElement.style.opacity = '0';
        
        requestAnimationFrame(() => {
            alertElement.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
            alertElement.style.transform = 'translateX(0)';
            alertElement.style.opacity = '1';
        });
        
        // Add severity-based effects
        if (severity === 'critical') {
            alertElement.style.animation = 'critical-flash 2s ease-in-out infinite';
        }
    }

    animateRadarContact(x, y, type = 'unknown') {
        const contact = document.createElement('div');
        contact.className = 'radar-contact';
        
        const colors = {
            asteroid: '#ff9800',
            debris: '#f44336',
            satellite: '#4caf50',
            unknown: '#2196f3'
        };
        
        contact.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${colors[type] || colors.unknown};
            box-shadow: 0 0 15px ${colors[type] || colors.unknown};
            animation: radar-contact-appear 0.5s ease forwards;
            pointer-events: none;
        `;
        
        const radarScreen = document.querySelector('.radar-screen');
        if (radarScreen) {
            radarScreen.appendChild(contact);
            
            setTimeout(() => {
                if (radarScreen.contains(contact)) {
                    radarScreen.removeChild(contact);
                }
            }, 3000);
        }
    }

    // Performance and Accessibility
    reduceAnimations() {
        // Respect user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
            this.stopParticleSystem();
        }
    }

    stopParticleSystem() {
        const particleContainer = this.animations.particles;
        if (particleContainer) {
            particleContainer.style.display = 'none';
        }
    }

    resumeParticleSystem() {
        const particleContainer = this.animations.particles;
        if (particleContainer) {
            particleContainer.style.display = 'block';
        }
    }

    // Battery Optimization
    optimizeForBattery() {
        // Reduce animation frequency on battery power
        if (navigator.getBattery) {
            navigator.getBattery().then(battery => {
                if (!battery.charging && battery.level < 0.2) {
                    this.reduceAnimations();
                }
                
                battery.addEventListener('levelchange', () => {
                    if (!battery.charging && battery.level < 0.2) {
                        this.reduceAnimations();
                    }
                });
            });
        }
    }

    // Cleanup
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        this.isRunning = false;
        
        // Clean up created elements
        Object.values(this.animations).forEach(animation => {
            if (animation && animation.parentNode) {
                animation.parentNode.removeChild(animation);
            }
        });
        
        // Disconnect observers
        if (this.animations.scrollObserver) {
            this.animations.scrollObserver.disconnect();
        }
    }

    // Public API
    triggerCriticalAlert() {
        this.createFloatingAlert('CRITICAL ALERT: Immediate attention required!', 'critical');
    }

    triggerWarningAlert() {
        this.createFloatingAlert('Warning: System parameter out of range', 'warning');
    }

    celebrateSuccess() {
        // Create celebration effect
        const colors = ['#00ff88', '#2196f3', '#ffd700', '#ff6b35'];
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const color = colors[Math.floor(Math.random() * colors.length)];
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                this.createExplosionEffect(x, y, color);
            }, i * 100);
        }
    }
}

// Add custom CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes explosion {
        0% {
            width: 0;
            height: 0;
            opacity: 1;
        }
        50% {
            width: 100px;
            height: 100px;
            opacity: 0.8;
        }
        100% {
            width: 200px;
            height: 200px;
            opacity: 0;
        }
    }
    
    @keyframes ripple {
        0% {
            width: 0;
            height: 0;
            opacity: 1;
        }
        100% {
            width: 200px;
            height: 200px;
            opacity: 0;
        }
    }
    
    @keyframes float-in {
        0% {
            transform: translateX(-50%) translateY(-50px);
            opacity: 0;
        }
        100% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes float-out {
        0% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        100% {
            transform: translateX(-50%) translateY(-50px);
            opacity: 0;
        }
    }
    
    @keyframes radar-contact-appear {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        50% {
            transform: scale(1.5);
            opacity: 1;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
`;

document.head.appendChild(style);

// Initialize animation controller
window.animationController = new AnimationController();
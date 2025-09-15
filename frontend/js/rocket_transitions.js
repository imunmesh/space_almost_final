// Rocket Transition Animation System
class RocketTransitionManager {
    constructor() {
        this.transitionOverlay = null;
        this.isTransitioning = false;
        this.createTransitionOverlay();
    }

    createTransitionOverlay() {
        this.transitionOverlay = document.createElement('div');
        this.transitionOverlay.className = 'rocket-transition-overlay';
        this.transitionOverlay.innerHTML = `
            <div class="rocket-container">
                <div class="rocket">🚀</div>
                <div class="transition-particles"></div>
            </div>
        `;
        document.body.appendChild(this.transitionOverlay);
        this.createParticles();
    }

    createParticles() {
        const particlesContainer = this.transitionOverlay.querySelector('.transition-particles');
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 3 + 's';
            particle.style.animationDuration = (2 + Math.random() * 2) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    async transitionTo(targetScreen) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Start rocket transition
        this.transitionOverlay.classList.add('active');
        
        // Play rocket launch sound (if available)
        this.playRocketSound();
        
        // Wait for rocket animation
        await this.sleep(2000);
        
        // Hide current screen
        const currentScreens = document.querySelectorAll('.dashboard:not(.hidden), .role-selection-screen:not(.hidden)');
        currentScreens.forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show target screen with delay
        await this.sleep(500);
        const targetElement = document.getElementById(targetScreen);
        if (targetElement) {
            targetElement.classList.remove('hidden');
            this.applyEntryAnimation(targetElement);
        }
        
        // Hide rocket transition
        await this.sleep(500);
        this.transitionOverlay.classList.remove('active');
        
        this.isTransitioning = false;
    }

    applyEntryAnimation(element) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8) translateY(50px)';
        element.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1) translateY(0)';
        });
        
        // Reset styles after animation
        setTimeout(() => {
            element.style.transition = '';
            element.style.transform = '';
            element.style.opacity = '';
        }, 800);
    }

    playRocketSound() {
        try {
            // Create audio context for sound synthesis
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Rocket launch sound effect
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 2);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 2);
        } catch (error) {
            console.log('Audio not available:', error);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Real-time Object Tracking System
class RealTimeObjectTracker {
    constructor() {
        this.isTracking = false;
        this.trackedObjects = new Map();
        this.canvas = null;
        this.ctx = null;
        this.lastFrame = null;
        this.objectId = 0;
        this.setupObjectDetection();
    }

    setupObjectDetection() {
        // Initialize canvas for object detection visualization
        this.canvas = document.createElement('canvas');
        this.canvas.width = 640;
        this.canvas.height = 480;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1000';
        this.ctx = this.canvas.getContext('2d');
    }

    async startTracking() {
        if (this.isTracking) return;
        
        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'environment'
                }
            });
            
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.muted = true;
            
            // Add video and canvas to radar panel
            const radarPanel = document.querySelector('.radar-panel .radar-content');
            if (radarPanel) {
                video.style.width = '100%';
                video.style.height = '200px';
                video.style.objectFit = 'cover';
                video.style.borderRadius = '10px';
                this.canvas.style.width = '100%';
                this.canvas.style.height = '200px';
                
                radarPanel.appendChild(video);
                radarPanel.appendChild(this.canvas);
            }
            
            this.isTracking = true;
            this.processVideo(video);
            
            console.log('Real-time object tracking started');
            this.updateTrackingStatus('Active - Detecting Objects');
            
        } catch (error) {
            console.error('Error starting object tracking:', error);
            this.updateTrackingStatus('Error - Camera Access Denied');
        }
    }

    processVideo(video) {
        if (!this.isTracking) return;
        
        const processFrame = () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                this.detectObjects(video);
            }
            
            if (this.isTracking) {
                requestAnimationFrame(processFrame);
            }
        };
        
        video.addEventListener('loadedmetadata', () => {
            processFrame();
        });
    }

    detectObjects(video) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Simple motion detection algorithm
        this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
        const currentFrame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.lastFrame) {
            const motionObjects = this.detectMotion(currentFrame, this.lastFrame);
            this.trackDetectedObjects(motionObjects);
        }
        
        this.lastFrame = currentFrame;
        this.drawTrackingOverlay();
    }

    detectMotion(currentFrame, lastFrame) {
        const objects = [];
        const threshold = 50;
        const minObjectSize = 100;
        
        const current = currentFrame.data;
        const last = lastFrame.data;
        
        // Motion detection grid
        const blockSize = 20;
        const cols = Math.floor(this.canvas.width / blockSize);
        const rows = Math.floor(this.canvas.height / blockSize);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let motionSum = 0;
                let pixelCount = 0;
                
                // Check pixels in this block
                for (let y = row * blockSize; y < (row + 1) * blockSize && y < this.canvas.height; y++) {
                    for (let x = col * blockSize; x < (col + 1) * blockSize && x < this.canvas.width; x++) {
                        const index = (y * this.canvas.width + x) * 4;
                        
                        // Calculate motion intensity
                        const rDiff = Math.abs(current[index] - last[index]);
                        const gDiff = Math.abs(current[index + 1] - last[index + 1]);
                        const bDiff = Math.abs(current[index + 2] - last[index + 2]);
                        
                        const motion = (rDiff + gDiff + bDiff) / 3;
                        motionSum += motion;
                        pixelCount++;
                    }
                }
                
                const avgMotion = motionSum / pixelCount;
                
                if (avgMotion > threshold) {
                    objects.push({
                        x: col * blockSize + blockSize / 2,
                        y: row * blockSize + blockSize / 2,
                        width: blockSize,
                        height: blockSize,
                        intensity: avgMotion,
                        timestamp: Date.now()
                    });
                }
            }
        }
        
        return this.mergeNearbyObjects(objects);
    }

    mergeNearbyObjects(objects) {
        const merged = [];
        const mergeDistance = 50;
        
        for (const obj of objects) {
            let foundNearby = false;
            
            for (const mergedObj of merged) {
                const distance = Math.sqrt(
                    Math.pow(obj.x - mergedObj.x, 2) + 
                    Math.pow(obj.y - mergedObj.y, 2)
                );
                
                if (distance < mergeDistance) {
                    // Merge objects
                    mergedObj.x = (mergedObj.x + obj.x) / 2;
                    mergedObj.y = (mergedObj.y + obj.y) / 2;
                    mergedObj.width = Math.max(mergedObj.width, obj.width);
                    mergedObj.height = Math.max(mergedObj.height, obj.height);
                    mergedObj.intensity = Math.max(mergedObj.intensity, obj.intensity);
                    foundNearby = true;
                    break;
                }
            }
            
            if (!foundNearby) {
                merged.push({ ...obj, id: this.objectId++ });
            }
        }
        
        return merged;
    }

    trackDetectedObjects(detectedObjects) {
        // Update tracked objects
        for (const obj of detectedObjects) {
            this.trackedObjects.set(obj.id, {
                ...obj,
                lastSeen: Date.now(),
                trackingHistory: this.trackedObjects.get(obj.id)?.trackingHistory || []
            });
            
            // Add to tracking history
            const tracked = this.trackedObjects.get(obj.id);
            tracked.trackingHistory.push({ x: obj.x, y: obj.y, timestamp: obj.timestamp });
            
            // Limit history size
            if (tracked.trackingHistory.length > 10) {
                tracked.trackingHistory.shift();
            }
        }
        
        // Remove old objects
        const now = Date.now();
        for (const [id, obj] of this.trackedObjects) {
            if (now - obj.lastSeen > 2000) { // 2 seconds timeout
                this.trackedObjects.delete(id);
            }
        }
        
        this.updateObjectCount();
    }

    drawTrackingOverlay() {
        this.ctx.strokeStyle = '#39ff14';
        this.ctx.fillStyle = '#39ff14';
        this.ctx.lineWidth = 2;
        this.ctx.font = '12px Arial';
        
        for (const [id, obj] of this.trackedObjects) {
            // Draw bounding box
            this.ctx.strokeRect(
                obj.x - obj.width / 2,
                obj.y - obj.height / 2,
                obj.width,
                obj.height
            );
            
            // Draw center point
            this.ctx.beginPath();
            this.ctx.arc(obj.x, obj.y, 3, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw tracking trail
            if (obj.trackingHistory.length > 1) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = '#00d4ff';
                this.ctx.lineWidth = 1;
                
                for (let i = 1; i < obj.trackingHistory.length; i++) {
                    const prev = obj.trackingHistory[i - 1];
                    const curr = obj.trackingHistory[i];
                    
                    this.ctx.moveTo(prev.x, prev.y);
                    this.ctx.lineTo(curr.x, curr.y);
                }
                this.ctx.stroke();
                this.ctx.strokeStyle = '#39ff14';
                this.ctx.lineWidth = 2;
            }
            
            // Draw object ID and info
            this.ctx.fillText(
                `OBJ_${id}`,
                obj.x + obj.width / 2 + 5,
                obj.y - obj.height / 2 - 5
            );
            
            // Draw targeting reticle
            this.drawTargetingReticle(obj.x, obj.y);
        }
    }

    drawTargetingReticle(x, y) {
        const size = 20;
        
        this.ctx.strokeStyle = '#ff073a';
        this.ctx.lineWidth = 1;
        
        // Draw crosshairs
        this.ctx.beginPath();
        // Horizontal line
        this.ctx.moveTo(x - size, y);
        this.ctx.lineTo(x + size, y);
        // Vertical line
        this.ctx.moveTo(x, y - size);
        this.ctx.lineTo(x, y + size);
        this.ctx.stroke();
        
        // Draw corner brackets
        const cornerSize = 8;
        this.ctx.beginPath();
        // Top-left
        this.ctx.moveTo(x - size, y - size + cornerSize);
        this.ctx.lineTo(x - size, y - size);
        this.ctx.lineTo(x - size + cornerSize, y - size);
        // Top-right
        this.ctx.moveTo(x + size - cornerSize, y - size);
        this.ctx.lineTo(x + size, y - size);
        this.ctx.lineTo(x + size, y - size + cornerSize);
        // Bottom-left
        this.ctx.moveTo(x - size, y + size - cornerSize);
        this.ctx.lineTo(x - size, y + size);
        this.ctx.lineTo(x - size + cornerSize, y + size);
        // Bottom-right
        this.ctx.moveTo(x + size - cornerSize, y + size);
        this.ctx.lineTo(x + size, y + size);
        this.ctx.lineTo(x + size, y + size - cornerSize);
        this.ctx.stroke();
    }

    updateObjectCount() {
        const objectCountElement = document.getElementById('radarObjectCount');
        if (objectCountElement) {
            objectCountElement.textContent = this.trackedObjects.size;
        }
    }

    updateTrackingStatus(status) {
        const statusElement = document.getElementById('radarStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    stopTracking() {
        this.isTracking = false;
        this.trackedObjects.clear();
        
        // Remove video and canvas elements
        const video = document.querySelector('.radar-panel video');
        const canvas = document.querySelector('.radar-panel canvas');
        
        if (video) {
            const stream = video.srcObject;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            video.remove();
        }
        
        if (canvas) {
            canvas.remove();
        }
        
        this.updateTrackingStatus('Stopped');
        this.updateObjectCount();
    }
}

// Interface Enhancement Manager
class InterfaceEnhancementManager {
    constructor() {
        this.rocketTransition = new RocketTransitionManager();
        this.objectTracker = new RealTimeObjectTracker();
        this.setupEnhancedControls();
        this.apply3DEffects();
    }

    setupEnhancedControls() {
        // Enhanced role selection with rocket transitions
        const roleButtons = document.querySelectorAll('.role-btn');
        roleButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const role = button.getAttribute('data-role');
                
                if (role === 'management') {
                    await this.rocketTransition.transitionTo('managementDashboard');
                } else if (role === 'tourist') {
                    await this.rocketTransition.transitionTo('touristDashboard');
                }
            });
        });

        // Enhanced exit buttons with rocket transitions
        const exitButtons = document.querySelectorAll('.exit-btn');
        exitButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.rocketTransition.transitionTo('roleSelectionScreen');
            });
        });

        // Object tracking controls
        this.setupObjectTrackingControls();
    }

    setupObjectTrackingControls() {
        // Add object tracking toggle to radar panel
        const radarPanel = document.querySelector('.radar-panel .panel-header');
        if (radarPanel) {
            const trackingToggle = document.createElement('button');
            trackingToggle.className = 'tracking-toggle-btn';
            trackingToggle.innerHTML = '<i class="fas fa-video"></i> Start Tracking';
            trackingToggle.style.cssText = `
                background: linear-gradient(45deg, #39ff14, #00d4ff);
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            trackingToggle.addEventListener('click', () => {
                if (!this.objectTracker.isTracking) {
                    this.objectTracker.startTracking();
                    trackingToggle.innerHTML = '<i class="fas fa-stop"></i> Stop Tracking';
                    trackingToggle.style.background = 'linear-gradient(45deg, #ff073a, #ff6b35)';
                } else {
                    this.objectTracker.stopTracking();
                    trackingToggle.innerHTML = '<i class="fas fa-video"></i> Start Tracking';
                    trackingToggle.style.background = 'linear-gradient(45deg, #39ff14, #00d4ff)';
                }
            });
            
            radarPanel.appendChild(trackingToggle);
        }
    }

    apply3DEffects() {
        // Add 3D hover effects to all panels
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            panel.addEventListener('mouseenter', () => {
                panel.style.transform = 'translateY(-8px) rotateX(5deg) translateZ(10px)';
                panel.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            });
            
            panel.addEventListener('mouseleave', () => {
                panel.style.transform = 'translateY(0) rotateX(0deg) translateZ(0px)';
            });
        });

        // Add holographic effects to important elements
        const importantElements = document.querySelectorAll('.logo, .dashboard-title');
        importantElements.forEach(element => {
            element.classList.add('hologram-text');
        });

        // Add particle effects to buttons
        this.addButtonParticleEffects();
    }

    addButtonParticleEffects() {
        const buttons = document.querySelectorAll('.role-btn, .voice-btn, .capture-btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createClickParticles(e.target, e.clientX, e.clientY);
            });
        });
    }

    createClickParticles(element, x, y) {
        const particleCount = 6;
        const colors = ['#39ff14', '#00d4ff', '#8a2be2', '#ffff00'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 6px;
                height: 6px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                left: ${x}px;
                top: ${y}px;
                transform: translate(-50%, -50%);
            `;
            
            document.body.appendChild(particle);
            
            // Animate particle
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 50 + Math.random() * 50;
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;
            
            particle.animate([
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: `translate(${endX - x}px, ${endY - y}px) scale(0)`, opacity: 0 }
            ], {
                duration: 600,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                particle.remove();
            };
        }
    }
}

// Initialize enhanced interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const interfaceManager = new InterfaceEnhancementManager();
    
    // Add enhanced 3D animations CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/enhanced_3d_animations.css';
    document.head.appendChild(link);
    
    console.log('Enhanced 3D interface and rocket transitions initialized');
});

// Export for global access
window.RocketTransitionManager = RocketTransitionManager;
window.RealTimeObjectTracker = RealTimeObjectTracker;
window.InterfaceEnhancementManager = InterfaceEnhancementManager;
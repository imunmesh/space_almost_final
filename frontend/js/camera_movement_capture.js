// Camera Movement Capture for Experience Logger
class CameraMovementCapture {
    constructor() {
        this.isRecording = false;
        this.isCapturing = false;
        this.stream = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.canvas = null;
        this.ctx = null;
        this.motionDetector = null;
        this.capturedMoments = [];
        this.setupCameraInterface();
        this.initializeMotionDetection();
    }

    setupCameraInterface() {
        // Enhanced camera controls for experience logger
        const loggerPanel = document.querySelector('.experience-logger-panel .logger-content');
        if (!loggerPanel) return;

        // Create camera preview container
        const cameraContainer = document.createElement('div');
        cameraContainer.className = 'camera-container';
        cameraContainer.innerHTML = `
            <div class="camera-preview">
                <video id="cameraPreview" autoplay muted playsinline></video>
                <canvas id="motionCanvas" style="position: absolute; top: 0; left: 0; pointer-events: none;"></canvas>
                <div class="recording-indicator" id="recordingIndicator">
                    <i class="fas fa-circle"></i>
                    <span>REC</span>
                </div>
            </div>
            
            <div class="camera-controls">
                <button class="camera-btn start-capture" id="startCaptureBtn">
                    <i class="fas fa-camera"></i>
                    Start Capture
                </button>
                <button class="camera-btn start-recording" id="startRecordingBtn">
                    <i class="fas fa-video"></i>
                    Start Recording
                </button>
                <button class="camera-btn motion-detection" id="motionDetectionBtn">
                    <i class="fas fa-running"></i>
                    Motion Detection
                </button>
            </div>
            
            <div class="movement-analysis">
                <div class="motion-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Motion Level:</span>
                        <div class="motion-bar">
                            <div class="motion-fill" id="motionFill"></div>
                        </div>
                        <span class="metric-value" id="motionLevel">0%</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Movement Direction:</span>
                        <span class="metric-value" id="movementDirection">None</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Objects Detected:</span>
                        <span class="metric-value" id="objectsDetected">0</span>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .camera-container {
                background: rgba(255, 255, 255, 0.03);
                border-radius: 15px;
                padding: 20px;
                margin-top: 15px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .camera-preview {
                position: relative;
                width: 100%;
                height: 240px;
                background: #000;
                border-radius: 10px;
                overflow: hidden;
                margin-bottom: 15px;
            }
            
            #cameraPreview {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            #motionCanvas {
                width: 100%;
                height: 100%;
                z-index: 2;
                opacity: 0.7;
            }
            
            .recording-indicator {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(255, 0, 0, 0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 0.8rem;
                display: none;
                align-items: center;
                gap: 5px;
                animation: pulse 1s infinite;
            }
            
            .recording-indicator.active {
                display: flex;
            }
            
            .camera-controls {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
                flex-wrap: wrap;
            }
            
            .camera-btn {
                background: linear-gradient(45deg, #39ff14, #00d4ff);
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 20px;
                font-size: 0.9rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                min-width: 120px;
                justify-content: center;
            }
            
            .camera-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(57, 255, 20, 0.3);
            }
            
            .camera-btn.active {
                background: linear-gradient(45deg, #ff073a, #ff6b35);
            }
            
            .camera-btn.recording {
                background: linear-gradient(45deg, #ff073a, #ff073a);
                animation: pulse 1s infinite;
            }
            
            .movement-analysis {
                background: rgba(255, 255, 255, 0.02);
                border-radius: 10px;
                padding: 15px;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .motion-metrics {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .metric-item {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 0.9rem;
            }
            
            .metric-label {
                color: var(--text-secondary);
                min-width: 120px;
            }
            
            .metric-value {
                color: var(--text-primary);
                font-weight: 600;
                min-width: 60px;
            }
            
            .motion-bar {
                flex: 1;
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                overflow: hidden;
                position: relative;
            }
            
            .motion-fill {
                height: 100%;
                background: linear-gradient(90deg, #39ff14, #00d4ff);
                border-radius: 3px;
                transition: width 0.3s ease;
                width: 0%;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);

        loggerPanel.appendChild(cameraContainer);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const startCaptureBtn = document.getElementById('startCaptureBtn');
        const startRecordingBtn = document.getElementById('startRecordingBtn');
        const motionDetectionBtn = document.getElementById('motionDetectionBtn');

        startCaptureBtn?.addEventListener('click', () => this.toggleCapture());
        startRecordingBtn?.addEventListener('click', () => this.toggleRecording());
        motionDetectionBtn?.addEventListener('click', () => this.toggleMotionDetection());
    }

    async toggleCapture() {
        const btn = document.getElementById('startCaptureBtn');
        
        if (!this.isCapturing) {
            await this.startCapture();
            btn.innerHTML = '<i class="fas fa-stop"></i> Stop Capture';
            btn.classList.add('active');
        } else {
            this.stopCapture();
            btn.innerHTML = '<i class="fas fa-camera"></i> Start Capture';
            btn.classList.remove('active');
        }
    }

    async startCapture() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'environment'
                },
                audio: false
            });

            const video = document.getElementById('cameraPreview');
            video.srcObject = this.stream;
            
            this.isCapturing = true;
            this.setupMotionCanvas();
            this.startContinuousCapture();
            
            console.log('Camera capture started');
        } catch (error) {
            console.error('Error starting camera capture:', error);
            this.showError('Camera access denied or not available');
        }
    }

    stopCapture() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        const video = document.getElementById('cameraPreview');
        video.srcObject = null;
        
        this.isCapturing = false;
        this.stopMotionDetection();
        
        console.log('Camera capture stopped');
    }

    async toggleRecording() {
        const btn = document.getElementById('startRecordingBtn');
        
        if (!this.isRecording) {
            await this.startRecording();
            btn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
            btn.classList.add('recording');
        } else {
            await this.stopRecording();
            btn.innerHTML = '<i class="fas fa-video"></i> Start Recording';
            btn.classList.remove('recording');
        }
    }

    async startRecording() {
        if (!this.stream) {
            await this.startCapture();
        }

        try {
            this.recordedChunks = [];
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'video/webm'
            });

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.saveRecordedVideo();
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Show recording indicator
            const indicator = document.getElementById('recordingIndicator');
            indicator.classList.add('active');
            
            console.log('Video recording started');
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showError('Recording not supported');
        }
    }

    async stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Hide recording indicator
            const indicator = document.getElementById('recordingIndicator');
            indicator.classList.remove('active');
            
            console.log('Video recording stopped');
        }
    }

    saveRecordedVideo() {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `space_experience_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Add to captured moments
        this.addCapturedMoment('video', url);
    }

    setupMotionCanvas() {
        const canvas = document.getElementById('motionCanvas');
        const video = document.getElementById('cameraPreview');
        
        canvas.width = 640;
        canvas.height = 480;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    initializeMotionDetection() {
        this.motionDetector = new MotionDetector();
    }

    toggleMotionDetection() {
        const btn = document.getElementById('motionDetectionBtn');
        
        if (!this.motionDetector.isActive) {
            this.startMotionDetection();
            btn.innerHTML = '<i class="fas fa-stop"></i> Stop Detection';
            btn.classList.add('active');
        } else {
            this.stopMotionDetection();
            btn.innerHTML = '<i class="fas fa-running"></i> Motion Detection';
            btn.classList.remove('active');
        }
    }

    startMotionDetection() {
        if (!this.isCapturing) {
            this.startCapture().then(() => {
                this.motionDetector.start(this.stream, this.canvas);
            });
        } else {
            this.motionDetector.start(this.stream, this.canvas);
        }
    }

    stopMotionDetection() {
        this.motionDetector.stop();
    }

    startContinuousCapture() {
        const captureInterval = setInterval(() => {
            if (!this.isCapturing) {
                clearInterval(captureInterval);
                return;
            }
            
            // Capture photo every 10 seconds during active capture
            this.capturePhoto();
        }, 10000);
    }

    capturePhoto() {
        const video = document.getElementById('cameraPreview');
        if (!video.videoWidth) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            this.addCapturedMoment('photo', url);
            
            // Auto-download photo
            const a = document.createElement('a');
            a.href = url;
            a.download = `space_moment_${Date.now()}.png`;
            a.click();
        }, 'image/png');
    }

    addCapturedMoment(type, url) {
        const moment = {
            id: Date.now(),
            type: type,
            url: url,
            timestamp: new Date(),
            motionData: this.motionDetector.getLastMotionData()
        };
        
        this.capturedMoments.unshift(moment);
        this.updatePhotoCount();
        this.updateMemoryFeed(moment);
    }

    updatePhotoCount() {
        const countElement = document.getElementById('photoCount');
        if (countElement) {
            countElement.textContent = this.capturedMoments.length;
        }
    }

    updateMemoryFeed(moment) {
        const memoryFeed = document.querySelector('.memory-feed');
        if (!memoryFeed) return;
        
        const memoryItem = document.createElement('div');
        memoryItem.className = 'memory-item';
        memoryItem.innerHTML = `
            <div class="memory-preview" style="background-image: url(${moment.url});">
                <div class="memory-type">
                    <i class="fas fa-${moment.type === 'video' ? 'video' : 'camera'}"></i>
                </div>
            </div>
            <span class="memory-time">${this.getRelativeTime(moment.timestamp)}</span>
            <div class="memory-motion-data">
                Motion: ${moment.motionData?.level || 'N/A'}%
            </div>
        `;
        
        // Add click handler to view/download
        memoryItem.addEventListener('click', () => {
            window.open(moment.url, '_blank');
        });
        
        memoryFeed.insertBefore(memoryItem, memoryFeed.firstChild);
        
        // Limit to 10 items in feed
        while (memoryFeed.children.length > 10) {
            memoryFeed.removeChild(memoryFeed.lastChild);
        }
    }

    getRelativeTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
        return `${Math.floor(minutes / 1440)} days ago`;
    }

    showError(message) {
        // Create error toast
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #ff073a, #ff6b35);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-size: 0.9rem;
            box-shadow: 0 5px 15px rgba(255, 7, 58, 0.3);
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Motion Detection Class
class MotionDetector {
    constructor() {
        this.isActive = false;
        this.lastFrame = null;
        this.motionLevel = 0;
        this.movementDirection = 'None';
        this.objectsDetected = 0;
        this.motionHistory = [];
        this.canvas = null;
        this.ctx = null;
        this.video = null;
    }

    start(stream, canvas) {
        this.isActive = true;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.video = document.getElementById('cameraPreview');
        
        this.detectMotion();
        console.log('Motion detection started');
    }

    stop() {
        this.isActive = false;
        this.lastFrame = null;
        this.updateMotionMetrics(0, 'None', 0);
        console.log('Motion detection stopped');
    }

    detectMotion() {
        if (!this.isActive || !this.video) return;
        
        const processFrame = () => {
            if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
                this.analyzeFrame();
            }
            
            if (this.isActive) {
                requestAnimationFrame(processFrame);
            }
        };
        
        processFrame();
    }

    analyzeFrame() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw current frame
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        const currentFrame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.lastFrame) {
            const motionData = this.calculateMotion(currentFrame, this.lastFrame);
            this.processMotionData(motionData);
            this.drawMotionOverlay(motionData);
        }
        
        this.lastFrame = currentFrame;
    }

    calculateMotion(currentFrame, lastFrame) {
        const current = currentFrame.data;
        const last = lastFrame.data;
        
        let totalMotion = 0;
        let motionPixels = 0;
        let xMotion = 0;
        let yMotion = 0;
        const motionThreshold = 50;
        const motionRegions = [];
        
        const blockSize = 20;
        const cols = Math.floor(this.canvas.width / blockSize);
        const rows = Math.floor(this.canvas.height / blockSize);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let blockMotion = 0;
                let blockPixels = 0;
                
                for (let y = row * blockSize; y < (row + 1) * blockSize && y < this.canvas.height; y++) {
                    for (let x = col * blockSize; x < (col + 1) * blockSize && x < this.canvas.width; x++) {
                        const index = (y * this.canvas.width + x) * 4;
                        
                        const rDiff = Math.abs(current[index] - last[index]);
                        const gDiff = Math.abs(current[index + 1] - last[index + 1]);
                        const bDiff = Math.abs(current[index + 2] - last[index + 2]);
                        
                        const pixelMotion = (rDiff + gDiff + bDiff) / 3;
                        blockMotion += pixelMotion;
                        blockPixels++;
                        
                        if (pixelMotion > motionThreshold) {
                            motionPixels++;
                            totalMotion += pixelMotion;
                            
                            // Calculate directional motion
                            xMotion += (col - cols / 2) * pixelMotion;
                            yMotion += (row - rows / 2) * pixelMotion;
                        }
                    }
                }
                
                const avgBlockMotion = blockMotion / blockPixels;
                if (avgBlockMotion > motionThreshold) {
                    motionRegions.push({
                        x: col * blockSize,
                        y: row * blockSize,
                        width: blockSize,
                        height: blockSize,
                        intensity: avgBlockMotion
                    });
                }
            }
        }
        
        return {
            level: Math.min((totalMotion / (this.canvas.width * this.canvas.height)) * 100, 100),
            direction: this.calculateDirection(xMotion, yMotion),
            regions: motionRegions,
            objectCount: this.estimateObjectCount(motionRegions)
        };
    }

    calculateDirection(xMotion, yMotion) {
        const magnitude = Math.sqrt(xMotion * xMotion + yMotion * yMotion);
        
        if (magnitude < 1000) return 'None';
        
        const angle = Math.atan2(yMotion, xMotion) * 180 / Math.PI;
        
        if (angle >= -22.5 && angle < 22.5) return 'Right';
        if (angle >= 22.5 && angle < 67.5) return 'Down-Right';
        if (angle >= 67.5 && angle < 112.5) return 'Down';
        if (angle >= 112.5 && angle < 157.5) return 'Down-Left';
        if (angle >= 157.5 || angle < -157.5) return 'Left';
        if (angle >= -157.5 && angle < -112.5) return 'Up-Left';
        if (angle >= -112.5 && angle < -67.5) return 'Up';
        if (angle >= -67.5 && angle < -22.5) return 'Up-Right';
        
        return 'None';
    }

    estimateObjectCount(motionRegions) {
        if (motionRegions.length === 0) return 0;
        
        // Simple clustering to estimate object count
        const clusters = [];
        const mergeDistance = 60;
        
        for (const region of motionRegions) {
            let merged = false;
            
            for (const cluster of clusters) {
                const distance = Math.sqrt(
                    Math.pow(region.x - cluster.x, 2) + 
                    Math.pow(region.y - cluster.y, 2)
                );
                
                if (distance < mergeDistance) {
                    cluster.x = (cluster.x + region.x) / 2;
                    cluster.y = (cluster.y + region.y) / 2;
                    cluster.intensity = Math.max(cluster.intensity, region.intensity);
                    merged = true;
                    break;
                }
            }
            
            if (!merged) {
                clusters.push({ ...region });
            }
        }
        
        return clusters.length;
    }

    processMotionData(motionData) {
        this.motionLevel = Math.round(motionData.level);
        this.movementDirection = motionData.direction;
        this.objectsDetected = motionData.objectCount;
        
        // Add to motion history
        this.motionHistory.push({
            timestamp: Date.now(),
            level: this.motionLevel,
            direction: this.movementDirection,
            objectCount: this.objectsDetected
        });
        
        // Keep only last 100 entries
        if (this.motionHistory.length > 100) {
            this.motionHistory.shift();
        }
        
        this.updateMotionMetrics(this.motionLevel, this.movementDirection, this.objectsDetected);
    }

    drawMotionOverlay(motionData) {
        // Draw motion regions
        this.ctx.strokeStyle = '#39ff14';
        this.ctx.fillStyle = 'rgba(57, 255, 20, 0.2)';
        this.ctx.lineWidth = 2;
        
        for (const region of motionData.regions) {
            this.ctx.strokeRect(region.x, region.y, region.width, region.height);
            this.ctx.fillRect(region.x, region.y, region.width, region.height);
            
            // Draw intensity indicator
            this.ctx.fillStyle = '#39ff14';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(
                Math.round(region.intensity),
                region.x + 5,
                region.y + 15
            );
            this.ctx.fillStyle = 'rgba(57, 255, 20, 0.2)';
        }
        
        // Draw motion vectors (simplified)
        if (motionData.direction !== 'None') {
            this.drawMotionVector(motionData.direction);
        }
    }

    drawMotionVector(direction) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const arrowLength = 50;
        
        let angle = 0;
        switch (direction) {
            case 'Right': angle = 0; break;
            case 'Down-Right': angle = 45; break;
            case 'Down': angle = 90; break;
            case 'Down-Left': angle = 135; break;
            case 'Left': angle = 180; break;
            case 'Up-Left': angle = 225; break;
            case 'Up': angle = 270; break;
            case 'Up-Right': angle = 315; break;
        }
        
        const radian = angle * Math.PI / 180;
        const endX = centerX + Math.cos(radian) * arrowLength;
        const endY = centerY + Math.sin(radian) * arrowLength;
        
        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        // Draw arrowhead
        const headLength = 15;
        const headAngle = Math.PI / 6;
        
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - headLength * Math.cos(radian - headAngle),
            endY - headLength * Math.sin(radian - headAngle)
        );
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - headLength * Math.cos(radian + headAngle),
            endY - headLength * Math.sin(radian + headAngle)
        );
        this.ctx.stroke();
    }

    updateMotionMetrics(level, direction, objectCount) {
        const motionFill = document.getElementById('motionFill');
        const motionLevel = document.getElementById('motionLevel');
        const movementDirection = document.getElementById('movementDirection');
        const objectsDetected = document.getElementById('objectsDetected');
        
        if (motionFill) motionFill.style.width = `${level}%`;
        if (motionLevel) motionLevel.textContent = `${level}%`;
        if (movementDirection) movementDirection.textContent = direction;
        if (objectsDetected) objectsDetected.textContent = objectCount;
    }

    getLastMotionData() {
        const recent = this.motionHistory.slice(-10);
        if (recent.length === 0) return null;
        
        const avgLevel = recent.reduce((sum, data) => sum + data.level, 0) / recent.length;
        const mostCommonDirection = this.getMostCommonDirection(recent);
        
        return {
            level: Math.round(avgLevel),
            direction: mostCommonDirection,
            objectCount: recent[recent.length - 1]?.objectCount || 0
        };
    }

    getMostCommonDirection(motionData) {
        const directions = {};
        for (const data of motionData) {
            directions[data.direction] = (directions[data.direction] || 0) + 1;
        }
        
        return Object.keys(directions).reduce((a, b) => 
            directions[a] > directions[b] ? a : b
        );
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if on tourist dashboard
    if (document.querySelector('.tourist-dashboard')) {
        const cameraCapture = new CameraMovementCapture();
        console.log('Camera movement capture system initialized');
        
        // Make globally accessible
        window.CameraMovementCapture = cameraCapture;
    }
});

// Export for external use
window.CameraMovementCapture = CameraMovementCapture;
window.MotionDetector = MotionDetector;
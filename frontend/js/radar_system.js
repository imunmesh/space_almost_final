/**
 * Advanced Radar System for Space Obstacle Detection and Tracking
 * Integrates with ML tracking backend for real-time threat assessment
 */

class RadarSystem {
    constructor() {
        this.isActive = false;
        this.canvas = null;
        this.ctx = null;
        this.radarData = {
            obstacles: [],
            debris: [],
            spacecraft: { x: 0, y: 0, heading: 0 },
            range: 1000, // km
            sweepAngle: 0,
            lastUpdate: Date.now()
        };
        this.trackingHistory = new Map();
        this.webSocket = null;
        this.alertSystem = new RadarAlertSystem();
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.connectToMLTracking();
        this.bindEvents();
        console.log('Radar System initialized');
    }

    setupCanvas() {
        this.canvas = document.getElementById('radarCanvas');
        if (!this.canvas) {
            // Create radar canvas if it doesn't exist
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'radarCanvas';
            this.canvas.width = 400;
            this.canvas.height = 400;
            
            // Add to radar panel if it exists
            const radarPanel = document.querySelector('.radar-panel');
            if (radarPanel) {
                radarPanel.appendChild(this.canvas);
            }
        }
        
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = 400;
            this.canvas.height = 400;
        }
    }

    connectToMLTracking() {
        // Connect to ML tracking WebSocket
        try {
            this.webSocket = new WebSocket('ws://localhost:8000/api/tracking/ws/tracking');
            
            this.webSocket.onopen = () => {
                console.log('Connected to ML tracking system');
            };
            
            this.webSocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMLTrackingData(data);
            };
            
            this.webSocket.onclose = () => {
                console.log('ML tracking connection closed, attempting reconnect...');
                setTimeout(() => this.connectToMLTracking(), 5000);
            };
            
            this.webSocket.onerror = (error) => {
                console.error('ML tracking WebSocket error:', error);
            };
        } catch (error) {
            console.error('Failed to connect to ML tracking:', error);
            // Fallback to simulated data
            this.useSimulatedData();
        }
    }

    handleMLTrackingData(data) {
        if (data.type === 'tracking_update') {
            this.updateRadarData(data.data);
        } else if (data.type === 'high_risk_alert') {
            this.handleHighRiskAlert(data.data);
        }
    }

    updateRadarData(trackingData) {
        // Update obstacles from ML tracking data
        this.radarData.obstacles = [];
        this.radarData.debris = [];
        
        if (trackingData.predictions) {
            trackingData.predictions.forEach(prediction => {
                const obstacle = {
                    id: prediction.object_id,
                    x: Math.random() * 800 - 400, // Convert to radar coordinates
                    y: Math.random() * 800 - 400,
                    size: Math.random() * 20 + 5,
                    velocity: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 },
                    risk: prediction.risk,
                    type: prediction.risk > 0.5 ? 'threat' : 'debris',
                    timeToApproach: prediction.time_to_approach,
                    recommendedAction: prediction.recommended_action,
                    isTracked: true,
                    timestamp: Date.now()
                };
                
                if (prediction.risk > 0.3) {
                    this.radarData.obstacles.push(obstacle);
                } else {
                    this.radarData.debris.push(obstacle);
                }
                
                // Update tracking history
                this.updateTrackingHistory(obstacle);
            });
        }
        
        this.radarData.lastUpdate = Date.now();
    }

    handleHighRiskAlert(alertData) {
        alertData.forEach(alert => {
            this.alertSystem.triggerAlert({
                id: alert.object_id,
                type: 'COLLISION_WARNING',
                risk: alert.risk,
                timeToApproach: alert.time_to_approach,
                recommendedAction: alert.recommended_action,
                message: `High collision risk detected! Object ${alert.object_id} - Risk: ${(alert.risk * 100).toFixed(1)}%`
            });
        });
    }

    useSimulatedData() {
        // Fallback to simulated radar data
        setInterval(() => {
            this.generateSimulatedRadarData();
        }, 2000);
    }

    generateSimulatedRadarData() {
        // Generate realistic simulated radar data
        this.radarData.obstacles = [];
        this.radarData.debris = [];
        
        // Generate obstacles
        for (let i = 0; i < 8; i++) {
            const angle = (Math.random() * 360) * (Math.PI / 180);
            const distance = Math.random() * 800 + 100;
            
            const obstacle = {
                id: `sim_obstacle_${i}`,
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                size: Math.random() * 15 + 8,
                velocity: {
                    x: Math.random() * 2 - 1,
                    y: Math.random() * 2 - 1
                },
                risk: Math.random(),
                type: Math.random() > 0.7 ? 'threat' : 'debris',
                timeToApproach: Math.random() * 300 + 60, // 1-5 minutes
                isTracked: true,
                timestamp: Date.now()
            };
            
            if (obstacle.risk > 0.3) {
                this.radarData.obstacles.push(obstacle);
            } else {
                this.radarData.debris.push(obstacle);
            }
            
            this.updateTrackingHistory(obstacle);
        }
        
        this.radarData.lastUpdate = Date.now();
    }

    updateTrackingHistory(obstacle) {
        if (!this.trackingHistory.has(obstacle.id)) {
            this.trackingHistory.set(obstacle.id, []);
        }
        
        const history = this.trackingHistory.get(obstacle.id);
        history.push({
            x: obstacle.x,
            y: obstacle.y,
            timestamp: Date.now(),
            risk: obstacle.risk
        });
        
        // Keep only recent history (last 20 positions)
        if (history.length > 20) {
            history.shift();
        }
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        console.log('Radar system activated');
        
        // Start radar sweep animation
        this.startRadarSweep();
        
        // Start data generation if no WebSocket connection
        if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
            this.useSimulatedData();
        }
        
        this.updateUI();
    }

    stop() {
        this.isActive = false;
        console.log('Radar system deactivated');
        this.updateUI();
    }

    startRadarSweep() {
        if (!this.isActive) return;
        
        this.radarData.sweepAngle += 2; // degrees per frame
        if (this.radarData.sweepAngle >= 360) {
            this.radarData.sweepAngle = 0;
        }
        
        this.drawRadar();
        
        requestAnimationFrame(() => this.startRadarSweep());
    }

    drawRadar() {
        if (!this.ctx) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 20;
        
        // Clear canvas
        this.ctx.fillStyle = '#000015';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw radar grid
        this.drawRadarGrid(centerX, centerY, maxRadius);
        
        // Draw radar sweep
        this.drawRadarSweep(centerX, centerY, maxRadius);
        
        // Draw obstacles and debris
        this.drawObjects(centerX, centerY, maxRadius);
        
        // Draw tracking trails
        this.drawTrackingTrails(centerX, centerY, maxRadius);
        
        // Draw range rings
        this.drawRangeRings(centerX, centerY, maxRadius);
        
        // Draw radar info
        this.drawRadarInfo();
    }

    drawRadarGrid(centerX, centerY, maxRadius) {
        this.ctx.strokeStyle = '#00ff0033';
        this.ctx.lineWidth = 1;
        
        // Draw grid lines
        for (let i = 0; i <= 8; i++) {
            const x = (i / 8) * this.canvas.width;
            const y = (i / 8) * this.canvas.height;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Draw center cross
        this.ctx.strokeStyle = '#00ff0066';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 10, centerY);
        this.ctx.lineTo(centerX + 10, centerY);
        this.ctx.moveTo(centerX, centerY - 10);
        this.ctx.lineTo(centerX, centerY + 10);
        this.ctx.stroke();
    }

    drawRadarSweep(centerX, centerY, maxRadius) {
        const sweepAngleRad = (this.radarData.sweepAngle * Math.PI) / 180;
        
        // Draw sweep line
        this.ctx.strokeStyle = '#00ff00aa';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(
            centerX + Math.cos(sweepAngleRad) * maxRadius,
            centerY + Math.sin(sweepAngleRad) * maxRadius
        );
        this.ctx.stroke();
        
        // Draw sweep fade effect
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, maxRadius, sweepAngleRad - 0.5, sweepAngleRad);
        this.ctx.lineTo(centerX, centerY);
        this.ctx.fill();
    }

    drawObjects(centerX, centerY, maxRadius) {
        const scale = maxRadius / this.radarData.range;
        
        // Draw obstacles (high risk)
        this.radarData.obstacles.forEach(obstacle => {
            const x = centerX + obstacle.x * scale;
            const y = centerY + obstacle.y * scale;
            
            // Color based on risk level
            let color = '#ff0000'; // High risk - red
            if (obstacle.risk < 0.5) color = '#ffaa00'; // Medium risk - orange
            if (obstacle.risk < 0.3) color = '#ffff00'; // Low risk - yellow
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, obstacle.size * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw risk indicator
            if (obstacle.risk > 0.5) {
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(x, y, obstacle.size * 0.8, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            // Draw velocity vector
            if (obstacle.velocity) {
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(
                    x + obstacle.velocity.x * 20,
                    y + obstacle.velocity.y * 20
                );
                this.ctx.stroke();
            }
        });
        
        // Draw debris (lower risk)
        this.radarData.debris.forEach(debris => {
            const x = centerX + debris.x * scale;
            const y = centerY + debris.y * scale;
            
            this.ctx.fillStyle = '#00aa00aa'; // Green for debris
            this.ctx.beginPath();
            this.ctx.arc(x, y, debris.size * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawTrackingTrails(centerX, centerY, maxRadius) {
        const scale = maxRadius / this.radarData.range;
        
        this.trackingHistory.forEach((history, objectId) => {
            if (history.length < 2) return;
            
            this.ctx.strokeStyle = '#00ff0044';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            
            for (let i = 0; i < history.length - 1; i++) {
                const current = history[i];
                const next = history[i + 1];
                
                const x1 = centerX + current.x * scale;
                const y1 = centerY + current.y * scale;
                const x2 = centerX + next.x * scale;
                const y2 = centerY + next.y * scale;
                
                if (i === 0) {
                    this.ctx.moveTo(x1, y1);
                }
                this.ctx.lineTo(x2, y2);
            }
            
            this.ctx.stroke();
        });
    }

    drawRangeRings(centerX, centerY, maxRadius) {
        this.ctx.strokeStyle = '#00ff0033';
        this.ctx.lineWidth = 1;
        
        // Draw range rings at 25%, 50%, 75%, 100%
        for (let i = 1; i <= 4; i++) {
            const radius = (maxRadius / 4) * i;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Draw range labels
            this.ctx.fillStyle = '#00ff0066';
            this.ctx.font = '10px monospace';
            this.ctx.fillText(
                `${(this.radarData.range / 4 * i).toFixed(0)}km`,
                centerX + radius - 20,
                centerY - 5
            );
        }
    }

    drawRadarInfo() {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        
        // Draw radar status
        this.ctx.fillText(`RADAR ${this.isActive ? 'ACTIVE' : 'STANDBY'}`, 10, 20);
        this.ctx.fillText(`Range: ${this.radarData.range}km`, 10, 35);
        this.ctx.fillText(`Objects: ${this.radarData.obstacles.length + this.radarData.debris.length}`, 10, 50);
        this.ctx.fillText(`Threats: ${this.radarData.obstacles.length}`, 10, 65);
        
        // Draw sweep angle
        this.ctx.fillText(`Sweep: ${this.radarData.sweepAngle.toFixed(1)}°`, 10, 385);
    }

    bindEvents() {
        // Range adjustment controls
        document.addEventListener('keydown', (event) => {
            if (!this.isActive) return;
            
            switch (event.key) {
                case '=':
                case '+':
                    this.adjustRange(0.8); // Zoom in
                    break;
                case '-':
                    this.adjustRange(1.2); // Zoom out
                    break;
                case 'r':
                case 'R':
                    this.resetRadar();
                    break;
            }
        });
    }

    adjustRange(factor) {
        this.radarData.range = Math.max(100, Math.min(5000, this.radarData.range * factor));
        console.log(`Radar range adjusted to ${this.radarData.range}km`);
    }

    resetRadar() {
        this.radarData.range = 1000;
        this.radarData.sweepAngle = 0;
        this.trackingHistory.clear();
        console.log('Radar system reset');
    }

    updateUI() {
        // Update radar status in UI
        const statusEl = document.getElementById('radarStatus');
        if (statusEl) {
            statusEl.textContent = this.isActive ? 'Active' : 'Standby';
            statusEl.className = `radar-status ${this.isActive ? 'active' : 'standby'}`;
        }
        
        const rangeEl = document.getElementById('radarRange');
        if (rangeEl) {
            rangeEl.textContent = `${this.radarData.range}km`;
        }
        
        const objectCountEl = document.getElementById('radarObjectCount');
        if (objectCountEl) {
            objectCountEl.textContent = this.radarData.obstacles.length + this.radarData.debris.length;
        }
        
        const threatCountEl = document.getElementById('radarThreatCount');
        if (threatCountEl) {
            threatCountEl.textContent = this.radarData.obstacles.length;
        }
    }

    getRadarData() {
        return {
            isActive: this.isActive,
            range: this.radarData.range,
            objectCount: this.radarData.obstacles.length + this.radarData.debris.length,
            threatCount: this.radarData.obstacles.length,
            obstacles: this.radarData.obstacles,
            debris: this.radarData.debris,
            lastUpdate: this.radarData.lastUpdate
        };
    }
}

// Radar Alert System
class RadarAlertSystem {
    constructor() {
        this.activeAlerts = new Map();
        this.alertQueue = [];
    }

    triggerAlert(alert) {
        console.log('Radar Alert:', alert.message);
        
        this.activeAlerts.set(alert.id, {
            ...alert,
            timestamp: Date.now(),
            acknowledged: false
        });
        
        // Trigger UI notifications
        this.showAlertNotification(alert);
        
        // Trigger vibration if supported
        this.triggerVibration(alert);
        
        // Play alert sound
        this.playAlertSound(alert);
    }

    showAlertNotification(alert) {
        // Create alert notification element
        const notification = document.createElement('div');
        notification.className = `radar-alert alert-${alert.type.toLowerCase()}`;
        notification.innerHTML = `
            <div class="alert-header">
                <i class="fas fa-exclamation-triangle"></i>
                <span class="alert-title">RADAR ALERT</span>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="alert-message">${alert.message}</div>
            <div class="alert-actions">
                <button class="alert-btn" onclick="radarSystem.acknowledgeAlert('${alert.id}')">Acknowledge</button>
                <button class="alert-btn" onclick="radarSystem.trackObject('${alert.id}')">Track Object</button>
            </div>
        `;
        
        // Add to alert container
        let alertContainer = document.getElementById('radarAlertContainer');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'radarAlertContainer';
            alertContainer.className = 'radar-alert-container';
            document.body.appendChild(alertContainer);
        }
        
        alertContainer.appendChild(notification);
        
        // Auto-remove after 10 seconds if not acknowledged
        setTimeout(() => {
            if (notification.parentElement && !this.activeAlerts.get(alert.id)?.acknowledged) {
                notification.remove();
            }
        }, 10000);
    }

    triggerVibration(alert) {
        if ('vibrate' in navigator) {
            // Vibration pattern based on alert type
            let pattern = [200, 100, 200]; // Default pattern
            
            switch (alert.type) {
                case 'COLLISION_WARNING':
                    pattern = [500, 200, 500, 200, 500]; // Urgent pattern
                    break;
                case 'PROXIMITY_ALERT':
                    pattern = [300, 100, 300]; // Medium pattern
                    break;
            }
            
            navigator.vibrate(pattern);
        }
    }

    playAlertSound(alert) {
        // Create audio context for alert sounds
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Generate alert tone based on alert type
            let frequency = 800; // Default frequency
            let duration = 0.5; // Default duration
            
            switch (alert.type) {
                case 'COLLISION_WARNING':
                    frequency = 1000;
                    duration = 1.0;
                    break;
                case 'PROXIMITY_ALERT':
                    frequency = 600;
                    duration = 0.3;
                    break;
            }
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            console.log('Audio alert not available:', error);
        }
    }

    acknowledgeAlert(alertId) {
        if (this.activeAlerts.has(alertId)) {
            const alert = this.activeAlerts.get(alertId);
            alert.acknowledged = true;
            console.log(`Alert ${alertId} acknowledged`);
        }
    }

    clearAlert(alertId) {
        this.activeAlerts.delete(alertId);
    }

    getActiveAlerts() {
        return Array.from(this.activeAlerts.values());
    }
}

// Initialize radar system
window.radarSystem = new RadarSystem();

// Expose methods for UI interaction
window.acknowledgeRadarAlert = (alertId) => {
    window.radarSystem.alertSystem.acknowledgeAlert(alertId);
};

window.trackRadarObject = (objectId) => {
    console.log(`Tracking object: ${objectId}`);
    // Implementation for object tracking
};

console.log('Radar System loaded successfully');
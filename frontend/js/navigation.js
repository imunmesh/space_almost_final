// Navigation and Radar System Module
class NavigationSystem {
    constructor() {
        this.baseURL = 'http://localhost:8000';
        this.canvas = null;
        this.ctx = null;
        this.spacecraft = { x: 0, y: 0, z: 0 };
        this.obstacles = [];
        this.radarScale = 100; // km radius
        this.updateInterval = null;
        this.animationFrame = null;
        this.sweepAngle = 0;
    }

    init() {
        this.setupRadarCanvas();
        this.startUpdates();
        this.animate();
    }

    setupRadarCanvas() {
        this.canvas = document.getElementById('radarCanvas');
        if (!this.canvas) {
            console.error('Radar canvas not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Handle canvas resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, container.clientHeight) * 0.9;
        
        this.canvas.width = size;
        this.canvas.height = size;
        
        // Update canvas style size
        this.canvas.style.width = `${size}px`;
        this.canvas.style.height = `${size}px`;
    }

    startUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        // Update navigation data every 10 seconds
        this.updateInterval = setInterval(() => {
            this.fetchNavigationData();
        }, 10000);

        // Initial fetch
        this.fetchNavigationData();
    }

    async fetchNavigationData() {
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            return;
        }

        try {
            const response = await window.authManager.makeAuthenticatedRequest(
                `${this.baseURL}/navigation/navigation-data`
            );

            if (response.ok) {
                const data = await response.json();
                this.updateNavigationData(data);
            }
        } catch (error) {
            console.error('Error fetching navigation data:', error);
        }
    }

    updateNavigationData(data) {
        // Update spacecraft position
        this.spacecraft = data.spacecraft_position;
        this.updateSpacecraftDisplay(data.spacecraft_position);

        // Update obstacles
        this.obstacles = data.obstacles || [];
        this.updateObstacleDisplay(data.obstacles);

        // Update fuel level
        this.updateFuelLevel(data.fuel_level);

        // Draw radar
        this.drawRadar();
    }

    updateSpacecraftDisplay(position) {
        const positionElement = document.getElementById('spacecraftPosition');
        if (positionElement) {
            positionElement.textContent = 
                `${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)} km`;
        }

        const velocityElement = document.getElementById('spacecraftVelocity');
        if (velocityElement) {
            const speed = Math.sqrt(
                position.velocity_x ** 2 + 
                position.velocity_y ** 2 + 
                position.velocity_z ** 2
            );
            velocityElement.textContent = `${speed.toFixed(2)} km/s`;
        }
    }

    updateObstacleDisplay(obstacles) {
        const obstacleCountElement = document.getElementById('obstacleCount');
        if (obstacleCountElement) {
            obstacleCountElement.textContent = `${obstacles.length} detected`;
        }
    }

    updateFuelLevel(fuelLevel) {
        const fuelElement = document.getElementById('fuelLevel');
        if (fuelElement) {
            fuelElement.textContent = `${fuelLevel.toFixed(1)}%`;
            
            // Update fuel color based on level
            if (fuelLevel < 20) {
                fuelElement.style.color = 'var(--critical-red)';
            } else if (fuelLevel < 40) {
                fuelElement.style.color = 'var(--warning-yellow)';
            } else {
                fuelElement.style.color = 'var(--plasma-green)';
            }
        }
    }

    drawRadar() {
        if (!this.ctx || !this.canvas) return;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw radar background
        this.drawRadarBackground(centerX, centerY, radius);

        // Draw obstacles
        this.drawObstacles(centerX, centerY, radius);

        // Draw spacecraft (always at center)
        this.drawSpacecraft(centerX, centerY);

        // Draw range rings with labels
        this.drawRangeRings(centerX, centerY, radius);
    }

    drawRadarBackground(centerX, centerY, radius) {
        // Background circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(0, 255, 136, 0.05)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Grid lines
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
        this.ctx.lineWidth = 1;

        // Horizontal and vertical lines
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - radius, centerY);
        this.ctx.lineTo(centerX + radius, centerY);
        this.ctx.moveTo(centerX, centerY - radius);
        this.ctx.lineTo(centerX, centerY + radius);
        this.ctx.stroke();

        // Diagonal lines
        this.ctx.beginPath();
        const diag = radius * 0.707; // cos(45°)
        this.ctx.moveTo(centerX - diag, centerY - diag);
        this.ctx.lineTo(centerX + diag, centerY + diag);
        this.ctx.moveTo(centerX - diag, centerY + diag);
        this.ctx.lineTo(centerX + diag, centerY - diag);
        this.ctx.stroke();
    }

    drawRangeRings(centerX, centerY, radius) {
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.font = '10px Orbitron, monospace';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';

        // Draw 3 range rings
        for (let i = 1; i <= 3; i++) {
            const ringRadius = (radius / 3) * i;
            const range = (this.radarScale / 3) * i;

            // Draw ring
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, ringRadius, 0, 2 * Math.PI);
            this.ctx.stroke();

            // Draw range label
            this.ctx.fillText(
                `${range.toFixed(0)}km`,
                centerX + ringRadius + 5,
                centerY - 5
            );
        }
    }

    drawObstacles(centerX, centerY, radius) {
        this.obstacles.forEach(obstacle => {
            const relativeX = obstacle.position.x - this.spacecraft.x;
            const relativeY = obstacle.position.y - this.spacecraft.y;
            const distance = Math.sqrt(relativeX ** 2 + relativeY ** 2);

            // Only draw obstacles within radar range
            if (distance <= this.radarScale) {
                const scale = radius / this.radarScale;
                const obstacleX = centerX + relativeX * scale;
                const obstacleY = centerY - relativeY * scale; // Flip Y for screen coordinates

                // Draw obstacle
                this.drawObstacle(obstacleX, obstacleY, obstacle);
            }
        });
    }

    drawObstacle(x, y, obstacle) {
        const size = Math.max(3, Math.min(10, obstacle.size / 10)); // Scale size
        
        // Set color based on threat level and type
        let color = '#4CAF50'; // Default green
        
        switch (obstacle.threat_level) {
            case 'critical':
                color = '#f44336';
                break;
            case 'high':
                color = '#ff9800';
                break;
            case 'medium':
                color = '#ffeb3b';
                break;
            case 'low':
                color = '#4CAF50';
                break;
        }

        // Draw obstacle dot
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();

        // Add glow effect for high threat obstacles
        if (obstacle.threat_level === 'critical' || obstacle.threat_level === 'high') {
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }

        // Draw obstacle type icon
        this.ctx.fillStyle = 'white';
        this.ctx.font = '8px Arial';
        this.ctx.textAlign = 'center';
        
        let icon = '•';
        switch (obstacle.type) {
            case 'asteroid':
                icon = '◆';
                break;
            case 'debris':
                icon = '▲';
                break;
            case 'satellite':
                icon = '◯';
                break;
        }
        
        this.ctx.fillText(icon, x, y + 2);
        this.ctx.textAlign = 'left';

        // Draw predicted path (simplified)
        if (obstacle.predicted_path && obstacle.predicted_path.length > 0) {
            this.drawPredictedPath(x, y, obstacle.predicted_path);
        }
    }

    drawPredictedPath(startX, startY, path) {
        if (path.length < 2) return;

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 2]);

        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);

        // Draw first few points of predicted path
        const maxPoints = Math.min(3, path.length);
        const scale = (this.canvas.width / 2 - 10) / this.radarScale;

        for (let i = 0; i < maxPoints; i++) {
            const pathPoint = path[i];
            const relativeX = pathPoint.x - this.spacecraft.x;
            const relativeY = pathPoint.y - this.spacecraft.y;
            
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            const pathX = centerX + relativeX * scale;
            const pathY = centerY - relativeY * scale;
            
            this.ctx.lineTo(pathX, pathY);
        }

        this.ctx.stroke();
        this.ctx.setLineDash([]); // Reset line dash
    }

    drawSpacecraft(centerX, centerY) {
        // Draw spacecraft at center
        this.ctx.fillStyle = '#2196F3';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
        this.ctx.fill();

        // Add glow effect
        this.ctx.shadowColor = '#2196F3';
        this.ctx.shadowBlur = 15;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Draw heading indicator
        const headingRad = (this.spacecraft.heading || 0) * Math.PI / 180;
        const lineLength = 15;
        
        this.ctx.strokeStyle = '#2196F3';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(
            centerX + Math.cos(headingRad - Math.PI / 2) * lineLength,
            centerY + Math.sin(headingRad - Math.PI / 2) * lineLength
        );
        this.ctx.stroke();
    }

    animate() {
        // Update sweep angle for radar sweep animation
        this.sweepAngle += 2;
        if (this.sweepAngle >= 360) {
            this.sweepAngle = 0;
        }

        // Continue animation
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    // Utility methods
    screenToRadarCoords(screenX, screenY) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scale = this.radarScale / (Math.min(centerX, centerY) - 10);
        
        return {
            x: (screenX - centerX) * scale + this.spacecraft.x,
            y: -(screenY - centerY) * scale + this.spacecraft.y
        };
    }

    radarToScreenCoords(radarX, radarY) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scale = (Math.min(centerX, centerY) - 10) / this.radarScale;
        
        return {
            x: centerX + (radarX - this.spacecraft.x) * scale,
            y: centerY - (radarY - this.spacecraft.y) * scale
        };
    }

    // Public methods
    setRadarRange(range) {
        this.radarScale = range;
        this.drawRadar();
    }

    getObstacles() {
        return this.obstacles;
    }

    getSpacecraftPosition() {
        return this.spacecraft;
    }

    // Cleanup
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Add click handler for radar canvas
document.addEventListener('DOMContentLoaded', () => {
    const radarCanvas = document.getElementById('radarCanvas');
    if (radarCanvas) {
        radarCanvas.addEventListener('click', (event) => {
            // Handle radar clicks for future features (e.g., setting waypoints)
            const rect = radarCanvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            if (window.navigationSystem) {
                const radarCoords = window.navigationSystem.screenToRadarCoords(x, y);
                console.log('Clicked radar coordinates:', radarCoords);
                
                // Could be used for setting navigation waypoints in the future
            }
        });
    }
});

// Initialize navigation system
window.navigationSystem = new NavigationSystem();
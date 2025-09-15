/**
 * Interactive Space Map for Management Dashboard
 * Real-time positioning with orbital mechanics and threat visualization
 */

class SpaceMap {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isActive = false;
        
        // Map data
        this.mapData = {
            spacecraft: { lat: 0, lon: 0, alt: 408 },
            earth: { radius: 6371, rotation: 0 },
            objects: [],
            threats: [],
            zoom: 1.0,
            viewMode: '3d'
        };
        
        this.webSocket = null;
        this.updateInterval = null;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.connectToTracking();
        this.bindEvents();
        console.log('Space Map initialized');
    }

    setupCanvas() {
        this.canvas = document.getElementById('spaceMapCanvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'spaceMapCanvas';
            this.canvas.width = 600;
            this.canvas.height = 400;
            
            const mapPanel = document.querySelector('.space-map-panel');
            if (mapPanel) {
                mapPanel.appendChild(this.canvas);
            }
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.createControls();
    }

    createControls() {
        const controls = document.createElement('div');
        controls.className = 'space-map-controls';
        controls.innerHTML = `
            <select id="mapViewMode">
                <option value="3d">3D Orbital</option>
                <option value="2d">Ground Track</option>
            </select>
            <input type="range" id="mapZoom" min="0.5" max="3" step="0.1" value="1">
            <div class="map-info">
                Position: <span id="spacecraftPos">Loading...</span><br>
                Threats: <span id="threatCount">0</span>
            </div>
        `;
        
        this.canvas.parentElement.appendChild(controls);
        
        document.getElementById('mapViewMode').addEventListener('change', (e) => {
            this.mapData.viewMode = e.target.value;
            this.redraw();
        });
        
        document.getElementById('mapZoom').addEventListener('input', (e) => {
            this.mapData.zoom = parseFloat(e.target.value);
            this.redraw();
        });
    }

    connectToTracking() {
        try {
            this.webSocket = new WebSocket('ws://localhost:8000/api/tracking/ws/tracking');
            
            this.webSocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleTrackingUpdate(data);
            };
            
            this.webSocket.onclose = () => {
                this.useSimulatedData();
            };
        } catch (error) {
            this.useSimulatedData();
        }
    }

    handleTrackingUpdate(data) {
        if (data.type === 'tracking_update') {
            this.mapData.objects = [];
            this.mapData.threats = [];
            
            if (data.data.predictions) {
                data.data.predictions.forEach(prediction => {
                    const obj = {
                        id: prediction.object_id,
                        lat: Math.random() * 180 - 90,
                        lon: Math.random() * 360 - 180,
                        alt: 200 + Math.random() * 600,
                        risk: prediction.risk,
                        size: Math.random() * 10 + 2
                    };
                    
                    this.mapData.objects.push(obj);
                    if (obj.risk > 0.3) {
                        this.mapData.threats.push(obj);
                    }
                });
            }
        }
    }

    useSimulatedData() {
        setInterval(() => {
            // Update spacecraft position (orbital motion)
            const time = Date.now() / 10000;
            this.mapData.spacecraft.lat = Math.sin(time) * 51.6;
            this.mapData.spacecraft.lon = (time * 360 / (Math.PI * 2)) % 360 - 180;
            
            // Generate objects
            this.mapData.objects = [];
            this.mapData.threats = [];
            
            for (let i = 0; i < 15; i++) {
                const obj = {
                    id: `obj_${i}`,
                    lat: Math.random() * 180 - 90,
                    lon: Math.random() * 360 - 180,
                    alt: Math.random() * 500 + 200,
                    risk: Math.random(),
                    size: Math.random() * 10 + 2
                };
                
                this.mapData.objects.push(obj);
                if (obj.risk > 0.3) {
                    this.mapData.threats.push(obj);
                }
            }
            
            this.updateUI();
        }, 2000);
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        console.log('Space Map activated');
        
        this.updateInterval = setInterval(() => {
            this.redraw();
        }, 1000);
        
        if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
            this.useSimulatedData();
        }
        
        this.updateUI();
    }

    stop() {
        this.isActive = false;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('Space Map deactivated');
    }

    redraw() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.fillStyle = '#000015';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.mapData.viewMode === '3d') {
            this.draw3DView();
        } else {
            this.draw2DView();
        }
        
        this.drawLegend();
    }

    draw3DView() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const earthRadius = 80 * this.mapData.zoom;
        
        // Draw Earth
        const gradient = this.ctx.createRadialGradient(
            centerX - earthRadius * 0.3, centerY - earthRadius * 0.3, 0,
            centerX, centerY, earthRadius
        );
        gradient.addColorStop(0, '#4a90e2');
        gradient.addColorStop(1, '#1a3a5c');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw spacecraft
        const spacecraftRadius = earthRadius + 30;
        const lat = this.mapData.spacecraft.lat * (Math.PI / 180);
        const lon = this.mapData.spacecraft.lon * (Math.PI / 180);
        
        const x = centerX + spacecraftRadius * Math.cos(lat) * Math.cos(lon);
        const y = centerY - spacecraftRadius * Math.sin(lat);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw objects
        this.mapData.objects.forEach(obj => {
            const objRadius = earthRadius + (obj.alt / 6371) * earthRadius;
            const objLat = obj.lat * (Math.PI / 180);
            const objLon = obj.lon * (Math.PI / 180);
            
            const objX = centerX + objRadius * Math.cos(objLat) * Math.cos(objLon);
            const objY = centerY - objRadius * Math.sin(objLat);
            
            let color = '#00aa00';
            if (obj.risk > 0.7) color = '#ff0000';
            else if (obj.risk > 0.5) color = '#ff6600';
            else if (obj.risk > 0.3) color = '#ffaa00';
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(objX, objY, obj.size * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw orbit
        this.ctx.strokeStyle = '#00ff0044';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(centerX, centerY, spacecraftRadius, spacecraftRadius * 0.8, 0, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    draw2DView() {
        // Draw world map grid
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        // Latitude lines
        for (let lat = -90; lat <= 90; lat += 30) {
            const y = this.canvas.height / 2 - (lat / 90) * (this.canvas.height / 2);
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Longitude lines
        for (let lon = -180; lon <= 180; lon += 60) {
            const x = (lon + 180) / 360 * this.canvas.width;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw spacecraft
        const scX = (this.mapData.spacecraft.lon + 180) / 360 * this.canvas.width;
        const scY = this.canvas.height / 2 - (this.mapData.spacecraft.lat / 90) * (this.canvas.height / 2);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.arc(scX, scY, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw objects
        this.mapData.objects.forEach(obj => {
            const objX = (obj.lon + 180) / 360 * this.canvas.width;
            const objY = this.canvas.height / 2 - (obj.lat / 90) * (this.canvas.height / 2);
            
            let color = '#00aa00';
            if (obj.risk > 0.7) color = '#ff0000';
            else if (obj.risk > 0.5) color = '#ff6600';
            else if (obj.risk > 0.3) color = '#ffaa00';
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(objX, objY, obj.size * 0.2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawLegend() {
        const legendX = this.canvas.width - 120;
        const legendY = 20;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(legendX - 10, legendY - 10, 110, 80);
        
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Legend', legendX, legendY + 5);
        
        const items = [
            { color: '#00ff00', label: 'Spacecraft' },
            { color: '#ff0000', label: 'High Risk' },
            { color: '#ff6600', label: 'Med Risk' },
            { color: '#00aa00', label: 'Low Risk' }
        ];
        
        items.forEach((item, index) => {
            const y = legendY + 15 + index * 12;
            this.ctx.fillStyle = item.color;
            this.ctx.fillRect(legendX, y - 4, 8, 8);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(item.label, legendX + 12, y + 2);
        });
    }

    bindEvents() {
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.mapData.zoom = Math.max(0.5, Math.min(3, this.mapData.zoom * zoomFactor));
            this.redraw();
        });
    }

    updateUI() {
        const posEl = document.getElementById('spacecraftPos');
        if (posEl) {
            posEl.textContent = `${this.mapData.spacecraft.lat.toFixed(1)}°, ${this.mapData.spacecraft.lon.toFixed(1)}°`;
        }
        
        const threatEl = document.getElementById('threatCount');
        if (threatEl) {
            threatEl.textContent = this.mapData.threats.length;
        }
    }

    getMapData() {
        return {
            isActive: this.isActive,
            spacecraft: this.mapData.spacecraft,
            objectCount: this.mapData.objects.length,
            threatCount: this.mapData.threats.length,
            viewMode: this.mapData.viewMode,
            zoom: this.mapData.zoom
        };
    }
}

// Initialize space map
window.spaceMap = new SpaceMap();

console.log('Space Map system loaded successfully');
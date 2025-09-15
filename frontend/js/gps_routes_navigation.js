/**
 * GPS Routes Map with AI Sensor Integration for Navigation Guide
 * Advanced navigation system with real-time routing and AI-powered waypoint optimization
 */

class GPSRoutesMap {
    constructor() {
        this.map = null;
        this.currentPosition = null;
        this.destination = null;
        this.route = null;
        this.waypoints = [];
        this.aiSensors = new NavigationAISensors();
        this.routeOptimizer = new AIRouteOptimizer();
        this.isTracking = false;
        this.routeHistory = [];
        
        // Route preferences
        this.preferences = {
            avoidDebris: true,
            optimizeForFuel: true,
            minimizeRadiation: true,
            preferSafeZones: true
        };
        
        this.init();
    }

    init() {
        this.createMapContainer();
        this.initializeMap();
        this.bindEvents();
        this.startAISensors();
        console.log('GPS Routes Map with AI Navigation initialized');
    }

    createMapContainer() {
        // Create map container if it doesn't exist
        let mapContainer = document.getElementById('gpsRoutesContainer');
        if (!mapContainer) {
            mapContainer = document.createElement('div');
            mapContainer.id = 'gpsRoutesContainer';
            mapContainer.className = 'gps-routes-container';
            
            // Add to navigation panel
            const navPanel = document.querySelector('.nav-guide-panel');
            if (navPanel) {
                navPanel.appendChild(mapContainer);
            }
        }
        
        mapContainer.innerHTML = `
            <div class="gps-map-header">
                <h3><i class="fas fa-route"></i> AI Navigation System</h3>
                <div class="gps-status">
                    <span class="gps-signal" id="gpsSignal">
                        <i class="fas fa-satellite-dish"></i>
                        <span>GPS Active</span>
                    </span>
                    <span class="ai-status" id="aiNavStatus">
                        <i class="fas fa-brain"></i>
                        <span>AI Optimizing</span>
                    </span>
                </div>
            </div>
            
            <div class="map-canvas-container">
                <canvas id="gpsMapCanvas" width="400" height="300"></canvas>
                <div class="map-overlay">
                    <div class="current-route" id="currentRouteInfo">
                        <span class="route-distance">Distance: <span id="routeDistance">--</span></span>
                        <span class="route-time">ETA: <span id="routeETA">--</span></span>
                        <span class="route-fuel">Fuel: <span id="routeFuel">--</span></span>
                    </div>
                </div>
            </div>
            
            <div class="navigation-controls">
                <div class="destination-input">
                    <input type="text" id="destinationInput" placeholder="Enter destination coordinates or landmark">
                    <button id="calculateRouteBtn" class="nav-btn">
                        <i class="fas fa-route"></i>
                        Calculate Route
                    </button>
                </div>
                
                <div class="route-options">
                    <label class="route-option">
                        <input type="checkbox" id="avoidDebris" checked>
                        <span>Avoid Debris Fields</span>
                    </label>
                    <label class="route-option">
                        <input type="checkbox" id="optimizeFuel" checked>
                        <span>Optimize for Fuel</span>
                    </label>
                    <label class="route-option">
                        <input type="checkbox" id="minimizeRadiation" checked>
                        <span>Minimize Radiation</span>
                    </label>
                </div>
                
                <div class="quick-destinations">
                    <button class="dest-btn" data-dest="iss">ISS</button>
                    <button class="dest-btn" data-dest="moon">Moon</button>
                    <button class="dest-btn" data-dest="l1">L1 Point</button>
                    <button class="dest-btn" data-dest="earth">Earth Return</button>
                </div>
            </div>
            
            <div class="ai-recommendations" id="aiRecommendations">
                <h4><i class="fas fa-lightbulb"></i> AI Recommendations</h4>
                <div class="recommendations-list" id="recommendationsList">
                    <div class="recommendation-item">
                        Analyzing optimal route...
                    </div>
                </div>
            </div>
        `;
        
        this.mapContainer = mapContainer;
    }

    initializeMap() {
        this.canvas = document.getElementById('gpsMapCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set initial position (Earth orbit)
        this.currentPosition = {
            x: 0,
            y: 0,
            z: 408, // km altitude
            lat: 0,
            lon: 0,
            heading: 0,
            velocity: 7.66 // km/s
        };
        
        // Start rendering loop
        this.startRenderLoop();
    }

    startRenderLoop() {
        const render = () => {
            this.updatePosition();
            this.drawMap();
            if (this.isTracking) {
                requestAnimationFrame(render);
            }
        };
        
        this.isTracking = true;
        render();
    }

    updatePosition() {
        // Update spacecraft position based on orbital mechanics
        const time = Date.now() / 1000;
        const orbitalPeriod = 92.68 * 60; // ISS orbital period in seconds
        const meanAnomaly = (2 * Math.PI * time) / orbitalPeriod;
        
        // Update position
        this.currentPosition.lat = Math.sin(meanAnomaly) * 51.6; // ISS inclination
        this.currentPosition.lon = (time * 360 / orbitalPeriod) % 360 - 180;
        this.currentPosition.x = this.currentPosition.lon;
        this.currentPosition.y = this.currentPosition.lat;
        
        // Update UI
        this.updatePositionUI();
        
        // Check for route updates
        if (this.route) {
            this.updateRouteProgress();
        }
    }

    drawMap() {
        // Clear canvas
        this.ctx.fillStyle = '#000015';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw coordinate grid
        this.drawGrid();
        
        // Draw Earth
        this.drawEarth();
        
        // Draw current position
        this.drawCurrentPosition();
        
        // Draw route if exists
        if (this.route) {
            this.drawRoute();
        }
        
        // Draw waypoints
        this.drawWaypoints();
        
        // Draw AI sensor data
        this.drawAISensorData();
        
        // Draw hazards and safe zones
        this.drawHazards();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        // Longitude lines
        for (let lon = -180; lon <= 180; lon += 60) {
            const x = (lon + 180) / 360 * this.canvas.width;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Latitude lines
        for (let lat = -90; lat <= 90; lat += 30) {
            const y = this.canvas.height / 2 - (lat / 90) * (this.canvas.height / 2);
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawEarth() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const earthRadius = 40;
        
        // Earth sphere
        const gradient = this.ctx.createRadialGradient(
            centerX - 10, centerY - 10, 0,
            centerX, centerY, earthRadius
        );
        gradient.addColorStop(0, '#4a90e2');
        gradient.addColorStop(1, '#1a3a5c');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Atmosphere
        this.ctx.strokeStyle = '#6bb6ff44';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, earthRadius + 5, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawCurrentPosition() {
        const x = (this.currentPosition.lon + 180) / 360 * this.canvas.width;
        const y = this.canvas.height / 2 - (this.currentPosition.lat / 90) * (this.canvas.height / 2);
        
        // Spacecraft icon
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Direction indicator
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        const headingRad = this.currentPosition.heading * Math.PI / 180;
        this.ctx.lineTo(x + Math.cos(headingRad) * 15, y + Math.sin(headingRad) * 15);
        this.ctx.stroke();
        
        // Position label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Arial';
        this.ctx.fillText('🛰️', x - 6, y + 20);
    }

    drawRoute() {
        if (!this.route || this.route.length < 2) return;
        
        this.ctx.strokeStyle = '#ffaa00';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        for (let i = 0; i < this.route.length; i++) {
            const point = this.route[i];
            const x = (point.lon + 180) / 360 * this.canvas.width;
            const y = this.canvas.height / 2 - (point.lat / 90) * (this.canvas.height / 2);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
        
        // Draw destination
        const dest = this.route[this.route.length - 1];
        const destX = (dest.lon + 180) / 360 * this.canvas.width;
        const destY = this.canvas.height / 2 - (dest.lat / 90) * (this.canvas.height / 2);
        
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.beginPath();
        this.ctx.arc(destX, destY, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('🎯', destX - 6, destY + 4);
    }

    drawWaypoints() {
        this.waypoints.forEach((waypoint, index) => {
            const x = (waypoint.lon + 180) / 360 * this.canvas.width;
            const y = this.canvas.height / 2 - (waypoint.lat / 90) * (this.canvas.height / 2);
            
            this.ctx.fillStyle = '#00aaff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Waypoint number
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '8px Arial';
            this.ctx.fillText((index + 1).toString(), x - 2, y + 2);
        });
    }

    drawAISensorData() {
        // Draw AI-detected obstacles and opportunities
        const sensorData = this.aiSensors.getSensorData();
        
        sensorData.obstacles.forEach(obstacle => {
            const x = (obstacle.lon + 180) / 360 * this.canvas.width;
            const y = this.canvas.height / 2 - (obstacle.lat / 90) * (this.canvas.height / 2);
            
            this.ctx.fillStyle = '#ff4444';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        sensorData.opportunities.forEach(opportunity => {
            const x = (opportunity.lon + 180) / 360 * this.canvas.width;
            const y = this.canvas.height / 2 - (opportunity.lat / 90) * (this.canvas.height / 2);
            
            this.ctx.fillStyle = '#44ff44';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawHazards() {
        // Draw radiation zones
        this.ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(100, 100, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw safe zones
        this.ctx.fillStyle = 'rgba(100, 255, 100, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(300, 200, 40, 0, Math.PI * 2);
        this.ctx.fill();
    }

    calculateRoute(destination) {
        // Use AI route optimizer to calculate optimal path
        const routeRequest = {
            start: this.currentPosition,
            end: destination,
            preferences: this.preferences,
            constraints: {
                maxDistance: 50000, // km
                maxTime: 24 * 60, // minutes
                fuelLimit: 1000 // arbitrary units
            }
        };
        
        this.route = this.routeOptimizer.calculateOptimalRoute(routeRequest);
        this.destination = destination;
        
        // Update UI
        this.updateRouteInfo();
        
        // Generate AI recommendations
        this.generateAIRecommendations();
    }

    updateRouteInfo() {
        if (!this.route) return;
        
        const distance = this.calculateRouteDistance();
        const eta = this.calculateETA();
        const fuel = this.calculateFuelRequirement();
        
        document.getElementById('routeDistance').textContent = `${distance.toFixed(1)} km`;
        document.getElementById('routeETA').textContent = `${eta.toFixed(1)} min`;
        document.getElementById('routeFuel').textContent = `${fuel.toFixed(1)}%`;
    }

    calculateRouteDistance() {
        if (!this.route || this.route.length < 2) return 0;
        
        let totalDistance = 0;
        for (let i = 1; i < this.route.length; i++) {
            const prev = this.route[i - 1];
            const curr = this.route[i];
            totalDistance += this.calculateDistance(prev, curr);
        }
        
        return totalDistance;
    }

    calculateDistance(point1, point2) {
        // Simplified distance calculation
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const dz = (point2.z || 0) - (point1.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    calculateETA() {
        const distance = this.calculateRouteDistance();
        const averageSpeed = 7.66; // km/s
        return (distance / averageSpeed) / 60; // minutes
    }

    calculateFuelRequirement() {
        const distance = this.calculateRouteDistance();
        const efficiency = 0.1; // km per fuel unit
        return (distance * efficiency);
    }

    updateRouteProgress() {
        // Calculate progress along current route
        if (!this.route || this.route.length === 0) return;
        
        // Find closest point on route
        let closestDistance = Infinity;
        let closestIndex = 0;
        
        for (let i = 0; i < this.route.length; i++) {
            const distance = this.calculateDistance(this.currentPosition, this.route[i]);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
            }
        }
        
        // Update progress in UI
        const progress = (closestIndex / (this.route.length - 1)) * 100;
        // Could display progress bar here
    }

    generateAIRecommendations() {
        const recommendations = this.routeOptimizer.generateRecommendations(
            this.currentPosition,
            this.route,
            this.preferences
        );
        
        const recommendationsList = document.getElementById('recommendationsList');
        recommendationsList.innerHTML = '';
        
        recommendations.forEach(rec => {
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            item.innerHTML = `
                <div class="rec-icon">
                    <i class="fas fa-${rec.icon}"></i>
                </div>
                <div class="rec-content">
                    <div class="rec-title">${rec.title}</div>
                    <div class="rec-description">${rec.description}</div>
                </div>
                <div class="rec-priority ${rec.priority}">
                    ${rec.priority.toUpperCase()}
                </div>
            `;
            recommendationsList.appendChild(item);
        });
    }

    bindEvents() {
        // Calculate route button
        document.getElementById('calculateRouteBtn').addEventListener('click', () => {
            const destInput = document.getElementById('destinationInput').value;
            if (destInput) {
                const destination = this.parseDestination(destInput);
                if (destination) {
                    this.calculateRoute(destination);
                }
            }
        });
        
        // Quick destination buttons
        document.querySelectorAll('.dest-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const destType = btn.getAttribute('data-dest');
                const destination = this.getQuickDestination(destType);
                this.calculateRoute(destination);
            });
        });
        
        // Route preference checkboxes
        document.getElementById('avoidDebris').addEventListener('change', (e) => {
            this.preferences.avoidDebris = e.target.checked;
            if (this.route) this.recalculateRoute();
        });
        
        document.getElementById('optimizeFuel').addEventListener('change', (e) => {
            this.preferences.optimizeForFuel = e.target.checked;
            if (this.route) this.recalculateRoute();
        });
        
        document.getElementById('minimizeRadiation').addEventListener('change', (e) => {
            this.preferences.minimizeRadiation = e.target.checked;
            if (this.route) this.recalculateRoute();
        });
    }

    parseDestination(input) {
        // Parse destination input (coordinates or landmark)
        const coordMatch = input.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
        if (coordMatch) {
            return {
                lat: parseFloat(coordMatch[1]),
                lon: parseFloat(coordMatch[2]),
                z: 408, // default altitude
                name: 'Custom Location'
            };
        }
        
        // Handle landmark names
        const landmarks = {
            'iss': { lat: 51.6, lon: 0, z: 408, name: 'International Space Station' },
            'moon': { lat: 0, lon: 0, z: 384400, name: 'Moon' },
            'earth': { lat: 0, lon: 0, z: 200, name: 'Earth Return Point' }
        };
        
        return landmarks[input.toLowerCase()] || null;
    }

    getQuickDestination(type) {
        const destinations = {
            'iss': { lat: 51.6, lon: 0, z: 408, name: 'International Space Station' },
            'moon': { lat: 0, lon: 0, z: 384400, name: 'Moon' },
            'l1': { lat: 0, lon: 0, z: 1500000, name: 'L1 Lagrange Point' },
            'earth': { lat: 0, lon: 0, z: 200, name: 'Earth Return Point' }
        };
        
        return destinations[type];
    }

    recalculateRoute() {
        if (this.destination) {
            this.calculateRoute(this.destination);
        }
    }

    startAISensors() {
        this.aiSensors.start();
    }

    updatePositionUI() {
        // Update position display in UI
        const gpsSignal = document.getElementById('gpsSignal');
        if (gpsSignal) {
            gpsSignal.querySelector('span').textContent = 'GPS Active';
        }
    }

    getNavigationData() {
        return {
            currentPosition: this.currentPosition,
            destination: this.destination,
            route: this.route,
            routeProgress: this.route ? this.calculateRouteProgress() : 0,
            aiRecommendations: this.routeOptimizer.getLastRecommendations(),
            isTracking: this.isTracking
        };
    }
}

// AI Sensors for Navigation
class NavigationAISensors {
    constructor() {
        this.isActive = false;
        this.sensorData = {
            obstacles: [],
            opportunities: [],
            hazards: [],
            traffic: []
        };
    }

    start() {
        this.isActive = true;
        this.sensorLoop();
    }

    sensorLoop() {
        if (!this.isActive) return;
        
        // Simulate AI sensor data collection
        this.collectObstacleData();
        this.detectOpportunities();
        this.assessHazards();
        
        setTimeout(() => this.sensorLoop(), 2000);
    }

    collectObstacleData() {
        // Simulate obstacle detection
        this.sensorData.obstacles = [];
        for (let i = 0; i < 5; i++) {
            this.sensorData.obstacles.push({
                lat: Math.random() * 180 - 90,
                lon: Math.random() * 360 - 180,
                z: 300 + Math.random() * 500,
                type: 'debris',
                size: Math.random() * 10,
                risk: Math.random()
            });
        }
    }

    detectOpportunities() {
        // Simulate opportunity detection (fuel stations, safe zones)
        this.sensorData.opportunities = [];
        for (let i = 0; i < 3; i++) {
            this.sensorData.opportunities.push({
                lat: Math.random() * 180 - 90,
                lon: Math.random() * 360 - 180,
                z: 400 + Math.random() * 200,
                type: 'safe_zone',
                benefit: Math.random()
            });
        }
    }

    assessHazards() {
        // Simulate hazard assessment
        this.sensorData.hazards = [
            {
                lat: 45,
                lon: -90,
                z: 450,
                type: 'radiation',
                severity: 'medium'
            }
        ];
    }

    getSensorData() {
        return this.sensorData;
    }

    stop() {
        this.isActive = false;
    }
}

// AI Route Optimizer
class AIRouteOptimizer {
    constructor() {
        this.lastRecommendations = [];
    }

    calculateOptimalRoute(request) {
        const { start, end, preferences, constraints } = request;
        
        // Simple route calculation with AI optimization
        const route = [];
        const steps = 10;
        
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const point = {
                lat: start.lat + (end.lat - start.lat) * progress,
                lon: start.lon + (end.lon - start.lon) * progress,
                z: start.z + (end.z - start.z) * progress,
                x: start.lat + (end.lat - start.lat) * progress,
                y: start.lon + (end.lon - start.lon) * progress
            };
            
            // Apply AI optimizations
            if (preferences.avoidDebris) {
                point.lat += Math.sin(progress * Math.PI) * 5; // Curved path
            }
            
            if (preferences.optimizeForFuel) {
                point.z += Math.cos(progress * Math.PI * 2) * 10; // Altitude variations
            }
            
            route.push(point);
        }
        
        return route;
    }

    generateRecommendations(currentPos, route, preferences) {
        const recommendations = [
            {
                icon: 'route',
                title: 'Optimal Path Detected',
                description: 'Current route is optimized for fuel efficiency and safety',
                priority: 'low'
            },
            {
                icon: 'exclamation-triangle',
                title: 'Debris Field Ahead',
                description: 'Minor course correction recommended in 15 minutes',
                priority: 'medium'
            },
            {
                icon: 'gas-pump',
                title: 'Fuel Optimization',
                description: 'Adjust altitude to +50km for better fuel efficiency',
                priority: 'low'
            }
        ];
        
        this.lastRecommendations = recommendations;
        return recommendations;
    }

    getLastRecommendations() {
        return this.lastRecommendations;
    }
}

// Initialize GPS Routes Map
window.gpsRoutesMap = new GPSRoutesMap();

console.log('GPS Routes Map with AI Navigation loaded successfully');
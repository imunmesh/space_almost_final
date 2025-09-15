// Advanced Pilot Control System
class PilotControl {
    constructor() {
        this.flightMode = 'manual'; // 'manual', 'autopilot', 'docking'
        this.manualControls = {
            mainThrust: 0,
            pitch: 0,
            yaw: 0,
            roll: 0,
            rcsActive: false
        };
        
        this.autopilotData = {
            target: { x: 0, y: 0, z: 0 },
            engaged: false,
            route: null,
            eta: null,
            efficiency: 0
        };
        
        this.spacecraftState = {
            position: { x: 0, y: 0, z: 408000 },
            velocity: { x: 7660, y: 0, z: 0 },
            attitude: { pitch: 0, yaw: 0, roll: 0 },
            fuel: 85, // percentage
            fuelConsumption: 2.3, // kg/min
            efficiency: 95 // percentage
        };
        
        this.collisionAvoidance = {
            active: true,
            threatLevel: 'low',
            obstacles: [],
            recommendations: []
        };
        
        this.physics = {
            mass: 420000, // kg (ISS mass)
            maxThrust: 4448, // N (Space Shuttle OMS)
            fuelCapacity: 8618, // kg
            efficiency: 0.95
        };
        
        this.initializeEventListeners();
        this.startSimulation();
    }
    
    initializeEventListeners() {
        // Flight mode buttons
        document.getElementById('manual-mode-btn')?.addEventListener('click', () => this.setFlightMode('manual'));
        document.getElementById('autopilot-mode-btn')?.addEventListener('click', () => this.setFlightMode('autopilot'));
        document.getElementById('docking-mode-btn')?.addEventListener('click', () => this.setFlightMode('docking'));
        
        // Manual control sliders
        const mainThrustSlider = document.getElementById('main-thrust');
        if (mainThrustSlider) {
            mainThrustSlider.addEventListener('input', (e) => {
                this.manualControls.mainThrust = parseFloat(e.target.value);
                this.updateThrustDisplay();
            });
        }
        
        const pitchSlider = document.getElementById('pitch-control');
        if (pitchSlider) {
            pitchSlider.addEventListener('input', (e) => {
                this.manualControls.pitch = parseFloat(e.target.value);
                this.updateAttitudeDisplay();
            });
        }
        
        const yawSlider = document.getElementById('yaw-control');
        if (yawSlider) {
            yawSlider.addEventListener('input', (e) => {
                this.manualControls.yaw = parseFloat(e.target.value);
                this.updateAttitudeDisplay();
            });
        }
        
        const rollSlider = document.getElementById('roll-control');
        if (rollSlider) {
            rollSlider.addEventListener('input', (e) => {
                this.manualControls.roll = parseFloat(e.target.value);
                this.updateAttitudeDisplay();
            });
        }
        
        // RCS controls
        document.querySelectorAll('.rcs-btn').forEach(btn => {
            btn.addEventListener('mousedown', (e) => this.startRCS(e.target.dataset.direction));
            btn.addEventListener('mouseup', () => this.stopRCS());
            btn.addEventListener('mouseleave', () => this.stopRCS());
        });
        
        // Autopilot controls
        document.getElementById('set-target-btn')?.addEventListener('click', () => this.setAutopilotTarget());
        document.getElementById('engage-autopilot-btn')?.addEventListener('click', () => this.engageAutopilot());
        document.getElementById('abort-autopilot-btn')?.addEventListener('click', () => this.abortAutopilot());
        
        // Collision avoidance toggle
        document.getElementById('avoidance-toggle')?.addEventListener('click', () => this.toggleCollisionAvoidance());
    }
    
    setFlightMode(mode) {
        this.flightMode = mode;
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}-mode-btn`)?.classList.add('active');
        
        document.querySelectorAll('.control-section').forEach(section => section.classList.remove('active'));
        if (mode === 'manual') {
            document.getElementById('manual-controls')?.classList.add('active');
        } else if (mode === 'autopilot') {
            document.getElementById('autopilot-controls')?.classList.add('active');
        }
        
        // Update flight mode indicator
        const indicator = document.getElementById('flight-mode-indicator');
        const text = document.getElementById('flight-mode-text');
        if (indicator && text) {
            indicator.className = `status-indicator ${mode === 'manual' ? 'manual' : mode === 'autopilot' ? 'autopilot' : 'docking'}`;
            text.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
        }
        
        console.log(`Flight mode changed to: ${mode}`);
    }
    
    updateThrustDisplay() {
        const valueElement = document.getElementById('main-thrust-value');
        if (valueElement) {
            valueElement.textContent = `${this.manualControls.mainThrust.toFixed(0)}%`;
        }
    }
    
    updateAttitudeDisplay() {
        const pitchValue = document.getElementById('pitch-value');
        const yawValue = document.getElementById('yaw-value');
        const rollValue = document.getElementById('roll-value');
        
        if (pitchValue) pitchValue.textContent = `${this.manualControls.pitch.toFixed(0)}\u00b0`;
        if (yawValue) yawValue.textContent = `${this.manualControls.yaw.toFixed(0)}\u00b0`;
        if (rollValue) rollValue.textContent = `${this.manualControls.roll.toFixed(0)}\u00b0`;
    }
    
    startRCS(direction) {
        this.manualControls.rcsActive = true;
        console.log(`RCS thrust: ${direction}`);
        
        // Apply RCS thrust to spacecraft state
        const rcsForce = 0.1; // Small adjustment force
        switch (direction) {
            case 'up':
                this.spacecraftState.velocity.z += rcsForce;
                break;
            case 'down':
                this.spacecraftState.velocity.z -= rcsForce;
                break;
            case 'left':
                this.spacecraftState.velocity.y -= rcsForce;
                break;
            case 'right':
                this.spacecraftState.velocity.y += rcsForce;
                break;
            case 'forward':
                this.spacecraftState.velocity.x += rcsForce;
                break;
            case 'backward':
                this.spacecraftState.velocity.x -= rcsForce;
                break;
        }
        
        // Consume fuel for RCS
        this.consumeFuel(0.01);
    }
    
    stopRCS() {
        this.manualControls.rcsActive = false;
    }
    
    setAutopilotTarget() {
        const x = parseFloat(document.getElementById('target-x')?.value || 0);
        const y = parseFloat(document.getElementById('target-y')?.value || 0);
        const z = parseFloat(document.getElementById('target-z')?.value || 0);
        
        this.autopilotData.target = { x, y, z };
        
        // Calculate route efficiency and ETA
        const distance = this.calculateDistance(
            this.spacecraftState.position,
            this.autopilotData.target
        );
        
        const currentSpeed = this.calculateSpeed(this.spacecraftState.velocity);
        const eta = distance / Math.max(currentSpeed, 1); // Avoid division by zero
        const fuelRequired = this.calculateFuelRequired(distance);
        
        this.autopilotData.efficiency = this.calculateRouteEfficiency(distance, fuelRequired);
        this.autopilotData.eta = eta;
        
        // Update UI
        document.getElementById('route-efficiency').textContent = `${this.autopilotData.efficiency.toFixed(1)}%`;
        document.getElementById('autopilot-eta').textContent = this.formatTime(eta);
        document.getElementById('fuel-required').textContent = `${fuelRequired.toFixed(1)} kg`;
        
        console.log('Autopilot target set:', this.autopilotData.target);
    }
    
    engageAutopilot() {
        if (!this.autopilotData.target) {
            alert('Please set a target first');
            return;
        }
        
        this.autopilotData.engaged = true;
        this.setFlightMode('autopilot');
        
        console.log('Autopilot engaged');
        
        // Auto-log mission event
        if (window.missionLog) {
            window.missionLog.autoLog('Autopilot system engaged - navigating to target coordinates', 'navigation');
        }
    }
    
    abortAutopilot() {
        this.autopilotData.engaged = false;
        this.setFlightMode('manual');
        
        console.log('Autopilot aborted');
        
        // Auto-log mission event
        if (window.missionLog) {
            window.missionLog.autoLog('Autopilot system aborted - manual control resumed', 'navigation');
        }
    }
    
    toggleCollisionAvoidance() {
        this.collisionAvoidance.active = !this.collisionAvoidance.active;
        
        const toggleBtn = document.getElementById('avoidance-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = this.collisionAvoidance.active ? 'ON' : 'OFF';
            toggleBtn.classList.toggle('active', this.collisionAvoidance.active);
        }
        
        console.log(`Collision avoidance: ${this.collisionAvoidance.active ? 'ON' : 'OFF'}`);
    }
    
    calculateDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const dz = pos2.z - pos1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    calculateSpeed(velocity) {
        return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
    }
    
    calculateFuelRequired(distance) {
        // Simplified fuel calculation based on distance and current efficiency
        const baseFuelRate = 0.001; // kg per km
        return distance * baseFuelRate / (this.spacecraftState.efficiency / 100);
    }
    
    calculateRouteEfficiency(distance, fuelRequired) {
        // Calculate efficiency based on optimal vs actual fuel consumption
        const optimalFuel = distance * 0.0008; // Theoretical optimal
        return Math.max(0, Math.min(100, (optimalFuel / fuelRequired) * 100));
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }
    
    consumeFuel(amount) {
        const currentFuelKg = (this.spacecraftState.fuel / 100) * this.physics.fuelCapacity;
        const newFuelKg = Math.max(0, currentFuelKg - amount);
        this.spacecraftState.fuel = (newFuelKg / this.physics.fuelCapacity) * 100;
        
        this.updateFuelDisplay();
    }
    
    updateFuelDisplay() {
        const fuelGaugeFill = document.getElementById('fuel-gauge-fill');
        const fuelPercentage = document.getElementById('fuel-percentage');
        const fuelEfficiency = document.getElementById('fuel-efficiency');
        const fuelConsumption = document.getElementById('fuel-consumption');
        const fuelRange = document.getElementById('fuel-range');
        
        if (fuelGaugeFill) {
            fuelGaugeFill.style.height = `${this.spacecraftState.fuel}%`;
            
            // Color coding for fuel levels
            if (this.spacecraftState.fuel < 20) {
                fuelGaugeFill.style.backgroundColor = '#ff3333';
            } else if (this.spacecraftState.fuel < 50) {
                fuelGaugeFill.style.backgroundColor = '#ffd700';
            } else {
                fuelGaugeFill.style.backgroundColor = '#00ff88';
            }
        }
        
        if (fuelPercentage) fuelPercentage.textContent = `${this.spacecraftState.fuel.toFixed(1)}%`;
        if (fuelEfficiency) fuelEfficiency.textContent = `${this.spacecraftState.efficiency.toFixed(1)}%`;
        if (fuelConsumption) fuelConsumption.textContent = `${this.spacecraftState.fuelConsumption.toFixed(1)} kg/min`;
        
        // Calculate remaining range
        if (fuelRange) {
            const remainingFuelKg = (this.spacecraftState.fuel / 100) * this.physics.fuelCapacity;
            const estimatedRange = remainingFuelKg / 0.001; // Simplified calculation
            fuelRange.textContent = `${(estimatedRange / 1000).toFixed(0)} km`;
        }
    }
    
    updateCollisionAvoidance() {
        // This would integrate with the radar system
        // For now, simulate collision avoidance recommendations
        const recommendationsContainer = document.getElementById('avoidance-recommendations');
        const threatLevelElement = document.getElementById('collision-threat-level');
        
        if (!this.collisionAvoidance.active) {
            if (recommendationsContainer) {
                recommendationsContainer.innerHTML = '<div class=\"recommendation disabled\"><i class=\"fas fa-exclamation-triangle\"></i><span>Collision avoidance system disabled</span></div>';
            }
            return;
        }
        
        // Simulate threat assessment
        const threats = ['low', 'medium', 'high', 'critical'];
        const randomThreat = threats[Math.floor(Math.random() * threats.length * 0.3)]; // Bias toward low threat
        
        this.collisionAvoidance.threatLevel = randomThreat || 'low';
        
        if (threatLevelElement) {
            threatLevelElement.textContent = this.collisionAvoidance.threatLevel.toUpperCase();
            threatLevelElement.className = `threat-value ${this.collisionAvoidance.threatLevel}`;
        }
        
        // Generate appropriate recommendations
        let recommendations = [];
        switch (this.collisionAvoidance.threatLevel) {
            case 'critical':
                recommendations = [
                    '<i class=\"fas fa-exclamation-triangle\"></i><span>IMMEDIATE EVASIVE MANEUVER REQUIRED</span>',
                    '<i class=\"fas fa-shield-alt\"></i><span>Automatic avoidance protocols engaged</span>'
                ];
                break;
            case 'high':
                recommendations = [
                    '<i class=\"fas fa-exclamation-circle\"></i><span>Prepare for course correction</span>',
                    '<i class=\"fas fa-route\"></i><span>Alternative route calculated</span>'
                ];
                break;
            case 'medium':
                recommendations = [
                    '<i class=\"fas fa-eye\"></i><span>Monitor situation closely</span>',
                    '<i class=\"fas fa-clock\"></i><span>Review trajectory in 5 minutes</span>'
                ];
                break;
            default:
                recommendations = [
                    '<i class=\"fas fa-check-circle\"></i><span>All clear - no obstacles detected</span>'
                ];
        }
        
        if (recommendationsContainer) {
            recommendationsContainer.innerHTML = recommendations.map(rec => 
                `<div class=\"recommendation\">${rec}</div>`
            ).join('');
        }
    }
    
    simulatePhysics() {
        // Apply thrust to velocity
        if (this.flightMode === 'manual' && this.manualControls.mainThrust > 0) {
            const thrustForce = (this.manualControls.mainThrust / 100) * this.physics.maxThrust;
            const acceleration = thrustForce / this.physics.mass;
            
            // Apply thrust in forward direction (simplified)
            this.spacecraftState.velocity.x += acceleration * 0.1; // Scale down for reasonable values
            
            // Consume fuel based on thrust
            const fuelConsumption = (this.manualControls.mainThrust / 100) * 0.05;
            this.consumeFuel(fuelConsumption);
        }
        
        // Update attitude based on controls
        this.spacecraftState.attitude.pitch = this.manualControls.pitch;
        this.spacecraftState.attitude.yaw = this.manualControls.yaw;
        this.spacecraftState.attitude.roll = this.manualControls.roll;
        
        // Update position based on velocity
        this.spacecraftState.position.x += this.spacecraftState.velocity.x * 0.01;
        this.spacecraftState.position.y += this.spacecraftState.velocity.y * 0.01;
        this.spacecraftState.position.z += this.spacecraftState.velocity.z * 0.01;
        
        // Update fuel consumption rate
        const currentThrust = this.manualControls.mainThrust;
        this.spacecraftState.fuelConsumption = 2.0 + (currentThrust / 100) * 3.0;
        
        // Update efficiency based on piloting
        const thrustEfficiency = Math.max(0.7, 1 - (currentThrust / 100) * 0.3);
        this.spacecraftState.efficiency = 90 + (thrustEfficiency * 10);
    }
    
    startSimulation() {
        setInterval(() => {
            this.simulatePhysics();
            this.updateFuelDisplay();
            this.updateCollisionAvoidance();
        }, 1000); // Update every second
    }
}

// Initialize pilot control system
let pilotControl;

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if pilot control panel exists
    if (document.querySelector('.pilot-control-panel')) {
        pilotControl = new PilotControl();
        console.log('Pilot Control System initialized');
    }
});

// Export for use by other modules
window.pilotControl = pilotControl;
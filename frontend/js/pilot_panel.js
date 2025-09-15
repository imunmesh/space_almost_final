// Advanced Pilot Control Panel
class PilotControlPanel {
    constructor() {
        this.flightControls = {
            thrust: 0,      // 0-100%
            pitch: 0,       // -90 to +90 degrees
            yaw: 0,         // -180 to +180 degrees
            roll: 0,        // -180 to +180 degrees
            throttle: 0     // 0-100%
        };
        
        this.autopilot = {
            enabled: false,
            mode: 'manual',  // manual, orbit, approach, landing
            target_altitude: 408000,
            target_velocity: 7660,
            collision_avoidance: true
        };
        
        this.fuel = {
            main_tank: 85,      // percentage
            rcs_tank: 92,       // percentage
            consumption_rate: 0, // kg/s
            total_consumed: 0,   // kg
            efficiency_score: 100 // 0-100%
        };
        
        this.navigation = {
            current_position: { x: 0, y: 0, z: 408000 },
            velocity: { x: 7660, y: 0, z: 0 },
            orbital_period: 5580, // seconds
            apogee: 415000,       // meters
            perigee: 401000       // meters
        };
        
        this.maneuverQueue = [];
        this.collisionWarnings = [];
        this.isInitialized = false;
        
        this.initializeControls();
        this.startUpdateLoop();
    }
    
    initializeControls() {
        // Thrust control slider
        const thrustSlider = document.getElementById('thrust-control');
        if (thrustSlider) {
            thrustSlider.addEventListener('input', (e) => {
                this.flightControls.thrust = parseFloat(e.target.value);
                this.updateThrustDisplay();
                this.calculateFuelConsumption();
            });
        }
        
        // Attitude control joysticks
        this.initializeAttitudeControls();
        
        // Autopilot controls
        const autopilotToggle = document.getElementById('autopilot-toggle');
        if (autopilotToggle) {
            autopilotToggle.addEventListener('click', () => {
                this.toggleAutopilot();
            });
        }
        
        // Navigation controls
        this.initializeNavigationControls();
        
        // Emergency controls
        const emergencyButton = document.getElementById('emergency-stop');
        if (emergencyButton) {
            emergencyButton.addEventListener('click', () => {
                this.emergencyStop();
            });
        }
        
        this.isInitialized = true;
        this.updateAllDisplays();
    }
    
    initializeAttitudeControls() {
        // Pitch control
        const pitchControl = document.getElementById('pitch-control');
        if (pitchControl) {
            pitchControl.addEventListener('input', (e) => {
                this.flightControls.pitch = parseFloat(e.target.value);
                this.updateAttitudeDisplay();
            });
        }
        
        // Yaw control
        const yawControl = document.getElementById('yaw-control');
        if (yawControl) {
            yawControl.addEventListener('input', (e) => {
                this.flightControls.yaw = parseFloat(e.target.value);
                this.updateAttitudeDisplay();
            });
        }
        
        // Roll control
        const rollControl = document.getElementById('roll-control');
        if (rollControl) {
            rollControl.addEventListener('input', (e) => {
                this.flightControls.roll = parseFloat(e.target.value);
                this.updateAttitudeDisplay();
            });
        }
    }
    
    initializeNavigationControls() {
        // Orbit adjustment controls
        const orbitUpButton = document.getElementById('orbit-up');
        const orbitDownButton = document.getElementById('orbit-down');
        
        if (orbitUpButton) {
            orbitUpButton.addEventListener('click', () => {
                this.adjustOrbit(1000); // Raise orbit by 1km
            });
        }
        
        if (orbitDownButton) {
            orbitDownButton.addEventListener('click', () => {
                this.adjustOrbit(-1000); // Lower orbit by 1km
            });
        }
        
        // Docking controls
        const dockingButton = document.getElementById('docking-mode');
        if (dockingButton) {
            dockingButton.addEventListener('click', () => {
                this.enterDockingMode();
            });
        }
    }
    
    toggleAutopilot() {
        this.autopilot.enabled = !this.autopilot.enabled;
        
        if (this.autopilot.enabled) {
            this.engageAutopilot();
        } else {
            this.disengageAutopilot();
        }
        
        this.updateAutopilotDisplay();
        
        // Log the action
        if (window.missionLog) {
            window.missionLog.autoLog(
                `Autopilot ${this.autopilot.enabled ? 'ENGAGED' : 'DISENGAGED'}`,
                'navigation'
            );
        }
    }
    
    engageAutopilot() {
        // Smooth out control inputs
        this.smoothControlTransition();
        
        // Enable collision avoidance
        this.autopilot.collision_avoidance = true;
        
        // Set default autopilot mode
        this.autopilot.mode = 'orbit';
        
        this.displayMessage('Autopilot engaged - Orbital maintenance mode', 'success');
    }
    
    disengageAutopilot() {
        this.displayMessage('Autopilot disengaged - Manual control', 'warning');
    }
    
    smoothControlTransition() {
        // Gradually adjust controls to prevent jarring movements
        const targetThrust = this.calculateOptimalThrust();
        
        // Animate thrust to target
        this.animateControlTo('thrust', targetThrust, 2000); // 2 second transition
    }
    
    animateControlTo(control, targetValue, duration) {
        const startValue = this.flightControls[control];
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smooth easing function
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.flightControls[control] = startValue + (targetValue - startValue) * eased;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
            
            this.updateAllDisplays();
        };
        
        animate();
    }
    
    calculateOptimalThrust() {
        // Calculate optimal thrust based on current situation
        const currentAltitude = this.navigation.current_position.z;
        const targetAltitude = this.autopilot.target_altitude;
        const altitudeDiff = targetAltitude - currentAltitude;
        
        // Simple proportional control
        let optimalThrust = 50; // Base thrust
        
        if (Math.abs(altitudeDiff) > 1000) {
            optimalThrust += (altitudeDiff / 10000) * 20; // Adjust based on altitude error
        }
        
        return Math.max(0, Math.min(100, optimalThrust));
    }
    
    adjustOrbit(altitudeChange) {
        // Calculate maneuver for orbit adjustment
        const deltaV = this.calculateDeltaVForAltitudeChange(altitudeChange);
        
        const maneuver = {
            id: Date.now(),
            type: 'altitude_adjustment',
            deltaV: deltaV,
            duration: Math.abs(deltaV) / 10, // seconds
            fuelCost: this.calculateFuelCost(deltaV),
            description: `${altitudeChange > 0 ? 'Raise' : 'Lower'} orbit by ${Math.abs(altitudeChange/1000)}km`
        };
        
        this.queueManeuver(maneuver);
    }
    
    calculateDeltaVForAltitudeChange(altitudeChange) {
        // Simplified delta-V calculation for orbital mechanics
        const currentRadius = this.navigation.current_position.z + 6371000; // Earth radius
        const targetRadius = currentRadius + altitudeChange;
        
        // Vis-viva equation approximation
        const mu = 3.986004418e14; // Earth's gravitational parameter
        const currentV = Math.sqrt(mu / currentRadius);
        const targetV = Math.sqrt(mu / targetRadius);
        
        return Math.abs(targetV - currentV);
    }
    
    calculateFuelCost(deltaV) {
        // Calculate fuel cost in kg based on Tsiolkovsky rocket equation
        const specificImpulse = 450; // seconds (typical for spacecraft)
        const g0 = 9.81; // m/s²
        const dryMass = 15000; // kg (spacecraft mass)
        
        const massRatio = Math.exp(deltaV / (specificImpulse * g0));
        const fuelMass = dryMass * (massRatio - 1);
        
        return fuelMass;
    }
    
    queueManeuver(maneuver) {
        this.maneuverQueue.push(maneuver);
        this.updateManeuverQueue();
        
        if (window.missionLog) {
            window.missionLog.autoLog(
                `Maneuver queued: ${maneuver.description} (ΔV: ${maneuver.deltaV.toFixed(1)} m/s)`,
                'navigation'
            );
        }
    }
    
    executeNextManeuver() {
        if (this.maneuverQueue.length === 0) return;
        
        const maneuver = this.maneuverQueue.shift();
        
        // Execute the maneuver
        this.fuel.total_consumed += maneuver.fuelCost;
        this.fuel.main_tank -= (maneuver.fuelCost / 1000) * 100 / 85; // Rough percentage calculation
        
        // Apply navigation changes
        if (maneuver.type === 'altitude_adjustment') {
            this.navigation.current_position.z += (maneuver.deltaV > 0 ? 1000 : -1000);
        }
        
        this.displayMessage(`Maneuver executed: ${maneuver.description}`, 'success');
        this.updateAllDisplays();
        
        if (window.missionLog) {
            window.missionLog.autoLog(
                `Maneuver executed: ${maneuver.description} - Fuel consumed: ${maneuver.fuelCost.toFixed(1)}kg`,
                'navigation'
            );
        }
    }
    
    enterDockingMode() {
        this.autopilot.enabled = true;
        this.autopilot.mode = 'docking';
        
        // Reduce thrust for precision
        this.flightControls.thrust = 10;
        
        // Enable fine control mode
        this.enableFineControlMode();
        
        this.displayMessage('Docking mode engaged - Fine control active', 'info');
    }
    
    enableFineControlMode() {
        // Reduce control sensitivity for docking
        const controls = ['pitch-control', 'yaw-control', 'roll-control'];
        controls.forEach(controlId => {
            const control = document.getElementById(controlId);
            if (control) {
                control.step = '0.1'; // Fine precision
            }
        });
    }
    
    calculateFuelConsumption() {
        // Calculate real-time fuel consumption
        const thrustPercent = this.flightControls.thrust;
        const baseConsumption = 0.5; // kg/s at 50% thrust
        
        this.fuel.consumption_rate = (thrustPercent / 50) * baseConsumption;
        
        // Calculate efficiency score
        const optimalThrust = this.calculateOptimalThrust();
        const thrustEfficiency = 100 - Math.abs(thrustPercent - optimalThrust);
        this.fuel.efficiency_score = Math.max(0, thrustEfficiency);
    }
    
    checkCollisionAvoidance() {
        // Get navigation data
        if (window.navigationService) {
            const radarData = window.navigationService.get_radar_data();
            this.collisionWarnings = radarData.collision_warnings || [];
            
            if (this.autopilot.enabled && this.autopilot.collision_avoidance) {
                this.performAutomaticAvoidance();
            }
        }
    }
    
    performAutomaticAvoidance() {
        const criticalWarnings = this.collisionWarnings.filter(w => w.severity === 'critical');
        
        if (criticalWarnings.length > 0) {
            const warning = criticalWarnings[0];
            
            // Calculate avoidance maneuver
            const avoidanceThrust = this.calculateAvoidanceManeuver(warning);
            
            // Execute emergency avoidance
            this.flightControls.thrust = avoidanceThrust.thrust;
            this.flightControls.pitch = avoidanceThrust.pitch;
            this.flightControls.yaw = avoidanceThrust.yaw;
            
            this.displayMessage(
                `COLLISION AVOIDANCE: Automatic maneuver executed for ${warning.object_type}`,
                'critical'
            );
            
            if (window.missionLog) {
                window.missionLog.autoLog(
                    `COLLISION AVOIDANCE: Automatic maneuver for ${warning.object_type} at ${warning.distance.toFixed(0)}m`,
                    'emergency'
                );
            }
        }
    }
    
    calculateAvoidanceManeuver(warning) {
        // Simple avoidance calculation
        return {
            thrust: 80, // High thrust for quick avoidance
            pitch: warning.distance < 100 ? 15 : 5, // Pitch up to avoid
            yaw: warning.distance < 100 ? 10 : 3    // Slight yaw
        };
    }
    
    emergencyStop() {
        // Emergency stop all engines
        this.flightControls.thrust = 0;
        this.flightControls.pitch = 0;
        this.flightControls.yaw = 0;
        this.flightControls.roll = 0;
        
        // Disable autopilot
        this.autopilot.enabled = false;
        
        this.displayMessage('EMERGENCY STOP ACTIVATED - All engines stopped', 'critical');
        
        if (window.missionLog) {
            window.missionLog.autoLog('EMERGENCY STOP: All flight controls zeroed', 'emergency');
        }
        
        this.updateAllDisplays();
    }
    
    updateAllDisplays() {
        if (!this.isInitialized) return;
        
        this.updateThrustDisplay();
        this.updateAttitudeDisplay();
        this.updateAutopilotDisplay();
        this.updateFuelDisplay();
        this.updateNavigationDisplay();
        this.updateManeuverQueue();
        this.updateCollisionDisplay();
    }
    
    updateThrustDisplay() {
        const thrustValue = document.getElementById('thrust-value');
        const thrustBar = document.getElementById('thrust-bar');
        
        if (thrustValue) thrustValue.textContent = `${this.flightControls.thrust.toFixed(1)}%`;
        if (thrustBar) thrustBar.style.width = `${this.flightControls.thrust}%`;
    }
    
    updateAttitudeDisplay() {
        const pitchValue = document.getElementById('pitch-value');
        const yawValue = document.getElementById('yaw-value');
        const rollValue = document.getElementById('roll-value');
        
        if (pitchValue) pitchValue.textContent = `${this.flightControls.pitch.toFixed(1)}°`;
        if (yawValue) yawValue.textContent = `${this.flightControls.yaw.toFixed(1)}°`;
        if (rollValue) rollValue.textContent = `${this.flightControls.roll.toFixed(1)}°`;
    }
    
    updateAutopilotDisplay() {
        const autopilotStatus = document.getElementById('autopilot-status');
        const autopilotMode = document.getElementById('autopilot-mode');
        
        if (autopilotStatus) {
            autopilotStatus.textContent = this.autopilot.enabled ? 'ENGAGED' : 'DISENGAGED';
            autopilotStatus.className = `autopilot-status ${this.autopilot.enabled ? 'engaged' : 'disengaged'}`;
        }
        
        if (autopilotMode) {
            autopilotMode.textContent = this.autopilot.mode.toUpperCase();
        }
    }
    
    updateFuelDisplay() {
        const mainTank = document.getElementById('main-fuel-level');
        const rcsTank = document.getElementById('rcs-fuel-level');
        const consumptionRate = document.getElementById('fuel-consumption-rate');
        const efficiency = document.getElementById('fuel-efficiency');
        
        if (mainTank) mainTank.textContent = `${this.fuel.main_tank.toFixed(1)}%`;
        if (rcsTank) rcsTank.textContent = `${this.fuel.rcs_tank.toFixed(1)}%`;
        if (consumptionRate) consumptionRate.textContent = `${this.fuel.consumption_rate.toFixed(2)} kg/s`;
        if (efficiency) efficiency.textContent = `${this.fuel.efficiency_score.toFixed(0)}%`;
    }
    
    updateNavigationDisplay() {
        const altitude = document.getElementById('current-altitude');
        const velocity = document.getElementById('current-velocity');
        const orbitalPeriod = document.getElementById('orbital-period');
        
        if (altitude) altitude.textContent = `${(this.navigation.current_position.z / 1000).toFixed(1)} km`;
        if (velocity) velocity.textContent = `${(this.navigation.velocity.x / 1000).toFixed(2)} km/s`;
        if (orbitalPeriod) orbitalPeriod.textContent = `${(this.navigation.orbital_period / 60).toFixed(1)} min`;
    }
    
    updateManeuverQueue() {
        const queueContainer = document.getElementById('maneuver-queue');
        if (!queueContainer) return;
        
        queueContainer.innerHTML = '';
        
        this.maneuverQueue.forEach((maneuver, index) => {
            const maneuverElement = document.createElement('div');
            maneuverElement.className = 'maneuver-item';
            maneuverElement.innerHTML = `
                <div class=\"maneuver-description\">${maneuver.description}</div>
                <div class=\"maneuver-details\">
                    ΔV: ${maneuver.deltaV.toFixed(1)} m/s | 
                    Fuel: ${maneuver.fuelCost.toFixed(1)} kg | 
                    Duration: ${maneuver.duration.toFixed(0)}s
                </div>
                <button class=\"execute-maneuver-btn\" onclick=\"pilotPanel.executeManeuverByIndex(${index})\">
                    Execute
                </button>
            `;
            queueContainer.appendChild(maneuverElement);
        });
        
        if (this.maneuverQueue.length === 0) {
            queueContainer.innerHTML = '<div class=\"no-maneuvers\">No maneuvers queued</div>';
        }
    }
    
    executeManeuverByIndex(index) {
        if (index >= 0 && index < this.maneuverQueue.length) {
            const maneuver = this.maneuverQueue.splice(index, 1)[0];
            this.executeManeuver(maneuver);
        }
    }
    
    executeManeuver(maneuver) {
        // Same logic as executeNextManeuver but for specific maneuver
        this.fuel.total_consumed += maneuver.fuelCost;
        this.fuel.main_tank -= (maneuver.fuelCost / 1000) * 100 / 85;
        
        if (maneuver.type === 'altitude_adjustment') {
            const change = maneuver.deltaV > 0 ? 1000 : -1000;
            this.navigation.current_position.z += change;
        }
        
        this.displayMessage(`Maneuver executed: ${maneuver.description}`, 'success');
        this.updateAllDisplays();
    }
    
    updateCollisionDisplay() {
        const warningsContainer = document.getElementById('collision-warnings');
        if (!warningsContainer) return;
        
        warningsContainer.innerHTML = '';
        
        this.collisionWarnings.forEach(warning => {
            const warningElement = document.createElement('div');
            warningElement.className = `collision-warning ${warning.severity}`;
            warningElement.innerHTML = `
                <div class=\"warning-icon\">⚠️</div>
                <div class=\"warning-details\">
                    <div class=\"warning-object\">${warning.object_type}</div>
                    <div class=\"warning-distance\">${warning.distance.toFixed(0)}m</div>
                    <div class=\"warning-action\">${warning.recommended_action}</div>
                </div>
            `;
            warningsContainer.appendChild(warningElement);
        });
        
        if (this.collisionWarnings.length === 0) {
            warningsContainer.innerHTML = '<div class=\"no-warnings\">No collision warnings</div>';
        }
    }
    
    displayMessage(message, type = 'info') {
        const messageContainer = document.getElementById('pilot-messages');
        if (!messageContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `pilot-message ${type}`;
        messageElement.innerHTML = `
            <span class=\"message-time\">${new Date().toLocaleTimeString()}</span>
            <span class=\"message-text\">${message}</span>
        `;
        
        messageContainer.insertBefore(messageElement, messageContainer.firstChild);
        
        // Remove old messages (keep last 10)
        const messages = messageContainer.querySelectorAll('.pilot-message');
        if (messages.length > 10) {
            messages[messages.length - 1].remove();
        }
        
        // Auto-remove after 10 seconds for non-critical messages
        if (type !== 'critical') {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 10000);
        }
    }
    
    startUpdateLoop() {
        // Update displays every 100ms
        setInterval(() => {
            this.updateAllDisplays();
            this.checkCollisionAvoidance();
            
            // Simulate fuel consumption
            if (this.flightControls.thrust > 0) {
                const deltaTime = 0.1; // 100ms
                this.fuel.total_consumed += this.fuel.consumption_rate * deltaTime;
                this.fuel.main_tank -= (this.fuel.consumption_rate * deltaTime / 1000) * 100 / 85;
            }
        }, 100);
        
        // Autopilot update loop (less frequent)
        setInterval(() => {
            if (this.autopilot.enabled) {
                this.updateAutopilotControls();
            }
        }, 1000);
    }
    
    updateAutopilotControls() {
        switch (this.autopilot.mode) {
            case 'orbit':
                this.maintainOrbit();
                break;
            case 'docking':
                this.performDockingSequence();
                break;
            case 'approach':
                this.performApproachSequence();
                break;
        }
    }
    
    maintainOrbit() {
        // Simple orbital maintenance
        const altitudeError = this.autopilot.target_altitude - this.navigation.current_position.z;
        
        if (Math.abs(altitudeError) > 500) {
            const correction = Math.sign(altitudeError) * Math.min(5, Math.abs(altitudeError) / 1000);
            this.flightControls.thrust = 50 + correction;
        } else {
            this.flightControls.thrust = 50; // Maintain current thrust
        }
    }
    
    performDockingSequence() {
        // Docking approach logic
        this.flightControls.thrust = 15; // Low thrust for precision
        
        // Fine attitude adjustments would go here
        // This is a simplified version
    }
    
    performApproachSequence() {
        // Approach sequence logic
        this.flightControls.thrust = 30; // Medium thrust
    }
}

// Initialize pilot panel when DOM is ready
let pilotPanel;
document.addEventListener('DOMContentLoaded', () => {
    pilotPanel = new PilotControlPanel();
});

// Export for global access
window.pilotPanel = pilotPanel;
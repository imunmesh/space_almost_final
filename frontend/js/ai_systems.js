// Additional AI Systems for AstroHELP

// Multi-Agent Rescue System
class RescueSystem {
    constructor() {
        this.agents = {
            coordinator: { status: 'online', role: 'coordination' },
            navigator: { status: 'online', role: 'navigation' },
            medical: { status: 'online', role: 'medical' }
        };
        this.isActive = false;
    }

    initializeAgents() {
        console.log('Initializing rescue agents...');
        this.isActive = true;
        this.updateAgentStatus();
    }

    standby() {
        console.log('Rescue system on standby');
        this.isActive = false;
    }

    updateAgentStatus() {
        // Update UI if elements exist
        const agentCards = document.querySelectorAll('.agent-card');
        agentCards.forEach((card, index) => {
            const statusEl = card.querySelector('.agent-status');
            if (statusEl) {
                statusEl.textContent = this.isActive ? 'Online' : 'Standby';
                statusEl.className = `agent-status ${this.isActive ? 'online' : 'standby'}`;
            }
        });
    }
}

// Management Systems Controller
class ManagementSystems {
    constructor() {
        this.systems = {
            debrisTracking: false,
            energyManagement: false,
            communication: false,
            rescue: false
        };
    }

    init() {
        console.log('Initializing management systems...');
        Object.keys(this.systems).forEach(system => {
            this.systems[system] = true;
        });
        this.updateSystemStatus();
    }

    updateSystemStatus() {
        // Update AI systems count
        const countEl = document.getElementById('aiSystemsCount');
        if (countEl) {
            const activeCount = Object.values(this.systems).filter(status => status).length;
            countEl.textContent = activeCount;
        }
    }
}

// Tourist Systems Controller
class TouristSystems {
    constructor() {
        this.services = {
            assistant: false,
            healthMonitoring: false,
            navigation: false,
            entertainment: false
        };
    }

    init() {
        console.log('Initializing tourist systems...');
        Object.keys(this.services).forEach(service => {
            this.services[service] = true;
        });
        this.updateServiceStatus();
    }

    updateServiceStatus() {
        // Update tourist interface status
        const statusEl = document.getElementById('touristSystemStatus');
        if (statusEl) {
            const activeServices = Object.values(this.services).filter(status => status).length;
            statusEl.textContent = `${activeServices} Services Active`;
        }
    }
}

// Health Monitor for Space Tourism
class HealthMonitor {
    constructor() {
        this.isActive = false;
        this.vitals = {
            heartRate: 72,
            oxygenLevel: 98,
            bodyTemperature: 36.8,
            bloodPressure: 120
        };
        this.alerts = [];
    }

    start() {
        this.isActive = true;
        console.log('Health monitoring started');
        this.startMonitoring();
        this.updateUI();
    }

    stop() {
        this.isActive = false;
        console.log('Health monitoring stopped');
        this.updateUI();
    }

    startMonitoring() {
        if (!this.isActive) return;

        // Simulate realistic vitals
        setInterval(() => {
            if (this.isActive) {
                this.updateVitals();
                this.checkAlerts();
                this.updateUI();
            }
        }, 2000);
    }

    updateVitals() {
        // Simulate slight variations in vital signs
        this.vitals.heartRate += (Math.random() - 0.5) * 4;
        this.vitals.heartRate = Math.max(60, Math.min(100, this.vitals.heartRate));
        
        this.vitals.oxygenLevel += (Math.random() - 0.5) * 0.5;
        this.vitals.oxygenLevel = Math.max(96, Math.min(100, this.vitals.oxygenLevel));
        
        this.vitals.bodyTemperature += (Math.random() - 0.5) * 0.2;
        this.vitals.bodyTemperature = Math.max(36.2, Math.min(37.2, this.vitals.bodyTemperature));
    }

    checkAlerts() {
        // Check for health alerts
        if (this.vitals.heartRate > 90 || this.vitals.heartRate < 60) {
            this.addAlert('Heart rate outside normal range');
        }
        
        if (this.vitals.oxygenLevel < 97) {
            this.addAlert('Oxygen level low');
        }
    }

    addAlert(message) {
        const alert = {
            id: Date.now(),
            message,
            timestamp: new Date(),
            level: 'warning'
        };
        this.alerts.push(alert);
        
        // Keep only recent alerts
        if (this.alerts.length > 5) {
            this.alerts.shift();
        }
    }

    updateUI() {
        // Update vital signs display
        const heartRateEl = document.getElementById('heartRate');
        const oxygenEl = document.getElementById('oxygenLevel');
        const temperatureEl = document.getElementById('bodyTemperature');
        
        if (heartRateEl) heartRateEl.textContent = Math.round(this.vitals.heartRate);
        if (oxygenEl) oxygenEl.textContent = Math.round(this.vitals.oxygenLevel);
        if (temperatureEl) temperatureEl.textContent = this.vitals.bodyTemperature.toFixed(1);
        
        // Update health status
        const healthStatusEl = document.getElementById('healthStatus');
        if (healthStatusEl) {
            healthStatusEl.textContent = this.isActive ? 'Monitoring' : 'Inactive';
        }
    }
}

// Energy Management AI
class EnergyManagementAI {
    constructor() {
        this.efficiency = 97;
        this.solarAngle = 23.5;
        this.batteryAllocation = 'Optimal';
        this.isOptimizing = false;
    }

    startOptimization() {
        this.isOptimizing = true;
        console.log('Energy optimization started');
        this.optimizationLoop();
    }

    optimizationLoop() {
        if (!this.isOptimizing) return;

        // Simulate AI optimization
        this.efficiency += (Math.random() - 0.5) * 0.5;
        this.efficiency = Math.max(92, Math.min(99, this.efficiency));
        
        this.solarAngle += (Math.random() - 0.5) * 2;
        this.solarAngle = Math.max(0, Math.min(45, this.solarAngle));
        
        this.updateEnergyUI();
        
        setTimeout(() => this.optimizationLoop(), 3000);
    }

    updateEnergyUI() {
        const efficiencyEl = document.getElementById('energyEfficiency');
        const solarAngleEl = document.getElementById('solarAngle');
        const batteryAllocationEl = document.getElementById('batteryAllocation');
        
        if (efficiencyEl) efficiencyEl.textContent = `${Math.round(this.efficiency)}%`;
        if (solarAngleEl) solarAngleEl.textContent = `${this.solarAngle.toFixed(1)}°`;
        if (batteryAllocationEl) batteryAllocationEl.textContent = this.batteryAllocation;
    }
}

// Communication Optimizer AI
class CommunicationOptimizerAI {
    constructor() {
        this.bandwidthUsage = 78;
        this.isOptimizing = false;
    }

    startOptimization() {
        this.isOptimizing = true;
        console.log('Communication optimization started');
        this.optimizationLoop();
    }

    optimizationLoop() {
        if (!this.isOptimizing) return;

        // Simulate bandwidth optimization
        this.bandwidthUsage += (Math.random() - 0.5) * 5;
        this.bandwidthUsage = Math.max(50, Math.min(95, this.bandwidthUsage));
        
        this.updateCommUI();
        
        setTimeout(() => this.optimizationLoop(), 2000);
    }

    updateCommUI() {
        const bandwidthEl = document.getElementById('bandwidthUsage');
        if (bandwidthEl) {
            bandwidthEl.textContent = `${Math.round(this.bandwidthUsage)}%`;
        }
    }
}

// Initialize all AI systems
window.rescueSystem = new RescueSystem();
window.managementSystems = new ManagementSystems();
window.touristSystems = new TouristSystems();
window.healthMonitor = new HealthMonitor();
window.energyManagementAI = new EnergyManagementAI();
window.communicationOptimizerAI = new CommunicationOptimizerAI();

console.log('AI Systems initialized successfully');
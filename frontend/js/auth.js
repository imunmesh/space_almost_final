// Role Selection Manager
class RoleManager {
    constructor() {
        this.currentRole = null;
        this.init();
    }

    init() {
        // Set up role selection buttons
        this.setupRoleSelection();
        
        // Set up exit buttons
        this.setupExitButtons();
        
        // Show role selection screen by default
        this.showRoleSelection();
    }

    setupRoleSelection() {
        const roleButtons = document.querySelectorAll('.role-btn');
        roleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const role = btn.getAttribute('data-role');
                this.selectRole(role);
            });
        });
    }

    setupExitButtons() {
        const managementExitBtn = document.getElementById('managementExitBtn');
        const touristExitBtn = document.getElementById('touristExitBtn');
        
        if (managementExitBtn) {
            managementExitBtn.addEventListener('click', () => {
                this.exitRole();
            });
        }
        
        if (touristExitBtn) {
            touristExitBtn.addEventListener('click', () => {
                this.exitRole();
            });
        }
    }

    selectRole(role) {
        this.currentRole = role;
        
        // Show transition animation
        this.showTransition(role);
        
        setTimeout(() => {
            if (role === 'management') {
                this.showManagementDashboard();
            } else if (role === 'tourist') {
                this.showTouristDashboard();
            }
        }, 1500);
    }

    showTransition(role) {
        const roleScreen = document.getElementById('roleSelectionScreen');
        roleScreen.style.transform = 'scale(0.8)';
        roleScreen.style.opacity = '0.5';
        
        // Create transition overlay
        const overlay = document.createElement('div');
        overlay.className = 'role-transition-overlay';
        overlay.innerHTML = `
            <div class="transition-content">
                <div class="transition-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <h2>Initializing ${role === 'management' ? 'Management Console' : 'Tourist Experience'}...</h2>
                <p id="transitionMessage">Loading AI systems...</p>
            </div>
        `;
        
        // Add overlay styles
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.5s ease;
        `;
        
        document.body.appendChild(overlay);
        
        // Update transition messages
        const messages = role === 'management' ? [
            'Activating AI debris tracking...',
            'Initializing collision avoidance...',
            'Loading multi-agent systems...',
            'Optimizing energy management...',
            'Management console ready!'
        ] : [
            'Preparing your space experience...',
            'Activating health monitoring...',
            'Initializing AI assistant...',
            'Loading navigation guide...',
            'Welcome to space tourism!'
        ];
        
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            const messageEl = document.getElementById('transitionMessage');
            if (messageEl && messageIndex < messages.length) {
                messageEl.textContent = messages[messageIndex];
                messageIndex++;
            } else {
                clearInterval(messageInterval);
            }
        }, 300);
        
        // Remove overlay after transition
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 1500);
    }

    showRoleSelection() {
        document.getElementById('roleSelectionScreen').classList.remove('hidden');
        document.getElementById('managementDashboard').classList.add('hidden');
        document.getElementById('touristDashboard').classList.add('hidden');
        
        // Reset role screen styling
        const roleScreen = document.getElementById('roleSelectionScreen');
        roleScreen.style.transform = 'scale(1)';
        roleScreen.style.opacity = '1';
    }

    showManagementDashboard() {
        document.getElementById('roleSelectionScreen').classList.add('hidden');
        document.getElementById('managementDashboard').classList.remove('hidden');
        document.getElementById('touristDashboard').classList.add('hidden');
        
        // Initialize management systems
        if (window.managementSystems) {
            window.managementSystems.init();
        }
        
        // Start debris tracking
        if (window.debrisTracker) {
            window.debrisTracker.start();
        }
        
        // Start radar system
        if (window.radarSystem) {
            window.radarSystem.start();
        }
        
        // Start space map
        if (window.spaceMap) {
            window.spaceMap.start();
        }
        
        // Initialize AI agents
        if (window.rescueSystem) {
            window.rescueSystem.initializeAgents();
        }
        
        // Start energy management AI
        if (window.energyManagementAI) {
            window.energyManagementAI.startOptimization();
        }
    }

    showTouristDashboard() {
        document.getElementById('roleSelectionScreen').classList.add('hidden');
        document.getElementById('managementDashboard').classList.add('hidden');
        document.getElementById('touristDashboard').classList.remove('hidden');
        
        // Initialize tourist systems
        if (window.touristSystems) {
            window.touristSystems.init();
        }
        
        // Start health monitoring with ML
        if (window.touristHealthMonitor) {
            window.touristHealthMonitor.activate();
        }
        
        // Initialize AI assistant (enhanced version)
        if (window.enhancedAIAssistant) {
            window.enhancedAIAssistant.activate();
        } else if (window.aiAssistant) {
            window.aiAssistant.activate();
        }
    }

    exitRole() {
        this.currentRole = null;
        
        // Stop all systems
        this.stopAllSystems();
        
        // Show transition back to role selection
        this.showTransition('selection');
        
        setTimeout(() => {
            this.showRoleSelection();
        }, 1000);
    }

    stopAllSystems() {
        // Stop management systems
        if (window.debrisTracker) {
            window.debrisTracker.stop();
        }
        
        if (window.radarSystem) {
            window.radarSystem.stop();
        }
        
        if (window.spaceMap) {
            window.spaceMap.stop();
        }
        
        if (window.rescueSystem) {
            window.rescueSystem.standby();
        }
        
        // Stop tourist systems
        if (window.touristHealthMonitor) {
            window.touristHealthMonitor.deactivate();
        }
        
        if (window.enhancedAIAssistant) {
            window.enhancedAIAssistant.deactivate();
        } else if (window.aiAssistant) {
            window.aiAssistant.deactivate();
        }
    }

    // Utility methods
    getCurrentRole() {
        return this.currentRole;
    }

    isManagementRole() {
        return this.currentRole === 'management';
    }

    isTouristRole() {
        return this.currentRole === 'tourist';
    }

    showNotification(message, type = 'info') {
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#2ed573' : '#3742fa'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease forwards;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after delay
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize role manager
window.roleManager = new RoleManager();
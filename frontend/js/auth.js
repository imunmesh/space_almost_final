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
        
        // Add event listener for careers button
        const careersBtn = document.getElementById('careersBtn');
        if (careersBtn) {
            careersBtn.addEventListener('click', () => {
                this.showCareersModal();
            });
        }
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
        this.showRoleSelection();
        
        // Emit role exit event
        if (window.astroHELPApp) {
            window.astroHELPApp.emit('role:exit');
        }
    }
    
    showCareersModal() {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'careers-modal';
        modal.innerHTML = `
            <div class="careers-modal-content">
                <div class="careers-modal-header">
                    <h2><i class="fas fa-briefcase"></i> Space Tourism Careers</h2>
                    <button class="careers-modal-close">&times;</button>
                </div>
                <div class="careers-modal-body">
                    <div class="careers-search-bar">
                        <input type="text" id="modalCareersSearch" class="careers-search-input" placeholder="Search for positions...">
                        <select id="modalCareersFilter" class="careers-filter-select">
                            <option value="all">All Categories</option>
                            <option value="engineering">Engineering</option>
                            <option value="astronaut">Astronaut Crew</option>
                            <option value="hospitality">Hospitality</option>
                            <option value="medical">Medical & Safety</option>
                            <option value="ground">Ground Support</option>
                        </select>
                    </div>
                    <div class="careers-grid" id="modalCareersGrid">
                        <!-- Career cards will be dynamically inserted here -->
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .careers-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            .careers-modal-content {
                background: linear-gradient(145deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95));
                border-radius: 25px;
                width: 90%;
                max-width: 1200px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                border: 2px solid rgba(170, 0, 255, 0.5);
                position: relative;
            }
            
            .careers-modal-header {
                padding: 20px 30px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .careers-modal-header h2 {
                font-family: 'Orbitron', monospace;
                color: var(--plasma-green);
                margin: 0;
            }
            
            .careers-modal-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 2rem;
                cursor: pointer;
                padding: 0;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .careers-modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-primary);
            }
            
            .careers-modal-body {
                padding: 30px;
                max-height: 75vh;
                overflow-y: auto;
            }
            
            @media (max-width: 768px) {
                .careers-modal-content {
                    width: 95%;
                    height: 95%;
                }
                
                .careers-modal-body {
                    padding: 20px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Add close functionality
        const closeBtn = modal.querySelector('.careers-modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
        
        // Close modal when clicking outside content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
        
        // Initialize careers functionality
        setTimeout(() => {
            this.initializeCareersModal();
        }, 100);
    }
    
    initializeCareersModal() {
        // Create a new instance of SpaceTourismCareers for the modal
        if (window.SpaceTourismCareers) {
            const modalCareers = new window.SpaceTourismCareers();
            
            // Override the renderCareerCards method to target the modal
            modalCareers.renderCareerCards = function() {
                const careersGrid = document.getElementById('modalCareersGrid');
                if (!careersGrid) return;

                careersGrid.innerHTML = '';

                this.careerData.forEach((career, index) => {
                    const card = this.createCareerCard(career, index);
                    careersGrid.appendChild(card);
                });

                // Add event listeners to expand buttons and job items
                setTimeout(() => {
                    this.setupCardEventListeners();
                }, 100);
            };
            
            // Override setupEventListeners to target modal elements
            modalCareers.setupEventListeners = function() {
                // Search functionality
                const searchInput = document.getElementById('modalCareersSearch');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        this.filterCareers(e.target.value);
                    });
                }

                // Filter functionality
                const filterSelect = document.getElementById('modalCareersFilter');
                if (filterSelect) {
                    filterSelect.addEventListener('change', (e) => {
                        this.filterByCategory(e.target.value);
                    });
                }
            };
            
            // Render the career cards in the modal
            modalCareers.renderCareerCards();
            modalCareers.setupEventListeners();
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
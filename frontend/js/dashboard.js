// Dashboard Controller
class Dashboard {
    constructor() {
        this.initialized = false;
        this.modules = {};
        this.currentMode = 'space-tourism'; // Default mode
        this.systemStatus = {
            communication: 'online',
            power: 'online',
            lifeSupport: 'online',
            aiAssistant: 'online'
        };
    }

    init() {
        if (this.initialized) return;

        console.log('🚀 Initializing AstroHELP Dashboard...');
        
        // Initialize all modules
        this.initializeModules();
        
        // Set up system monitoring
        this.setupSystemMonitoring();
        
        // Set up UI interactions
        this.setupUIInteractions();
        
        // Start background tasks
        this.startBackgroundTasks();
        
        // Mark as initialized
        this.initialized = true;
        
        console.log('✅ Dashboard initialization complete');
    }

    initializeModules() {
        // Initialize vital signs monitor
        if (window.vitalSignsMonitor) {
            this.modules.vitals = window.vitalSignsMonitor;
            this.modules.vitals.init();
        }

        // Initialize navigation system
        if (window.navigationSystem) {
            this.modules.navigation = window.navigationSystem;
            this.modules.navigation.init();
        }

        // Initialize animations
        if (window.animationController) {
            this.modules.animations = window.animationController;
            this.modules.animations.init();
        }
    }

    setupSystemMonitoring() {
        // Update system status display
        this.updateSystemStatus();
        
        // Monitor system health periodically
        setInterval(() => {
            this.checkSystemHealth();
            this.updateSystemStatus();
        }, 30000); // Check every 30 seconds
    }

    setupUIInteractions() {
        // Add click handlers for panels
        this.setupPanelInteractions();
        
        // Add mission mode toggle
        this.setupMissionModeToggle();
        
        // Add keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Add responsive behavior
        this.setupResponsiveBehavior();
    }

    setupPanelInteractions() {
        // Vital signs panel interactions
        const vitalCards = document.querySelectorAll('.vital-card');
        vitalCards.forEach(card => {
            card.addEventListener('click', () => {
                this.showVitalDetails(card);
            });
        });

        // Alert panel interactions
        const alertsList = document.getElementById('alertsList');
        if (alertsList) {
            alertsList.addEventListener('click', (event) => {
                const alertItem = event.target.closest('.alert-item');
                if (alertItem) {
                    this.handleAlertClick(alertItem);
                }
            });
        }

        // Navigation panel interactions
        const radarScreen = document.querySelector('.radar-screen');
        if (radarScreen) {
            radarScreen.addEventListener('wheel', (event) => {
                event.preventDefault();
                this.handleRadarZoom(event.deltaY);
            });
        }

        // System panel interactions
        const systemItems = document.querySelectorAll('.system-item');
        systemItems.forEach(item => {
            item.addEventListener('click', () => {
                this.showSystemDetails(item);
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + R: Refresh data
            if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
                event.preventDefault();
                this.refreshAllData();
            }
            
            // Ctrl/Cmd + L: Focus on alerts
            if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
                event.preventDefault();
                this.focusAlerts();
            }
            
            // Escape: Clear focus/close modals
            if (event.key === 'Escape') {
                this.clearFocus();
            }
            
            // F11: Toggle fullscreen (browser default, just log)
            if (event.key === 'F11') {
                console.log('Fullscreen toggle requested');
            }
        });
    }

    setupResponsiveBehavior() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Handle orientation change on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 500);
        });
    }

    startBackgroundTasks() {
        // Update timestamp display
        this.updateTimeDisplay();
        setInterval(() => {
            this.updateTimeDisplay();
        }, 1000);
        
        // Background data refresh
        setInterval(() => {
            if (this.shouldRefreshData()) {
                this.refreshCriticalData();
            }
        }, 5000);
        
        // Performance monitoring
        setInterval(() => {
            this.monitorPerformance();
        }, 10000);
    }

    // UI Interaction Handlers
    showVitalDetails(vitalCard) {
        const vitalType = this.getVitalType(vitalCard);
        
        // Add highlight effect
        vitalCard.classList.add('bounce-in');
        setTimeout(() => {
            vitalCard.classList.remove('bounce-in');
        }, 600);
        
        // Show detailed information (could open modal in future)
        console.log(`Showing details for ${vitalType}`);
        
        // For now, just show a tooltip-like notification
        this.showNotification(`${vitalType} details`, 'Click to view historical data');
    }

    handleAlertClick(alertItem) {
        const alertType = alertItem.querySelector('.alert-type')?.textContent;
        
        // Add visual feedback
        alertItem.style.transform = 'scale(0.98)';
        setTimeout(() => {
            alertItem.style.transform = '';
        }, 150);
        
        console.log(`Alert clicked: ${alertType}`);
        
        // Could implement alert acknowledgment or detailed view
        this.showNotification('Alert Selected', `Viewing details for ${alertType}`);
    }

    handleRadarZoom(deltaY) {
        if (!this.modules.navigation) return;
        
        const currentRange = this.modules.navigation.radarScale;
        const zoomFactor = deltaY > 0 ? 1.2 : 0.8;
        const newRange = Math.max(10, Math.min(1000, currentRange * zoomFactor));
        
        this.modules.navigation.setRadarRange(newRange);
        
        // Show zoom level
        this.showNotification('Radar Range', `${newRange.toFixed(0)} km`);
    }

    showSystemDetails(systemItem) {
        // Add highlight effect
        systemItem.classList.add('pulse');
        setTimeout(() => {
            systemItem.classList.remove('pulse');
        }, 600);
        
        // Show system information (could open modal in future)
        const systemName = systemItem.querySelector('.system-name')?.textContent;
        console.log(`Showing details for ${systemName}`);
    }
    
    initializeCareersSystem() {
        // Initialize the careers system in the management dashboard
        if (window.SpaceTourismCareers && document.getElementById('careersGrid')) {
            // Create instance for management dashboard
            this.careersSystem = new window.SpaceTourismCareers();
            
            // Override renderCareerCards to target management dashboard
            this.careersSystem.renderCareerCards = function() {
                const careersGrid = document.getElementById('careersGrid');
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
            
            // Render the career cards
            this.careersSystem.renderCareerCards();
        }
    }
    
    // Data Management
    refreshAllData() {
        console.log('🔄 Refreshing all data...');
        
        // Show loading indicator
        this.showNotification('System Update', 'Refreshing all data...');
        
        // Refresh each module
        if (this.modules.vitals) {
            this.modules.vitals.fetchVitalSigns();
        }
        
        if (this.modules.navigation) {
            this.modules.navigation.fetchNavigationData();
        }
        
        // Update system status
        this.checkSystemHealth();
    }

    refreshCriticalData() {
        // Only refresh critical data that needs frequent updates
        if (this.modules.vitals && !this.modules.vitals.isConnected) {
            this.modules.vitals.fetchVitalSigns();
        }
    }

    shouldRefreshData() {
        // Logic to determine if data refresh is needed
        return window.authManager && window.authManager.isAuthenticated();
    }

    // System Monitoring
    checkSystemHealth() {
        // Simulate system health checks
        const systems = ['communication', 'power', 'lifeSupport', 'aiAssistant'];
        
        systems.forEach(system => {
            // Simulate occasional system warnings (5% chance)
            if (Math.random() < 0.05) {
                this.systemStatus[system] = 'warning';
            } else if (Math.random() < 0.02) {
                this.systemStatus[system] = 'offline';
            } else {
                this.systemStatus[system] = 'online';
            }
        });
        
        // Check actual connection status
        if (this.modules.vitals && !this.modules.vitals.isConnected) {
            this.systemStatus.communication = 'warning';
        }
    }

    updateSystemStatus() {
        const systemItems = document.querySelectorAll('.system-item');
        const systems = ['communication', 'power', 'lifeSupport', 'aiAssistant'];
        
        systemItems.forEach((item, index) => {
            if (index < systems.length) {
                const system = systems[index];
                const statusElement = item.querySelector('.system-status');
                
                if (statusElement) {
                    const status = this.systemStatus[system];
                    statusElement.className = `system-status ${status}`;
                    statusElement.textContent = this.getStatusText(status);
                }
            }
        });
    }

    getStatusText(status) {
        switch (status) {
            case 'online':
                return 'Online';
            case 'warning':
                return 'Warning';
            case 'offline':
                return 'Offline';
            default:
                return 'Unknown';
        }
    }

    // Utility Methods
    updateTimeDisplay() {
        // Add mission time display if needed
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        
        // Could add mission elapsed time calculation
        // For now, just ensure the interface stays updated
    }

    monitorPerformance() {
        // Basic performance monitoring
        const used = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const total = performance.memory ? performance.memory.totalJSHeapSize : 0;
        
        if (used / total > 0.9) {
            console.warn('High memory usage detected');
        }
    }

    handleResize() {
        // Notify modules of resize
        if (this.modules.navigation) {
            this.modules.navigation.resizeCanvas();
        }
        
        // Refresh charts if they exist
        if (this.modules.vitals && this.modules.vitals.charts) {
            Object.values(this.modules.vitals.charts).forEach(chart => {
                if (chart && chart.drawChart) {
                    setTimeout(() => chart.drawChart(chart), 100);
                }
            });
        }
    }

    getVitalType(vitalCard) {
        if (vitalCard.classList.contains('heart-rate')) return 'Heart Rate';
        if (vitalCard.classList.contains('oxygen')) return 'Oxygen Level';
        if (vitalCard.classList.contains('temperature')) return 'Body Temperature';
        if (vitalCard.classList.contains('blood-pressure')) return 'Blood Pressure';
        return 'Unknown Vital';
    }

    focusAlerts() {
        const alertsPanel = document.querySelector('.alerts-panel');
        if (alertsPanel) {
            alertsPanel.scrollIntoView({ behavior: 'smooth' });
            alertsPanel.classList.add('bounce-in');
            setTimeout(() => {
                alertsPanel.classList.remove('bounce-in');
            }, 600);
        }
    }

    clearFocus() {
        // Remove any active states or close modals
        document.querySelectorAll('.active, .focused').forEach(el => {
            el.classList.remove('active', 'focused');
        });
    }

    showNotification(title, message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--gradient-secondary);
            color: var(--text-primary);
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: var(--shadow-medium);
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 10000;
            animation: slide-in-right 0.3s ease forwards;
            max-width: 300px;
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after delay
        setTimeout(() => {
            notification.style.animation = 'slide-out-right 0.3s ease forwards';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Public API
    getModules() {
        return this.modules;
    }

    getSystemStatus() {
        return this.systemStatus;
    }

    isInitialized() {
        return this.initialized;
    }

    // Mission Mode Toggle
    setupMissionModeToggle() {
        const toggleBtn = document.getElementById('toggleMissionMode');
        const missionButtons = document.querySelectorAll('.mission-btn');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleMissionMode();
            });
        }
        
        // Handle mission type selection in login
        missionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                missionButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                const missionType = btn.dataset.mission;
                this.setMissionMode(missionType);
            });
        });
    }

    setMissionMode(mode) {
        this.currentMode = mode;
        
        // Update dashboard title and icon based on mode
        const dashboardIcon = document.getElementById('dashboard-icon');
        const dashboardTitle = document.getElementById('dashboard-title-text');
        const modeToggleText = document.getElementById('modeToggleText');
        
        if (mode === 'earth-monitoring') {
            if (dashboardIcon) {
                dashboardIcon.className = 'fas fa-globe-americas';
            }
            if (dashboardTitle) {
                dashboardTitle.textContent = 'Earth Monitoring Control';
            }
            if (modeToggleText) {
                modeToggleText.innerHTML = '<i class="fas fa-rocket"></i> Switch to Space Tourism';
            }
        } else {
            if (dashboardIcon) {
                dashboardIcon.className = 'fas fa-rocket';
            }
            if (dashboardTitle) {
                dashboardTitle.textContent = 'AstroHELP Mission Control';
            }
            if (modeToggleText) {
                modeToggleText.innerHTML = '<i class="fas fa-globe-americas"></i> Switch to Earth Monitoring';
            }
        }
    }

    toggleMissionMode() {
        const standardDashboard = document.querySelector('.dashboard-grid');
        const earthDashboard = document.getElementById('earthMonitoringDashboard');
        const toggleBtn = document.getElementById('toggleMissionMode');
        
        if (this.currentMode === 'space-tourism') {
            // Switch to Earth Monitoring
            this.currentMode = 'earth-monitoring';
            
            if (standardDashboard) {
                standardDashboard.style.display = 'none';
            }
            if (earthDashboard) {
                earthDashboard.classList.remove('hidden');
                earthDashboard.style.display = 'block';
            }
            
            // Update button and title
            this.setMissionMode('earth-monitoring');
            
            // Activate Earth monitoring system
            if (window.earthMonitoringSystem) {
                window.earthMonitoringSystem.activate();
            }
            
            // Add transition effect
            if (earthDashboard) {
                earthDashboard.style.opacity = '0';
                earthDashboard.style.transform = 'translateY(20px)';
                
                requestAnimationFrame(() => {
                    earthDashboard.style.transition = 'all 0.5s ease';
                    earthDashboard.style.opacity = '1';
                    earthDashboard.style.transform = 'translateY(0)';
                });
            }
            
        } else {
            // Switch to Space Tourism
            this.currentMode = 'space-tourism';
            
            if (earthDashboard) {
                earthDashboard.style.display = 'none';
                earthDashboard.classList.add('hidden');
            }
            if (standardDashboard) {
                standardDashboard.style.display = 'grid';
            }
            
            // Update button and title
            this.setMissionMode('space-tourism');
            
            // Deactivate Earth monitoring system
            if (window.earthMonitoringSystem) {
                window.earthMonitoringSystem.deactivate();
            }
        }
        
        // Add button feedback
        if (toggleBtn) {
            toggleBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                toggleBtn.style.transform = '';
            }, 150);
        }
        
        console.log(`Switched to ${this.currentMode} mode`);
    }

    getCurrentMode() {
        return this.currentMode;
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
        
        // Initialize careers system
        this.initializeCareersSystem();
    }
}

// Initialize dashboard
window.dashboard = new Dashboard();
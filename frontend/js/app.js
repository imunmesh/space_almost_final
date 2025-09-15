// AstroHELP Main Application
class AstroHELPApp {
    constructor() {
        this.version = '1.0.0';
        this.initialized = false;
        this.config = {
            apiBaseURL: window.API_BASE_URL || 'http://localhost:8001',
            websocketURL: (window.API_BASE_URL || 'http://localhost:8001').replace('http', 'ws'),
            refreshInterval: 5000,
            alertThresholds: {
                heartRate: { min: 50, max: 120, critical: { min: 40, max: 140 } },
                oxygenLevel: { min: 92, critical: { min: 88 } },
                bodyTemperature: { min: 36.0, max: 38.5, critical: { min: 35.0, max: 39.5 } },
                bloodPressure: { min: 90, max: 140, critical: { min: 80, max: 160 } }
            }
        };
        this.modules = {};
        this.eventListeners = {};
    }

    async init() {
        if (this.initialized) {
            console.warn('AstroHELP already initialized');
            return;
        }

        console.log('🚀 AstroHELP Space Tourism Monitoring System');
        console.log(`📡 Version ${this.version}`);
        console.log('🔧 Initializing systems...');

        try {
            // Initialize core systems
            await this.initializeCore();
            
            // Set up error handling
            this.setupErrorHandling();
            
            // Set up event system
            this.setupEventSystem();
            
            // Initialize UI
            this.initializeUI();
            
            // Set up performance monitoring
            this.setupPerformanceMonitoring();
            
            // Mark as initialized
            this.initialized = true;
            
            console.log('✅ AstroHELP initialization complete');
            this.emit('app:initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize AstroHELP:', error);
            this.handleInitializationError(error);
        }
    }

    async initializeCore() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Initialize modules in order
        this.modules.roleManager = window.roleManager;
        this.modules.debrisTracker = window.debrisTracker;
        this.modules.aiAssistant = window.enhancedAIAssistant || window.aiAssistant;
        this.modules.radarSystem = window.radarSystem;
        this.modules.spaceMap = window.spaceMap;
        this.modules.dashboard = window.dashboard;
        this.modules.vitals = window.vitalSignsMonitor;
        this.modules.navigation = window.navigationSystem;
        this.modules.spaceWeather = window.spaceWeatherDashboard;
        this.modules.voiceCommands = window.voiceCommandSystem;
        this.modules.animations = window.animationController;

        // Verify all modules are available
        const missingModules = Object.entries(this.modules)
            .filter(([name, module]) => !module)
            .map(([name]) => name);

        if (missingModules.length > 0) {
            throw new Error(`Missing modules: ${missingModules.join(', ')}`);
        }

        console.log('📦 All modules loaded successfully');
    }



    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleError('JavaScript Error', event.error);
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('Unhandled Promise Rejection', event.reason);
        });

        // Custom error handler for role selection errors
        this.on('role:error', (error) => {
            this.handleRoleError(error);
        });

        // Custom error handler for connection errors
        this.on('connection:error', (error) => {
            this.handleConnectionError(error);
        });
    }

    setupEventSystem() {
        // Create event emitter functionality
        this.eventListeners = {};
        
        // Set up cross-module communication
        this.setupModuleCommunication();
        
        // Set up user interaction tracking
        this.setupUserInteractionTracking();
    }

    setupModuleCommunication() {
        // When role is selected
        this.on('role:selected', (role) => {
            console.log('🎯 Role selected:', role);
            if (role === 'nasa') {
                // Handle NASA role selection
                this.handleNASARole();
            } else {
                this.modules.dashboard.init();
            }
        });

        this.on('role:exit', () => {
            console.log('🔓 Role exited');
            this.cleanup();
        });

        // When vital signs are updated
        this.on('vitals:updated', (vitals) => {
            this.handleVitalsUpdate(vitals);
        });

        // When alerts are triggered
        this.on('alert:triggered', (alert) => {
            this.handleAlert(alert);
        });

        // When navigation data is updated
        this.on('navigation:updated', (data) => {
            this.handleNavigationUpdate(data);
        });
    }

    setupUserInteractionTracking() {
        // Track user engagement
        let lastActivity = Date.now();
        
        const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        activities.forEach(activity => {
            document.addEventListener(activity, () => {
                lastActivity = Date.now();
            }, true);
        });

        // Check for inactivity
        setInterval(() => {
            const inactiveTime = Date.now() - lastActivity;
            if (inactiveTime > 300000) { // 5 minutes
                this.handleUserInactivity(inactiveTime);
            }
        }, 60000); // Check every minute
    }

    initializeUI() {
        // Add app-level UI interactions
        this.setupGlobalKeyboardShortcuts();
        this.setupAccessibility();
        
        // Set up responsive design handlers
        this.setupResponsiveHandlers();
    }

    setupGlobalKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Emergency shutdown: Ctrl+Shift+Q
            if (event.ctrlKey && event.shiftKey && event.key === 'Q') {
                event.preventDefault();
                this.emergencyShutdown();
            }
            
            // Quick refresh: F5
            if (event.key === 'F5') {
                event.preventDefault();
                this.refreshSystem();
            }
        });
    }



    setupAccessibility() {
        // Keyboard navigation improvements
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Screen reader announcements
        this.setupScreenReaderSupport();
    }

    setupScreenReaderSupport() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);

        this.liveRegion = liveRegion;
    }

    setupPerformanceMonitoring() {
        // Monitor frame rate
        let frameCount = 0;
        let lastTime = performance.now();

        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                if (fps < 30) {
                    console.warn(`Low FPS detected: ${fps}`);
                    this.optimizePerformance();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }

    setupResponsiveHandlers() {
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 500);
        });

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    // Event System
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.eventListeners[event]) return;
        const index = this.eventListeners[event].indexOf(callback);
        if (index > -1) {
            this.eventListeners[event].splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    // Event Handlers
    handleVitalsUpdate(vitals) {
        // Check for critical conditions
        const alerts = this.checkVitalAlerts(vitals);
        alerts.forEach(alert => {
            this.emit('alert:triggered', alert);
        });
    }

    handleAlert(alert) {
        console.warn('🚨 Alert triggered:', alert);
        
        // Announce to screen readers
        this.announceToScreenReader(`Alert: ${alert.message}`);
        
        // Trigger visual/audio feedback
        if (alert.severity === 'critical') {
            this.modules.animations?.triggerCriticalAlert();
        } else {
            this.modules.animations?.triggerWarningAlert();
        }
    }

    handleNavigationUpdate(data) {
        // Check for collision risks
        if (data.obstacles) {
            const highRiskObstacles = data.obstacles.filter(
                obs => obs.threat_level === 'high' || obs.threat_level === 'critical'
            );
            
            if (highRiskObstacles.length > 0) {
                this.emit('alert:triggered', {
                    type: 'navigation',
                    severity: 'warning',
                    message: `${highRiskObstacles.length} high-risk obstacles detected`
                });
            }
        }
    }

    handleError(type, error) {
        console.error(`${type}:`, error);
        
        // Log error for monitoring
        this.logError(type, error);
        
        // Show user-friendly error message
        this.showErrorNotification(type, error);
    }

    handleRoleError(error) {
        console.error('Role selection error:', error);
        // Reset to role selection on role errors
        if (this.modules.roleManager) {
            this.modules.roleManager.showRoleSelection();
        }
    }

    handleConnectionError(error) {
        console.error('Connection error:', error);
        this.showConnectionError();
    }

    handleUserInactivity(inactiveTime) {
        console.log(`User inactive for ${Math.round(inactiveTime / 60000)} minutes`);
        

    }

    handleInitializationError(error) {
        // Show critical error screen
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: var(--space-dark);
                color: var(--text-primary);
                font-family: 'Exo 2', sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <h1 style="color: var(--critical-red); margin-bottom: 20px;">
                    🚨 System Initialization Failed
                </h1>
                <p style="margin-bottom: 20px;">
                    AstroHELP encountered a critical error during startup.
                </p>
                <p style="color: var(--text-muted); font-size: 0.9rem;">
                    Error: ${error.message}
                </p>
                <button onclick="location.reload()" style="
                    margin-top: 30px;
                    padding: 10px 20px;
                    background: var(--gradient-primary);
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">
                    Restart System
                </button>
            </div>
        `;
    }

    // Utility Methods
    checkVitalAlerts(vitals) {
        const alerts = [];
        const thresholds = this.config.alertThresholds;

        // Heart rate check
        if (vitals.heart_rate > thresholds.heartRate.critical.max || 
            vitals.heart_rate < thresholds.heartRate.critical.min) {
            alerts.push({
                type: 'heart_rate_critical',
                severity: 'critical',
                message: `Critical heart rate: ${vitals.heart_rate} BPM`
            });
        } else if (vitals.heart_rate > thresholds.heartRate.max || 
                   vitals.heart_rate < thresholds.heartRate.min) {
            alerts.push({
                type: 'heart_rate_warning',
                severity: 'warning',
                message: `Heart rate out of range: ${vitals.heart_rate} BPM`
            });
        }

        // Add similar checks for other vitals...

        return alerts;
    }

    announceToScreenReader(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
        }
    }

    logError(type, error) {
        // In production, send to monitoring service
        const errorLog = {
            timestamp: new Date().toISOString(),
            type: type,
            message: error.message,
            stack: error.stack,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // Store locally for now
        const logs = JSON.parse(localStorage.getItem('astrohelp_errors') || '[]');
        logs.push(errorLog);
        
        // Keep only last 50 errors
        if (logs.length > 50) {
            logs.splice(0, logs.length - 50);
        }
        
        localStorage.setItem('astrohelp_errors', JSON.stringify(logs));
    }

    // System Management
    refreshSystem() {
        console.log('🔄 Refreshing system...');
        
        if (this.modules.dashboard) {
            this.modules.dashboard.refreshAllData();
        }
        
        this.emit('system:refresh');
    }

    emergencyShutdown() {
        console.log('🛑 Emergency shutdown initiated');
        
        // Cleanup all modules
        this.cleanup();
        
        // Show shutdown screen
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: var(--space-dark);
                color: var(--text-primary);
                font-family: 'Exo 2', sans-serif;
                text-align: center;
            ">
                <div>
                    <h1 style="color: var(--critical-red);">⚠️ Emergency Shutdown</h1>
                    <p>AstroHELP has been safely shut down.</p>
                    <button onclick="location.reload()" style="
                        margin-top: 20px;
                        padding: 10px 20px;
                        background: var(--gradient-primary);
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    ">
                        Restart System
                    </button>
                </div>
            </div>
        `;
    }



    optimizePerformance() {
        console.log('⚡ Optimizing performance...');
        
        // Reduce animation complexity
        if (this.modules.animations) {
            this.modules.animations.reduceAnimations();
        }
        
        // Increase update intervals
        this.config.refreshInterval = Math.min(this.config.refreshInterval * 1.5, 30000);
    }



    cleanup() {
        // Cleanup all modules
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
        });
        
        // Clear intervals and timeouts
        this.emit('app:cleanup');
    }

    handleOrientationChange() {
        this.emit('orientation:changed');
    }

    handleResize() {
        this.emit('window:resized');
    }

    // Notification methods
    showErrorNotification(type, error) {
        if (this.modules.roleManager && typeof this.modules.roleManager.showNotification === 'function') {
            this.modules.roleManager.showNotification(`${type}: ${error.message}`, 'error');
        }
    }





    // Public API
    getVersion() {
        return this.version;
    }

    getConfig() {
        return { ...this.config };
    }

    getModules() {
        return this.modules;
    }

    isInitialized() {
        return this.initialized;
    }
    
    handleNASARole() {
        console.log('🚀 Initializing NASA Operations Console...');
        
        // Hide role selection and show NASA dashboard
        document.getElementById('roleSelectionScreen').classList.add('hidden');
        document.getElementById('nasaDashboard').classList.remove('hidden');
        
        // Initialize NASA operations if available
        if (window.nasaOperations) {
            console.log('🏢 NASA Operations initialized successfully');
        } else {
            console.warn('⚠️ NASA Operations module not loaded, attempting to initialize...');
            // Try to reinitialize after a short delay to allow scripts to load
            setTimeout(() => {
                if (window.NASAOperationsController) {
                    window.nasaOperations = new NASAOperationsController();
                    console.log('🔄 NASA Operations manually initialized');
                } else {
                    console.error('❌ NASA Operations Controller class not found');
                    // Show error message to user
                    const errorDiv = document.createElement('div');
                    errorDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,0,0,0.9); color: white; padding: 20px; border-radius: 10px; z-index: 10000;';
                    errorDiv.innerHTML = '<h3>NASA Operations Error</h3><p>Failed to load NASA Operations module. Please refresh the page.</p><button onclick="this.parentElement.remove()">Close</button>';
                    document.body.appendChild(errorDiv);
                }
            }, 100);
        }
    }
}

// Initialize the application
const astroHELP = new AstroHELPApp();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        astroHELP.init();
    });
} else {
    astroHELP.init();
}

// Make available globally
window.astroHELP = astroHELP;

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AstroHELPApp;
}
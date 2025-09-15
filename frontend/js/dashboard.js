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
    
    // Initialize Bookings Management System
    initializeBookingsSystem() {
        console.log('🚀 Initializing Bookings Management System...');
        
        // Set up event listeners for bookings management
        this.setupBookingsEventListeners();
        
        // Load initial bookings data
        this.loadBookingsData();
        
        // Set up real-time updates
        this.setupBookingsUpdates();
        
        console.log('✅ Bookings Management System initialized');
    }
    
    setupBookingsEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshBookings');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('🔄 Refresh button clicked');
                this.loadBookingsData();
                this.showNotification('Bookings Refreshed', 'Booking data has been updated');
            });
        }
        
        // Search input
        const searchInput = document.getElementById('bookingsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterBookings();
            });
        }
        
        // Filter select
        const filterSelect = document.getElementById('bookingsFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                this.filterBookings();
            });
        }
    }
    
    loadBookingsData() {
        console.log('🔄 Loading bookings data...');
        
        // Get bookings from localStorage
        const bookings = JSON.parse(localStorage.getItem('spaceTourBookings')) || [];
        
        console.log('Found bookings:', bookings);
        
        // Update the bookings table
        this.updateBookingsTable(bookings);
        
        // Update summary statistics
        this.updateBookingsSummary(bookings);
        
        console.log('✅ Bookings data loaded and UI updated');
    }
    
    updateBookingsTable(bookings) {
        const tableBody = document.getElementById('bookingsTableBody');
        if (!tableBody) return;
        
        // Clear existing content
        tableBody.innerHTML = '';
        
        // Update total bookings count
        const totalBookingsEl = document.getElementById('totalBookings');
        if (totalBookingsEl) {
            totalBookingsEl.textContent = bookings.length;
        }
        
        // Add each booking to the table
        bookings.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.id}</td>
                <td>${this.getTourName(booking.tour)}</td>
                <td>${booking.traveler.firstName} ${booking.traveler.lastName}</td>
                <td>${booking.date}</td>
                <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
                <td>${booking.total}</td>
                <td>
                    <button class="btn btn-small btn-outline view-booking" data-booking-id="${booking.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-small btn-secondary modify-booking" data-booking-id="${booking.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger cancel-booking" data-booking-id="${booking.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        this.setupBookingActionListeners();
    }
    
    setupBookingActionListeners() {
        // View booking buttons
        document.querySelectorAll('.view-booking').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.closest('.view-booking').getAttribute('data-booking-id');
                this.viewBookingDetails(bookingId);
            });
        });
        
        // Modify booking buttons
        document.querySelectorAll('.modify-booking').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.closest('.modify-booking').getAttribute('data-booking-id');
                this.modifyBooking(bookingId);
            });
        });
        
        // Cancel booking buttons
        document.querySelectorAll('.cancel-booking').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.closest('.cancel-booking').getAttribute('data-booking-id');
                this.cancelBooking(bookingId);
            });
        });
    }
    
    getTourName(tourKey) {
        const tourNames = {
            'orbit': 'Earth Orbit',
            'moon': 'Lunar Expedition',
            'mars': 'Mars Flyby'
        };
        return tourNames[tourKey] || 'Space Tour';
    }
    
    updateBookingsSummary(bookings) {
        // Calculate today's bookings
        const today = new Date().toDateString();
        const todaysBookings = bookings.filter(booking => {
            const bookingDate = new Date(booking.timestamp).toDateString();
            return bookingDate === today;
        }).length;
        
        // Calculate total revenue
        let totalRevenue = 0;
        bookings.forEach(booking => {
            // Extract numeric value from total string (e.g., "$277,500" -> 277500)
            const amount = parseFloat(booking.total.replace(/[^0-9.-]+/g, ""));
            if (!isNaN(amount)) {
                totalRevenue += amount;
            }
        });
        
        // Update UI elements
        const todaysBookingsEl = document.getElementById('todaysBookings');
        const totalRevenueEl = document.getElementById('totalRevenue');
        
        if (todaysBookingsEl) {
            todaysBookingsEl.textContent = todaysBookings;
        }
        
        if (totalRevenueEl) {
            totalRevenueEl.textContent = `$${totalRevenue.toLocaleString()}`;
        }
    }
    
    filterBookings() {
        console.log('🔍 Filtering bookings...');
        
        const searchTerm = document.getElementById('bookingsSearch').value.toLowerCase();
        const filterValue = document.getElementById('bookingsFilter').value;
        
        // Get all bookings
        const bookings = JSON.parse(localStorage.getItem('spaceTourBookings')) || [];
        
        // Filter bookings
        const filteredBookings = bookings.filter(booking => {
            // Filter by search term
            const matchesSearch = 
                booking.id.toLowerCase().includes(searchTerm) ||
                booking.traveler.firstName.toLowerCase().includes(searchTerm) ||
                booking.traveler.lastName.toLowerCase().includes(searchTerm) ||
                this.getTourName(booking.tour).toLowerCase().includes(searchTerm);
            
            // Filter by tour type
            const matchesFilter = filterValue === 'all' || booking.tour === filterValue;
            
            return matchesSearch && matchesFilter;
        });
        
        console.log('Filtered bookings:', filteredBookings);
        
        // Update the table with filtered bookings
        this.updateBookingsTable(filteredBookings);
    }
    
    viewBookingDetails(bookingId) {
        const bookings = JSON.parse(localStorage.getItem('spaceTourBookings')) || [];
        const booking = bookings.find(b => b.id === bookingId);
        
        if (!booking) {
            this.showNotification('Booking Not Found', 'The requested booking could not be found', 'error');
            return;
        }
        
        // Create modal for booking details
        const modal = document.createElement('div');
        modal.className = 'booking-details-modal';
        modal.innerHTML = `
            <div class="booking-details-modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-ticket-alt"></i> Booking Details</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="booking-details-grid">
                        <div class="detail-group">
                            <h3>Booking Information</h3>
                            <div class="detail-item">
                                <span class="label">Booking ID:</span>
                                <span class="value">${booking.id}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Tour:</span>
                                <span class="value">${this.getTourName(booking.tour)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Date:</span>
                                <span class="value">${booking.date}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Status:</span>
                                <span class="value"><span class="status-badge status-${booking.status}">${booking.status}</span></span>
                            </div>
                        </div>
                        
                        <div class="detail-group">
                            <h3>Customer Information</h3>
                            <div class="detail-item">
                                <span class="label">Name:</span>
                                <span class="value">${booking.traveler.firstName} ${booking.traveler.lastName}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Email:</span>
                                <span class="value">${booking.traveler.email}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Phone:</span>
                                <span class="value">${booking.traveler.phone || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Age:</span>
                                <span class="value">${booking.traveler.age}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Passport:</span>
                                <span class="value">${booking.traveler.passport}</span>
                            </div>
                        </div>
                        
                        <div class="detail-group">
                            <h3>Financial Information</h3>
                            <div class="detail-item">
                                <span class="label">Total Paid:</span>
                                <span class="value">${booking.total}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Booking Date:</span>
                                <span class="value">${new Date(booking.timestamp).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-secondary print-ticket">
                            <i class="fas fa-print"></i> Print Ticket
                        </button>
                        <button class="btn btn-primary close-modal-btn">
                            <i class="fas fa-check"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to document
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.close-modal-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.print-ticket').addEventListener('click', () => {
            this.printTicket(booking);
        });
    }
    
    modifyBooking(bookingId) {
        // For now, we'll just show a notification that this feature is available
        this.showNotification('Modify Booking', 'Booking modification feature would open the booking form with pre-filled data', 'info');
    }
    
    cancelBooking(bookingId) {
        const bookings = JSON.parse(localStorage.getItem('spaceTourBookings')) || [];
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex === -1) {
            this.showNotification('Booking Not Found', 'The requested booking could not be found', 'error');
            return;
        }
        
        // Confirm cancellation
        if (confirm(`Are you sure you want to cancel booking ${bookingId}?`)) {
            // Remove booking
            bookings.splice(bookingIndex, 1);
            
            // Update localStorage
            localStorage.setItem('spaceTourBookings', JSON.stringify(bookings));
            
            // Refresh the bookings display
            this.loadBookingsData();
            
            // Show success notification
            this.showNotification('Booking Cancelled', `Booking ${bookingId} has been successfully cancelled`, 'success');
        }
    }
    
    printTicket(booking) {
        // Create a simple printable version
        const printContent = `
            ASTROHELP SPACE TOUR TICKET
            ============================
            Booking ID: ${booking.id}
            Tour: ${this.getTourName(booking.tour)}
            Date: ${booking.date}
            Traveler: ${booking.traveler.firstName} ${booking.traveler.lastName}
            Email: ${booking.traveler.email}
            Passport: ${booking.traveler.passport}
            Total Paid: ${booking.total}
            Status: ${booking.status.toUpperCase()}
            
            IMPORTANT INFORMATION:
            - Please arrive at the spaceport 2 hours before departure
            - Bring your passport and this ticket
            - Follow all safety instructions from crew members
            - Enjoy your space adventure!
            
            For assistance, contact: support@astrohelp.com
        `;
        
        // Create a temporary iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.top = '-1000px';
        document.body.appendChild(iframe);
        
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <html>
                <head>
                    <title>Booking Ticket - ${booking.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        pre { white-space: pre-wrap; }
                    </style>
                </head>
                <body>
                    <pre>${printContent}</pre>
                </body>
            </html>
        `);
        doc.close();
        
        // Print and clean up
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    }
    
    setupBookingsUpdates() {
        console.log('🔄 Setting up bookings updates...');
        
        // Clear any existing interval to prevent multiple intervals
        if (this.bookingsUpdateInterval) {
            clearInterval(this.bookingsUpdateInterval);
        }
        
        // Set up periodic updates (every 30 seconds)
        this.bookingsUpdateInterval = setInterval(() => {
            console.log('⏰ Bookings update interval triggered');
            this.loadBookingsData();
        }, 30000);
        
        console.log('✅ Bookings updates set up with 30-second interval');
    }
    
    // Clean up bookings updates interval
    cleanupBookingsUpdates() {
        if (this.bookingsUpdateInterval) {
            clearInterval(this.bookingsUpdateInterval);
            this.bookingsUpdateInterval = null;
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
        console.log('🚀 Showing Management Dashboard...');
        
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
        
        // Initialize bookings management system
        this.initializeBookingsSystem();
        
        console.log('✅ Management Dashboard shown and systems initialized');
    }
}

// Initialize dashboard
window.dashboard = new Dashboard();
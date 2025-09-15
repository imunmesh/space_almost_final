// Space Weather Dashboard Module
class SpaceWeatherDashboard {
    constructor() {
        this.baseURL = 'http://localhost:8000';
        this.currentWeather = null;
        this.updateInterval = null;
        this.alertsContainer = null;
        this.weatherChart = null;
    }

    init() {
        this.createWeatherPanel();
        this.setupEventListeners();
        this.startPeriodicUpdates();
    }

    createWeatherPanel() {
        // Find or create weather panel in the dashboard grid
        const dashboardGrid = document.querySelector('.dashboard-grid');
        if (!dashboardGrid) return;

        const weatherPanel = document.createElement('section');
        weatherPanel.className = 'panel space-weather-panel';
        weatherPanel.innerHTML = `
            <div class="panel-header">
                <h2><i class="fas fa-sun"></i> Space Weather</h2>
                <div class="weather-status" id="weatherStatus">
                    <span class="status-indicator normal"></span>
                    <span>Nominal</span>
                </div>
            </div>
            
            <div class="weather-content">
                <div class="weather-grid">
                    <div class="weather-metric solar-wind">
                        <div class="metric-icon">
                            <i class="fas fa-wind"></i>
                        </div>
                        <div class="metric-info">
                            <span class="metric-label">Solar Wind</span>
                            <span class="metric-value" id="solarWindSpeed">400</span>
                            <span class="metric-unit">km/s</span>
                        </div>
                        <div class="metric-trend">
                            <canvas id="solarWindChart" width="60" height="30"></canvas>
                        </div>
                    </div>
                    
                    <div class="weather-metric radiation">
                        <div class="metric-icon">
                            <i class="fas fa-radiation"></i>
                        </div>
                        <div class="metric-info">
                            <span class="metric-label">Cosmic Radiation</span>
                            <span class="metric-value" id="radiationLevel">50</span>
                            <span class="metric-unit">%</span>
                        </div>
                        <div class="metric-trend">
                            <canvas id="radiationChart" width="60" height="30"></canvas>
                        </div>
                    </div>
                    
                    <div class="weather-metric geomagnetic">
                        <div class="metric-icon">
                            <i class="fas fa-globe"></i>
                        </div>
                        <div class="metric-info">
                            <span class="metric-label">Kp Index</span>
                            <span class="metric-value" id="kpIndex">2.0</span>
                            <span class="metric-unit">scale</span>
                        </div>
                        <div class="kp-scale">
                            <div class="kp-bar" id="kpBar"></div>
                        </div>
                    </div>
                    
                    <div class="weather-metric solar-flare">
                        <div class="metric-icon">
                            <i class="fas fa-fire"></i>
                        </div>
                        <div class="metric-info">
                            <span class="metric-label">Solar Activity</span>
                            <span class="metric-value" id="solarFlareClass">C1.0</span>
                            <span class="metric-unit">class</span>
                        </div>
                        <div class="flare-indicator">
                            <div class="flare-level" id="flareLevel"></div>
                        </div>
                    </div>
                </div>
                
                <div class="weather-alerts" id="spaceWeatherAlerts">
                    <h3><i class="fas fa-exclamation-triangle"></i> Space Weather Alerts</h3>
                    <div class="alerts-container" id="weatherAlertsContainer">
                        <div class="no-alerts">
                            <i class="fas fa-check-circle"></i>
                            <p>No weather alerts</p>
                        </div>
                    </div>
                </div>
                
                <div class="weather-forecast">
                    <h3><i class="fas fa-clock"></i> 24-Hour Forecast</h3>
                    <div class="forecast-chart">
                        <canvas id="forecastChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>
        `;

        // Insert after existing panels
        dashboardGrid.appendChild(weatherPanel);
        this.alertsContainer = weatherPanel.querySelector('#weatherAlertsContainer');
    }

    setupEventListeners() {
        // Add refresh button functionality
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'refresh-btn';
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        refreshBtn.onclick = () => this.refreshWeatherData();
        
        const weatherHeader = document.querySelector('.space-weather-panel .panel-header');
        if (weatherHeader) {
            weatherHeader.appendChild(refreshBtn);
        }
    }

    startPeriodicUpdates() {
        // Initial fetch
        this.fetchWeatherData();
        
        // Update every 5 minutes
        this.updateInterval = setInterval(() => {
            this.fetchWeatherData();
        }, 300000);
    }

    async fetchWeatherData() {
        try {
            if (!window.authManager || !window.authManager.isAuthenticated()) {
                return;
            }

            const response = await window.authManager.makeAuthenticatedRequest(
                `${this.baseURL}/space-weather/current`
            );

            if (response.ok) {
                const weatherData = await response.json();
                this.updateWeatherDisplay(weatherData);
                this.currentWeather = weatherData;
                
                // Also fetch alerts
                const alertsResponse = await window.authManager.makeAuthenticatedRequest(
                    `${this.baseURL}/space-weather/alerts`
                );
                
                if (alertsResponse.ok) {
                    const alerts = await alertsResponse.json();
                    this.updateWeatherAlerts(alerts);
                }
            }
        } catch (error) {
            console.error('Error fetching space weather data:', error);
        }
    }

    updateWeatherDisplay(weatherData) {
        // Update solar wind
        const solarWindElement = document.getElementById('solarWindSpeed');
        if (solarWindElement) {
            solarWindElement.textContent = Math.round(weatherData.solar_wind_speed);
            this.updateMetricStatus('.solar-wind', weatherData.solar_wind_speed, 400, 600);
        }

        // Update radiation
        const radiationElement = document.getElementById('radiationLevel');
        if (radiationElement) {
            radiationElement.textContent = weatherData.cosmic_radiation_level.toFixed(1);
            this.updateMetricStatus('.radiation', weatherData.cosmic_radiation_level, 50, 75);
        }

        // Update Kp index
        const kpElement = document.getElementById('kpIndex');
        if (kpElement) {
            kpElement.textContent = weatherData.kp_index.toFixed(1);
            this.updateKpScale(weatherData.kp_index);
        }

        // Update solar flare
        const flareElement = document.getElementById('solarFlareClass');
        if (flareElement) {
            flareElement.textContent = weatherData.solar_flare_class || 'Quiet';
            this.updateFlareIndicator(weatherData.solar_flare_class);
        }

        // Update overall status
        this.updateOverallWeatherStatus(weatherData);
        
        // Update charts
        this.updateWeatherCharts(weatherData);
    }

    updateMetricStatus(selector, value, warningThreshold, criticalThreshold) {
        const metric = document.querySelector(selector);
        if (!metric) return;

        metric.classList.remove('normal', 'warning', 'critical');

        if (value >= criticalThreshold) {
            metric.classList.add('critical');
        } else if (value >= warningThreshold) {
            metric.classList.add('warning');
        } else {
            metric.classList.add('normal');
        }
    }

    updateKpScale(kpValue) {
        const kpBar = document.getElementById('kpBar');
        if (!kpBar) return;

        const percentage = (kpValue / 9) * 100;
        kpBar.style.width = `${percentage}%`;

        // Color based on Kp index
        if (kpValue >= 5) {
            kpBar.style.background = 'var(--critical-red)';
        } else if (kpValue >= 4) {
            kpBar.style.background = 'var(--warning-yellow)';
        } else {
            kpBar.style.background = 'var(--plasma-green)';
        }
    }

    updateFlareIndicator(flareClass) {
        const flareLevel = document.getElementById('flareLevel');
        if (!flareLevel) return;

        if (!flareClass) {
            flareLevel.className = 'flare-level quiet';
            return;
        }

        const flareType = flareClass.charAt(0).toUpperCase();
        const flareIntensity = parseFloat(flareClass.substring(1)) || 1;

        flareLevel.className = `flare-level ${flareType.toLowerCase()}`;
        
        // Animate based on intensity
        if (flareType === 'X' || flareType === 'M') {
            flareLevel.style.animation = 'flare-pulse 1s ease-in-out infinite';
        } else {
            flareLevel.style.animation = 'none';
        }
    }

    updateOverallWeatherStatus(weatherData) {
        const statusElement = document.getElementById('weatherStatus');
        const statusIndicator = statusElement?.querySelector('.status-indicator');
        
        if (!statusElement || !statusIndicator) return;

        let status = 'normal';
        let statusText = 'Nominal';

        if (weatherData.weather_severity === 'critical') {
            status = 'critical';
            statusText = 'Severe';
        } else if (weatherData.weather_severity === 'high') {
            status = 'warning';
            statusText = 'Active';
        } else if (weatherData.weather_severity === 'medium') {
            status = 'warning';
            statusText = 'Minor';
        }

        statusIndicator.className = `status-indicator ${status}`;
        statusElement.lastChild.textContent = statusText;
    }

    updateWeatherAlerts(alerts) {
        if (!this.alertsContainer) return;

        this.alertsContainer.innerHTML = '';

        if (alerts.length === 0) {
            this.alertsContainer.innerHTML = `
                <div class="no-alerts">
                    <i class="fas fa-check-circle"></i>
                    <p>No weather alerts</p>
                </div>
            `;
            return;
        }

        alerts.forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = `weather-alert ${alert.severity}`;
            alertElement.innerHTML = `
                <div class="alert-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.alert_type.replace('_', ' ').toUpperCase()}</div>
                    <div class="alert-message">${alert.message}</div>
                </div>
                <div class="alert-time">${this.formatTime(alert.timestamp)}</div>
            `;
            this.alertsContainer.appendChild(alertElement);
        });
    }

    updateWeatherCharts(weatherData) {
        // Update mini trend charts (simplified)
        this.updateMiniChart('solarWindChart', weatherData.solar_wind_speed, '#4ecdc4');
        this.updateMiniChart('radiationChart', weatherData.cosmic_radiation_level, '#ff6b6b');
    }

    updateMiniChart(canvasId, value, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Simple trend visualization
        ctx.clearRect(0, 0, width, height);
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, width, height);
        
        // Current value bar
        const barHeight = (value / 100) * height; // Normalize to percentage
        ctx.fillStyle = color;
        ctx.fillRect(0, height - barHeight, width, barHeight);
        
        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 5;
        ctx.fillRect(0, height - barHeight, width, barHeight);
        ctx.shadowBlur = 0;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffMins < 1440) {
            return `${Math.floor(diffMins / 60)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    async refreshWeatherData() {
        try {
            // Show loading state
            const statusElement = document.getElementById('weatherStatus');
            if (statusElement) {
                statusElement.querySelector('span:last-child').textContent = 'Updating...';
            }

            // Trigger refresh on backend
            await window.authManager.makeAuthenticatedRequest(
                `${this.baseURL}/space-weather/refresh`,
                { method: 'POST' }
            );

            // Fetch updated data
            setTimeout(() => {
                this.fetchWeatherData();
            }, 2000);

        } catch (error) {
            console.error('Error refreshing weather data:', error);
        }
    }

    async getSafetyRecommendations() {
        try {
            const response = await window.authManager.makeAuthenticatedRequest(
                `${this.baseURL}/space-weather/solar-activity`
            );

            if (response.ok) {
                const data = await response.json();
                return data.recommendations || [];
            }
        } catch (error) {
            console.error('Error fetching safety recommendations:', error);
        }
        return [];
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize space weather dashboard
window.spaceWeatherDashboard = new SpaceWeatherDashboard();
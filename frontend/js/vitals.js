// Vital Signs Monitoring Module
class VitalSignsMonitor {
    constructor() {
        this.baseURL = 'http://localhost:8000';
        this.websocket = null;
        this.vitalsHistory = {
            heartRate: [],
            oxygenLevel: [],
            bodyTemp: [],
            bloodPressure: []
        };
        this.charts = {};
        this.alerts = [];
        this.isConnected = false;
        this.updateInterval = null;
    }

    init() {
        this.createCharts();
        this.setupWebSocket();
        this.startPeriodicUpdates();
    }

    createCharts() {
        // Create mini charts for each vital sign
        this.charts.heartRate = this.createChart('heartRateChart', '#ff6b6b');
        this.charts.oxygen = this.createChart('oxygenChart', '#4ecdc4');
        this.charts.temperature = this.createChart('tempChart', '#ffe66d');
        this.charts.bloodPressure = this.createChart('bpChart', '#ff8b94');
    }

    createChart(canvasId, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        const chart = {
            canvas: canvas,
            ctx: ctx,
            data: [],
            color: color,
            maxPoints: 20
        };

        this.drawChart(chart);
        return chart;
    }

    drawChart(chart) {
        const { ctx, canvas, data, color } = chart;
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (data.length < 2) return;

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Draw line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const stepX = width / (chart.maxPoints - 1);
        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const range = maxValue - minValue || 1;

        data.forEach((value, index) => {
            const x = index * stepX;
            const y = height - ((value - minValue) / range) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw dots
        ctx.fillStyle = color;
        data.forEach((value, index) => {
            const x = index * stepX;
            const y = height - ((value - minValue) / range) * height;
            
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    setupWebSocket() {
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            console.log('Authentication required for WebSocket connection');
            return;
        }

        const user = window.authManager.getUser();
        if (!user || !user.astronaut_id) {
            console.log('No astronaut ID available');
            return;
        }

        try {
            this.websocket = new WebSocket(`ws://localhost:8000/ws/vitals/${user.astronaut_id}`);
            
            this.websocket.onopen = () => {
                console.log('Vitals WebSocket connected');
                this.isConnected = true;
                this.updateConnectionStatus(true);
            };

            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'vitals_update') {
                        this.updateVitalSigns(data.vitals);
                        this.handleAlerts(data.alerts);
                    }
                } catch (error) {
                    console.error('WebSocket message parsing error:', error);
                }
            };

            this.websocket.onclose = () => {
                console.log('Vitals WebSocket disconnected');
                this.isConnected = false;
                this.updateConnectionStatus(false);
                
                // Attempt to reconnect after delay
                setTimeout(() => {
                    if (window.authManager && window.authManager.isAuthenticated()) {
                        this.setupWebSocket();
                    }
                }, 5000);
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnected = false;
                this.updateConnectionStatus(false);
            };

        } catch (error) {
            console.error('WebSocket setup error:', error);
            this.fallbackToPolling();
        }
    }

    fallbackToPolling() {
        console.log('Falling back to polling method');
        this.startPeriodicUpdates();
    }

    startPeriodicUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(async () => {
            if (!this.isConnected && window.authManager && window.authManager.isAuthenticated()) {
                await this.fetchVitalSigns();
            }
        }, 5000); // Update every 5 seconds when WebSocket is not connected
    }

    async fetchVitalSigns() {
        try {
            const response = await window.authManager.makeAuthenticatedRequest(
                `${this.baseURL}/vitals/current`
            );

            if (response.ok) {
                const vitals = await response.json();
                this.updateVitalSigns(vitals);
                
                // Also fetch alerts
                const alertsResponse = await window.authManager.makeAuthenticatedRequest(
                    `${this.baseURL}/alerts/active`
                );
                
                if (alertsResponse.ok) {
                    const alerts = await alertsResponse.json();
                    this.handleAlerts(alerts);
                }
            }
        } catch (error) {
            console.error('Error fetching vital signs:', error);
        }
    }

    updateVitalSigns(vitals) {
        // Update heart rate
        const heartRateElement = document.getElementById('heartRate');
        if (heartRateElement) {
            heartRateElement.textContent = Math.round(vitals.heart_rate);
            this.updateVitalStatus('heartRate', vitals.heart_rate, 60, 100);
        }

        // Update oxygen level
        const oxygenElement = document.getElementById('oxygenLevel');
        if (oxygenElement) {
            oxygenElement.textContent = vitals.oxygen_level.toFixed(1);
            this.updateVitalStatus('oxygenLevel', vitals.oxygen_level, 95, 100);
        }

        // Update body temperature
        const tempElement = document.getElementById('bodyTemp');
        if (tempElement) {
            tempElement.textContent = vitals.body_temperature.toFixed(1);
            this.updateVitalStatus('bodyTemp', vitals.body_temperature, 36.1, 37.5);
        }

        // Update blood pressure
        const bpElement = document.getElementById('bloodPressure');
        if (bpElement) {
            const systolic = Math.round(vitals.blood_pressure_systolic);
            const diastolic = Math.round(vitals.blood_pressure_diastolic);
            bpElement.textContent = `${systolic}/${diastolic}`;
            this.updateVitalStatus('bloodPressure', systolic, 90, 140);
        }

        // Update charts
        this.updateCharts(vitals);

        // Update overall vital status
        this.updateOverallStatus(vitals);
    }

    updateVitalStatus(vitalType, value, normalMin, normalMax) {
        const vitalCard = document.querySelector(`.vital-card.${vitalType.replace('Level', '').replace('Rate', '-rate').replace('Temp', 'temperature').replace('Pressure', '-pressure')}`);
        if (!vitalCard) return;

        // Remove existing status classes
        vitalCard.classList.remove('normal', 'warning', 'critical');

        // Determine status based on value ranges
        let status = 'normal';
        if (vitalType === 'heartRate') {
            if (value > 120 || value < 50) status = value > 140 || value < 40 ? 'critical' : 'warning';
        } else if (vitalType === 'oxygenLevel') {
            if (value < 92) status = value < 88 ? 'critical' : 'warning';
        } else if (vitalType === 'bodyTemp') {
            if (value > 38.5 || value < 36.0) status = value > 39.5 || value < 35.0 ? 'critical' : 'warning';
        } else if (vitalType === 'bloodPressure') {
            if (value > 140 || value < 90) status = value > 160 || value < 80 ? 'critical' : 'warning';
        }

        vitalCard.classList.add(status);
    }

    updateCharts(vitals) {
        // Update heart rate chart
        if (this.charts.heartRate) {
            this.vitalsHistory.heartRate.push(vitals.heart_rate);
            if (this.vitalsHistory.heartRate.length > this.charts.heartRate.maxPoints) {
                this.vitalsHistory.heartRate.shift();
            }
            this.charts.heartRate.data = [...this.vitalsHistory.heartRate];
            this.drawChart(this.charts.heartRate);
        }

        // Update oxygen chart
        if (this.charts.oxygen) {
            this.vitalsHistory.oxygenLevel.push(vitals.oxygen_level);
            if (this.vitalsHistory.oxygenLevel.length > this.charts.oxygen.maxPoints) {
                this.vitalsHistory.oxygenLevel.shift();
            }
            this.charts.oxygen.data = [...this.vitalsHistory.oxygenLevel];
            this.drawChart(this.charts.oxygen);
        }

        // Update temperature chart
        if (this.charts.temperature) {
            this.vitalsHistory.bodyTemp.push(vitals.body_temperature);
            if (this.vitalsHistory.bodyTemp.length > this.charts.temperature.maxPoints) {
                this.vitalsHistory.bodyTemp.shift();
            }
            this.charts.temperature.data = [...this.vitalsHistory.bodyTemp];
            this.drawChart(this.charts.temperature);
        }

        // Update blood pressure chart
        if (this.charts.bloodPressure) {
            this.vitalsHistory.bloodPressure.push(vitals.blood_pressure_systolic);
            if (this.vitalsHistory.bloodPressure.length > this.charts.bloodPressure.maxPoints) {
                this.vitalsHistory.bloodPressure.shift();
            }
            this.charts.bloodPressure.data = [...this.vitalsHistory.bloodPressure];
            this.drawChart(this.charts.bloodPressure);
        }
    }

    updateOverallStatus(vitals) {
        const statusElement = document.getElementById('vitalStatus');
        const statusIndicator = statusElement?.querySelector('.status-indicator');
        
        if (!statusElement || !statusIndicator) return;

        // Determine overall status
        let overallStatus = 'normal';
        let statusText = 'Normal';

        // Check for critical conditions
        if (vitals.heart_rate > 140 || vitals.heart_rate < 40 ||
            vitals.oxygen_level < 88 ||
            vitals.body_temperature > 39.5 || vitals.body_temperature < 35.0 ||
            vitals.blood_pressure_systolic > 160 || vitals.blood_pressure_systolic < 80) {
            overallStatus = 'critical';
            statusText = 'Critical';
        }
        // Check for warning conditions
        else if (vitals.heart_rate > 120 || vitals.heart_rate < 50 ||
                 vitals.oxygen_level < 92 ||
                 vitals.body_temperature > 38.5 || vitals.body_temperature < 36.0 ||
                 vitals.blood_pressure_systolic > 140 || vitals.blood_pressure_systolic < 90) {
            overallStatus = 'warning';
            statusText = 'Warning';
        }

        // Update status indicator
        statusIndicator.className = `status-indicator ${overallStatus}`;
        statusElement.lastChild.textContent = statusText;
    }

    handleAlerts(alerts) {
        this.alerts = alerts || [];
        this.updateAlertsDisplay();
    }

    updateAlertsDisplay() {
        const alertsList = document.getElementById('alertsList');
        const alertCount = document.getElementById('alertCount');
        
        if (!alertsList) return;

        // Update alert count
        if (alertCount) {
            alertCount.textContent = this.alerts.length;
        }

        // Clear existing alerts
        alertsList.innerHTML = '';

        if (this.alerts.length === 0) {
            alertsList.innerHTML = `
                <div class="no-alerts">
                    <i class="fas fa-check-circle"></i>
                    <p>All systems nominal</p>
                </div>
            `;
            return;
        }

        // Display alerts
        this.alerts.forEach((alert, index) => {
            const alertElement = document.createElement('div');
            alertElement.className = `alert-item ${alert.severity}`;
            alertElement.style.animationDelay = `${index * 0.1}s`;
            
            const timeAgo = this.formatTimeAgo(new Date(alert.timestamp));
            
            alertElement.innerHTML = `
                <div class="alert-header">
                    <span class="alert-type">${alert.alert_type.replace('_', ' ')}</span>
                    <span class="alert-time">${timeAgo}</span>
                </div>
                <div class="alert-message">${alert.message}</div>
            `;

            alertsList.appendChild(alertElement);
        });
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        return `${Math.floor(diffInSeconds / 3600)}h ago`;
    }

    updateConnectionStatus(connected) {
        const missionStatus = document.getElementById('missionStatus');
        if (missionStatus) {
            missionStatus.textContent = connected ? 'Mission Active' : 'Connection Lost';
        }

        const statusIndicator = document.querySelector('.mission-status .status-indicator');
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${connected ? 'active' : 'critical'}`;
        }
    }

    // Public methods
    disconnect() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        this.isConnected = false;
    }

    reconnect() {
        this.disconnect();
        setTimeout(() => {
            this.setupWebSocket();
        }, 1000);
    }

    // Get current vital signs data
    getCurrentVitals() {
        return {
            heartRate: this.vitalsHistory.heartRate[this.vitalsHistory.heartRate.length - 1],
            oxygenLevel: this.vitalsHistory.oxygenLevel[this.vitalsHistory.oxygenLevel.length - 1],
            bodyTemp: this.vitalsHistory.bodyTemp[this.vitalsHistory.bodyTemp.length - 1],
            bloodPressure: this.vitalsHistory.bloodPressure[this.vitalsHistory.bloodPressure.length - 1]
        };
    }

    // Get alerts
    getAlerts() {
        return this.alerts;
    }
}

// Initialize vital signs monitor
window.vitalSignsMonitor = new VitalSignsMonitor();
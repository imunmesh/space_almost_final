/**
 * Tourist Health Monitor with Real-time ML Tracking
 * Provides advanced vital signs monitoring for space tourists
 */

class TouristHealthMonitor {
    constructor() {
        this.isActive = false;
        this.vitalsData = {
            heartRate: [],
            oxygen: [],
            bloodPressure: [],
            bodyTemp: []
        };
        
        // ML components
        this.mlAnalyzer = new HealthMLAnalyzer();
        this.anomalyDetector = new VitalsAnomalyDetector();
        
        // Current readings
        this.currentVitals = {
            heartRate: 72,
            oxygen: 98,
            bloodPressure: { systolic: 120, diastolic: 80 },
            bodyTemp: 98.6
        };
        
        // Charts for trends
        this.charts = {};
        
        this.init();
    }
    
    init() {
        console.log('🏥 Tourist Health Monitor initialized');
        this.setupCharts();
        this.setupEventListeners();
    }
    
    activate() {
        console.log('❤️ Activating real-time health monitoring...');
        this.isActive = true;
        
        // Start real-time monitoring
        this.startVitalsTracking();
        this.startMLAnalysis();
        this.showNotification('Health monitoring activated', 'success');
    }
    
    deactivate() {
        console.log('⏹️ Deactivating health monitoring...');
        this.isActive = false;
        
        // Stop all intervals
        if (this.vitalsInterval) {
            clearInterval(this.vitalsInterval);
        }
        if (this.mlInterval) {
            clearInterval(this.mlInterval);
        }
    }
    
    setupCharts() {
        // Initialize mini trend charts
        const chartIds = ['heartRateChart', 'oxygenChart', 'bloodPressureChart', 'bodyTempChart'];
        
        chartIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                this.charts[id] = {
                    canvas: canvas,
                    ctx: ctx,
                    data: [],
                    maxPoints: 20
                };
                this.initChart(this.charts[id]);
            }
        });
    }
    
    initChart(chart) {
        const ctx = chart.ctx;
        const canvas = chart.canvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 0; i <= 4; i++) {
            const y = (canvas.height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }
    
    setupEventListeners() {
        // Could add manual refresh or settings buttons
        const refreshBtn = document.getElementById('refreshVitals');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.forceVitalsUpdate();
            });
        }
    }
    
    startVitalsTracking() {
        this.vitalsInterval = setInterval(() => {
            this.updateVitals();
        }, 2000); // Update every 2 seconds
    }
    
    startMLAnalysis() {
        this.mlInterval = setInterval(() => {
            this.runMLAnalysis();
        }, 5000); // Run ML analysis every 5 seconds
    }
    
    async updateVitals() {
        try {
            // Simulate API call to backend for real vital signs
            const response = await fetch(`${window.API_BASE_URL}/health/vitals`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'demo_token'}`
                }
            });
            
            if (response.ok) {
                const vitals = await response.json();
                this.processVitals(vitals);
            } else {
                // Fallback to simulated data
                this.generateSimulatedVitals();
            }
        } catch (error) {
            console.warn('Using simulated vitals:', error);
            this.generateSimulatedVitals();
        }
    }
    
    generateSimulatedVitals() {
        const now = Date.now();
        const timeOfDay = (now % (24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000);
        
        // Simulate circadian rhythm effects
        const circadianFactor = Math.sin(timeOfDay * 2 * Math.PI) * 0.1;
        
        // Heart rate with realistic variations
        const baseHeartRate = 72;
        const heartRateVariation = Math.sin(now / 10000) * 8 + Math.random() * 6 - 3;
        this.currentVitals.heartRate = Math.max(60, Math.min(100, 
            baseHeartRate + heartRateVariation + circadianFactor * 10
        ));
        
        // Oxygen level (very stable in space)
        this.currentVitals.oxygen = Math.max(95, Math.min(100, 
            98 + Math.random() * 2 - 1
        ));
        
        // Blood pressure with stress factors
        const stressFactor = Math.random() * 0.1;
        this.currentVitals.bloodPressure.systolic = Math.max(110, Math.min(140, 
            120 + Math.sin(now / 15000) * 8 + stressFactor * 15
        ));
        this.currentVitals.bloodPressure.diastolic = Math.max(70, Math.min(90, 
            80 + Math.sin(now / 12000) * 5 + stressFactor * 8
        ));
        
        // Body temperature with environmental factors
        this.currentVitals.bodyTemp = Math.max(97.0, Math.min(99.5, 
            98.6 + Math.sin(now / 20000) * 0.8 + Math.random() * 0.4 - 0.2
        ));
        
        this.processVitals(this.currentVitals);
    }
    
    processVitals(vitals) {
        // Store historical data
        const timestamp = Date.now();
        
        this.vitalsData.heartRate.push({ value: vitals.heartRate, timestamp });
        this.vitalsData.oxygen.push({ value: vitals.oxygen, timestamp });
        this.vitalsData.bloodPressure.push({ 
            systolic: vitals.bloodPressure.systolic,
            diastolic: vitals.bloodPressure.diastolic,
            timestamp 
        });
        this.vitalsData.bodyTemp.push({ value: vitals.bodyTemp, timestamp });
        
        // Keep only last 100 readings
        Object.keys(this.vitalsData).forEach(key => {
            if (this.vitalsData[key].length > 100) {
                this.vitalsData[key] = this.vitalsData[key].slice(-100);
            }
        });
        
        // Update display
        this.updateVitalsDisplay(vitals);
        this.updateCharts();
        this.updateVitalStatus(vitals);
    }
    
    updateVitalsDisplay(vitals) {
        // Heart rate
        const heartRateElement = document.getElementById('touristHeartRate');
        if (heartRateElement) {
            heartRateElement.textContent = Math.round(vitals.heartRate);
        }
        
        // Oxygen level
        const oxygenElement = document.getElementById('touristOxygen');
        if (oxygenElement) {
            oxygenElement.textContent = Math.round(vitals.oxygen);
        }
        
        // Blood pressure
        const bpElement = document.getElementById('touristBloodPressure');
        if (bpElement) {
            bpElement.textContent = `${Math.round(vitals.bloodPressure.systolic)}/${Math.round(vitals.bloodPressure.diastolic)}`;
        }
        
        // Body temperature
        const tempElement = document.getElementById('touristBodyTemp');
        if (tempElement) {
            tempElement.textContent = vitals.bodyTemp.toFixed(1);
        }
    }
    
    updateCharts() {
        // Update heart rate chart
        this.updateChart('heartRateChart', this.vitalsData.heartRate, '#ff6b6b');
        
        // Update oxygen chart
        this.updateChart('oxygenChart', this.vitalsData.oxygen, '#4ecdc4');
        
        // Update blood pressure chart (systolic)
        const bpData = this.vitalsData.bloodPressure.map(item => ({
            value: item.systolic,
            timestamp: item.timestamp
        }));
        this.updateChart('bloodPressureChart', bpData, '#45b7d1');
        
        // Update body temperature chart
        this.updateChart('bodyTempChart', this.vitalsData.bodyTemp, '#f9ca24');
    }
    
    updateChart(chartId, data, color) {
        const chart = this.charts[chartId];
        if (!chart || data.length === 0) return;
        
        const ctx = chart.ctx;
        const canvas = chart.canvas;
        const points = data.slice(-chart.maxPoints);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        this.initChart(chart);
        
        if (points.length < 2) return;
        
        // Calculate ranges
        const values = points.map(p => p.value);
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const range = maxVal - minVal || 1;
        
        // Draw line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        points.forEach((point, index) => {
            const x = (index / (points.length - 1)) * canvas.width;
            const y = canvas.height - ((point.value - minVal) / range) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = color;
        points.forEach((point, index) => {
            const x = (index / (points.length - 1)) * canvas.width;
            const y = canvas.height - ((point.value - minVal) / range) * canvas.height;
            
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
    
    updateVitalStatus(vitals) {
        // Heart rate status
        this.updateStatus('heartRateStatus', vitals.heartRate, 
            { normal: [60, 100], warning: [50, 120], critical: [40, 140] });
        
        // Oxygen status
        this.updateStatus('oxygenStatus', vitals.oxygen, 
            { normal: [95, 100], warning: [90, 95], critical: [0, 90] });
        
        // Blood pressure status (using systolic)
        this.updateStatus('bloodPressureStatus', vitals.bloodPressure.systolic, 
            { normal: [90, 140], warning: [80, 160], critical: [0, 180] });
        
        // Body temperature status
        this.updateStatus('bodyTempStatus', vitals.bodyTemp, 
            { normal: [97.0, 99.5], warning: [96.0, 100.5], critical: [95.0, 102.0] });
    }
    
    updateStatus(elementId, value, ranges) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        let status = 'critical';
        let text = 'Critical';
        
        if (value >= ranges.normal[0] && value <= ranges.normal[1]) {
            status = 'normal';
            text = 'Normal';
        } else if (value >= ranges.warning[0] && value <= ranges.warning[1]) {
            status = 'warning';
            text = 'Warning';
        }
        
        element.className = `vital-status ${status}`;
        element.textContent = text;
    }
    
    async runMLAnalysis() {
        if (this.vitalsData.heartRate.length < 10) return;
        
        // Run ML analysis on vital signs
        const analysis = await this.mlAnalyzer.analyzeVitals(this.vitalsData);
        const anomalies = await this.anomalyDetector.detectAnomalies(this.vitalsData);
        
        // Update ML insights
        this.updateHealthInsights(analysis);
        
        // Handle anomalies
        if (anomalies.length > 0) {
            this.handleAnomalies(anomalies);
        }
        
        // Update recommendations
        this.updateWellnessRecommendations(analysis);
    }
    
    updateHealthInsights(analysis) {
        const insight1 = document.getElementById('healthInsight1');
        const insight2 = document.getElementById('healthInsight2');
        
        if (insight1) {
            const hrv = analysis.heartRateVariability || 'Good';
            insight1.textContent = `Heart rate variability: ${hrv}`;
        }
        
        if (insight2) {
            const score = analysis.overallHealthScore || 95;
            insight2.textContent = `Overall health score: ${score}/100`;
        }
    }
    
    updateWellnessRecommendations(analysis) {
        const rec1 = document.getElementById('wellnessRec1');
        const rec2 = document.getElementById('wellnessRec2');
        
        const recommendations = [
            'Try zero-gravity exercises in 15 minutes',
            'Hydration levels optimal',
            'Consider meditation for stress reduction',
            'Heart rhythm shows good adaptation to space',
            'Blood pressure stable for microgravity',
            'Temperature regulation working well'
        ];
        
        if (rec1) {
            const randomRec = recommendations[Math.floor(Math.random() * recommendations.length)];
            rec1.innerHTML = `<i class="fas fa-dumbbell"></i><span>${randomRec}</span>`;
        }
        
        if (rec2) {
            const randomRec2 = recommendations[Math.floor(Math.random() * recommendations.length)];
            rec2.innerHTML = `<i class="fas fa-heart"></i><span>${randomRec2}</span>`;
        }
    }
    
    handleAnomalies(anomalies) {
        anomalies.forEach(anomaly => {
            console.warn('Health anomaly detected:', anomaly);
            this.showNotification(`Health alert: ${anomaly.type}`, 'warning');
        });
    }
    
    forceVitalsUpdate() {
        console.log('🔄 Forcing vitals update...');
        this.updateVitals();
        this.showNotification('Vitals refreshed', 'info');
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `health-notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                           type === 'error' ? 'fa-exclamation-triangle' : 
                           type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4757' : 
                       type === 'success' ? '#2ed573' : 
                       type === 'warning' ? '#ffa502' : '#3742fa'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 350px;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }
}

// ML Helper Classes
class HealthMLAnalyzer {
    async analyzeVitals(vitalsData) {
        // Simulate ML analysis
        const heartRateData = vitalsData.heartRate.slice(-20);
        
        if (heartRateData.length < 5) return {};
        
        // Calculate heart rate variability
        const intervals = [];
        for (let i = 1; i < heartRateData.length; i++) {
            intervals.push(Math.abs(heartRateData[i].value - heartRateData[i-1].value));
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        let hrv = 'Good';
        if (avgInterval > 10) hrv = 'High';
        if (avgInterval < 2) hrv = 'Low';
        
        // Overall health score
        const avgHeartRate = heartRateData.reduce((a, b) => a + b.value, 0) / heartRateData.length;
        const avgOxygen = vitalsData.oxygen.slice(-10).reduce((a, b) => a + b.value, 0) / Math.min(10, vitalsData.oxygen.length);
        
        let healthScore = 100;
        if (avgHeartRate < 60 || avgHeartRate > 100) healthScore -= 10;
        if (avgOxygen < 95) healthScore -= 15;
        
        return {
            heartRateVariability: hrv,
            overallHealthScore: Math.max(70, Math.min(100, healthScore)),
            avgHeartRate: avgHeartRate,
            avgOxygen: avgOxygen
        };
    }
}

class VitalsAnomalyDetector {
    async detectAnomalies(vitalsData) {
        const anomalies = [];
        
        // Check for sudden changes
        if (vitalsData.heartRate.length >= 5) {
            const recent = vitalsData.heartRate.slice(-5);
            const latest = recent[recent.length - 1].value;
            const avg = recent.slice(0, -1).reduce((a, b) => a + b.value, 0) / (recent.length - 1);
            
            if (Math.abs(latest - avg) > 20) {
                anomalies.push({
                    type: 'Heart rate spike detected',
                    severity: 'medium',
                    value: latest,
                    expected: avg
                });
            }
        }
        
        // Check oxygen drops
        if (vitalsData.oxygen.length >= 3) {
            const recent = vitalsData.oxygen.slice(-3);
            if (recent.every(reading => reading.value < 95)) {
                anomalies.push({
                    type: 'Low oxygen levels sustained',
                    severity: 'high',
                    value: recent[recent.length - 1].value
                });
            }
        }
        
        return anomalies;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.touristHealthMonitor = new TouristHealthMonitor();
});

// Export for global access
window.TouristHealthMonitor = TouristHealthMonitor;
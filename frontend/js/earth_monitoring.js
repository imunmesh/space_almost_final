/**
 * Earth Monitoring System
 * Handles satellite data visualization, ML model training, and disaster monitoring
 */

class EarthMonitoringSystem {
    constructor() {
        this.apiUrl = 'http://localhost:8000';
        this.currentRegion = { min_lat: -10, max_lat: 10, min_lon: -60, max_lon: -40 }; // Amazon
        this.charts = {};
        this.websocket = null;
        this.animationFrames = {};
        this.isActive = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.startAnimations();
    }

    setupEventListeners() {
        // Region selection
        const regionSelect = document.getElementById('regionSelect');
        if (regionSelect) {
            regionSelect.addEventListener('change', (e) => this.handleRegionChange(e.target.value));
        }

        // Custom coordinates
        const customCoords = document.getElementById('customCoords');
        if (customCoords) {
            const latInput = document.getElementById('latitude');
            const lonInput = document.getElementById('longitude');
            if (latInput && lonInput) {
                latInput.addEventListener('input', () => this.updateCustomRegion());
                lonInput.addEventListener('input', () => this.updateCustomRegion());
            }
        }

        // Analysis button
        const analyzeBtn = document.getElementById('analyzeSatelliteData');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeSatelliteData());
        }

        // ML training
        const trainBtn = document.getElementById('trainModel');
        if (trainBtn) {
            trainBtn.addEventListener('click', () => this.trainMLModel());
        }

        // ML prediction
        const predictBtn = document.getElementById('runPrediction');
        if (predictBtn) {
            predictBtn.addEventListener('click', () => this.runPrediction());
        }

        // Time range selection
        const timeRangeSelect = document.getElementById('timeRangeSelect');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', (e) => this.updateTimeRange(e.target.value));
        }
    }

    initializeCharts() {
        // NDVI Chart
        this.initVegetationChart('ndviChart', 'NDVI', '#00ff88');
        
        // EVI Chart
        this.initVegetationChart('eviChart', 'EVI', '#2196f3');
        
        // NBR Chart
        this.initVegetationChart('nbrChart', 'NBR', '#ff6b35');
        
        // Time series chart
        this.initTimeSeriesChart();
        
        // Satellite visualization
        this.initSatelliteVisualization();
    }

    initVegetationChart(canvasId, label, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Generate sample data
        const dataPoints = 20;
        const data = [];
        for (let i = 0; i < dataPoints; i++) {
            data.push(Math.random() * 0.3 + 0.5 + Math.sin(i * 0.3) * 0.1);
        }

        // Draw chart
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < data.length; i++) {
            const x = (i / (data.length - 1)) * width;
            const y = height - (data[i] * height);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        // Add glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        this.charts[canvasId] = { ctx, data, color };
    }

    initTimeSeriesChart() {
        const canvas = document.getElementById('timeseriesCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = (i / 5) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Generate sample time series data
        const dataPoints = 30;
        const deforestationData = [];
        const fireData = [];
        const vegetationData = [];

        for (let i = 0; i < dataPoints; i++) {
            deforestationData.push(Math.random() * 50 + 10 + Math.sin(i * 0.2) * 15);
            fireData.push(Math.random() * 30 + 5 + Math.cos(i * 0.3) * 10);
            vegetationData.push(Math.random() * 20 + 70 + Math.sin(i * 0.1) * 5);
        }

        // Draw deforestation line
        this.drawTimeSeries(ctx, deforestationData, '#ff3333', width, height);
        
        // Draw fire activity line
        this.drawTimeSeries(ctx, fireData, '#ff6b35', width, height);
        
        // Draw vegetation health line
        this.drawTimeSeries(ctx, vegetationData, '#00ff88', width, height);

        this.charts['timeseriesCanvas'] = { ctx, deforestationData, fireData, vegetationData };
    }

    drawTimeSeries(ctx, data, color, width, height) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const range = maxValue - minValue;

        for (let i = 0; i < data.length; i++) {
            const x = (i / (data.length - 1)) * width;
            const normalizedValue = (data[i] - minValue) / range;
            const y = height - (normalizedValue * height);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        // Add glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 5;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    initSatelliteVisualization() {
        const canvas = document.getElementById('satelliteCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw Earth representation
        ctx.fillStyle = 'rgba(0, 100, 200, 0.3)';
        ctx.fillRect(0, 0, width, height);

        // Add some land masses
        ctx.fillStyle = 'rgba(0, 150, 50, 0.5)';
        
        // Amazon-like shape
        ctx.beginPath();
        ctx.ellipse(width * 0.3, height * 0.4, width * 0.15, height * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Congo-like shape
        ctx.beginPath();
        ctx.ellipse(width * 0.6, height * 0.5, width * 0.1, height * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();

        // Add scanning effect
        this.startScanningAnimation(canvas);
    }

    startScanningAnimation(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        let scanPosition = 0;

        const animate = () => {
            if (!this.isActive) return;

            // Clear scanning line area
            ctx.globalCompositeOperation = 'source-over';
            
            // Draw scanning line
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(scanPosition, 0);
            ctx.lineTo(scanPosition, height);
            ctx.stroke();
            ctx.setLineDash([]);

            // Add scanning glow
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;

            scanPosition += 2;
            if (scanPosition > width + 20) {
                scanPosition = -20;
            }

            this.animationFrames.scanning = requestAnimationFrame(animate);
        };

        animate();
    }

    startAnimations() {
        this.isActive = true;
        this.animateVegetationIndices();
        this.animateStatCards();
    }

    animateVegetationIndices() {
        const animate = () => {
            if (!this.isActive) return;

            // Update NDVI value
            const ndviElement = document.getElementById('ndviValue');
            if (ndviElement) {
                const currentValue = parseFloat(ndviElement.textContent);
                const newValue = currentValue + (Math.random() - 0.5) * 0.02;
                const clampedValue = Math.max(0, Math.min(1, newValue));
                ndviElement.textContent = clampedValue.toFixed(3);
                
                // Update color based on value
                if (clampedValue > 0.7) {
                    ndviElement.style.color = '#00ff88';
                } else if (clampedValue > 0.4) {
                    ndviElement.style.color = '#ffd700';
                } else {
                    ndviElement.style.color = '#ff3333';
                }
            }

            // Update EVI value
            const eviElement = document.getElementById('eviValue');
            if (eviElement) {
                const currentValue = parseFloat(eviElement.textContent);
                const newValue = currentValue + (Math.random() - 0.5) * 0.015;
                const clampedValue = Math.max(0, Math.min(1, newValue));
                eviElement.textContent = clampedValue.toFixed(3);
                
                if (clampedValue > 0.6) {
                    eviElement.style.color = '#2196f3';
                } else if (clampedValue > 0.3) {
                    eviElement.style.color = '#ffd700';
                } else {
                    eviElement.style.color = '#ff3333';
                }
            }

            // Update NBR value
            const nbrElement = document.getElementById('nbrValue');
            if (nbrElement) {
                const currentValue = parseFloat(nbrElement.textContent);
                const newValue = currentValue + (Math.random() - 0.5) * 0.01;
                const clampedValue = Math.max(0, Math.min(1, newValue));
                nbrElement.textContent = clampedValue.toFixed(3);
                
                if (clampedValue > 0.8) {
                    nbrElement.style.color = '#ff6b35';
                } else if (clampedValue > 0.5) {
                    nbrElement.style.color = '#ffd700';
                } else {
                    nbrElement.style.color = '#00ff88';
                }
            }

            setTimeout(() => {
                this.animationFrames.vegetation = requestAnimationFrame(animate);
            }, 2000);
        };

        animate();
    }

    animateStatCards() {
        const animate = () => {
            if (!this.isActive) return;

            // Animate fire count
            const fireCountElement = document.getElementById('fireCount');
            if (fireCountElement) {
                const currentCount = parseInt(fireCountElement.textContent);
                const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
                const newCount = Math.max(0, currentCount + change);
                fireCountElement.textContent = newCount;
            }

            // Animate deforestation alerts
            const deforestationElement = document.getElementById('deforestationCount');
            if (deforestationElement) {
                const currentCount = parseInt(deforestationElement.textContent);
                const change = Math.random() > 0.8 ? (Math.random() > 0.3 ? 1 : -1) : 0;
                const newCount = Math.max(0, currentCount + change);
                deforestationElement.textContent = newCount;
            }

            setTimeout(() => {
                this.animationFrames.stats = requestAnimationFrame(animate);
            }, 5000);
        };

        animate();
    }

    async analyzeSatelliteData() {
        const analyzeBtn = document.getElementById('analyzeSatelliteData');
        const satelliteStatus = document.getElementById('satelliteStatus');
        
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        }
        
        if (satelliteStatus) {
            satelliteStatus.textContent = 'Analyzing Data';
        }

        try {
            // Get vegetation indices
            const response = await fetch(`${this.apiUrl}/earth-monitoring/vegetation-indices?` + 
                `lat_min=${this.currentRegion.min_lat}&lat_max=${this.currentRegion.max_lat}&` +
                `lon_min=${this.currentRegion.min_lon}&lon_max=${this.currentRegion.max_lon}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateVegetationDisplay(data.indices);
                
                if (satelliteStatus) {
                    satelliteStatus.textContent = 'Data Updated';
                }
            }
        } catch (error) {
            console.error('Error analyzing satellite data:', error);
            if (satelliteStatus) {
                satelliteStatus.textContent = 'Analysis Error';
            }
        } finally {
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Region';
            }
        }
    }

    async trainMLModel() {
        const trainBtn = document.getElementById('trainModel');
        const mlStatus = document.getElementById('mlStatus');
        const mlStatusIndicator = document.getElementById('mlStatusIndicator');
        
        if (trainBtn) {
            trainBtn.disabled = true;
            trainBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Training...';
        }
        
        if (mlStatus) {
            mlStatus.textContent = 'Training Model';
        }
        
        if (mlStatusIndicator) {
            mlStatusIndicator.className = 'status-indicator warning';
        }

        try {
            const modelType = document.getElementById('modelSelect')?.value || 'random_forest';
            
            const response = await fetch(`${this.apiUrl}/earth-monitoring/train-ml-model?model_type=${modelType}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateMLMetrics(data);
                
                if (mlStatus) {
                    mlStatus.textContent = 'Model Trained';
                }
                
                if (mlStatusIndicator) {
                    mlStatusIndicator.className = 'status-indicator active';
                }
            }
        } catch (error) {
            console.error('Error training ML model:', error);
            if (mlStatus) {
                mlStatus.textContent = 'Training Failed';
            }
            
            if (mlStatusIndicator) {
                mlStatusIndicator.className = 'status-indicator critical';
            }
        } finally {
            if (trainBtn) {
                trainBtn.disabled = false;
                trainBtn.innerHTML = '<i class="fas fa-cog"></i> Train Model';
            }
        }
    }

    async runPrediction() {
        const predictBtn = document.getElementById('runPrediction');
        const predictionResults = document.getElementById('predictionResults');
        
        if (predictBtn) {
            predictBtn.disabled = true;
            predictBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        }

        try {
            // Generate sample satellite data for prediction
            const sampleData = this.generateSampleSatelliteData();
            
            const response = await fetch(`${this.apiUrl}/earth-monitoring/predict-deforestation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(sampleData)
            });

            if (response.ok) {
                const data = await response.json();
                this.displayPredictionResults(data);
            }
        } catch (error) {
            console.error('Error running prediction:', error);
            if (predictionResults) {
                predictionResults.innerHTML = '<div class="error">Prediction failed</div>';
            }
        } finally {
            if (predictBtn) {
                predictBtn.disabled = false;
                predictBtn.innerHTML = '<i class="fas fa-search"></i> Run Analysis';
            }
        }
    }

    generateSampleSatelliteData() {
        const dataPoints = [];
        for (let i = 0; i < 10; i++) {
            dataPoints.push({
                ndvi: Math.random() * 0.8 + 0.1,
                evi: Math.random() * 0.7 + 0.15,
                nbr: Math.random() * 0.9 + 0.05,
                slope: Math.random() * 45,
                elevation: Math.random() * 1000 + 200
            });
        }
        return dataPoints;
    }

    displayPredictionResults(data) {
        const predictionResults = document.getElementById('predictionResults');
        const confidenceScore = document.getElementById('confidenceScore');
        
        if (predictionResults && data.predictions) {
            const deforestationRisk = data.predictions.find(p => p.risk_level === 'high');
            const avgConfidence = data.predictions.reduce((sum, p) => sum + p.confidence, 0) / data.predictions.length;
            
            if (confidenceScore) {
                confidenceScore.textContent = `${(avgConfidence * 100).toFixed(1)}%`;
            }
            
            predictionResults.innerHTML = `
                <div class="prediction-item ${deforestationRisk ? 'high-risk' : 'low-risk'}">
                    <div class="risk-indicator">
                        <i class="fas fa-${deforestationRisk ? 'exclamation-triangle' : 'check-circle'}"></i>
                        <span>${deforestationRisk ? 'High Risk' : 'Low Risk'}</span>
                    </div>
                    <div class="risk-details">
                        <p>Deforestation Probability: ${(avgConfidence * 100).toFixed(1)}%</p>
                        <p>Analysis Points: ${data.predictions.length}</p>
                        <p>Model Accuracy: ${data.model_info?.accuracy || 'N/A'}</p>
                    </div>
                </div>
            `;
        }
    }

    updateVegetationDisplay(indices) {
        if (indices.ndvi) {
            const ndviElement = document.getElementById('ndviValue');
            if (ndviElement) {
                ndviElement.textContent = indices.ndvi.toFixed(3);
            }
        }
        
        if (indices.evi) {
            const eviElement = document.getElementById('eviValue');
            if (eviElement) {
                eviElement.textContent = indices.evi.toFixed(3);
            }
        }
        
        if (indices.nbr) {
            const nbrElement = document.getElementById('nbrValue');
            if (nbrElement) {
                nbrElement.textContent = indices.nbr.toFixed(3);
            }
        }
    }

    updateMLMetrics(data) {
        const accuracyElement = document.getElementById('modelAccuracy');
        const trainingTimeElement = document.getElementById('trainingTime');
        
        if (accuracyElement && data.accuracy) {
            accuracyElement.textContent = `${(data.accuracy * 100).toFixed(1)}%`;
        }
        
        if (trainingTimeElement && data.training_time) {
            trainingTimeElement.textContent = `${data.training_time.toFixed(2)}s`;
        }
    }

    handleRegionChange(region) {
        const customCoords = document.getElementById('customCoords');
        
        if (region === 'custom') {
            if (customCoords) {
                customCoords.classList.remove('hidden');
            }
        } else {
            if (customCoords) {
                customCoords.classList.add('hidden');
            }
            
            // Set predefined regions
            switch (region) {
                case 'amazon':
                    this.currentRegion = { min_lat: -10, max_lat: 10, min_lon: -75, max_lon: -45 };
                    break;
                case 'congo':
                    this.currentRegion = { min_lat: -5, max_lat: 10, min_lon: 10, max_lon: 30 };
                    break;
                case 'boreal':
                    this.currentRegion = { min_lat: 50, max_lat: 70, min_lon: -180, max_lon: 180 };
                    break;
                case 'australia':
                    this.currentRegion = { min_lat: -45, max_lat: -10, min_lon: 110, max_lon: 155 };
                    break;
            }
        }
    }

    updateCustomRegion() {
        const latInput = document.getElementById('latitude');
        const lonInput = document.getElementById('longitude');
        
        if (latInput && lonInput) {
            const lat = parseFloat(latInput.value) || 0;
            const lon = parseFloat(lonInput.value) || 0;
            
            // Create a 10x10 degree region around the point
            this.currentRegion = {
                min_lat: lat - 5,
                max_lat: lat + 5,
                min_lon: lon - 5,
                max_lon: lon + 5
            };
        }
    }

    updateTimeRange(range) {
        // Update time series chart based on selected range
        console.log('Updating time range to:', range);
        // This would typically fetch new data for the selected time range
        this.initTimeSeriesChart();
    }

    activate() {
        this.isActive = true;
        this.startAnimations();
    }

    deactivate() {
        this.isActive = false;
        
        // Cancel all animation frames
        Object.values(this.animationFrames).forEach(frameId => {
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
        });
        
        this.animationFrames = {};
    }
}

// Global instance
let earthMonitoringSystem = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    earthMonitoringSystem = new EarthMonitoringSystem();
});
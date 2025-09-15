// Scientific Analysis Panel for Environmental Monitoring
class ScientificAnalysisPanel {
    constructor() {
        this.soilAnalysisData = {
            mineral_composition: {
                silicon_dioxide: 45.2,    // %
                aluminum_oxide: 14.7,
                iron_oxide: 12.8,
                magnesium_oxide: 8.9,
                calcium_oxide: 6.4,
                potassium_oxide: 3.1,
                titanium_dioxide: 2.3,
                phosphorus_pentoxide: 1.2,
                other_minerals: 5.4
            },
            physical_properties: {
                ph_level: 8.2,
                moisture_content: 0.03,   // %
                grain_size: 'fine to medium',
                porosity: 45.8,          // %
                density: 1.52,           // g/cm³
                permeability: 'low'
            },
            organic_compounds: {
                methane_traces: 2.3,     // ppb
                organic_carbon: 0.12,    // %
                amino_acids: 'detected',
                carbonates: 3.7,         // %
                sulfates: 8.9           // %
            }
        };
        
        this.waterAnalysisData = {
            presence: {
                liquid_water: false,
                water_vapor: true,
                ice_deposits: true,
                hydrated_minerals: true
            },
            composition: {
                deuterium_ratio: 5.6,    // SMOW ratio
                oxygen_isotopes: 'heavy',
                dissolved_minerals: {
                    sodium_chloride: 12.4,   // mg/L
                    magnesium_sulfate: 8.7,
                    calcium_carbonate: 5.2,
                    iron_compounds: 3.1
                }
            },
            atmospheric_water: {
                humidity: 0.03,          // %
                vapor_pressure: 0.6,     // Pa
                frost_point: -80,        // °C
                seasonal_variation: 'high'
            }
        };
        
        this.gasAnalysisData = {
            atmospheric_composition: {
                carbon_dioxide: 95.32,   // %
                nitrogen: 2.7,
                argon: 1.6,
                oxygen: 0.13,
                carbon_monoxide: 0.08,
                water_vapor: 0.021,
                methane: 10.5,           // ppb
                hydrogen: 15.0           // ppm
            },
            trace_gases: {
                sulfur_dioxide: 0.8,     // ppb
                hydrogen_sulfide: 0.4,
                ammonia: 0.2,
                ozone: 0.03,
                formaldehyde: 130        // ppb
            },
            pressure_data: {
                surface_pressure: 610,   // Pa
                daily_variation: 35,     // Pa
                seasonal_low: 400,       // Pa
                seasonal_high: 870       // Pa
            }
        };
        
        this.radiationData = {
            cosmic_radiation: {
                galactic_cosmic_rays: 24.0,  // μGy/day
                solar_particle_events: 5.2,
                neutron_flux: 156,           // n/cm²/day
                gamma_radiation: 8.7         // μGy/day
            },
            environmental_monitoring: {
                background_radiation: 0.67,  // μSv/h
                surface_contamination: 'none',
                radioactive_isotopes: {
                    potassium_40: 845,       // Bq/kg
                    thorium_232: 42,         // Bq/kg
                    uranium_238: 18          // Bq/kg
                }
            }
        };
        
        this.analysisHistory = [];
        this.currentSample = null;
        this.isAnalyzing = false;
        
        this.initializePanel();
        this.startDataUpdateLoop();
    }
    
    initializePanel() {
        // Initialize soil analysis controls
        const soilAnalyzeBtn = document.getElementById('analyze-soil-btn');
        if (soilAnalyzeBtn) {
            soilAnalyzeBtn.addEventListener('click', () => this.performSoilAnalysis());
        }
        
        // Initialize water analysis controls
        const waterAnalyzeBtn = document.getElementById('analyze-water-btn');
        if (waterAnalyzeBtn) {
            waterAnalyzeBtn.addEventListener('click', () => this.performWaterAnalysis());
        }
        
        // Initialize gas analysis controls
        const gasAnalyzeBtn = document.getElementById('analyze-gas-btn');
        if (gasAnalyzeBtn) {
            gasAnalyzeBtn.addEventListener('click', () => this.performGasAnalysis());
        }
        
        // Initialize radiation monitoring
        const radiationBtn = document.getElementById('radiation-monitor-btn');
        if (radiationBtn) {
            radiationBtn.addEventListener('click', () => this.toggleRadiationMonitoring());
        }
        
        // Initialize sample collection
        const collectBtn = document.getElementById('collect-sample-btn');
        if (collectBtn) {
            collectBtn.addEventListener('click', () => this.collectSample());
        }
        
        this.updateAllDisplays();
    }
    
    performSoilAnalysis() {
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        this.displayAnalysisProgress('soil', 'Analyzing soil composition...');
        
        // Simulate analysis time
        setTimeout(() => {
            this.soilAnalysisData = this.generateSoilData();
            this.completeAnalysis('soil');
        }, 3000);
    }
    
    performWaterAnalysis() {
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        this.displayAnalysisProgress('water', 'Analyzing water composition...');
        
        setTimeout(() => {
            this.waterAnalysisData = this.generateWaterData();
            this.completeAnalysis('water');
        }, 2500);
    }
    
    performGasAnalysis() {
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        this.displayAnalysisProgress('gas', 'Analyzing atmospheric composition...');
        
        setTimeout(() => {
            this.gasAnalysisData = this.generateGasData();
            this.completeAnalysis('gas');
        }, 2000);
    }
    
    generateSoilData() {
        // Generate realistic variations in soil composition
        const baseData = {...this.soilAnalysisData};
        
        // Add random variations to simulate different locations
        Object.keys(baseData.mineral_composition).forEach(mineral => {
            const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
            baseData.mineral_composition[mineral] *= (1 + variation);
        });
        
        // Update physical properties with some variation
        baseData.physical_properties.ph_level = 7.5 + Math.random() * 1.4; // 7.5-8.9
        baseData.physical_properties.moisture_content = Math.random() * 0.1; // 0-0.1%
        baseData.physical_properties.porosity = 40 + Math.random() * 15; // 40-55%
        
        // Organic compounds with seasonal variation
        baseData.organic_compounds.methane_traces = Math.random() * 10; // 0-10 ppb
        baseData.organic_compounds.organic_carbon = Math.random() * 0.3; // 0-0.3%
        
        return baseData;
    }
    
    generateWaterData() {
        const baseData = {...this.waterAnalysisData};
        
        // Atmospheric water varies with season and time of day
        baseData.atmospheric_water.humidity = Math.random() * 0.1; // 0-0.1%
        baseData.atmospheric_water.vapor_pressure = 0.2 + Math.random() * 1.0; // 0.2-1.2 Pa
        baseData.atmospheric_water.frost_point = -90 + Math.random() * 20; // -90 to -70°C
        
        // Dissolved minerals vary by location
        Object.keys(baseData.composition.dissolved_minerals).forEach(mineral => {
            const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
            baseData.composition.dissolved_minerals[mineral] *= (1 + variation);
        });
        
        return baseData;
    }
    
    generateGasData() {
        const baseData = {...this.gasAnalysisData};
        
        // Atmospheric composition varies slightly
        baseData.atmospheric_composition.methane = 8 + Math.random() * 5; // 8-13 ppb
        baseData.atmospheric_composition.water_vapor = 0.01 + Math.random() * 0.02; // 0.01-0.03%
        
        // Trace gases vary more significantly
        baseData.trace_gases.sulfur_dioxide = Math.random() * 2; // 0-2 ppb
        baseData.trace_gases.formaldehyde = 100 + Math.random() * 60; // 100-160 ppb
        
        // Pressure varies with weather
        baseData.pressure_data.surface_pressure = 550 + Math.random() * 120; // 550-670 Pa
        baseData.pressure_data.daily_variation = 20 + Math.random() * 30; // 20-50 Pa
        
        return baseData;
    }
    
    displayAnalysisProgress(type, message) {
        const progressElement = document.getElementById(`${type}-analysis-progress`);
        if (progressElement) {
            progressElement.style.display = 'block';
            progressElement.innerHTML = `
                <div class=\"analysis-spinner\"></div>
                <span class=\"analysis-message\">${message}</span>
            `;
        }
        
        // Disable analysis buttons during analysis
        const buttons = document.querySelectorAll('.analysis-btn');
        buttons.forEach(btn => btn.disabled = true);
    }
    
    completeAnalysis(type) {
        this.isAnalyzing = false;
        
        // Hide progress indicator
        const progressElement = document.getElementById(`${type}-analysis-progress`);
        if (progressElement) {
            progressElement.style.display = 'none';
        }
        
        // Re-enable buttons
        const buttons = document.querySelectorAll('.analysis-btn');
        buttons.forEach(btn => btn.disabled = false);
        
        // Record analysis in history
        this.recordAnalysis(type);
        
        // Update displays
        this.updateAnalysisDisplay(type);
        
        // Log to mission log
        if (window.missionLog) {
            window.missionLog.autoLog(
                `${type.charAt(0).toUpperCase() + type.slice(1)} analysis completed`,
                'science'
            );
        }
        
        // Check for anomalies
        this.checkForAnomalies(type);
    }
    
    recordAnalysis(type) {
        const analysis = {
            id: Date.now(),
            type: type,
            timestamp: new Date(),
            data: this.getAnalysisData(type),
            location: this.getCurrentLocation(),
            notes: ''
        };
        
        this.analysisHistory.push(analysis);
        
        // Keep only last 50 analyses
        if (this.analysisHistory.length > 50) {
            this.analysisHistory = this.analysisHistory.slice(-50);
        }
    }
    
    getAnalysisData(type) {
        switch (type) {
            case 'soil': return {...this.soilAnalysisData};
            case 'water': return {...this.waterAnalysisData};
            case 'gas': return {...this.gasAnalysisData};
            default: return {};
        }
    }
    
    getCurrentLocation() {
        // Get current location from navigation system
        if (window.pilotPanel) {
            const nav = window.pilotPanel.navigation;
            return {
                x: nav.current_position.x,
                y: nav.current_position.y,
                z: nav.current_position.z
            };
        }
        return { x: 0, y: 0, z: 408000 };
    }
    
    updateAnalysisDisplay(type) {
        switch (type) {
            case 'soil':
                this.updateSoilDisplay();
                break;
            case 'water':
                this.updateWaterDisplay();
                break;
            case 'gas':
                this.updateGasDisplay();
                break;
        }
    }
    
    updateSoilDisplay() {
        const data = this.soilAnalysisData;
        
        // Update mineral composition
        Object.keys(data.mineral_composition).forEach(mineral => {
            const element = document.getElementById(`soil-${mineral.replace('_', '-')}`);
            if (element) {
                element.textContent = `${data.mineral_composition[mineral].toFixed(1)}%`;
            }
        });
        
        // Update physical properties
        const phElement = document.getElementById('soil-ph');
        if (phElement) phElement.textContent = data.physical_properties.ph_level.toFixed(1);
        
        const moistureElement = document.getElementById('soil-moisture');
        if (moistureElement) moistureElement.textContent = `${data.physical_properties.moisture_content.toFixed(3)}%`;
        
        const porosityElement = document.getElementById('soil-porosity');
        if (porosityElement) porosityElement.textContent = `${data.physical_properties.porosity.toFixed(1)}%`;
        
        // Update organic compounds
        const methaneElement = document.getElementById('soil-methane');
        if (methaneElement) methaneElement.textContent = `${data.organic_compounds.methane_traces.toFixed(1)} ppb`;
        
        const carbonElement = document.getElementById('soil-carbon');
        if (carbonElement) carbonElement.textContent = `${data.organic_compounds.organic_carbon.toFixed(2)}%`;
    }
    
    updateWaterDisplay() {
        const data = this.waterAnalysisData;
        
        // Update presence indicators
        const presenceElements = {
            'water-liquid': data.presence.liquid_water,
            'water-vapor': data.presence.water_vapor,
            'water-ice': data.presence.ice_deposits,
            'water-hydrated': data.presence.hydrated_minerals
        };
        
        Object.keys(presenceElements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = presenceElements[id] ? 'DETECTED' : 'NOT DETECTED';
                element.className = `detection-status ${presenceElements[id] ? 'detected' : 'not-detected'}`;
            }
        });
        
        // Update composition data
        const deuteriumElement = document.getElementById('water-deuterium');
        if (deuteriumElement) deuteriumElement.textContent = `${data.composition.deuterium_ratio.toFixed(1)}x`;
        
        // Update atmospheric water
        const humidityElement = document.getElementById('atmospheric-humidity');
        if (humidityElement) humidityElement.textContent = `${data.atmospheric_water.humidity.toFixed(3)}%`;
        
        const frostElement = document.getElementById('frost-point');
        if (frostElement) frostElement.textContent = `${data.atmospheric_water.frost_point.toFixed(0)}°C`;
    }
    
    updateGasDisplay() {
        const data = this.gasAnalysisData;
        
        // Update atmospheric composition
        Object.keys(data.atmospheric_composition).forEach(gas => {
            const element = document.getElementById(`gas-${gas.replace('_', '-')}`);
            if (element) {
                const value = data.atmospheric_composition[gas];
                if (gas === 'methane') {
                    element.textContent = `${value.toFixed(1)} ppb`;
                } else if (gas === 'hydrogen') {
                    element.textContent = `${value.toFixed(1)} ppm`;
                } else {
                    element.textContent = `${value.toFixed(2)}%`;
                }
            }
        });
        
        // Update pressure data
        const pressureElement = document.getElementById('surface-pressure');
        if (pressureElement) pressureElement.textContent = `${data.pressure_data.surface_pressure.toFixed(0)} Pa`;
        
        const variationElement = document.getElementById('pressure-variation');
        if (variationElement) variationElement.textContent = `±${data.pressure_data.daily_variation.toFixed(0)} Pa`;
        
        // Update trace gases
        Object.keys(data.trace_gases).forEach(gas => {
            const element = document.getElementById(`trace-${gas.replace('_', '-')}`);
            if (element) {
                const value = data.trace_gases[gas];
                const unit = gas === 'formaldehyde' ? 'ppb' : 'ppb';
                element.textContent = `${value.toFixed(1)} ${unit}`;
            }
        });
    }
    
    checkForAnomalies(type) {
        const anomalies = [];
        
        switch (type) {
            case 'soil':
                // Check for unusual mineral concentrations
                if (this.soilAnalysisData.organic_compounds.organic_carbon > 0.2) {
                    anomalies.push({
                        type: 'soil_anomaly',
                        description: 'Elevated organic carbon levels detected',
                        significance: 'high',
                        value: this.soilAnalysisData.organic_compounds.organic_carbon
                    });
                }
                
                if (this.soilAnalysisData.organic_compounds.methane_traces > 5) {
                    anomalies.push({
                        type: 'soil_anomaly',
                        description: 'High methane concentration in soil',
                        significance: 'medium',
                        value: this.soilAnalysisData.organic_compounds.methane_traces
                    });
                }
                break;
                
            case 'water':
                // Check for unusual water signatures
                if (this.waterAnalysisData.atmospheric_water.humidity > 0.05) {
                    anomalies.push({
                        type: 'water_anomaly',
                        description: 'Unusually high atmospheric humidity',
                        significance: 'medium',
                        value: this.waterAnalysisData.atmospheric_water.humidity
                    });
                }
                break;
                
            case 'gas':
                // Check for unusual gas concentrations
                if (this.gasAnalysisData.atmospheric_composition.methane > 12) {
                    anomalies.push({
                        type: 'gas_anomaly',
                        description: 'Elevated atmospheric methane levels',
                        significance: 'high',
                        value: this.gasAnalysisData.atmospheric_composition.methane
                    });
                }
                
                if (this.gasAnalysisData.trace_gases.formaldehyde > 150) {
                    anomalies.push({
                        type: 'gas_anomaly',
                        description: 'High formaldehyde concentration detected',
                        significance: 'medium',
                        value: this.gasAnalysisData.trace_gases.formaldehyde
                    });
                }
                break;
        }
        
        // Display anomalies
        if (anomalies.length > 0) {
            this.displayAnomalies(anomalies);
        }
    }
    
    displayAnomalies(anomalies) {
        const anomalyContainer = document.getElementById('analysis-anomalies');
        if (!anomalyContainer) return;
        
        anomalies.forEach(anomaly => {
            const anomalyElement = document.createElement('div');
            anomalyElement.className = `anomaly-alert ${anomaly.significance}`;
            anomalyElement.innerHTML = `
                <div class=\"anomaly-icon\">🔬</div>
                <div class=\"anomaly-details\">
                    <div class=\"anomaly-description\">${anomaly.description}</div>
                    <div class=\"anomaly-value\">Value: ${anomaly.value.toFixed(2)}</div>
                    <div class=\"anomaly-significance\">Significance: ${anomaly.significance}</div>
                </div>
            `;
            
            anomalyContainer.appendChild(anomalyElement);
            
            // Auto-remove after 30 seconds
            setTimeout(() => {
                if (anomalyElement.parentNode) {
                    anomalyElement.remove();
                }
            }, 30000);
        });
        
        // Log anomalies
        if (window.missionLog) {
            anomalies.forEach(anomaly => {
                window.missionLog.autoLog(
                    `ANOMALY DETECTED: ${anomaly.description}`,
                    'science'
                );
            });
        }
    }
    
    collectSample() {
        const sampleId = `SAMPLE_${Date.now()}`;
        const location = this.getCurrentLocation();
        
        this.currentSample = {
            id: sampleId,
            timestamp: new Date(),
            location: location,
            type: 'environmental',
            status: 'collected'
        };
        
        this.displayMessage(`Sample ${sampleId} collected at location (${location.x.toFixed(0)}, ${location.y.toFixed(0)}, ${location.z.toFixed(0)})`, 'success');
        
        if (window.missionLog) {
            window.missionLog.autoLog(
                `Sample collected: ${sampleId}`,
                'science'
            );
        }
    }
    
    toggleRadiationMonitoring() {
        // Toggle radiation monitoring
        const isActive = document.getElementById('radiation-monitor-btn').classList.contains('active');
        
        if (isActive) {
            this.stopRadiationMonitoring();
        } else {
            this.startRadiationMonitoring();
        }
    }
    
    startRadiationMonitoring() {
        const button = document.getElementById('radiation-monitor-btn');
        if (button) {
            button.classList.add('active');
            button.textContent = 'Stop Monitoring';
        }
        
        this.radiationMonitoringActive = true;
        this.updateRadiationDisplay();
        
        this.displayMessage('Radiation monitoring started', 'info');
    }
    
    stopRadiationMonitoring() {
        const button = document.getElementById('radiation-monitor-btn');
        if (button) {
            button.classList.remove('active');
            button.textContent = 'Start Monitoring';
        }
        
        this.radiationMonitoringActive = false;
        
        this.displayMessage('Radiation monitoring stopped', 'info');
    }
    
    updateRadiationDisplay() {
        if (!this.radiationMonitoringActive) return;
        
        // Update cosmic radiation values
        const cosmicElement = document.getElementById('cosmic-radiation');
        if (cosmicElement) {
            cosmicElement.textContent = `${this.radiationData.cosmic_radiation.galactic_cosmic_rays.toFixed(1)} μGy/day`;
        }
        
        const backgroundElement = document.getElementById('background-radiation');
        if (backgroundElement) {
            backgroundElement.textContent = `${this.radiationData.environmental_monitoring.background_radiation.toFixed(2)} μSv/h`;
        }
        
        // Check for dangerous levels
        if (this.radiationData.cosmic_radiation.galactic_cosmic_rays > 30) {
            this.displayMessage('WARNING: Elevated cosmic radiation levels detected', 'warning');
        }
    }
    
    updateAllDisplays() {
        this.updateSoilDisplay();
        this.updateWaterDisplay();
        this.updateGasDisplay();
        if (this.radiationMonitoringActive) {
            this.updateRadiationDisplay();
        }
    }
    
    displayMessage(message, type = 'info') {
        const messageContainer = document.getElementById('science-messages');
        if (!messageContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `science-message ${type}`;
        messageElement.innerHTML = `
            <span class=\"message-time\">${new Date().toLocaleTimeString()}</span>
            <span class=\"message-text\">${message}</span>
        `;
        
        messageContainer.insertBefore(messageElement, messageContainer.firstChild);
        
        // Remove old messages (keep last 5)
        const messages = messageContainer.querySelectorAll('.science-message');
        if (messages.length > 5) {
            messages[messages.length - 1].remove();
        }
        
        // Auto-remove after 15 seconds for non-warning messages
        if (type !== 'warning' && type !== 'error') {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 15000);
        }
    }
    
    startDataUpdateLoop() {
        // Update radiation data continuously
        setInterval(() => {
            if (this.radiationMonitoringActive) {
                // Simulate radiation variations
                this.radiationData.cosmic_radiation.galactic_cosmic_rays = 20 + Math.random() * 10;
                this.radiationData.environmental_monitoring.background_radiation = 0.5 + Math.random() * 0.3;
                this.updateRadiationDisplay();
            }
        }, 2000);
        
        // Update atmospheric data less frequently
        setInterval(() => {
            this.gasAnalysisData = this.generateGasData();
            this.updateGasDisplay();
        }, 10000);
    }
}

// Initialize scientific analysis panel
let scientificPanel;
document.addEventListener('DOMContentLoaded', () => {
    scientificPanel = new ScientificAnalysisPanel();
});

// Export for global access
window.scientificPanel = scientificPanel;

// Scientific Analysis and Environmental Monitoring System
class ScientificAnalysis {
    constructor() {
        this.experiments = {
            soil_analysis: {
                active: false,
                samples: [],
                current_sample: null,
                analysis_progress: 0
            },
            water_analysis: {
                active: false,
                samples: [],
                current_sample: null,
                analysis_progress: 0
            },
            atmospheric_analysis: {
                active: false,
                readings: [],
                current_reading: null
            },
            radiation_monitoring: {
                active: true,
                readings: [],
                alert_threshold: 100 // mSv/hour
            }
        };
        
        this.environmental_data = {
            temperature: 20.5, // Celsius
            humidity: 45, // Percentage
            pressure: 101.3, // kPa
            oxygen: 20.9, // Percentage
            co2: 400, // ppm
            radiation: 0.05, // mSv/hour
            particle_count: 1200 // particles/cm³
        };
        
        this.martian_data = {
            soil: {
                ph: 8.5,
                moisture: 0.02, // Percentage
                organic_matter: 0.001, // Percentage
                minerals: {
                    iron_oxide: 16.5, // Percentage
                    silicon_dioxide: 45.2,
                    aluminum_oxide: 9.8,
                    magnesium_oxide: 8.7,
                    calcium_oxide: 5.9
                },
                salts: {
                    perchlorates: 0.5, // Percentage
                    sulfates: 1.2,
                    chlorides: 0.3
                }
            },
            atmosphere: {
                pressure: 0.636, // kPa (Mars surface pressure)
                temperature: -63, // Celsius average
                composition: {
                    co2: 95.32, // Percentage
                    nitrogen: 2.7,
                    argon: 1.6,
                    oxygen: 0.13,
                    water_vapor: 0.03
                }
            },
            water: {
                detected: false,
                ice_content: 0.0, // Percentage
                salinity: 0.0, // If water detected
                ph: 7.0 // If water detected
            }
        };
        
        this.analysis_history = [];
        this.anomalies = [];
        
        this.initializeExperiments();
        this.startMonitoring();
    }
    
    initializeExperiments() {
        // Initialize event listeners for scientific controls
        document.getElementById('start-soil-analysis')?.addEventListener('click', () => this.startSoilAnalysis());
        document.getElementById('start-water-analysis')?.addEventListener('click', () => this.startWaterAnalysis());
        document.getElementById('collect-atmospheric-data')?.addEventListener('click', () => this.collectAtmosphericData());
        document.getElementById('toggle-radiation-monitoring')?.addEventListener('click', () => this.toggleRadiationMonitoring());
        
        // Initialize sample collection
        document.getElementById('collect-soil-sample')?.addEventListener('click', () => this.collectSoilSample());
        document.getElementById('collect-water-sample')?.addEventListener('click', () => this.collectWaterSample());
        
        // Initialize analysis parameter controls
        this.setupParameterControls();
        
        // Update displays
        this.updateEnvironmentalDisplay();
        this.updateMartianDataDisplay();
    }
    
    setupParameterControls() {
        // Set up sliders and controls for analysis parameters
        const temperatureSlider = document.getElementById('analysis-temperature');
        if (temperatureSlider) {
            temperatureSlider.addEventListener('input', (e) => {
                this.environmental_data.temperature = parseFloat(e.target.value);
                this.updateEnvironmentalDisplay();
            });
        }
        
        const pressureSlider = document.getElementById('analysis-pressure');
        if (pressureSlider) {
            pressureSlider.addEventListener('input', (e) => {
                this.environmental_data.pressure = parseFloat(e.target.value);
                this.updateEnvironmentalDisplay();
            });
        }
        
        const radiationSlider = document.getElementById('radiation-threshold');
        if (radiationSlider) {
            radiationSlider.addEventListener('input', (e) => {
                this.experiments.radiation_monitoring.alert_threshold = parseFloat(e.target.value);
                this.updateRadiationDisplay();
            });
        }
    }
    
    collectSoilSample() {
        const sample = {
            id: `SOIL_${Date.now()}`,
            timestamp: new Date(),
            location: this.generateRandomCoordinates(),
            depth: Math.random() * 50 + 5, // 5-55 cm depth
            status: 'collected'
        };
        
        this.experiments.soil_analysis.samples.push(sample);
        this.updateSampleList('soil');
        
        // Auto-log to mission log
        if (window.missionLog) {
            window.missionLog.autoLog(`Soil sample collected at depth ${sample.depth.toFixed(1)}cm`, 'science');
        }
    }
    
    collectWaterSample() {
        const sample = {
            id: `WATER_${Date.now()}`,
            timestamp: new Date(),
            location: this.generateRandomCoordinates(),
            source: Math.random() > 0.5 ? 'ice_core' : 'subsurface',
            volume: Math.random() * 500 + 100, // 100-600 ml
            status: 'collected'
        };
        
        this.experiments.water_analysis.samples.push(sample);
        this.updateSampleList('water');
        
        console.log('Water sample collected:', sample);
        
        // Auto-log to mission log
        if (window.missionLog) {
            window.missionLog.autoLog(`Water sample collected (${sample.source}, ${sample.volume.toFixed(0)}ml)`, 'science');
        }
    }
    
    startSoilAnalysis() {
        if (this.experiments.soil_analysis.samples.length === 0) {
            alert('No soil samples available. Please collect a sample first.');
            return;\n        }\n        \n        const sample = this.experiments.soil_analysis.samples[this.experiments.soil_analysis.samples.length - 1];
        this.experiments.soil_analysis.current_sample = sample;
        this.experiments.soil_analysis.active = true;
        this.experiments.soil_analysis.analysis_progress = 0;
        
        // Simulate analysis process
        this.runAnalysis('soil', sample);
        
        console.log('Soil analysis started for sample:', sample.id);
    }
    
    startWaterAnalysis() {
        if (this.experiments.water_analysis.samples.length === 0) {
            alert('No water samples available. Please collect a sample first.');
            return;\n        }\n        \n        const sample = this.experiments.water_analysis.samples[this.experiments.water_analysis.samples.length - 1];
        this.experiments.water_analysis.current_sample = sample;
        this.experiments.water_analysis.active = true;
        this.experiments.water_analysis.analysis_progress = 0;
        
        // Simulate analysis process
        this.runAnalysis('water', sample);
        
        console.log('Water analysis started for sample:', sample.id);
    }
    
    runAnalysis(type, sample) {
        const analysisInterval = setInterval(() => {
            this.experiments[type + '_analysis'].analysis_progress += Math.random() * 15 + 5; // 5-20% per interval
            
            if (this.experiments[type + '_analysis'].analysis_progress >= 100) {
                this.experiments[type + '_analysis'].analysis_progress = 100;
                this.experiments[type + '_analysis'].active = false;
                
                // Generate analysis results
                const results = this.generateAnalysisResults(type, sample);
                sample.results = results;
                sample.status = 'analyzed';
                
                this.analysis_history.push({
                    type: type,
                    sample: sample,
                    results: results,
                    timestamp: new Date()
                });
                
                this.updateAnalysisResults(type, results);
                this.checkForAnomalies(type, results);
                
                clearInterval(analysisInterval);
                
                console.log(`${type} analysis completed:`, results);
                
                // Auto-log to mission log
                if (window.missionLog) {
                    window.missionLog.autoLog(`${type.charAt(0).toUpperCase() + type.slice(1)} analysis completed for sample ${sample.id}`, 'science');
                }
            }
            
            this.updateAnalysisProgress(type);
        }, 1000); // Update every second
    }
    
    generateAnalysisResults(type, sample) {
        if (type === 'soil') {
            return {
                ph: this.martian_data.soil.ph + (Math.random() - 0.5) * 2,
                moisture: this.martian_data.soil.moisture + Math.random() * 0.05,
                organic_matter: this.martian_data.soil.organic_matter + Math.random() * 0.002,
                minerals: {
                    iron_oxide: this.martian_data.soil.minerals.iron_oxide + (Math.random() - 0.5) * 5,
                    silicon_dioxide: this.martian_data.soil.minerals.silicon_dioxide + (Math.random() - 0.5) * 10,
                    aluminum_oxide: this.martian_data.soil.minerals.aluminum_oxide + (Math.random() - 0.5) * 3,
                    magnesium_oxide: this.martian_data.soil.minerals.magnesium_oxide + (Math.random() - 0.5) * 3,
                    calcium_oxide: this.martian_data.soil.minerals.calcium_oxide + (Math.random() - 0.5) * 2
                },
                salts: {
                    perchlorates: this.martian_data.soil.salts.perchlorates + Math.random() * 0.3,
                    sulfates: this.martian_data.soil.salts.sulfates + Math.random() * 0.5,
                    chlorides: this.martian_data.soil.salts.chlorides + Math.random() * 0.2
                },
                texture: Math.random() > 0.7 ? 'rocky' : Math.random() > 0.4 ? 'sandy' : 'fine_dust',
                color: Math.random() > 0.8 ? 'dark_red' : Math.random() > 0.5 ? 'rust_red' : 'orange_red'
            };
        } else if (type === 'water') {
            const waterDetected = Math.random() > 0.3; // 70% chance of detecting water
            return {
                water_detected: waterDetected,
                ice_content: waterDetected ? Math.random() * 15 + 5 : 0, // 5-20% if detected
                salinity: waterDetected ? Math.random() * 35 : 0, // 0-35 ppt if detected
                ph: waterDetected ? 6.5 + Math.random() * 2 : 0, // 6.5-8.5 if detected
                dissolved_minerals: waterDetected ? {
                    sodium: Math.random() * 1000,
                    magnesium: Math.random() * 500,
                    calcium: Math.random() * 300,
                    sulfate: Math.random() * 800
                } : {},
                biological_indicators: Math.random() > 0.95 ? 'possible_organic_compounds' : 'none'
            };
        }
    }
    
    collectAtmosphericData() {
        const reading = {
            id: `ATM_${Date.now()}`,
            timestamp: new Date(),
            pressure: this.martian_data.atmosphere.pressure + (Math.random() - 0.5) * 0.1,
            temperature: this.martian_data.atmosphere.temperature + (Math.random() - 0.5) * 20,
            composition: {
                co2: this.martian_data.atmosphere.composition.co2 + (Math.random() - 0.5) * 1,
                nitrogen: this.martian_data.atmosphere.composition.nitrogen + (Math.random() - 0.5) * 0.5,
                argon: this.martian_data.atmosphere.composition.argon + (Math.random() - 0.5) * 0.2,
                oxygen: this.martian_data.atmosphere.composition.oxygen + (Math.random() - 0.5) * 0.05,
                water_vapor: this.martian_data.atmosphere.composition.water_vapor + Math.random() * 0.02
            },
            wind_speed: Math.random() * 30 + 5, // 5-35 m/s
            dust_level: Math.random() * 100 // 0-100 opacity index
        };
        
        this.experiments.atmospheric_analysis.readings.push(reading);
        this.updateAtmosphericDisplay(reading);
        
        console.log('Atmospheric data collected:', reading);
        
        // Auto-log to mission log
        if (window.missionLog) {
            window.missionLog.autoLog(`Atmospheric data collected - Pressure: ${reading.pressure.toFixed(2)} kPa, Temp: ${reading.temperature.toFixed(1)}\u00b0C`, 'science');
        }
    }
    
    toggleRadiationMonitoring() {
        this.experiments.radiation_monitoring.active = !this.experiments.radiation_monitoring.active;
        
        const toggleBtn = document.getElementById('toggle-radiation-monitoring');
        if (toggleBtn) {
            toggleBtn.textContent = this.experiments.radiation_monitoring.active ? 'Stop Monitoring' : 'Start Monitoring';
            toggleBtn.classList.toggle('active', this.experiments.radiation_monitoring.active);
        }
        
        console.log(`Radiation monitoring: ${this.experiments.radiation_monitoring.active ? 'ON' : 'OFF'}`);
    }
    
    generateRandomCoordinates() {
        return {
            latitude: (Math.random() - 0.5) * 180,
            longitude: (Math.random() - 0.5) * 360,
            elevation: Math.random() * 10000 - 5000 // -5000 to +5000 meters
        };
    }
    
    updateSampleList(type) {
        const container = document.getElementById(`${type}-samples-list`);
        if (!container) return;
        
        const samples = this.experiments[type + '_analysis'].samples;
        container.innerHTML = samples.map(sample => `
            <div class=\"sample-item ${sample.status}\">
                <div class=\"sample-header\">
                    <span class=\"sample-id\">${sample.id}</span>
                    <span class=\"sample-status ${sample.status}\">${sample.status}</span>
                </div>
                <div class=\"sample-details\">
                    <span class=\"sample-time\">${sample.timestamp.toLocaleTimeString()}</span>
                    ${type === 'soil' ? `<span class=\"sample-depth\">${sample.depth.toFixed(1)}cm</span>` : ''}
                    ${type === 'water' ? `<span class=\"sample-volume\">${sample.volume.toFixed(0)}ml</span>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    updateAnalysisProgress(type) {
        const progressBar = document.getElementById(`${type}-analysis-progress`);
        const progressText = document.getElementById(`${type}-analysis-status`);
        
        if (progressBar) {
            const progress = this.experiments[type + '_analysis'].analysis_progress;
            progressBar.style.width = `${progress}%`;
        }
        
        if (progressText) {
            if (this.experiments[type + '_analysis'].active) {
                progressText.textContent = `Analyzing... ${this.experiments[type + '_analysis'].analysis_progress.toFixed(0)}%`;
            } else {
                progressText.textContent = this.experiments[type + '_analysis'].analysis_progress >= 100 ? 'Analysis Complete' : 'Ready';
            }
        }
    }
    
    updateAnalysisResults(type, results) {
        const container = document.getElementById(`${type}-results`);
        if (!container) return;
        
        if (type === 'soil') {
            container.innerHTML = `
                <div class=\"result-section\">
                    <h4>Chemical Composition</h4>
                    <div class=\"result-grid\">
                        <div class=\"result-item\"><span>pH:</span> <span>${results.ph.toFixed(1)}</span></div>
                        <div class=\"result-item\"><span>Moisture:</span> <span>${(results.moisture * 100).toFixed(2)}%</span></div>
                        <div class=\"result-item\"><span>Organic Matter:</span> <span>${(results.organic_matter * 100).toFixed(3)}%</span></div>
                    </div>
                </div>
                <div class=\"result-section\">
                    <h4>Mineral Content</h4>
                    <div class=\"result-grid\">
                        <div class=\"result-item\"><span>Iron Oxide:</span> <span>${results.minerals.iron_oxide.toFixed(1)}%</span></div>
                        <div class=\"result-item\"><span>Silicon Dioxide:</span> <span>${results.minerals.silicon_dioxide.toFixed(1)}%</span></div>
                        <div class=\"result-item\"><span>Aluminum Oxide:</span> <span>${results.minerals.aluminum_oxide.toFixed(1)}%</span></div>
                    </div>
                </div>
                <div class=\"result-section\">
                    <h4>Physical Properties</h4>
                    <div class=\"result-grid\">
                        <div class=\"result-item\"><span>Texture:</span> <span>${results.texture.replace('_', ' ')}</span></div>
                        <div class=\"result-item\"><span>Color:</span> <span>${results.color.replace('_', ' ')}</span></div>
                        <div class=\"result-item\"><span>Perchlorates:</span> <span>${results.salts.perchlorates.toFixed(2)}%</span></div>
                    </div>
                </div>
            `;
        } else if (type === 'water') {
            container.innerHTML = `
                <div class=\"result-section\">
                    <h4>Water Detection</h4>
                    <div class=\"result-grid\">
                        <div class=\"result-item water-${results.water_detected ? 'detected' : 'not-detected'}\">
                            <span>Water:</span> <span>${results.water_detected ? 'DETECTED' : 'NOT DETECTED'}</span>
                        </div>
                        ${results.water_detected ? `
                            <div class=\"result-item\"><span>Ice Content:</span> <span>${results.ice_content.toFixed(1)}%</span></div>
                            <div class=\"result-item\"><span>Salinity:</span> <span>${results.salinity.toFixed(1)} ppt</span></div>
                            <div class=\"result-item\"><span>pH:</span> <span>${results.ph.toFixed(1)}</span></div>
                        ` : ''}
                    </div>
                </div>
                ${results.water_detected && results.biological_indicators !== 'none' ? `
                    <div class=\"result-section biological-alert\">
                        <h4><i class=\"fas fa-exclamation-triangle\"></i> Biological Indicators</h4>
                        <div class=\"biological-result\">${results.biological_indicators.replace('_', ' ')}</div>
                    </div>
                ` : ''}
            `;
        }
    }
    
    updateEnvironmentalDisplay() {
        const elements = {
            'env-temperature': `${this.environmental_data.temperature.toFixed(1)}\u00b0C`,
            'env-humidity': `${this.environmental_data.humidity.toFixed(0)}%`,
            'env-pressure': `${this.environmental_data.pressure.toFixed(1)} kPa`,
            'env-oxygen': `${this.environmental_data.oxygen.toFixed(1)}%`,
            'env-co2': `${this.environmental_data.co2.toFixed(0)} ppm`,
            'env-radiation': `${this.environmental_data.radiation.toFixed(3)} mSv/h`,
            'env-particles': `${this.environmental_data.particle_count.toFixed(0)} p/cm\u00b3`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }
    
    updateMartianDataDisplay() {
        const elements = {
            'mars-pressure': `${this.martian_data.atmosphere.pressure.toFixed(2)} kPa`,
            'mars-temperature': `${this.martian_data.atmosphere.temperature.toFixed(0)}\u00b0C`,
            'mars-co2': `${this.martian_data.atmosphere.composition.co2.toFixed(1)}%`,
            'mars-nitrogen': `${this.martian_data.atmosphere.composition.nitrogen.toFixed(1)}%`,
            'mars-soil-ph': `${this.martian_data.soil.ph.toFixed(1)}`,
            'mars-iron': `${this.martian_data.soil.minerals.iron_oxide.toFixed(1)}%`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }
    
    updateAtmosphericDisplay(reading) {
        const container = document.getElementById('atmospheric-readings');
        if (!container) return;\n        \n        const readingElement = document.createElement('div');
        readingElement.className = 'atmospheric-reading';
        readingElement.innerHTML = `
            <div class=\"reading-header\">
                <span class=\"reading-id\">${reading.id}</span>
                <span class=\"reading-time\">${reading.timestamp.toLocaleTimeString()}</span>
            </div>
            <div class=\"reading-data\">
                <div class=\"data-item\"><span>Pressure:</span> <span>${reading.pressure.toFixed(2)} kPa</span></div>
                <div class=\"data-item\"><span>Temperature:</span> <span>${reading.temperature.toFixed(1)}\u00b0C</span></div>
                <div class=\"data-item\"><span>Wind Speed:</span> <span>${reading.wind_speed.toFixed(1)} m/s</span></div>
                <div class=\"data-item\"><span>Dust Level:</span> <span>${reading.dust_level.toFixed(0)}%</span></div>
            </div>
        `;
        
        container.insertBefore(readingElement, container.firstChild);
        
        // Keep only last 10 readings displayed
        while (container.children.length > 10) {
            container.removeChild(container.lastChild);
        }
    }
    
    checkForAnomalies(type, results) {
        const anomalies = [];
        
        if (type === 'soil') {
            if (results.ph < 6.0 || results.ph > 10.0) {
                anomalies.push(`Unusual soil pH: ${results.ph.toFixed(1)}`);
            }
            if (results.organic_matter > 0.005) {
                anomalies.push(`High organic matter content: ${(results.organic_matter * 100).toFixed(3)}%`);
            }
            if (results.salts.perchlorates > 1.0) {
                anomalies.push(`High perchlorate levels: ${results.salts.perchlorates.toFixed(2)}%`);
            }
        } else if (type === 'water' && results.water_detected) {
            if (results.biological_indicators !== 'none') {
                anomalies.push(`Biological indicators detected: ${results.biological_indicators}`);
            }
            if (results.salinity > 30) {
                anomalies.push(`Extremely high salinity: ${results.salinity.toFixed(1)} ppt`);
            }
        }
        
        anomalies.forEach(anomaly => {
            this.anomalies.push({
                type: type,
                description: anomaly,
                timestamp: new Date(),
                severity: 'medium'
            });
            
            console.log(`Anomaly detected: ${anomaly}`);
            
            // Auto-log to mission log
            if (window.missionLog) {
                window.missionLog.autoLog(`ANOMALY: ${anomaly}`, 'science');
            }
        });
        
        this.updateAnomaliesDisplay();
    }
    
    updateAnomaliesDisplay() {
        const container = document.getElementById('anomalies-list');
        if (!container) return;
        
        container.innerHTML = this.anomalies.slice(-5).map(anomaly => `
            <div class=\"anomaly-item ${anomaly.severity}\">
                <div class=\"anomaly-header\">
                    <span class=\"anomaly-type\">${anomaly.type.toUpperCase()}</span>
                    <span class=\"anomaly-time\">${anomaly.timestamp.toLocaleTimeString()}</span>
                </div>
                <div class=\"anomaly-description\">${anomaly.description}</div>
            </div>
        `).join('');
    }
    
    startMonitoring() {
        // Update environmental data every 5 seconds
        setInterval(() => {
            // Simulate small changes in environmental data
            this.environmental_data.temperature += (Math.random() - 0.5) * 0.5;
            this.environmental_data.humidity += (Math.random() - 0.5) * 2;
            this.environmental_data.pressure += (Math.random() - 0.5) * 0.1;
            this.environmental_data.co2 += (Math.random() - 0.5) * 10;
            this.environmental_data.radiation += (Math.random() - 0.5) * 0.01;
            
            // Check radiation threshold
            if (this.experiments.radiation_monitoring.active) {
                this.experiments.radiation_monitoring.readings.push({
                    timestamp: new Date(),
                    value: this.environmental_data.radiation
                });
                
                if (this.environmental_data.radiation > this.experiments.radiation_monitoring.alert_threshold / 1000) {
                    console.warn('Radiation threshold exceeded!');
                    
                    // Auto-log to mission log
                    if (window.missionLog) {
                        window.missionLog.autoLog(`ALERT: Radiation threshold exceeded - ${this.environmental_data.radiation.toFixed(3)} mSv/h`, 'emergency');
                    }
                }
            }
            
            this.updateEnvironmentalDisplay();
        }, 5000);
    }
}

// Initialize scientific analysis system
let scientificAnalysis;

document.addEventListener('DOMContentLoaded', () => {
    scientificAnalysis = new ScientificAnalysis();
    console.log('Scientific Analysis System initialized');
});\n\n// Export for use by other modules\nwindow.scientificAnalysis = scientificAnalysis;

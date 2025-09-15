// Voice Command System
class VoiceCommandSystem {
    constructor() {
        this.baseURL = 'http://localhost:8000';
        this.isListening = false;
        this.recognition = null;
        this.isSupported = false;
        this.currentCommand = null;
        this.commandHistory = [];
        this.statusIndicator = null;
        this.setupVoiceRecognition();
    }

    setupVoiceRecognition() {
        // Check for browser support
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.isSupported = true;
            
            // Configure recognition
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 1;
            
            // Set up event handlers
            this.recognition.onstart = () => this.onRecognitionStart();
            this.recognition.onresult = (event) => this.onRecognitionResult(event);
            this.recognition.onerror = (event) => this.onRecognitionError(event);
            this.recognition.onend = () => this.onRecognitionEnd();
            
        } else {
            console.warn('Speech recognition not supported in this browser');
            this.isSupported = false;
        }
    }

    init() {
        this.createVoiceInterface();
        this.setupEventListeners();
        
        if (this.isSupported) {
            this.showVoiceStatus('Voice commands ready', 'ready');
        } else {
            this.showVoiceStatus('Voice commands not supported', 'error');
        }
    }

    createVoiceInterface() {
        // Create voice command panel
        const voicePanel = document.createElement('div');
        voicePanel.className = 'voice-command-panel';
        voicePanel.innerHTML = `
            <div class="voice-header">
                <h3><i class="fas fa-microphone"></i> Voice Assistant</h3>
                <div class="voice-status" id="voiceStatus">
                    <span class="status-text">Ready</span>
                </div>
            </div>
            
            <div class="voice-controls">
                <button class="voice-btn" id="voiceToggleBtn">
                    <i class="fas fa-microphone"></i>
                    <span>Tap to Speak</span>
                </button>
                
                <div class="voice-indicators">
                    <div class="listening-indicator" id="listeningIndicator">
                        <div class="pulse-ring"></div>
                        <div class="pulse-ring"></div>
                        <div class="pulse-ring"></div>
                    </div>
                </div>
            </div>
            
            <div class="command-display">
                <div class="current-command" id="currentCommand">
                    <span class="placeholder">Say a command...</span>
                </div>
                <div class="command-response" id="commandResponse"></div>
            </div>
            
            <div class="voice-help">
                <button class="help-btn" id="voiceHelpBtn">
                    <i class="fas fa-question-circle"></i>
                    Voice Commands
                </button>
            </div>
            
            <div class="command-history" id="commandHistory">
                <h4>Recent Commands</h4>
                <div class="history-list" id="historyList">
                    <div class="no-history">No recent commands</div>
                </div>
            </div>
        `;

        // Add to dashboard or create floating panel
        const dashboard = document.querySelector('.dashboard');
        if (dashboard) {
            const floatingVoice = document.createElement('div');
            floatingVoice.className = 'floating-voice-panel';
            floatingVoice.appendChild(voicePanel);
            dashboard.appendChild(floatingVoice);
        }

        this.statusIndicator = document.getElementById('voiceStatus');
    }

    setupEventListeners() {
        // Voice toggle button
        const toggleBtn = document.getElementById('voiceToggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleListening());
        }

        // Help button
        const helpBtn = document.getElementById('voiceHelpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showVoiceHelp());
        }

        // Keyboard shortcut (Space bar to activate)
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && event.ctrlKey) {
                event.preventDefault();
                this.toggleListening();
            }
        });

        // Global voice activation phrase setup
        if (this.isSupported) {
            // Wake word detection could be implemented here
        }
    }



    toggleListening() {
        if (!this.isSupported) {
            this.showVoiceStatus('Voice recognition not supported', 'error');
            return;
        }

        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (!this.recognition || this.isListening) return;

        try {
            this.isListening = true;
            this.recognition.start();
            this.showListeningState(true);
            this.updateCurrentCommand('Listening...');
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            this.showVoiceStatus('Error starting voice recognition', 'error');
            this.isListening = false;
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.showListeningState(false);
        }
    }

    onRecognitionStart() {
        console.log('Voice recognition started');
        this.showVoiceStatus('Listening...', 'listening');
    }

    onRecognitionResult(event) {
        const result = event.results[0];
        const command = result[0].transcript;
        const confidence = result[0].confidence;

        console.log(`Voice command: "${command}" (confidence: ${confidence})`);
        
        this.updateCurrentCommand(command);
        this.processVoiceCommand(command, confidence);
    }

    onRecognitionError(event) {
        console.error('Voice recognition error:', event.error);
        let errorMessage = 'Voice recognition error';
        
        switch (event.error) {
            case 'no-speech':
                errorMessage = 'No speech detected';
                break;
            case 'audio-capture':
                errorMessage = 'Microphone access denied';
                break;
            case 'not-allowed':
                errorMessage = 'Microphone permission required';
                break;
            case 'network':
                errorMessage = 'Network error';
                break;
            default:
                errorMessage = `Error: ${event.error}`;
        }
        
        this.showVoiceStatus(errorMessage, 'error');
        this.updateCurrentCommand('');
    }

    onRecognitionEnd() {
        console.log('Voice recognition ended');
        this.isListening = false;
        this.showListeningState(false);
        this.showVoiceStatus('Ready', 'ready');
    }

    async processVoiceCommand(command, confidence) {
        try {
            const response = await window.authManager.makeAuthenticatedRequest(
                `${this.baseURL}/voice/command`,
                {
                    method: 'POST',
                    body: JSON.stringify({ command: command })
                }
            );

            if (response.ok) {
                const result = await response.json();
                this.handleCommandResponse(result, command);
            } else {
                this.showCommandResponse('Error processing command', 'error');
            }
        } catch (error) {
            console.error('Error processing voice command:', error);
            this.showCommandResponse('Error processing command', 'error');
        }
    }

    handleCommandResponse(result, originalCommand) {
        // Add to command history
        this.addToHistory(originalCommand, result);
        
        // Show response
        this.showCommandResponse(result.response, result.success ? 'success' : 'error');
        
        // Execute action if successful
        if (result.success && result.action) {
            this.executeAction(result.action, result.additional_data);
        }
        
        // Speak response (if supported)
        this.speakResponse(result.response);
    }

    executeAction(action, data) {
        switch (action) {
            case 'open_panel':
                this.openPanel(data.panel);
                break;
            case 'show_vitals':
                this.showVitals(data.vital_type);
                break;
            case 'show_position':
                this.showPosition();
                break;
            case 'emergency_protocol':
                this.activateEmergencyProtocol();
                break;
            case 'show_space_weather':
                this.showSpaceWeather();
                break;
            case 'emergency_stop':
                this.emergencyStop();
                break;
            default:
                this.showVoiceStatus(`Action ${action} not implemented`, 'error');
        }
    }

    openPanel(panelName) {
        const panel = document.querySelector(`.${panelName}-panel`);
        if (panel) {
            panel.scrollIntoView({ behavior: 'smooth' });
            panel.classList.add('highlighted');
            setTimeout(() => panel.classList.remove('highlighted'), 3000);
        }
    }

    showVitals(vitalType) {
        const vitalsPanel = document.querySelector('.vital-signs-panel');
        if (vitalsPanel) {
            vitalsPanel.scrollIntoView({ behavior: 'smooth' });
            
            if (vitalType !== 'all') {
                const vitalCard = vitalsPanel.querySelector(`.vital-card.${vitalType.replace('_', '-')}`);
                if (vitalCard) {
                    vitalCard.classList.add('highlighted');
                    setTimeout(() => vitalCard.classList.remove('highlighted'), 3000);
                }
            }
        }
    }

    showPosition() {
        const navigationPanel = document.querySelector('.navigation-panel');
        if (navigationPanel) {
            navigationPanel.scrollIntoView({ behavior: 'smooth' });
            navigationPanel.classList.add('highlighted');
            setTimeout(() => navigationPanel.classList.remove('highlighted'), 3000);
        }
    }

    showSpaceWeather() {
        const weatherPanel = document.querySelector('.space-weather-panel');
        if (weatherPanel) {
            weatherPanel.scrollIntoView({ behavior: 'smooth' });
            weatherPanel.classList.add('highlighted');
            setTimeout(() => weatherPanel.classList.remove('highlighted'), 3000);
        }
    }

    activateEmergencyProtocol() {
        // Flash red warning
        document.body.classList.add('emergency-mode');
        setTimeout(() => document.body.classList.remove('emergency-mode'), 5000);
        
        // Show emergency alert
        if (window.animationController) {
            window.animationController.triggerCriticalAlert();
        }
    }

    emergencyStop() {
        // Visual feedback for emergency stop
        this.activateEmergencyProtocol();
    }

    speakResponse(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            speechSynthesis.speak(utterance);
        }
    }

    showListeningState(listening) {
        const indicator = document.getElementById('listeningIndicator');
        const toggleBtn = document.getElementById('voiceToggleBtn');
        
        if (indicator) {
            indicator.style.display = listening ? 'block' : 'none';
        }
        
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            const text = toggleBtn.querySelector('span');
            
            if (listening) {
                icon.className = 'fas fa-stop';
                text.textContent = 'Stop Listening';
                toggleBtn.classList.add('listening');
            } else {
                icon.className = 'fas fa-microphone';
                text.textContent = 'Tap to Speak';
                toggleBtn.classList.remove('listening');
            }
        }
    }

    showVoiceStatus(message, type) {
        if (this.statusIndicator) {
            const statusText = this.statusIndicator.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = message;
                statusText.className = `status-text ${type}`;
            }
        }
    }

    updateCurrentCommand(command) {
        const commandDisplay = document.getElementById('currentCommand');
        if (commandDisplay) {
            if (command) {
                commandDisplay.innerHTML = `<span class="command-text">"${command}"</span>`;
            } else {
                commandDisplay.innerHTML = '<span class="placeholder">Say a command...</span>';
            }
        }
    }

    showCommandResponse(response, type) {
        const responseDisplay = document.getElementById('commandResponse');
        if (responseDisplay) {
            responseDisplay.innerHTML = `<span class="response-text ${type}">${response}</span>`;
            
            // Auto-clear after 10 seconds
            setTimeout(() => {
                responseDisplay.innerHTML = '';
            }, 10000);
        }
    }

    addToHistory(command, result) {
        const historyItem = {
            command: command,
            response: result.response,
            success: result.success,
            timestamp: new Date(),
            confidence: result.confidence
        };
        
        this.commandHistory.unshift(historyItem);
        
        // Keep only last 10 commands
        if (this.commandHistory.length > 10) {
            this.commandHistory = this.commandHistory.slice(0, 10);
        }
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        if (this.commandHistory.length === 0) {
            historyList.innerHTML = '<div class="no-history">No recent commands</div>';
            return;
        }
        
        historyList.innerHTML = '';
        
        this.commandHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${item.success ? 'success' : 'error'}`;
            historyItem.innerHTML = `
                <div class="history-command">"${item.command}"</div>
                <div class="history-response">${item.response}</div>
                <div class="history-time">${this.formatTimeAgo(item.timestamp)}</div>
            `;
            historyList.appendChild(historyItem);
        });
    }

    async showVoiceHelp() {
        try {
            const response = await window.authManager.makeAuthenticatedRequest(
                `${this.baseURL}/voice/help`
            );

            if (response.ok) {
                const helpData = await response.json();
                this.displayHelpModal(helpData);
            }
        } catch (error) {
            console.error('Error fetching voice help:', error);
        }
    }

    displayHelpModal(helpData) {
        const modal = document.createElement('div');
        modal.className = 'voice-help-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-microphone"></i> Voice Commands Help</h2>
                    <button class="close-btn" onclick="this.closest('.voice-help-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="help-content">
                        <pre>${helpData.help_text}</pre>
                    </div>
                    <div class="help-examples">
                        <h3>Example Commands:</h3>
                        <ul>
                            ${helpData.examples.map(example => `<li>"${example}"</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const diffMs = now - timestamp;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        
        if (diffSecs < 60) {
            return `${diffSecs}s ago`;
        } else if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else {
            return timestamp.toLocaleTimeString();
        }
    }

    destroy() {
        if (this.recognition) {
            this.recognition.stop();
            this.recognition = null;
        }
    }
}

// Initialize voice command system
window.voiceCommandSystem = new VoiceCommandSystem();
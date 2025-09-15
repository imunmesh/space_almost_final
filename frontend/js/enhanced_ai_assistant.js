/**
 * Enhanced AI Tourism Assistant with API Integration and Location Awareness
 * Provides real-time contextual information and management notifications
 */

class EnhancedAIAssistant {
    constructor() {
        this.isActive = false;
        this.apiEndpoint = 'http://localhost:8000/api';
        this.currentLocation = null;
        this.locationHistory = [];
        this.notifications = [];
        this.conversationHistory = [];
        this.webSocket = null;
        this.speechSynthesis = window.speechSynthesis;
        
        // Enhanced knowledge base with location-specific information
        this.locationDatabase = {
            'earth-orbit': {
                description: "You're currently in Earth orbit at approximately 408 kilometers above our beautiful planet.",
                points_of_interest: [
                    "The International Space Station orbits Earth",
                    "You can see the curvature of Earth and the thin blue line of our atmosphere",
                    "Earth completes one rotation every 24 hours beneath you",
                    "The aurora borealis and aurora australis are visible from this altitude"
                ],
                activities: [
                    "Earth observation and photography",
                    "Scientific experiments in microgravity",
                    "Communication with ground control",
                    "Monitoring space weather conditions"
                ]
            },
            'moon-vicinity': {
                description: "Amazing! You're near the Moon, our natural satellite, about 384,400 km from Earth.",
                points_of_interest: [
                    "The Moon has no atmosphere, creating a stark, airless landscape",
                    "Lunar maria (dark areas) are ancient lava plains",
                    "The far side of the Moon is always hidden from Earth",
                    "Lunar gravity is about 1/6th of Earth's gravity"
                ],
                activities: [
                    "Lunar surface observation",
                    "Crater identification and study",
                    "Earth-rise photography",
                    "Low-gravity movement practice"
                ]
            },
            'deep-space': {
                description: "You're now in deep space, far from Earth's protective embrace.",
                points_of_interest: [
                    "Stars appear incredibly bright without atmospheric interference",
                    "The Milky Way galaxy is clearly visible",
                    "Cosmic radiation levels are higher here",
                    "Communication with Earth has increased delay"
                ],
                activities: [
                    "Deep space photography",
                    "Stellar navigation practice",
                    "Cosmic ray monitoring",
                    "Meditation and reflection"
                ]
            }
        };
        
        this.emergencyProtocols = {
            'medical': {
                steps: [
                    "Stay calm and assess the situation",
                    "Contact medical team immediately",
                    "Follow first aid procedures",
                    "Monitor vital signs continuously"
                ]
            },
            'technical': {
                steps: [
                    "Report issue to mission control",
                    "Switch to backup systems if available",
                    "Follow emergency checklist",
                    "Prepare for potential evacuation"
                ]
            },
            'communication': {
                steps: [
                    "Check antenna alignment",
                    "Switch to backup communication systems",
                    "Use emergency beacon if necessary",
                    "Maintain regular status updates"
                ]
            }
        };
        
        this.init();
    }

    async init() {
        this.setupWebSocket();
        this.bindEvents();
        this.loadPersonalPreferences();
        await this.getCurrentLocation();
        console.log('Enhanced AI Assistant initialized');
    }

    setupWebSocket() {
        // Connect to management notifications
        try {
            this.webSocket = new WebSocket('ws://localhost:8000/ws/management-notifications');
            
            this.webSocket.onopen = () => {
                console.log('AI Assistant connected to management system');
                this.sendMessage('assistant', 'Connected to management system for real-time updates.');
            };
            
            this.webSocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleManagementNotification(data);
            };
            
            this.webSocket.onclose = () => {
                console.log('Management connection lost, attempting reconnect...');
                setTimeout(() => this.setupWebSocket(), 5000);
            };
            
        } catch (error) {
            console.error('Failed to connect to management system:', error);
        }
    }

    handleManagementNotification(data) {
        let message = '';
        let urgency = 'normal';
        
        switch (data.type) {
            case 'course_change':
                message = `Course adjustment initiated. New heading: ${data.heading}°. Expected duration: ${data.duration} minutes.`;
                urgency = 'important';
                break;
            case 'emergency_drill':
                message = `Emergency drill starting in ${data.countdown} minutes. Please prepare for safety procedures.`;
                urgency = 'urgent';
                break;
            case 'system_update':
                message = `System update: ${data.system} is now ${data.status}. ${data.description}`;
                urgency = 'normal';
                break;
            case 'location_update':
                message = `We're now approaching ${data.location}. ${data.description}`;
                this.updateLocation(data.location);
                urgency = 'important';
                break;
            case 'weather_alert':
                message = `Space weather alert: ${data.alert_type}. Recommended actions: ${data.recommendations}`;
                urgency = 'urgent';
                break;
            default:
                message = data.message || 'Management system update received.';
        }
        
        this.addNotification({
            id: Date.now(),
            type: data.type,
            message: message,
            urgency: urgency,
            timestamp: new Date(),
            acknowledged: false
        });
        
        this.displayNotification(message, urgency);
        
        if (urgency === 'urgent') {
            this.triggerUrgentAlert();
        }
    }

    async getCurrentLocation() {
        try {
            const response = await fetch(`${this.apiEndpoint}/navigation/current-position`);
            if (response.ok) {
                const data = await response.json();
                this.updateLocation(data.location);
            } else {
                // Fallback to simulated location
                this.simulateLocationUpdates();
            }
        } catch (error) {
            console.error('Failed to get current location:', error);
            this.simulateLocationUpdates();
        }
    }

    simulateLocationUpdates() {
        // Simulate location changes for demo
        const locations = ['earth-orbit', 'moon-vicinity', 'deep-space'];
        let currentIndex = 0;
        
        setInterval(() => {
            if (Math.random() > 0.8) { // 20% chance to change location
                currentIndex = (currentIndex + 1) % locations.length;
                this.updateLocation(locations[currentIndex]);
            }
        }, 30000); // Check every 30 seconds
    }

    updateLocation(newLocation) {
        const previousLocation = this.currentLocation;
        this.currentLocation = newLocation;
        
        // Add to location history
        this.locationHistory.push({
            location: newLocation,
            timestamp: new Date(),
            duration: null
        });
        
        // Update duration of previous location
        if (this.locationHistory.length > 1) {
            const prevEntry = this.locationHistory[this.locationHistory.length - 2];
            prevEntry.duration = Date.now() - prevEntry.timestamp.getTime();
        }
        
        // Keep only recent history
        if (this.locationHistory.length > 10) {
            this.locationHistory.shift();
        }
        
        // Provide location-specific welcome message
        if (previousLocation !== newLocation) {
            this.provideLocationContext(newLocation);
        }
        
        this.updateLocationUI();
    }

    provideLocationContext(location) {
        const locationInfo = this.locationDatabase[location];
        if (!locationInfo) return;
        
        let contextMessage = locationInfo.description + " ";
        
        // Add interesting facts
        if (locationInfo.points_of_interest.length > 0) {
            const randomFact = locationInfo.points_of_interest[
                Math.floor(Math.random() * locationInfo.points_of_interest.length)
            ];
            contextMessage += randomFact;
        }
        
        // Suggest activities
        if (locationInfo.activities.length > 0) {
            const randomActivity = locationInfo.activities[
                Math.floor(Math.random() * locationInfo.activities.length)
            ];
            contextMessage += ` You might enjoy ${randomActivity} while you're here.`;
        }
        
        this.sendMessage('assistant', contextMessage);
        this.speakMessage(contextMessage);
    }

    activate() {
        if (this.isActive) return;
        
        this.isActive = true;
        console.log('Enhanced AI Tourism Assistant activated');
        
        // Welcome message with current location
        const welcomeMessage = this.generateWelcomeMessage();
        this.sendMessage('assistant', welcomeMessage);
        
        this.updateUI();
    }

    deactivate() {
        this.isActive = false;
        console.log('Enhanced AI Tourism Assistant deactivated');
        this.updateUI();
    }

    generateWelcomeMessage() {
        const greetings = [
            "Welcome aboard! I'm your enhanced AI space tourism guide.",
            "Hello, space traveler! I'm here to make your cosmic journey unforgettable.",
            "Greetings from the cosmos! Your AI assistant is ready to help."
        ];
        
        let message = greetings[Math.floor(Math.random() * greetings.length)];
        
        if (this.currentLocation) {
            const locationInfo = this.locationDatabase[this.currentLocation];
            if (locationInfo) {
                message += ` ${locationInfo.description}`;
            }
        }
        
        message += " I'm connected to the management system to keep you informed of any changes during your journey.";
        
        return message;
    }

    async handleQuickQuestion(questionType) {
        let response = '';
        
        switch (questionType) {
            case 'where-are-we':
                response = await this.getLocationResponse();
                break;
            case 'whats-next':
                response = await this.getUpcomingEventsResponse();
                break;
            case 'emergency-help':
                response = this.getEmergencyResponse();
                break;
            case 'health-status':
                response = await this.getHealthStatusResponse();
                break;
            case 'communication':
                response = this.getCommunicationResponse();
                break;
            case 'entertainment':
                response = this.getEntertainmentResponse();
                break;
            default:
                response = "I'm here to help make your space experience amazing! What would you like to know?";
        }
        
        this.sendMessage('assistant', response);
        this.speakMessage(response);
        
        // Add to conversation history
        this.addToConversationHistory('user', questionType);
        this.addToConversationHistory('assistant', response);
    }

    async getLocationResponse() {
        if (!this.currentLocation) {
            return "I'm currently determining our exact location. Please give me a moment...";
        }
        
        const locationInfo = this.locationDatabase[this.currentLocation];
        if (!locationInfo) {
            return "We're currently traveling through space. The view is absolutely spectacular!";
        }
        
        let response = locationInfo.description;
        
        // Add current time in location
        const currentEntry = this.locationHistory[this.locationHistory.length - 1];
        if (currentEntry) {
            const timeHere = (Date.now() - currentEntry.timestamp.getTime()) / 60000; // minutes
            response += ` We've been in this area for approximately ${Math.round(timeHere)} minutes.`;
        }
        
        // Add interesting fact
        if (locationInfo.points_of_interest.length > 0) {
            const fact = locationInfo.points_of_interest[Math.floor(Math.random() * locationInfo.points_of_interest.length)];
            response += ` Did you know? ${fact}`;
        }
        
        return response;
    }

    async getUpcomingEventsResponse() {
        try {
            const response = await fetch(`${this.apiEndpoint}/mission/upcoming-events`);
            if (response.ok) {
                const data = await response.json();
                if (data.events && data.events.length > 0) {
                    const nextEvent = data.events[0];
                    return `Coming up next: ${nextEvent.name} in approximately ${nextEvent.time_until}. ${nextEvent.description}`;
                }
            }
        } catch (error) {
            console.error('Failed to get upcoming events:', error);
        }
        
        // Fallback response
        const activities = this.currentLocation ? 
            this.locationDatabase[this.currentLocation]?.activities || [] : 
            ['Earth observation', 'Photography', 'Relaxation'];
        
        if (activities.length > 0) {
            const activity = activities[Math.floor(Math.random() * activities.length)];
            return `Based on our current location, I recommend ${activity}. It's perfect for this part of our journey!`;
        }
        
        return "We're continuing our amazing journey through space. Keep your eyes on the amazing views around us!";
    }

    getEmergencyResponse() {
        return "In case of emergency, remain calm. I'm immediately notifying the management team and medical staff. " +
               "Emergency protocols are being activated. Please follow the safety instructions that will be provided. " +
               "Your safety is our top priority.";
    }

    async getHealthStatusResponse() {
        try {
            const response = await fetch(`${this.apiEndpoint}/vitals/current`);
            if (response.ok) {
                const data = await response.json();
                return `Your vital signs are being monitored continuously. Current status: ${data.status}. ` +
                       `Heart rate: ${data.heart_rate} BPM, Oxygen level: ${data.oxygen_level}%. ` +
                       `Everything looks ${data.overall_status}.`;
            }
        } catch (error) {
            console.error('Failed to get health status:', error);
        }
        
        return "Your health is being monitored continuously by our medical team. " +
               "All systems show you're doing great! If you feel any discomfort, please let me know immediately.";
    }

    getCommunicationResponse() {
        return "You're connected to our communication system. You can send messages to family and friends on Earth, " +
               "though there might be a slight delay depending on our distance. Would you like me to help you " +
               "compose a message or connect you with someone?";
    }

    getEntertainmentResponse() {
        const entertainmentOptions = [
            "Watch Earth rotate beneath us - it's mesmerizing!",
            "Try some zero-gravity exercises - they're fun and good for you",
            "Take photos of the incredible views around us",
            "Listen to some relaxing space music",
            "Practice floating meditation - very peaceful in microgravity",
            "Learn about the constellations visible from our current position"
        ];
        
        const option = entertainmentOptions[Math.floor(Math.random() * entertainmentOptions.length)];
        return `Here's something fun you can do: ${option}. Would you like me to guide you through it?`;
    }

    sendMessage(sender, message) {
        const messageEl = document.getElementById('assistantMessages');
        if (messageEl) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;
            messageDiv.innerHTML = `
                <div class="message-content">${message}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            `;
            messageEl.appendChild(messageDiv);
            messageEl.scrollTop = messageEl.scrollHeight;
        }
    }

    speakMessage(message) {
        if (this.speechSynthesis && !this.speechSynthesis.speaking) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            this.speechSynthesis.speak(utterance);
        }
    }

    displayNotification(message, urgency) {
        const notification = document.createElement('div');
        notification.className = `ai-notification notification-${urgency}`;
        notification.innerHTML = `
            <div class="notification-header">
                <i class="fas fa-robot"></i>
                <span class="notification-title">AI Assistant</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="notification-message">${message}</div>
            <div class="notification-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        let container = document.getElementById('aiNotificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'aiNotificationContainer';
            container.className = 'ai-notification-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Auto-remove after delay
        const delay = urgency === 'urgent' ? 15000 : urgency === 'important' ? 10000 : 5000;
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, delay);
        
        // Speak urgent notifications
        if (urgency === 'urgent' || urgency === 'important') {
            this.speakMessage(message);
        }
    }

    triggerUrgentAlert() {
        // Vibration pattern for urgent alerts
        if ('vibrate' in navigator) {
            navigator.vibrate([300, 100, 300, 100, 300]);
        }
        
        // Visual alert
        document.body.style.animation = 'urgent-flash 0.5s ease-in-out 3';
        
        setTimeout(() => {
            document.body.style.animation = '';
        }, 1500);
    }

    addNotification(notification) {
        this.notifications.push(notification);
        
        // Keep only recent notifications
        if (this.notifications.length > 20) {
            this.notifications.shift();
        }
    }

    addToConversationHistory(sender, message) {
        this.conversationHistory.push({
            sender,
            message,
            timestamp: new Date()
        });
        
        // Keep only recent conversation
        if (this.conversationHistory.length > 50) {
            this.conversationHistory.shift();
        }
    }

    bindEvents() {
        // Quick action buttons
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('ai-quick-btn')) {
                const question = event.target.getAttribute('data-question');
                this.handleQuickQuestion(question);
            }
        });
        
        // Voice input (if available)
        if ('webkitSpeechRecognition' in window) {
            this.setupVoiceRecognition();
        }
    }

    setupVoiceRecognition() {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            this.processVoiceCommand(transcript);
        };
        
        // Voice activation button
        const voiceBtn = document.getElementById('aiVoiceBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                recognition.start();
            });
        }
    }

    processVoiceCommand(command) {
        let questionType = '';
        
        if (command.includes('where') || command.includes('location')) {
            questionType = 'where-are-we';
        } else if (command.includes('next') || command.includes('coming')) {
            questionType = 'whats-next';
        } else if (command.includes('emergency') || command.includes('help')) {
            questionType = 'emergency-help';
        } else if (command.includes('health') || command.includes('feel')) {
            questionType = 'health-status';
        } else if (command.includes('message') || command.includes('communicate')) {
            questionType = 'communication';
        } else if (command.includes('fun') || command.includes('entertainment')) {
            questionType = 'entertainment';
        }
        
        if (questionType) {
            this.handleQuickQuestion(questionType);
        } else {
            this.sendMessage('assistant', "I heard you say: '" + command + "'. How can I help you with that?");
        }
    }

    loadPersonalPreferences() {
        const preferences = localStorage.getItem('aiAssistantPreferences');
        if (preferences) {
            this.preferences = JSON.parse(preferences);
        } else {
            this.preferences = {
                voiceEnabled: true,
                notificationLevel: 'normal',
                autoSpeak: true,
                preferredTopics: ['location', 'activities', 'science']
            };
        }
    }

    savePersonalPreferences() {
        localStorage.setItem('aiAssistantPreferences', JSON.stringify(this.preferences));
    }

    updateLocationUI() {
        const locationEl = document.getElementById('currentLocation');
        if (locationEl && this.currentLocation) {
            const locationInfo = this.locationDatabase[this.currentLocation];
            locationEl.textContent = locationInfo ? 
                locationInfo.description.split('.')[0] : 
                this.currentLocation.replace('-', ' ').toUpperCase();
        }
    }

    updateUI() {
        const statusEl = document.getElementById('aiAssistantStatus');
        if (statusEl) {
            statusEl.textContent = this.isActive ? 'Active & Connected' : 'Standby';
            statusEl.className = `ai-status ${this.isActive ? 'active' : 'inactive'}`;
        }
        
        const notificationCountEl = document.getElementById('notificationCount');
        if (notificationCountEl) {
            const unacknowledgedCount = this.notifications.filter(n => !n.acknowledged).length;
            notificationCountEl.textContent = unacknowledgedCount;
            notificationCountEl.style.display = unacknowledgedCount > 0 ? 'block' : 'none';
        }
    }

    getAssistantData() {
        return {
            isActive: this.isActive,
            currentLocation: this.currentLocation,
            notificationCount: this.notifications.filter(n => !n.acknowledged).length,
            conversationLength: this.conversationHistory.length,
            locationHistory: this.locationHistory.slice(-5), // Last 5 locations
            preferences: this.preferences
        };
    }
}

// Initialize enhanced AI assistant
window.enhancedAIAssistant = new EnhancedAIAssistant();

// Replace the old AI assistant
window.aiAssistant = window.enhancedAIAssistant;

console.log('Enhanced AI Tourism Assistant loaded successfully');
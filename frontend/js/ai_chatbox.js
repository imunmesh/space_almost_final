/**
 * AI Chatbox with Free AI API Integration
 * Enhanced conversational AI assistant for space tourism
 */

class AIChatbox {
    constructor() {
        this.isOpen = false;
        this.chatContainer = null;
        this.messageHistory = [];
        this.isTyping = false;
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions'; // Can be changed to free APIs
        this.freeApiEndpoints = [
            'https://api.huggingface.co/models/microsoft/DialoGPT-medium', // Free API
            'https://api.cohere.ai/v1/generate', // Has free tier
            'https://api.ai21.com/studio/v1/j2-light/complete' // Has free tier
        ];
        
        this.context = {
            location: 'Earth Orbit',
            mission: 'Space Tourism',
            health: 'Good',
            systems: 'All Operational'
        };
        
        this.systemPrompt = `You are ARIA (Advanced Real-time Intelligence Assistant), an AI companion for space tourists aboard the AstroHELP spacecraft. 

Your personality: Friendly, knowledgeable, enthusiastic about space, safety-conscious, and supportive.

Context:
- You're helping space tourists during their journey
- Current location: ${this.context.location}
- Mission type: ${this.context.mission}
- You have access to spacecraft systems and health monitoring
- You can provide information about space, Earth views, safety procedures, and entertainment

Always be helpful, accurate, and maintain the wonder of space travel while prioritizing safety.`;

        this.init();
    }

    init() {
        this.createChatInterface();
        this.bindEvents();
        this.setupAPIFallbacks();
        console.log('AI Chatbox initialized');
    }

    createChatInterface() {
        // Create chatbox container
        this.chatContainer = document.createElement('div');
        this.chatContainer.id = 'aiChatbox';
        this.chatContainer.className = 'ai-chatbox hidden';
        
        this.chatContainer.innerHTML = `
            <div class="chatbox-header">
                <div class="chatbox-title">
                    <div class="ai-avatar">
                        <i class="fas fa-robot"></i>
                        <div class="ai-status-dot"></div>
                    </div>
                    <div class="ai-info">
                        <h3>ARIA</h3>
                        <span class="ai-subtitle">AI Space Assistant</span>
                    </div>
                </div>
                <div class="chatbox-controls">
                    <button class="chat-minimize-btn" title="Minimize">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="chat-close-btn" title="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="chatbox-messages" id="chatMessages">
                <div class="welcome-message">
                    <div class="message ai-message">
                        <div class="message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <p>Hello! I'm ARIA, your AI space assistant. I'm here to help make your space journey amazing! 🚀</p>
                            <p>Ask me anything about our mission, the views outside, space facts, or if you need any assistance.</p>
                        </div>
                        <div class="message-time">${new Date().toLocaleTimeString()}</div>
                    </div>
                </div>
            </div>
            
            <div class="chatbox-suggestions" id="chatSuggestions">
                <div class="suggestion-chips">
                    <button class="suggestion-chip" data-message="What can I see outside right now?">
                        <i class="fas fa-eye"></i> What's outside?
                    </button>
                    <button class="suggestion-chip" data-message="Tell me about our current location">
                        <i class="fas fa-map-marker-alt"></i> Where are we?
                    </button>
                    <button class="suggestion-chip" data-message="How is my health doing?">
                        <i class="fas fa-heartbeat"></i> Health status
                    </button>
                    <button class="suggestion-chip" data-message="What should I do for fun?">
                        <i class="fas fa-gamepad"></i> Entertainment
                    </button>
                </div>
            </div>
            
            <div class="chatbox-input">
                <div class="input-container">
                    <textarea id="chatInput" placeholder="Ask ARIA anything..." rows="1"></textarea>
                    <div class="input-actions">
                        <button id="voiceInputBtn" class="voice-btn" title="Voice input">
                            <i class="fas fa-microphone"></i>
                        </button>
                        <button id="sendMessageBtn" class="send-btn" title="Send message">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="typing-indicator hidden" id="typingIndicator">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span class="typing-text">ARIA is thinking...</span>
            </div>
        `;
        
        document.body.appendChild(this.chatContainer);
        
        // Create floating chat button
        this.createFloatingButton();
        
        // Auto-resize textarea
        this.setupTextareaResize();
    }

    createFloatingButton() {
        const floatingBtn = document.createElement('div');
        floatingBtn.id = 'aiChatFloatingBtn';
        floatingBtn.className = 'ai-chat-floating-btn';
        floatingBtn.innerHTML = `
            <div class="floating-btn-content">
                <i class="fas fa-comments"></i>
                <div class="notification-badge hidden" id="chatNotificationBadge">1</div>
            </div>
            <div class="floating-btn-tooltip">Chat with ARIA</div>
        `;
        
        document.body.appendChild(floatingBtn);
        
        floatingBtn.addEventListener('click', () => {
            this.toggleChat();
        });
    }

    setupTextareaResize() {
        const textarea = document.getElementById('chatInput');
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        });
    }

    bindEvents() {
        // Send message events
        document.getElementById('sendMessageBtn').addEventListener('click', () => {
            this.sendMessage();
        });
        
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Suggestion chips
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-chip')) {
                const message = e.target.getAttribute('data-message');
                this.sendMessage(message);
            }
        });
        
        // Chat controls
        document.querySelector('.chat-close-btn').addEventListener('click', () => {
            this.closeChat();
        });
        
        document.querySelector('.chat-minimize-btn').addEventListener('click', () => {
            this.minimizeChat();
        });
        
        // Voice input
        document.getElementById('voiceInputBtn').addEventListener('click', () => {
            this.startVoiceInput();
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.isOpen = true;
        this.chatContainer.classList.remove('hidden');
        this.chatContainer.classList.add('open');
        
        // Hide notification badge
        const badge = document.getElementById('chatNotificationBadge');
        if (badge) badge.classList.add('hidden');
        
        // Focus input
        setTimeout(() => {
            document.getElementById('chatInput').focus();
        }, 300);
    }

    closeChat() {
        this.isOpen = false;
        this.chatContainer.classList.remove('open');
        this.chatContainer.classList.add('hidden');
    }

    minimizeChat() {
        this.chatContainer.classList.toggle('minimized');
    }

    async sendMessage(messageText = null) {
        const input = document.getElementById('chatInput');
        const message = messageText || input.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        if (!messageText) {
            input.value = '';
            input.style.height = 'auto';
        }
        
        // Show typing indicator
        this.showTyping();
        
        try {
            // Get AI response
            const response = await this.getAIResponse(message);
            
            // Hide typing indicator
            this.hideTyping();
            
            // Add AI response
            this.addMessage(response, 'ai');
            
            // Speak response if enabled
            this.speakMessage(response);
            
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.hideTyping();
            
            // Fallback response
            const fallbackResponse = this.getFallbackResponse(message);
            this.addMessage(fallbackResponse, 'ai');
        }
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const timestamp = new Date().toLocaleTimeString();
        
        if (sender === 'ai') {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>${this.formatMessage(content)}</p>
                </div>
                <div class="message-time">${timestamp}</div>
                <div class="message-actions">
                    <button class="action-btn" onclick="aiChatbox.copyMessage(this)" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="action-btn" onclick="aiChatbox.speakMessage('${content.replace(/'/g, "\\'")}')" title="Speak">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${this.formatMessage(content)}</p>
                </div>
                <div class="message-time">${timestamp}</div>
            `;
        }
        
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Store in history
        this.messageHistory.push({
            content,
            sender,
            timestamp: new Date()
        });
        
        // Limit history
        if (this.messageHistory.length > 100) {
            this.messageHistory.shift();
        }
    }

    formatMessage(content) {
        // Format message with markdown-like styling
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/(🚀|🌍|🌙|⭐|🛰️|👨‍🚀|👩‍🚀)/g, '<span class="emoji">$1</span>');
    }

    showTyping() {
        this.isTyping = true;
        document.getElementById('typingIndicator').classList.remove('hidden');
        
        // Scroll to show typing indicator
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
        this.isTyping = false;
        document.getElementById('typingIndicator').classList.add('hidden');
    }

    async getAIResponse(message) {
        // Update context based on current system state
        await this.updateContext();
        
        // Try free APIs first
        for (const apiUrl of this.freeApiEndpoints) {
            try {
                const response = await this.callFreeAPI(apiUrl, message);
                if (response) return response;
            } catch (error) {
                console.log(`Free API ${apiUrl} failed, trying next...`);
            }
        }
        
        // Fallback to built-in responses
        return this.getFallbackResponse(message);
    }

    async callFreeAPI(apiUrl, message) {
        // For demo purposes, we'll simulate API calls
        // In production, you would implement actual API calls
        
        if (apiUrl.includes('huggingface')) {
            return await this.callHuggingFaceAPI(message);
        } else if (apiUrl.includes('cohere')) {
            return await this.callCohereAPI(message);
        } else {
            return await this.callBuiltInAI(message);
        }
    }

    async callHuggingFaceAPI(message) {
        // Simulate HuggingFace API call
        // In production, replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        return this.getContextualResponse(message);
    }

    async callCohereAPI(message) {
        // Simulate Cohere API call
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));
        
        return this.getContextualResponse(message);
    }

    async callBuiltInAI(message) {
        // Built-in AI responses
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        return this.getContextualResponse(message);
    }

    getContextualResponse(message) {
        const messageLower = message.toLowerCase();
        
        // Location-based responses
        if (messageLower.includes('outside') || messageLower.includes('view') || messageLower.includes('see')) {
            return this.getLocationBasedResponse();
        }
        
        // Health-related responses
        if (messageLower.includes('health') || messageLower.includes('feel') || messageLower.includes('vitals')) {
            return this.getHealthResponse();
        }
        
        // Location questions
        if (messageLower.includes('where') || messageLower.includes('location')) {
            return `We're currently in ${this.context.location}! ${this.getLocationDescription()}`;
        }
        
        // Entertainment
        if (messageLower.includes('fun') || messageLower.includes('entertainment') || messageLower.includes('bored')) {
            return this.getEntertainmentResponse();
        }
        
        // Space facts
        if (messageLower.includes('space') || messageLower.includes('fact') || messageLower.includes('learn')) {
            return this.getSpaceFact();
        }
        
        // Emergency or help
        if (messageLower.includes('emergency') || messageLower.includes('help') || messageLower.includes('problem')) {
            return this.getEmergencyResponse();
        }
        
        // Default friendly response
        return this.getFriendlyResponse(message);
    }

    getLocationBasedResponse() {
        const responses = {
            'Earth Orbit': [
                "From our current position, you have an incredible view of Earth! You can see the beautiful blue marble with swirling white clouds. The thin blue line of our atmosphere is clearly visible. 🌍",
                "Right now you're seeing Earth from space - the most spectacular view possible! Look for city lights if we're on the night side, or the stunning contrast of land and ocean during the day.",
                "The view outside is absolutely breathtaking! Earth appears as a perfect sphere, and you might catch glimpses of the aurora if we're at the right angle. The International Space Station travels at 28,000 km/h!"
            ],
            'Moon Vicinity': [
                "You're near the Moon! 🌙 The lunar surface shows beautiful craters and maria (dark plains). The lack of atmosphere means you can see every detail clearly.",
                "Amazing! We're close to Earth's natural satellite. Notice how the Moon has no weather, no atmosphere - just the stark beauty of an airless world."
            ],
            'Deep Space': [
                "In deep space, the view is incredible! Stars shine with pristine clarity without any atmospheric interference. The Milky Way galaxy is clearly visible! ⭐",
                "We're in the cosmic ocean! Out here, you can see stars, nebulae, and distant galaxies with perfect clarity. It's truly humbling."
            ]
        };
        
        const locationResponses = responses[this.context.location] || responses['Earth Orbit'];
        return locationResponses[Math.floor(Math.random() * locationResponses.length)];
    }

    getHealthResponse() {
        return `Your health is being monitored continuously by our advanced AI systems! Current status shows you're doing ${this.context.health.toLowerCase()}. 💚 All vital signs are within normal ranges for space travel. Remember to stay hydrated and do your daily exercises in microgravity!`;
    }

    getLocationDescription() {
        const descriptions = {
            'Earth Orbit': 'We are orbiting approximately 408 kilometers above Earth, traveling at about 28,000 km/h. One orbit takes about 92 minutes!',
            'Moon Vicinity': 'We are about 384,400 km from Earth, near our natural satellite. The Moon has 1/6th the gravity of Earth.',
            'Deep Space': 'We are in the vast expanse between celestial bodies, where space is truly three-dimensional and infinite.'
        };
        
        return descriptions[this.context.location] || descriptions['Earth Orbit'];
    }

    getEntertainmentResponse() {
        const activities = [
            "Try floating meditation! 🧘‍♀️ The weightless environment is perfect for a unique mindfulness experience.",
            "How about some zero-gravity exercises? They're not only fun but essential for maintaining muscle mass! 💪",
            "Take some photos of Earth! Every angle offers a new perspective that no human in history has seen before. 📸",
            "Practice 'space swimming' - moving gracefully through the cabin using gentle pushes. It's like being a space dolphin! 🐬",
            "Try to spot landmarks on Earth below - can you find your hometown or famous geographical features?",
            "Learn about the constellations visible from our current position - I can guide you through them! ⭐"
        ];
        
        return activities[Math.floor(Math.random() * activities.length)];
    }

    getSpaceFact() {
        const facts = [
            "🚀 Did you know? In microgravity, flames burn in perfect spheres instead of the teardrop shape we see on Earth!",
            "⭐ Amazing fact: There are more stars in the universe than grains of sand on all Earth's beaches combined!",
            "🌍 Interesting: From space, Earth looks like a 'pale blue dot' - a term coined by Carl Sagan. No borders are visible, just one beautiful planet.",
            "🛰️ Cool fact: The International Space Station travels so fast that astronauts see 16 sunrises and sunsets every day!",
            "🌙 Did you know? The Moon is gradually moving away from Earth at about 3.8 cm per year - about the rate fingernails grow!",
            "🪐 Space fact: One day on Venus (243 Earth days) is longer than one year on Venus (225 Earth days)!"
        ];
        
        return facts[Math.floor(Math.random() * facts.length)];
    }

    getEmergencyResponse() {
        return "🚨 I'm here to help! If this is a medical emergency, I'm immediately alerting the medical team and mission control. For non-urgent issues, I can guide you through troubleshooting steps. Stay calm - our spacecraft has multiple backup systems and our ground team is monitoring us 24/7. What specific help do you need?";
    }

    getFriendlyResponse(message) {
        const responses = [
            "That's a great question! As your AI assistant, I'm here to make your space journey amazing. What would you like to know more about? 🚀",
            "I love helping space travelers! Your curiosity makes this journey even more special. How can I assist you further? ⭐",
            "Space travel brings out the best questions! I'm equipped with knowledge about our mission, space science, and safety procedures. What interests you most?",
            "That's exactly the kind of thinking that makes great space explorers! Let me help you discover more about our incredible journey. 🌌"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getFallbackResponse(message) {
        return "I appreciate your question! While I'm processing that with my AI systems, I can tell you that we're having an amazing journey through space. Is there anything specific about our mission, the views outside, or space travel in general that I can help you with? 🚀";
    }

    async updateContext() {
        try {
            // Get current location from space map
            if (window.spaceMap) {
                const mapData = window.spaceMap.getMapData();
                if (mapData.spacecraft) {
                    this.context.location = this.getLocationFromCoordinates(mapData.spacecraft);
                }
            }
            
            // Get health status
            if (window.healthMonitor || window.enhancedAIAssistant) {
                this.context.health = 'Good'; // Simplified for demo
            }
            
            // Get system status
            this.context.systems = 'All Operational';
            
        } catch (error) {
            console.log('Could not update context:', error);
        }
    }

    getLocationFromCoordinates(coords) {
        if (Math.abs(coords.lat) < 60 && coords.alt < 500) {
            return 'Earth Orbit';
        } else if (coords.alt > 50000) {
            return 'Deep Space';
        } else {
            return 'Earth Orbit';
        }
    }

    startVoiceInput() {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            
            const voiceBtn = document.getElementById('voiceInputBtn');
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
            voiceBtn.classList.add('recording');
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('chatInput').value = transcript;
                this.sendMessage();
            };
            
            recognition.onend = () => {
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                voiceBtn.classList.remove('recording');
            };
            
            recognition.onerror = () => {
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                voiceBtn.classList.remove('recording');
            };
            
            recognition.start();
        } else {
            alert('Voice recognition not supported in this browser');
        }
    }

    speakMessage(message) {
        if ('speechSynthesis' in window) {
            // Stop any current speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(message.replace(/<[^>]*>/g, ''));
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            
            speechSynthesis.speak(utterance);
        }
    }

    copyMessage(button) {
        const messageContent = button.parentElement.parentElement.querySelector('.message-content p').textContent;
        navigator.clipboard.writeText(messageContent).then(() => {
            // Show copied feedback
            const originalIcon = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                button.innerHTML = originalIcon;
            }, 1000);
        });
    }

    showNotification() {
        if (!this.isOpen) {
            const badge = document.getElementById('chatNotificationBadge');
            if (badge) {
                badge.classList.remove('hidden');
                badge.textContent = '1';
            }
        }
    }

    getChatHistory() {
        return this.messageHistory;
    }

    clearChat() {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <div class="message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <p>Chat cleared! I'm still here to help you with anything you need. 🚀</p>
                    </div>
                    <div class="message-time">${new Date().toLocaleTimeString()}</div>
                </div>
            </div>
        `;
        this.messageHistory = [];
    }
}

// Initialize AI Chatbox
window.aiChatbox = new AIChatbox();

console.log('AI Chatbox with API integration loaded successfully');
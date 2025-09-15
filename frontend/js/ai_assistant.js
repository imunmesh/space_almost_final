// AI Space Tourism Assistant
class SpaceTourismAssistant {
    constructor() {
        this.isActive = false;
        this.personality = 'friendly';
        this.knowledgeBase = new SpaceKnowledgeBase();
        this.conversationHistory = [];
        this.currentContext = null;
        this.speechSynthesis = window.speechSynthesis;
        this.speechRecognition = null;
        this.isListening = false;
        this.responses = {
            greetings: [
                "Welcome aboard! I'm your AI space tourism guide. How can I help make your journey unforgettable?",
                "Hello there, space traveler! I'm here to assist you with anything you need during your cosmic adventure.",
                "Greetings from the cosmos! I'm your personal AI assistant, ready to share the wonders of space with you."
            ],
            locationInfo: {
                'earth-orbit': "You're currently in Earth orbit at approximately 408 kilometers above our beautiful planet. Look out the window - you can see the curvature of Earth and the thin blue line of our atmosphere!",
                'moon-vicinity': "Amazing! You're near the Moon, our natural satellite. The Moon is about 384,400 km from Earth and has no atmosphere, which is why the sky appears black.",
                'deep-space': "You're now in deep space, far from Earth's protective embrace. Out here, you can see stars without any atmospheric interference - a truly pristine view of the universe!"
            },
            healthTips: [
                "Remember to stay hydrated in zero gravity - your body processes fluids differently up here.",
                "Try some gentle stretching exercises to help with circulation in microgravity.",
                "Take deep breaths and enjoy the weightless sensation - it's a once-in-a-lifetime experience!",
                "If you feel queasy, focus on a fixed point and breathe slowly. Space sickness is normal and temporary."
            ],
            educationalFacts: [
                "Did you know? In microgravity, flames burn in a sphere shape instead of the teardrop shape we see on Earth!",
                "Fun fact: Your spine actually stretches in space, making you temporarily taller!",
                "Interesting: Sound cannot travel in the vacuum of space because there are no air molecules to carry the vibrations.",
                "Amazing fact: The International Space Station travels at about 28,000 kilometers per hour!"
            ]
        };
        
        this.init();
    }

    init() {
        this.setupSpeechRecognition();
        this.bindEvents();
        this.loadPersonalitySettings();
        console.log('Space Tourism Assistant initialized');
    }

    activate() {
        if (this.isActive) return;
        
        this.isActive = true;
        console.log('AI Tourism Assistant activated');
        
        // Show welcome message
        this.showWelcomeMessage();
        
        this.updateUI();
    }

    deactivate() {
        this.isActive = false;
        console.log('AI Tourism Assistant deactivated');
        this.updateUI();
    }

    showWelcomeMessage() {
        const greeting = this.responses.greetings[Math.floor(Math.random() * this.responses.greetings.length)];
        this.displayMessage(greeting);
    }

    displayMessage(message, type = 'assistant') {
        const messageEl = document.getElementById('assistantMessage');
        if (messageEl) {
            messageEl.textContent = `"${message}"`;
            
            // Add visual feedback based on message type
            messageEl.className = `assistant-message ${type}`;
            
            // Animate message appearance
            messageEl.style.animation = 'none';
            setTimeout(() => {
                messageEl.style.animation = 'fadeIn 0.5s ease';
            }, 10);
        }
    }

    updateUI() {
        const statusEl = document.getElementById('assistantStatus');
        if (statusEl) {
            statusEl.textContent = this.isActive ? 'Ready to Help' : 'Standby';
        }
        
        const indicatorEl = document.querySelector('.ai-assistant-panel .status-indicator');
        if (indicatorEl) {
            indicatorEl.className = `status-indicator ${this.isActive ? 'active' : 'inactive'}`;
        }
    }

    setupSpeechRecognition() {
        // Simplified version for now
        console.log('Speech recognition setup (simplified)');
    }

    bindEvents() {
        // Quick question buttons
        const quickButtons = document.querySelectorAll('.quick-btn');
        quickButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.getAttribute('data-question');
                this.handleQuickQuestion(question);
            });
        });
    }

    handleQuickQuestion(questionType) {
        let response = '';
        
        switch (questionType) {
            case 'where-are-we':
                response = "You're currently in Earth orbit at approximately 408 kilometers above our beautiful planet. Look out the window - you can see the curvature of Earth!";
                break;
            case 'whats-next':
                response = "Next, we'll be passing over some beautiful cloud formations. Keep your eyes on the horizon for amazing views!";
                break;
            case 'earth-view':
                response = "From your current position, you can see Earth's beautiful blue marble appearance. The thin blue line you see is our atmosphere!";
                break;
            default:
                response = "I'm here to help make your space experience amazing! What would you like to know?";
        }
        
        this.displayMessage(response);
    }

    loadPersonalitySettings() {
        // Load personality preferences from storage
        const savedPersonality = localStorage.getItem('assistantPersonality');
        if (savedPersonality) {
            this.personality = savedPersonality;
        }
    }
}

// Space Knowledge Base for contextual information
class SpaceKnowledgeBase {
    constructor() {
        this.regions = {
            'pacific-ocean': "The Pacific Ocean covers about one-third of Earth's surface. From space, you can see its incredible vastness!",
            'sahara-desert': "The Sahara Desert appears as a vast golden expanse from space. It's so large that it affects weather patterns!",
            'amazon-rainforest': "The Amazon rainforest is often called the 'lungs of the Earth.' You can see its dense green canopy from space."
        };
    }
    
    getRegionInfo(region) {
        return this.regions[region] || null;
    }
}

// Initialize AI Tourism Assistant
window.aiAssistant = new SpaceTourismAssistant();
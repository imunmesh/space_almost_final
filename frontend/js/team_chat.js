// Team Communication System
class TeamChat {
    constructor() {
        this.messages = [
            {
                id: 1,
                sender: 'System',
                content: 'Team communication channel active',
                timestamp: new Date().toISOString(),
                type: 'system'
            }
        ];
        this.currentMessageId = 2;
        this.currentUser = this.getCurrentUser();
        this.teamMembers = {
            'commander': { name: 'Commander', icon: 'fas fa-user-astronaut', online: true },
            'pilot': { name: 'Pilot', icon: 'fas fa-plane', online: true },
            'scientist': { name: 'Scientist', icon: 'fas fa-flask', online: true },
            'ground': { name: 'Ground Control', icon: 'fas fa-satellite-dish', online: true }
        };
        this.initializeEventListeners();
        this.updateChatDisplay();
        this.updateTeamStatus();
    }

    initializeEventListeners() {
        // Send message button
        const sendButton = document.getElementById('send-message');
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }

        // Enter key to send message
        const input = document.getElementById('chat-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Auto-scroll chat to bottom when new messages arrive
        this.scrollToBottom();
    }

    getCurrentUser() {
        // Get current user from local storage or default
        const userData = localStorage.getItem('astrohelp_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                return {
                    username: user.username || 'Astronaut',
                    role: user.role || 'astronaut'
                };
            } catch (e) {
                return { username: 'Astronaut', role: 'astronaut' };
            }
        }
        return { username: 'Astronaut', role: 'astronaut' };
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        if (!input) return;

        const content = input.value.trim();
        if (!content) return;

        const message = {
            id: this.currentMessageId++,
            sender: this.currentUser.username,
            content: content,
            timestamp: new Date().toISOString(),
            type: 'user',
            role: this.currentUser.role
        };

        this.messages.push(message);
        input.value = '';
        this.updateChatDisplay();
        this.saveToLocalStorage();

        // Auto-scroll to latest message
        this.scrollToBottom();

        // Simulate responses for demo purposes
        this.simulateResponses(content);
    }

    simulateResponses(userMessage) {
        // Simulate team member responses based on message content
        const responses = this.generateSimulatedResponses(userMessage);
        
        responses.forEach((response, index) => {
            setTimeout(() => {
                this.addSystemMessage(response.sender, response.content, response.role);
            }, (index + 1) * 2000); // Stagger responses
        });
    }

    generateSimulatedResponses(message) {
        const responses = [];
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('status') || lowerMessage.includes('report')) {
            responses.push({
                sender: 'Commander',
                content: 'All systems nominal. Mission proceeding as planned.',
                role: 'commander'
            });
        }

        if (lowerMessage.includes('navigation') || lowerMessage.includes('position')) {
            responses.push({
                sender: 'Pilot',
                content: 'Navigation systems operational. Current trajectory optimal.',
                role: 'pilot'
            });
        }

        if (lowerMessage.includes('weather') || lowerMessage.includes('solar')) {
            responses.push({
                sender: 'Scientist',
                content: 'Space weather conditions within normal parameters. Monitoring continues.',
                role: 'scientist'
            });
        }

        if (lowerMessage.includes('emergency') || lowerMessage.includes('alert')) {
            responses.push({
                sender: 'Ground Control',
                content: 'Ground Control standing by. Please report status.',
                role: 'ground'
            });
        }

        return responses;
    }

    addSystemMessage(sender, content, role = 'system') {
        const message = {
            id: this.currentMessageId++,
            sender: sender,
            content: content,
            timestamp: new Date().toISOString(),
            type: 'team',
            role: role
        };

        this.messages.push(message);
        this.updateChatDisplay();
        this.saveToLocalStorage();
        this.scrollToBottom();
    }

    updateChatDisplay() {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        // Clear and rebuild messages
        container.innerHTML = '';

        this.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            container.appendChild(messageElement);
        });
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${message.type} ${message.role || ''}`;
        
        const timeString = this.formatTimestamp(message.timestamp);
        const roleIcon = this.getRoleIcon(message.role);

        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-sender">
                    ${roleIcon} ${message.sender}
                </span>
                <span class="message-time">${timeString}</span>
            </div>
            <div class="message-content">${this.escapeHtml(message.content)}</div>
        `;

        return messageDiv;
    }

    getRoleIcon(role) {
        const icons = {
            'commander': '<i class="fas fa-user-astronaut"></i>',
            'pilot': '<i class="fas fa-plane"></i>',
            'scientist': '<i class="fas fa-flask"></i>',
            'ground': '<i class="fas fa-satellite-dish"></i>',
            'system': '<i class="fas fa-robot"></i>'
        };
        return icons[role] || '<i class="fas fa-user"></i>';
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        setTimeout(() => {
            const container = document.getElementById('chat-messages');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 100);
    }

    updateTeamStatus() {
        const onlineCount = Object.values(this.teamMembers).filter(member => member.online).length;
        const onlineElement = document.getElementById('team-members-online');
        
        if (onlineElement) {
            onlineElement.textContent = onlineCount;
        }

        // Update team member indicators
        Object.keys(this.teamMembers).forEach(role => {
            const member = this.teamMembers[role];
            const element = document.querySelector(`.team-member.${role}`);
            if (element) {
                element.className = `team-member ${role} ${member.online ? 'active' : 'offline'}`;
            }
        });
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('astrohelp_team_chat', JSON.stringify(this.messages));
        } catch (e) {
            console.warn('Failed to save team chat to localStorage:', e);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('astrohelp_team_chat');
            if (saved) {
                const messages = JSON.parse(saved);
                if (Array.isArray(messages)) {
                    this.messages = messages;
                    // Update currentMessageId to be higher than any existing ID
                    const maxId = Math.max(...messages.map(m => m.id || 0), 0);
                    this.currentMessageId = maxId + 1;
                }
            }
        } catch (e) {
            console.warn('Failed to load team chat from localStorage:', e);
        }
    }

    // Broadcast system messages to chat
    broadcastSystemMessage(content) {
        this.addSystemMessage('System', content, 'system');
    }

    // Emergency broadcast
    emergencyBroadcast(content) {
        const message = {
            id: this.currentMessageId++,
            sender: 'EMERGENCY SYSTEM',
            content: content,
            timestamp: new Date().toISOString(),
            type: 'emergency',
            role: 'system'
        };

        this.messages.push(message);
        this.updateChatDisplay();
        this.saveToLocalStorage();
        this.scrollToBottom();

        // Flash the chat panel for attention
        const chatPanel = document.querySelector('.team-chat-panel');
        if (chatPanel) {
            chatPanel.classList.add('emergency-flash');
            setTimeout(() => {
                chatPanel.classList.remove('emergency-flash');
            }, 3000);
        }
    }
}

// Initialize team chat system
let teamChat;

document.addEventListener('DOMContentLoaded', () => {
    teamChat = new TeamChat();
    teamChat.loadFromLocalStorage();
    teamChat.updateChatDisplay();
});

// Export for use by other modules
window.teamChat = teamChat;
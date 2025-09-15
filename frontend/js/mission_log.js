// Mission Log Management System
class MissionLog {
    constructor() {
        this.entries = [
            {
                id: 1,
                timestamp: new Date().toISOString(),
                content: "AstroHELP system initialized. Mission monitoring active.",
                category: "general",
                user: "System"
            }
        ];
        this.currentEntryId = 2;
        this.initializeEventListeners();
        this.updateLogDisplay();
    }

    initializeEventListeners() {
        // Add entry button
        const addButton = document.getElementById('add-log-entry');
        if (addButton) {
            addButton.addEventListener('click', () => this.addEntry());
        }

        // Enter key to add entry
        const input = document.getElementById('log-entry-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addEntry();
                }
            });
        }

        // Export button
        const exportButton = document.getElementById('export-log');
        if (exportButton) {
            exportButton.addEventListener('click', () => this.exportLog());
        }

        // Clear button
        const clearButton = document.getElementById('clear-log');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearLog());
        }
    }

    addEntry() {
        const input = document.getElementById('log-entry-input');
        const categorySelect = document.getElementById('log-category');
        
        if (!input || !categorySelect) return;

        const content = input.value.trim();
        if (!content) return;

        const entry = {
            id: this.currentEntryId++,
            timestamp: new Date().toISOString(),
            content: content,
            category: categorySelect.value,
            user: this.getCurrentUser()
        };

        this.entries.push(entry);
        input.value = '';
        this.updateLogDisplay();
        this.saveToLocalStorage();

        // Auto-scroll to latest entry
        this.scrollToLatest();
    }

    getCurrentUser() {
        // Get current user from local storage or default
        const userData = localStorage.getItem('astrohelp_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                return user.username || 'Astronaut';
            } catch (e) {
                return 'Astronaut';
            }
        }
        return 'Astronaut';
    }

    updateLogDisplay() {
        const container = document.getElementById('mission-log-entries');
        const countElement = document.getElementById('log-entry-count');
        
        if (!container) return;

        // Update entry count
        if (countElement) {
            countElement.textContent = this.entries.length;
        }

        // Clear and rebuild entries
        container.innerHTML = '';

        // Sort entries by timestamp (newest first)
        const sortedEntries = [...this.entries].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        sortedEntries.forEach(entry => {
            const entryElement = this.createEntryElement(entry);
            container.appendChild(entryElement);
        });
    }

    createEntryElement(entry) {
        const entryDiv = document.createElement('div');
        entryDiv.className = `log-entry ${entry.category}`;
        entryDiv.innerHTML = `
            <div class="log-header">
                <div class="log-timestamp">${this.formatTimestamp(entry.timestamp)}</div>
                <div class="log-user">${entry.user}</div>
            </div>
            <div class="log-content">${this.escapeHtml(entry.content)}</div>
            <div class="log-footer">
                <div class="log-category-tag ${entry.category}">${entry.category}</div>
                <button class="log-delete-btn" onclick="missionLog.deleteEntry(${entry.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        return entryDiv;
    }

    deleteEntry(entryId) {
        if (confirm('Are you sure you want to delete this log entry?')) {
            this.entries = this.entries.filter(entry => entry.id !== entryId);
            this.updateLogDisplay();
            this.saveToLocalStorage();
        }
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffMinutes < 1) {
            return 'Just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToLatest() {
        const container = document.getElementById('mission-log-entries');
        if (container) {
            container.scrollTop = 0; // Scroll to top since newest entries are first
        }
    }

    exportLog() {
        const data = {
            mission_id: 'ASTROHELP_' + Date.now(),
            export_date: new Date().toISOString(),
            entries: this.entries
        };

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `mission_log_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearLog() {
        if (confirm('Are you sure you want to clear all log entries? This cannot be undone.')) {
            this.entries = [];
            this.currentEntryId = 1;
            this.updateLogDisplay();
            this.saveToLocalStorage();
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('astrohelp_mission_log', JSON.stringify(this.entries));
        } catch (e) {
            console.warn('Failed to save mission log to localStorage:', e);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('astrohelp_mission_log');
            if (saved) {
                const entries = JSON.parse(saved);
                if (Array.isArray(entries)) {
                    this.entries = entries;
                    // Update currentEntryId to be higher than any existing ID
                    const maxId = Math.max(...entries.map(e => e.id || 0), 0);
                    this.currentEntryId = maxId + 1;
                }
            }
        } catch (e) {
            console.warn('Failed to load mission log from localStorage:', e);
        }
    }

    // Auto-log system events
    autoLog(content, category = 'system') {
        const entry = {
            id: this.currentEntryId++,
            timestamp: new Date().toISOString(),
            content: content,
            category: category,
            user: 'System'
        };

        this.entries.push(entry);
        this.updateLogDisplay();
        this.saveToLocalStorage();
    }
}

// Initialize mission log system
let missionLog;

document.addEventListener('DOMContentLoaded', () => {
    missionLog = new MissionLog();
    missionLog.loadFromLocalStorage();
    missionLog.updateLogDisplay();
});

// Export for use by other modules
window.missionLog = missionLog;
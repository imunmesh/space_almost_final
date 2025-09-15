// Frontend Configuration
window.FRONTEND_CONFIG = {
    // API configuration - will be overridden by window.API_BASE_URL if set
    API_BASE_URL: window.API_BASE_URL || 'http://localhost:8001',
    
    // WebSocket configuration
    WEBSOCKET_URL: (window.API_BASE_URL || 'http://localhost:8001').replace('http', 'ws'),
    
    // Application settings
    APP_NAME: 'AstroHELP',
    APP_VERSION: '2.0.0',
    
    // Feature flags
    FEATURES: {
        DEBRIS_TRACKING: true,
        HEALTH_MONITORING: true,
        VOICE_COMMANDS: true,
        SPACE_WEATHER: true,
        NAVIGATION: true,
        RADAR_SYSTEM: true
    },
    
    // Refresh intervals (in milliseconds)
    REFRESH_INTERVALS: {
        VITALS: 5000,
        DEBRIS: 8000,
        NAVIGATION: 10000,
        SPACE_WEATHER: 30000
    }
};

console.log('🔧 Frontend configuration loaded:', window.FRONTEND_CONFIG);
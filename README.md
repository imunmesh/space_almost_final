# AstroHELP - Advanced Space Tourism & Management System

![AstroHELP Dashboard](frontend/assets/dashboard-preview.png)

AstroHELP is a comprehensive monitoring system designed for space tourism applications. It provides real-time health tracking, intelligent alerts, spacecraft navigation, and obstacle detection to enhance astronaut safety and mission efficiency.

## Features

### For Space Tourists
- Real-time vital signs monitoring (heart rate, oxygen levels, blood pressure, body temperature)
- AI-powered health analytics with predictive insights
- Interactive navigation guide with Earth viewing
- AI Tourism Assistant with voice commands
- Experience logger for capturing space memories
- Wellness recommendations and zero-gravity exercise suggestions
- **Space Tour Booking System** with:
  - Real-time tour availability checking
  - Multi-step booking process
  - Secure payment integration
  - Booking management (view, modify, cancel)
  - Ticket generation and download
  - Email confirmation simulation

### For Mission Management
- AI Debris Tracking with real NASA data integration
- Multi-Agent Rescue System with coordinated response protocols
- Energy Management AI for optimal power distribution
- Communication Optimizer for bandwidth prioritization
- Radar System for real-time obstacle detection
- Interactive Space Map with orbital visualization

### For NASA Operations
- Mission Control Center with professional-grade telemetry
- Deep Space Network (DSN) communication simulator
- Orbital Mechanics Calculator with trajectory planning
- ISS Docking Simulator with accurate physics
- ML Analytics for predictive maintenance and risk assessment
- Launch Window Calculator for mission planning

## Technology Stack

- **Backend**: Python, FastAPI, scikit-learn
- **Frontend**: HTML5, CSS3, JavaScript with advanced animations
- **Authentication**: JWT-based secure access
- **Real-time Communication**: WebSocket for live data streaming
- **Data Sources**: NASA APIs (EONET, NEO, Celestrak TLE)
- **ML Models**: RandomForest, IsolationForest for anomaly detection

## Deployment

### Frontend
The frontend is a static site that can be deployed to any static hosting service:
- Netlify (configured with netlify.toml)
- GitHub Pages
- AWS S3
- Firebase Hosting

### Backend
The FastAPI backend can be deployed to:
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run
- Azure App Service

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/astrohelp.git
   ```

2. Set up the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```

3. Set up the frontend:
   Open `frontend/index.html` in a browser or serve with a local server.

## Project Structure

```
AstroHELP/
├── backend/              # FastAPI backend
│   ├── api/              # REST API routes
│   ├── models/           # Data models
│   ├── services/         # Business logic
│   ├── ml/               # Machine learning components
│   └── main.py           # Application entry point
├── frontend/             # Static frontend files
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   ├── assets/           # Images and static assets
│   └── index.html        # Main HTML file
├── netlify.toml          # Netlify deployment configuration
└── DEPLOYMENT.md         # Deployment guide
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
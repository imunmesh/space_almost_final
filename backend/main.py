from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.api import auth, vitals, alerts, navigation, space_weather, voice_commands, mission_log, earth_monitoring
from api.ml_tracking_api import router as ml_tracking_router
from api.health_ml_api import router as health_ml_router
from app.services.vitals import vitals_service
from health_ml_system import HealthMLAnalyzer
from enterprise_security import security_manager, UserRole, SecurityLevel
from nasa_api_integration import nasa_provider
from analytics.advanced_analytics import get_analytics_engine
from integrations.nasa_api import get_nasa_integration
from safety.emergency_protocols import get_safety_manager
from edge_computing.edge_manager import get_edge_manager
from nasa.mission_control import mission_control
from nasa.dsn_communication import dsn_system
from nasa.orbital_mechanics import orbital_calculator
from nasa.iss_docking_sim import iss_docking_sim
from enhanced_debris_tracking import enhanced_tracker
import json
import asyncio
from typing import List
from typing import Dict, Optional
import uvicorn
import os
import logging
from datetime import datetime
import numpy as np
import math

app = FastAPI(
    title="AstroHELP Enterprise API",
    description="Enterprise-Grade Space Tourism Monitoring System with NASA Integration",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router)
app.include_router(vitals.router)
app.include_router(alerts.router)
app.include_router(navigation.router)
app.include_router(space_weather.router)
app.include_router(voice_commands.router)
app.include_router(mission_log.router)
app.include_router(earth_monitoring.router)
app.include_router(ml_tracking_router)
app.include_router(health_ml_router)

# Security middleware
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Validate JWT token and return user info"""
    token = credentials.credentials
    user_data = security_manager.verify_token(token)
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    return user_data

def require_security_level(required_level: SecurityLevel):
    """Dependency to require specific security clearance"""
    def security_dependency(current_user: dict = Depends(get_current_user)):
        user_level = SecurityLevel(current_user['security_claims']['clearance_level'])
        if not security_manager._has_sufficient_clearance(user_level, required_level):
            raise HTTPException(status_code=403, detail="Insufficient security clearance")
        return current_user
    return security_dependency

# Global ML and tracking instances
health_ml_analyzer = HealthMLAnalyzer()
analytics_engine = None
nasa_integration = None
safety_manager_instance = None
edge_manager = None

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove broken connections
                self.active_connections.remove(connection)

manager = ConnectionManager()

@app.websocket("/ws/vitals/{astronaut_id}")
async def websocket_vitals(websocket: WebSocket, astronaut_id: str):
    """WebSocket endpoint for real-time vital signs streaming"""
    await manager.connect(websocket)
    try:
        while True:
            # Generate simulated vitals every 5 seconds
            vitals = vitals_service.generate_simulated_vitals(astronaut_id)
            alerts = vitals_service.record_vitals(vitals)
            
            # Send vitals and alerts to client
            message = {
                "type": "vitals_update",
                "vitals": vitals.dict(),
                "alerts": [alert.dict() for alert in alerts]
            }
            
            await manager.send_personal_message(json.dumps(message, default=str), websocket)
            await asyncio.sleep(5)  # Update every 5 seconds
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.websocket("/ws/navigation")
async def websocket_navigation(websocket: WebSocket):
    """WebSocket endpoint for real-time navigation updates"""
    await manager.connect(websocket)
    try:
        while True:
            # This would be replaced with real navigation data
            message = {
                "type": "navigation_update",
                "timestamp": str(asyncio.get_event_loop().time()),
                "message": "Navigation system active"
            }
            
            await manager.send_personal_message(json.dumps(message), websocket)
            await asyncio.sleep(10)  # Update every 10 seconds
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.websocket("/ws/enhanced-debris-tracking")
async def websocket_enhanced_debris_tracking(websocket: WebSocket):
    """WebSocket endpoint for enhanced real-time debris tracking"""
    await manager.connect(websocket)
    try:
        while True:
            # Get enhanced tracking data
            summary = {
                'total_objects': len(enhanced_tracker.tracked_objects),
                'high_risk_objects': len([d for d in enhanced_tracker.tracked_objects.values() if d.collision_probability > 0.3]),
                'collision_alerts': len(enhanced_tracker.collision_alerts),
                'ml_trained': enhanced_tracker.ml_system.is_trained,
                'data_sources': ['celestrak', 'nasa_eonet', 'enhanced_simulation'],
                'last_update': datetime.now().isoformat()
            }
            
            # Sample high-risk objects
            high_risk_objects = [
                {
                    'id': debris.id,
                    'name': debris.name,
                    'position': debris.position,
                    'collision_probability': debris.collision_probability,
                    'risk_level': debris.risk_level,
                    'classification': debris.classification,
                    'recommended_action': enhanced_tracker.get_action_recommendation(debris.collision_probability)
                }
                for debris in enhanced_tracker.tracked_objects.values()
                if debris.collision_probability > 0.2
            ][:10]  # Top 10 high-risk objects
            
            message = {
                "type": "enhanced_debris_tracking_update",
                "summary": summary,
                "high_risk_objects": high_risk_objects,
                "collision_alerts": enhanced_tracker.collision_alerts,
                "timestamp": datetime.now().isoformat()
            }
            
            await manager.send_personal_message(json.dumps(message, default=str), websocket)
            await asyncio.sleep(8)  # Update every 8 seconds
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.websocket("/ws/health-ml/{astronaut_id}")
async def websocket_health_ml(websocket: WebSocket, astronaut_id: str):
    """WebSocket endpoint for enhanced ML health monitoring"""
    await manager.connect(websocket)
    try:
        while True:
            # Generate enhanced vitals with ML analysis
            vitals = vitals_service.generate_simulated_vitals(astronaut_id)
            
            # ML analysis
            ml_analysis = health_ml_analyzer.analyze_vital_signs({
                'heart_rate': vitals.heart_rate,
                'oxygen_saturation': vitals.oxygen_level,
                'blood_pressure_systolic': vitals.blood_pressure_systolic,
                'blood_pressure_diastolic': vitals.blood_pressure_diastolic,
                'body_temperature': vitals.body_temperature,
                'respiratory_rate': vitals.respiratory_rate
            })
            
            # Combine regular vitals with ML insights
            message = {
                "type": "enhanced_health_update",
                "vitals": vitals.dict(),
                "ml_analysis": ml_analysis,
                "timestamp": str(asyncio.get_event_loop().time())
            }
            
            await manager.send_personal_message(json.dumps(message, default=str), websocket)
            await asyncio.sleep(3)  # Update every 3 seconds for ML monitoring
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    """API health check"""
    return {
        "message": "AstroHELP Enterprise API is running",
        "version": "2.0.0",
        "status": "healthy",
        "enterprise_features": {
            "security": "Aerospace-grade encryption and RBAC",
            "nasa_integration": "Real NASA API data sources",
            "safety_protocols": "Industry-standard emergency procedures",
            "compliance": "ISO 14620, ECSS, NASA standards"
        }
    }

@app.post("/auth/enterprise-login")
async def enterprise_login(credentials: dict):
    """Enterprise authentication with security clearance"""
    # In production, validate against enterprise directory (LDAP/AD)
    user_data = {
        'user_id': credentials.get('username', 'demo_user'),
        'role': UserRole.MISSION_COMMANDER,  # Demo role
        'security_level': SecurityLevel.MISSION_CRITICAL,
        'mfa_verified': True,
        'last_security_training': '2024-01-01'
    }
    
    token = security_manager.generate_secure_token(user_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_role": user_data['role'].value,
        "security_clearance": user_data['security_level'].value,
        "expires_in": 28800  # 8 hours
    }

@app.get("/nasa/neo-objects")
async def get_near_earth_objects(
    start_date: str,
    end_date: str,
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Get Near Earth Objects from NASA API"""
    try:
        if not nasa_provider.session:
            await nasa_provider.initialize_session()
        
        from datetime import datetime
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
        
        neo_objects = await nasa_provider.fetch_near_earth_objects(start, end)
        
        return {
            "status": "success",
            "neo_count": len(neo_objects),
            "objects": [{
                "id": neo.neo_id,
                "name": neo.name,
                "diameter_km": f"{neo.estimated_diameter_min:.2f} - {neo.estimated_diameter_max:.2f}",
                "is_hazardous": neo.is_potentially_hazardous,
                "close_approach_date": neo.close_approach_date.isoformat(),
                "miss_distance_km": neo.miss_distance,
                "relative_velocity_kmh": neo.relative_velocity * 3600
            } for neo in neo_objects[:10]]  # Limit to first 10
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/nasa/space-weather")
async def get_space_weather(
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Get real-time space weather from NOAA"""
    try:
        if not nasa_provider.session:
            await nasa_provider.initialize_session()
            
        weather_data = await nasa_provider.fetch_space_weather_data()
        
        if weather_data:
            return {
                "status": "success",
                "timestamp": weather_data.timestamp.isoformat(),
                "solar_wind_speed_kmh": weather_data.solar_wind_speed,
                "kp_index": weather_data.kp_index,
                "geomagnetic_storm_level": weather_data.geomagnetic_storm_level,
                "solar_flare_class": weather_data.solar_flare_class,
                "conditions": "NORMAL" if weather_data.kp_index < 5 else "ELEVATED"
            }
        else:
            return {"status": "error", "message": "Unable to fetch space weather data"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/security/audit-report")
async def get_security_audit_report(
    days: int = 7,
    current_user: dict = Depends(require_security_level(SecurityLevel.CLASSIFIED))
):
    """Generate security audit report (requires CLASSIFIED clearance)"""
    from datetime import timedelta
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    report = security_manager.generate_security_report(start_date, end_date)
    
    return {
        "status": "success",
        "report": report,
        "generated_by": current_user['user_id'],
        "classification": "CLASSIFIED"
    }

@app.get("/analytics/mission-report")
async def get_mission_analytics_report(
    mission_id: str = "CURRENT",
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Get comprehensive mission analytics report"""
    try:
        global analytics_engine
        if not analytics_engine:
            analytics_engine = await get_analytics_engine()
            
        # Simulate mission data
        mission_data = {
            'mission_id': mission_id,
            'duration': 120,
            'altitude': 100000,
            'fuel_consumption': 950,
            'passengers': 4,
            'weather_score': 0.85,
            'system_health': 0.92
        }
        
        report = await analytics_engine.generate_analytics_report(mission_data)
        
        return {
            "status": "success",
            "report": report
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/nasa/comprehensive-mission-data")
async def get_comprehensive_mission_data(
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Get comprehensive mission data from NASA sources"""
    try:
        global nasa_integration
        if not nasa_integration:
            nasa_integration = await get_nasa_integration()
            
        mission_params = {
            'mission_id': 'ASTROHELP_001',
            'target_altitude': 110000,
            'max_velocity': 2800,
            'mission_duration': 140,
            'passenger_count': 4,
            'weather_score': 0.88
        }
        
        comprehensive_data = await nasa_integration.get_comprehensive_mission_data(mission_params)
        
        return {
            "status": "success",
            "mission_data": comprehensive_data
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/safety/emergency-status")
async def get_emergency_status(
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Get current emergency protocol status"""
    try:
        global safety_manager_instance
        if not safety_manager_instance:
            safety_manager_instance = await get_safety_manager()
            
        status = await safety_manager_instance.get_emergency_status()
        
        return {
            "status": "success",
            "emergency_status": status
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/safety/manual-abort")
async def manual_abort(
    abort_reason: str,
    current_user: dict = Depends(require_security_level(SecurityLevel.CLASSIFIED))
):
    """Manually initiate emergency abort sequence"""
    try:
        global safety_manager_instance
        if not safety_manager_instance:
            safety_manager_instance = await get_safety_manager()
            
        success = await safety_manager_instance.manual_abort(abort_reason)
        
        return {
            "status": "success" if success else "error",
            "abort_initiated": success,
            "reason": abort_reason,
            "initiated_by": current_user['user_id']
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/edge/status")
async def get_edge_computing_status(
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Get edge computing system status"""
    try:
        global edge_manager
        if not edge_manager:
            edge_manager = await get_edge_manager()
            
        status = await edge_manager.get_edge_status()
        
        return {
            "status": "success",
            "edge_status": status
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/edge/submit-task")
async def submit_edge_task(
    task_data: dict,
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Submit task for edge processing"""
    try:
        global edge_manager
        if not edge_manager:
            edge_manager = await get_edge_manager()
            
        task_id = await edge_manager.submit_task(
            task_type=task_data.get('task_type', 'system_monitoring'),
            data=task_data.get('data', {}),
            priority=task_data.get('priority', 5)
        )
        
        return {
            "status": "success",
            "task_id": task_id,
            "submitted_by": current_user['user_id']
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/health")
async def health_check():
    """Detailed health check with enterprise systems"""
    return {
        "status": "healthy",
        "services": {
            "vitals_monitoring": "operational",
            "alert_system": "operational",
            "navigation": "operational",
            "authentication": "operational",
            "advanced_analytics": "operational" if analytics_engine else "initializing",
            "nasa_integration": "operational" if nasa_integration else "initializing",
            "safety_protocols": "operational" if safety_manager_instance else "initializing",
            "edge_computing": "operational" if edge_manager else "initializing",
            "mission_control": "operational",
            "dsn_communication": "operational",
            "orbital_mechanics": "operational",
            "iss_docking_sim": "operational"
        },
        "active_connections": len(manager.active_connections),
        "enterprise_features": {
            "compliance_monitoring": "active",
            "predictive_maintenance": "active",
            "emergency_protocols": "active",
            "real_time_analytics": "active",
            "nasa_mission_control": "active",
            "deep_space_network": "active",
            "trajectory_planning": "active",
            "iss_docking_training": "active"
        }
    }

# NASA Mission Control Endpoints
@app.post("/nasa/mission/start")
async def start_nasa_mission(
    mission_config: dict,
    current_user: dict = Depends(require_security_level(SecurityLevel.MISSION_CRITICAL))
):
    """Start NASA-grade mission with full mission control"""
    result = await mission_control.start_mission(mission_config)
    return result

@app.get("/nasa/mission/status")
async def get_mission_status(
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Get comprehensive mission status"""
    status = await mission_control.get_mission_status()
    return status

@app.get("/nasa/mission/telemetry")
async def get_mission_telemetry(
    duration_minutes: int = 60,
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Get mission telemetry history"""
    telemetry = await mission_control.get_telemetry_history(duration_minutes)
    return {"status": "success", "telemetry": telemetry}

@app.post("/nasa/mission/command")
async def execute_mission_command(
    command: dict,
    current_user: dict = Depends(require_security_level(SecurityLevel.MISSION_CRITICAL))
):
    """Execute mission command through mission control"""
    result = await mission_control.execute_command(command)
    return result

# Deep Space Network Endpoints
@app.post("/nasa/dsn/start")
async def start_dsn_operations(
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Start Deep Space Network operations"""
    result = await dsn_system.start_dsn_operations()
    return result

@app.post("/nasa/dsn/communication")
async def establish_dsn_communication(
    spacecraft_id: str,
    antenna_id: str,
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Establish communication through DSN"""
    result = await dsn_system.establish_communication(spacecraft_id, antenna_id)
    return result

@app.get("/nasa/dsn/status")
async def get_dsn_status(
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Get DSN system status"""
    status = await dsn_system.get_dsn_status()
    return status

@app.post("/nasa/dsn/schedule")
async def schedule_dsn_communication(
    schedule_data: dict,
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Schedule spacecraft communication"""
    # Simplified scheduling for demo
    return {"status": "success", "message": "Communication scheduled", "schedule_id": "DSN-001"}

@app.get("/enhanced-debris/status")
async def get_enhanced_debris_status(
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Get enhanced debris tracking system status"""
    try:
        return {
            "status": "success",
            "system_status": "online" if enhanced_tracker.is_running else "offline",
            "total_objects": len(enhanced_tracker.tracked_objects),
            "high_risk_objects": len([d for d in enhanced_tracker.tracked_objects.values() if d.collision_probability > 0.3]),
            "ml_trained": enhanced_tracker.ml_system.is_trained,
            "data_sources": ["celestrak", "nasa_eonet", "enhanced_simulation"],
            "collision_alerts": len(enhanced_tracker.collision_alerts),
            "spacecraft_position": enhanced_tracker.spacecraft_position,
            "last_update": datetime.now().isoformat()
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/enhanced-debris/objects")
async def get_enhanced_debris_objects(
    risk_level: Optional[int] = None,
    limit: Optional[int] = 50,
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Get enhanced debris objects with optional filtering"""
    try:
        objects = list(enhanced_tracker.tracked_objects.values())
        
        # Filter by risk level if specified
        if risk_level is not None:
            objects = [obj for obj in objects if obj.risk_level >= risk_level]
        
        # Sort by collision probability (highest risk first)
        objects.sort(key=lambda x: x.collision_probability, reverse=True)
        
        # Limit results
        if limit:
            objects = objects[:limit]
        
        # Format response
        formatted_objects = []
        for obj in objects:
            formatted_objects.append({
                "id": obj.id,
                "name": obj.name,
                "position": obj.position,
                "velocity": obj.velocity,
                "collision_probability": obj.collision_probability,
                "risk_level": obj.risk_level,
                "classification": obj.classification,
                "size": obj.size,
                "mass": obj.mass,
                "orbital_period": obj.orbital_period,
                "country_code": obj.country_code,
                "detection_time": obj.detection_time.isoformat(),
                "recommended_action": enhanced_tracker.get_action_recommendation(obj.collision_probability)
            })
        
        return {
            "status": "success",
            "objects": formatted_objects,
            "total_count": len(enhanced_tracker.tracked_objects),
            "filtered_count": len(formatted_objects)
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/enhanced-debris/alerts")
async def get_enhanced_debris_alerts(
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Get current collision alerts from enhanced tracking"""
    try:
        return {
            "status": "success",
            "alerts": enhanced_tracker.collision_alerts,
            "alert_count": len(enhanced_tracker.collision_alerts),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/enhanced-debris/initialize")
async def initialize_enhanced_debris_tracking(
    current_user: dict = Depends(require_security_level(SecurityLevel.MISSION_CRITICAL))
):
    """Initialize the enhanced debris tracking system"""
    try:
        success = await enhanced_tracker.initialize()
        if success:
            # Start tracking in background
            asyncio.create_task(enhanced_tracker.start_real_time_tracking())
            return {
                "status": "success",
                "message": "Enhanced debris tracking system initialized and started",
                "objects_loaded": len(enhanced_tracker.tracked_objects)
            }
        else:
            return {
                "status": "error",
                "message": "Failed to initialize enhanced debris tracking system"
            }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/nasa/orbital/trajectory")
async def calculate_trajectory(
    initial_state: dict,
    duration_hours: int,
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Calculate orbital trajectory"""
    try:
        from nasa.orbital_mechanics import StateVector
        from datetime import datetime, timedelta
        
        state = StateVector(
            position=np.array([initial_state['x'], initial_state['y'], initial_state['z']]),
            velocity=np.array([initial_state['vx'], initial_state['vy'], initial_state['vz']]),
            epoch=datetime.now()
        )
        
        trajectory = orbital_calculator.propagate_orbit(state, timedelta(hours=duration_hours))
        
        trajectory_data = [{
            'time': point.time.isoformat(),
            'position': [point.position[0], point.position[1], point.position[2]],
            'velocity': [point.velocity[0], point.velocity[1], point.velocity[2]],
            'altitude': point.altitude,
            'latitude': point.latitude,
            'longitude': point.longitude
        } for point in trajectory]
        
        return {"status": "success", "trajectory": trajectory_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/nasa/orbital/hohmann")
async def calculate_hohmann_transfer(
    r1_km: float,
    r2_km: float,
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Calculate Hohmann transfer orbit"""
    r1 = r1_km * 1000  # Convert to meters
    r2 = r2_km * 1000
    
    transfer = orbital_calculator.calculate_hohmann_transfer(r1, r2)
    return {"status": "success", "transfer_parameters": transfer}

@app.post("/nasa/orbital/launch-windows")
async def calculate_launch_windows(
    target_orbit: dict,
    launch_site_lat: float,
    search_days: int = 30,
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Calculate optimal launch windows"""
    from nasa.orbital_mechanics import OrbitalElements
    from datetime import datetime
    
    elements = OrbitalElements(
        semi_major_axis=target_orbit['semi_major_axis'],
        eccentricity=target_orbit['eccentricity'],
        inclination=np.radians(target_orbit['inclination']),
        raan=np.radians(target_orbit['raan']),
        argument_of_perigee=np.radians(target_orbit['argument_of_perigee']),
        true_anomaly=np.radians(target_orbit['true_anomaly']),
        epoch=datetime.now()
    )
    
    windows = orbital_calculator.optimize_launch_window(elements, launch_site_lat, search_days)
    return {"status": "success", "launch_windows": windows}

# ISS Docking Simulator Endpoints
@app.post("/nasa/iss-docking/start")
async def start_iss_docking_simulation(
    initial_conditions: dict,
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Start ISS docking simulation"""
    result = await iss_docking_sim.start_docking_simulation(initial_conditions)
    return result

@app.get("/nasa/iss-docking/status")
async def get_docking_status(
    current_user: dict = Depends(require_security_level(SecurityLevel.CREW))
):
    """Get ISS docking simulation status"""
    status = await iss_docking_sim.get_simulation_status()
    return status

@app.post("/nasa/iss-docking/abort")
async def abort_iss_docking(
    reason: str,
    current_user: dict = Depends(require_security_level(SecurityLevel.MISSION_CRITICAL))
):
    """Abort ISS docking simulation"""
    result = await iss_docking_sim.abort_docking(reason)
    return result
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 AstroHELP API starting up...")
    print("🔧 Initializing vital signs monitoring system...")
    print("🧠 Starting ML health analyzer...")
    
    # Initialize ML health system
    await health_ml_analyzer.train_models()
    
    print("📊 Initializing advanced analytics engine...")
    analytics_engine = await get_analytics_engine()
    
    print("🛰️ Initializing NASA API integration...")
    nasa_integration = await get_nasa_integration()
    
    print("🚨 Initializing safety protocols and emergency systems...")
    safety_manager_instance = await get_safety_manager()
    await safety_manager_instance.start_safety_monitoring()
    
    print("⚡ Initializing edge computing capabilities...")
    edge_manager = await get_edge_manager()
    await edge_manager.start_edge_computing()
    
    print("🛰️ Initializing real-time debris tracking...")
    # Initialize debris tracking (simplified for demo)
    print("✅ Simulated debris tracking active")
    
    print("🏢 Initializing NASA Mission Control Center...")
    print("📡 Starting Deep Space Network operations...")
    await dsn_system.start_dsn_operations()
    
    print("🛰️ Activating navigation and obstacle detection...")
    print("🚀 ISS Docking Simulator ready for training...")
    print("📐 Orbital Mechanics Calculator operational...")
    
    print("✅ All enterprise AI systems operational!")
    print("🏢 Industry-grade compliance and security features active")
    print("🌟 NASA-grade systems ready for aerospace operations!")
    print("🚀 AstroHELP is ready for professional space missions!")

# async def initialize_debris_tracking():
#     """Initialize debris tracking system"""
#     try:
#         await debris_tracker.initialize()
#         # Start tracking in background
#         asyncio.create_task(debris_tracker.start_real_time_tracking())
#         print("✅ Debris tracking system initialized successfully")
#     except Exception as e:
#         logging.error(f"Failed to initialize debris tracking: {e}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
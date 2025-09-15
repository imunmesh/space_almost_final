"""
API endpoints for Enhanced Health Monitoring System with ML
"""
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Dict, Optional
import asyncio
from datetime import datetime
import json

# Import the health monitoring system
from health_ml_system import health_monitor, initialize_health_system, start_health_monitoring, get_health_status

router = APIRouter(prefix="/api/health", tags=["Health ML"])

class VitalSigns(BaseModel):
    heart_rate: float
    blood_pressure_systolic: float
    blood_pressure_diastolic: float
    oxygen_saturation: float
    body_temperature: float
    respiratory_rate: float
    space_adaptation: Optional[float] = 0.8
    sleep_quality: Optional[float] = 0.8
    exercise_level: Optional[float] = 0.7
    hydration_level: Optional[float] = 0.8

class HealthAlert(BaseModel):
    id: str
    type: str
    severity: str
    message: str
    timestamp: str
    acknowledged: bool

# Global health monitoring task
health_task = None

@router.on_event("startup")
async def startup_health_system():
    """Initialize health monitoring system on startup"""
    global health_task
    try:
        await initialize_health_system()
        # Start health monitoring in background
        health_task = asyncio.create_task(start_health_monitoring())
        print("Health ML system initialized successfully")
    except Exception as e:
        print(f"Failed to initialize health system: {e}")

@router.get("/status", response_model=Dict)
async def get_health_monitoring_status():
    """Get current health monitoring status"""
    try:
        status = get_health_status()
        return {
            "success": True,
            "data": status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get health status: {str(e)}")

@router.post("/analyze", response_model=Dict)
async def analyze_vital_signs(vitals: VitalSigns):
    """Analyze vital signs using ML models"""
    try:
        analysis = health_monitor.ml_analyzer.analyze_vital_signs(vitals.dict())
        return {
            "success": True,
            "data": {
                "vitals": vitals.dict(),
                "analysis": analysis
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze vital signs: {str(e)}")

@router.get("/current-vitals", response_model=Dict)
async def get_current_vitals():
    """Get current vital signs readings"""
    try:
        vitals = health_monitor.current_vitals
        if not vitals:
            return {
                "success": False,
                "message": "No current vital signs available",
                "timestamp": datetime.now().isoformat()
            }
        
        return {
            "success": True,
            "data": vitals,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get current vitals: {str(e)}")

@router.get("/alerts", response_model=Dict)
async def get_health_alerts():
    """Get active health alerts"""
    try:
        alerts = [alert for alert in health_monitor.alerts if not alert['acknowledged']]
        return {
            "success": True,
            "data": {
                "alerts": alerts,
                "count": len(alerts)
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get health alerts: {str(e)}")

@router.post("/alerts/{alert_id}/acknowledge", response_model=Dict)
async def acknowledge_alert(alert_id: str):
    """Acknowledge a health alert"""
    try:
        for alert in health_monitor.alerts:
            if alert['id'] == alert_id:
                alert['acknowledged'] = True
                return {
                    "success": True,
                    "message": f"Alert {alert_id} acknowledged",
                    "timestamp": datetime.now().isoformat()
                }
        
        raise HTTPException(status_code=404, detail="Alert not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to acknowledge alert: {str(e)}")

@router.get("/history", response_model=Dict)
async def get_health_history(limit: int = 50):
    """Get health monitoring history"""
    try:
        history = health_monitor.ml_analyzer.health_history[-limit:]
        
        # Process history for response
        processed_history = []
        for entry in history:
            processed_history.append({
                "vitals": entry["vitals"],
                "health_score": entry["analysis"]["health_score"],
                "stress_level": entry["analysis"]["stress_level"],
                "anomaly_detected": entry["analysis"]["anomaly_detected"],
                "timestamp": entry["timestamp"].isoformat() if hasattr(entry["timestamp"], 'isoformat') else entry["timestamp"]
            })
        
        return {
            "success": True,
            "data": {
                "history": processed_history,
                "total_entries": len(history)
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get health history: {str(e)}")

@router.get("/recommendations", response_model=Dict)
async def get_health_recommendations():
    """Get personalized health recommendations"""
    try:
        if not health_monitor.current_vitals:
            return {
                "success": False,
                "message": "No current health data available for recommendations",
                "timestamp": datetime.now().isoformat()
            }
        
        analysis = health_monitor.ml_analyzer.analyze_vital_signs(health_monitor.current_vitals)
        
        return {
            "success": True,
            "data": {
                "recommendations": analysis.get("recommendations", []),
                "health_score": analysis.get("health_score", 0),
                "stress_level": analysis.get("stress_level", "Unknown")
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

@router.get("/trends", response_model=Dict)
async def get_health_trends():
    """Get health trends analysis"""
    try:
        trends = health_monitor.ml_analyzer.analyze_trends()
        
        # Calculate additional trend metrics
        history = health_monitor.ml_analyzer.health_history
        if len(history) >= 10:
            recent_scores = [h['analysis']['health_score'] for h in history[-10:]]
            recent_stress = [h['analysis']['predicted_stress_score'] for h in history[-10:]]
            
            trends.update({
                "recent_health_scores": recent_scores,
                "recent_stress_scores": recent_stress,
                "health_variance": float(np.var(recent_scores)) if recent_scores else 0,
                "stress_variance": float(np.var(recent_stress)) if recent_stress else 0
            })
        
        return {
            "success": True,
            "data": trends,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get health trends: {str(e)}")

@router.post("/emergency", response_model=Dict)
async def trigger_emergency_protocol():
    """Trigger emergency health protocol"""
    try:
        emergency_alert = {
            'id': f"emergency_{datetime.now().timestamp()}",
            'type': 'MEDICAL_EMERGENCY',
            'severity': 'CRITICAL',
            'message': 'Medical emergency protocol activated',
            'timestamp': datetime.now().isoformat(),
            'acknowledged': False,
            'actions_required': [
                'Contact medical team immediately',
                'Prepare emergency medical kit',
                'Monitor vital signs continuously',
                'Prepare for possible evacuation'
            ]
        }
        
        health_monitor.alerts.append(emergency_alert)
        
        return {
            "success": True,
            "data": {
                "emergency_id": emergency_alert['id'],
                "message": "Emergency protocol activated",
                "actions": emergency_alert['actions_required']
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to trigger emergency protocol: {str(e)}")

@router.websocket("/ws/health-monitoring")
async def websocket_health_monitoring(websocket: WebSocket):
    """WebSocket endpoint for real-time health monitoring updates"""
    await websocket.accept()
    
    try:
        while True:
            # Send current health status
            status = get_health_status()
            await websocket.send_json({
                "type": "health_update",
                "data": status,
                "timestamp": datetime.now().isoformat()
            })
            
            # Send alerts if any
            active_alerts = [alert for alert in health_monitor.alerts if not alert['acknowledged']]
            if active_alerts:
                await websocket.send_json({
                    "type": "health_alerts",
                    "data": active_alerts,
                    "timestamp": datetime.now().isoformat()
                })
            
            # Check for critical conditions
            if status.get('analysis', {}).get('health_score', 100) < 60:
                await websocket.send_json({
                    "type": "critical_health",
                    "data": {
                        "health_score": status['analysis']['health_score'],
                        "message": "Critical health condition detected"
                    },
                    "timestamp": datetime.now().isoformat()
                })
            
            await asyncio.sleep(3)  # Update every 3 seconds
            
    except WebSocketDisconnect:
        print("Health monitoring WebSocket disconnected")
    except Exception as e:
        print(f"Health monitoring WebSocket error: {e}")
    finally:
        await websocket.close()

@router.get("/ml-models/info", response_model=Dict)
async def get_ml_models_info():
    """Get information about ML models used in health monitoring"""
    try:
        return {
            "success": True,
            "data": {
                "models": {
                    "anomaly_detector": {
                        "type": "IsolationForest",
                        "purpose": "Detect unusual vital sign patterns",
                        "trained": health_monitor.ml_analyzer.is_trained
                    },
                    "health_predictor": {
                        "type": "RandomForestRegressor", 
                        "purpose": "Predict stress levels and health trends",
                        "trained": health_monitor.ml_analyzer.is_trained
                    },
                    "stress_analyzer": {
                        "type": "KMeans",
                        "purpose": "Classify stress levels into categories",
                        "trained": health_monitor.ml_analyzer.is_trained
                    }
                },
                "training_data_size": 2000,
                "features_used": [
                    "heart_rate", "blood_pressure_systolic", "blood_pressure_diastolic",
                    "oxygen_saturation", "body_temperature", "respiratory_rate"
                ],
                "normal_ranges": health_monitor.ml_analyzer.normal_ranges
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get ML models info: {str(e)}")

import numpy as np  # Add this import at the top
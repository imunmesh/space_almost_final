"""
API endpoints for ML-based space tracking system
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Optional
import asyncio
from datetime import datetime
import json

# Import the ML tracking system
from ml_tracking import tracking_system, initialize_tracking, start_tracking, get_tracking_data

router = APIRouter(prefix="/api/tracking", tags=["ML Tracking"])

class TrackingStatus(BaseModel):
    is_running: bool
    total_objects: int
    high_risk_objects: int
    ml_trained: bool
    last_update: str

class ObjectPrediction(BaseModel):
    object_id: str
    risk: float
    is_anomaly: bool
    time_to_approach: float
    recommended_action: str
    confidence: float

class SpaceObject(BaseModel):
    id: str
    name: str
    position: Dict[str, float]
    velocity: Dict[str, float]
    size: float
    mass: float
    radar_cross_section: float

# Global tracking task
tracking_task = None

@router.on_event("startup")
async def startup_tracking():
    """Initialize tracking system on startup"""
    global tracking_task
    try:
        await initialize_tracking()
        # Start tracking in background
        tracking_task = asyncio.create_task(start_tracking())
        print("ML Tracking system initialized successfully")
    except Exception as e:
        print(f"Failed to initialize tracking system: {e}")

@router.get("/status", response_model=Dict)
async def get_tracking_status():
    """Get current tracking system status"""
    try:
        status = get_tracking_data()
        return {
            "success": True,
            "data": status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tracking status: {str(e)}")

@router.get("/objects", response_model=Dict)
async def get_tracked_objects():
    """Get all currently tracked space objects"""
    try:
        status = get_tracking_data()
        objects = []
        
        for obj_id, obj_data in tracking_system.current_objects.items():
            prediction = tracking_system.predictions.get(obj_id, {})
            
            objects.append({
                "id": obj_data["id"],
                "name": obj_data["name"],
                "position": obj_data["position"],
                "velocity": obj_data["velocity"],
                "size": obj_data["size"],
                "mass": obj_data["mass"],
                "risk": prediction.get("risk", 0.0),
                "is_anomaly": prediction.get("is_anomaly", False),
                "time_to_approach": prediction.get("time_to_approach", float('inf')),
                "recommended_action": prediction.get("recommended_action", "ROUTINE_TRACKING")
            })
        
        # Sort by risk level
        objects.sort(key=lambda x: x["risk"], reverse=True)
        
        return {
            "success": True,
            "data": {
                "objects": objects,
                "total_count": len(objects),
                "high_risk_count": len([obj for obj in objects if obj["risk"] > 0.3])
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tracked objects: {str(e)}")

@router.get("/high-risk", response_model=Dict)
async def get_high_risk_objects():
    """Get objects with high collision risk"""
    try:
        status = get_tracking_data()
        high_risk_objects = []
        
        for obj_id, obj_data in tracking_system.current_objects.items():
            prediction = tracking_system.predictions.get(obj_id, {})
            risk = prediction.get("risk", 0.0)
            
            if risk > 0.3:  # High risk threshold
                high_risk_objects.append({
                    "id": obj_data["id"],
                    "name": obj_data["name"],
                    "position": obj_data["position"],
                    "velocity": obj_data["velocity"],
                    "risk": risk,
                    "time_to_approach": prediction.get("time_to_approach", float('inf')),
                    "recommended_action": prediction.get("recommended_action", "MONITOR_CLOSELY"),
                    "confidence": prediction.get("confidence", 0.0)
                })
        
        # Sort by risk level
        high_risk_objects.sort(key=lambda x: x["risk"], reverse=True)
        
        return {
            "success": True,
            "data": {
                "high_risk_objects": high_risk_objects,
                "count": len(high_risk_objects),
                "highest_risk": high_risk_objects[0]["risk"] if high_risk_objects else 0.0
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get high-risk objects: {str(e)}")

@router.get("/predictions/{object_id}", response_model=Dict)
async def get_object_prediction(object_id: str):
    """Get prediction for a specific object"""
    try:
        if object_id not in tracking_system.current_objects:
            raise HTTPException(status_code=404, detail="Object not found")
        
        obj_data = tracking_system.current_objects[object_id]
        prediction = tracking_system.predictions.get(object_id, {})
        
        return {
            "success": True,
            "data": {
                "object": obj_data,
                "prediction": prediction,
                "trajectory": tracking_system.ml_engine.tracking_history[-10:] if tracking_system.ml_engine.tracking_history else []
            },
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get object prediction: {str(e)}")

@router.get("/nasa-data/neo", response_model=Dict)
async def get_nasa_neo_data():
    """Get Near Earth Objects data from NASA"""
    try:
        neo_data = await tracking_system.nasa_fetcher.fetch_near_earth_objects()
        
        # Process NEO data
        processed_objects = []
        for date, objects in neo_data.get("near_earth_objects", {}).items():
            for obj in objects:
                processed_objects.append({
                    "id": obj["id"],
                    "name": obj["name"],
                    "diameter_km": obj["estimated_diameter"]["kilometers"]["estimated_diameter_max"],
                    "miss_distance_km": float(obj["close_approach_data"][0]["miss_distance"]["kilometers"]),
                    "velocity_kms": float(obj["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"]),
                    "is_hazardous": obj["is_potentially_hazardous_asteroid"],
                    "approach_date": obj["close_approach_data"][0]["close_approach_date"]
                })
        
        return {
            "success": True,
            "data": {
                "neo_objects": processed_objects,
                "count": len(processed_objects)
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get NASA NEO data: {str(e)}")

@router.get("/nasa-data/space-weather", response_model=Dict)
async def get_nasa_space_weather():
    """Get space weather data from NASA"""
    try:
        weather_data = await tracking_system.nasa_fetcher.fetch_space_weather()
        
        # Process space weather data
        processed_events = []
        for event in weather_data:
            processed_events.append({
                "id": event["flrID"],
                "class_type": event["classType"],
                "source_location": event["sourceLocation"],
                "begin_time": event["beginTime"],
                "peak_time": event["peakTime"],
                "end_time": event.get("endTime", ""),
                "severity": "HIGH" if event["classType"] == "X" else "MEDIUM" if event["classType"] == "M" else "LOW"
            })
        
        return {
            "success": True,
            "data": {
                "space_weather_events": processed_events,
                "count": len(processed_events),
                "active_events": [e for e in processed_events if not e["end_time"]]
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get space weather data: {str(e)}")

@router.post("/control/start", response_model=Dict)
async def start_tracking_system():
    """Start the tracking system"""
    try:
        global tracking_task
        if tracking_task and not tracking_task.done():
            return {
                "success": True,
                "message": "Tracking system is already running",
                "timestamp": datetime.now().isoformat()
            }
        
        tracking_task = asyncio.create_task(start_tracking())
        
        return {
            "success": True,
            "message": "Tracking system started",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start tracking system: {str(e)}")

@router.post("/control/stop", response_model=Dict)
async def stop_tracking_system():
    """Stop the tracking system"""
    try:
        tracking_system.stop_tracking()
        
        global tracking_task
        if tracking_task and not tracking_task.done():
            tracking_task.cancel()
        
        return {
            "success": True,
            "message": "Tracking system stopped",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop tracking system: {str(e)}")

@router.get("/analytics/summary", response_model=Dict)
async def get_tracking_analytics():
    """Get tracking system analytics and summary"""
    try:
        status = get_tracking_data()
        objects = tracking_system.current_objects
        predictions = tracking_system.predictions
        
        # Calculate analytics
        risk_distribution = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        size_distribution = {"small": 0, "medium": 0, "large": 0}
        velocity_stats = []
        
        for obj_id, obj_data in objects.items():
            prediction = predictions.get(obj_id, {})
            risk = prediction.get("risk", 0.0)
            
            # Risk distribution
            if risk > 0.7:
                risk_distribution["critical"] += 1
            elif risk > 0.5:
                risk_distribution["high"] += 1
            elif risk > 0.3:
                risk_distribution["medium"] += 1
            else:
                risk_distribution["low"] += 1
            
            # Size distribution
            size = obj_data["size"]
            if size > 5:
                size_distribution["large"] += 1
            elif size > 1:
                size_distribution["medium"] += 1
            else:
                size_distribution["small"] += 1
            
            # Velocity statistics
            velocity_magnitude = (obj_data["velocity"]["x"]**2 + obj_data["velocity"]["y"]**2 + obj_data["velocity"]["z"]**2)**0.5
            velocity_stats.append(velocity_magnitude)
        
        avg_velocity = sum(velocity_stats) / len(velocity_stats) if velocity_stats else 0
        
        return {
            "success": True,
            "data": {
                "summary": {
                    "total_objects": len(objects),
                    "ml_accuracy": 0.87,  # Simulated accuracy
                    "avg_velocity": round(avg_velocity, 2),
                    "system_uptime": "Active" if status["is_running"] else "Inactive"
                },
                "risk_distribution": risk_distribution,
                "size_distribution": size_distribution,
                "recent_alerts": len([p for p in predictions.values() if p.get("risk", 0) > 0.5])
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")

@router.websocket("/ws/tracking")
async def websocket_tracking_updates(websocket):
    """WebSocket endpoint for real-time tracking updates"""
    await websocket.accept()
    
    try:
        while True:
            # Send current tracking status
            status = get_tracking_data()
            await websocket.send_json({
                "type": "tracking_update",
                "data": status,
                "timestamp": datetime.now().isoformat()
            })
            
            # Send high-risk alerts
            high_risk = [p for p in status.get("predictions", []) if p.get("risk", 0) > 0.5]
            if high_risk:
                await websocket.send_json({
                    "type": "high_risk_alert",
                    "data": high_risk,
                    "timestamp": datetime.now().isoformat()
                })
            
            await asyncio.sleep(2)  # Update every 2 seconds
            
    except Exception as e:
        print(f"WebSocket connection error: {e}")
    finally:
        await websocket.close()
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from app.models.schemas import NavigationData, SpacecraftPosition, Obstacle
from app.services.auth import get_current_user
from app.services.ml_detection import ml_detector
from datetime import datetime
import random

router = APIRouter(prefix="/navigation", tags=["navigation"])
security = HTTPBearer()

@router.get("/position", response_model=SpacecraftPosition)
async def get_spacecraft_position(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get current spacecraft position"""
    current_user = get_current_user(credentials.credentials)
    
    # Simulate spacecraft position (in reality, would come from GPS/sensors)
    position = SpacecraftPosition(
        x=random.uniform(-100, 100),  # km from Earth
        y=random.uniform(-100, 100),
        z=random.uniform(-50, 50),
        velocity_x=random.uniform(-0.1, 0.1),  # km/s
        velocity_y=random.uniform(-0.1, 0.1),
        velocity_z=random.uniform(-0.05, 0.05),
        heading=random.uniform(0, 360)
    )
    
    return position

@router.get("/obstacles", response_model=List[Obstacle])
async def get_obstacles(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get detected obstacles around spacecraft"""
    current_user = get_current_user(credentials.credentials)
    
    # Get current spacecraft position
    spacecraft_pos = SpacecraftPosition(
        x=random.uniform(-100, 100),
        y=random.uniform(-100, 100),
        z=random.uniform(-50, 50),
        velocity_x=0.1, velocity_y=0.05, velocity_z=0.0,
        heading=45.0
    )
    
    # Generate obstacles using ML detector
    obstacles = ml_detector.generate_simulated_obstacles(spacecraft_pos, count=8)
    
    return obstacles

@router.get("/navigation-data", response_model=NavigationData)
async def get_navigation_data(
    destination_x: float = 200.0,
    destination_y: float = 100.0,
    destination_z: float = 0.0,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get complete navigation data including position, obstacles, and safe path"""
    current_user = get_current_user(credentials.credentials)
    
    # Current spacecraft position
    spacecraft_pos = SpacecraftPosition(
        x=random.uniform(-100, 100),
        y=random.uniform(-100, 100),
        z=random.uniform(-50, 50),
        velocity_x=0.1, velocity_y=0.05, velocity_z=0.0,
        heading=45.0
    )
    
    # Destination
    destination = SpacecraftPosition(
        x=destination_x, y=destination_y, z=destination_z,
        velocity_x=0, velocity_y=0, velocity_z=0, heading=0
    )
    
    # Get obstacles
    obstacles = ml_detector.generate_simulated_obstacles(spacecraft_pos, count=6)
    
    # Generate safe path
    safe_path = ml_detector.generate_safe_path(spacecraft_pos, destination, obstacles)
    
    # Simulate fuel level
    fuel_level = random.uniform(70, 100)
    
    navigation_data = NavigationData(
        spacecraft_position=spacecraft_pos,
        target_destination=destination,
        obstacles=obstacles,
        safe_path=safe_path,
        fuel_level=fuel_level
    )
    
    return navigation_data

@router.get("/collision-risk")
async def get_collision_risk(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get collision risk assessment for all detected obstacles"""
    current_user = get_current_user(credentials.credentials)
    
    # Get current position and obstacles
    spacecraft_pos = SpacecraftPosition(
        x=0, y=0, z=0,
        velocity_x=0.1, velocity_y=0.05, velocity_z=0.0,
        heading=45.0
    )
    
    obstacles = ml_detector.generate_simulated_obstacles(spacecraft_pos, count=5)
    
    # Calculate risks
    risks = []
    for obstacle in obstacles:
        risk = ml_detector.calculate_collision_risk(
            spacecraft_pos,
            (spacecraft_pos.velocity_x, spacecraft_pos.velocity_y, spacecraft_pos.velocity_z),
            obstacle
        )
        
        risks.append({
            "obstacle_id": obstacle.id,
            "obstacle_type": obstacle.type,
            "risk_level": risk,
            "distance": ((obstacle.position.x - spacecraft_pos.x)**2 + 
                        (obstacle.position.y - spacecraft_pos.y)**2 + 
                        (obstacle.position.z - spacecraft_pos.z)**2)**0.5,
            "size": obstacle.size
        })
    
    # Sort by risk level
    risks.sort(key=lambda x: x["risk_level"], reverse=True)
    
    return {
        "spacecraft_position": spacecraft_pos,
        "collision_risks": risks,
        "highest_risk": risks[0]["risk_level"] if risks else 0.0
    }
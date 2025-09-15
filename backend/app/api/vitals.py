from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from app.models.schemas import VitalSigns, Alert, User
from app.services.auth import get_current_user
from app.services.vitals import vitals_service
from datetime import datetime

router = APIRouter(prefix="/vitals", tags=["vital signs"])
security = HTTPBearer()

@router.get("/current", response_model=VitalSigns)
async def get_current_vitals(
    astronaut_id: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get current vital signs for an astronaut"""
    current_user = get_current_user(credentials.credentials)
    
    # Use current user's astronaut_id if not specified
    target_astronaut_id = astronaut_id or current_user.astronaut_id
    
    if not target_astronaut_id:
        raise HTTPException(status_code=400, detail="No astronaut ID specified")
    
    # Generate simulated vitals for demonstration
    vitals = vitals_service.generate_simulated_vitals(target_astronaut_id)
    vitals_service.record_vitals(vitals)
    
    return vitals

@router.post("/stream", response_model=List[Alert])
async def stream_vitals(
    vitals: VitalSigns,
    background_tasks: BackgroundTasks,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Stream vital signs data and get any alerts"""
    current_user = get_current_user(credentials.credentials)
    
    # Verify user can submit vitals for this astronaut
    if current_user.astronaut_id != vitals.astronaut_id and current_user.role not in ["commander", "mission_control"]:
        raise HTTPException(status_code=403, detail="Not authorized to submit vitals for this astronaut")
    
    # Record vitals and check for alerts
    alerts = vitals_service.record_vitals(vitals)
    
    return alerts

@router.get("/history", response_model=List[VitalSigns])
async def get_vitals_history(
    astronaut_id: Optional[str] = None,
    hours: int = 24,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get vital signs history for specified time period"""
    current_user = get_current_user(credentials.credentials)
    
    target_astronaut_id = astronaut_id or current_user.astronaut_id
    
    if not target_astronaut_id:
        raise HTTPException(status_code=400, detail="No astronaut ID specified")
    
    history = vitals_service.get_vital_history(target_astronaut_id, hours)
    return history

@router.get("/simulate", response_model=VitalSigns)
async def simulate_vitals(
    astronaut_id: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Generate and return simulated vital signs (for testing/demo)"""
    current_user = get_current_user(credentials.credentials)
    
    target_astronaut_id = astronaut_id or current_user.astronaut_id
    
    if not target_astronaut_id:
        raise HTTPException(status_code=400, detail="No astronaut ID specified")
    
    # Generate simulated vitals
    vitals = vitals_service.generate_simulated_vitals(target_astronaut_id)
    
    return vitals
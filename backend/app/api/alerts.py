from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from app.models.schemas import Alert
from app.services.auth import get_current_user
from app.services.vitals import vitals_service

router = APIRouter(prefix="/alerts", tags=["alerts"])
security = HTTPBearer()

@router.get("/active", response_model=List[Alert])
async def get_active_alerts(
    astronaut_id: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get active alerts for astronaut(s)"""
    current_user = get_current_user(credentials.credentials)
    
    # Commanders and mission control can see all alerts
    if current_user.role in ["commander", "mission_control"]:
        alerts = vitals_service.get_active_alerts(astronaut_id)
    else:
        # Regular astronauts can only see their own alerts
        alerts = vitals_service.get_active_alerts(current_user.astronaut_id)
    
    return alerts

@router.post("/acknowledge/{alert_id}")
async def acknowledge_alert(
    alert_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Acknowledge an alert"""
    current_user = get_current_user(credentials.credentials)
    
    success = vitals_service.acknowledge_alert(alert_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"message": "Alert acknowledged successfully"}

@router.get("/critical", response_model=List[Alert])
async def get_critical_alerts(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get only critical and high severity alerts"""
    current_user = get_current_user(credentials.credentials)
    
    all_alerts = vitals_service.get_active_alerts()
    critical_alerts = [
        alert for alert in all_alerts 
        if alert.severity in ["critical", "high"]
    ]
    
    return critical_alerts
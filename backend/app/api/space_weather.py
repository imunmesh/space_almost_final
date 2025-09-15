from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from app.models.schemas import SpaceWeatherData, Alert
from app.services.auth import get_current_user
from app.services.space_weather import space_weather_service

router = APIRouter(prefix="/space-weather", tags=["space weather"])
security = HTTPBearer()

@router.get("/current", response_model=SpaceWeatherData)
async def get_current_space_weather(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get current space weather conditions"""
    current_user = get_current_user(credentials.credentials)
    
    # Generate or get cached weather data
    weather_data = await space_weather_service.generate_current_weather()
    
    return weather_data

@router.get("/forecast", response_model=List[SpaceWeatherData])
async def get_space_weather_forecast(
    hours: int = 24,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get space weather forecast for specified hours"""
    current_user = get_current_user(credentials.credentials)
    
    if hours > 72:
        raise HTTPException(status_code=400, detail="Forecast limited to 72 hours")
    
    forecast = space_weather_service.get_weather_forecast(hours)
    return forecast

@router.get("/alerts", response_model=List[Alert])
async def get_space_weather_alerts(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get active space weather alerts"""
    current_user = get_current_user(credentials.credentials)
    
    current_weather = space_weather_service.get_current_weather()
    if not current_weather:
        # Generate current weather if not available
        current_weather = await space_weather_service.generate_current_weather()
    
    alerts = space_weather_service.get_weather_alerts(current_weather)
    return alerts

@router.post("/refresh")
async def refresh_space_weather(
    background_tasks: BackgroundTasks,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Manually refresh space weather data"""
    current_user = get_current_user(credentials.credentials)
    
    # Refresh in background
    background_tasks.add_task(space_weather_service.generate_current_weather)
    
    return {"message": "Space weather data refresh initiated"}

@router.get("/solar-activity")
async def get_solar_activity_summary(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get summary of solar activity"""
    current_user = get_current_user(credentials.credentials)
    
    current_weather = space_weather_service.get_current_weather()
    if not current_weather:
        current_weather = await space_weather_service.generate_current_weather()
    
    # Calculate risk levels
    radiation_risk = "HIGH" if current_weather.cosmic_radiation_level > 75 else \
                    "MEDIUM" if current_weather.cosmic_radiation_level > 50 else "LOW"
    
    solar_risk = "HIGH" if current_weather.solar_flare_class and \
                          current_weather.solar_flare_class.startswith(("M", "X")) else \
                "MEDIUM" if current_weather.solar_flare_class and \
                           current_weather.solar_flare_class.startswith("C") else "LOW"
    
    geomagnetic_risk = "HIGH" if current_weather.kp_index > 6 else \
                      "MEDIUM" if current_weather.kp_index > 4 else "LOW"
    
    return {
        "radiation_risk": radiation_risk,
        "solar_flare_risk": solar_risk,
        "geomagnetic_risk": geomagnetic_risk,
        "overall_severity": current_weather.weather_severity,
        "recommendations": get_safety_recommendations(current_weather)
    }

def get_safety_recommendations(weather: SpaceWeatherData) -> List[str]:
    """Generate safety recommendations based on weather conditions"""
    recommendations = []
    
    if weather.cosmic_radiation_level > 75:
        recommendations.append("Limit EVA activities to essential operations only")
        recommendations.append("Crew should remain in shielded areas of spacecraft")
    
    if weather.solar_flare_class and weather.solar_flare_class.startswith(("M", "X")):
        recommendations.append("Avoid electronics-heavy operations")
        recommendations.append("Monitor crew for radiation exposure symptoms")
    
    if weather.kp_index > 6:
        recommendations.append("Communications may be disrupted")
        recommendations.append("Use backup communication systems if available")
    
    if weather.solar_wind_speed > 600:
        recommendations.append("Monitor spacecraft systems for anomalies")
        recommendations.append("Prepare for potential navigation interference")
    
    if weather.asteroid_alerts:
        recommendations.append("Maintain awareness of trajectory and obstacles")
        recommendations.append("Keep emergency protocols ready")
    
    if not recommendations:
        recommendations.append("Space weather conditions are favorable")
        recommendations.append("Normal operations can continue")
    
    return recommendations
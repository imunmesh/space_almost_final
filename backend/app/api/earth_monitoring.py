"""
Earth Monitoring API endpoints
Handles satellite data, deforestation detection, and geospatial analysis
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from app.models.schemas import (
    BoundingBox, VegetationIndex, SatelliteImageData, DeforestationAlert,
    FireDetection, FloodData, DroughtData, CropHealthAnalysis,
    EarthObservationRequest, EarthMonitoringDashboard, MLPrediction
)
from app.services.satellite_data import satellite_service
from app.services.geospatial_ml import GeospatialMLService
from app.services.auth import get_current_user

router = APIRouter(prefix="/earth-monitoring", tags=["earth-monitoring"])
security = HTTPBearer()

@router.get("/dashboard")
async def get_earth_monitoring_dashboard(
    lat_min: float = Query(..., ge=-90, le=90),
    lat_max: float = Query(..., ge=-90, le=90),
    lon_min: float = Query(..., ge=-180, le=180),
    lon_max: float = Query(..., ge=-180, le=180),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get comprehensive Earth monitoring dashboard for specified region"""
    try:
        # Validate user
        current_user = get_current_user(credentials.credentials)
        
        bbox = {
            'min_lat': lat_min,
            'max_lat': lat_max,
            'min_lon': lon_min,
            'max_lon': lon_max
        }
        
        # Get various monitoring data
        fire_data = await satellite_service.get_nasa_firms_data(bbox)
        deforestation_data = await satellite_service.get_global_forest_watch_data(bbox)
        disaster_data = await satellite_service.get_disaster_data(bbox)
        
        return {
            'status': 'success',
            'dashboard_id': f"DASH_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'region': bbox,
            'fire_hotspots': fire_data,
            'deforestation_alerts': deforestation_data.get('deforestation_alerts', []),
            'active_alerts': [
                {'type': 'fire', 'count': len(fire_data), 'severity': 'medium'},
                {'type': 'deforestation', 'count': len(deforestation_data.get('deforestation_alerts', [])), 'severity': 'high'},
                {'type': 'flood', 'count': len(disaster_data.get('floods', [])), 'severity': 'low'},
                {'type': 'drought', 'count': len(disaster_data.get('droughts', [])), 'severity': 'medium'}
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/vegetation-indices")
async def get_vegetation_indices(
    lat_min: float = Query(..., ge=-90, le=90),
    lat_max: float = Query(..., ge=-90, le=90),
    lon_min: float = Query(..., ge=-180, le=180),
    lon_max: float = Query(..., ge=-180, le=180),
    index_type: str = Query(default="all", description="NDVI, EVI, NBR, or all"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Calculate vegetation indices for specified region"""
    try:
        # Validate user
        current_user = get_current_user(credentials.credentials)
        
        bbox = {
            'min_lat': lat_min,
            'max_lat': lat_max,
            'min_lon': lon_min,
            'max_lon': lon_max
        }
        
        indices = {}
        
        if index_type.lower() in ['ndvi', 'all']:
            indices['ndvi'] = satellite_service.calculate_ndvi_simulation(bbox)
        
        if index_type.lower() in ['evi', 'all']:
            indices['evi'] = satellite_service.calculate_evi_simulation(bbox)
        
        if index_type.lower() in ['nbr', 'all']:
            indices['nbr'] = satellite_service.calculate_nbr_simulation(bbox)
        
        return {
            'status': 'success',
            'indices': indices,
            'region': bbox,
            'calculation_time': datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/train-ml-model")
async def train_deforestation_model(
    sample_size: int = Query(default=1000, description="Number of training samples"),
    model_type: str = Query(default="random_forest", description="Model type to train"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Train machine learning model for deforestation detection"""
    try:
        # Validate user
        current_user = get_current_user(credentials.credentials)
        
        if model_type.lower() == "random_forest":
            # Generate synthetic training data
            # Initialize ML service
            ml_service = GeospatialMLService()
            features, labels = ml_service.generate_synthetic_training_data(sample_size)
            
            # Train model
            # Initialize ML service
            ml_service = GeospatialMLService()
            result = ml_service.train_random_forest_model(features, labels)
            
            return result
        else:
            return {
                'status': 'error',
                'message': f'Model type {model_type} not yet implemented'
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict-deforestation")
async def predict_deforestation(
    satellite_data: List[Dict],
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Predict deforestation probability for satellite data points"""
    try:
        # Validate user
        current_user = get_current_user(credentials.credentials)
        
        # Initialize ML service
        ml_service = GeospatialMLService()
        
        if not ml_service.is_trained:
            # Train model with sample data if not already trained
            features, labels = ml_service.generate_synthetic_training_data(1000)
            ml_service.train_random_forest_model(features, labels)
        
        predictions = ml_service.predict_deforestation(satellite_data)
        
        return {
            'status': 'success',
            'predictions': predictions,
            'model_info': ml_service.model_metrics if hasattr(ml_service, 'model_metrics') else {}
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
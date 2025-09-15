from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# Geospatial and Earth Monitoring Models
class BoundingBox(BaseModel):
    min_lat: float = Field(..., ge=-90, le=90)
    max_lat: float = Field(..., ge=-90, le=90)
    min_lon: float = Field(..., ge=-180, le=180)
    max_lon: float = Field(..., ge=-180, le=180)

class VegetationIndex(BaseModel):
    ndvi: float = Field(..., ge=-1, le=1, description="Normalized Difference Vegetation Index")
    evi: float = Field(..., ge=-1, le=1, description="Enhanced Vegetation Index")
    nbr: float = Field(..., ge=-1, le=1, description="Normalized Burn Ratio")
    savi: Optional[float] = Field(None, ge=-1, le=1, description="Soil Adjusted Vegetation Index")
    timestamp: datetime = Field(default_factory=datetime.now)
    location: Dict[str, float] = Field(default_factory=dict)  # lat, lon

class SatelliteImageData(BaseModel):
    image_id: str
    satellite: str  # Sentinel-2, Landsat-8, etc.
    acquisition_date: datetime
    cloud_coverage: float = Field(..., ge=0, le=100)
    resolution: float  # meters per pixel
    bands: Dict[str, float] = Field(default_factory=dict)  # spectral bands
    bbox: BoundingBox
    download_url: Optional[str] = None
    processing_level: str = "L2A"  # L1C, L2A, etc.

class DeforestationAlert(BaseModel):
    alert_id: str
    location: Dict[str, float]  # lat, lon
    confidence: float = Field(..., ge=0, le=100)
    area_hectares: float = Field(..., ge=0)
    detection_date: datetime
    severity: AlertSeverity
    forest_type: str = "Primary"  # Primary, Secondary, Plantation
    cause: Optional[str] = None  # Logging, Agriculture, Fire, etc.
    verification_status: str = "Pending"  # Pending, Verified, False Positive

class FireDetection(BaseModel):
    fire_id: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    brightness: float  # Kelvin
    confidence: float = Field(..., ge=0, le=100)
    frp: float = Field(..., ge=0, description="Fire Radiative Power in MW")
    acquisition_time: datetime
    satellite: str
    fire_size_hectares: Optional[float] = None
    burn_severity: Optional[str] = None  # Low, Moderate, High

class FloodData(BaseModel):
    flood_id: str
    location: Dict[str, float]  # lat, lon
    severity: AlertSeverity
    affected_area_km2: float = Field(..., ge=0)
    water_level: float = Field(..., ge=0, description="Water level in meters")
    start_date: datetime
    end_date: Optional[datetime] = None
    status: str = "Active"  # Active, Receding, Resolved
    population_affected: Optional[int] = None
    economic_impact: Optional[float] = None

class DroughtData(BaseModel):
    drought_id: str
    location: Dict[str, float]  # lat, lon
    severity: AlertSeverity
    affected_area_km2: float = Field(..., ge=0)
    duration_days: int = Field(..., ge=0)
    precipitation_deficit: float = Field(..., ge=0, le=100, description="Percentage below normal")
    start_date: datetime
    soil_moisture_index: Optional[float] = None
    agricultural_impact: Optional[str] = None

class CropHealthAnalysis(BaseModel):
    analysis_id: str
    region: BoundingBox
    crop_type: Optional[str] = None
    vegetation_indices: VegetationIndex
    health_status: str  # Excellent, Good, Fair, Poor
    stress_factors: List[str] = Field(default_factory=list)
    yield_prediction: Optional[Dict[str, Any]] = None
    irrigation_recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    harvest_readiness: Optional[Dict[str, Any]] = None
    analysis_date: datetime = Field(default_factory=datetime.now)

class ForestFragmentation(BaseModel):
    analysis_id: str
    region: BoundingBox
    total_patches: int = Field(..., ge=0)
    total_area_hectares: float = Field(..., ge=0)
    mean_patch_size: float = Field(..., ge=0)
    fragmentation_index: float = Field(..., ge=0)
    fragmentation_level: str  # Low, Moderate, High, Severe
    connectivity_index: Optional[float] = None
    edge_density: Optional[float] = None
    recommendations: List[str] = Field(default_factory=list)

class TimeSeriesData(BaseModel):
    metric_name: str  # ndvi, evi, temperature, etc.
    timestamps: List[datetime]
    values: List[float]
    location: Dict[str, float]  # lat, lon
    trend: Optional[str] = None  # Increasing, Decreasing, Stable
    change_points: List[Dict[str, Any]] = Field(default_factory=list)
    seasonality: Optional[Dict[str, Any]] = None

class MLPrediction(BaseModel):
    prediction_id: str
    model_type: str  # RandomForest, CNN, UNet, RNN
    input_data: Dict[str, Any]
    prediction: str  # Classification result
    confidence: float = Field(..., ge=0, le=1)
    probability_scores: Dict[str, float] = Field(default_factory=dict)
    feature_importance: Optional[Dict[str, float]] = None
    prediction_date: datetime = Field(default_factory=datetime.now)

class EarthObservationRequest(BaseModel):
    request_id: str
    region: BoundingBox
    start_date: datetime
    end_date: datetime
    data_types: List[str]  # satellite, fire, deforestation, flood, etc.
    resolution: Optional[str] = "medium"  # low, medium, high
    cloud_threshold: float = Field(default=30, ge=0, le=100)
    priority: AlertSeverity = AlertSeverity.MEDIUM

class EarthMonitoringDashboard(BaseModel):
    dashboard_id: str
    region: BoundingBox
    active_alerts: List[Dict[str, Any]] = Field(default_factory=list)
    vegetation_health: Optional[VegetationIndex] = None
    fire_hotspots: List[FireDetection] = Field(default_factory=list)
    deforestation_alerts: List[DeforestationAlert] = Field(default_factory=list)
    weather_anomalies: List[Dict[str, Any]] = Field(default_factory=list)
    crop_status: Optional[CropHealthAnalysis] = None
    last_updated: datetime = Field(default_factory=datetime.now)

# Enhanced existing models with geospatial capabilities
class VitalSigns(BaseModel):
    astronaut_id: str
    timestamp: datetime = Field(default_factory=datetime.now)
    heart_rate: float = Field(..., ge=0, le=300, description="Heart rate in BPM")
    oxygen_level: float = Field(..., ge=0, le=100, description="Oxygen saturation percentage")
    body_temperature: float = Field(..., ge=30, le=45, description="Body temperature in Celsius")
    blood_pressure_systolic: float = Field(..., ge=60, le=250, description="Systolic pressure")
    blood_pressure_diastolic: float = Field(..., ge=40, le=150, description="Diastolic pressure")
    respiratory_rate: float = Field(..., ge=5, le=50, description="Breaths per minute")
    location: Optional[Dict[str, float]] = None  # Current mission location

class Alert(BaseModel):
    id: str
    astronaut_id: str
    alert_type: str
    severity: AlertSeverity
    message: str
    timestamp: datetime = Field(default_factory=datetime.now)
    acknowledged: bool = False
    vital_signs: Optional[VitalSigns] = None

class User(BaseModel):
    username: str
    email: str
    full_name: str
    astronaut_id: Optional[str] = None
    role: str = "astronaut"

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class SpacecraftPosition(BaseModel):
    x: float
    y: float
    z: float
    timestamp: datetime = Field(default_factory=datetime.now)
    velocity_x: float = 0.0
    velocity_y: float = 0.0
    velocity_z: float = 0.0
    heading: float = 0.0  # degrees

class Obstacle(BaseModel):
    id: str
    type: str  # "asteroid", "debris", "satellite"
    position: SpacecraftPosition
    size: float  # radius in meters
    threat_level: AlertSeverity
    predicted_path: List[SpacecraftPosition] = []

class NavigationData(BaseModel):
    spacecraft_position: SpacecraftPosition
    target_destination: Optional[SpacecraftPosition] = None
    obstacles: List[Obstacle] = []
    safe_path: List[SpacecraftPosition] = []
    fuel_level: float = 100.0  # percentage

# Enhanced models for new features
class SpaceWeatherData(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.now)
    solar_wind_speed: float  # km/s
    solar_wind_density: float  # protons/cm³
    kp_index: float  # 0-9 geomagnetic activity index
    solar_flare_class: Optional[str] = None  # A, B, C, M, X classes
    cosmic_radiation_level: float  # percentage
    magnetic_field_strength: float  # nT
    asteroid_alerts: List[str] = []
    weather_severity: AlertSeverity = AlertSeverity.LOW

class MissionLogEntry(BaseModel):
    id: str
    timestamp: datetime = Field(default_factory=datetime.now)
    author: str  # astronaut who created the entry
    title: str
    content: str
    tags: List[str] = []  # Science, Engineering, Emergency, etc.
    priority: AlertSeverity = AlertSeverity.LOW
    is_editable: bool = True
    attachments: List[str] = []  # file paths or URLs

class ChatMessage(BaseModel):
    id: str
    timestamp: datetime = Field(default_factory=datetime.now)
    sender: str
    sender_role: str  # commander, pilot, scientist, ground_control
    content: str
    channel: str = "general"  # general, emergency, science, engineering
    is_private: bool = False
    recipients: List[str] = []  # for private messages
    attachments: List[str] = []

class CrewMember(BaseModel):
    astronaut_id: str
    name: str
    role: str
    status: str = "active"  # active, resting, emergency, offline
    current_task: Optional[str] = None
    location: str = "spacecraft"  # spacecraft, eva, station
    vitals: Optional[VitalSigns] = None
    last_activity: datetime = Field(default_factory=datetime.now)

class EmergencyProtocol(BaseModel):
    id: str
    name: str
    description: str
    steps: List[str]
    required_roles: List[str]
    is_active: bool = False
    activated_by: Optional[str] = None
    activation_time: Optional[datetime] = None

class ResourceAllocation(BaseModel):
    resource_type: str  # power, oxygen, fuel, water
    total_capacity: float
    current_level: float
    consumption_rate: float  # per hour
    allocations: dict  # {system_name: allocated_amount}
    critical_threshold: float = 20.0  # percentage

class Experiment(BaseModel):
    id: str
    name: str
    description: str
    assigned_to: str
    status: str = "planned"  # planned, running, completed, failed
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    progress: float = 0.0  # percentage
    results: dict = {}
    samples: List[str] = []
    research_points: int = 0

class FlightControl(BaseModel):
    thrust_x: float = 0.0  # -100 to 100
    thrust_y: float = 0.0
    thrust_z: float = 0.0
    rotation_pitch: float = 0.0  # degrees
    rotation_yaw: float = 0.0
    rotation_roll: float = 0.0
    autopilot_enabled: bool = False
    target_destination: Optional[SpacecraftPosition] = None
    fuel_efficiency_mode: bool = False

class VoiceCommand(BaseModel):
    command: str
    intent: str  # navigation, vitals, emergency, etc.
    parameters: dict = {}
    confidence: float = 0.0  # 0-1
    timestamp: datetime = Field(default_factory=datetime.now)
    user: str
    executed: bool = False
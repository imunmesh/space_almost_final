"""
NASA Mission Control Center
Advanced mission control system with real-time telemetry, flight dynamics, and mission operations
Designed for NASA-grade operations and compliance with NASA standards
"""

import asyncio
import numpy as np
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import logging
from astropy import units as u
from astropy.coordinates import EarthLocation, AltAz, get_sun
from astropy.time import Time
import math
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MissionPhase(Enum):
    """Mission phases following NASA mission lifecycle"""
    PRE_LAUNCH = "PRE_LAUNCH"
    LAUNCH = "LAUNCH"
    ASCENT = "ASCENT"
    ORBIT_INSERTION = "ORBIT_INSERTION"
    ON_ORBIT = "ON_ORBIT"
    RENDEZVOUS = "RENDEZVOUS"
    DOCKING = "DOCKING"
    OPERATIONS = "OPERATIONS"
    UNDOCKING = "UNDOCKING"
    DEORBIT = "DEORBIT"
    REENTRY = "REENTRY"
    LANDING = "LANDING"
    POST_MISSION = "POST_MISSION"

class SystemStatus(Enum):
    """System status levels"""
    NOMINAL = "NOMINAL"
    CAUTION = "CAUTION" 
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"
    EMERGENCY = "EMERGENCY"

@dataclass
class TelemetryFrame:
    """NASA-standard telemetry frame structure"""
    timestamp: str
    mission_elapsed_time: float
    spacecraft_id: str
    frame_sequence: int
    data_quality: float
    
    # Orbital parameters
    altitude: float  # km
    velocity: float  # km/s
    latitude: float  # degrees
    longitude: float  # degrees
    orbital_period: float  # minutes
    
    # Attitude data
    roll: float  # degrees
    pitch: float  # degrees
    yaw: float  # degrees
    angular_velocity_x: float  # deg/s
    angular_velocity_y: float  # deg/s
    angular_velocity_z: float  # deg/s
    
    # Systems health
    power_level: float  # percentage
    battery_voltage: float  # volts
    solar_panel_current: float  # amps
    fuel_remaining: float  # percentage
    pressurization: float  # psi
    temperature_internal: float  # celsius
    temperature_external: float  # celsius
    
    # Communications
    signal_strength: float  # dB
    data_rate: float  # Mbps
    communication_delay: float  # seconds
    
    # Mission-specific
    mission_phase: str
    system_status: str
    crew_count: int
    experiment_status: str

@dataclass
class GroundStation:
    """Ground station configuration"""
    name: str
    location: EarthLocation
    frequency: float  # MHz
    max_elevation: float  # degrees
    tracking_capability: bool
    uplink_power: float  # watts
    antenna_diameter: float  # meters

@dataclass
class FlightPlan:
    """Mission flight plan structure"""
    mission_id: str
    launch_time: datetime
    duration: timedelta
    target_orbit: Dict[str, float]
    waypoints: List[Dict[str, Any]]
    contingency_plans: List[Dict[str, Any]]

class NASAMissionControl:
    """
    NASA Mission Control Center
    Provides comprehensive mission monitoring and control capabilities
    """
    
    def __init__(self):
        self.mission_data = {}
        self.telemetry_buffer = []
        self.max_buffer_size = 10000
        self.is_active = False
        self.current_mission = None
        self.ground_stations = self._initialize_ground_stations()
        self.flight_dynamics = FlightDynamicsComputer()
        self.mission_timeline = []
        self.alerts = []
        
        # Mission Control Room configurations
        self.flight_director_station = FlightDirectorConsole()
        self.capcom_station = CAPCOMConsole()
        self.eecom_station = EECOMConsole()  # Electrical and Environmental
        self.fido_station = FIDOConsole()    # Flight Dynamics Officer
        self.guidance_station = GuidanceConsole()
        
        logger.info("NASA Mission Control Center initialized")

    def _initialize_ground_stations(self) -> List[GroundStation]:
        """Initialize NASA Deep Space Network stations"""
        stations = [
            GroundStation(
                name="Goldstone (DSS-14)",
                location=EarthLocation(lat=35.4267*u.deg, lon=-116.8900*u.deg, height=1036*u.m),
                frequency=2200.0,  # MHz
                max_elevation=85.0,
                tracking_capability=True,
                uplink_power=20000,  # 20kW
                antenna_diameter=70.0  # 70m
            ),
            GroundStation(
                name="Madrid (DSS-63)",
                location=EarthLocation(lat=40.4275*u.deg, lon=-4.2508*u.deg, height=837*u.m),
                frequency=2200.0,
                max_elevation=85.0,
                tracking_capability=True,
                uplink_power=20000,
                antenna_diameter=70.0
            ),
            GroundStation(
                name="Canberra (DSS-43)",
                location=EarthLocation(lat=-35.4019*u.deg, lon=148.9819*u.deg, height=691*u.m),
                frequency=2200.0,
                max_elevation=85.0,
                tracking_capability=True,
                uplink_power=20000,
                antenna_diameter=70.0
            ),
            GroundStation(
                name="Kennedy Space Center",
                location=EarthLocation(lat=28.5721*u.deg, lon=-80.6480*u.deg, height=10*u.m),
                frequency=2287.5,
                max_elevation=90.0,
                tracking_capability=True,
                uplink_power=5000,
                antenna_diameter=26.0
            )
        ]
        return stations
    
    async def start_mission(self, mission_config: Dict[str, Any]) -> Dict[str, Any]:
        """Start a new mission with NASA-standard procedures"""
        try:
            mission_id = mission_config.get('mission_id', f"NASA-{datetime.now().strftime('%Y%m%d%H%M')}")
            
            # Initialize mission
            self.current_mission = {
                'id': mission_id,
                'start_time': datetime.now(),
                'config': mission_config,
                'phase': MissionPhase.PRE_LAUNCH,
                'status': SystemStatus.NOMINAL,
                'met': 0.0  # Mission Elapsed Time
            }
            
            # Pre-launch checklist
            checklist_result = await self._execute_prelaunch_checklist()
            
            if checklist_result['ready']:
                self.is_active = True
                logger.info(f"Mission {mission_id} started successfully")
                
                # Start telemetry streaming
                asyncio.create_task(self._telemetry_stream())
                
                return {
                    'status': 'success',
                    'mission_id': mission_id,
                    'message': 'Mission started successfully',
                    'checklist': checklist_result
                }
            else:
                return {
                    'status': 'error',
                    'message': 'Pre-launch checklist failed',
                    'issues': checklist_result['issues']
                }
                
        except Exception as e:
            logger.error(f"Failed to start mission: {e}")
            return {'status': 'error', 'message': str(e)}
    
    async def _execute_prelaunch_checklist(self) -> Dict[str, Any]:
        """Execute NASA-standard pre-launch checklist"""
        checklist = {
            'vehicle_systems': await self._check_vehicle_systems(),
            'ground_systems': await self._check_ground_systems(),
            'weather_conditions': await self._check_weather(),
            'crew_readiness': await self._check_crew_readiness(),
            'range_safety': await self._check_range_safety(),
            'telemetry_systems': await self._check_telemetry_systems()
        }
        
        all_ready = all(check['status'] == 'GO' for check in checklist.values())
        issues = [check['issue'] for check in checklist.values() if check['status'] != 'GO']
        
        return {
            'ready': all_ready,
            'checklist': checklist,
            'issues': issues
        }
    
    async def _check_vehicle_systems(self) -> Dict[str, Any]:
        """Check spacecraft vehicle systems"""
        # Simulate comprehensive vehicle check
        systems = ['propulsion', 'power', 'life_support', 'navigation', 'communication']
        status = random.choice(['GO', 'GO', 'GO', 'HOLD'])  # Mostly GO
        
        return {
            'status': status,
            'systems': systems,
            'issue': 'Propulsion system pressure low' if status == 'HOLD' else None
        }
    
    async def _check_ground_systems(self) -> Dict[str, Any]:
        """Check ground support systems"""
        return {
            'status': 'GO',
            'dsn_status': 'NOMINAL',
            'tracking_ready': True
        }
    
    async def _check_weather(self) -> Dict[str, Any]:
        """Check weather conditions"""
        # Simulate weather check
        conditions = random.choice(['FAVORABLE', 'MARGINAL', 'NO-GO'])
        return {
            'status': 'GO' if conditions in ['FAVORABLE', 'MARGINAL'] else 'NO-GO',
            'conditions': conditions,
            'issue': 'Severe weather at launch site' if conditions == 'NO-GO' else None
        }
    
    async def _check_crew_readiness(self) -> Dict[str, Any]:
        """Check crew readiness status"""
        return {
            'status': 'GO',
            'crew_health': 'NOMINAL',
            'training_complete': True
        }
    
    async def _check_range_safety(self) -> Dict[str, Any]:
        """Check range safety systems"""
        return {
            'status': 'GO',
            'flight_termination_system': 'ARMED',
            'tracking_systems': 'OPERATIONAL'
        }
    
    async def _check_telemetry_systems(self) -> Dict[str, Any]:
        """Check telemetry and communication systems"""
        return {
            'status': 'GO',
            'ground_stations': [station.name for station in self.ground_stations],
            'signal_quality': 'STRONG'
        }
    
    async def _telemetry_stream(self):
        """Generate and stream real-time telemetry data"""
        frame_sequence = 0
        
        while self.is_active:
            try:
                # Generate telemetry frame
                telemetry = self._generate_telemetry_frame(frame_sequence)
                
                # Add to buffer
                self.telemetry_buffer.append(telemetry)
                if len(self.telemetry_buffer) > self.max_buffer_size:
                    self.telemetry_buffer.pop(0)
                
                # Process telemetry
                await self._process_telemetry(telemetry)
                
                frame_sequence += 1
                await asyncio.sleep(1.0)  # 1 Hz telemetry rate
                
            except Exception as e:
                logger.error(f"Telemetry stream error: {e}")
                await asyncio.sleep(5.0)
    
    def _generate_telemetry_frame(self, sequence: int) -> TelemetryFrame:
        """Generate realistic telemetry frame"""
        if not self.current_mission:
            return None
        
        # Calculate Mission Elapsed Time
        met = (datetime.now() - self.current_mission['start_time']).total_seconds()
        self.current_mission['met'] = met
        
        # Simulate orbital mechanics
        orbital_data = self._simulate_orbital_motion(met)
        
        # Generate telemetry frame
        telemetry = TelemetryFrame(
            timestamp=datetime.now().isoformat(),
            mission_elapsed_time=met,
            spacecraft_id=self.current_mission['id'],
            frame_sequence=sequence,
            data_quality=random.uniform(0.95, 1.0),
            
            # Orbital parameters
            altitude=orbital_data['altitude'],
            velocity=orbital_data['velocity'],
            latitude=orbital_data['latitude'],
            longitude=orbital_data['longitude'],
            orbital_period=orbital_data['period'],
            
            # Attitude (simulate stable flight)
            roll=random.uniform(-2.0, 2.0),
            pitch=random.uniform(-1.5, 1.5),
            yaw=random.uniform(-2.0, 2.0),
            angular_velocity_x=random.uniform(-0.1, 0.1),
            angular_velocity_y=random.uniform(-0.1, 0.1),
            angular_velocity_z=random.uniform(-0.1, 0.1),
            
            # Systems health
            power_level=max(70, 100 - (met / 3600) * 0.5),  # Gradual power decrease
            battery_voltage=random.uniform(27.5, 28.5),
            solar_panel_current=random.uniform(12.0, 15.0),
            fuel_remaining=max(20, 100 - (met / 3600) * 0.2),
            pressurization=random.uniform(14.2, 14.8),
            temperature_internal=random.uniform(20.0, 24.0),
            temperature_external=random.uniform(-150.0, 120.0),
            
            # Communications
            signal_strength=random.uniform(-85, -75),
            data_rate=random.uniform(1.5, 2.0),
            communication_delay=random.uniform(0.1, 1.2),
            
            # Mission-specific
            mission_phase=self._determine_mission_phase(met),
            system_status=self._determine_system_status(),
            crew_count=self.current_mission['config'].get('crew_count', 3),
            experiment_status="ACTIVE"
        )
        
        return telemetry
    
    def _simulate_orbital_motion(self, met: float) -> Dict[str, float]:
        """Simulate realistic orbital motion"""
        # ISS-like orbit parameters
        earth_radius = 6371.0  # km
        orbital_altitude = 408.0  # km average ISS altitude
        orbital_velocity = 7.66  # km/s
        orbital_period = 92.68  # minutes
        
        # Calculate position based on time
        angular_position = (met / 60.0) * (360.0 / orbital_period)  # degrees
        
        # Simulate latitude oscillation (-51.6 to +51.6 degrees like ISS)
        latitude = 51.6 * math.sin(math.radians(angular_position))
        
        # Longitude precession
        longitude = (angular_position * 4.0) % 360.0  # Earth rotation effect
        if longitude > 180:
            longitude -= 360
        
        # Add realistic variations
        altitude_variation = random.uniform(-5.0, 5.0)
        
        return {
            'altitude': orbital_altitude + altitude_variation,
            'velocity': orbital_velocity + random.uniform(-0.1, 0.1),
            'latitude': latitude,
            'longitude': longitude,
            'period': orbital_period
        }
    
    def _determine_mission_phase(self, met: float) -> str:
        """Determine current mission phase based on elapsed time"""
        if met < 600:  # First 10 minutes
            return MissionPhase.LAUNCH.value
        elif met < 3600:  # First hour
            return MissionPhase.ASCENT.value
        elif met < 7200:  # First 2 hours
            return MissionPhase.ORBIT_INSERTION.value
        else:
            return MissionPhase.ON_ORBIT.value
    
    def _determine_system_status(self) -> str:
        """Determine overall system status"""
        # Simulate mostly nominal with occasional warnings
        statuses = [
            SystemStatus.NOMINAL.value,
            SystemStatus.NOMINAL.value,
            SystemStatus.NOMINAL.value,
            SystemStatus.CAUTION.value
        ]
        return random.choice(statuses)
    
    async def _process_telemetry(self, telemetry: TelemetryFrame):
        """Process incoming telemetry for alerts and analysis"""
        # Check for anomalies
        alerts = []
        
        # Power system checks
        if telemetry.power_level < 30:
            alerts.append({
                'level': 'WARNING',
                'system': 'POWER',
                'message': f'Low power level: {telemetry.power_level:.1f}%',
                'timestamp': telemetry.timestamp
            })
        
        # Fuel checks
        if telemetry.fuel_remaining < 25:
            alerts.append({
                'level': 'CAUTION',
                'system': 'PROPULSION',
                'message': f'Low fuel: {telemetry.fuel_remaining:.1f}%',
                'timestamp': telemetry.timestamp
            })
        
        # Communication checks
        if telemetry.signal_strength < -90:
            alerts.append({
                'level': 'WARNING',
                'system': 'COMMUNICATION',
                'message': f'Weak signal: {telemetry.signal_strength:.1f} dB',
                'timestamp': telemetry.timestamp
            })
        
        # Add alerts to mission log
        self.alerts.extend(alerts)
        
        # Keep only recent alerts (last 100)
        if len(self.alerts) > 100:
            self.alerts = self.alerts[-100:]
    
    async def get_mission_status(self) -> Dict[str, Any]:
        """Get comprehensive mission status"""
        if not self.current_mission:
            return {'status': 'No active mission'}
        
        current_telemetry = self.telemetry_buffer[-1] if self.telemetry_buffer else None
        
        return {
            'mission': self.current_mission,
            'current_telemetry': asdict(current_telemetry) if current_telemetry else None,
            'recent_alerts': self.alerts[-10:],  # Last 10 alerts
            'ground_stations': [station.name for station in self.ground_stations],
            'is_active': self.is_active
        }
    
    async def get_telemetry_history(self, duration_minutes: int = 60) -> List[Dict[str, Any]]:
        """Get telemetry history for specified duration"""
        cutoff_time = datetime.now() - timedelta(minutes=duration_minutes)
        
        filtered_telemetry = [
            asdict(frame) for frame in self.telemetry_buffer
            if datetime.fromisoformat(frame.timestamp) > cutoff_time
        ]
        
        return filtered_telemetry
    
    async def execute_command(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Execute mission command through proper channels"""
        command_type = command.get('type')
        
        if command_type == 'attitude_adjustment':
            return await self._execute_attitude_command(command)
        elif command_type == 'orbit_maneuver':
            return await self._execute_orbit_maneuver(command)
        elif command_type == 'system_command':
            return await self._execute_system_command(command)
        else:
            return {'status': 'error', 'message': 'Unknown command type'}
    
    async def _execute_attitude_command(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Execute attitude adjustment command"""
        logger.info(f"Executing attitude command: {command}")
        
        # Simulate command execution
        await asyncio.sleep(2.0)  # Command propagation delay
        
        return {
            'status': 'success',
            'command': command,
            'execution_time': datetime.now().isoformat(),
            'message': 'Attitude adjustment completed'
        }
    
    async def _execute_orbit_maneuver(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Execute orbital maneuver"""
        logger.info(f"Executing orbit maneuver: {command}")
        
        # Simulate maneuver execution
        await asyncio.sleep(5.0)  # Maneuver duration
        
        return {
            'status': 'success',
            'command': command,
            'execution_time': datetime.now().isoformat(),
            'delta_v': command.get('delta_v', 0),
            'message': 'Orbital maneuver completed'
        }
    
    async def _execute_system_command(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Execute system command"""
        logger.info(f"Executing system command: {command}")
        
        await asyncio.sleep(1.0)
        
        return {
            'status': 'success',
            'command': command,
            'execution_time': datetime.now().isoformat(),
            'message': 'System command executed'
        }
    
    async def stop_mission(self) -> Dict[str, Any]:
        """Stop current mission"""
        if self.current_mission:
            self.current_mission['end_time'] = datetime.now()
            mission_duration = self.current_mission['end_time'] - self.current_mission['start_time']
            
            logger.info(f"Mission {self.current_mission['id']} ended after {mission_duration}")
            
            self.is_active = False
            
            return {
                'status': 'success',
                'mission_id': self.current_mission['id'],
                'duration': str(mission_duration),
                'final_telemetry': asdict(self.telemetry_buffer[-1]) if self.telemetry_buffer else None
            }
        
        return {'status': 'error', 'message': 'No active mission'}


class FlightDynamicsComputer:
    """Flight Dynamics Computer for trajectory analysis"""
    
    def __init__(self):
        self.orbital_elements = {}
        self.trajectory_predictions = []
    
    def calculate_orbital_elements(self, position: np.ndarray, velocity: np.ndarray) -> Dict[str, float]:
        """Calculate Keplerian orbital elements"""
        # Simplified orbital elements calculation
        mu = 3.986004418e14  # Earth's gravitational parameter (m^3/s^2)
        
        r = np.linalg.norm(position)
        v = np.linalg.norm(velocity)
        
        # Energy
        energy = (v**2)/2 - mu/r
        
        # Semi-major axis
        a = -mu/(2*energy)
        
        # Angular momentum
        h_vec = np.cross(position, velocity)
        h = np.linalg.norm(h_vec)
        
        # Eccentricity
        e = np.sqrt(1 + (2*energy*h**2)/(mu**2))
        
        # Inclination
        i = np.arccos(h_vec[2]/h)
        
        return {
            'semi_major_axis': a/1000,  # km
            'eccentricity': e,
            'inclination': np.degrees(i),
            'period': 2*np.pi*np.sqrt(a**3/mu)/60  # minutes
        }


class FlightDirectorConsole:
    """Flight Director Console for mission oversight"""
    
    def __init__(self):
        self.decisions = []
        self.go_no_go_status = {}
    
    def make_go_no_go_decision(self, system: str, status: str) -> Dict[str, Any]:
        """Make GO/NO-GO decision for mission systems"""
        decision = {
            'timestamp': datetime.now().isoformat(),
            'system': system,
            'decision': status,
            'flight_director': 'FLIGHT'
        }
        
        self.decisions.append(decision)
        self.go_no_go_status[system] = status
        
        return decision


class CAPCOMConsole:
    """Capsule Communicator Console"""
    
    def __init__(self):
        self.communications_log = []
    
    def send_message_to_crew(self, message: str) -> Dict[str, Any]:
        """Send message to crew"""
        comm = {
            'timestamp': datetime.now().isoformat(),
            'direction': 'UPLINK',
            'message': message,
            'operator': 'CAPCOM'
        }
        
        self.communications_log.append(comm)
        return comm


class EECOMConsole:
    """Electrical and Environmental Command Officer Console"""
    
    def __init__(self):
        self.system_status = {}
    
    def monitor_life_support(self) -> Dict[str, Any]:
        """Monitor life support systems"""
        return {
            'oxygen_partial_pressure': random.uniform(19.5, 23.0),  # kPa
            'co2_level': random.uniform(0.1, 0.4),  # %
            'cabin_pressure': random.uniform(14.2, 14.8),  # psi
            'humidity': random.uniform(40, 60),  # %
            'temperature': random.uniform(18, 24)  # celsius
        }


class FIDOConsole:
    """Flight Dynamics Officer Console"""
    
    def __init__(self):
        self.trajectory_data = []
    
    def calculate_maneuver(self, target_orbit: Dict[str, float]) -> Dict[str, Any]:
        """Calculate orbital maneuver"""
        return {
            'delta_v_total': random.uniform(5.0, 50.0),  # m/s
            'burn_duration': random.uniform(30, 300),  # seconds
            'maneuver_angle': random.uniform(0, 360),  # degrees
            'fuel_required': random.uniform(10, 100)  # kg
        }


class GuidanceConsole:
    """Guidance, Navigation and Control Console"""
    
    def __init__(self):
        self.navigation_data = {}
    
    def update_navigation_solution(self) -> Dict[str, Any]:
        """Update navigation solution"""
        return {
            'position_accuracy': random.uniform(1.0, 5.0),  # meters
            'velocity_accuracy': random.uniform(0.001, 0.005),  # m/s
            'attitude_accuracy': random.uniform(0.1, 0.5),  # degrees
            'gps_satellites': random.randint(8, 12),
            'navigation_mode': 'GPS_PRIMARY'
        }


# Initialize mission control
mission_control = NASAMissionControl()
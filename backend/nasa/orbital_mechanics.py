"""
NASA Orbital Mechanics Calculator
Advanced orbital dynamics and trajectory planning system
Provides industry-standard calculations for mission planning
"""

import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
import math
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
EARTH_MU = 3.986004418e14  # m^3/s^2 (Earth's gravitational parameter)
EARTH_RADIUS = 6.378137e6  # m (Earth's equatorial radius)
EARTH_J2 = 1.08262982e-3   # Earth's J2 perturbation coefficient
SIDEREAL_DAY = 86164.0905  # seconds (Earth's sidereal day)

@dataclass
class OrbitalElements:
    """Keplerian orbital elements"""
    semi_major_axis: float      # m
    eccentricity: float         # dimensionless
    inclination: float          # radians
    raan: float                 # radians (Right Ascension of Ascending Node)
    argument_of_perigee: float  # radians
    true_anomaly: float         # radians
    epoch: datetime             # reference time

@dataclass
class StateVector:
    """Position and velocity state vector"""
    position: np.ndarray  # m (x, y, z in ECI frame)
    velocity: np.ndarray  # m/s (vx, vy, vz in ECI frame)
    epoch: datetime

@dataclass
class ManeuverPlan:
    """Orbital maneuver plan"""
    maneuver_id: str
    delta_v: np.ndarray        # m/s (velocity change vector)
    execution_time: datetime
    burn_duration: float       # seconds
    fuel_required: float       # kg
    target_elements: OrbitalElements

@dataclass
class TrajectoryPoint:
    """Single point in trajectory"""
    time: datetime
    position: np.ndarray  # m
    velocity: np.ndarray  # m/s
    altitude: float       # m
    latitude: float       # degrees
    longitude: float      # degrees

class OrbitalMechanicsCalculator:
    """
    Advanced orbital mechanics calculator for NASA-grade mission planning
    """
    
    def __init__(self):
        self.current_orbit = None
        self.trajectory_cache = {}
        self.maneuver_plans = []
        logger.info("Orbital Mechanics Calculator initialized")
    
    def cartesian_to_orbital_elements(self, state: StateVector) -> OrbitalElements:
        """Convert Cartesian state vector to Keplerian orbital elements"""
        r_vec = state.position
        v_vec = state.velocity
        
        r = np.linalg.norm(r_vec)
        v = np.linalg.norm(v_vec)
        
        # Angular momentum vector
        h_vec = np.cross(r_vec, v_vec)
        h = np.linalg.norm(h_vec)
        
        # Node vector
        n_vec = np.cross([0, 0, 1], h_vec)
        n = np.linalg.norm(n_vec)
        
        # Eccentricity vector
        e_vec = ((v**2 - EARTH_MU/r) * r_vec - np.dot(r_vec, v_vec) * v_vec) / EARTH_MU
        e = np.linalg.norm(e_vec)
        
        # Specific energy
        energy = v**2/2 - EARTH_MU/r
        
        # Semi-major axis
        if abs(e - 1.0) > 1e-6:  # Not parabolic
            a = -EARTH_MU / (2 * energy)
        else:
            a = float('inf')  # Parabolic orbit
        
        # Inclination
        i = np.arccos(h_vec[2] / h)
        
        # Right Ascension of Ascending Node (RAAN)
        if n > 1e-6:
            raan = np.arccos(n_vec[0] / n)
            if n_vec[1] < 0:
                raan = 2*np.pi - raan
        else:
            raan = 0.0
        
        # Argument of Perigee
        if n > 1e-6 and e > 1e-6:
            arg_pe = np.arccos(np.dot(n_vec, e_vec) / (n * e))
            if e_vec[2] < 0:
                arg_pe = 2*np.pi - arg_pe
        else:
            arg_pe = 0.0
        
        # True Anomaly
        if e > 1e-6:
            nu = np.arccos(np.dot(e_vec, r_vec) / (e * r))
            if np.dot(r_vec, v_vec) < 0:
                nu = 2*np.pi - nu
        else:
            # Circular orbit - use argument of latitude
            nu = np.arccos(np.dot(n_vec, r_vec) / (n * r))
            if r_vec[2] < 0:
                nu = 2*np.pi - nu
        
        return OrbitalElements(
            semi_major_axis=a,
            eccentricity=e,
            inclination=i,
            raan=raan,
            argument_of_perigee=arg_pe,
            true_anomaly=nu,
            epoch=state.epoch
        )
    
    def orbital_elements_to_cartesian(self, elements: OrbitalElements) -> StateVector:
        """Convert Keplerian orbital elements to Cartesian state vector"""
        a = elements.semi_major_axis
        e = elements.eccentricity
        i = elements.inclination
        raan = elements.raan
        arg_pe = elements.argument_of_perigee
        nu = elements.true_anomaly
        
        # Distance from focus
        r = a * (1 - e**2) / (1 + e * np.cos(nu))
        
        # Position and velocity in perifocal frame
        r_pf = np.array([r * np.cos(nu), r * np.sin(nu), 0])
        
        # Velocity magnitude
        v_mag = np.sqrt(EARTH_MU * (2/r - 1/a)) if a > 0 else np.sqrt(2*EARTH_MU/r)
        
        # Velocity components in perifocal frame
        v_pf = np.array([
            -np.sqrt(EARTH_MU/a/(1-e**2)) * np.sin(nu),
            np.sqrt(EARTH_MU/a/(1-e**2)) * (e + np.cos(nu)),
            0
        ]) if a > 0 else np.array([
            -np.sqrt(EARTH_MU/r) * np.sin(nu),
            np.sqrt(EARTH_MU/r) * (1 + np.cos(nu)),
            0
        ])
        
        # Rotation matrices
        R3_raan = self._rotation_matrix_z(-raan)
        R1_inc = self._rotation_matrix_x(-i)
        R3_arg_pe = self._rotation_matrix_z(-arg_pe)
        
        # Combined rotation matrix (perifocal to ECI)
        R_pf_to_eci = R3_raan @ R1_inc @ R3_arg_pe
        
        # Transform to ECI frame
        r_eci = R_pf_to_eci @ r_pf
        v_eci = R_pf_to_eci @ v_pf
        
        return StateVector(
            position=r_eci,
            velocity=v_eci,
            epoch=elements.epoch
        )
    
    def _rotation_matrix_x(self, angle: float) -> np.ndarray:
        """Rotation matrix about X-axis"""
        c, s = np.cos(angle), np.sin(angle)
        return np.array([[1, 0, 0], [0, c, s], [0, -s, c]])
    
    def _rotation_matrix_z(self, angle: float) -> np.ndarray:
        """Rotation matrix about Z-axis"""
        c, s = np.cos(angle), np.sin(angle)
        return np.array([[c, s, 0], [-s, c, 0], [0, 0, 1]])
    
    def propagate_orbit(self, state: StateVector, duration: timedelta) -> List[TrajectoryPoint]:
        """Propagate orbit forward in time using numerical integration"""
        dt = 60.0  # 1-minute time steps
        total_seconds = duration.total_seconds()
        n_steps = int(total_seconds / dt)
        
        trajectory = []
        current_state = StateVector(
            position=state.position.copy(),
            velocity=state.velocity.copy(),
            epoch=state.epoch
        )
        
        for i in range(n_steps + 1):
            # Convert to lat/lon/alt for output
            lat, lon, alt = self._eci_to_lla(current_state.position, current_state.epoch)
            
            trajectory.append(TrajectoryPoint(
                time=current_state.epoch,
                position=current_state.position.copy(),
                velocity=current_state.velocity.copy(),
                altitude=alt,
                latitude=lat,
                longitude=lon
            ))
            
            if i < n_steps:
                # Runge-Kutta 4th order integration
                current_state = self._rk4_step(current_state, dt)
                current_state.epoch += timedelta(seconds=dt)
        
        return trajectory
    
    def _rk4_step(self, state: StateVector, dt: float) -> StateVector:
        """Single step of 4th-order Runge-Kutta integration"""
        r0, v0 = state.position, state.velocity
        
        # k1
        a1 = self._acceleration(r0)
        k1_r = v0 * dt
        k1_v = a1 * dt
        
        # k2
        r1 = r0 + k1_r/2
        v1 = v0 + k1_v/2
        a2 = self._acceleration(r1)
        k2_r = v1 * dt
        k2_v = a2 * dt
        
        # k3
        r2 = r0 + k2_r/2
        v2 = v0 + k2_v/2
        a3 = self._acceleration(r2)
        k3_r = v2 * dt
        k3_v = a3 * dt
        
        # k4
        r3 = r0 + k3_r
        v3 = v0 + k3_v
        a4 = self._acceleration(r3)
        k4_r = v3 * dt
        k4_v = a4 * dt
        
        # Final step
        r_new = r0 + (k1_r + 2*k2_r + 2*k3_r + k4_r) / 6
        v_new = v0 + (k1_v + 2*k2_v + 2*k3_v + k4_v) / 6
        
        return StateVector(
            position=r_new,
            velocity=v_new,
            epoch=state.epoch
        )
    
    def _acceleration(self, position: np.ndarray) -> np.ndarray:
        """Calculate acceleration including J2 perturbation"""
        r = np.linalg.norm(position)
        
        # Two-body acceleration
        a_2body = -EARTH_MU * position / r**3
        
        # J2 perturbation
        x, y, z = position
        r_eq = EARTH_RADIUS
        
        j2_factor = 1.5 * EARTH_J2 * EARTH_MU * r_eq**2 / r**5
        
        a_j2 = j2_factor * np.array([
            x * (5 * z**2 / r**2 - 1),
            y * (5 * z**2 / r**2 - 1),
            z * (5 * z**2 / r**2 - 3)
        ])
        
        return a_2body + a_j2
    
    def _eci_to_lla(self, position: np.ndarray, epoch: datetime) -> Tuple[float, float, float]:
        """Convert ECI position to latitude, longitude, altitude"""
        x, y, z = position
        r = np.linalg.norm(position)
        
        # Altitude
        altitude = r - EARTH_RADIUS
        
        # Latitude
        latitude = np.arcsin(z / r) * 180 / np.pi
        
        # Longitude (account for Earth rotation)
        lon_rad = np.arctan2(y, x)
        
        # Greenwich Mean Sidereal Time
        j2000_epoch = datetime(2000, 1, 1, 12, 0, 0)
        days_since_j2000 = (epoch - j2000_epoch).total_seconds() / 86400.0
        gmst = (18.697374558 + 24.06570982441908 * days_since_j2000) % 24
        gmst_rad = gmst * np.pi / 12
        
        longitude = (lon_rad - gmst_rad) * 180 / np.pi
        
        # Normalize longitude to [-180, 180]
        while longitude > 180:
            longitude -= 360
        while longitude < -180:
            longitude += 360
        
        return latitude, longitude, altitude
    
    def calculate_hohmann_transfer(self, r1: float, r2: float) -> Dict[str, float]:
        """Calculate Hohmann transfer orbit parameters"""
        # Semi-major axis of transfer orbit
        a_transfer = (r1 + r2) / 2
        
        # Delta-V for first burn (at r1)
        v1_circular = np.sqrt(EARTH_MU / r1)
        v1_transfer = np.sqrt(EARTH_MU * (2/r1 - 1/a_transfer))
        dv1 = v1_transfer - v1_circular
        
        # Delta-V for second burn (at r2)
        v2_circular = np.sqrt(EARTH_MU / r2)
        v2_transfer = np.sqrt(EARTH_MU * (2/r2 - 1/a_transfer))
        dv2 = v2_circular - v2_transfer
        
        # Transfer time
        transfer_time = np.pi * np.sqrt(a_transfer**3 / EARTH_MU)
        
        # Phase angle
        phase_angle = np.pi * (1 - ((r1 + r2) / (2 * r2))**(3/2))
        
        return {
            'delta_v_1': dv1,
            'delta_v_2': dv2,
            'total_delta_v': abs(dv1) + abs(dv2),
            'transfer_time': transfer_time / 3600,  # hours
            'phase_angle': np.degrees(phase_angle),
            'transfer_orbit_apogee': r2,
            'transfer_orbit_perigee': r1
        }
    
    def calculate_plane_change_maneuver(self, v: float, delta_i: float) -> Dict[str, float]:
        """Calculate plane change maneuver delta-V"""
        delta_v = 2 * v * np.sin(delta_i / 2)
        
        return {
            'delta_v': delta_v,
            'delta_inclination': np.degrees(delta_i),
            'fuel_fraction': delta_v / (9.81 * 450)  # Assuming Isp = 450s
        }
    
    def optimize_launch_window(self, target_elements: OrbitalElements, 
                             launch_site_lat: float, 
                             search_days: int = 30) -> List[Dict[str, Any]]:
        """Find optimal launch windows for target orbit"""
        launch_windows = []
        
        # Launch site parameters
        launch_site_lat_rad = np.radians(launch_site_lat)
        
        # Search for launch opportunities
        base_time = datetime.now()
        
        for day in range(search_days):
            search_date = base_time + timedelta(days=day)
            
            # Check multiple times per day
            for hour in range(0, 24, 2):  # Every 2 hours
                launch_time = search_date.replace(hour=hour, minute=0, second=0)
                
                # Calculate launch azimuth
                azimuth = self._calculate_launch_azimuth(
                    launch_site_lat_rad, 
                    target_elements.inclination,
                    target_elements.raan,
                    launch_time
                )
                
                if azimuth is not None:  # Valid launch opportunity
                    # Calculate delta-V requirements
                    dv_gravity_loss = 1500  # m/s (typical)
                    dv_drag_loss = 200     # m/s (typical)
                    dv_steering_loss = 100  # m/s (typical)
                    
                    orbit_velocity = np.sqrt(EARTH_MU / target_elements.semi_major_axis)
                    dv_orbit_insertion = orbit_velocity - np.sqrt(EARTH_MU / EARTH_RADIUS)
                    
                    total_dv = dv_orbit_insertion + dv_gravity_loss + dv_drag_loss + dv_steering_loss
                    
                    launch_windows.append({
                        'launch_time': launch_time.isoformat(),
                        'azimuth': np.degrees(azimuth),
                        'delta_v_required': total_dv,
                        'orbit_insertion_dv': dv_orbit_insertion,
                        'window_score': self._score_launch_window(launch_time, azimuth, total_dv)
                    })
        
        # Sort by score (best first)
        launch_windows.sort(key=lambda x: x['window_score'], reverse=True)
        
        return launch_windows[:10]  # Return top 10 windows
    
    def _calculate_launch_azimuth(self, lat: float, inc: float, raan: float, 
                                 launch_time: datetime) -> Optional[float]:
        """Calculate launch azimuth for given parameters"""
        # Check if orbit is accessible from launch site
        if inc < abs(lat):
            return None  # Orbit not accessible
        
        # Calculate local sidereal time
        gmst = self._calculate_gmst(launch_time)
        
        # Simplified azimuth calculation
        sin_az = np.cos(inc) / np.cos(lat)
        
        if abs(sin_az) > 1:
            return None  # Not achievable
        
        azimuth = np.arcsin(sin_az)
        
        return azimuth
    
    def _calculate_gmst(self, dt: datetime) -> float:
        """Calculate Greenwich Mean Sidereal Time"""
        j2000 = datetime(2000, 1, 1, 12, 0, 0)
        days = (dt - j2000).total_seconds() / 86400.0
        
        gmst = 18.697374558 + 24.06570982441908 * days
        return (gmst % 24) * 15 * np.pi / 180  # Convert to radians
    
    def _score_launch_window(self, launch_time: datetime, azimuth: float, delta_v: float) -> float:
        """Score launch window based on multiple factors"""
        # Prefer daytime launches (safety)
        hour_score = 100 - abs(launch_time.hour - 12) * 2
        
        # Prefer easterly launches (lower delta-V)
        azimuth_score = 100 - abs(np.degrees(azimuth) - 90) * 0.5
        
        # Prefer lower delta-V
        dv_score = max(0, 100 - (delta_v - 9000) * 0.01)
        
        return (hour_score + azimuth_score + dv_score) / 3
    
    def plan_rendezvous_maneuver(self, chaser_state: StateVector, 
                                target_state: StateVector) -> Dict[str, Any]:
        """Plan rendezvous maneuver sequence"""
        # Convert to orbital elements
        chaser_elements = self.cartesian_to_orbital_elements(chaser_state)
        target_elements = self.cartesian_to_orbital_elements(target_state)
        
        # Calculate relative orbital elements
        delta_a = target_elements.semi_major_axis - chaser_elements.semi_major_axis
        delta_e = target_elements.eccentricity - chaser_elements.eccentricity
        delta_i = target_elements.inclination - chaser_elements.inclination
        
        # Plan multi-burn rendezvous
        maneuvers = []
        
        # Phase 1: Coplanar maneuver (inclination change)
        if abs(delta_i) > 0.001:  # 0.057 degrees
            dv_plane_change = 2 * np.linalg.norm(chaser_state.velocity) * np.sin(abs(delta_i) / 2)
            maneuvers.append({
                'type': 'plane_change',
                'delta_v_magnitude': dv_plane_change,
                'execution_time': (chaser_state.epoch + timedelta(hours=1)).isoformat(),
                'description': f'Inclination change: {np.degrees(delta_i):.3f} degrees'
            })
        
        # Phase 2: Phasing maneuver (semi-major axis adjustment)
        if abs(delta_a) > 1000:  # 1 km
            # Calculate delta-V for Hohmann-like transfer
            r_chaser = chaser_elements.semi_major_axis
            r_target = target_elements.semi_major_axis
            
            hohmann = self.calculate_hohmann_transfer(r_chaser, r_target)
            
            maneuvers.append({
                'type': 'hohmann_transfer_1',
                'delta_v_magnitude': abs(hohmann['delta_v_1']),
                'execution_time': (chaser_state.epoch + timedelta(hours=2)).isoformat(),
                'description': 'First burn of Hohmann transfer'
            })
            
            maneuvers.append({
                'type': 'hohmann_transfer_2', 
                'delta_v_magnitude': abs(hohmann['delta_v_2']),
                'execution_time': (chaser_state.epoch + timedelta(hours=2) + 
                                 timedelta(seconds=hohmann['transfer_time']*3600)).isoformat(),
                'description': 'Second burn of Hohmann transfer'
            })
        
        # Phase 3: Final approach
        maneuvers.append({
            'type': 'final_approach',
            'delta_v_magnitude': 50.0,  # Typical final approach delta-V
            'execution_time': (chaser_state.epoch + timedelta(hours=6)).isoformat(),
            'description': 'Final approach and station-keeping'
        })
        
        total_dv = sum(m['delta_v_magnitude'] for m in maneuvers)
        
        return {
            'maneuvers': maneuvers,
            'total_delta_v': total_dv,
            'estimated_duration': 8.0,  # hours
            'fuel_required': total_dv / (9.81 * 450) * 1000,  # kg (assuming Isp=450s, 1000kg dry mass)
            'relative_elements': {
                'delta_semi_major_axis': delta_a,
                'delta_eccentricity': delta_e,
                'delta_inclination': np.degrees(delta_i)
            }
        }

# Initialize orbital mechanics calculator
orbital_calculator = OrbitalMechanicsCalculator()
import random
import asyncio
import math
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import uuid
import numpy as np
from dataclasses import dataclass

@dataclass
class Position:
    x: float
    y: float
    z: float
    timestamp: datetime

@dataclass
class Obstacle:
    id: str
    position: Position
    velocity: Tuple[float, float, float]
    size: float
    threat_level: str  # 'low', 'medium', 'high', 'critical'
    object_type: str  # 'debris', 'asteroid', 'satellite', 'unknown'
    detection_method: str  # 'radar', 'optical', 'proximity', 'manual'

class NavigationService:
    def __init__(self):
        self.current_position = Position(0, 0, 408000, datetime.now())  # 408km altitude
        self.velocity = (7660, 0, 0)  # m/s orbital velocity
        self.obstacles = {}
        self.proximity_sensors = {
            'forward': {'range': 5000, 'active': True},
            'rear': {'range': 3000, 'active': True},
            'port': {'range': 2000, 'active': True},
            'starboard': {'range': 2000, 'active': True}
        }
        self.radar_range = 50000  # 50km radar range
        self.collision_threshold = 1000  # 1km warning distance
        
        # Hand detection simulation
        self.hand_detection_active = True
        self.real_time_obstacles = []
        
    def simulate_hand_detection(self) -> Optional[Obstacle]:
        """Enhanced hand detection using proximity sensors with realistic patterns"""
        if not self.hand_detection_active:
            return None
        
        # Simulate more realistic hand detection patterns
        hand_probability = random.random()
        
        if hand_probability < 0.12:  # 12% chance per reading for more frequent detection
            # Simulate different hand positions and movements
            sensor_zones = {
                'forward': {'x_range': (0.3, 2.0), 'y_range': (-0.8, 0.8), 'z_range': (-0.5, 0.5)},
                'rear': {'x_range': (-2.0, -0.3), 'y_range': (-0.6, 0.6), 'z_range': (-0.4, 0.4)},
                'port': {'x_range': (-0.5, 0.5), 'y_range': (-2.0, -0.3), 'z_range': (-0.4, 0.4)},
                'starboard': {'x_range': (-0.5, 0.5), 'y_range': (0.3, 2.0), 'z_range': (-0.4, 0.4)}
            }
            
            # Select random sensor zone
            sensor_zone = random.choice(list(sensor_zones.keys()))
            zone_config = sensor_zones[sensor_zone]
            
            # Generate realistic hand position within sensor zone
            x = random.uniform(*zone_config['x_range'])
            y = random.uniform(*zone_config['y_range'])
            z = random.uniform(*zone_config['z_range'])
            
            # Calculate distance for threat assessment
            distance = math.sqrt(x**2 + y**2 + z**2)
            
            # Determine threat level based on proximity and movement
            if distance < 0.5:
                threat_level = 'critical'
            elif distance < 1.0:
                threat_level = 'high'
            elif distance < 1.5:
                threat_level = 'medium'
            else:
                threat_level = 'low'
            
            position = Position(x, y, z, datetime.now())
            
            hand_obstacle = Obstacle(
                id=f"hand_{sensor_zone}_{int(time.time() * 1000)}_{random.randint(100, 999)}",
                position=position,
                velocity=(random.uniform(-0.5, 0.5), random.uniform(-0.5, 0.5), random.uniform(-0.2, 0.2)),
                size=random.uniform(0.15, 0.25),  # Realistic hand size variation
                threat_level=threat_level,
                object_type='hand_detected',
                detection_method=f'proximity_{sensor_zone}'
            )
            
            self.real_time_obstacles.append(hand_obstacle)
            return hand_obstacle
        
        return None
    
    def simulate_space_debris(self) -> List[Obstacle]:
        """Generate realistic space debris for radar simulation"""
        debris_objects = []
        
        # Generate varying number of debris based on orbital environment
        debris_count = random.randint(1, 6)
        
        debris_types = [
            {'type': 'space_debris', 'size_range': (0.1, 5.0), 'speed_range': (5, 25)},
            {'type': 'micrometeorite', 'size_range': (0.01, 0.3), 'speed_range': (15, 70)},
            {'type': 'satellite_fragment', 'size_range': (0.5, 10.0), 'speed_range': (3, 20)},
            {'type': 'paint_fleck', 'size_range': (0.001, 0.01), 'speed_range': (10, 30)}
        ]
        
        for i in range(debris_count):
            debris_type = random.choice(debris_types)
            
            # Generate position in radar range
            distance = random.uniform(1000, self.radar_range)
            azimuth = random.uniform(0, 2 * math.pi)
            elevation = random.uniform(-math.pi/3, math.pi/3)
            
            # Convert spherical to cartesian coordinates
            x = distance * math.cos(elevation) * math.cos(azimuth)
            y = distance * math.cos(elevation) * math.sin(azimuth)
            z = distance * math.sin(elevation)
            
            # Generate realistic orbital velocity
            orbital_speed = random.uniform(*debris_type['speed_range'])
            vel_angle = random.uniform(0, 2 * math.pi)
            
            velocity = (
                orbital_speed * math.cos(vel_angle) + random.uniform(-3, 3),
                orbital_speed * math.sin(vel_angle) + random.uniform(-3, 3),
                random.uniform(-orbital_speed * 0.2, orbital_speed * 0.2)
            )
            
            # Calculate threat level based on size, distance, and approach speed
            size = random.uniform(*debris_type['size_range'])
            
            # Calculate relative approach speed
            relative_velocity = math.sqrt(sum(v**2 for v in velocity))
            
            # Threat assessment
            if distance < 5000 and size > 1.0 and relative_velocity > 15:
                threat_level = 'high'
            elif distance < 10000 and (size > 0.5 or relative_velocity > 20):
                threat_level = 'medium'
            elif distance < 20000:
                threat_level = 'low'
            else:
                threat_level = 'minimal'
            
            position = Position(x, y, z, datetime.now())
            
            debris_obstacle = Obstacle(
                id=f"debris_{debris_type['type']}_{int(time.time())}_{i}",
                position=position,
                velocity=velocity,
                size=size,
                threat_level=threat_level,
                object_type=debris_type['type'],
                detection_method='radar'
            )
            
            debris_objects.append(debris_obstacle)
        
        return debris_objects
    
    def get_radar_data(self) -> Dict:
        """Get radar data including hand detection"""
        # Check for hand detection
        self.simulate_hand_detection()
        
        # Clean old obstacles
        current_time = datetime.now()
        self.real_time_obstacles = [
            obs for obs in self.real_time_obstacles 
            if (current_time - obs.position.timestamp).total_seconds() < 30
        ]
        
        return {
            'obstacles': [
                {
                    'id': obs.id,
                    'position': {'x': obs.position.x, 'y': obs.position.y, 'z': obs.position.z},
                    'distance': math.sqrt(obs.position.x**2 + obs.position.y**2 + obs.position.z**2),
                    'size': obs.size,
                    'threat_level': obs.threat_level,
                    'object_type': obs.object_type,
                    'detection_method': obs.detection_method
                }
                for obs in self.real_time_obstacles
            ],
            'sensor_status': self.proximity_sensors
        }

# Global instance
navigation_service = NavigationService()
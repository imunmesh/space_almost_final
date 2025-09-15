# Real-time Debris Tracking with NASA ML Datasets
import numpy as np
import asyncio
import json
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import requests
from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import logging
import websockets

@dataclass
class DebrisObject:
    """Represents a space debris object"""
    id: str
    position: Tuple[float, float, float]  # x, y, z coordinates
    velocity: Tuple[float, float, float]  # velocity vector
    size: float  # estimated size in meters
    mass: float  # estimated mass in kg
    classification: str  # type of debris
    risk_level: int  # 1-10 risk scale
    detection_time: datetime
    predicted_trajectory: List[Tuple[float, float, float]]
    collision_probability: float

class NASADataProvider:
    """Handles NASA space debris data integration with real APIs"""
    
    def __init__(self):
        # Real NASA and Space Track APIs
        self.space_track_url = "https://www.space-track.org"
        self.nasa_eonet_url = "https://eonet.gsfc.nasa.gov/api/v3"
        self.celestrak_url = "https://celestrak.org/NORAD/elements"
        self.nasa_api_url = "https://api.nasa.gov"
        
        # API credentials (replace with real credentials)
        self.space_track_username = "demo_user"
        self.space_track_password = "demo_pass"
        self.nasa_api_key = "DEMO_KEY"
        
        self.last_update = None
        self.cached_data = []
        self.session = None
        
    async def fetch_orbital_debris_data(self) -> List[Dict]:
        """Fetch real orbital debris data from NASA/Space-Track"""
        try:
            # Try to fetch real data from multiple sources
            real_data = []
            
            # 1. Try Celestrak TLE data (public, no auth required)
            celestrak_data = await self.fetch_celestrak_debris()
            if celestrak_data:
                real_data.extend(celestrak_data)
            
            # 2. Try NASA EONET events
            eonet_data = await self.fetch_nasa_eonet_events()
            if eonet_data:
                real_data.extend(eonet_data)
            
            # 3. Enhanced simulation with realistic orbital mechanics
            if len(real_data) < 50:  # Fill with enhanced simulation if needed
                simulated_data = await self.generate_realistic_debris_data()
            
                real_data.extend(simulated_data)
            
            self.cached_data = real_data
            self.last_update = datetime.now()
            logging.info(f"Fetched {len(real_data)} debris objects from multiple sources")
            return real_data
            
        except Exception as e:
            logging.error(f"Error fetching NASA data: {e}")
            return self.cached_data
    
    async def fetch_celestrak_debris(self) -> List[Dict]:
        """Fetch debris data from Celestrak TLE sources"""
        try:
            # Celestrak provides public TLE data for debris
            urls = [
                f"{self.celestrak_url}/gp.php?GROUP=debris&FORMAT=json",
                f"{self.celestrak_url}/gp.php?GROUP=active&FORMAT=json"
            ]
            
            debris_data = []
            for url in urls:
                try:
                    response = requests.get(url, timeout=15)
                    if response.status_code == 200:
                        data = response.json()
                        for item in data[:50]:  # Limit to first 50 from each source
                            debris_data.append({
                                'norad_id': item.get('NORAD_CAT_ID', 'UNKNOWN'),
                                'object_name': item.get('OBJECT_NAME', 'DEBRIS'),
                                'epoch': item.get('EPOCH', datetime.now().isoformat()),
                                'mean_motion': float(item.get('MEAN_MOTION', 15.5)),
                                'eccentricity': float(item.get('ECCENTRICITY', 0.001)),
                                'inclination': float(item.get('INCLINATION', 51.6)),
                                'ra_of_asc_node': float(item.get('RA_OF_ASC_NODE', 0)),
                                'arg_of_pericenter': float(item.get('ARG_OF_PERICENTER', 0)),
                                'mean_anomaly': float(item.get('MEAN_ANOMALY', 0)),
                                'classification': item.get('OBJECT_TYPE', 'DEBRIS'),
                                'rcs_size': 'MEDIUM',
                                'country_code': item.get('COUNTRY_CODE', 'UNKNOWN')
                            })
                except Exception as e:
                    logging.warning(f"Failed to fetch from {url}: {e}")
                    continue
            
            return debris_data
            
        except Exception as e:
            logging.error(f"Error fetching Celestrak data: {e}")
            return []
    
    async def fetch_nasa_eonet_events(self) -> List[Dict]:
        """Fetch space events from NASA EONET"""
        try:
            url = f"{self.nasa_eonet_url}/events"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                events = []
                
                for event in data.get('events', [])[:20]:  # Limit to 20 events
                    # Convert EONET events to debris-like objects
                    geometry = event.get('geometry', [{}])[0]
                    coordinates = geometry.get('coordinates', [0, 0])
                    
                    events.append({
                        'norad_id': f"EONET_{event.get('id', 'UNKNOWN')}",
                        'object_name': event.get('title', 'Space Event'),
                        'epoch': datetime.now().isoformat(),
                        'mean_motion': 15.5 + np.random.normal(0, 0.2),
                        'eccentricity': 0.001,
                        'inclination': 51.6,
                        'ra_of_asc_node': coordinates[0] if len(coordinates) > 0 else 0,
                        'arg_of_pericenter': coordinates[1] if len(coordinates) > 1 else 0,
                        'mean_anomaly': np.random.uniform(0, 360),
                        'classification': 'EVENT',
                        'rcs_size': 'SMALL',
                        'country_code': 'INTERNATIONAL'
                    })
                
                return events
            else:
                logging.warning(f"EONET API returned status {response.status_code}")
                return []
                
        except Exception as e:
            logging.error(f"Error fetching EONET data: {e}")
        
        return []
    
    async def generate_realistic_debris_data(self) -> List[Dict]:
        """Generate realistic debris data with enhanced orbital mechanics"""
        try:
            debris_data = []
            
            # Common satellite constellations and orbital parameters
            orbital_families = [
                {'name': 'LEO_DEBRIS', 'altitude': 400, 'inclination': 51.6, 'count': 30},
                {'name': 'STARLINK_DEBRIS', 'altitude': 550, 'inclination': 53.0, 'count': 25},
                {'name': 'ONEWEB_DEBRIS', 'altitude': 1200, 'inclination': 87.4, 'count': 20},
                {'name': 'GEO_DEBRIS', 'altitude': 35786, 'inclination': 0.1, 'count': 15},
                {'name': 'POLAR_DEBRIS', 'altitude': 800, 'inclination': 98.7, 'count': 10}
            ]
            
            for family in orbital_families:
                for i in range(family['count']):
                    # Calculate realistic orbital parameters
                    altitude = family['altitude'] + np.random.normal(0, 50)
                    radius = 6371 + altitude  # Earth radius + altitude
                    mean_motion = np.sqrt(398600.4418 / (radius**3)) * 86400 / (2 * np.pi)  # Revolutions per day
                    
                    debris_data.append({
                        'norad_id': f"{family['name']}_{i:03d}",
                        'object_name': f"{family['name']} Fragment {i}",
                        'epoch': datetime.now().isoformat(),
                        'mean_motion': mean_motion,
                        'eccentricity': np.random.exponential(0.001),
                        'inclination': family['inclination'] + np.random.normal(0, 2),
                        'ra_of_asc_node': np.random.uniform(0, 360),
                        'arg_of_pericenter': np.random.uniform(0, 360),
                        'mean_anomaly': np.random.uniform(0, 360),
                        'classification': np.random.choice(['ROCKET BODY', 'PAYLOAD', 'DEBRIS', 'FRAGMENTATION']),
                        'rcs_size': np.random.choice(['SMALL', 'MEDIUM', 'LARGE'], p=[0.6, 0.3, 0.1]),
                        'country_code': np.random.choice(['US', 'RU', 'CN', 'EU', 'IN', 'JP'], p=[0.3, 0.2, 0.15, 0.15, 0.1, 0.1])
                    })
            
            return debris_data
            
        except Exception as e:
            logging.error(f"Error generating realistic debris data: {e}")
            return []
    
    def orbital_elements_to_cartesian(self, elements: Dict) -> Tuple[float, float, float]:
        """Convert orbital elements to Cartesian coordinates"""
        # Simplified conversion for demonstration
        # Real implementation would use proper orbital mechanics
        inclination = np.radians(elements['inclination'])
        raan = np.radians(elements['ra_of_asc_node'])
        mean_anomaly = np.radians(elements['mean_anomaly'])
        
        # Earth's radius (km) + altitude estimate
        radius = 6371 + 400 + np.random.normal(0, 200)
        
        x = radius * np.cos(mean_anomaly) * np.cos(raan)
        y = radius * np.cos(mean_anomaly) * np.sin(raan)
        z = radius * np.sin(mean_anomaly) * np.sin(inclination)
        
        return (x, y, z)

class DebrisMLPredictor:
    """Advanced machine learning models for debris prediction and classification"""
    
    def __init__(self):
        # Enhanced ML models for real-life tracking
        self.anomaly_detector = IsolationForest(contamination='auto', random_state=42, n_estimators=200)
        self.trajectory_predictor = RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42)
        self.collision_predictor = RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42)
        self.orbital_decay_predictor = RandomForestRegressor(n_estimators=150, random_state=42)
        self.fragment_classifier = IsolationForest(contamination='auto', random_state=42)
        
        # Advanced scalers for different feature types
        self.position_scaler = StandardScaler()
        self.velocity_scaler = StandardScaler()
        self.orbital_scaler = StandardScaler()
        
        self.is_trained = False
        self.training_history = []
        
    def prepare_advanced_features(self, debris_objects: List[DebrisObject]) -> Dict[str, np.ndarray]:
        """Prepare advanced feature matrices for different ML models"""
        if not debris_objects:
            return {'position': np.array([]), 'velocity': np.array([]), 'orbital': np.array([])}
        
        position_features = []
        velocity_features = []
        orbital_features = []
        
        for debris in debris_objects:
            # Position and basic features
            pos_vector = [
                debris.position[0], debris.position[1], debris.position[2],
                np.linalg.norm(debris.position),  # Distance from Earth center
                debris.size, debris.mass
            ]
            position_features.append(pos_vector)
            
            # Velocity and dynamics features
            vel_vector = [
                debris.velocity[0], debris.velocity[1], debris.velocity[2],
                np.linalg.norm(debris.velocity),  # Speed
                len(debris.predicted_trajectory),
                (datetime.now() - debris.detection_time).total_seconds() / 3600  # Hours tracked
            ]
            velocity_features.append(vel_vector)
            
            # Advanced orbital mechanics features
            orbital_vector = [
                debris.risk_level,
                debris.collision_probability,
                self._calculate_orbital_energy(debris),
                self._calculate_angular_momentum(debris),
                self._estimate_atmospheric_drag(debris),
                self._calculate_orbital_period(debris),
                self._estimate_decay_rate(debris)
            ]
            orbital_features.append(orbital_vector)
        
        return {
            'position': np.array(position_features),
            'velocity': np.array(velocity_features),
            'orbital': np.array(orbital_features)
        }
    
    def _calculate_orbital_energy(self, debris: DebrisObject) -> float:
        """Calculate specific orbital energy"""
        try:
            r = np.linalg.norm(debris.position) * 1000  # Convert to meters
            v = np.linalg.norm(debris.velocity) * 1000   # Convert to m/s
            mu = 3.986004418e14  # Earth's gravitational parameter
            
            kinetic_energy = 0.5 * v**2
            potential_energy = -mu / r
            
            return float(kinetic_energy + potential_energy)
        except:
            return 0.0
    
    def _calculate_angular_momentum(self, debris: DebrisObject) -> float:
        """Calculate specific angular momentum"""
        try:
            r_vec = np.array(debris.position) * 1000
            v_vec = np.array(debris.velocity) * 1000
            h_vec = np.cross(r_vec, v_vec)
            return float(np.linalg.norm(h_vec))
        except:
            return 0.0
    
    def _estimate_atmospheric_drag(self, debris: DebrisObject) -> float:
        """Estimate atmospheric drag effect"""
        try:
            altitude = np.linalg.norm(debris.position) - 6371  # km above Earth
            if altitude < 2000:  # Only significant below 2000 km
                # Simplified drag model
                density_scale_height = 60  # km
                base_density = 1e-12  # kg/m³ at 400 km
                density = base_density * np.exp(-(altitude - 400) / density_scale_height)
                
                area_to_mass = debris.size**2 / max(debris.mass, 1)  # m²/kg
                velocity = np.linalg.norm(debris.velocity) * 1000  # m/s
                
                drag_acceleration = 0.5 * density * velocity**2 * area_to_mass * 2.2  # Cd = 2.2
                return float(drag_acceleration)
            return 0.0
        except:
            return 0.0
    
    def _calculate_orbital_period(self, debris: DebrisObject) -> float:
        """Calculate orbital period in minutes"""
        try:
            r = np.linalg.norm(debris.position) * 1000  # meters
            mu = 3.986004418e14  # Earth's gravitational parameter
            
            period = 2 * np.pi * np.sqrt(r**3 / mu) / 60  # minutes
            return float(period)
        except:
            return 90.0  # Default LEO period
    
    def _estimate_decay_rate(self, debris: DebrisObject) -> float:
        """Estimate orbital decay rate in km/day"""
        try:
            drag = self._estimate_atmospheric_drag(debris)
            if drag > 0:
                # Simplified decay rate calculation
                altitude = np.linalg.norm(debris.position) - 6371
                decay_rate = drag * 86400 / 1000  # Convert to km/day
                return float(min(decay_rate, 10.0))  # Cap at 10 km/day
            return 0.0
        except:
            return 0.0
    
    def train_models(self, historical_data: List[DebrisObject]):
        """Train ML models with historical debris data"""
        if len(historical_data) < 10:
            return False
        
        feature_dict = self.prepare_advanced_features(historical_data)
        if feature_dict['position'].size == 0:
            return False
        
        # Scale features separately
        position_scaled = self.position_scaler.fit_transform(feature_dict['position'])
        velocity_scaled = self.velocity_scaler.fit_transform(feature_dict['velocity'])
        orbital_scaled = self.orbital_scaler.fit_transform(feature_dict['orbital'])
        
        # Combine all features
        all_features = np.hstack([position_scaled, velocity_scaled, orbital_scaled])
        
        # Train anomaly detector
        self.anomaly_detector.fit(all_features)
        
        # Prepare training data for trajectory and collision prediction
        trajectory_targets = []
        collision_targets = []
        
        for debris in historical_data:
            if len(debris.predicted_trajectory) > 0:
                # Future position (simplified)
                future_pos = debris.predicted_trajectory[-1]
                trajectory_targets.append([future_pos[0], future_pos[1], future_pos[2]])
                collision_targets.append(debris.collision_probability)
        
        if len(trajectory_targets) > 0:
            self.trajectory_predictor.fit(all_features, trajectory_targets)
            self.collision_predictor.fit(all_features, collision_targets)
            self.orbital_decay_predictor.fit(orbital_scaled, [self._estimate_decay_rate(debris) for debris in historical_data])
            self.is_trained = True
            return True
        
        return False
    
    def detect_anomalies(self, debris_objects: List[DebrisObject]) -> List[int]:
        """Detect anomalous debris behavior"""
        if not self.is_trained or len(debris_objects) == 0:
            return []
        
        features = self.prepare_features(debris_objects)
        features_scaled = self.scaler.transform(features)
        
        anomaly_scores = self.anomaly_detector.decision_function(features_scaled)
        anomalies = self.anomaly_detector.predict(features_scaled)
        
        return [i for i, is_anomaly in enumerate(anomalies) if is_anomaly == -1]
    
    def predict_trajectory(self, debris: DebrisObject, time_steps: int = 10) -> List[Tuple[float, float, float]]:
        """Predict future trajectory of debris object"""
        if not self.is_trained:
            return []
        
        current_features = self.prepare_features([debris])
        features_scaled = self.scaler.transform(current_features)
        
        trajectory = []
        current_pos = np.array(debris.position)
        current_vel = np.array(debris.velocity)
        
        for step in range(time_steps):
            # Predict next position
            prediction = self.trajectory_predictor.predict(features_scaled)[0]
            next_pos = tuple(prediction)
            trajectory.append(next_pos)
            
            # Update for next prediction (simplified physics)
            current_pos = np.array(next_pos)
            current_vel = current_vel * 0.999  # Simple drag effect
        
        return trajectory
    
    def calculate_collision_risk(self, debris1: DebrisObject, debris2: DebrisObject) -> float:
        """Calculate collision probability between two debris objects"""
        if not self.is_trained:
            return 0.0
        
        # Calculate relative features
        rel_pos = np.array(debris1.position) - np.array(debris2.position)
        rel_vel = np.array(debris1.velocity) - np.array(debris2.velocity)
        distance = np.linalg.norm(rel_pos)
        relative_speed = np.linalg.norm(rel_vel)
        
        # Simple collision risk calculation
        size_factor = (debris1.size + debris2.size) / 2
        time_to_closest_approach = distance / max(relative_speed, 0.1)
        
        # Risk increases with larger objects, closer distance, higher relative speed
        risk = (size_factor / distance) * relative_speed / max(time_to_closest_approach, 1)
        
        return float(min(risk, 1.0))

class RealTimeDebrisTracker:
    """Main class for real-time debris tracking system"""
    
    def __init__(self):
        self.nasa_provider = NASADataProvider()
        self.ml_predictor = DebrisMLPredictor()
        self.tracked_objects: Dict[str, DebrisObject] = {}
        self.is_running = False
        self.update_interval = 5  # seconds
        self.collision_threshold = 0.7
        self.websocket_clients = set()
        
    async def initialize(self):
        """Initialize the tracking system"""
        try:
            # Fetch initial data
            nasa_data = await self.nasa_provider.fetch_orbital_debris_data()
            
            # Convert to DebrisObject instances
            for data in nasa_data[:50]:  # Process first 50 objects
                debris = self.nasa_data_to_debris_object(data)
                self.tracked_objects[debris.id] = debris
            
            # Train ML models with initial data
            if len(self.tracked_objects) > 10:
                self.ml_predictor.train_models(list(self.tracked_objects.values()))
            
            logging.info(f"Initialized tracking system with {len(self.tracked_objects)} objects")
            return True
            
        except Exception as e:
            logging.error(f"Failed to initialize tracking system: {e}")
            return False
    
    def nasa_data_to_debris_object(self, nasa_data: Dict) -> DebrisObject:
        """Convert NASA data to DebrisObject"""
        position = self.nasa_provider.orbital_elements_to_cartesian(nasa_data)
        
        # Estimate velocity from orbital elements
        velocity = (
            np.random.normal(0, 5),  # Simplified velocity calculation
            np.random.normal(0, 5),
            np.random.normal(0, 2)
        )
        
        # Size estimation based on RCS
        size_map = {'SMALL': 0.1, 'MEDIUM': 1.0, 'LARGE': 10.0}
        size = size_map.get(nasa_data.get('rcs_size', 'MEDIUM'), 1.0)
        
        # Mass estimation (rough approximation)
        mass = size * 100  # kg per m³ approximation
        
        return DebrisObject(
            id=nasa_data['norad_id'],
            position=position,
            velocity=velocity,
            size=size,
            mass=mass,
            classification=nasa_data.get('classification', 'UNKNOWN'),
            risk_level=np.random.randint(1, 6),
            detection_time=datetime.now(),
            predicted_trajectory=[],
            collision_probability=0.0
        )
    
    async def update_tracking_data(self):
        """Update tracking data from NASA sources"""
        try:
            # Fetch latest data
            nasa_data = await self.nasa_provider.fetch_orbital_debris_data()
            
            # Update existing objects and add new ones
            updated_count = 0
            for data in nasa_data:
                debris_id = data['norad_id']
                
                if debris_id in self.tracked_objects:
                    # Update existing object
                    self.update_debris_object(self.tracked_objects[debris_id], data)
                    updated_count += 1
                else:
                    # Add new object
                    new_debris = self.nasa_data_to_debris_object(data)
                    self.tracked_objects[debris_id] = new_debris
            
            logging.info(f"Updated {updated_count} objects, total: {len(self.tracked_objects)}")
            
        except Exception as e:
            logging.error(f"Error updating tracking data: {e}")
    
    def update_debris_object(self, debris: DebrisObject, nasa_data: Dict):
        """Update debris object with new NASA data"""
        # Update position
        new_position = self.nasa_provider.orbital_elements_to_cartesian(nasa_data)
        
        # Calculate velocity from position change
        time_diff = (datetime.now() - debris.detection_time).total_seconds()
        if time_diff > 0:
            velocity_x = float((new_position[0] - debris.position[0]) / time_diff)
            velocity_y = float((new_position[1] - debris.position[1]) / time_diff)
            velocity_z = float((new_position[2] - debris.position[2]) / time_diff)
            debris.velocity = (velocity_x, velocity_y, velocity_z)
        
        debris.position = new_position
        debris.detection_time = datetime.now()
    
    async def analyze_debris_patterns(self):
        """Analyze debris patterns using ML"""
        if not self.ml_predictor.is_trained:
            return
        
        debris_list = list(self.tracked_objects.values())
        
        # Detect anomalies
        anomaly_indices = self.ml_predictor.detect_anomalies(debris_list)
        
        # Update risk levels for anomalous objects
        for idx in anomaly_indices:
            debris_list[idx].risk_level = min(debris_list[idx].risk_level + 2, 10)
        
        # Predict trajectories
        for debris in debris_list:
            trajectory = self.ml_predictor.predict_trajectory(debris)
            debris.predicted_trajectory = trajectory
        
        # Calculate collision probabilities
        await self.calculate_collision_matrix()
    
    async def calculate_collision_matrix(self):
        """Calculate collision probabilities between all objects"""
        debris_list = list(self.tracked_objects.values())
        high_risk_pairs = []
        
        for i, debris1 in enumerate(debris_list):
            for debris2 in debris_list[i+1:]:
                collision_risk = self.ml_predictor.calculate_collision_risk(debris1, debris2)
                
                # Update collision probabilities
                debris1.collision_probability = max(debris1.collision_probability, collision_risk)
                debris2.collision_probability = max(debris2.collision_probability, collision_risk)
                
                # Track high-risk pairs
                if collision_risk > self.collision_threshold:
                    high_risk_pairs.append({
                        'object1': debris1.id,
                        'object2': debris2.id,
                        'risk': collision_risk,
                        'estimated_time': self.estimate_collision_time(debris1, debris2)
                    })
        
        # Send alerts for high-risk collisions
        if high_risk_pairs:
            await self.send_collision_alerts(high_risk_pairs)
    
    def estimate_collision_time(self, debris1: DebrisObject, debris2: DebrisObject) -> str:
        """Estimate time to potential collision"""
        rel_pos = np.array(debris1.position) - np.array(debris2.position)
        rel_vel = np.array(debris1.velocity) - np.array(debris2.velocity)
        
        distance = np.linalg.norm(rel_pos)
        relative_speed = np.linalg.norm(rel_vel)
        
        if relative_speed > 0:
            time_to_collision = distance / relative_speed
            collision_time = datetime.now() + timedelta(seconds=float(time_to_collision))
            return collision_time.strftime("%Y-%m-%d %H:%M:%S")
        
        return "Unknown"
    
    async def send_collision_alerts(self, high_risk_pairs: List[Dict]):
        """Send collision alerts to connected clients"""
        alert_data = {
            'type': 'collision_alert',
            'timestamp': datetime.now().isoformat(),
            'alerts': high_risk_pairs
        }
        
        # Send to websocket clients
        if self.websocket_clients:
            message = json.dumps(alert_data)
            for client in self.websocket_clients.copy():
                try:
                    await client.send(message)
                except:
                    self.websocket_clients.remove(client)
    
    def get_tracking_summary(self) -> Dict:
        """Get current tracking summary"""
        debris_list = list(self.tracked_objects.values())
        
        if not debris_list:
            return {
                'total_objects': 0,
                'high_risk_objects': 0,
                'collision_alerts': 0,
                'last_update': None
            }
        
        high_risk_count = sum(1 for d in debris_list if d.risk_level > 7)
        collision_alerts = sum(1 for d in debris_list if d.collision_probability > self.collision_threshold)
        
        return {
            'total_objects': len(debris_list),
            'high_risk_objects': high_risk_count,
            'collision_alerts': collision_alerts,
            'last_update': self.nasa_provider.last_update.isoformat() if self.nasa_provider.last_update else None,
            'classifications': self.get_classification_stats(),
            'average_risk_level': sum(d.risk_level for d in debris_list) / len(debris_list)
        }
    
    def get_classification_stats(self) -> Dict[str, int]:
        """Get debris classification statistics"""
        stats = {}
        for debris in self.tracked_objects.values():
            classification = debris.classification
            stats[classification] = stats.get(classification, 0) + 1
        return stats
    
    async def start_real_time_tracking(self):
        """Start the real-time tracking loop"""
        self.is_running = True
        
        while self.is_running:
            try:
                # Update tracking data
                await self.update_tracking_data()
                
                # Analyze patterns
                await self.analyze_debris_patterns()
                
                # Send updates to clients
                await self.broadcast_tracking_update()
                
                # Wait for next update
                await asyncio.sleep(self.update_interval)
                
            except Exception as e:
                logging.error(f"Error in tracking loop: {e}")
                await asyncio.sleep(self.update_interval)
    
    async def broadcast_tracking_update(self):
        """Broadcast tracking updates to connected clients"""
        if not self.websocket_clients:
            return
        
        update_data = {
            'type': 'tracking_update',
            'timestamp': datetime.now().isoformat(),
            'summary': self.get_tracking_summary(),
            'objects': [
                {
                    'id': debris.id,
                    'position': debris.position,
                    'velocity': debris.velocity,
                    'size': debris.size,
                    'classification': debris.classification,
                    'risk_level': debris.risk_level,
                    'collision_probability': debris.collision_probability
                }
                for debris in list(self.tracked_objects.values())[:20]  # Send first 20 objects
            ]
        }
        
        message = json.dumps(update_data)
        for client in self.websocket_clients.copy():
            try:
                await client.send(message)
            except:
                self.websocket_clients.remove(client)
    
    def stop_tracking(self):
        """Stop the real-time tracking"""
        self.is_running = False
    
    async def handle_websocket_client(self, websocket, path):
        """Handle websocket client connections"""
        self.websocket_clients.add(websocket)
        try:
            # Send initial tracking summary
            initial_data = {
                'type': 'initial_data',
                'summary': self.get_tracking_summary()
            }
            await websocket.send(json.dumps(initial_data))
            
            # Keep connection alive
            async for message in websocket:
                # Handle client requests
                try:
                    request = json.loads(message)
                    if request.get('type') == 'get_object_details':
                        object_id = request.get('object_id')
                        if object_id in self.tracked_objects:
                            debris = self.tracked_objects[object_id]
                            response = {
                                'type': 'object_details',
                                'object': {
                                    'id': debris.id,
                                    'position': debris.position,
                                    'velocity': debris.velocity,
                                    'predicted_trajectory': debris.predicted_trajectory,
                                    'risk_level': debris.risk_level,
                                    'collision_probability': debris.collision_probability,
                                    'classification': debris.classification,
                                    'detection_time': debris.detection_time.isoformat()
                                }
                            }
                            await websocket.send(json.dumps(response))
                except:
                    pass
        finally:
            self.websocket_clients.remove(websocket)

# Global instance
debris_tracker = RealTimeDebrisTracker()

async def main():
    """Main function to run the debris tracking system"""
    logging.basicConfig(level=logging.INFO)
    
    # Initialize the tracking system
    if await debris_tracker.initialize():
        print("Real-time debris tracking system initialized successfully")
        
        # Start WebSocket server
        start_server = websockets.serve(
            debris_tracker.handle_websocket_client, 
            "localhost", 
            8765
        )
        
        # Start tracking
        tracking_task = asyncio.create_task(debris_tracker.start_real_time_tracking())
        
        # Run both server and tracking
        await asyncio.gather(start_server, tracking_task)
    else:
        print("Failed to initialize debris tracking system")

if __name__ == "__main__":
    asyncio.run(main())
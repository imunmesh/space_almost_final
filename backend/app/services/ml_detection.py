import numpy as np
import random
from datetime import datetime, timedelta
from typing import List, Tuple, Optional
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from app.models.schemas import Obstacle, SpacecraftPosition, AlertSeverity
import uuid
import math

class MLObstacleDetector:
    def __init__(self):
        self.scaler = StandardScaler()
        self.obstacle_history = []
        self.predicted_paths = {}
        
    def generate_simulated_obstacles(self, spacecraft_pos: SpacecraftPosition, count: int = 5) -> List[Obstacle]:
        """Generate simulated space obstacles around the spacecraft"""
        obstacles = []
        
        for i in range(count):
            # Generate obstacles within a 10km radius of spacecraft
            distance = random.uniform(1, 10)  # km
            angle = random.uniform(0, 2 * math.pi)
            elevation = random.uniform(-math.pi/4, math.pi/4)
            
            # Calculate obstacle position
            x = spacecraft_pos.x + distance * math.cos(angle) * math.cos(elevation)
            y = spacecraft_pos.y + distance * math.sin(angle) * math.cos(elevation)
            z = spacecraft_pos.z + distance * math.sin(elevation)
            
            # Random velocity for moving obstacles
            vel_x = random.uniform(-0.5, 0.5)  # km/s
            vel_y = random.uniform(-0.5, 0.5)
            vel_z = random.uniform(-0.1, 0.1)
            
            obstacle_pos = SpacecraftPosition(
                x=x, y=y, z=z,
                velocity_x=vel_x, velocity_y=vel_y, velocity_z=vel_z,
                heading=random.uniform(0, 360)
            )
            
            # Determine obstacle type and size
            obstacle_types = ["asteroid", "debris", "satellite"]
            obstacle_type = random.choice(obstacle_types)
            
            if obstacle_type == "asteroid":
                size = random.uniform(10, 500)  # meters
                threat_level = AlertSeverity.MEDIUM if size > 100 else AlertSeverity.LOW
            elif obstacle_type == "debris":
                size = random.uniform(0.1, 10)
                threat_level = AlertSeverity.HIGH if size > 5 else AlertSeverity.MEDIUM
            else:  # satellite
                size = random.uniform(1, 20)
                threat_level = AlertSeverity.LOW
            
            # Predict future path
            predicted_path = self.predict_obstacle_path(obstacle_pos, hours=2)
            
            obstacle = Obstacle(
                id=f"OBS_{uuid.uuid4().hex[:8]}",
                type=obstacle_type,
                position=obstacle_pos,
                size=size,
                threat_level=threat_level,
                predicted_path=predicted_path
            )
            
            obstacles.append(obstacle)
        
        return obstacles
    
    def predict_obstacle_path(self, position: SpacecraftPosition, hours: int = 2) -> List[SpacecraftPosition]:
        """Predict future positions of an obstacle"""
        path = []
        current_pos = position
        
        # Predict positions every 10 minutes for specified hours
        time_steps = hours * 6  # 6 steps per hour (10-minute intervals)
        dt = 600  # 10 minutes in seconds
        
        for step in range(time_steps):
            # Simple linear prediction (in reality, would use orbital mechanics)
            next_x = current_pos.x + current_pos.velocity_x * dt / 1000  # convert to km
            next_y = current_pos.y + current_pos.velocity_y * dt / 1000
            next_z = current_pos.z + current_pos.velocity_z * dt / 1000
            
            # Add some gravitational effect (simplified)
            # Assume slight acceleration toward a large body
            gravitational_acceleration = 0.001  # km/s² 
            gravity_x = -next_x * gravitational_acceleration * dt / 1000
            gravity_y = -next_y * gravitational_acceleration * dt / 1000
            gravity_z = -next_z * gravitational_acceleration * dt / 1000
            
            next_pos = SpacecraftPosition(
                x=next_x + gravity_x,
                y=next_y + gravity_y,
                z=next_z + gravity_z,
                velocity_x=current_pos.velocity_x,
                velocity_y=current_pos.velocity_y,
                velocity_z=current_pos.velocity_z,
                heading=current_pos.heading,
                timestamp=current_pos.timestamp + timedelta(minutes=10 * (step + 1))
            )
            
            path.append(next_pos)
            current_pos = next_pos
        
        return path
    
    def calculate_collision_risk(self, spacecraft_pos: SpacecraftPosition, 
                               spacecraft_velocity: Tuple[float, float, float],
                               obstacle: Obstacle) -> float:
        """Calculate collision risk between spacecraft and obstacle"""
        # Distance between spacecraft and obstacle
        dx = obstacle.position.x - spacecraft_pos.x
        dy = obstacle.position.y - spacecraft_pos.y
        dz = obstacle.position.z - spacecraft_pos.z
        distance = math.sqrt(dx**2 + dy**2 + dz**2)
        
        # Relative velocity
        rel_vx = spacecraft_velocity[0] - obstacle.position.velocity_x
        rel_vy = spacecraft_velocity[1] - obstacle.position.velocity_y
        rel_vz = spacecraft_velocity[2] - obstacle.position.velocity_z
        
        # Time to closest approach
        if rel_vx**2 + rel_vy**2 + rel_vz**2 > 0:
            t_closest = -(dx*rel_vx + dy*rel_vy + dz*rel_vz) / (rel_vx**2 + rel_vy**2 + rel_vz**2)
        else:
            t_closest = float('inf')
        
        if t_closest < 0:
            t_closest = 0
        
        # Position at closest approach
        closest_distance = math.sqrt(
            (dx + rel_vx * t_closest)**2 + 
            (dy + rel_vy * t_closest)**2 + 
            (dz + rel_vz * t_closest)**2
        )
        
        # Risk calculation based on distance, size, and time
        safe_distance = obstacle.size + 100  # 100m safety margin
        
        if closest_distance < safe_distance and t_closest < 3600:  # Within 1 hour
            risk = 1.0 - (closest_distance / safe_distance)
            risk *= (3600 - t_closest) / 3600  # Higher risk for sooner collisions
            return min(1.0, max(0.0, risk))
        
        return 0.0
    
    def cluster_obstacles(self, obstacles: List[Obstacle]) -> List[List[Obstacle]]:
        """Group nearby obstacles using machine learning clustering"""
        if len(obstacles) < 2:
            return [[obstacle] for obstacle in obstacles]
        
        # Extract positions for clustering
        positions = np.array([
            [obs.position.x, obs.position.y, obs.position.z] 
            for obs in obstacles
        ])
        
        # Normalize positions
        if len(positions) > 1:
            try:
                positions_scaled = self.scaler.fit_transform(positions)
                
                # Use DBSCAN clustering
                clustering = DBSCAN(eps=0.5, min_samples=2).fit(positions_scaled)
                
                # Group obstacles by cluster
                clusters = {}
                for i, label in enumerate(clustering.labels_):
                    if label not in clusters:
                        clusters[label] = []
                    clusters[label].append(obstacles[i])
                
                return list(clusters.values())
            except:
                # Fallback if clustering fails
                return [[obstacle] for obstacle in obstacles]
        
        return [[obstacle] for obstacle in obstacles]
    
    def generate_safe_path(self, start: SpacecraftPosition, 
                          destination: SpacecraftPosition,
                          obstacles: List[Obstacle]) -> List[SpacecraftPosition]:
        """Generate a safe path avoiding obstacles"""
        # Simple path planning - in reality would use A* or RRT
        path = [start]
        
        # Calculate direct path
        steps = 10
        for i in range(1, steps + 1):
            t = i / steps
            waypoint = SpacecraftPosition(
                x=start.x + t * (destination.x - start.x),
                y=start.y + t * (destination.y - start.y),
                z=start.z + t * (destination.z - start.z),
                timestamp=start.timestamp + timedelta(minutes=i * 30)  # 30 min per waypoint
            )
            
            # Check for obstacles and adjust if needed
            for obstacle in obstacles:
                dx = waypoint.x - obstacle.position.x
                dy = waypoint.y - obstacle.position.y
                dz = waypoint.z - obstacle.position.z
                distance = math.sqrt(dx**2 + dy**2 + dz**2)
                
                safe_distance = obstacle.size + 200  # 200m safety margin
                
                if distance < safe_distance:
                    # Simple avoidance: move perpendicular to obstacle
                    if abs(dx) > abs(dy):
                        waypoint.y += safe_distance if dy >= 0 else -safe_distance
                    else:
                        waypoint.x += safe_distance if dx >= 0 else -safe_distance
            
            path.append(waypoint)
        
        return path

# Global instance
ml_detector = MLObstacleDetector()
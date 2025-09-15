# Space Weather Service with NASA API Integration
import requests
import random
import math
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from app.models.schemas import SpaceWeatherData, AlertSeverity, Alert
import uuid
import asyncio
import numpy as np

class SpaceWeatherService:
    def __init__(self):
        self.nasa_api_key = "DEMO_KEY"  # In production, use environment variable
        self.base_urls = {
            "solar_wind": "https://api.nasa.gov/DONKI/WSAEnlilSimulations",
            "solar_flares": "https://api.nasa.gov/DONKI/FLR",
            "geomagnetic": "https://api.nasa.gov/DONKI/GST",
            "asteroids": "https://api.nasa.gov/neo/rest/v1/feed"
        }
        self.cache = {}
        self.cache_expiry = {}
        self.current_weather = None
        
    async def fetch_nasa_data(self, endpoint: str, params: Optional[dict] = None) -> Dict:
        """Fetch data from NASA APIs with caching"""
        cache_key = f"{endpoint}_{str(params)}"
        
        # Check cache
        if cache_key in self.cache and datetime.now() < self.cache_expiry.get(cache_key, datetime.min):
            return self.cache[cache_key]
        
        try:
            if params is None:
                params = {}
            params["api_key"] = self.nasa_api_key
            
            response = requests.get(endpoint, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Cache for 15 minutes
                self.cache[cache_key] = data
                self.cache_expiry[cache_key] = datetime.now() + timedelta(minutes=15)
                return data
            else:
                print(f"NASA API error: {response.status_code}")
                return {}
                
        except Exception as e:
            print(f"Error fetching NASA data: {e}")
            return {}
    
    async def get_solar_wind_data(self) -> Dict:
        """Get solar wind data from NASA"""
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        
        params = {
            "startDate": start_date,
            "endDate": end_date
        }
        
        data = await self.fetch_nasa_data(self.base_urls["solar_wind"], params)
        
        if data and isinstance(data, list) and len(data) > 0:
            latest = data[0]
            return {
                "speed": latest.get("estimatedShockArrivalTime", 400),  # km/s
                "density": random.uniform(1, 10),  # Simulated as not always available
                "magnetic_field": random.uniform(5, 15)  # nT
            }
        
        # Fallback to simulated data
        return {
            "speed": random.uniform(300, 800),
            "density": random.uniform(1, 10),
            "magnetic_field": random.uniform(5, 15)
        }
    
    async def get_solar_flare_data(self) -> Dict:
        """Get solar flare data from NASA"""
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d")
        
        params = {
            "startDate": start_date,
            "endDate": end_date
        }
        
        data = await self.fetch_nasa_data(self.base_urls["solar_flares"], params)
        
        flare_class = None
        if data and isinstance(data, list) and len(data) > 0:
            # Get the most recent flare
            latest = data[0]
            flare_class = latest.get("classType", "C1.0")
        
        if not flare_class:
            # Simulate occasional flares
            if random.random() < 0.1:  # 10% chance
                classes = ["A", "B", "C", "M", "X"]
                weights = [0.4, 0.3, 0.2, 0.08, 0.02]  # X-class flares are rare
                flare_class = random.choices(classes, weights=weights)[0]
                flare_class += str(random.uniform(1.0, 9.9))[:3]
        
        return {
            "class": flare_class,
            "intensity": self._flare_class_to_intensity(flare_class) if flare_class else 0
        }
    
    def _flare_class_to_intensity(self, flare_class: str) -> float:
        """Convert flare class to intensity percentage"""
        if not flare_class:
            return 0
        
        class_letter = flare_class[0].upper()
        intensity_map = {"A": 10, "B": 25, "C": 50, "M": 75, "X": 100}
        return intensity_map.get(class_letter, 0)
    
    async def get_geomagnetic_data(self) -> Dict:
        """Get geomagnetic storm data"""
        # Simulate Kp index (0-9 scale)
        kp_index = random.uniform(0, 9)
        
        # Higher Kp means stronger geomagnetic activity
        if kp_index >= 5:
            severity = "storm"
        elif kp_index >= 4:
            severity = "minor_storm"
        else:
            severity = "quiet"
        
        return {
            "kp_index": kp_index,
            "severity": severity
        }
    
    async def get_asteroid_alerts(self) -> List[str]:
        """Get asteroid/meteor alerts"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        params = {
            "start_date": today,
            "end_date": today
        }
        
        data = await self.fetch_nasa_data(self.base_urls["asteroids"], params)
        
        alerts = []
        if data and "near_earth_objects" in data:
            for date, objects in data["near_earth_objects"].items():
                for obj in objects[:3]:  # Limit to 3 objects
                    name = obj.get("name", "Unknown")
                    distance = obj.get("close_approach_data", [{}])[0].get("miss_distance", {}).get("kilometers", "Unknown")
                    
                    if distance != "Unknown":
                        distance_km = float(distance)
                        if distance_km < 7500000:  # Less than 7.5 million km
                            alerts.append(f"Asteroid {name} approaching at {distance_km:,.0f} km")
        
        # Add some simulated alerts if no real ones
        if not alerts and random.random() < 0.3:  # 30% chance
            alerts = [
                "Minor debris field detected in trajectory",
                "Solar particle event incoming in 2 hours",
                "Cosmic ray intensity elevated"
            ]
        
        return alerts
    
    async def generate_current_weather(self) -> SpaceWeatherData:
        """Generate current space weather conditions"""
        # Fetch all data concurrently
        solar_wind, solar_flare, geomagnetic, asteroid_alerts = await asyncio.gather(
            self.get_solar_wind_data(),
            self.get_solar_flare_data(),
            self.get_geomagnetic_data(),
            self.get_asteroid_alerts()
        )
        
        # Calculate cosmic radiation based on solar activity
        base_radiation = 50  # Base level
        flare_impact = solar_flare.get("intensity", 0) * 0.3
        solar_wind_impact = (solar_wind.get("speed", 400) - 400) / 10
        cosmic_radiation = max(0, min(100, base_radiation + flare_impact + solar_wind_impact))
        
        # Determine overall severity
        severity = AlertSeverity.LOW
        if (solar_flare.get("class", "").startswith(("M", "X")) or 
            geomagnetic.get("kp_index", 0) > 6 or 
            cosmic_radiation > 80):
            severity = AlertSeverity.HIGH
        elif (solar_flare.get("class", "").startswith("C") or 
              geomagnetic.get("kp_index", 0) > 4 or 
              cosmic_radiation > 60):
            severity = AlertSeverity.MEDIUM
        
        weather_data = SpaceWeatherData(
            solar_wind_speed=solar_wind.get("speed", 400),
            solar_wind_density=solar_wind.get("density", 5),
            kp_index=geomagnetic.get("kp_index", 2),
            solar_flare_class=solar_flare.get("class"),
            cosmic_radiation_level=cosmic_radiation,
            magnetic_field_strength=solar_wind.get("magnetic_field", 10),
            asteroid_alerts=asteroid_alerts,
            weather_severity=severity
        )
        
        self.current_weather = weather_data
        return weather_data
    
    def get_weather_alerts(self, weather: SpaceWeatherData) -> List[Alert]:
        """Generate alerts based on space weather conditions"""
        alerts = []
        
        # Solar flare alerts
        if weather.solar_flare_class:
            flare_class = weather.solar_flare_class[0].upper()
            if flare_class in ["M", "X"]:
                severity = AlertSeverity.CRITICAL if flare_class == "X" else AlertSeverity.HIGH
                alerts.append(Alert(
                    id=str(uuid.uuid4()),
                    astronaut_id="all",
                    alert_type="solar_flare",
                    severity=severity,
                    message=f"{weather.solar_flare_class} class solar flare detected! Radiation exposure risk elevated."
                ))
        
        # Geomagnetic storm alerts
        if weather.kp_index > 5:
            severity = AlertSeverity.HIGH if weather.kp_index > 7 else AlertSeverity.MEDIUM
            alerts.append(Alert(
                id=str(uuid.uuid4()),
                astronaut_id="all",
                alert_type="geomagnetic_storm",
                severity=severity,
                message=f"Geomagnetic storm detected (Kp={weather.kp_index:.1f}). Communications may be affected."
            ))
        
        # Cosmic radiation alerts
        if weather.cosmic_radiation_level > 75:
            alerts.append(Alert(
                id=str(uuid.uuid4()),
                astronaut_id="all",
                alert_type="cosmic_radiation",
                severity=AlertSeverity.HIGH,
                message=f"High cosmic radiation levels ({weather.cosmic_radiation_level:.1f}%). Limit EVA activities."
            ))
        
        # Solar wind alerts
        if weather.solar_wind_speed > 600:
            alerts.append(Alert(
                id=str(uuid.uuid4()),
                astronaut_id="all",
                alert_type="solar_wind",
                severity=AlertSeverity.MEDIUM,
                message=f"High-speed solar wind detected ({weather.solar_wind_speed:.0f} km/s). Monitor systems."
            ))
        
        # Asteroid alerts
        for asteroid_alert in weather.asteroid_alerts:
            alerts.append(Alert(
                id=str(uuid.uuid4()),
                astronaut_id="all",
                alert_type="asteroid_warning",
                severity=AlertSeverity.MEDIUM,
                message=asteroid_alert
            ))
        
        return alerts
    
    def get_current_weather(self) -> Optional[SpaceWeatherData]:
        """Get the most recent weather data"""
        return self.current_weather
    
    def get_weather_forecast(self, hours: int = 24) -> List[SpaceWeatherData]:
        """Generate a simple forecast (simulated)"""
        forecast = []
        base_time = datetime.now()
        
        for i in range(0, hours, 3):  # Every 3 hours
            # Simulate gradual changes
            variation = random.uniform(0.8, 1.2)
            
            forecast_data = SpaceWeatherData(
                timestamp=base_time + timedelta(hours=i),
                solar_wind_speed=400 * variation,
                solar_wind_density=5 * variation,
                kp_index=random.uniform(0, 6),
                cosmic_radiation_level=50 * variation,
                magnetic_field_strength=10 * variation,
                weather_severity=random.choice(list(AlertSeverity))
            )
            forecast.append(forecast_data)
        
        return forecast

# Global instance
space_weather_service = SpaceWeatherService()
import random
import asyncio
import math
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from app.models.schemas import VitalSigns, Alert, AlertSeverity
import uuid
import numpy as np

class VitalSignsService:
    def __init__(self):
        self.active_astronauts = {}
        self.vitals_history = {}
        self.active_alerts = {}
        self.mental_health_data = {}
        self.sleep_cycle_data = {}
        self.anomaly_thresholds = {}
        self.baseline_vitals = {}
        self.stress_indicators = {}
        
        # Initialize realistic physiological patterns
        self.circadian_cycle = 0  # Track circadian rhythm
        self.activity_state = {}  # Track activity levels
        
    def initialize_astronaut_baseline(self, astronaut_id: str):
        """Initialize baseline vital signs for personalized monitoring"""
        self.baseline_vitals[astronaut_id] = {
            'heart_rate': random.normalvariate(72, 8),
            'oxygen_level': random.normalvariate(98.5, 0.5),
            'body_temperature': random.normalvariate(37.0, 0.2),
            'bp_systolic': random.normalvariate(118, 8),
            'bp_diastolic': random.normalvariate(78, 5),
            'respiratory_rate': random.normalvariate(15, 1.5)
        }
        
        self.mental_health_data[astronaut_id] = {
            'stress_level': 0.3,  # 0-1 scale
            'fatigue_level': 0.2,
            'cognitive_performance': 0.85,
            'mood_score': 0.7,
            'anxiety_level': 0.25
        }
        
        self.sleep_cycle_data[astronaut_id] = {
            'last_sleep_start': None,
            'sleep_quality': 0.8,
            'rem_cycles': 0,
            'deep_sleep_minutes': 0,
            'sleep_efficiency': 0.85,
            'wake_count': 0
        }
        
    def generate_simulated_vitals(self, astronaut_id: str) -> VitalSigns:
        """Generate highly accurate simulated vital signs with realistic patterns"""
        base_time = datetime.now()
        
        # Initialize baseline if not exists
        if astronaut_id not in self.baseline_vitals:
            self.initialize_astronaut_baseline(astronaut_id)
        
        baseline = self.baseline_vitals[astronaut_id]
        mental_state = self.mental_health_data[astronaut_id]
        
        # Calculate circadian rhythm influence (24-hour cycle)
        hour_of_day = base_time.hour + base_time.minute / 60.0
        circadian_influence = math.sin((hour_of_day - 6) * math.pi / 12)  # Peak at 18:00, low at 06:00
        
        # Stress and fatigue modifiers
        stress_modifier = 1 + (mental_state['stress_level'] * 0.3)
        fatigue_modifier = 1 + (mental_state['fatigue_level'] * 0.2)
        
        # Heart rate with realistic variations
        hr_base = baseline['heart_rate']
        hr_stress = hr_base * stress_modifier
        hr_fatigue = hr_stress * fatigue_modifier
        hr_circadian = hr_fatigue + (circadian_influence * 5)  # 5 BPM circadian variation
        
        # Add small random variation for realism
        heart_rate = random.normalvariate(hr_circadian, 2)
        heart_rate = max(45, min(180, heart_rate))  # Physiological limits
        
        # Oxygen saturation with altitude and stress effects
        o2_base = baseline['oxygen_level']
        o2_stress = o2_base - (mental_state['stress_level'] * 1.5)  # Stress can lower O2
        o2_fatigue = o2_stress - (mental_state['fatigue_level'] * 0.8)
        oxygen_level = random.normalvariate(o2_fatigue, 0.3)
        oxygen_level = max(85, min(100, oxygen_level))
        
        # Body temperature with circadian rhythm
        temp_base = baseline['body_temperature']
        temp_circadian = temp_base + (circadian_influence * 0.5)  # 0.5°C variation
        temp_stress = temp_circadian + (mental_state['stress_level'] * 0.3)
        body_temperature = random.normalvariate(temp_stress, 0.1)
        body_temperature = max(35.0, min(40.0, body_temperature))
        
        # Blood pressure with stress correlation
        bp_sys_base = baseline['bp_systolic']
        bp_dia_base = baseline['bp_diastolic']
        
        bp_stress_factor = 1 + (mental_state['stress_level'] * 0.25)
        bp_systolic = random.normalvariate(bp_sys_base * bp_stress_factor, 3)
        bp_diastolic = random.normalvariate(bp_dia_base * bp_stress_factor, 2)
        
        bp_systolic = max(80, min(200, bp_systolic))
        bp_diastolic = max(50, min(130, bp_diastolic))
        
        # Respiratory rate with anxiety correlation
        rr_base = baseline['respiratory_rate']
        rr_anxiety = rr_base + (mental_state['anxiety_level'] * 4)  # Anxiety increases RR
        respiratory_rate = random.normalvariate(rr_anxiety, 0.5)
        respiratory_rate = max(8, min(35, respiratory_rate))
        
        # Update mental state based on vitals (feedback loop)
        self._update_mental_health_indicators(astronaut_id, heart_rate, oxygen_level, body_temperature)
        
        return VitalSigns(
            astronaut_id=astronaut_id,
            timestamp=base_time,
            heart_rate=heart_rate,
            oxygen_level=oxygen_level,
            body_temperature=body_temperature,
            blood_pressure_systolic=bp_systolic,
            blood_pressure_diastolic=bp_diastolic,
            respiratory_rate=respiratory_rate
        )
    
    def _update_mental_health_indicators(self, astronaut_id: str, heart_rate: float, 
                                       oxygen_level: float, body_temperature: float):
        """Update mental health indicators based on vital signs"""
        mental_state = self.mental_health_data[astronaut_id]
        
        # Stress detection based on elevated heart rate
        if heart_rate > 85:
            mental_state['stress_level'] = min(1.0, mental_state['stress_level'] + 0.05)
        else:
            mental_state['stress_level'] = max(0.0, mental_state['stress_level'] - 0.02)
        
        # Fatigue detection based on temperature and O2
        if body_temperature < 36.8 or oxygen_level < 97:
            mental_state['fatigue_level'] = min(1.0, mental_state['fatigue_level'] + 0.03)
        else:
            mental_state['fatigue_level'] = max(0.0, mental_state['fatigue_level'] - 0.01)
        
        # Cognitive performance affected by stress and fatigue
        performance_factor = 1.0 - (mental_state['stress_level'] * 0.3) - (mental_state['fatigue_level'] * 0.2)
        mental_state['cognitive_performance'] = max(0.3, min(1.0, performance_factor))
    
    def check_vital_alerts(self, vitals: VitalSigns) -> List[Alert]:
        """Check vital signs and generate alerts if needed"""
        alerts = []
        
        # Heart rate alerts
        if vitals.heart_rate > 120:
            severity = AlertSeverity.HIGH if vitals.heart_rate > 140 else AlertSeverity.MEDIUM
            alerts.append(Alert(
                id=str(uuid.uuid4()),
                astronaut_id=vitals.astronaut_id,
                alert_type="heart_rate_high",
                severity=severity,
                message=f"High heart rate detected: {vitals.heart_rate:.1f} BPM",
                vital_signs=vitals
            ))
        elif vitals.heart_rate < 50:
            alerts.append(Alert(
                id=str(uuid.uuid4()),
                astronaut_id=vitals.astronaut_id,
                alert_type="heart_rate_low",
                severity=AlertSeverity.MEDIUM,
                message=f"Low heart rate detected: {vitals.heart_rate:.1f} BPM",
                vital_signs=vitals
            ))
        
        # Oxygen level alerts
        if vitals.oxygen_level < 92:
            severity = AlertSeverity.CRITICAL if vitals.oxygen_level < 88 else AlertSeverity.HIGH
            alerts.append(Alert(
                id=str(uuid.uuid4()),
                astronaut_id=vitals.astronaut_id,
                alert_type="oxygen_low",
                severity=severity,
                message=f"Low oxygen saturation: {vitals.oxygen_level:.1f}%",
                vital_signs=vitals
            ))
        
        # Temperature alerts
        if vitals.body_temperature > 38.5:
            severity = AlertSeverity.HIGH if vitals.body_temperature > 39.5 else AlertSeverity.MEDIUM
            alerts.append(Alert(
                id=str(uuid.uuid4()),
                astronaut_id=vitals.astronaut_id,
                alert_type="temperature_high",
                severity=severity,
                message=f"High body temperature: {vitals.body_temperature:.1f}°C",
                vital_signs=vitals
            ))
        elif vitals.body_temperature < 36.0:
            alerts.append(Alert(
                id=str(uuid.uuid4()),
                astronaut_id=vitals.astronaut_id,
                alert_type="temperature_low",
                severity=AlertSeverity.MEDIUM,
                message=f"Low body temperature: {vitals.body_temperature:.1f}°C",
                vital_signs=vitals
            ))
        
        # Blood pressure alerts
        if vitals.blood_pressure_systolic > 140 or vitals.blood_pressure_diastolic > 90:
            alerts.append(Alert(
                id=str(uuid.uuid4()),
                astronaut_id=vitals.astronaut_id,
                alert_type="blood_pressure_high",
                severity=AlertSeverity.MEDIUM,
                message=f"High blood pressure: {vitals.blood_pressure_systolic:.0f}/{vitals.blood_pressure_diastolic:.0f}",
                vital_signs=vitals
            ))
        
        # Store alerts
        for alert in alerts:
            self.active_alerts[alert.id] = alert
            
        return alerts
    
    def record_vitals(self, vitals: VitalSigns) -> List[Alert]:
        """Record vital signs and check for alerts"""
        astronaut_id = vitals.astronaut_id
        
        # Store in history
        if astronaut_id not in self.vitals_history:
            self.vitals_history[astronaut_id] = []
        
        self.vitals_history[astronaut_id].append(vitals)
        
        # Keep only last 100 readings per astronaut
        if len(self.vitals_history[astronaut_id]) > 100:
            self.vitals_history[astronaut_id] = self.vitals_history[astronaut_id][-100:]
        
        # Check for alerts
        alerts = self.check_vital_alerts(vitals)
        
        return alerts
    
    def get_current_vitals(self, astronaut_id: str) -> Optional[VitalSigns]:
        """Get the most recent vital signs for an astronaut"""
        if astronaut_id in self.vitals_history and self.vitals_history[astronaut_id]:
            return self.vitals_history[astronaut_id][-1]
        return None
    
    def get_vital_history(self, astronaut_id: str, hours: int = 24) -> List[VitalSigns]:
        """Get vital signs history for specified hours"""
        if astronaut_id not in self.vitals_history:
            return []
        
        cutoff_time = datetime.now() - timedelta(hours=hours)
        return [
            vitals for vitals in self.vitals_history[astronaut_id]
            if vitals.timestamp >= cutoff_time
        ]
    
    def get_active_alerts(self, astronaut_id: Optional[str] = None) -> List[Alert]:
        """Get active alerts, optionally filtered by astronaut"""
        alerts = list(self.active_alerts.values())
        
        if astronaut_id:
            alerts = [alert for alert in alerts if alert.astronaut_id == astronaut_id]
        
        # Remove old alerts (older than 1 hour)
        cutoff_time = datetime.now() - timedelta(hours=1)
        alerts = [alert for alert in alerts if alert.timestamp >= cutoff_time]
        
        return sorted(alerts, key=lambda x: x.timestamp, reverse=True)
    
    def acknowledge_alert(self, alert_id: str) -> bool:
        """Acknowledge an alert"""
        if alert_id in self.active_alerts:
            self.active_alerts[alert_id].acknowledged = True
            return True
        return False
    
    def detect_anomalies(self, astronaut_id: str, vitals: VitalSigns) -> List[Dict]:
        """Advanced anomaly detection using statistical analysis"""
        anomalies = []
        
        if astronaut_id not in self.vitals_history or len(self.vitals_history[astronaut_id]) < 10:
            return anomalies  # Need sufficient history for anomaly detection
        
        history = self.vitals_history[astronaut_id][-20:]  # Last 20 readings
        
        # Calculate statistical baselines
        hr_values = [v.heart_rate for v in history]
        o2_values = [v.oxygen_level for v in history]
        temp_values = [v.body_temperature for v in history]
        
        hr_mean = np.mean(hr_values)
        hr_std = np.std(hr_values)
        o2_mean = np.mean(o2_values)
        o2_std = np.std(o2_values)
        temp_mean = np.mean(temp_values)
        temp_std = np.std(temp_values)
        
        # Detect statistical anomalies (3-sigma rule)
        if abs(vitals.heart_rate - hr_mean) > 3 * hr_std:
            anomalies.append({
                'type': 'statistical_anomaly',
                'parameter': 'heart_rate',
                'value': vitals.heart_rate,
                'expected_range': f"{hr_mean - 2*hr_std:.1f} - {hr_mean + 2*hr_std:.1f}",
                'severity': 'high' if abs(vitals.heart_rate - hr_mean) > 4 * hr_std else 'medium'
            })
        
        if abs(vitals.oxygen_level - o2_mean) > 3 * o2_std:
            anomalies.append({
                'type': 'statistical_anomaly',
                'parameter': 'oxygen_level',
                'value': vitals.oxygen_level,
                'expected_range': f"{o2_mean - 2*o2_std:.1f} - {o2_mean + 2*o2_std:.1f}",
                'severity': 'high' if vitals.oxygen_level < o2_mean - 3*o2_std else 'medium'
            })
        
        # Trend-based anomalies (rapid changes)
        if len(history) >= 5:
            recent_hr = [v.heart_rate for v in history[-5:]]
            hr_trend = np.polyfit(range(5), recent_hr, 1)[0]  # Slope of trend
            
            if abs(hr_trend) > 10:  # HR changing by >10 BPM per reading
                anomalies.append({
                    'type': 'trend_anomaly',
                    'parameter': 'heart_rate_trend',
                    'value': hr_trend,
                    'description': f"Rapid HR change: {hr_trend:+.1f} BPM/reading",
                    'severity': 'high' if abs(hr_trend) > 15 else 'medium'
                })
        
        return anomalies
    
    def update_sleep_cycle(self, astronaut_id: str, activity_level: float = 0.0):
        """Update sleep cycle tracking based on activity and vitals"""
        if astronaut_id not in self.sleep_cycle_data:
            return
        
        sleep_data = self.sleep_cycle_data[astronaut_id]
        current_time = datetime.now()
        
        # Detect sleep state based on activity and vitals
        if activity_level < 0.1:  # Very low activity suggests sleep
            if sleep_data['last_sleep_start'] is None:
                sleep_data['last_sleep_start'] = current_time
                sleep_data['wake_count'] = 0
        else:
            if sleep_data['last_sleep_start'] is not None:
                # Calculate sleep duration
                sleep_duration = (current_time - sleep_data['last_sleep_start']).total_seconds() / 3600
                
                if sleep_duration > 1:  # At least 1 hour of sleep
                    sleep_data['deep_sleep_minutes'] += max(0, (sleep_duration - 2) * 60)  # Deep sleep after 2 hours
                    sleep_data['rem_cycles'] += int(sleep_duration / 1.5)  # REM cycles every 1.5 hours
                    sleep_data['sleep_efficiency'] = min(1.0, sleep_duration / 8.0)  # Efficiency based on 8-hour target
                
                sleep_data['last_sleep_start'] = None
    
    def get_mental_health_status(self, astronaut_id: str) -> Dict:
        """Get comprehensive mental health status"""
        if astronaut_id not in self.mental_health_data:
            return {}
        
        mental_state = self.mental_health_data[astronaut_id]
        sleep_data = self.sleep_cycle_data[astronaut_id]
        
        return {
            **mental_state,
            'sleep_quality': sleep_data['sleep_quality'],
            'sleep_efficiency': sleep_data['sleep_efficiency'],
            'total_rem_cycles': sleep_data['rem_cycles'],
            'deep_sleep_hours': sleep_data['deep_sleep_minutes'] / 60,
            'wellness_score': self._calculate_wellness_score(mental_state, sleep_data)
        }
    
    def _calculate_wellness_score(self, mental_state: Dict, sleep_data: Dict) -> float:
        """Calculate overall wellness score (0-1)"""
        scores = [
            1.0 - mental_state['stress_level'],
            1.0 - mental_state['fatigue_level'],
            mental_state['cognitive_performance'],
            mental_state['mood_score'],
            1.0 - mental_state['anxiety_level'],
            sleep_data['sleep_efficiency']
        ]
        return sum(scores) / len(scores)

# Global instance
vitals_service = VitalSignsService()
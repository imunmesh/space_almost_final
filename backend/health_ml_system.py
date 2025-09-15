"""
Enhanced Health Monitoring System with Real-Time ML Analysis
Integrates advanced ML algorithms for predictive health analytics
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class HealthMLAnalyzer:
    """Advanced ML analyzer for astronaut health data"""
    
    def __init__(self):
        self.anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
        self.health_predictor = RandomForestRegressor(n_estimators=100, random_state=42)
        self.stress_analyzer = KMeans(n_clusters=4, random_state=42)  # 4 stress levels
        self.scaler = StandardScaler()
        
        self.is_trained = False
        self.health_history = []
        self.stress_levels = ['Low', 'Normal', 'Elevated', 'High']
        
        # Normal ranges for vital signs
        self.normal_ranges = {
            'heart_rate': {'min': 60, 'max': 100, 'optimal': 72},
            'blood_pressure_systolic': {'min': 90, 'max': 140, 'optimal': 120},
            'blood_pressure_diastolic': {'min': 60, 'max': 90, 'optimal': 80},
            'oxygen_saturation': {'min': 95, 'max': 100, 'optimal': 98},
            'body_temperature': {'min': 36.1, 'max': 37.2, 'optimal': 36.8},
            'respiratory_rate': {'min': 12, 'max': 20, 'optimal': 16}
        }
        
    def generate_training_data(self, num_samples: int = 1000) -> pd.DataFrame:
        """Generate realistic health training data"""
        np.random.seed(42)
        
        data = []
        for i in range(num_samples):
            # Simulate different health conditions
            health_condition = np.random.choice(['excellent', 'good', 'fair', 'poor'], p=[0.3, 0.4, 0.2, 0.1])
            
            if health_condition == 'excellent':
                hr_base = np.random.normal(70, 5)
                bp_sys_base = np.random.normal(115, 8)
                bp_dia_base = np.random.normal(75, 5)
                o2_base = np.random.normal(98.5, 0.5)
                temp_base = np.random.normal(36.8, 0.2)
                resp_base = np.random.normal(15, 2)
                stress_level = 0
            elif health_condition == 'good':
                hr_base = np.random.normal(75, 8)
                bp_sys_base = np.random.normal(120, 10)
                bp_dia_base = np.random.normal(80, 7)
                o2_base = np.random.normal(97.8, 0.8)
                temp_base = np.random.normal(36.9, 0.3)
                resp_base = np.random.normal(16, 2)
                stress_level = 1
            elif health_condition == 'fair':
                hr_base = np.random.normal(85, 12)
                bp_sys_base = np.random.normal(130, 15)
                bp_dia_base = np.random.normal(85, 10)
                o2_base = np.random.normal(96.5, 1.2)
                temp_base = np.random.normal(37.0, 0.4)
                resp_base = np.random.normal(18, 3)
                stress_level = 2
            else:  # poor
                hr_base = np.random.normal(95, 15)
                bp_sys_base = np.random.normal(140, 20)
                bp_dia_base = np.random.normal(90, 12)
                o2_base = np.random.normal(95.0, 2.0)
                temp_base = np.random.normal(37.2, 0.5)
                resp_base = np.random.normal(20, 4)
                stress_level = 3
            
            # Add space environment effects
            space_stress = np.random.uniform(0, 1)
            microgravity_effect = np.random.uniform(-0.1, 0.1)
            radiation_exposure = np.random.uniform(0, 0.05)
            
            sample = {
                'heart_rate': max(50, hr_base + space_stress * 10 + microgravity_effect * 5),
                'blood_pressure_systolic': max(80, bp_sys_base + space_stress * 15),
                'blood_pressure_diastolic': max(50, bp_dia_base + space_stress * 10),
                'oxygen_saturation': min(100, max(90, o2_base - radiation_exposure * 20)),
                'body_temperature': temp_base + radiation_exposure * 2,
                'respiratory_rate': max(10, resp_base + space_stress * 3),
                'stress_level': stress_level,
                'space_adaptation': np.random.uniform(0.5, 1.0),
                'sleep_quality': np.random.uniform(0.3, 1.0),
                'exercise_level': np.random.uniform(0.2, 1.0),
                'hydration_level': np.random.uniform(0.6, 1.0),
                'is_anomaly': 1 if health_condition == 'poor' and space_stress > 0.7 else 0
            }
            
            data.append(sample)
        
        return pd.DataFrame(data)
    
    async def train_models(self):
        """Train ML models with health data"""
        logger.info("Training health ML models...")
        
        # Generate training data
        training_data = self.generate_training_data(2000)
        
        # Prepare features for anomaly detection
        anomaly_features = ['heart_rate', 'blood_pressure_systolic', 'blood_pressure_diastolic', 
                           'oxygen_saturation', 'body_temperature', 'respiratory_rate']
        X_anomaly = training_data[anomaly_features].values
        X_anomaly_scaled = self.scaler.fit_transform(X_anomaly)
        
        # Train anomaly detector
        self.anomaly_detector.fit(X_anomaly_scaled)
        
        # Prepare features for health prediction
        health_features = anomaly_features + ['space_adaptation', 'sleep_quality', 'exercise_level']
        X_health = training_data[health_features].values
        y_health = training_data['stress_level'].values
        
        # Train health predictor
        self.health_predictor.fit(X_health, y_health)
        
        # Train stress analyzer
        stress_features = ['heart_rate', 'blood_pressure_systolic', 'respiratory_rate']
        X_stress = training_data[stress_features].values
        self.stress_analyzer.fit(X_stress)
        
        self.is_trained = True
        logger.info("Health ML models trained successfully")
        
    def analyze_vital_signs(self, vitals: Dict) -> Dict:
        """Analyze vital signs using ML models"""
        if not self.is_trained:
            return {'error': 'Models not trained yet'}
        
        try:
            # Prepare features for analysis
            features = np.array([[
                vitals.get('heart_rate', 72),
                vitals.get('blood_pressure_systolic', 120),
                vitals.get('blood_pressure_diastolic', 80),
                vitals.get('oxygen_saturation', 98),
                vitals.get('body_temperature', 36.8),
                vitals.get('respiratory_rate', 16)
            ]])
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Detect anomalies
            anomaly_score = self.anomaly_detector.decision_function(features_scaled)[0]
            is_anomaly = self.anomaly_detector.predict(features_scaled)[0] == -1
            
            # Predict stress level
            health_features = np.array([[
                vitals.get('heart_rate', 72),
                vitals.get('blood_pressure_systolic', 120),
                vitals.get('blood_pressure_diastolic', 80),
                vitals.get('oxygen_saturation', 98),
                vitals.get('body_temperature', 36.8),
                vitals.get('respiratory_rate', 16),
                vitals.get('space_adaptation', 0.8),
                vitals.get('sleep_quality', 0.8),
                vitals.get('exercise_level', 0.7)
            ]])
            
            predicted_stress = self.health_predictor.predict(health_features)[0]
            stress_category = self.stress_levels[min(3, max(0, int(predicted_stress)))]
            
            # Analyze stress cluster
            stress_features = features[:, [0, 1, 5]]  # HR, BP_sys, RR
            stress_cluster = self.stress_analyzer.predict(stress_features)[0]
            
            # Calculate health score
            health_score = self.calculate_health_score(vitals)
            
            # Generate recommendations
            recommendations = self.generate_recommendations(vitals, health_score, stress_category)
            
            # Assess risk factors
            risk_factors = self.assess_risk_factors(vitals)
            
            analysis = {
                'health_score': health_score,
                'anomaly_detected': is_anomaly,
                'anomaly_confidence': abs(anomaly_score),
                'stress_level': stress_category,
                'stress_cluster': int(stress_cluster),
                'predicted_stress_score': float(predicted_stress),
                'risk_factors': risk_factors,
                'recommendations': recommendations,
                'vital_status': self.assess_vital_status(vitals),
                'trends': self.analyze_trends(),
                'timestamp': datetime.now().isoformat()
            }
            
            # Store for trend analysis
            self.health_history.append({
                'vitals': vitals,
                'analysis': analysis,
                'timestamp': datetime.now()
            })
            
            # Keep only recent history
            if len(self.health_history) > 1000:
                self.health_history = self.health_history[-1000:]
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing vital signs: {e}")
            return {'error': str(e)}
    
    def calculate_health_score(self, vitals: Dict) -> float:
        """Calculate overall health score (0-100)"""
        score = 100.0
        
        for vital, value in vitals.items():
            if vital in self.normal_ranges:
                ranges = self.normal_ranges[vital]
                if value < ranges['min'] or value > ranges['max']:
                    # Penalize out-of-range values
                    deviation = min(abs(value - ranges['min']), abs(value - ranges['max']))
                    penalty = min(30, deviation * 2)
                    score -= penalty
                else:
                    # Bonus for optimal values
                    optimal_deviation = abs(value - ranges['optimal'])
                    bonus = max(0, 5 - optimal_deviation)
                    score += bonus
        
        return max(0, min(100, score))
    
    def assess_vital_status(self, vitals: Dict) -> Dict:
        """Assess individual vital sign status"""
        status = {}
        
        for vital, value in vitals.items():
            if vital in self.normal_ranges:
                ranges = self.normal_ranges[vital]
                if value < ranges['min']:
                    status[vital] = 'low'
                elif value > ranges['max']:
                    status[vital] = 'high'
                else:
                    status[vital] = 'normal'
        
        return status
    
    def assess_risk_factors(self, vitals: Dict) -> List[Dict]:
        """Identify potential risk factors"""
        risks = []
        
        hr = vitals.get('heart_rate', 72)
        bp_sys = vitals.get('blood_pressure_systolic', 120)
        bp_dia = vitals.get('blood_pressure_diastolic', 80)
        o2_sat = vitals.get('oxygen_saturation', 98)
        temp = vitals.get('body_temperature', 36.8)
        
        # Cardiovascular risks
        if hr > 100:
            risks.append({
                'type': 'cardiovascular',
                'severity': 'moderate' if hr < 120 else 'high',
                'description': 'Elevated heart rate detected',
                'recommendation': 'Monitor for stress or dehydration'
            })
        
        if bp_sys > 140 or bp_dia > 90:
            risks.append({
                'type': 'cardiovascular',
                'severity': 'high',
                'description': 'Hypertension detected',
                'recommendation': 'Immediate medical consultation required'
            })
        
        # Respiratory risks
        if o2_sat < 95:
            risks.append({
                'type': 'respiratory',
                'severity': 'high',
                'description': 'Low oxygen saturation',
                'recommendation': 'Check oxygen supply and ventilation'
            })
        
        # Temperature risks
        if temp > 37.5:
            risks.append({
                'type': 'infection',
                'severity': 'moderate',
                'description': 'Elevated body temperature',
                'recommendation': 'Monitor for signs of infection'
            })
        
        return risks
    
    def generate_recommendations(self, vitals: Dict, health_score: float, stress_level: str) -> List[str]:
        """Generate personalized health recommendations"""
        recommendations = []
        
        if health_score < 70:
            recommendations.append("Overall health score is concerning. Consider rest and medical consultation.")
        
        if stress_level in ['Elevated', 'High']:
            recommendations.append("Stress levels are elevated. Try breathing exercises or meditation.")
            recommendations.append("Consider reducing workload if possible.")
        
        hr = vitals.get('heart_rate', 72)
        if hr > 90:
            recommendations.append("Heart rate is elevated. Ensure adequate hydration and rest.")
        
        o2_sat = vitals.get('oxygen_saturation', 98)
        if o2_sat < 97:
            recommendations.append("Oxygen levels could be improved. Check breathing techniques.")
        
        temp = vitals.get('body_temperature', 36.8)
        if temp > 37.0:
            recommendations.append("Body temperature is slightly elevated. Monitor hydration.")
        
        # Space-specific recommendations
        recommendations.append("Perform daily exercise routine to maintain muscle mass in microgravity.")
        recommendations.append("Ensure adequate calcium and vitamin D intake.")
        
        return recommendations
    
    def analyze_trends(self) -> Dict:
        """Analyze health trends over time"""
        if len(self.health_history) < 5:
            return {'trend_analysis': 'Insufficient data for trend analysis'}
        
        recent_scores = [h['analysis']['health_score'] for h in self.health_history[-10:]]
        recent_stress = [h['analysis']['predicted_stress_score'] for h in self.health_history[-10:]]
        
        # Calculate trends
        score_trend = 'stable'
        if len(recent_scores) >= 3:
            if recent_scores[-1] > recent_scores[-3] + 5:
                score_trend = 'improving'
            elif recent_scores[-1] < recent_scores[-3] - 5:
                score_trend = 'declining'
        
        stress_trend = 'stable'
        if len(recent_stress) >= 3:
            if recent_stress[-1] > recent_stress[-3] + 0.5:
                stress_trend = 'increasing'
            elif recent_stress[-1] < recent_stress[-3] - 0.5:
                stress_trend = 'decreasing'
        
        return {
            'health_score_trend': score_trend,
            'stress_trend': stress_trend,
            'average_score_24h': np.mean(recent_scores),
            'data_points': len(self.health_history)
        }

class RealTimeHealthMonitor:
    """Real-time health monitoring with continuous ML analysis"""
    
    def __init__(self):
        self.ml_analyzer = HealthMLAnalyzer()
        self.is_monitoring = False
        self.current_vitals = {}
        self.alerts = []
        self.monitoring_interval = 2  # seconds
        
    async def initialize(self):
        """Initialize the health monitoring system"""
        logger.info("Initializing Real-Time Health Monitor...")
        await self.ml_analyzer.train_models()
        logger.info("Health monitoring system ready")
    
    async def start_monitoring(self):
        """Start continuous health monitoring"""
        self.is_monitoring = True
        logger.info("Starting real-time health monitoring")
        
        while self.is_monitoring:
            try:
                # Generate or collect real vital signs
                vitals = self.collect_vital_signs()
                
                # Analyze with ML
                analysis = self.ml_analyzer.analyze_vital_signs(vitals)
                
                # Check for alerts
                await self.check_health_alerts(analysis)
                
                # Update current state
                self.current_vitals = vitals
                
                # Wait for next reading
                await asyncio.sleep(self.monitoring_interval)
                
            except Exception as e:
                logger.error(f"Error in health monitoring loop: {e}")
                await asyncio.sleep(5)
    
    def collect_vital_signs(self) -> Dict:
        """Collect or simulate vital signs data"""
        # In production, this would interface with actual sensors
        # For now, simulate realistic variations
        
        base_time = datetime.now()
        time_factor = (base_time.hour * 60 + base_time.minute) / 1440  # 0-1 for daily cycle
        
        # Simulate circadian rhythm effects
        hr_variation = 5 * np.sin(2 * np.pi * time_factor)
        temp_variation = 0.3 * np.sin(2 * np.pi * time_factor - np.pi/4)
        
        # Add some random variation
        vitals = {
            'heart_rate': 72 + hr_variation + np.random.normal(0, 3),
            'blood_pressure_systolic': 120 + np.random.normal(0, 8),
            'blood_pressure_diastolic': 80 + np.random.normal(0, 5),
            'oxygen_saturation': 98 + np.random.normal(0, 0.5),
            'body_temperature': 36.8 + temp_variation + np.random.normal(0, 0.1),
            'respiratory_rate': 16 + np.random.normal(0, 1),
            'space_adaptation': 0.8 + np.random.normal(0, 0.1),
            'sleep_quality': 0.7 + np.random.normal(0, 0.15),
            'exercise_level': 0.6 + np.random.normal(0, 0.2),
            'hydration_level': 0.8 + np.random.normal(0, 0.1)
        }
        
        # Ensure realistic ranges
        vitals['heart_rate'] = max(50, min(120, vitals['heart_rate']))
        vitals['oxygen_saturation'] = max(90, min(100, vitals['oxygen_saturation']))
        vitals['body_temperature'] = max(35.0, min(39.0, vitals['body_temperature']))
        
        return vitals
    
    async def check_health_alerts(self, analysis: Dict):
        """Check for health alerts and trigger notifications"""
        if analysis.get('anomaly_detected'):
            alert = {
                'id': f"health_alert_{datetime.now().timestamp()}",
                'type': 'HEALTH_ANOMALY',
                'severity': 'HIGH' if analysis['health_score'] < 60 else 'MEDIUM',
                'message': 'Unusual vital sign pattern detected',
                'analysis': analysis,
                'timestamp': datetime.now().isoformat(),
                'acknowledged': False
            }
            
            self.alerts.append(alert)
            logger.warning(f"Health alert triggered: {alert['message']}")
        
        # Check for critical values
        if analysis['health_score'] < 50:
            alert = {
                'id': f"critical_health_{datetime.now().timestamp()}",
                'type': 'CRITICAL_HEALTH',
                'severity': 'CRITICAL',
                'message': f"Critical health score: {analysis['health_score']:.1f}",
                'analysis': analysis,
                'timestamp': datetime.now().isoformat(),
                'acknowledged': False
            }
            
            self.alerts.append(alert)
            logger.critical(f"Critical health alert: {alert['message']}")
    
    def stop_monitoring(self):
        """Stop health monitoring"""
        self.is_monitoring = False
        logger.info("Health monitoring stopped")
    
    def get_current_status(self) -> Dict:
        """Get current health monitoring status"""
        if not self.current_vitals:
            return {'status': 'No data available'}
        
        analysis = self.ml_analyzer.analyze_vital_signs(self.current_vitals)
        
        return {
            'vitals': self.current_vitals,
            'analysis': analysis,
            'is_monitoring': self.is_monitoring,
            'alerts': [a for a in self.alerts if not a['acknowledged']],
            'monitoring_duration': len(self.ml_analyzer.health_history) * self.monitoring_interval,
            'last_update': datetime.now().isoformat()
        }

# Global health monitor instance
health_monitor = RealTimeHealthMonitor()

async def initialize_health_system():
    """Initialize the global health monitoring system"""
    await health_monitor.initialize()
    return health_monitor

async def start_health_monitoring():
    """Start the global health monitoring system"""
    await health_monitor.start_monitoring()

def get_health_status():
    """Get current health monitoring data for API endpoints"""
    return health_monitor.get_current_status()
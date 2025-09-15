"""
AI Mission Director - Neural Network and Analysis Components
"""

from ai_mission_director_core import *

class NeuralThreatAnalyzer:
    """Advanced neural network for threat pattern recognition"""
    
    def __init__(self):
        self.model = MLPClassifier(
            hidden_layer_sizes=(128, 64, 32),
            activation='relu',
            solver='adam',
            max_iter=500,
            random_state=42
        )
        self.is_trained = False
        self.feature_names = [
            'altitude', 'velocity', 'life_support', 'power_level',
            'oxygen_level', 'co2_level', 'cabin_pressure', 'temperature',
            'radiation_exposure', 'fuel_remaining', 'crew_health',
            'system_integrity', 'debris_proximity', 'weather_severity'
        ]
        
    def extract_features(self, context: MissionContext, external_data: Dict) -> np.ndarray:
        """Extract features for neural network analysis"""
        features = [
            context.altitude,
            context.velocity,
            context.life_support_status,
            context.power_level,
            context.oxygen_level / 100.0,
            context.co2_level / 1000.0,  # Normalize to 0-1 range
            context.cabin_pressure,
            context.temperature / 100.0,  # Normalize
            context.radiation_exposure / 50.0,  # Normalize to expected max
            context.fuel_remaining / 100.0,
            context.crew_health_avg,
            context.system_integrity,
            external_data.get('debris_proximity', 0.0),
            external_data.get('space_weather_severity', 0.0)
        ]
        return np.array(features).reshape(1, -1)
    
    def train_model(self, training_data: List[Tuple[MissionContext, Dict, ThreatLevel]]):
        """Train the neural network on historical mission data"""
        if len(training_data) < 10:
            logger.warning("Insufficient training data. Using pre-trained weights.")
            return
            
        X = []
        y = []
        
        threat_mapping = {
            ThreatLevel.MINIMAL: 0,
            ThreatLevel.LOW: 1,
            ThreatLevel.MODERATE: 2,
            ThreatLevel.HIGH: 3,
            ThreatLevel.CRITICAL: 4,
            ThreatLevel.CATASTROPHIC: 5
        }
        
        for context, external, threat in training_data:
            features = self.extract_features(context, external)
            X.append(features[0])
            y.append(threat_mapping[threat])
        
        X = np.array(X)
        y = np.array(y)
        
        self.model.fit(X, y)
        self.is_trained = True
        logger.info("Neural threat analyzer trained successfully")
    
    def predict_threat_level(self, context: MissionContext, external_data: Dict) -> Tuple[ThreatLevel, float]:
        """Predict threat level using neural network"""
        if not self.is_trained:
            # Use rule-based fallback
            return self._fallback_threat_assessment(context, external_data)
        
        features = self.extract_features(context, external_data)
        prediction = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]
        confidence = max(probabilities)
        
        threat_levels = [ThreatLevel.MINIMAL, ThreatLevel.LOW, ThreatLevel.MODERATE,
                        ThreatLevel.HIGH, ThreatLevel.CRITICAL, ThreatLevel.CATASTROPHIC]
        
        return threat_levels[prediction], confidence
    
    def _fallback_threat_assessment(self, context: MissionContext, external_data: Dict) -> Tuple[ThreatLevel, float]:
        """Rule-based fallback when neural network isn't available"""
        risk_score = 0.0
        
        # Critical system failures
        if context.life_support_status < 0.3:
            risk_score += 0.4
        if context.power_level < 0.2:
            risk_score += 0.3
        if context.oxygen_level < 16:  # Dangerous oxygen level
            risk_score += 0.5
        if context.cabin_pressure < 0.3:
            risk_score += 0.4
        
        # Environmental hazards
        if context.radiation_exposure > 20:  # High radiation
            risk_score += 0.3
        if external_data.get('debris_proximity', 0) > 0.8:
            risk_score += 0.4
        
        # Crew health
        if context.crew_health_avg < 0.4:
            risk_score += 0.2
        
        if risk_score >= 0.8:
            return ThreatLevel.CATASTROPHIC, 0.9
        elif risk_score >= 0.6:
            return ThreatLevel.CRITICAL, 0.8
        elif risk_score >= 0.4:
            return ThreatLevel.HIGH, 0.7
        elif risk_score >= 0.2:
            return ThreatLevel.MODERATE, 0.6
        elif risk_score >= 0.1:
            return ThreatLevel.LOW, 0.5
        else:
            return ThreatLevel.MINIMAL, 0.4
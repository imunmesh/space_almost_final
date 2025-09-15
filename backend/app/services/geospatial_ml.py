"""
Geospatial Machine Learning Service
Handles ML models for deforestation detection and environmental analysis
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import json

class GeospatialMLService:
    def __init__(self):
        self.rf_model: Optional[RandomForestClassifier] = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.model_metrics = {}
        self.feature_names = [
            'ndvi', 'evi', 'nbr', 'savi',
            'red', 'green', 'blue', 'nir', 'swir1', 'swir2',
            'contrast', 'dissimilarity', 'homogeneity', 'correlation',
            'season', 'month', 'year',
            'latitude', 'longitude', 'elevation', 'slope'
        ]
    
    def extract_features(self, data_point: Dict) -> List[float]:
        """Extract features from a satellite data point"""
        # Default values for missing features
        defaults = {
            'ndvi': 0.5, 'evi': 0.4, 'nbr': 0.3, 'savi': 0.35,
            'red': 0.3, 'green': 0.2, 'blue': 0.15, 'nir': 0.6,
            'swir1': 0.4, 'swir2': 0.3, 'contrast': 0.5,
            'dissimilarity': 0.4, 'homogeneity': 0.6, 'correlation': 0.3,
            'season': 1, 'month': 6, 'year': 2023,
            'latitude': 0.0, 'longitude': 0.0, 'elevation': 500, 'slope': 10
        }
        
        features = []
        for feature_name in self.feature_names:
            value = data_point.get(feature_name, defaults.get(feature_name, 0.0))
            features.append(float(value))
        
        return features
    
    def train_random_forest_model(self, features: np.ndarray, labels: np.ndarray) -> Dict:
        """Train Random Forest model for deforestation detection"""
        try:
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                features, labels, test_size=0.2, random_state=42, stratify=labels
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train Random Forest model
            self.rf_model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                class_weight='balanced'
            )
            
            start_time = datetime.now()
            self.rf_model.fit(X_train_scaled, y_train)
            training_time = (datetime.now() - start_time).total_seconds()
            
            # Make predictions
            y_pred = self.rf_model.predict(X_test_scaled)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            report = classification_report(y_test, y_pred, output_dict=True)
            
            # Feature importance
            feature_importance = dict(zip(
                self.feature_names, 
                self.rf_model.feature_importances_
            ))
            
            self.model_metrics = {
                'accuracy': accuracy,
                'precision': report['weighted avg']['precision'],
                'recall': report['weighted avg']['recall'],
                'f1_score': report['weighted avg']['f1-score'],
                'feature_importance': feature_importance,
                'training_samples': len(X_train),
                'test_samples': len(X_test),
                'training_time': training_time
            }
            
            self.is_trained = True
            
            return {
                'status': 'success',
                'accuracy': accuracy,
                'training_time': training_time,
                'model_type': 'RandomForest',
                'features_used': len(self.feature_names),
                'training_samples': len(X_train),
                'metrics': self.model_metrics
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def get_feature_names(self) -> List[str]:
        """Get feature names for model interpretation"""
        return self.feature_names
    
    def predict_deforestation(self, satellite_data: List[Dict]) -> List[Dict]:
        """Predict deforestation probability for new satellite data"""
        if not self.is_trained or self.rf_model is None:
            return [{'error': 'Model not trained yet'}]
        
        predictions = []
        
        for data_point in satellite_data:
            try:
                # Extract features
                features = self.extract_features(data_point)
                features_scaled = self.scaler.transform([features])
                
                # Predict
                probability = self.rf_model.predict_proba(features_scaled)[0]
                prediction = self.rf_model.predict(features_scaled)[0]
                
                result = {
                    'location': {
                        'lat': data_point.get('latitude', 0.0),
                        'lon': data_point.get('longitude', 0.0)
                    },
                    'deforestation_probability': float(probability[1]),
                    'prediction': 'Deforestation' if prediction == 1 else 'No Deforestation',
                    'confidence': float(max(probability)),
                    'risk_level': self.classify_risk_level(probability[1]),
                    'timestamp': datetime.now().isoformat()
                }
                
                predictions.append(result)
                
            except Exception as e:
                predictions.append({
                    'error': str(e),
                    'location': {
                        'lat': data_point.get('latitude', 0.0),
                        'lon': data_point.get('longitude', 0.0)
                    }
                })
        
        return predictions
    
    def classify_risk_level(self, probability: float) -> str:
        """Classify deforestation risk level based on probability"""
        if probability >= 0.8:
            return 'Critical'
        elif probability >= 0.6:
            return 'High'
        elif probability >= 0.4:
            return 'Medium'
        else:
            return 'Low'
    
    def generate_synthetic_training_data(self, num_samples: int = 1000) -> Tuple[np.ndarray, np.ndarray]:
        """Generate synthetic training data for demonstration"""
        features = []
        labels = []
        
        for i in range(num_samples):
            # Generate synthetic features
            if np.random.random() < 0.3:  # 30% deforestation samples
                # Deforestation case: lower vegetation indices
                ndvi = np.random.normal(0.2, 0.1)
                evi = np.random.normal(0.15, 0.08)
                nbr = np.random.normal(0.1, 0.1)
                label = 1
            else:
                # Healthy forest case: higher vegetation indices
                ndvi = np.random.normal(0.7, 0.15)
                evi = np.random.normal(0.6, 0.12)
                nbr = np.random.normal(0.5, 0.1)
                label = 0
            
            # Clip values to valid ranges
            ndvi = np.clip(ndvi, -1, 1)
            evi = np.clip(evi, -1, 1)
            nbr = np.clip(nbr, -1, 1)
            
            # Generate other features
            feature_vector = [
                ndvi, evi, nbr, np.random.normal(0.4, 0.1),  # SAVI
                np.random.normal(0.3, 0.1),  # Red
                np.random.normal(0.2, 0.08), # Green
                np.random.normal(0.15, 0.06), # Blue
                np.random.normal(0.6, 0.15),  # NIR
                np.random.normal(0.4, 0.1),   # SWIR1
                np.random.normal(0.3, 0.08),  # SWIR2
                np.random.normal(0.5, 0.2),   # Contrast
                np.random.normal(0.4, 0.15),  # Dissimilarity
                np.random.normal(0.6, 0.1),   # Homogeneity
                np.random.normal(0.3, 0.1),   # Correlation
                np.random.randint(0, 4),      # Season
                np.random.randint(1, 13),     # Month
                np.random.choice([2020, 2021, 2022, 2023]),  # Year
                np.random.uniform(-60, 60),   # Latitude
                np.random.uniform(-180, 180), # Longitude
                np.random.uniform(0, 3000),   # Elevation
                np.random.uniform(0, 45),     # Slope
            ]
            
            features.append(feature_vector)
            labels.append(label)
        
        return np.array(features), np.array(labels)
    
    def time_series_analysis(self, historical_data: List[Dict]) -> Dict:
        """Perform time-series analysis for trend detection"""
        try:
            # Organize data by time
            df = pd.DataFrame(historical_data)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.sort_values('timestamp')
            
            # Calculate trends
            trends = {}
            
            for metric in ['ndvi', 'evi', 'nbr']:
                if metric in df.columns and len(df) > 1:
                    # Simple linear trend
                    x = np.arange(len(df))
                    y = df[metric].fillna(0).values.astype(float)
                    
                    # Calculate slope
                    if len(y) > 1:
                        slope = np.polyfit(x, y, 1)[0]
                    else:
                        slope = 0.0
                    
                    trends[metric] = {
                        'slope': float(slope),
                        'trend': 'Increasing' if slope > 0.01 else 'Decreasing' if slope < -0.01 else 'Stable',
                        'current_value': float(y[-1]) if len(y) > 0 else 0.0,
                        'change_rate': float(slope * 365) if slope != 0 else 0.0
                    }
            
            # Detect change points
            change_points = self.detect_change_points(df)
            
            # Generate insights
            insights = self.generate_trend_insights(trends, change_points)
            
            return {
                'trends': trends,
                'change_points': change_points,
                'insights': insights,
                'data_points': len(df),
                'analysis_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def detect_change_points(self, df: pd.DataFrame) -> List[Dict]:
        """Detect significant change points in time series data"""
        change_points = []
        
        for metric in ['ndvi', 'evi', 'nbr']:
            if metric in df.columns and len(df) > 10:
                values = df[metric].fillna(0).values.astype(float)
                timestamps = df['timestamp'].values
                
                # Simple change point detection using moving average
                window_size = max(5, len(values) // 10)
                
                for i in range(window_size, len(values) - window_size):
                    before_avg = float(np.mean(values[i-window_size:i]))
                    after_avg = float(np.mean(values[i:i+window_size]))
                    
                    # Significant change threshold
                    if abs(before_avg - after_avg) > 0.2:
                        change_points.append({
                            'metric': metric,
                            'timestamp': timestamps[i].isoformat(),
                            'before_value': before_avg,
                            'after_value': after_avg,
                            'change_magnitude': float(abs(before_avg - after_avg)),
                            'change_type': 'Improvement' if after_avg > before_avg else 'Degradation'
                        })
        
        return change_points
    
    def generate_trend_insights(self, trends: Dict, change_points: List[Dict]) -> List[str]:
        """Generate human-readable insights from trend analysis"""
        insights = []
        
        # Vegetation health trends
        if 'ndvi' in trends:
            ndvi_trend = trends['ndvi']
            if ndvi_trend['trend'] == 'Decreasing':
                insights.append(f"Vegetation health is declining at a rate of {abs(ndvi_trend['change_rate']):.3f} NDVI units per year")
            elif ndvi_trend['trend'] == 'Increasing':
                insights.append(f"Vegetation health is improving at a rate of {ndvi_trend['change_rate']:.3f} NDVI units per year")
        
        # Change point insights
        critical_changes = [cp for cp in change_points if cp['change_magnitude'] > 0.3]
        if critical_changes:
            insights.append(f"Detected {len(critical_changes)} critical environmental changes")
        
        # Risk assessment
        high_risk_points = [cp for cp in change_points if cp['change_type'] == 'Degradation']
        if len(high_risk_points) > len(change_points) * 0.5:
            insights.append("Area shows signs of environmental degradation")
        
        return insights
    
    def forest_fragmentation_analysis(self, region_data: List[Dict]) -> Dict:
        """Analyze forest fragmentation patterns"""
        try:
            # Simulate fragmentation analysis
            total_area = len(region_data)
            forest_patches = []
            
            # Simple fragmentation simulation
            patch_size = max(1, total_area // 10)
            num_patches = total_area // patch_size
            
            for i in range(num_patches):
                # Simulate patch characteristics
                patch = {
                    'id': i + 1,
                    'size_hectares': np.random.uniform(10, 1000),
                    'perimeter_area_ratio': np.random.uniform(0.1, 0.8),
                    'connectivity_index': np.random.uniform(0.2, 0.9),
                    'vegetation_density': np.random.uniform(0.3, 0.95)
                }
                forest_patches.append(patch)
            
            # Calculate fragmentation metrics
            avg_patch_size = np.mean([p['size_hectares'] for p in forest_patches])
            total_forest_area = sum(p['size_hectares'] for p in forest_patches)
            fragmentation_index = 1 - (avg_patch_size / total_forest_area) if total_forest_area > 0 else 0
            
            return {
                'total_patches': len(forest_patches),
                'average_patch_size': float(avg_patch_size),
                'total_forest_area': float(total_forest_area),
                'fragmentation_index': float(fragmentation_index),
                'connectivity_score': float(np.mean([p['connectivity_index'] for p in forest_patches])),
                'patches': forest_patches[:5],  # Return top 5 patches for display
                'analysis_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {'error': str(e)}

# Global instance
ml_service = GeospatialMLService()
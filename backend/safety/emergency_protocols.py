"""
Comprehensive Safety and Emergency Protocols for AstroHELP Space Tourism System
Implements automated emergency response, abort systems, and safety protocols.
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, asdict
from enum import Enum
import numpy as np

class EmergencyLevel(Enum):
    GREEN = 0       # Normal operations
    YELLOW = 1     # Caution required
    ORANGE = 2     # Emergency procedures initiated
    RED = 3           # Critical emergency, abort required
    
    def __lt__(self, other):
        if self.__class__ is other.__class__:
            return self.value < other.value
        return NotImplemented
    
    def __gt__(self, other):
        if self.__class__ is other.__class__:
            return self.value > other.value
        return NotImplemented
    
    def __le__(self, other):
        if self.__class__ is other.__class__:
            return self.value <= other.value
        return NotImplemented
    
    def __ge__(self, other):
        if self.__class__ is other.__class__:
            return self.value >= other.value
        return NotImplemented

class SystemStatus(Enum):
    NOMINAL = "NOMINAL"
    DEGRADED = "DEGRADED"
    FAILED = "FAILED"
    OFFLINE = "OFFLINE"

@dataclass
class EmergencyEvent:
    event_id: str
    timestamp: datetime
    level: EmergencyLevel
    system_affected: str
    description: str
    automated_response: List[str]
    manual_actions_required: List[str]
    estimated_resolution_time: int  # minutes
    backup_systems_activated: List[str]

@dataclass
class SafetyMetrics:
    system_redundancy_level: float
    abort_capability_status: bool
    life_support_margin: float  # percentage above minimum
    communication_status: SystemStatus
    navigation_accuracy: float
    structural_integrity: float
    emergency_power_remaining: float  # percentage

class SafetyProtocolManager:
    """Comprehensive safety and emergency protocol management system."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.emergency_callbacks: List[Callable] = []
        self.active_emergencies: List[EmergencyEvent] = []
        self.safety_thresholds = self._initialize_safety_thresholds()
        self.abort_sequences = self._initialize_abort_sequences()
        self.emergency_contacts = self._initialize_emergency_contacts()
        
        # System monitoring flags
        self.monitoring_active = False
        self.auto_abort_enabled = True
        self.manual_override_active = False
        
    def _initialize_safety_thresholds(self) -> Dict:
        """Initialize safety thresholds for various systems."""
        return {
            'life_support': {
                'oxygen_level': {'critical': 15.0, 'warning': 18.0},  # percentage
                'co2_level': {'critical': 4.0, 'warning': 3.0},       # percentage
                'cabin_pressure': {'critical': 0.8, 'warning': 0.9},  # atm
                'temperature': {'critical': (5, 35), 'warning': (10, 30)}  # celsius
            },
            'propulsion': {
                'fuel_level': {'critical': 10.0, 'warning': 20.0},    # percentage
                'engine_temperature': {'critical': 2000, 'warning': 1800},  # celsius
                'thrust_vector_error': {'critical': 5.0, 'warning': 3.0}    # degrees
            },
            'structure': {
                'hull_pressure': {'critical': 0.7, 'warning': 0.85},   # atm
                'vibration_level': {'critical': 50, 'warning': 30},    # g-force
                'structural_stress': {'critical': 0.9, 'warning': 0.7} # fraction of max
            },
            'navigation': {
                'position_accuracy': {'critical': 1000, 'warning': 500},  # meters
                'velocity_error': {'critical': 50, 'warning': 20},        # m/s
                'attitude_error': {'critical': 10, 'warning': 5}          # degrees
            },
            'communication': {
                'signal_strength': {'critical': -120, 'warning': -100},   # dBm
                'data_loss_rate': {'critical': 10, 'warning': 5}          # percentage
            }
        }
    
    def _initialize_abort_sequences(self) -> Dict:
        """Initialize automated abort sequences for different emergency types."""
        return {
            'life_support_failure': [
                'activate_emergency_oxygen',
                'seal_affected_compartments',
                'initiate_emergency_descent',
                'activate_emergency_beacon',
                'prepare_evacuation_systems'
            ],
            'propulsion_failure': [
                'shutdown_affected_engines',
                'activate_backup_propulsion',
                'calculate_emergency_trajectory',
                'prepare_ballistic_recovery',
                'alert_ground_control'
            ],
            'structural_damage': [
                'activate_emergency_pressure_seals',
                'redistribute_structural_loads',
                'initiate_controlled_descent',
                'prepare_emergency_landing',
                'activate_crash_protection'
            ],
            'navigation_failure': [
                'switch_to_backup_navigation',
                'activate_manual_control',
                'establish_ground_reference',
                'reduce_mission_complexity',
                'prepare_guided_recovery'
            ],
            'communication_blackout': [
                'activate_backup_transceivers',
                'switch_to_emergency_frequencies',
                'deploy_emergency_antenna',
                'initiate_autonomous_return',
                'activate_location_beacons'
            ],
            'medical_emergency': [
                'activate_medical_monitoring',
                'deploy_automated_medical_aid',
                'prepare_rapid_descent',
                'alert_medical_teams',
                'calculate_fastest_return_trajectory'
            ]
        }
    
    def _initialize_emergency_contacts(self) -> Dict:
        """Initialize emergency contact protocols."""
        return {
            'mission_control': {
                'primary': '+1-555-SPACE-MC',
                'backup': '+1-555-BACKUP-MC',
                'emergency': '+1-555-EMERGENCY'
            },
            'medical': {
                'flight_surgeon': '+1-555-FLIGHT-MD',
                'emergency_medical': '911',
                'aerospace_medicine': '+1-555-AERO-MED'
            },
            'technical': {
                'vehicle_engineering': '+1-555-VEH-ENG',
                'systems_support': '+1-555-SYS-SUP',
                'software_support': '+1-555-SW-SUP'
            },
            'regulatory': {
                'faa_ast': '+1-555-FAA-AST',
                'ntsb': '+1-555-NTSB',
                'local_emergency': '911'
            }
        }
    
    async def start_safety_monitoring(self):
        """Start continuous safety monitoring."""
        self.monitoring_active = True
        self.logger.info("Safety monitoring activated")
        
        # Start monitoring task
        asyncio.create_task(self._continuous_monitoring())
    
    async def stop_safety_monitoring(self):
        """Stop safety monitoring."""
        self.monitoring_active = False
        self.logger.info("Safety monitoring deactivated")
    
    async def _continuous_monitoring(self):
        """Continuous monitoring loop for safety parameters."""
        while self.monitoring_active:
            try:
                # Simulate system status check
                current_status = await self._get_system_status()
                safety_assessment = await self.assess_safety_status(current_status)
                
                # Check for emergency conditions
                emergencies = await self._detect_emergencies(current_status)
                
                for emergency in emergencies:
                    await self._handle_emergency(emergency)
                
                # Log safety status
                if safety_assessment['overall_level'] != EmergencyLevel.GREEN:
                    self.logger.warning(f"Safety status: {safety_assessment['overall_level'].value}")
                
                await asyncio.sleep(1)  # Check every second
                
            except Exception as e:
                self.logger.error(f"Error in safety monitoring: {e}")
                await asyncio.sleep(5)  # Wait longer on error
    
    async def _get_system_status(self) -> Dict:
        """Get current system status (simulated for demonstration)."""
        import random
        
        # Simulate realistic system readings with occasional anomalies
        return {
            'life_support': {
                'oxygen_level': random.uniform(19, 21),
                'co2_level': random.uniform(0.5, 2.5),
                'cabin_pressure': random.uniform(0.95, 1.05),
                'temperature': random.uniform(18, 25)
            },
            'propulsion': {
                'fuel_level': random.uniform(60, 100),
                'engine_temperature': random.uniform(800, 1200),
                'thrust_vector_error': random.uniform(0, 2)
            },
            'structure': {
                'hull_pressure': random.uniform(0.9, 1.1),
                'vibration_level': random.uniform(5, 25),
                'structural_stress': random.uniform(0.2, 0.6)
            },
            'navigation': {
                'position_accuracy': random.uniform(1, 100),
                'velocity_error': random.uniform(0, 10),
                'attitude_error': random.uniform(0, 3)
            },
            'communication': {
                'signal_strength': random.uniform(-90, -70),
                'data_loss_rate': random.uniform(0, 3)
            },
            'timestamp': datetime.now()
        }
    
    async def assess_safety_status(self, system_status: Dict) -> Dict:
        """Assess overall safety status based on system readings."""
        safety_levels = []
        system_assessments = {}
        
        for system, readings in system_status.items():
            if system == 'timestamp':
                continue
                
            if system in self.safety_thresholds:
                level = self._assess_system_safety(system, readings)
                safety_levels.append(level)
                system_assessments[system] = level
        
        # Overall safety level is the worst individual system level
        overall_level = max(safety_levels) if safety_levels else EmergencyLevel.GREEN
        
        # Calculate safety metrics
        metrics = SafetyMetrics(
            system_redundancy_level=0.95,  # 95% redundancy available
            abort_capability_status=True,
            life_support_margin=max(0, (system_status['life_support']['oxygen_level'] - 16) / 5 * 100),
            communication_status=SystemStatus.NOMINAL if system_status['communication']['signal_strength'] > -100 else SystemStatus.DEGRADED,
            navigation_accuracy=max(0, 1 - system_status['navigation']['position_accuracy'] / 1000),
            structural_integrity=max(0, 1 - system_status['structure']['structural_stress']),
            emergency_power_remaining=85.0  # Simulated
        )
        
        return {
            'overall_level': overall_level,
            'system_assessments': system_assessments,
            'safety_metrics': asdict(metrics),
            'timestamp': datetime.now()
        }
    
    def _assess_system_safety(self, system: str, readings: Dict) -> EmergencyLevel:
        """Assess safety level for a specific system."""
        thresholds = self.safety_thresholds.get(system, {})
        worst_level = EmergencyLevel.GREEN
        
        for parameter, value in readings.items():
            if parameter in thresholds:
                threshold = thresholds[parameter]
                
                # Handle different threshold types
                if isinstance(threshold['critical'], tuple):
                    # Range thresholds (e.g., temperature)
                    crit_min, crit_max = threshold['critical']
                    warn_min, warn_max = threshold['warning']
                    
                    if value < crit_min or value > crit_max:
                        worst_level = max(worst_level, EmergencyLevel.RED)
                    elif value < warn_min or value > warn_max:
                        worst_level = max(worst_level, EmergencyLevel.YELLOW)
                        
                elif parameter in ['signal_strength']:
                    # Lower is worse
                    if value < threshold['critical']:
                        worst_level = max(worst_level, EmergencyLevel.RED)
                    elif value < threshold['warning']:
                        worst_level = max(worst_level, EmergencyLevel.YELLOW)
                        
                elif parameter in ['co2_level', 'data_loss_rate', 'vibration_level', 'structural_stress']:
                    # Higher is worse
                    if value > threshold['critical']:
                        worst_level = max(worst_level, EmergencyLevel.RED)
                    elif value > threshold['warning']:
                        worst_level = max(worst_level, EmergencyLevel.YELLOW)
                        
                else:
                    # Lower is worse (default case)
                    if value < threshold['critical']:
                        worst_level = max(worst_level, EmergencyLevel.RED)
                    elif value < threshold['warning']:
                        worst_level = max(worst_level, EmergencyLevel.YELLOW)
        
        return worst_level
    
    async def _detect_emergencies(self, system_status: Dict) -> List[EmergencyEvent]:
        """Detect emergency conditions from system status."""
        emergencies = []
        timestamp = datetime.now()
        
        # Check each system for emergency conditions
        for system, readings in system_status.items():
            if system == 'timestamp':
                continue
                
            level = self._assess_system_safety(system, readings)
            
            if level in [EmergencyLevel.RED, EmergencyLevel.ORANGE]:
                emergency_type = self._determine_emergency_type(system, readings)
                
                emergency = EmergencyEvent(
                    event_id=f"EMRG_{timestamp.strftime('%Y%m%d_%H%M%S')}_{system.upper()}",
                    timestamp=timestamp,
                    level=level,
                    system_affected=system,
                    description=self._generate_emergency_description(system, readings, emergency_type),
                    automated_response=self.abort_sequences.get(emergency_type, []),
                    manual_actions_required=self._get_manual_actions(emergency_type),
                    estimated_resolution_time=self._estimate_resolution_time(emergency_type),
                    backup_systems_activated=self._get_backup_systems(system)
                )
                emergencies.append(emergency)
        
        return emergencies
    
    def _determine_emergency_type(self, system: str, readings: Dict) -> str:
        """Determine specific emergency type based on system and readings."""
        emergency_mapping = {
            'life_support': 'life_support_failure',
            'propulsion': 'propulsion_failure',
            'structure': 'structural_damage',
            'navigation': 'navigation_failure',
            'communication': 'communication_blackout'
        }
        return emergency_mapping.get(system, 'general_emergency')
    
    def _generate_emergency_description(self, system: str, readings: Dict, emergency_type: str) -> str:
        """Generate human-readable emergency description."""
        descriptions = {
            'life_support_failure': f"Life support system critical: O2={readings.get('oxygen_level', 'N/A')}%, CO2={readings.get('co2_level', 'N/A')}%",
            'propulsion_failure': f"Propulsion system failure: Fuel={readings.get('fuel_level', 'N/A')}%, Temp={readings.get('engine_temperature', 'N/A')}°C",
            'structural_damage': f"Structural integrity compromised: Stress={readings.get('structural_stress', 'N/A')}, Pressure={readings.get('hull_pressure', 'N/A')} atm",
            'navigation_failure': f"Navigation system failure: Accuracy={readings.get('position_accuracy', 'N/A')}m, Error={readings.get('velocity_error', 'N/A')} m/s",
            'communication_blackout': f"Communication failure: Signal={readings.get('signal_strength', 'N/A')} dBm, Loss={readings.get('data_loss_rate', 'N/A')}%"
        }
        return descriptions.get(emergency_type, f"Emergency in {system} system")
    
    def _get_manual_actions(self, emergency_type: str) -> List[str]:
        """Get required manual actions for emergency type."""
        manual_actions = {
            'life_support_failure': [
                "Don emergency oxygen masks",
                "Check personal life support systems",
                "Secure loose objects for emergency descent"
            ],
            'propulsion_failure': [
                "Switch to manual control if required",
                "Monitor backup propulsion status",
                "Prepare for ballistic trajectory"
            ],
            'structural_damage': [
                "Secure to crash positions",
                "Check pressure suit integrity",
                "Prepare for emergency landing"
            ],
            'navigation_failure': [
                "Switch to manual navigation",
                "Maintain visual reference if possible",
                "Prepare backup navigation systems"
            ],
            'communication_blackout': [
                "Switch to emergency transponder",
                "Activate emergency locator beacon",
                "Follow autonomous return procedures"
            ]
        }
        return manual_actions.get(emergency_type, ["Follow general emergency procedures"])
    
    def _estimate_resolution_time(self, emergency_type: str) -> int:
        """Estimate time to resolve emergency in minutes."""
        resolution_times = {
            'life_support_failure': 5,   # Critical - immediate action
            'propulsion_failure': 10,   # System restart/backup activation
            'structural_damage': 15,    # Assessment and repair
            'navigation_failure': 8,    # System reset/backup
            'communication_blackout': 12  # Antenna deployment/frequency change
        }
        return resolution_times.get(emergency_type, 10)
    
    def _get_backup_systems(self, system: str) -> List[str]:
        """Get backup systems for primary system."""
        backup_systems = {
            'life_support': ['emergency_oxygen', 'backup_co2_scrubbers', 'emergency_power'],
            'propulsion': ['backup_engines', 'rcs_thrusters', 'ballistic_recovery'],
            'structure': ['emergency_seals', 'backup_pressure_systems'],
            'navigation': ['backup_gps', 'inertial_guidance', 'manual_control'],
            'communication': ['backup_transceivers', 'emergency_beacon', 'satellite_comm']
        }
        return backup_systems.get(system, [])
    
    async def _handle_emergency(self, emergency: EmergencyEvent):
        """Handle detected emergency event."""
        if emergency.event_id not in [e.event_id for e in self.active_emergencies]:
            self.active_emergencies.append(emergency)
            
            self.logger.critical(f"EMERGENCY DETECTED: {emergency.description}")
            
            # Execute automated response
            if self.auto_abort_enabled and emergency.level == EmergencyLevel.RED:
                await self._execute_automated_response(emergency)
            
            # Notify callbacks
            for callback in self.emergency_callbacks:
                try:
                    await callback(emergency)
                except Exception as e:
                    self.logger.error(f"Error in emergency callback: {e}")
    
    async def _execute_automated_response(self, emergency: EmergencyEvent):
        """Execute automated emergency response."""
        self.logger.info(f"Executing automated response for {emergency.event_id}")
        
        for action in emergency.automated_response:
            try:
                # Simulate executing emergency action
                await self._execute_emergency_action(action)
                self.logger.info(f"Executed emergency action: {action}")
                await asyncio.sleep(0.5)  # Brief delay between actions
                
            except Exception as e:
                self.logger.error(f"Failed to execute emergency action {action}: {e}")
    
    async def _execute_emergency_action(self, action: str):
        """Execute a specific emergency action."""
        # This would interface with actual spacecraft systems
        # For demonstration, we'll just log the action
        action_implementations = {
            'activate_emergency_oxygen': self._activate_emergency_oxygen,
            'initiate_emergency_descent': self._initiate_emergency_descent,
            'shutdown_affected_engines': self._shutdown_affected_engines,
            'activate_backup_propulsion': self._activate_backup_propulsion,
            'activate_emergency_beacon': self._activate_emergency_beacon
        }
        
        implementation = action_implementations.get(action)
        if implementation:
            await implementation()
        else:
            self.logger.warning(f"No implementation found for action: {action}")
    
    async def _activate_emergency_oxygen(self):
        """Activate emergency oxygen systems."""
        # Simulate oxygen system activation
        await asyncio.sleep(0.1)
        
    async def _initiate_emergency_descent(self):
        """Initiate emergency descent sequence."""
        # Simulate descent initiation
        await asyncio.sleep(0.1)
        
    async def _shutdown_affected_engines(self):
        """Shutdown affected engines safely."""
        # Simulate engine shutdown
        await asyncio.sleep(0.1)
        
    async def _activate_backup_propulsion(self):
        """Activate backup propulsion systems."""
        # Simulate backup system activation
        await asyncio.sleep(0.1)
        
    async def _activate_emergency_beacon(self):
        """Activate emergency locator beacon."""
        # Simulate beacon activation
        await asyncio.sleep(0.1)
    
    async def manual_abort(self, reason: str) -> bool:
        """Manually initiate abort sequence."""
        try:
            self.logger.critical(f"MANUAL ABORT INITIATED: {reason}")
            
            # Create manual abort emergency event
            abort_emergency = EmergencyEvent(
                event_id=f"ABORT_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                timestamp=datetime.now(),
                level=EmergencyLevel.RED,
                system_affected="manual",
                description=f"Manual abort initiated: {reason}",
                automated_response=self.abort_sequences.get('manual_abort', [
                    'initiate_emergency_descent',
                    'activate_emergency_beacon',
                    'secure_all_systems',
                    'prepare_emergency_landing'
                ]),
                manual_actions_required=[
                    "Secure to crash positions",
                    "Don emergency equipment",
                    "Prepare for emergency landing"
                ],
                estimated_resolution_time=10,
                backup_systems_activated=["emergency_power", "emergency_beacon"]
            )
            
            await self._handle_emergency(abort_emergency)
            return True
            
        except Exception as e:
            self.logger.error(f"Error during manual abort: {e}")
            return False
    
    def add_emergency_callback(self, callback: Callable):
        """Add callback function for emergency events."""
        self.emergency_callbacks.append(callback)
    
    async def get_emergency_status(self) -> Dict:
        """Get current emergency status."""
        return {
            'monitoring_active': self.monitoring_active,
            'auto_abort_enabled': self.auto_abort_enabled,
            'manual_override_active': self.manual_override_active,
            'active_emergencies': [asdict(e) for e in self.active_emergencies],
            'emergency_contacts': self.emergency_contacts,
            'safety_thresholds': self.safety_thresholds
        }

# Global safety protocol manager
safety_manager = SafetyProtocolManager()

async def get_safety_manager():
    """Get the global safety protocol manager."""
    return safety_manager
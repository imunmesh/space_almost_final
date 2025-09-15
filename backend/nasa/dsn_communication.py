"""
NASA Deep Space Network (DSN) Communication Simulator
Simulates the three DSN complexes for spacecraft communication
"""

import asyncio
import numpy as np
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import logging
import math
import random

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DSNComplex(Enum):
    GOLDSTONE = "GOLDSTONE"
    MADRID = "MADRID" 
    CANBERRA = "CANBERRA"

class AntennaStatus(Enum):
    OPERATIONAL = "OPERATIONAL"
    TRACKING = "TRACKING"
    OFFLINE = "OFFLINE"

@dataclass
class DSNAntenna:
    complex_name: str
    antenna_id: str
    diameter: float
    max_power: float
    status: str
    current_target: Optional[str] = None
    elevation: float = 0.0
    azimuth: float = 0.0
    signal_strength: float = 0.0

@dataclass 
class CommunicationSession:
    session_id: str
    spacecraft_id: str
    start_time: datetime
    antenna: str
    frequency: float
    data_rate: float
    signal_strength: float
    packets_sent: int = 0
    packets_received: int = 0

class DSNCommunicationSystem:
    def __init__(self):
        self.antennas = self._initialize_antennas()
        self.active_sessions = {}
        self.schedule = []
        self.is_active = False
        logger.info("DSN Communication System initialized")
    
    def _initialize_antennas(self) -> Dict[str, DSNAntenna]:
        antennas = {}
        
        # Major DSN antennas
        antenna_configs = [
            ("GOLDSTONE", "DSS-14", 70.0, 20000),
            ("GOLDSTONE", "DSS-24", 34.0, 10000),
            ("MADRID", "DSS-63", 70.0, 20000),
            ("MADRID", "DSS-54", 34.0, 10000),
            ("CANBERRA", "DSS-43", 70.0, 20000),
            ("CANBERRA", "DSS-34", 34.0, 10000)
        ]
        
        for complex_name, antenna_id, diameter, power in antenna_configs:
            antennas[antenna_id] = DSNAntenna(
                complex_name=complex_name,
                antenna_id=antenna_id,
                diameter=diameter,
                max_power=power,
                status=AntennaStatus.OPERATIONAL.value
            )
        
        return antennas
    
    async def start_dsn_operations(self):
        self.is_active = True
        asyncio.create_task(self._tracking_loop())
        logger.info("DSN operations started")
        return {"status": "DSN operations started", "antennas": len(self.antennas)}
    
    async def establish_communication(self, spacecraft_id: str, antenna_id: str) -> Dict[str, Any]:
        if antenna_id not in self.antennas:
            return {"status": "error", "message": "Invalid antenna"}
        
        antenna = self.antennas[antenna_id]
        antenna.status = AntennaStatus.TRACKING.value
        antenna.current_target = spacecraft_id
        
        session = CommunicationSession(
            session_id=f"DSN-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            spacecraft_id=spacecraft_id,
            start_time=datetime.now(),
            antenna=antenna_id,
            frequency=2287.5,  # MHz
            data_rate=random.uniform(1.0, 10.0),
            signal_strength=random.uniform(-85, -70)
        )
        
        self.active_sessions[session.session_id] = session
        antenna.signal_strength = session.signal_strength
        
        logger.info(f"Communication established: {spacecraft_id} via {antenna_id}")
        
        return {
            "status": "success",
            "session_id": session.session_id,
            "signal_strength": session.signal_strength,
            "frequency": session.frequency
        }
    
    async def send_command(self, session_id: str, command: Dict[str, Any]) -> Dict[str, Any]:
        if session_id not in self.active_sessions:
            return {"status": "error", "message": "Invalid session"}
        
        session = self.active_sessions[session_id]
        session.packets_sent += 1
        
        # Simulate transmission delay
        await asyncio.sleep(0.5)
        
        return {
            "status": "success",
            "command_id": f"CMD-{session.packets_sent:06d}",
            "transmission_time": 0.5
        }
    
    async def receive_telemetry(self, session_id: str) -> Dict[str, Any]:
        if session_id not in self.active_sessions:
            return {"status": "error", "message": "Invalid session"}
        
        session = self.active_sessions[session_id]
        session.packets_received += 1
        
        # Generate telemetry data
        telemetry = {
            'spacecraft_id': session.spacecraft_id,
            'timestamp': datetime.now().isoformat(),
            'systems': {
                'power': random.uniform(80, 100),
                'attitude': [random.uniform(-180, 180) for _ in range(3)],
                'position': [random.uniform(-90, 90), random.uniform(-180, 180), random.uniform(400, 450)]
            }
        }
        
        return {
            "status": "success",
            "telemetry": telemetry,
            "signal_quality": random.uniform(85, 98)
        }
    
    async def get_dsn_status(self) -> Dict[str, Any]:
        antenna_status = {}
        for antenna_id, antenna in self.antennas.items():
            antenna_status[antenna_id] = {
                'complex': antenna.complex_name,
                'diameter': antenna.diameter,
                'status': antenna.status,
                'target': antenna.current_target,
                'signal_strength': antenna.signal_strength
            }
        
        return {
            'antennas': antenna_status,
            'active_sessions': len(self.active_sessions),
            'system_status': 'OPERATIONAL' if self.is_active else 'OFFLINE'
        }
    
    async def _tracking_loop(self):
        while self.is_active:
            # Update antenna tracking
            for session_id, session in self.active_sessions.items():
                antenna = self.antennas[session.antenna]
                # Simulate tracking updates
                antenna.elevation = random.uniform(10, 85)
                antenna.azimuth = random.uniform(0, 360)
            
            await asyncio.sleep(5.0)

# Initialize DSN system
dsn_system = DSNCommunicationSystem()
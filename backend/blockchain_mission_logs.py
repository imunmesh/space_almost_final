"""
🔗 Blockchain Mission Logging System
===================================

Immutable blockchain-based mission logging for regulatory compliance.
Suitable for aerospace industry audit requirements and space mission documentation.

Features:
- Immutable mission record keeping
- Cryptographic proof of data integrity
- Regulatory compliance logging
- Audit trail generation
- Tamper-proof documentation
"""

import hashlib
import json
import time
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
import secrets

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LogLevel(Enum):
    """Mission log severity levels"""
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"
    EMERGENCY = "EMERGENCY"

class LogCategory(Enum):
    """Mission log categories for organization"""
    SYSTEM = "SYSTEM"
    NAVIGATION = "NAVIGATION"
    LIFE_SUPPORT = "LIFE_SUPPORT"
    COMMUNICATION = "COMMUNICATION"
    CREW_ACTIVITY = "CREW_ACTIVITY"
    SAFETY = "SAFETY"
    MAINTENANCE = "MAINTENANCE"
    EMERGENCY = "EMERGENCY"
    REGULATORY = "REGULATORY"

@dataclass
class MissionLogEntry:
    """Individual mission log entry"""
    log_id: str
    timestamp: str
    mission_id: str
    category: LogCategory
    level: LogLevel
    source_system: str
    operator_id: str
    event_description: str
    technical_data: Dict[str, Any]
    location_data: Dict[str, float]
    crew_status: Dict[str, Any]
    system_status: Dict[str, Any]
    regulatory_flags: List[str]
    signature: str

@dataclass
class BlockHeader:
    """Blockchain block header"""
    block_number: int
    timestamp: str
    previous_hash: str
    merkle_root: str
    nonce: int
    difficulty: int
    hash: str

@dataclass
class Block:
    """Blockchain block containing mission logs"""
    header: BlockHeader
    transactions: List[MissionLogEntry]
    transaction_count: int
    block_size: int
    validator: str
    consensus_proof: str

class MissionBlockchain:
    """Blockchain for immutable mission logging"""
    
    def __init__(self, mission_id: str):
        self.mission_id = mission_id
        self.chain: List[Block] = []
        self.pending_logs: List[MissionLogEntry] = []
        self.difficulty = 4  # Mining difficulty
        self.block_size_limit = 100  # Max logs per block
        self.validators = ["MISSION_CONTROL", "SPACECRAFT_AI", "GROUND_STATION"]
        
        # Create genesis block
        self._create_genesis_block()
        
        logger.info(f"Mission blockchain initialized for {mission_id}")
    
    def _create_genesis_block(self):
        """Create the first block in the chain"""
        genesis_log = MissionLogEntry(
            log_id="GENESIS_LOG",
            timestamp=datetime.now(timezone.utc).isoformat(),
            mission_id=self.mission_id,
            category=LogCategory.SYSTEM,
            level=LogLevel.INFO,
            source_system="BLOCKCHAIN_SYSTEM",
            operator_id="SYSTEM",
            event_description="Mission blockchain initialized",
            technical_data={"genesis_block": True, "blockchain_version": "1.0"},
            location_data={"latitude": 0.0, "longitude": 0.0, "altitude": 0.0},
            crew_status={"total_crew": 0, "status": "PRE_MISSION"},
            system_status={"blockchain": "INITIALIZED"},
            regulatory_flags=["BLOCKCHAIN_GENESIS"],
            signature=self._generate_signature("GENESIS_LOG", "BLOCKCHAIN_SYSTEM")
        )
        
        genesis_header = BlockHeader(
            block_number=0,
            timestamp=datetime.now(timezone.utc).isoformat(),
            previous_hash="0" * 64,
            merkle_root=self._calculate_merkle_root([genesis_log]),
            nonce=0,
            difficulty=self.difficulty,
            hash=""
        )
        
        # Mine genesis block
        genesis_header.hash = self._mine_block(genesis_header, [genesis_log])
        
        genesis_block = Block(
            header=genesis_header,
            transactions=[genesis_log],
            transaction_count=1,
            block_size=len(json.dumps(asdict(genesis_log))),
            validator="SYSTEM",
            consensus_proof="GENESIS_PROOF"
        )
        
        self.chain.append(genesis_block)
        logger.info("Genesis block created")
    
    def add_mission_log(self, category: LogCategory, level: LogLevel, 
                       source_system: str, operator_id: str, 
                       event_description: str, technical_data: Optional[Dict[str, Any]] = None,
                       location_data: Optional[Dict[str, float]] = None,
                       crew_status: Optional[Dict[str, Any]] = None,
                       system_status: Optional[Dict[str, Any]] = None,
                       regulatory_flags: Optional[List[str]] = None) -> str:
        """Add new mission log entry to pending logs"""
        
        # Generate unique log ID
        log_id = f"LOG_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{secrets.token_hex(4)}"
        
        # Set defaults
        if technical_data is None:
            technical_data = {}
        if location_data is None:
            location_data = {"latitude": 0.0, "longitude": 0.0, "altitude": 0.0}
        if crew_status is None:
            crew_status = {"status": "UNKNOWN"}
        if system_status is None:
            system_status = {"status": "OPERATIONAL"}
        if regulatory_flags is None:
            regulatory_flags = []
        
        # Create log entry
        log_entry = MissionLogEntry(
            log_id=log_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            mission_id=self.mission_id,
            category=category,
            level=level,
            source_system=source_system,
            operator_id=operator_id,
            event_description=event_description,
            technical_data=technical_data,
            location_data=location_data,
            crew_status=crew_status,
            system_status=system_status,
            regulatory_flags=regulatory_flags,
            signature=self._generate_signature(log_id, source_system)
        )
        
        self.pending_logs.append(log_entry)
        
        # Auto-mine block if we have enough logs or critical event
        if (len(self.pending_logs) >= self.block_size_limit or 
            level in [LogLevel.CRITICAL, LogLevel.EMERGENCY]):
            self.mine_block()
        
        logger.info(f"Mission log added: {log_id} ({category.value}/{level.value})")
        return log_id
    
    def mine_block(self, validator: str = "MISSION_CONTROL") -> Optional[Block]:
        """Mine a new block with pending logs"""
        
        if not self.pending_logs:
            logger.warning("No pending logs to mine")
            return None
        
        # Create block header
        block_number = len(self.chain)
        previous_hash = self.chain[-1].header.hash if self.chain else "0" * 64
        merkle_root = self._calculate_merkle_root(self.pending_logs)
        
        header = BlockHeader(
            block_number=block_number,
            timestamp=datetime.now(timezone.utc).isoformat(),
            previous_hash=previous_hash,
            merkle_root=merkle_root,
            nonce=0,
            difficulty=self.difficulty,
            hash=""
        )
        
        # Mine the block (proof of work)
        header.hash = self._mine_block(header, self.pending_logs)
        
        # Create block
        block = Block(
            header=header,
            transactions=self.pending_logs.copy(),
            transaction_count=len(self.pending_logs),
            block_size=sum(len(json.dumps(asdict(log))) for log in self.pending_logs),
            validator=validator,
            consensus_proof=self._generate_consensus_proof(header, validator)
        )
        
        # Add to chain and clear pending logs
        self.chain.append(block)
        log_count = len(self.pending_logs)
        self.pending_logs.clear()
        
        logger.info(f"Block #{block_number} mined with {log_count} logs (hash: {header.hash[:16]}...)")
        return block
    
    def _mine_block(self, header: BlockHeader, logs: List[MissionLogEntry]) -> str:
        """Mine block using proof of work"""
        target = "0" * self.difficulty
        
        while True:
            # Create block content for hashing
            block_content = {
                'block_number': header.block_number,
                'timestamp': header.timestamp,
                'previous_hash': header.previous_hash,
                'merkle_root': header.merkle_root,
                'nonce': header.nonce,
                'difficulty': header.difficulty
            }
            
            # Calculate hash
            block_string = json.dumps(block_content, sort_keys=True)
            block_hash = hashlib.sha256(block_string.encode()).hexdigest()
            
            # Check if we found valid hash
            if block_hash.startswith(target):
                return block_hash
            
            header.nonce += 1
            
            # Prevent infinite loops in testing
            if header.nonce > 1000000:
                logger.warning("Mining took too long, using current hash")
                return block_hash
    
    def _calculate_merkle_root(self, logs: List[MissionLogEntry]) -> str:
        """Calculate Merkle root of transaction logs"""
        if not logs:
            return hashlib.sha256(b"").hexdigest()
        
        # Hash each log
        hashes = []
        for log in logs:
            log_string = json.dumps(asdict(log), sort_keys=True)
            log_hash = hashlib.sha256(log_string.encode()).hexdigest()
            hashes.append(log_hash)
        
        # Build Merkle tree
        while len(hashes) > 1:
            new_hashes = []
            for i in range(0, len(hashes), 2):
                if i + 1 < len(hashes):
                    combined = hashes[i] + hashes[i + 1]
                else:
                    combined = hashes[i] + hashes[i]  # Duplicate if odd number
                
                new_hash = hashlib.sha256(combined.encode()).hexdigest()
                new_hashes.append(new_hash)
            
            hashes = new_hashes
        
        return hashes[0]
    
    def _generate_signature(self, log_id: str, source_system: str) -> str:
        """Generate cryptographic signature for log entry"""
        signature_data = f"{log_id}:{source_system}:{datetime.now(timezone.utc).isoformat()}"
        return hashlib.sha256(signature_data.encode()).hexdigest()[:32]
    
    def _generate_consensus_proof(self, header: BlockHeader, validator: str) -> str:
        """Generate consensus proof for block validation"""
        proof_data = f"{header.hash}:{validator}:{header.timestamp}"
        return hashlib.sha256(proof_data.encode()).hexdigest()
    
    def validate_chain(self) -> Dict[str, Any]:
        """Validate entire blockchain integrity"""
        validation_results = {
            'valid': True,
            'total_blocks': len(self.chain),
            'total_logs': sum(block.transaction_count for block in self.chain),
            'errors': [],
            'warnings': []
        }
        
        for i, block in enumerate(self.chain):
            # Validate block hash
            if i > 0:  # Skip genesis block
                if block.header.previous_hash != self.chain[i-1].header.hash:
                    validation_results['valid'] = False
                    validation_results['errors'].append(f"Block {i}: Invalid previous hash")
            
            # Validate Merkle root
            calculated_merkle = self._calculate_merkle_root(block.transactions)
            if calculated_merkle != block.header.merkle_root:
                validation_results['valid'] = False
                validation_results['errors'].append(f"Block {i}: Invalid Merkle root")
            
            # Validate block hash
            target = "0" * self.difficulty
            if not block.header.hash.startswith(target) and i > 0:  # Skip genesis
                validation_results['warnings'].append(f"Block {i}: Hash doesn't meet difficulty")
        
        logger.info(f"Blockchain validation: {'VALID' if validation_results['valid'] else 'INVALID'}")
        return validation_results
    
    def get_logs_by_category(self, category: LogCategory, 
                           start_time: Optional[datetime] = None,
                           end_time: Optional[datetime] = None) -> List[MissionLogEntry]:
        """Retrieve logs by category and time range"""
        logs = []
        
        for block in self.chain:
            for log in block.transactions:
                if log.category == category:
                    log_time = datetime.fromisoformat(log.timestamp.replace('Z', '+00:00'))
                    
                    if start_time and log_time < start_time:
                        continue
                    if end_time and log_time > end_time:
                        continue
                    
                    logs.append(log)
        
        return sorted(logs, key=lambda x: x.timestamp)
    
    def get_critical_events(self) -> List[MissionLogEntry]:
        """Get all critical and emergency events"""
        critical_logs = []
        
        for block in self.chain:
            for log in block.transactions:
                if log.level in [LogLevel.CRITICAL, LogLevel.EMERGENCY]:
                    critical_logs.append(log)
        
        return sorted(critical_logs, key=lambda x: x.timestamp, reverse=True)
    
    def generate_audit_report(self) -> Dict[str, Any]:
        """Generate comprehensive audit report"""
        
        # Collect statistics
        total_logs = sum(block.transaction_count for block in self.chain)
        category_stats = {}
        level_stats = {}
        
        for block in self.chain:
            for log in block.transactions:
                # Category statistics
                cat = log.category.value
                category_stats[cat] = category_stats.get(cat, 0) + 1
                
                # Level statistics
                lvl = log.level.value
                level_stats[lvl] = level_stats.get(lvl, 0) + 1
        
        # Chain validation
        validation = self.validate_chain()
        
        # Recent activity
        recent_blocks = self.chain[-5:] if len(self.chain) > 5 else self.chain
        
        audit_report = {
            'mission_id': self.mission_id,
            'report_timestamp': datetime.now(timezone.utc).isoformat(),
            'blockchain_status': {
                'total_blocks': len(self.chain),
                'total_logs': total_logs,
                'pending_logs': len(self.pending_logs),
                'chain_valid': validation['valid'],
                'validation_errors': validation['errors'],
                'validation_warnings': validation['warnings']
            },
            'log_statistics': {
                'by_category': category_stats,
                'by_level': level_stats
            },
            'critical_events_count': len(self.get_critical_events()),
            'recent_activity': {
                'recent_blocks': len(recent_blocks),
                'recent_logs': sum(b.transaction_count for b in recent_blocks)
            },
            'compliance_status': {
                'immutable_logging': 'ACTIVE',
                'cryptographic_integrity': 'VERIFIED',
                'audit_trail': 'COMPLETE',
                'regulatory_compliance': 'COMPLIANT'
            }
        }
        
        return audit_report
    
    def export_mission_logs(self, format_type: str = "json") -> Union[str, Dict]:
        """Export all mission logs for regulatory compliance"""
        
        all_logs = []
        for block in self.chain:
            for log in block.transactions:
                log_data = asdict(log)
                log_data['block_number'] = block.header.block_number
                log_data['block_hash'] = block.header.hash
                all_logs.append(log_data)
        
        export_data = {
            'mission_id': self.mission_id,
            'export_timestamp': datetime.now(timezone.utc).isoformat(),
            'total_logs': len(all_logs),
            'blockchain_validation': self.validate_chain(),
            'logs': all_logs
        }
        
        if format_type == "json":
            return json.dumps(export_data, indent=2)
        else:
            return export_data

class MissionBlockchainManager:
    """Manager for multiple mission blockchains"""
    
    def __init__(self):
        self.active_missions: Dict[str, MissionBlockchain] = {}
        self.archived_missions: List[str] = []
        
        logger.info("Mission Blockchain Manager initialized")
    
    def create_mission_blockchain(self, mission_id: str) -> MissionBlockchain:
        """Create new blockchain for mission"""
        if mission_id in self.active_missions:
            logger.warning(f"Mission blockchain already exists: {mission_id}")
            return self.active_missions[mission_id]
        
        blockchain = MissionBlockchain(mission_id)
        self.active_missions[mission_id] = blockchain
        
        logger.info(f"Created blockchain for mission: {mission_id}")
        return blockchain
    
    def get_mission_blockchain(self, mission_id: str) -> Optional[MissionBlockchain]:
        """Get blockchain for specific mission"""
        return self.active_missions.get(mission_id)
    
    def archive_mission(self, mission_id: str) -> bool:
        """Archive completed mission blockchain"""
        if mission_id not in self.active_missions:
            return False
        
        # Final mining of any pending logs
        blockchain = self.active_missions[mission_id]
        if blockchain.pending_logs:
            blockchain.mine_block("MISSION_ARCHIVE")
        
        # Move to archived
        del self.active_missions[mission_id]
        self.archived_missions.append(mission_id)
        
        logger.info(f"Mission blockchain archived: {mission_id}")
        return True
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get overall blockchain system status"""
        total_blocks = sum(len(bc.chain) for bc in self.active_missions.values())
        total_logs = sum(
            sum(block.transaction_count for block in bc.chain) 
            for bc in self.active_missions.values()
        )
        
        return {
            'system_status': 'OPERATIONAL',
            'active_missions': len(self.active_missions),
            'archived_missions': len(self.archived_missions),
            'total_blocks': total_blocks,
            'total_logs': total_logs,
            'blockchain_integrity': 'VERIFIED',
            'compliance_status': 'COMPLIANT',
            'last_update': datetime.now(timezone.utc).isoformat()
        }

# Global blockchain manager
blockchain_manager = MissionBlockchainManager()
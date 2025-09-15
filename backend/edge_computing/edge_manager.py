"""
Edge Computing Capabilities for AstroHELP Space Tourism System
Provides low-latency processing and offline operation during communication blackouts.
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
import sqlite3
import threading
from pathlib import Path
import pickle
import hashlib
import time

@dataclass
class EdgeTask:
    task_id: str
    task_type: str
    priority: int  # 1-10, 10 being highest
    data: Dict[Any, Any]
    created_at: datetime
    deadline: Optional[datetime]
    retry_count: int = 0
    max_retries: int = 3
    status: str = "PENDING"  # PENDING, PROCESSING, COMPLETED, FAILED

@dataclass
class CacheEntry:
    key: str
    value: Any
    created_at: datetime
    expires_at: Optional[datetime]
    access_count: int
    last_accessed: datetime

class EdgeComputingManager:
    """Advanced edge computing system for space tourism operations."""
    
    def __init__(self, cache_size_mb: int = 100):
        self.logger = logging.getLogger(__name__)
        self.cache_size_bytes = cache_size_mb * 1024 * 1024
        self.current_cache_size = 0
        
        # Edge processing components
        self.local_cache: Dict[str, CacheEntry] = {}
        self.task_queue: List[EdgeTask] = []
        self.processing_tasks: Dict[str, EdgeTask] = {}
        self.completed_tasks: Dict[str, EdgeTask] = {}
        
        # Offline operation support
        self.offline_mode = False
        self.offline_data_buffer: List[Dict] = []
        self.local_db_path = Path("c:/Users/Unmesh/Space/edge_data/local_cache.db")
        self.local_db_path.parent.mkdir(exist_ok=True)
        
        # Processing capabilities
        self.processors: Dict[str, Callable] = {}
        self.worker_threads = []
        self.running = False
        
        # Communication status
        self.last_communication = datetime.now()
        self.communication_timeout = timedelta(seconds=30)
        
        # Initialize processors and database
        self._initialize_processors()
        self._initialize_local_database()
        
    def _initialize_processors(self):
        """Initialize edge processing functions."""
        self.processors = {
            'health_analysis': self._process_health_data,
            'navigation_calculation': self._process_navigation_data,
            'debris_tracking': self._process_debris_data,
            'emergency_response': self._process_emergency_data,
            'system_monitoring': self._process_system_monitoring,
            'data_compression': self._process_data_compression,
            'predictive_maintenance': self._process_predictive_maintenance,
            'safety_assessment': self._process_safety_assessment
        }
    
    def _initialize_local_database(self):
        """Initialize local SQLite database for offline operations."""
        try:
            conn = sqlite3.connect(self.local_db_path)
            cursor = conn.cursor()
            
            # Create tables for offline data storage
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS mission_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    data_type TEXT NOT NULL,
                    data_json TEXT NOT NULL,
                    processed BOOLEAN DEFAULT FALSE,
                    sync_status TEXT DEFAULT 'PENDING'
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS cached_results (
                    cache_key TEXT PRIMARY KEY,
                    result_data TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    expires_at TEXT,
                    access_count INTEGER DEFAULT 0
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS edge_tasks (
                    task_id TEXT PRIMARY KEY,
                    task_type TEXT NOT NULL,
                    priority INTEGER NOT NULL,
                    data_json TEXT NOT NULL,
                    status TEXT DEFAULT 'PENDING',
                    created_at TEXT NOT NULL,
                    completed_at TEXT
                )
            ''')
            
            conn.commit()
            conn.close()
            
            self.logger.info("Local database initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Error initializing local database: {e}")
    
    async def start_edge_computing(self):
        """Start edge computing services."""
        self.running = True
        self.logger.info("Starting edge computing services")
        
        # Start worker threads
        for i in range(3):  # 3 worker threads
            worker = threading.Thread(target=self._worker_thread, args=(f"worker-{i}",))
            worker.daemon = True
            worker.start()
            self.worker_threads.append(worker)
        
        # Start monitoring tasks
        asyncio.create_task(self._monitor_communication())
        asyncio.create_task(self._cache_maintenance())
        asyncio.create_task(self._offline_data_sync())
    
    async def stop_edge_computing(self):
        """Stop edge computing services."""
        self.running = False
        self.logger.info("Stopping edge computing services")
    
    def _worker_thread(self, worker_name: str):
        """Worker thread for processing edge tasks."""
        self.logger.info(f"Edge worker {worker_name} started")
        
        while self.running:
            try:
                # Get highest priority task
                task = self._get_next_task()
                
                if task:
                    self.logger.debug(f"Worker {worker_name} processing task {task.task_id}")
                    self._process_task(task)
                else:
                    time.sleep(0.1)  # No tasks available, wait briefly
                    
            except Exception as e:
                self.logger.error(f"Error in worker {worker_name}: {e}")
                time.sleep(1)
    
    def _get_next_task(self) -> Optional[EdgeTask]:
        """Get the next highest priority task from the queue."""
        if not self.task_queue:
            return None
        
        # Sort by priority (highest first), then by deadline
        self.task_queue.sort(
            key=lambda t: (
                -t.priority,
                t.deadline.timestamp() if t.deadline else float('inf')
            )
        )
        
        task = self.task_queue.pop(0)
        self.processing_tasks[task.task_id] = task
        task.status = "PROCESSING"
        
        return task
    
    def _process_task(self, task: EdgeTask):
        """Process an individual edge task."""
        try:
            start_time = time.time()
            
            # Check if we have a processor for this task type
            if task.task_type in self.processors:
                processor = self.processors[task.task_type]
                result = processor(task.data)
                
                # Mark task as completed
                task.status = "COMPLETED"
                task.data['result'] = result
                task.data['processing_time'] = time.time() - start_time
                
                # Move to completed tasks
                self.completed_tasks[task.task_id] = task
                del self.processing_tasks[task.task_id]
                
                self.logger.debug(f"Task {task.task_id} completed in {time.time() - start_time:.3f}s")
                
            else:
                self.logger.warning(f"No processor found for task type: {task.task_type}")
                task.status = "FAILED"
                task.retry_count += 1
                
                if task.retry_count < task.max_retries:
                    # Re-queue for retry
                    task.status = "PENDING"
                    self.task_queue.append(task)
                    del self.processing_tasks[task.task_id]
                else:
                    # Max retries reached
                    self.completed_tasks[task.task_id] = task
                    del self.processing_tasks[task.task_id]
                
        except Exception as e:
            self.logger.error(f"Error processing task {task.task_id}: {e}")
            task.status = "FAILED"
            task.retry_count += 1
            
            if task.retry_count < task.max_retries:
                task.status = "PENDING"
                self.task_queue.append(task)
            else:
                self.completed_tasks[task.task_id] = task
            
            del self.processing_tasks[task.task_id]
    
    async def submit_task(self, task_type: str, data: Dict, priority: int = 5, deadline: Optional[datetime] = None) -> str:
        """Submit a task for edge processing."""
        task_id = f"{task_type}_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        
        task = EdgeTask(
            task_id=task_id,
            task_type=task_type,
            priority=priority,
            data=data.copy(),
            created_at=datetime.now(),
            deadline=deadline
        )
        
        self.task_queue.append(task)
        
        # Store in local database for persistence
        await self._store_task_locally(task)
        
        self.logger.debug(f"Submitted task {task_id} with priority {priority}")
        return task_id
    
    async def get_task_result(self, task_id: str, timeout: float = 10.0) -> Optional[Dict]:
        """Get the result of a processed task."""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            if task_id in self.completed_tasks:
                task = self.completed_tasks[task_id]
                if task.status == "COMPLETED":
                    return task.data.get('result')
                else:
                    return None
            
            await asyncio.sleep(0.1)
        
        # Timeout reached
        return None
    
    async def cache_data(self, key: str, value: Any, expires_in: Optional[timedelta] = None):
        """Cache data for fast access."""
        # Calculate cache entry size
        serialized_value = pickle.dumps(value)
        entry_size = len(serialized_value)
        
        # Check if we need to make space
        while self.current_cache_size + entry_size > self.cache_size_bytes and self.local_cache:
            self._evict_cache_entry()
        
        # Create cache entry
        expires_at = datetime.now() + expires_in if expires_in else None
        entry = CacheEntry(
            key=key,
            value=value,
            created_at=datetime.now(),
            expires_at=expires_at,
            access_count=0,
            last_accessed=datetime.now()
        )
        
        self.local_cache[key] = entry
        self.current_cache_size += entry_size
        
        # Store in local database
        await self._store_cache_entry(entry)
    
    async def get_cached_data(self, key: str) -> Optional[Any]:
        """Retrieve cached data."""
        if key in self.local_cache:
            entry = self.local_cache[key]
            
            # Check if expired
            if entry.expires_at and datetime.now() > entry.expires_at:
                del self.local_cache[key]
                return None
            
            # Update access statistics
            entry.access_count += 1
            entry.last_accessed = datetime.now()
            
            return entry.value
        
        return None
    
    def _evict_cache_entry(self):
        """Evict least recently used cache entry."""
        if not self.local_cache:
            return
        
        # Find LRU entry
        lru_key = min(self.local_cache.keys(), key=lambda k: self.local_cache[k].last_accessed)
        
        # Remove entry
        entry = self.local_cache[lru_key]
        entry_size = len(pickle.dumps(entry.value))
        
        del self.local_cache[lru_key]
        self.current_cache_size -= entry_size
    
    async def _monitor_communication(self):
        """Monitor communication status and switch to offline mode if needed."""
        while self.running:
            try:
                # Check if communication is still active
                time_since_last_comm = datetime.now() - self.last_communication
                
                if time_since_last_comm > self.communication_timeout:
                    if not self.offline_mode:
                        self.logger.warning("Communication timeout - switching to offline mode")
                        self.offline_mode = True
                else:
                    if self.offline_mode:
                        self.logger.info("Communication restored - switching to online mode")
                        self.offline_mode = False
                
                await asyncio.sleep(5)  # Check every 5 seconds
                
            except Exception as e:
                self.logger.error(f"Error in communication monitoring: {e}")
                await asyncio.sleep(10)
    
    async def _cache_maintenance(self):
        """Perform periodic cache maintenance."""
        while self.running:
            try:
                # Remove expired entries
                current_time = datetime.now()
                expired_keys = [
                    key for key, entry in self.local_cache.items()
                    if entry.expires_at and current_time > entry.expires_at
                ]
                
                for key in expired_keys:
                    del self.local_cache[key]
                
                if expired_keys:
                    self.logger.debug(f"Removed {len(expired_keys)} expired cache entries")
                
                await asyncio.sleep(60)  # Run every minute
                
            except Exception as e:
                self.logger.error(f"Error in cache maintenance: {e}")
                await asyncio.sleep(300)  # Wait 5 minutes on error
    
    async def _offline_data_sync(self):
        """Sync offline data when communication is restored."""
        while self.running:
            try:
                if not self.offline_mode and self.offline_data_buffer:
                    self.logger.info(f"Syncing {len(self.offline_data_buffer)} offline data entries")
                    
                    # Process offline data buffer
                    sync_count = 0
                    for data_entry in self.offline_data_buffer[:]:
                        try:
                            # Simulate syncing with server
                            await asyncio.sleep(0.1)
                            self.offline_data_buffer.remove(data_entry)
                            sync_count += 1
                        except Exception as e:
                            self.logger.error(f"Error syncing data entry: {e}")
                            break
                    
                    if sync_count > 0:
                        self.logger.info(f"Successfully synced {sync_count} data entries")
                
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                self.logger.error(f"Error in offline data sync: {e}")
                await asyncio.sleep(60)
    
    async def _store_task_locally(self, task: EdgeTask):
        """Store task in local database."""
        try:
            conn = sqlite3.connect(self.local_db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO edge_tasks 
                (task_id, task_type, priority, data_json, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                task.task_id,
                task.task_type,
                task.priority,
                json.dumps(task.data),
                task.status,
                task.created_at.isoformat()
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            self.logger.error(f"Error storing task locally: {e}")
    
    async def _store_cache_entry(self, entry: CacheEntry):
        """Store cache entry in local database."""
        try:
            conn = sqlite3.connect(self.local_db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO cached_results 
                (cache_key, result_data, created_at, expires_at, access_count)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                entry.key,
                pickle.dumps(entry.value).hex(),
                entry.created_at.isoformat(),
                entry.expires_at.isoformat() if entry.expires_at else None,
                entry.access_count
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            self.logger.error(f"Error storing cache entry: {e}")
    
    # Edge processing functions
    def _process_health_data(self, data: Dict) -> Dict:
        """Process health monitoring data locally."""
        # Simulate health data analysis
        health_score = sum(data.get('vitals', {}).values()) / len(data.get('vitals', {})) if data.get('vitals') else 0.5
        
        return {
            'health_score': health_score,
            'status': 'NORMAL' if health_score > 0.7 else 'WARNING' if health_score > 0.5 else 'CRITICAL',
            'processed_at': datetime.now().isoformat(),
            'processor': 'edge_health_analyzer'
        }
    
    def _process_navigation_data(self, data: Dict) -> Dict:
        """Process navigation calculations locally."""
        # Simulate navigation processing
        return {
            'trajectory_valid': True,
            'course_correction': data.get('course_correction', 0),
            'estimated_arrival': (datetime.now() + timedelta(minutes=data.get('eta_minutes', 120))).isoformat(),
            'processed_at': datetime.now().isoformat(),
            'processor': 'edge_navigation'
        }
    
    def _process_debris_data(self, data: Dict) -> Dict:
        """Process debris tracking data locally."""
        # Simulate debris analysis
        collision_risk = data.get('proximity_score', 0.1)
        
        return {
            'collision_probability': collision_risk,
            'risk_level': 'HIGH' if collision_risk > 0.7 else 'MEDIUM' if collision_risk > 0.3 else 'LOW',
            'avoidance_required': collision_risk > 0.5,
            'processed_at': datetime.now().isoformat(),
            'processor': 'edge_debris_tracker'
        }
    
    def _process_emergency_data(self, data: Dict) -> Dict:
        """Process emergency response data locally."""
        # Simulate emergency analysis
        emergency_level = data.get('emergency_level', 'GREEN')
        
        return {
            'emergency_response': emergency_level != 'GREEN',
            'automated_actions': ['activate_emergency_protocols'] if emergency_level == 'RED' else [],
            'estimated_response_time': 30 if emergency_level == 'RED' else 60,
            'processed_at': datetime.now().isoformat(),
            'processor': 'edge_emergency'
        }
    
    def _process_system_monitoring(self, data: Dict) -> Dict:
        """Process system monitoring data locally."""
        # Simulate system analysis
        system_health = sum(data.get('systems', {}).values()) / len(data.get('systems', {})) if data.get('systems') else 0.8
        
        return {
            'overall_health': system_health,
            'degraded_systems': [k for k, v in data.get('systems', {}).items() if v < 0.7],
            'maintenance_required': system_health < 0.8,
            'processed_at': datetime.now().isoformat(),
            'processor': 'edge_system_monitor'
        }
    
    def _process_data_compression(self, data: Dict) -> Dict:
        """Process data compression locally."""
        # Simulate data compression
        original_size = len(json.dumps(data))
        compressed_data = json.dumps(data)  # In reality, would use actual compression
        
        return {
            'compressed_data': compressed_data,
            'compression_ratio': 0.7,  # Simulated 70% of original size
            'original_size': original_size,
            'processed_at': datetime.now().isoformat(),
            'processor': 'edge_compressor'
        }
    
    def _process_predictive_maintenance(self, data: Dict) -> Dict:
        """Process predictive maintenance analysis locally."""
        # Simulate maintenance prediction
        maintenance_score = data.get('wear_indicators', {}).get('average', 0.3)
        
        return {
            'maintenance_needed': maintenance_score > 0.7,
            'predicted_failure_days': max(1, int((1.0 - maintenance_score) * 100)),
            'priority_systems': [k for k, v in data.get('wear_indicators', {}).items() if v > 0.8],
            'processed_at': datetime.now().isoformat(),
            'processor': 'edge_maintenance_predictor'
        }
    
    def _process_safety_assessment(self, data: Dict) -> Dict:
        """Process safety assessment locally."""
        # Simulate safety analysis
        safety_factors = data.get('safety_factors', {})
        overall_safety = sum(safety_factors.values()) / len(safety_factors) if safety_factors else 0.9
        
        return {
            'safety_score': overall_safety,
            'safety_level': 'HIGH' if overall_safety > 0.8 else 'MEDIUM' if overall_safety > 0.6 else 'LOW',
            'risk_factors': [k for k, v in safety_factors.items() if v < 0.6],
            'processed_at': datetime.now().isoformat(),
            'processor': 'edge_safety_assessor'
        }
    
    def update_communication_status(self):
        """Update last communication timestamp."""
        self.last_communication = datetime.now()
        if self.offline_mode:
            self.offline_mode = False
    
    async def get_edge_status(self) -> Dict:
        """Get current edge computing status."""
        return {
            'running': self.running,
            'offline_mode': self.offline_mode,
            'task_queue_length': len(self.task_queue),
            'processing_tasks': len(self.processing_tasks),
            'completed_tasks': len(self.completed_tasks),
            'cache_entries': len(self.local_cache),
            'cache_size_mb': self.current_cache_size / 1024 / 1024,
            'offline_buffer_size': len(self.offline_data_buffer),
            'last_communication': self.last_communication.isoformat(),
            'worker_threads': len(self.worker_threads)
        }

# Global edge computing manager
edge_manager = EdgeComputingManager()

async def get_edge_manager():
    """Get the global edge computing manager."""
    return edge_manager
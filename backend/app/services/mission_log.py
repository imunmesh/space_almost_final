# Mission Logbook Service
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from app.models.schemas import MissionLogEntry, AlertSeverity

class MissionLogService:
    def __init__(self):
        self.log_entries = {}  # In production, use database
        self.auto_log_enabled = True
        self.log_categories = {
            "Science": "🔬",
            "Engineering": "⚙️", 
            "Emergency": "🚨",
            "Navigation": "🧭",
            "Communication": "📡",
            "Medical": "🏥",
            "Operations": "🚀",
            "Personal": "👤"
        }
        
        # Initialize with some sample entries
        self._create_sample_entries()
    
    def _create_sample_entries(self):
        """Create some sample log entries for demonstration"""
        sample_entries = [
            {
                "title": "Mission Start",
                "content": "AstroHELP mission initiated. All systems nominal. Crew in good health.",
                "author": "commander",
                "tags": ["Operations", "Medical"],
                "priority": AlertSeverity.LOW
            },
            {
                "title": "Navigation System Check",
                "content": "Completed routine navigation system diagnostics. All sensors functioning within normal parameters.",
                "author": "pilot", 
                "tags": ["Engineering", "Navigation"],
                "priority": AlertSeverity.LOW
            },
            {
                "title": "Sample Collection Protocol",
                "content": "Established procedures for sample collection during EVA. Priority samples identified for analysis.",
                "author": "scientist",
                "tags": ["Science", "Operations"],
                "priority": AlertSeverity.MEDIUM
            }
        ]
        
        for i, entry_data in enumerate(sample_entries):
            entry_id = str(uuid.uuid4())
            entry = MissionLogEntry(
                id=entry_id,
                timestamp=datetime.now() - timedelta(hours=24-i*8),
                **entry_data
            )
            self.log_entries[entry_id] = entry
    
    def create_log_entry(self, title: str, content: str, author: str, 
                        tags: Optional[List[str]] = None, priority: AlertSeverity = AlertSeverity.LOW,
                        attachments: Optional[List[str]] = None) -> MissionLogEntry:
        """Create a new mission log entry"""
        entry_id = str(uuid.uuid4())
        
        entry = MissionLogEntry(
            id=entry_id,
            title=title,
            content=content,
            author=author,
            tags=tags or [],
            priority=priority,
            attachments=attachments or []
        )
        
        self.log_entries[entry_id] = entry
        return entry
    
    def get_log_entry(self, entry_id: str) -> Optional[MissionLogEntry]:
        """Get a specific log entry by ID"""
        return self.log_entries.get(entry_id)
    
    def update_log_entry(self, entry_id: str, updates: Dict) -> Optional[MissionLogEntry]:
        """Update an existing log entry"""
        entry = self.log_entries.get(entry_id)
        if not entry:
            return None
        
        if not entry.is_editable:
            raise ValueError("Log entry is not editable")
        
        # Update allowed fields
        allowed_fields = ['title', 'content', 'tags', 'priority', 'attachments']
        for field, value in updates.items():
            if field in allowed_fields and hasattr(entry, field):
                setattr(entry, field, value)
        
        return entry
    
    def delete_log_entry(self, entry_id: str, user: str) -> bool:
        """Delete a log entry (only by author or commander)"""
        entry = self.log_entries.get(entry_id)
        if not entry:
            return False
        
        # Only author or commander can delete
        if entry.author != user and user != "commander":
            raise ValueError("Insufficient permissions to delete log entry")
        
        del self.log_entries[entry_id]
        return True
    
    def get_log_entries(self, 
                       author: Optional[str] = None,
                       tags: Optional[List[str]] = None,
                       priority: Optional[AlertSeverity] = None,
                       start_date: Optional[datetime] = None,
                       end_date: Optional[datetime] = None,
                       limit: int = 50,
                       offset: int = 0) -> List[MissionLogEntry]:
        """Get filtered log entries"""
        entries = list(self.log_entries.values())
        
        # Apply filters
        if author:
            entries = [e for e in entries if e.author == author]
        
        if tags:
            entries = [e for e in entries if any(tag in e.tags for tag in tags)]
        
        if priority:
            entries = [e for e in entries if e.priority == priority]
        
        if start_date:
            entries = [e for e in entries if e.timestamp >= start_date]
        
        if end_date:
            entries = [e for e in entries if e.timestamp <= end_date]
        
        # Sort by timestamp (newest first)
        entries.sort(key=lambda x: x.timestamp, reverse=True)
        
        # Apply pagination
        return entries[offset:offset + limit]
    
    def search_log_entries(self, query: str, author: Optional[str] = None) -> List[MissionLogEntry]:
        """Search log entries by content"""
        query = query.lower()
        results = []
        
        for entry in self.log_entries.values():
            if author and entry.author != author:
                continue
            
            # Search in title, content, and tags
            if (query in entry.title.lower() or 
                query in entry.content.lower() or
                any(query in tag.lower() for tag in entry.tags)):
                results.append(entry)
        
        # Sort by timestamp (newest first)
        results.sort(key=lambda x: x.timestamp, reverse=True)
        return results
    
    def get_log_statistics(self) -> Dict:
        """Get statistics about log entries"""
        entries = list(self.log_entries.values())
        
        # Count by author
        author_counts = {}
        for entry in entries:
            author_counts[entry.author] = author_counts.get(entry.author, 0) + 1
        
        # Count by tags
        tag_counts = {}
        for entry in entries:
            for tag in entry.tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Count by priority
        priority_counts = {}
        for entry in entries:
            priority_str = entry.priority.value
            priority_counts[priority_str] = priority_counts.get(priority_str, 0) + 1
        
        # Recent activity (last 24 hours)
        recent_cutoff = datetime.now() - timedelta(hours=24)
        recent_entries = [e for e in entries if e.timestamp >= recent_cutoff]
        
        return {
            "total_entries": len(entries),
            "by_author": author_counts,
            "by_tags": tag_counts,
            "by_priority": priority_counts,
            "recent_entries": len(recent_entries),
            "available_tags": list(self.log_categories.keys()),
            "oldest_entry": min(entries, key=lambda x: x.timestamp).timestamp if entries else None,
            "newest_entry": max(entries, key=lambda x: x.timestamp).timestamp if entries else None
        }
    
    def auto_log_event(self, event_type: str, description: str, 
                      author: str = "system", priority: AlertSeverity = AlertSeverity.LOW,
                      tags: Optional[List[str]] = None) -> Optional[MissionLogEntry]:
        """Automatically create a log entry for system events"""
        if not self.auto_log_enabled:
            return None
        
        title = f"Auto Log: {event_type}"
        tags = tags or ["Operations"]
        
        return self.create_log_entry(
            title=title,
            content=description,
            author=author,
            tags=tags,
            priority=priority
        )
    
    def export_logs(self, format_type: str = "json", 
                   filters: Optional[Dict] = None) -> str:
        """Export logs in various formats"""
        entries = self.get_log_entries(**(filters or {}))
        
        if format_type == "json":
            import json
            return json.dumps([entry.dict() for entry in entries], default=str, indent=2)
        
        elif format_type == "csv":
            import csv
            import io
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Header
            writer.writerow(['ID', 'Timestamp', 'Author', 'Title', 'Content', 'Tags', 'Priority'])
            
            # Data
            for entry in entries:
                writer.writerow([
                    entry.id,
                    entry.timestamp.isoformat(),
                    entry.author,
                    entry.title,
                    entry.content,
                    ','.join(entry.tags),
                    entry.priority.value
                ])
            
            return output.getvalue()
        
        elif format_type == "markdown":
            lines = ["# Mission Log Report", ""]
            
            for entry in entries:
                lines.append(f"## {entry.title}")
                lines.append(f"**Time:** {entry.timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
                lines.append(f"**Author:** {entry.author}")
                lines.append(f"**Priority:** {entry.priority.value}")
                if entry.tags:
                    lines.append(f"**Tags:** {', '.join(entry.tags)}")
                lines.append("")
                lines.append(entry.content)
                lines.append("")
                lines.append("---")
                lines.append("")
            
            return '\n'.join(lines)
        
        else:
            raise ValueError(f"Unsupported export format: {format_type}")
    
    def get_timeline_data(self, days: int = 7) -> List[Dict]:
        """Get timeline data for visualization"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        entries = self.get_log_entries(start_date=start_date, end_date=end_date)
        
        timeline_data = []
        for entry in entries:
            timeline_data.append({
                "id": entry.id,
                "timestamp": entry.timestamp.isoformat(),
                "title": entry.title,
                "author": entry.author,
                "tags": entry.tags,
                "priority": entry.priority.value,
                "icon": self._get_entry_icon(entry),
                "color": self._get_priority_color(entry.priority)
            })
        
        return timeline_data
    
    def _get_entry_icon(self, entry: MissionLogEntry) -> str:
        """Get appropriate icon for log entry based on tags"""
        for tag in entry.tags:
            if tag in self.log_categories:
                return self.log_categories[tag]
        return "📝"  # Default icon
    
    def _get_priority_color(self, priority: AlertSeverity) -> str:
        """Get color code for priority level"""
        color_map = {
            AlertSeverity.LOW: "#4CAF50",
            AlertSeverity.MEDIUM: "#FF9800", 
            AlertSeverity.HIGH: "#FF5722",
            AlertSeverity.CRITICAL: "#F44336"
        }
        return color_map.get(priority, "#9E9E9E")

# Global instance
mission_log_service = MissionLogService()
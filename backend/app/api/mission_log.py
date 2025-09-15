from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.schemas import MissionLogEntry, AlertSeverity
from app.services.auth import get_current_user
from app.services.mission_log import mission_log_service

router = APIRouter(prefix="/mission-log", tags=["mission log"])
security = HTTPBearer()

class LogEntryCreate(BaseModel):
    title: str
    content: str
    tags: List[str] = []
    priority: AlertSeverity = AlertSeverity.LOW
    attachments: List[str] = []

class LogEntryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    priority: Optional[AlertSeverity] = None
    attachments: Optional[List[str]] = None

@router.post("/entries", response_model=MissionLogEntry)
async def create_log_entry(
    log_data: LogEntryCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a new mission log entry"""
    current_user = get_current_user(credentials.credentials)
    
    entry = mission_log_service.create_log_entry(
        title=log_data.title,
        content=log_data.content,
        author=current_user.username,
        tags=log_data.tags,
        priority=log_data.priority,
        attachments=log_data.attachments
    )
    
    return entry

@router.get("/entries", response_model=List[MissionLogEntry])
async def get_log_entries(
    author: Optional[str] = Query(None, description="Filter by author"),
    tags: Optional[str] = Query(None, description="Comma-separated list of tags"),
    priority: Optional[AlertSeverity] = Query(None, description="Filter by priority"),
    limit: int = Query(50, ge=1, le=100, description="Number of entries to return"),
    offset: int = Query(0, ge=0, description="Number of entries to skip"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get mission log entries with optional filtering"""
    current_user = get_current_user(credentials.credentials)
    
    # Parse tags if provided
    tag_list = tags.split(',') if tags else None
    
    entries = mission_log_service.get_log_entries(
        author=author,
        tags=tag_list,
        priority=priority,
        limit=limit,
        offset=offset
    )
    
    return entries

@router.get("/entries/{entry_id}", response_model=MissionLogEntry)
async def get_log_entry(
    entry_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get a specific log entry"""
    current_user = get_current_user(credentials.credentials)
    
    entry = mission_log_service.get_log_entry(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Log entry not found")
    
    return entry

@router.put("/entries/{entry_id}", response_model=MissionLogEntry)
async def update_log_entry(
    entry_id: str,
    updates: LogEntryUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update an existing log entry"""
    current_user = get_current_user(credentials.credentials)
    
    entry = mission_log_service.get_log_entry(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Log entry not found")
    
    # Check permissions
    if entry.author != current_user.username and current_user.role != "commander":
        raise HTTPException(status_code=403, detail="Not authorized to edit this log entry")
    
    # Filter out None values
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    
    try:
        updated_entry = mission_log_service.update_log_entry(entry_id, update_data)
        if not updated_entry:
            raise HTTPException(status_code=400, detail="Failed to update log entry")
        return updated_entry
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/entries/{entry_id}")
async def delete_log_entry(
    entry_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Delete a log entry"""
    current_user = get_current_user(credentials.credentials)
    
    try:
        success = mission_log_service.delete_log_entry(entry_id, current_user.username)
        if not success:
            raise HTTPException(status_code=404, detail="Log entry not found")
        return {"message": "Log entry deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.get("/search")
async def search_log_entries(
    query: str = Query(..., description="Search query"),
    author: Optional[str] = Query(None, description="Filter by author"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Search log entries by content"""
    current_user = get_current_user(credentials.credentials)
    
    results = mission_log_service.search_log_entries(query, author)
    return results

@router.get("/statistics")
async def get_log_statistics(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get mission log statistics"""
    current_user = get_current_user(credentials.credentials)
    
    stats = mission_log_service.get_log_statistics()
    return stats

@router.get("/timeline")
async def get_timeline_data(
    days: int = Query(7, ge=1, le=30, description="Number of days to include"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get timeline data for mission log visualization"""
    current_user = get_current_user(credentials.credentials)
    
    timeline = mission_log_service.get_timeline_data(days)
    return {"timeline": timeline, "days": days}

@router.get("/export")
async def export_logs(
    format_type: str = Query("json", regex="^(json|csv|markdown)$"),
    author: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Export mission logs in various formats"""
    current_user = get_current_user(credentials.credentials)
    
    # Build filters
    filters = {}
    if author:
        filters["author"] = author
    if tags:
        filters["tags"] = tags.split(',')
    
    try:
        export_data = mission_log_service.export_logs(format_type, filters)
        
        # Set appropriate content type
        content_types = {
            "json": "application/json",
            "csv": "text/csv", 
            "markdown": "text/markdown"
        }
        
        return {
            "format": format_type,
            "content": export_data,
            "content_type": content_types.get(format_type, "text/plain"),
            "filename": f"mission_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{format_type}"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/categories")
async def get_log_categories(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get available log categories and tags"""
    current_user = get_current_user(credentials.credentials)
    
    return {
        "categories": mission_log_service.log_categories,
        "priorities": [severity.value for severity in AlertSeverity],
        "common_tags": [
            "Science", "Engineering", "Emergency", "Navigation", 
            "Communication", "Medical", "Operations", "Personal"
        ]
    }

@router.post("/auto-log")
async def create_auto_log(
    event_type: str,
    description: str,
    priority: AlertSeverity = AlertSeverity.LOW,
    tags: List[str] = [],
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create an automatic log entry (for system events)"""
    current_user = get_current_user(credentials.credentials)
    
    # Only commanders and system can create auto-logs
    if current_user.role not in ["commander", "system"]:
        raise HTTPException(status_code=403, detail="Not authorized to create auto-logs")
    
    entry = mission_log_service.auto_log_event(
        event_type=event_type,
        description=description,
        author=current_user.username,
        priority=priority,
        tags=tags
    )
    
    if not entry:
        raise HTTPException(status_code=400, detail="Auto-logging is disabled")
    
    return entry
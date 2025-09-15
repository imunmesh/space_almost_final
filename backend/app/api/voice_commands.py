from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Dict
from app.models.schemas import VoiceCommand
from app.services.auth import get_current_user
from app.services.voice_commands import voice_command_processor

router = APIRouter(prefix="/voice", tags=["voice commands"])
security = HTTPBearer()

class VoiceInput(BaseModel):
    command: str

class VoiceResponse(BaseModel):
    success: bool
    response: str
    action: str
    confidence: float
    additional_data: Dict = {}

@router.post("/command", response_model=VoiceResponse)
async def process_voice_command(
    voice_input: VoiceInput,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Process a voice command"""
    current_user = get_current_user(credentials.credentials)
    
    if not voice_input.command.strip():
        raise HTTPException(status_code=400, detail="Empty command")
    
    # Process the voice command
    voice_command = voice_command_processor.process_command(
        voice_input.command,
        current_user.username,
        current_user.role
    )
    
    # Execute the command
    result = voice_command_processor.execute_command(voice_command)
    
    # Mark as executed
    voice_command.executed = result.get("success", False)
    
    return VoiceResponse(
        success=result.get("success", False),
        response=result.get("response", "Command processed"),
        action=result.get("action", "unknown"),
        confidence=voice_command.confidence,
        additional_data={k: v for k, v in result.items() if k not in ["success", "response", "action"]}
    )

@router.get("/help")
async def get_voice_help(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get available voice commands help"""
    current_user = get_current_user(credentials.credentials)
    
    help_result = voice_command_processor._get_help_text()
    
    return {
        "help_text": help_result,
        "examples": [
            "Open navigation",
            "Check oxygen levels", 
            "System status",
            "Emergency protocol",
            "Send message to pilot",
            "Start experiment analysis"
        ]
    }

@router.get("/status")
async def get_voice_system_status(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get voice command system status"""
    current_user = get_current_user(credentials.credentials)
    
    return {
        "voice_system": "operational",
        "supported_languages": ["English"],
        "available_intents": [
            "navigation", "vitals", "system", "mission_log", 
            "communication", "experiments", "general"
        ],
        "user_role": current_user.role,
        "role_permissions": get_role_permissions(current_user.role)
    }

def get_role_permissions(role: str) -> Dict:
    """Get permissions for different roles"""
    permissions = {
        "commander": {
            "navigation": True,
            "vitals": True,
            "system": True,
            "mission_log": True,
            "communication": True,
            "experiments": True,
            "emergency_protocols": True,
            "crew_management": True
        },
        "pilot": {
            "navigation": True,
            "vitals": True,
            "system": True,
            "mission_log": True,
            "communication": True,
            "experiments": False,
            "emergency_protocols": True,
            "crew_management": False
        },
        "scientist": {
            "navigation": False,
            "vitals": True,
            "system": True,
            "mission_log": True,
            "communication": True,
            "experiments": True,
            "emergency_protocols": False,
            "crew_management": False
        }
    }
    
    return permissions.get(role, permissions["scientist"])
# Voice Command Processing Service
import re
import json
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from app.models.schemas import VoiceCommand, AlertSeverity

class VoiceCommandProcessor:
    def __init__(self):
        self.command_patterns = {
            # Navigation commands
            "navigation": [
                (r"open navigation|show navigation|navigation panel", "open_navigation"),
                (r"check position|where are we|current position", "check_position"),
                (r"set course to (.+)|navigate to (.+)", "set_course"),
                (r"autopilot (on|off|enable|disable)", "toggle_autopilot"),
                (r"emergency stop|full stop|stop engines", "emergency_stop"),
                (r"increase speed|speed up|more thrust", "increase_speed"),
                (r"decrease speed|slow down|less thrust", "decrease_speed"),
            ],
            
            # Vital signs commands
            "vitals": [
                (r"check oxygen|oxygen level|o2 level", "check_oxygen"),
                (r"check heart rate|heart rate|pulse", "check_heartrate"),
                (r"check temperature|body temperature|temp", "check_temperature"),
                (r"check blood pressure|bp|pressure", "check_bloodpressure"),
                (r"vital signs|check vitals|health status", "check_all_vitals"),
                (r"medical emergency|health emergency", "medical_emergency"),
            ],
            
            # System commands
            "system": [
                (r"system status|status report|all systems", "system_status"),
                (r"emergency protocol|emergency mode|red alert", "emergency_protocol"),
                (r"power status|battery level|energy", "power_status"),
                (r"communication check|comms check|radio check", "comm_check"),
                (r"life support|life support status", "life_support_status"),
            ],
            
            # Mission log commands
            "mission_log": [
                (r"log entry|create log|new log", "create_log"),
                (r"read log|show log|recent logs", "show_logs"),
                (r"tag (science|engineering|emergency)", "tag_log"),
            ],
            
            # Chat/Communication commands
            "communication": [
                (r"send message to (.+)", "send_message"),
                (r"call (.+)|contact (.+)", "call_crew"),
                (r"broadcast|all crew|everyone", "broadcast_message"),
                (r"emergency broadcast|mayday", "emergency_broadcast"),
            ],
            
            # Experiment commands (for scientist)
            "experiments": [
                (r"start experiment (.+)", "start_experiment"),
                (r"check experiment|experiment status", "check_experiments"),
                (r"analyze sample|run analysis", "analyze_sample"),
                (r"record observation", "record_observation"),
            ],
            
            # General commands
            "general": [
                (r"help|what can you do|commands", "help"),
                (r"time|current time|mission time", "current_time"),
                (r"weather|space weather|solar activity", "space_weather"),
                (r"crew status|team status|who's on duty", "crew_status"),
            ]
        }
        
        self.confirmation_phrases = [
            "Understood", "Command received", "Acknowledged", "Roger that",
            "Processing", "Executing command", "On it", "Copy that"
        ]
        
        self.error_phrases = [
            "Sorry, I didn't understand that",
            "Could you repeat the command?",
            "Command not recognized",
            "Please try again"
        ]

    def process_command(self, command_text: str, user: str, user_role: str) -> VoiceCommand:
        """Process a voice command and return structured data"""
        command_text = command_text.lower().strip()
        
        # Find matching pattern
        intent, parameters, confidence = self._match_command(command_text)
        
        voice_command = VoiceCommand(
            command=command_text,
            intent=intent,
            parameters=parameters,
            confidence=confidence,
            user=user,
            executed=False
        )
        
        return voice_command

    def _match_command(self, command_text: str) -> Tuple[str, Dict, float]:
        """Match command text to known patterns"""
        best_match = None
        best_confidence = 0.0
        best_intent = "unknown"
        best_parameters = {}
        
        for category, patterns in self.command_patterns.items():
            for pattern, intent in patterns:
                match = re.search(pattern, command_text, re.IGNORECASE)
                if match:
                    confidence = len(match.group(0)) / len(command_text)
                    if confidence > best_confidence:
                        best_confidence = confidence
                        best_intent = f"{category}.{intent}"
                        best_match = match
                        
                        # Extract parameters from capture groups
                        if match.groups():
                            best_parameters = {
                                "target": match.group(1) if len(match.groups()) >= 1 else None,
                                "value": match.group(2) if len(match.groups()) >= 2 else None
                            }
        
        return best_intent, best_parameters, best_confidence

    def execute_command(self, voice_command: VoiceCommand) -> Dict:
        """Execute a voice command and return response"""
        intent_parts = voice_command.intent.split('.')
        category = intent_parts[0] if len(intent_parts) > 0 else "unknown"
        action = intent_parts[1] if len(intent_parts) > 1 else "unknown"
        
        # Route to appropriate handler
        if category == "navigation":
            return self._handle_navigation_command(action, voice_command.parameters)
        elif category == "vitals":
            return self._handle_vitals_command(action, voice_command.parameters)
        elif category == "system":
            return self._handle_system_command(action, voice_command.parameters)
        elif category == "mission_log":
            return self._handle_mission_log_command(action, voice_command.parameters)
        elif category == "communication":
            return self._handle_communication_command(action, voice_command.parameters)
        elif category == "experiments":
            return self._handle_experiments_command(action, voice_command.parameters)
        elif category == "general":
            return self._handle_general_command(action, voice_command.parameters)
        else:
            return {
                "success": False,
                "response": "Command not recognized. Try 'help' for available commands.",
                "action": "error"
            }

    def _handle_navigation_command(self, action: str, parameters: Dict) -> Dict:
        """Handle navigation-related commands"""
        if action == "open_navigation":
            return {
                "success": True,
                "response": "Opening navigation panel",
                "action": "open_panel",
                "panel": "navigation"
            }
        elif action == "check_position":
            return {
                "success": True,
                "response": "Displaying current spacecraft position",
                "action": "show_position"
            }
        elif action == "set_course":
            target = parameters.get("target", "unknown destination")
            return {
                "success": True,
                "response": f"Setting course to {target}",
                "action": "set_destination",
                "target": target
            }
        elif action == "toggle_autopilot":
            mode = parameters.get("target", "on")
            return {
                "success": True,
                "response": f"Autopilot {mode}",
                "action": "toggle_autopilot",
                "mode": mode in ["on", "enable"]
            }
        elif action == "emergency_stop":
            return {
                "success": True,
                "response": "Emergency stop initiated",
                "action": "emergency_stop",
                "priority": "high"
            }
        else:
            return {"success": False, "response": "Navigation command not implemented"}

    def _handle_vitals_command(self, action: str, parameters: Dict) -> Dict:
        """Handle vital signs commands"""
        if action == "check_oxygen":
            return {
                "success": True,
                "response": "Displaying oxygen levels",
                "action": "show_vitals",
                "vital_type": "oxygen"
            }
        elif action == "check_heartrate":
            return {
                "success": True,
                "response": "Displaying heart rate",
                "action": "show_vitals",
                "vital_type": "heart_rate"
            }
        elif action == "check_temperature":
            return {
                "success": True,
                "response": "Displaying body temperature",
                "action": "show_vitals",
                "vital_type": "temperature"
            }
        elif action == "check_bloodpressure":
            return {
                "success": True,
                "response": "Displaying blood pressure",
                "action": "show_vitals",
                "vital_type": "blood_pressure"
            }
        elif action == "check_all_vitals":
            return {
                "success": True,
                "response": "Displaying all vital signs",
                "action": "show_vitals",
                "vital_type": "all"
            }
        elif action == "medical_emergency":
            return {
                "success": True,
                "response": "Medical emergency protocol activated",
                "action": "medical_emergency",
                "priority": "critical"
            }
        else:
            return {"success": False, "response": "Vitals command not implemented"}

    def _handle_system_command(self, action: str, parameters: Dict) -> Dict:
        """Handle system-related commands"""
        if action == "system_status":
            return {
                "success": True,
                "response": "Displaying system status",
                "action": "show_system_status"
            }
        elif action == "emergency_protocol":
            return {
                "success": True,
                "response": "Emergency protocol activated",
                "action": "emergency_protocol",
                "priority": "critical"
            }
        elif action == "power_status":
            return {
                "success": True,
                "response": "Displaying power status",
                "action": "show_power_status"
            }
        elif action == "comm_check":
            return {
                "success": True,
                "response": "Communication systems check initiated",
                "action": "comm_check"
            }
        elif action == "life_support_status":
            return {
                "success": True,
                "response": "Displaying life support status",
                "action": "show_life_support"
            }
        else:
            return {"success": False, "response": "System command not implemented"}

    def _handle_mission_log_command(self, action: str, parameters: Dict) -> Dict:
        """Handle mission log commands"""
        if action == "create_log":
            return {
                "success": True,
                "response": "Opening log entry form",
                "action": "create_log_entry"
            }
        elif action == "show_logs":
            return {
                "success": True,
                "response": "Displaying recent log entries",
                "action": "show_mission_logs"
            }
        elif action == "tag_log":
            tag = parameters.get("target", "general")
            return {
                "success": True,
                "response": f"Tagging log entry as {tag}",
                "action": "tag_log",
                "tag": tag
            }
        else:
            return {"success": False, "response": "Mission log command not implemented"}

    def _handle_communication_command(self, action: str, parameters: Dict) -> Dict:
        """Handle communication commands"""
        if action == "send_message":
            recipient = parameters.get("target", "crew")
            return {
                "success": True,
                "response": f"Opening message to {recipient}",
                "action": "open_chat",
                "recipient": recipient
            }
        elif action == "call_crew":
            crew_member = parameters.get("target", "crew")
            return {
                "success": True,
                "response": f"Calling {crew_member}",
                "action": "voice_call",
                "recipient": crew_member
            }
        elif action == "broadcast_message":
            return {
                "success": True,
                "response": "Opening broadcast message",
                "action": "broadcast",
                "channel": "general"
            }
        elif action == "emergency_broadcast":
            return {
                "success": True,
                "response": "Emergency broadcast initiated",
                "action": "emergency_broadcast",
                "priority": "critical"
            }
        else:
            return {"success": False, "response": "Communication command not implemented"}

    def _handle_experiments_command(self, action: str, parameters: Dict) -> Dict:
        """Handle experiment-related commands"""
        if action == "start_experiment":
            experiment = parameters.get("target", "unknown experiment")
            return {
                "success": True,
                "response": f"Starting {experiment}",
                "action": "start_experiment",
                "experiment": experiment
            }
        elif action == "check_experiments":
            return {
                "success": True,
                "response": "Displaying experiment status",
                "action": "show_experiments"
            }
        elif action == "analyze_sample":
            return {
                "success": True,
                "response": "Starting sample analysis",
                "action": "analyze_sample"
            }
        elif action == "record_observation":
            return {
                "success": True,
                "response": "Opening observation recorder",
                "action": "record_observation"
            }
        else:
            return {"success": False, "response": "Experiment command not implemented"}

    def _handle_general_command(self, action: str, parameters: Dict) -> Dict:
        """Handle general commands"""
        if action == "help":
            return {
                "success": True,
                "response": self._get_help_text(),
                "action": "show_help"
            }
        elif action == "current_time":
            current_time = datetime.now().strftime("%H:%M:%S")
            return {
                "success": True,
                "response": f"Current time is {current_time}",
                "action": "show_time",
                "time": current_time
            }
        elif action == "space_weather":
            return {
                "success": True,
                "response": "Displaying space weather conditions",
                "action": "show_space_weather"
            }
        elif action == "crew_status":
            return {
                "success": True,
                "response": "Displaying crew status",
                "action": "show_crew_status"
            }
        else:
            return {"success": False, "response": "General command not implemented"}

    def _get_help_text(self) -> str:
        """Return help text with available commands"""
        return """Available voice commands:
        
Navigation: "open navigation", "check position", "set course to Mars", "autopilot on/off"
Vitals: "check oxygen", "check heart rate", "vital signs", "medical emergency"
System: "system status", "emergency protocol", "power status", "communication check"
Mission Log: "log entry", "show logs", "tag science/engineering/emergency"
Communication: "send message to pilot", "call commander", "broadcast", "emergency broadcast"
Experiments: "start experiment", "check experiments", "analyze sample", "record observation"
General: "help", "time", "space weather", "crew status"

Say "help" anytime for this list."""

# Global instance
voice_command_processor = VoiceCommandProcessor()
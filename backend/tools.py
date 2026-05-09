from typing import Dict, Any, List
from services.maps_service import maps_service
from services.gmail_service import gmail_service
from services.firestore_service import firestore_service
from services.pubsub_service import pubsub_service
import asyncio

def search_venues(city: str, event_type: str, min_capacity: int, budget: float) -> List[Dict[str, Any]]:
    """Tool to search for appropriate venues using the mock maps service."""
    return maps_service.find_venues(city, event_type, min_capacity, budget)

def generate_meeting_link() -> str:
    """Tool to generate a Google Meet link."""
    return gmail_service.create_meet_link()

def send_invitations(email_html: str, target_audience: str, city: str) -> Dict[str, Any]:
    """Tool to dispatch email invitations."""
    return gmail_service.send_invitations(email_html, target_audience, city)

def log_event_status(event_id: str, agent_name: str, status: str, output: dict = None, log: str = None) -> bool:
    """Tool to update the event's execution state in Firestore."""
    firestore_service.log_workflow(event_id, agent_name, status, output, log)
    return True

async def broadcast_ui_update(event_id: str, agent_name: str, status: str, message: str) -> bool:
    """Tool to broadcast real-time SSE updates to the frontend."""
    await pubsub_service.publish(event_id, agent_name, status, message)
    return True

# Map tools for ADK
adk_tools = [
    search_venues,
    generate_meeting_link,
    send_invitations,
    log_event_status,
    broadcast_ui_update
]

from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import StreamingResponse
from models.schemas import EventRequest, EventPlan
from services.firestore_service import firestore_service
from services.pubsub_service import pubsub_service
from agents.router_agent import router_agent

router = APIRouter()

@router.post("/events/create")
async def create_event(request: EventRequest, background_tasks: BackgroundTasks):
    request_dict = request.dict()
    event_id = firestore_service.create_event(request_dict)
    
    # Run the workflow in the background
    background_tasks.add_task(router_agent.process_event, event_id, request_dict)
    
    return {"event_id": event_id, "status": "workflow_started"}

@router.get("/events/{event_id}")
async def get_event(event_id: str):
    event = firestore_service.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.get("/workflow/{event_id}/stream")
async def stream_workflow(event_id: str):
    return StreamingResponse(pubsub_service.subscribe(), media_type="text/event-stream")

@router.get("/agents/status")
async def agents_status():
    return {
        "RouterAgent": "online",
        "ResearchPlanningAgent": "online",
        "LogisticsAgent": "online",
        "CommunicationAgent": "online"
    }

@router.post("/invitations/send")
async def send_invitations(event_id: str):
    return {"status": "Invitations triggered manually (Not fully implemented in MVP)"}

@router.get("/events/{event_id}/plan")
async def get_event_plan(event_id: str):
    event = firestore_service.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Plan is not ready yet")
    return event

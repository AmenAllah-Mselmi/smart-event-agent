from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class EventRequest(BaseModel):
    city: str
    budget: float
    event_type: str
    audience: str
    format: str

class EventPlan(BaseModel):
    id: str
    city: str
    budget: float
    event_type: str
    audience: str
    format: str
    status: str
    theme: Optional[str] = None
    agenda: Optional[List[str]] = None
    tracks: Optional[List[str]] = None
    target_audience: Optional[str] = None
    venues: Optional[List[Dict[str, Any]]] = None
    estimated_attendance: Optional[int] = None
    budget_breakdown: Optional[Dict[str, float]] = None
    email_html: Optional[str] = None
    linkedin_post: Optional[str] = None
    twitter_post: Optional[str] = None
    meet_link: Optional[str] = None
    emails_sent: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime

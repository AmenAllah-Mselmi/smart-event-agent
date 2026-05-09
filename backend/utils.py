import json
import os
from datetime import datetime

from google import genai

def format_event_plan(plan_dict: dict) -> str:
    """Format the raw plan dictionary into a readable string or validate it."""
    return json.dumps(plan_dict, indent=2)

def get_current_timestamp() -> str:
    """Return the current UTC timestamp."""
    return datetime.utcnow().isoformat() + "Z"

def create_genai_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        return genai.Client(api_key=api_key)

    project_id = os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("PROJECT_ID")
    location = os.getenv("GOOGLE_CLOUD_REGION") or os.getenv("REGION") or "us-central1"

    if project_id:
        try:
            return genai.Client(vertexai=True, project=project_id, location=location)
        except Exception:
            return None

    return None

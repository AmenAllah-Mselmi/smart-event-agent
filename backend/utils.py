import json
from datetime import datetime

def format_event_plan(plan_dict: dict) -> str:
    """Format the raw plan dictionary into a readable string or validate it."""
    return json.dumps(plan_dict, indent=2)

def get_current_timestamp() -> str:
    """Return the current UTC timestamp."""
    return datetime.utcnow().isoformat() + "Z"

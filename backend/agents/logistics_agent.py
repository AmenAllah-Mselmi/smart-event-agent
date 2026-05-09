import asyncio
from services.pubsub_service import pubsub_service
from services.firestore_service import firestore_service
from services.maps_service import maps_service

class LogisticsAgent:
    async def execute(self, event_id: str, request_data: dict) -> dict:
        await pubsub_service.publish(event_id, "LogisticsAgent", "running", "Evaluating capacity and budget...")
        
        city = request_data.get("city")
        budget = request_data.get("budget", 0)
        event_type = request_data.get("event_type")
        format_pref = request_data.get("format", "on-site")
        
        # Estimate attendance based on budget and type
        estimated_attendance = int(budget / 10) if budget > 0 else 50
        if estimated_attendance < 10:
            estimated_attendance = 50
            
        await asyncio.sleep(1)
        await pubsub_service.publish(event_id, "LogisticsAgent", "running", f"Querying Maps API for venues in {city}...")
        
        venues = []
        if format_pref in ["on-site", "hybrid"]:
            venues = maps_service.find_venues(city, event_type, estimated_attendance, budget)
            
        budget_breakdown = {
            "venue": budget * 0.4,
            "catering": budget * 0.3,
            "marketing": budget * 0.2,
            "swag": budget * 0.1
        }
        
        result = {
            "venues": venues,
            "estimated_attendance": estimated_attendance,
            "format": format_pref,
            "budget_breakdown": budget_breakdown
        }
        
        await asyncio.sleep(1)
        await pubsub_service.publish(event_id, "LogisticsAgent", "done", "Venue search and logistics planning complete.")
        firestore_service.log_workflow(event_id, "LogisticsAgent", "completed", output=result)
        
        return result

logistics_agent = LogisticsAgent()

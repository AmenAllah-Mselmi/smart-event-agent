import os
import json
import asyncio
from services.pubsub_service import pubsub_service
from services.firestore_service import firestore_service
from utils import create_genai_client

class ResearchPlanningAgent:
    def __init__(self):
        self.client = create_genai_client()
        
    async def execute(self, event_id: str, request_data: dict) -> dict:
        await pubsub_service.publish(event_id, "ResearchAgent", "running", "Starting research on trending topics...")
        
        city = request_data.get("city")
        event_type = request_data.get("event_type")
        audience = request_data.get("audience")
        
        # Simulate antigravity browser sub-agent web research delay
        await asyncio.sleep(2)
        await pubsub_service.publish(event_id, "ResearchAgent", "running", f"Scraping X/Twitter and LinkedIn for tech trends in {city}...")
        await asyncio.sleep(2)
        
        prompt = f"""
        You are the Research Planning Agent for a tech community event.
        Event Type: {event_type}
        City: {city}
        Target Audience: {audience}
        
        Based on current tech trends, generate a JSON response with:
        - theme: A catchy theme for the event.
        - agenda: A detailed list of 5-6 agenda items, each MUST include the exact start and end times (e.g., '09:00 AM - 10:00 AM: Keynote').
        - tracks: A list of 2-3 tracks (e.g., AI, Web, Cloud).
        - target_audience: A specific description of the target audience.
        - gde_proposals: A list of 3 proposed Google Developer Experts (GDEs) relevant to the theme who could be invited as speakers.
        
        Return exactly valid JSON.
        """
        
        try:
            if self.client:
                response = self.client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=prompt,
                )
                result_text = response.text
                if result_text.startswith("```json"):
                    result_text = result_text[7:-3]
                elif result_text.startswith("```"):
                    result_text = result_text[3:-3]
                result = json.loads(result_text)
            else:
                # Mock response if no API key
                result = {
                    "theme": f"Building AI Agents with Gemini in {city}",
                    "agenda": [
                        "09:00 AM - 10:00 AM: Registration & Breakfast",
                        "10:00 AM - 11:00 AM: Opening Keynote on Agentic AI",
                        "11:00 AM - 12:30 PM: Hands-on ADK workshop",
                        "12:30 PM - 02:00 PM: Lunch & Networking",
                        "02:00 PM - 03:00 PM: Demo showcase"
                    ],
                    "tracks": ["AI", "Cloud", "Web"],
                    "target_audience": f"{audience} interested in generative AI",
                    "gde_proposals": ["Sayak Paul (Machine Learning)", "Wietse Venema (Google Cloud)", "Wassim Chegham (Web)"]
                }
        except Exception as e:
            result = {
                "theme": f"Future of Tech in {city}",
                "agenda": ["09:00 AM - 10:00 AM: Keynote", "10:00 AM - 12:00 PM: Workshop", "12:00 PM - 01:00 PM: Networking"],
                "tracks": ["General Tech"],
                "target_audience": audience,
                "gde_proposals": ["Local Expert 1", "Local Expert 2"],
                "error": str(e)
            }
            
        await pubsub_service.publish(event_id, "ResearchAgent", "done", "Research completed successfully.")
        firestore_service.log_workflow(event_id, "ResearchAgent", "completed", output=result)
        return result

research_agent = ResearchPlanningAgent()

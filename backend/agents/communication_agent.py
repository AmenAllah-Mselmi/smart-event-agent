import os
import json
import asyncio
from services.pubsub_service import pubsub_service
from services.firestore_service import firestore_service
from services.gmail_service import gmail_service
from utils import create_genai_client

class CommunicationAgent:
    def __init__(self):
        self.client = create_genai_client()

    async def execute(self, event_id: str, request_data: dict, research_data: dict) -> dict:
        await pubsub_service.publish(event_id, "CommunicationAgent", "running", "Drafting marketing materials...")
        
        city = request_data.get("city")
        event_type = request_data.get("event_type")
        theme = research_data.get("theme", "Tech Event")
        
        prompt = f"""
        You are the Communication Agent for a tech event.
        Event: {event_type} in {city}
        Theme: {theme}
        
        Generate a JSON response with:
        - email_html: An HTML email invitation.
        - linkedin_post: A professional LinkedIn post (under 280 chars).
        - twitter_post: A catchy X/Twitter post (under 280 chars) with hashtags.
        
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
                result = {
                    "email_html": f"<h1>Join us for {event_type} in {city}!</h1><p>Theme: {theme}</p>",
                    "linkedin_post": f"Excited to announce our upcoming {event_type} in {city}! Theme: {theme}. Join us to explore the latest in tech! #TechEvent #Networking",
                    "twitter_post": f"Don't miss our {event_type} in {city}! Theme: {theme}. See you there! 🚀 #Tech #{city}Tech"
                }
        except Exception as e:
            result = {
                "email_html": f"<h1>{event_type}</h1>",
                "linkedin_post": f"Join us for {event_type} in {city}!",
                "twitter_post": f"Join {event_type} in {city}!",
                "error": str(e)
            }
            
        await pubsub_service.publish(event_id, "CommunicationAgent", "running", "Creating Google Meet link and sending emails...")
        await asyncio.sleep(2)
        
        meet_link = gmail_service.create_meet_link()
        email_status = gmail_service.send_invitations(result.get("email_html"), request_data.get("audience"), city)
        
        result["meet_link"] = meet_link
        result["emails_sent"] = email_status.get("emails_sent", [])
        
        await pubsub_service.publish(event_id, "CommunicationAgent", "done", "Communications prepared and emails sent.")
        firestore_service.log_workflow(event_id, "CommunicationAgent", "completed", output=result)
        
        return result

communication_agent = CommunicationAgent()

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
        - email_html: A comprehensive, detailed HTML email invitation. Do NOT just write one word. Include a greeting, value proposition, agenda highlights, and a call to action.
        - linkedin_post: A highly engaging, detailed LinkedIn post to announce the event. Include emojis, value proposition, and relevant hashtags.
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
                    "email_html": f"<h2>🚀 Join us for an amazing {event_type} in {city}!</h2><p>We are thrilled to invite you to our upcoming event focused on <b>{theme}</b>.</p><p>Expect deep-dive technical sessions, great networking, and hands-on workshops with top experts. Don't miss out on this opportunity to level up your skills.</p><br><a href='#' style='padding:10px 20px; background:#378ADD; color:white; text-decoration:none; border-radius:5px;'>Register Now</a>",
                    "linkedin_post": f"🚀 Big news! We are hosting a {event_type} in {city}! \n\nGet ready to dive deep into {theme} with top industry experts and Google Developer Experts. Whether you're a seasoned developer or just starting out, there will be something for everyone. \n\nExpect hands-on workshops, amazing networking, and insightful keynotes. \n\nGrab your ticket today! 👇\n#TechEvent #AI #Web #Cloud #{city}Tech",
                    "twitter_post": f"Don't miss our {event_type} in {city}! Theme: {theme}. See you there! 🚀 #Tech #{city}Tech"
                }
        except Exception as e:
            result = {
                "email_html": f"<h1>{event_type} in {city}</h1><p>Join us to explore {theme}!</p>",
                "linkedin_post": f"🚀 Join us for an incredible {event_type} in {city}! We'll be exploring {theme}. Get your tickets now! #TechEvent #{city}Tech",
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

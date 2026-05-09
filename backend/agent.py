import os
from typing import Dict, Any
from google import genai
from tools import adk_tools
from utils import get_current_timestamp

class EventOperatorAgent:
    """
    Main ADK Agent that utilizes tools.py and skills.md to autonomously 
    operate the event planning workflow.
    """
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None
        
        # Load skills
        skills_path = os.path.join(os.path.dirname(__file__), "skills.md")
        with open(skills_path, "r") as f:
            self.system_instruction = f.read()

    async def run(self, event_request: Dict[str, Any]) -> str:
        """
        Executes the main loop using Gemini. 
        In a full Google ADK deployment, this is orchestrated via ADK's built-in 
        SequentialAgent or LoopAgent. Here, it is wrapped as the core Operator Agent.
        """
        if not self.client:
            return "Error: GEMINI_API_KEY not configured."
            
        prompt = f"""
        User Request: Plan an event with the following parameters:
        {event_request}
        
        Please act on this utilizing your provided skills and return a final summary plan.
        """
        
        # In ADK, we would bind `adk_tools` directly to the tool configuration.
        response = self.client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config={
                'system_instruction': self.system_instruction,
                # 'tools': adk_tools  # ADK Tool binding goes here
            }
        )
        
        return response.text

# Entry point for ADK deployment
if __name__ == "__main__":
    import asyncio
    agent = EventOperatorAgent()
    sample_request = {
        "city": "Tunis",
        "budget": 5000,
        "event_type": "DevFest",
        "audience": "developers",
        "format": "hybrid"
    }
    result = asyncio.run(agent.run(sample_request))
    print("Agent Output:", result)

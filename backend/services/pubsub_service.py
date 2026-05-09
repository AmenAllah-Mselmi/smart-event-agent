import json
import os
import asyncio
from datetime import datetime
from sse_starlette.sse import ServerSentEvent

class PubSubService:
    def __init__(self):
        self.topic = os.getenv("PUBSUB_TOPIC", "event-workflow")
        self.subscribers = []
        
    async def publish(self, event_id: str, agent_name: str, status: str, message: str, level: str = "info"):
        payload = {
            "event_id": event_id,
            "agent_name": agent_name,
            "status": status,
            "message": message,
            "level": level,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
        print(f"[{agent_name} | {level}] {message}")
        for queue in self.subscribers:
            await queue.put(payload)
            
    async def subscribe(self):
        queue = asyncio.Queue()
        self.subscribers.append(queue)
        try:
            while True:
                data = await queue.get()
                yield ServerSentEvent(data=json.dumps(data))
        finally:
            self.subscribers.remove(queue)

pubsub_service = PubSubService()

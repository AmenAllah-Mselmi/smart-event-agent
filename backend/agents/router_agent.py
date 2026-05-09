import asyncio
from services.pubsub_service import pubsub_service
from services.firestore_service import firestore_service
from agents.research_agent import research_agent
from agents.logistics_agent import logistics_agent
from agents.communication_agent import communication_agent

class RouterAgent:
    async def process_event(self, event_id: str, request_data: dict):
        try:
            await pubsub_service.publish(event_id, "RouterAgent", "running", "Orchestrating event planning workflow...")
            
            # Step 1: Run Research and Logistics in parallel
            await pubsub_service.publish(event_id, "RouterAgent", "running", "Delegating to Research and Logistics agents...")
            
            research_task = asyncio.create_task(research_agent.execute(event_id, request_data))
            logistics_task = asyncio.create_task(logistics_agent.execute(event_id, request_data))
            
            research_data, logistics_data = await asyncio.gather(research_task, logistics_task)
            
            # Step 2: Communication depends on Research
            await pubsub_service.publish(event_id, "RouterAgent", "running", "Delegating to Communication agent...")
            communication_data = await communication_agent.execute(event_id, request_data, research_data)
            
            # Step 3: Assemble final EventPlan
            await pubsub_service.publish(event_id, "RouterAgent", "running", "Assembling final event plan...")
            
            final_plan = {
                **research_data,
                **logistics_data,
                **communication_data,
                "status": "completed"
            }
            
            # Update Firestore
            firestore_service.update_event(event_id, final_plan)
            
            await pubsub_service.publish(event_id, "RouterAgent", "done", "Workflow completed successfully.")
            firestore_service.log_workflow(event_id, "RouterAgent", "completed", output=final_plan)
            
            return final_plan
            
        except Exception as e:
            error_msg = f"Workflow failed: {str(e)}"
            await pubsub_service.publish(event_id, "RouterAgent", "error", error_msg, level="error")
            firestore_service.update_event(event_id, {"status": "failed"})
            firestore_service.log_workflow(event_id, "RouterAgent", "failed", log=error_msg)
            raise e

router_agent = RouterAgent()

import os
from datetime import datetime
import uuid
import logging

try:
    from google.cloud import firestore
except ImportError:
    firestore = None

logger = logging.getLogger(__name__)

class FirestoreService:
    def __init__(self):
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "smart-event-operator")
        self.database = os.getenv("FIRESTORE_DATABASE", "(default)")
        self.db = None
        # Use an in-memory fallback for local development if GCP credentials aren't present
        self._in_memory_db = {
            "events": {},
            "workflows": {},
            "invitations": {},
            "logs": []
        }
        
        try:
            if firestore:
                self.db = firestore.Client(project=self.project_id, database=self.database)
        except Exception as e:
            logger.warning(f"Could not initialize Firestore client, using in-memory fallback. Error: {e}")

    def _get_time(self):
        return datetime.utcnow().isoformat() + "Z"

    def create_event(self, event_data: dict) -> str:
        event_id = str(uuid.uuid4())
        doc_data = {
            "id": event_id,
            **event_data,
            "status": "running",
            "created_at": self._get_time(),
            "updated_at": self._get_time()
        }
        
        if self.db:
            try:
                self.db.collection("events").document(event_id).set(doc_data)
            except Exception as e:
                logger.error(f"Firestore create error: {e}")
                self._in_memory_db["events"][event_id] = doc_data
        else:
            self._in_memory_db["events"][event_id] = doc_data
            
        return event_id
        
    def update_event(self, event_id: str, update_data: dict):
        update_data["updated_at"] = self._get_time()
        if self.db:
            try:
                self.db.collection("events").document(event_id).set(update_data, merge=True)
            except Exception as e:
                logger.error(f"Firestore update error: {e}")
                if event_id in self._in_memory_db["events"]:
                    self._in_memory_db["events"][event_id].update(update_data)
        else:
            if event_id in self._in_memory_db["events"]:
                self._in_memory_db["events"][event_id].update(update_data)

    def get_event(self, event_id: str):
        if self.db:
            try:
                doc = self.db.collection("events").document(event_id).get()
                if doc.exists:
                    return doc.to_dict()
            except Exception as e:
                logger.error(f"Firestore get error: {e}")
        return self._in_memory_db["events"].get(event_id)

    def log_workflow(self, event_id: str, agent_name: str, status: str, output: dict = None, log: str = None):
        workflow_id = f"{event_id}_{agent_name}"
        data = {
            "event_id": event_id,
            "agent_name": agent_name,
            "status": status,
            "updated_at": self._get_time()
        }
        if output:
            data["output"] = output
            
        if self.db:
            try:
                self.db.collection("workflows").document(workflow_id).set(data, merge=True)
                if log:
                    self.db.collection("logs").add({
                        "event_id": event_id,
                        "agent_name": agent_name,
                        "message": log,
                        "timestamp": self._get_time(),
                        "level": "info"
                    })
            except Exception as e:
                pass
        else:
            if workflow_id not in self._in_memory_db["workflows"]:
                self._in_memory_db["workflows"][workflow_id] = data
            else:
                self._in_memory_db["workflows"][workflow_id].update(data)

firestore_service = FirestoreService()

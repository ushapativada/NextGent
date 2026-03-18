import uuid
import os
from datetime import datetime, timezone
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

# Initialize MongoDB Client
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db: Database = client.get_database("reqarchitect")
sessions_collection: Collection = db.get_collection("sessions")

def create_session(user_id="default_user"):
    session_id = str(uuid.uuid4())

    session_data = {
        "session_id": session_id,
        "user_id": user_id,
        "project_name": f"Project {session_id[:8]}",
        "status": "questioning",
        "stakeholder_chat": [],
        "raw_problem": [],
        "primary_constraints": {},
        "refined_problem": None,
        "validator_chat": [],
        "developer_output": None,
        "has_feedback": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    
    sessions_collection.insert_one(session_data)
    return session_id

def get_session(session_id: str):
    # MongoDB query by session_id (excluding the internal _id field)
    session = sessions_collection.find_one({"session_id": session_id}, {"_id": 0})
    return session

def list_sessions(user_id="default_user"):
    # Return formatted list of all sessions for the UI
    cursor = sessions_collection.find({}, {"_id": 0}).sort("updated_at", -1)
    return list(cursor)

def update_session(session_id: str, **kwargs):
    kwargs["updated_at"] = datetime.now(timezone.utc)
    
    # Update the document matching session_id with the provided keyword arguments
    result = sessions_collection.find_one_and_update(
        {"session_id": session_id},
        {"$set": kwargs},
        return_document=True,
        projection={"_id": 0}
    )
    return result

def append_stakeholder_message(session_id: str, role: str, content: str):
    message = {"role": role, "content": content}
    
    result = sessions_collection.find_one_and_update(
        {"session_id": session_id},
        {
            "$push": {"stakeholder_chat": message},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        },
        return_document=True,
        projection={"_id": 0}
    )
    return result

def append_validator_message(session_id: str, role: str, content: str):
    message = {"role": role, "content": content}
    
    result = sessions_collection.find_one_and_update(
        {"session_id": session_id},
        {
            "$push": {"validator_chat": message},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        },
        return_document=True,
        projection={"_id": 0}
    )
    return result

def delete_session(session_id: str):
    result = sessions_collection.delete_one({"session_id": session_id})
    return result.deleted_count > 0

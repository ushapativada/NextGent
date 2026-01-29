import uuid
import json
import os
from datetime import datetime

SESSION_FILE = "sessions.json"
_SESSIONS = {}

# Custom encoder for datetime
class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)

def _load_from_disk():
    global _SESSIONS
    if os.path.exists(SESSION_FILE):
        try:
            with open(SESSION_FILE, "r") as f:
                data = json.load(f)
                # Convert iso strings back to datetime
                for sid, session in data.items():
                    if "created_at" in session:
                        session["created_at"] = datetime.fromisoformat(session["created_at"])
                    if "updated_at" in session:
                        session["updated_at"] = datetime.fromisoformat(session["updated_at"])
                _SESSIONS = data
        except Exception as e:
            print(f"Error loading sessions: {e}")
            _SESSIONS = {}

def _save_to_disk():
    try:
        with open(SESSION_FILE, "w") as f:
            json.dump(_SESSIONS, f, cls=DateTimeEncoder, indent=2)
    except Exception as e:
        print(f"Error saving sessions: {e}")

# Load on startup
_load_from_disk()

def create_session(user_id="default_user"):
    session_id = str(uuid.uuid4())

    _SESSIONS[session_id] = {
        "session_id": session_id,
        "user_id": user_id,
        "status": "questioning",
        "stakeholder_chat": [],
        "raw_problem": [],
        "primary_constraints": {},
        "refined_problem": None,
        "validator_chat": [],
        "developer_output": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    _save_to_disk()
    return session_id

def get_session(session_id: str):
    return _SESSIONS.get(session_id)

def list_sessions(user_id="default_user"):
    # Return formatted list of sessions for the UI
    user_sessions = [
        s for s in _SESSIONS.values() if s.get("user_id", "default_user") == user_id
    ]
    # Sort by updated_at desc
    user_sessions.sort(key=lambda x: x["updated_at"], reverse=True)
    return user_sessions

def update_session(session_id: str, **kwargs):
    session = _SESSIONS.get(session_id)
    if not session:
        return None

    for key, value in kwargs.items():
        session[key] = value

    session["updated_at"] = datetime.utcnow()
    _save_to_disk()
    return session

def append_stakeholder_message(session_id: str, role: str, content: str):
    session = _SESSIONS.get(session_id)
    if not session:
        return None

    session["stakeholder_chat"].append({"role": role, "content": content})
    session["updated_at"] = datetime.utcnow()
    _save_to_disk()
    return session

def append_validator_message(session_id: str, role: str, content: str):
    session = _SESSIONS.get(session_id)
    if not session:
        return None

    session["validator_chat"].append({"role": role, "content": content})
    session["updated_at"] = datetime.utcnow()
    _save_to_disk()
    return session

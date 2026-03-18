import pymongo

client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["reqarchitect"]
sessions = db["sessions"]

for s in sessions.find():
    print(f"Session: {s.get('session_id')} | Status: {s.get('status')} | Has Feedback: {s.get('has_feedback')}")
    chat = s.get("validator_chat", [])
    for msg in chat:
        if "Stakeholder Feedback" in msg.get("content", ""):
            print(f"  - {msg.get('content')}")
    print("---")

from fastapi import HTTPException

def require_status(session, allowed):
    if isinstance(allowed, str):
        allowed = [allowed]

    if session["status"] not in allowed:
        raise HTTPException(
            status_code=409,
            detail=f"Invalid state. Expected {allowed}, got '{session['status']}'"
        )

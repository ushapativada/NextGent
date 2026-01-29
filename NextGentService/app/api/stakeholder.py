from fastapi import APIRouter, HTTPException
from app.services.constraints import extract_primary_constraints
from app.state.session_store import (
    append_validator_message,
    create_session,
    get_session,
    append_stakeholder_message,
    update_session,
    list_sessions,
)
from app.state.guards import require_status
from app.agents.questioning import generate_next_question, clarity_reached

router = APIRouter(prefix="/stakeholder", tags=["Stakeholder"])

@router.get("/sessions")
def get_all_sessions():
    return list_sessions()

@router.get("/chat")
def get_chat_history(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")
    return {"chat": session.get("stakeholder_chat", [])}

@router.post("/start")
def start_session():
    session_id = create_session()
    session = get_session(session_id)

    first_question = generate_next_question([])

    append_stakeholder_message(session_id, "assistant", first_question)

    return {"session_id": session_id, "question": first_question}


@router.post("/answer")
def answer_question(session_id: str, answer: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")

    require_status(session, "questioning")

    # Store stakeholder answer
    append_stakeholder_message(session_id, "user", answer)

    chat = session["stakeholder_chat"]

    if clarity_reached(chat):
        update_session(
            session_id,
            status="refining",
            raw_problem=chat,
            primary_constraints=extract_primary_constraints(chat),
        )

        from app.services.refining_service import refine_session_problem

        refine_session_problem(session_id)

        return {
            "message": "Questioning complete. Problem refined and sent for validation."
        }

    next_question = generate_next_question(chat)
    append_stakeholder_message(session_id, "assistant", next_question)

    return {"question": next_question}


@router.get("/status")
def get_status(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")

    return {"session_id": session_id, "status": session["status"]}


@router.post("/message")
def stakeholder_message(session_id: str, message: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")

    # Allow feedback after questioning
    require_status(session, ["validating", "finalized"])

    # Store as stakeholder feedback
    append_validator_message(session_id, "user", message)

    # 🔥 Reopen validation ALWAYS
    session["status"] = "validating"

    return {"message": "Stakeholder feedback received. Validation reopened."}

from fastapi import APIRouter, HTTPException
from app.state.session_store import (
    get_session,
    append_validator_message,
    update_session,
)
from app.state.guards import require_status
from app.agents.validation import validation_agent_reply
from app.services.validation_service import apply_validation_feedback
from app.agents.validation import finalize_validation as ai_finalize

router = APIRouter(prefix="/validator", tags=["Validator"])


@router.post("/start")
def start_validation(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")

    require_status(session, ["validating", "finalized", "developing"])

    intro_message = (
        "Validation phase started. "
        "You may ask questions, suggest corrections, or add constraints."
    )

    # Only append intro if chat is empty to avoid duplicates on resume
    if not session.get("validator_chat"):
        append_validator_message(session_id, "assistant", intro_message)

    return {
        "message": intro_message,
        "refined_problem": session["refined_problem"],
        "chat_history": session.get("validator_chat", [])
    }


@router.post("/chat")
def validator_chat(session_id: str, message: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")

    require_status(session, ["validating", "finalized", "developing"])

    append_validator_message(session_id, "user", message)

    # 🔥 any validator input reopens validation
    update_session(session_id, status="validating")

    reply = validation_agent_reply(
        refined_problem=session["refined_problem"],
        validator_chat=session["validator_chat"],
    )

    append_validator_message(session_id, "assistant", reply)

    return {"reply": reply, "status": "validating"}


@router.post("/finalize")
def finalize_validation_phase(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")

    # Allow re-finalization even if already finalized
    require_status(session, ["validating", "developing", "finalized"])

    try:
        updated_refined_problem, updated_constraints = apply_validation_feedback(
            refined_problem=session["refined_problem"],
            validator_chat=session["validator_chat"],
            primary_constraints=session["primary_constraints"],
        )

        updated_constraints = updated_refined_problem.get(
            "constraints", session["primary_constraints"]
        )

        print("SESSION CONSTRAINTS AFTER FINALIZE:", session["primary_constraints"])

        validation_result = ai_finalize(updated_refined_problem)

        update_session(
            session_id,
            refined_problem=updated_refined_problem,
            primary_constraints=updated_constraints,  # ✅ USER TRUTH
            validated_problem=validation_result,  # ✅ AI FEASIBILITY OPINION
            status="finalized",
        )

        return {
            "status": "finalized",
            "validation_result": validation_result,
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"Finalization failed: {str(e)}")

    return {
        "status": "finalized",
        "validation_result": validation_result,
    }

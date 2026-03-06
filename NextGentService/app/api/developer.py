from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.state.session_store import get_session, update_session
from app.state.guards import require_status
from app.agents.developer import generate_technical_specs
from app.utils.pdf_generator import generate_pdf
import os

router = APIRouter(prefix="/developer", tags=["Developer"])

@router.post("/generate")
def generate_specs(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")
    
    # We allow generating specs irrespective of validator state
    require_status(session, ["refining", "validating", "finalized", "developing", "visualizing", "completed"])

    refined_problem = session.get("refined_problem")
    if not refined_problem:
        raise HTTPException(400, "No refined requirements found. Complete validation first.")

    # Call AI Agent
    specs_markdown = generate_technical_specs(refined_problem)

    # Save to session
    update_session(session_id, developer_output=specs_markdown, status="developing")

    return {"specs": specs_markdown}

@router.get("/specs")
def get_specs(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")
    
    specs = session.get("developer_output")
    # Return null instead of 404/400 to avoid console errors
    return {"specs": specs}

@router.get("/download")
def download_specs(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")

    specs = session.get("developer_output")
    if not specs:
        raise HTTPException(400, "No specs generated yet.")

    filename = f"specs_{session_id}.pdf"
    file_path = generate_pdf(str(specs), filename)

    return FileResponse(file_path, media_type="application/pdf", filename="Technical_Specs.pdf")

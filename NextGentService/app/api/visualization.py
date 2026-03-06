from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.state.session_store import get_session, update_session
from app.state.guards import require_status
from app.agents.visualization import generate_uml_diagrams
import re

router = APIRouter(prefix="/visualization", tags=["Visualization"])

def extract_plantuml_blocks(text: str):
    """Extract all PlantUML code blocks from the LLM output."""
    # The most robust way is to just look for @startuml and @enduml pairs
    # ignoring the markdown backticks which the LLM might format inconsistently
    pattern = r'(@startuml.*?@enduml)'
    matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
    
    # Clean up whitespace
    return [match.strip() for match in matches]

@router.post("/generate")
def generate_diagrams(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")
    
    # Require developers specs to be generated first (or at least validator is done)
    require_status(session, ["refining", "validating", "finalized", "developing", "visualizing", "completed"])

    refined_problem = session.get("refined_problem")
    specs_markdown = session.get("developer_output")
    
    if not refined_problem or not specs_markdown:
        raise HTTPException(400, "Technical specifications not found. Complete Developer phase first.")

    # Call AI Agent
    raw_uml_output = generate_uml_diagrams(refined_problem, specs_markdown)
    
    # Extract blocks
    uml_blocks = extract_plantuml_blocks(raw_uml_output)
    
    # Fallback to empty list if parsing fails but keep raw output just in case
    diagrams = {
        "useCase": uml_blocks[0] if len(uml_blocks) > 0 else None,
        "class": uml_blocks[1] if len(uml_blocks) > 1 else None,
        "sequence": uml_blocks[2] if len(uml_blocks) > 2 else None,
        "activity": uml_blocks[3] if len(uml_blocks) > 3 else None,
        "raw": raw_uml_output
    }

    # Save to session
    update_session(session_id, visualization_output=diagrams, status="visualizing")

    return {"diagrams": diagrams}

@router.get("/diagrams")
def get_diagrams(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")
    
    diagrams = session.get("visualization_output")
    return {"diagrams": diagrams}

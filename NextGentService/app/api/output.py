from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.state.session_store import get_session, update_session
from app.services.output_builder import (
    build_stakeholder_output,
    build_developer_output,
)
from app.utils.pdf_generator import generate_pdf
from app.utils.plantuml_generator import download_plantuml_image
import json

router = APIRouter(prefix="/output", tags=["Output"])


@router.get("/stakeholder/{session_id}")
def stakeholder_output(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")

    # Relaxed check: if we have refined problem, we can show something
    if not session.get("refined_problem"):
        raise HTTPException(400, "No output available yet")

    return build_stakeholder_output(session)


@router.get("/developer/{session_id}")
def developer_output(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")

    if not session.get("refined_problem"):
        raise HTTPException(400, "No output available yet")

    return build_developer_output(session)


@router.post("/finish/{session_id}")
def finish_project(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")
    
    # Update status to finalized
    update_session(session_id, status="finalized")
    return {"message": "Project finalized"}


@router.post("/exit/{session_id}")
def exit_project(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")
    
    # Update status to in_progress
    update_session(session_id, status="in_progress")
    return {"message": "Project exited (in progress)"}


@router.post("/pause/{session_id}")
def pause_project(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")
    
    # Update status to developing
    update_session(session_id, status="developing")
    return {"message": "Project paused (developing)"}


@router.get("/download/{output_type}/{session_id}")
def download_output_pdf(output_type: str, session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Invalid session")

    content = ""
    filename = f"{output_type}_output_{session_id}.pdf"

    if output_type == "stakeholder":
        data = build_stakeholder_output(session)
        content += "# Stakeholder Requirements Document\n\n"
        content += f"**Problem Summary**:\n{data.get('problem_summary', 'N/A')}\n\n"
        
        content += "**Primary Constraints**:\n"
        for k, v in data.get('constraints', {}).items():
             content += f"- {k}: {v}\n"
        content += "\n"
        
        val = data.get('validation', {})
        if val:
             content += "**Validation Status**:\n"
             content += f"Ambiguities Found: {len(val.get('ambiguities', []))}\n"
             content += f"Missing Info: {len(val.get('missing_info', []))}\n"

    elif output_type == "developer":
        data = build_developer_output(session)
        content += "# Developer Handover Document\n\n"
        
        prob = data.get('final_problem_definition', {})
        prob_text = prob.get('problem_summary') or prob.get('problem_statement', 'N/A')
        content += f"**Problem Statement**:\n{prob_text}\n\n"
        
        content += "**Technical Constraints**:\n"
        for k, v in data.get('constraints', {}).items():
             content += f"- {k}: {v}\n"
        content += "\n"

        content += "**Assumptions**:\n"
        for a in data.get('assumptions', []):
             content += f"- {a}\n"
        content += "\n"

        content += "**Key Risks**:\n"
        for r in data.get('risks', []):
             content += f"- {r}\n"
             
        specs = data.get('developer_specs')
        if specs:
             content += f"\n## Developer Specifications\n\n{specs}\n"
             
        diagrams = data.get('diagrams')
        if diagrams and isinstance(diagrams, dict):
             content += "\n## System Visualizations (PlantUML)\n\n"
             for diagram_name, uml_code in diagrams.items():
                  if diagram_name != "raw" and uml_code:
                       # Capitalize the diagram name
                       title = diagram_name.replace("UseCase", "Use Case").capitalize()
                       if title == "Class": title = "Class Diagram"
                       elif title == "Sequence": title = "Sequence Diagram"
                       elif title == "Activity": title = "Activity Diagram"
                       elif title == "Usecase": title = "Use Case Diagram"
                       
                       # Make sure uml_code is actually a string to avoid dictionary TypeError
                       if isinstance(uml_code, str):
                           # Generate Image Link format: ![title](/path/to/img.png)
                           img_path = download_plantuml_image(uml_code, f"{session_id}_{diagram_name}")
                           if img_path:
                               content += f"### {title}\n\n![{title}]({img_path})\n\n"
                           else:
                               content += f"### {title}\n\n```plantuml\n{uml_code}\n```\n\n"
                       
    elif output_type == "srs":
        data = build_developer_output(session)
        content += "# Software Requirements Specification (SRS)\n\n"
        
        content += "## 1. Introduction\n"
        prob = data.get('final_problem_definition', {})
        prob_text = prob.get('problem_summary') or prob.get('problem_statement', 'N/A')
        content += f"**1.1 Purpose**\nThe purpose of this document is to define the requirements and technical specifications for the following system:\n\n{prob_text}\n\n"
        
        content += "## 2. Overall Description\n"
        content += "**2.1 Constraints**\n"
        for k, v in data.get('constraints', {}).items():
             content += f"- **{k}**: {v}\n"
        content += "\n"

        content += "**2.2 Assumptions & Dependencies**\n"
        for a in data.get('assumptions', []):
             content += f"- {a}\n"
        content += "\n"

        content += "**2.3 Key Risks**\n"
        for r in data.get('risks', []):
             content += f"- {r}\n"
        content += "\n"
             
        content += "## 3. Specific Requirements\n"
        specs = data.get('developer_specs')
        if specs:
             # The specs usually contain "# Functional Requirements" already, so we just append them.
             content += f"{specs}\n"
             
        content += "\n## 4. System Models (UML Diagrams)\n\n"
        diagrams = data.get('diagrams')
        if diagrams and isinstance(diagrams, dict):
             for diagram_name, uml_code in diagrams.items():
                  if diagram_name != "raw" and uml_code:
                       title = diagram_name.replace("UseCase", "Use Case").capitalize()
                       if title == "Class": title = "Class Diagram"
                       elif title == "Sequence": title = "Sequence Diagram"
                       elif title == "Activity": title = "Activity Diagram"
                       elif title == "Usecase": title = "Use Case Diagram"
                       
                       if isinstance(uml_code, str):
                           img_path = download_plantuml_image(uml_code, f"{session_id}_{diagram_name}_srs")
                           if img_path:
                               content += f"### 4.{list(diagrams.keys()).index(diagram_name) + 1} {title}\n\n![{title}]({img_path})\n\n"
                           else:
                               content += f"### 4.{list(diagrams.keys()).index(diagram_name) + 1} {title}\n\n```plantuml\n{uml_code}\n```\n\n"

    else:
        raise HTTPException(400, "Invalid output type")

    # Generate PDF
    file_path = generate_pdf(content, filename)
    return FileResponse(file_path, media_type="application/pdf", filename=filename)

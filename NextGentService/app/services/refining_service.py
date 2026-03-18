import json
from app.crew.refining_crew import run_refining_crew
from app.state.session_store import get_session, update_session
from app.schemas.refined_problem import RefinedProblem
from app.services.constraints import extract_primary_constraints


def refine_session_problem(session_id: str):
    session = get_session(session_id)

    # ❌ BUG: refining never runs because status is already "refining"
    if session["status"] != "refining":
        return

    crew_output = run_refining_crew(raw_problem_chat=session["raw_problem"])

    # CrewOutput.json can be: BaseModel | dict | str
    refined_json = crew_output.json

    if isinstance(refined_json, RefinedProblem):
        refined_problem = refined_json.model_dump()

    elif isinstance(refined_json, dict):
        refined_problem = refined_json

    elif isinstance(refined_json, str):
        try:
            refined_problem = json.loads(refined_json)
        except json.JSONDecodeError:
            raise ValueError("Refining agent returned invalid JSON")

    else:
        raise ValueError("Unexpected refining output type")

    primary_constraints = extract_primary_constraints(session["raw_problem"])

    project_name = refined_problem.get("project_name", f"Project {session_id[:8]}")

    # ✅ SINGLE source of truth
    update_session(
        session_id,
        project_name=project_name,
        refined_problem=refined_problem,
        primary_constraints=primary_constraints,
        status="validating",
    )

    return refined_problem

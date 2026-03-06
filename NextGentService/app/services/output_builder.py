def build_stakeholder_output(session: dict) -> dict:
    constraints = session.get("primary_constraints", {})
    if isinstance(constraints, list):
        constraints = {f"rule_{i+1}": val for i, val in enumerate(constraints)}
    elif not isinstance(constraints, dict):
        constraints = {}

    return {
        "problem_summary": session.get("refined_problem", {}).get("problem_summary"),
        "constraints": constraints,  # 🔥 SOURCE OF TRUTH (GUARANTEED DICT)
        "validation": session.get("validated_problem", {}),
    }


def build_developer_output(session: dict) -> dict:
    constraints = session.get("primary_constraints", {})
    if isinstance(constraints, list):
        constraints = {f"rule_{i+1}": val for i, val in enumerate(constraints)}
    elif not isinstance(constraints, dict):
        constraints = {}

    refined = session.get("refined_problem", {})
    validated = session.get("validated_problem", {})

    return {
        "final_problem_definition": refined,
        "constraints": constraints,  # 🔥 SOURCE OF TRUTH (GUARANTEED DICT)
        "assumptions": refined.get("assumptions", []),
        "risks": validated.get("key_risks", []),
        "developer_specs": session.get("developer_output"),
        "diagrams": session.get("visualization_output"),
    }

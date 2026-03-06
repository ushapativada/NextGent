from app.services.constraints import merge_primary_constraints
from app.agents.validation import detect_required_changes


def apply_validation_feedback(
    refined_problem: dict,
    validator_chat: list[dict],
    primary_constraints: dict,
) -> tuple[dict, dict]:

    # Defensive checks against unexpected types
    if not isinstance(refined_problem, dict):
        refined_problem = {"problem_statement": str(refined_problem)} if refined_problem else {}
        
    if not isinstance(primary_constraints, dict):
        primary_constraints = {}
        
    analysis = detect_required_changes(
        refined_problem,
        validator_chat,
        primary_constraints,
    )
    print("APPLY VALIDATION FEEDBACK CALLED")

    # Only block if truly impossible tech (not constraint updates)
    feasible_flag = analysis.get("feasible", True)
    refined_problem["feasible"] = feasible_flag
    refined_problem["feasibility_reason"] = analysis.get("reason")

    if analysis.get("changes_required"):
        updated_constraints = merge_primary_constraints(
            primary_constraints, analysis.get("corrections", {})
        )

        # DEBUG LOGS
        print("OLD CONSTRAINTS:", primary_constraints)
        print("NEW CORRECTIONS:", analysis.get("corrections"))
        print("UPDATED CONSTRAINTS SAVED:", updated_constraints)

        # FORCE UPDATE refined problem
        refined_problem.update(updated_constraints)  # <--- ADD THIS
        refined_problem["constraints"] = updated_constraints
        primary_constraints = updated_constraints
        return refined_problem, updated_constraints

    print("VALIDATOR ANALYSIS:", analysis)

    return refined_problem, primary_constraints

from app.config.llm import llm
from app.utils.json_safe import extract_json


def extract_primary_constraints(stakeholder_chat: list[dict]) -> dict:
    prompt = f"""
You are extracting HARD, NON-NEGOTIABLE constraints.

From the stakeholder conversation, extract:
- budget (number, INR)
- location (city / region)
- business_type (short phrase)

Stakeholder Conversation:
{stakeholder_chat}

Respond ONLY in JSON:

{{
  "budget": 0,
  "location": "string",
  "business_type": "string"
}}
"""

    response = llm.call(messages=[{"role": "user", "content": prompt}])
    return extract_json(response)


def merge_primary_constraints(primary, corrections: dict) -> dict:
    # If primary is a list, convert it to a dictionary mapping 
    # to prevent TypeError when using .items() or .copy()
    if isinstance(primary, list):
        updated = {f"rule_{i}": val for i, val in enumerate(primary)}
    elif isinstance(primary, dict):
        updated = primary.copy()
    else:
        updated = {}

    if isinstance(corrections, dict):
        for k, v in corrections.items():
            updated[k] = v  # ✅ ALWAYS overwrite

    return updated

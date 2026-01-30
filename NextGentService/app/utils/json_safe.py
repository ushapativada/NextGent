import json
import re


def extract_json(text: str) -> dict:
    """
    Safely extract JSON object from LLM output.
    """
    if not text or not text.strip():
        raise ValueError("Empty LLM response")

    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to extract JSON block
    # Try to extract JSON block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # If we get here, no JSON was found or parsed
    raise ValueError(f"No valid JSON found in LLM output: {text[:100]}...")

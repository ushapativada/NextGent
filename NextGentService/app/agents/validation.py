from app.config.llm import llm
from app.utils.json_safe import extract_json
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from litellm.exceptions import RateLimitError

@retry(
    retry=retry_if_exception_type(RateLimitError),
    wait=wait_exponential(multiplier=2, min=4, max=20),
    stop=stop_after_attempt(5)
)
def call_llm_with_retry(messages):
    return llm.call(messages=messages)

def validation_agent_reply(refined_problem: dict, validator_chat: list[dict]) -> str:
    """
    AI validation response based on refined problem + validator interaction.
    """

    # --- CIRCUIT BREAKER: STOP REPETITIVE CONFIRMATION LOOPS ---
    # If the user just said "Yes" to a confirmation question, force exit.
    # This prevents the LLM from getting stuck in "Verification Loops".
    if validator_chat and len(validator_chat) >= 2:
        last_user_msg = validator_chat[-1]
        last_bot_msg = validator_chat[-2]
        
        if last_user_msg["role"] == "user" and last_bot_msg["role"] == "assistant":
            user_text = last_user_msg["content"].strip().lower().replace(".", "").replace("!", "")
            bot_text = last_bot_msg["content"].strip().lower()
            
            # Common short agreements
            agreements = ["yes", "yeah", "yep", "sure", "correct", "confirmed", "exactly", "right", "ok", "okay"]
            
            # If user message is just an agreement (or very short starting with agreement)
            is_agreement = user_text in agreements or (len(user_text) < 50 and any(user_text.startswith(w) for w in agreements))
            
            # If bot was asking for confirmation/summary
            is_question = "?" in bot_text or "confirm" in bot_text or "right" in bot_text or "so," in bot_text
            
            if is_agreement and is_question:
                return "Great! Please click 'Finalize Specs' to proceed."
    # -----------------------------------------------------------

    prompt = f"""
You are a helpful and clear Requirements Consultant.
You are talking to a non-technical stakeholder who wants to build software.

Your Goal:
- Verify that the requirements are clear and complete.
- Ensure the user is happy with what we will build.

STRICT RULES:
1. Ask ONLY ONE simple question at a time. Do not ask multiple questions.
2. Use plain English. NO technical jargon (e.g., avoid "RTO/RPO", "RBAC", "latency", "schema").
3. Keep your response SHORT (max 2-3 sentences).
4. Do NOT lecture the user on best practices. Just ask your question gently.

5. CRITICAL: If the user explicitly agrees ("Yes", "Confirm") to your previous summary or questions, DO NOT ASK AGAIN.
6. If the user says "Yes" to your confirmation, or if they seem satisfied, or if conversation is getting repetitive:
   - Reply ONLY: "Great! Please click 'Finalize Specs' to proceed."

Context:
Refined Problem: {refined_problem}

Conversation History:
{validator_chat}

Respond to the user's latest input naturally and simply. If they just said "Yes", end the conversation.
"""

    response = call_llm_with_retry(messages=[{"role": "user", "content": prompt}])

    return response.strip()


def finalize_validation(refined_problem: dict) -> dict:
    # Always re-evaluate feasibility, do not trust previous "feasible: False" flags.
    # The validation phase is specifically for fixing feasibility issues.
    
    prompt = f"""
        You are a Senior System Architect.

        Evaluate feasibility logically based on:
        - budget realism
        - technical complexity
        - location constraints
        - scope vs budget
        - regulatory feasibility

        CRITICAL INSTRUCTION:
        - Default to "feasible": true unless there is a MATHEMATICALLY IMPOSSIBLE constraint (e.g. building a Mars rover for $50).
        - If the budget is tight but possible, mark it as FEASIBLE and list usage of existing APIs/tools as a risk mitigation.
        - Do not be overly pessimistic. If it can be built, it is feasible.

        RULES
        - Do NOT modify constraints.
        - Do NOT suggest updates.
        - Only judge feasibility.

        Refined Problem:
        {refined_problem}

        Respond ONLY JSON:
        {{
        "feasible": true | false,
        "key_risks": [],
        "final_notes": "..."
        }}
    """

    response = call_llm_with_retry(messages=[{"role": "user", "content": prompt}])
    return extract_json(response)


def detect_required_changes(
    refined_problem: dict,
    validator_chat: list[dict],
    primary_constraints: dict,
) -> dict:
    prompt = f"""
        You are a senior system reviewer.

        PRIMARY CONSTRAINTS (IMMUTABLE):
        {primary_constraints}

        TASK:
        - Read the validator conversation
        - Extract ONLY concrete constraint updates explicitly stated by the user
        - Ignore suggestions, questions, or hypotheticals
        - If the user says "budget is 20L", extract budget=20L
        - If no concrete updates are present, return empty corrections

        RULES:
        - ALWAYS overwrite constraints if user explicitly updates them
        - User validation overrides previous constraints
        - If user input contradicts existing constraints, treat the new value as an UPDATE
        - Do NOT mark feasible=false for constraint updates

        Refined Problem:
        {refined_problem}

        Validator Conversation:
        {validator_chat}

        Respond ONLY in JSON:

        {{
        "changes_required": true | false,
        "feasible": true | false,
        "reason": "...",
        "corrections": {{
            "<constraint_name>": "<new_value>"
        }}
        }}
        """

    response_text = call_llm_with_retry(messages=[{"role": "user", "content": prompt}])

    return extract_json(response_text)

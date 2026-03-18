from crewai import Agent, Task, Crew, Process
from app.state.session_store import get_session
from app.config.llm import llm

def create_developer_agent():
    return Agent(
        role='Comprehensive Requirements Architect',
        goal='Generate a thorough and detailed list of Functional and Non-Functional requirements derived from the project scope and context.',
        backstory="""You are an expert technical business analyst. Your job is to thoroughly expand upon the provided project scope, 
        extracting granular functional requirements and identifying appropriate non-functional requirements (Performance, Security, Scalability, etc.) 
        that perfectly fit the specific project context. You ensure the requirements are comprehensive, breaking down high-level scope into detailed system behaviors.""",
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

def generate_technical_specs(refined_problem: dict, feedback_messages: list | None = None):
    agent = create_developer_agent()

    import json
    # Create a concise summary of the problem for the agent
    problem_desc = refined_problem.get("problem_summary") or refined_problem.get("problem_statement", "No problem statement found.")
    
    # Dump the exact JSON specification object into the prompt
    exact_json_specs = json.dumps(refined_problem, indent=2)

    task_description = f"""
    Analyze the following refined project requirements:
    
    **Problem Statement:**
    {problem_desc}
    
    **CRITICAL RAW CONTEXT DATA:**
    {exact_json_specs}
    
    **Problem Statement:**
    {problem_desc}

    **Your Task:**
    You must generate exactly two sections:

    # Functional Requirements
    (List them here)
    
    # Non-Functional Requirements
    (List them here)

    """
    if feedback_messages:
        task_description += f"""
    **STAKEHOLDER DIRECTIVES / FEEDBACK (CRITICAL - YOU MUST APPLY THESE REVISIONS):**
    {chr(10).join(['- ' + fb for fb in feedback_messages])}
    
    You MUST directly update your generated specifications to reflect the stakeholder feedback provided above. Add new requirements or modify existing ones to completely satisfy these constraints.
    """

    task_description += """
    IMPORTANT INSTRUCTIONS: 
    1. You MUST use exactly these headers with the '#' prefix.  
    2. Your Functional Requirements should expand on the items explicitly listed under the "in_scope" array and the project context inside CRITICAL RAW CONTEXT DATA.
    3. Expand each item into multiple granular functional requirements (e.g., user interactions, data validation, system processing, output generation). 
    4. Provide specific Non-Functional Requirements covering categories like Performance (e.g., response time), Security, Usability, and Reliability, tailored strictly to this project's needs.
    5. Be comprehensive. Produce a substantial, professional-grade list of requirements (e.g., 10-20 functional, 5-10 non-functional depending on scope complexity) to fully capture the system's behavior. Do not artificially limit the output length.
    """

    task = Task(
        description=task_description,
        agent=agent,
        expected_output="A Markdown formatted technical specification document."
    )

    crew = Crew(
        agents=[agent],
        tasks=[task],
        verbose=True,
        process=Process.sequential
    )

    result = crew.kickoff()
    return str(result)

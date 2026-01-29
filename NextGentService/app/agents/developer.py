from crewai import Agent, Task, Crew, Process
from app.state.session_store import get_session
from app.config.llm import llm

def create_developer_agent():
    return Agent(
        role='Senior System Architect',
        goal='Translate refined business requirements into detailed technical specifications.',
        backstory="""You are an expert software architect with 20 years of experience. 
        Your job is to take business requirements and turn them into actionable technical documents 
        including Functional Requirements, Non-Functional Requirements, and a recommended Tech Stack.""",
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

def generate_technical_specs(refined_problem: dict):
    agent = create_developer_agent()

    # Create a concise summary of the problem for the agent
    problem_desc = refined_problem.get("problem_statement", "No problem statement found.")
    constraints = refined_problem.get("constraints", {})
    key_features = refined_problem.get("key_features", [])

    task_description = f"""
    Analyze the following refined project requirements:
    
    **Problem Statement:**
    {problem_desc}

    **Key Constraints:**
    {constraints}

    **Key Features:**
    {key_features}

    **Your Task:**
    3. **Recommended Tech Stack**: REMOVED. Do not include this. Focus strictly on requirements.
    
    Actually, just generate:
    
    # Functional Requirements
    (List them here)
    
    # Non-Functional Requirements
    (List them here)

    IMPORTANT: You MUST use exactly these headers with the '#' prefix. Do not add introductions or other text before the headers.
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

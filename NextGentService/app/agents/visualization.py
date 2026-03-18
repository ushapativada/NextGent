from crewai import Agent, Task, Crew, Process
from app.config.llm import llm

def create_visualization_agent():
    return Agent(
        role='Strict UML Extractor',
        goal='Generate accurate UML diagrams based ONLY on the provided JSON explicitly.',
        backstory="""You are an extremely literal parser. You do NOT invent software architectures.
        You do not add user accounts, logins, databases, APIs, or security.
        You only draw UML diagrams for the exact text strings provided to you in the JSON prompt, nothing else.""",
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

def generate_uml_diagrams(refined_problem: dict, specs_markdown: str):
    agent = create_visualization_agent()

    import json

    problem_desc = refined_problem.get("problem_summary") or refined_problem.get("problem_statement", "No problem statement found.")
    
    # Dump the exact JSON specification object into the prompt
    exact_json_specs = json.dumps(refined_problem, indent=2)

    task_description = f"""
    Analyze the following project requirements and technical specifications:
    
    **Problem Statement:**
    {problem_desc}

    **CRITICAL RAW CONTEXT DATA:**
    {exact_json_specs}

    **Technical Specifications:**
    {specs_markdown}

    **Your Task:**
    Based on the provided information, generate four UML diagrams using PlantUML syntax.
    CRITICAL INSTRUCTION: Analyze the text under "Technical Specifications" and the "In Scope" boundary tightly. 
    You MUST NOT generate generic or placeholder UML diagrams. 

    IMPORTANT INSTRUCTIONS:
    1. Your diagrams MUST be extremely specific mapping ONLY to the items explicitly listed under the "in_scope" array inside CRITICAL RAW CONTEXT DATA.
    2. You are FORBIDDEN from generating flows for User Accounts, Login, Passwords, Search, APIs, Settings, or Backups unless the JSON strictly demands it.
    If the "in_scope" array only has 3 items, your diagrams should be extremely small and only cover those 3 items.

    EXAMPLE OF BAD OUTPUT (Generic boilerplate):
    - Activity: Start -> User Logs In -> System Validates -> User Views Dashboard -> Stop
    - Use Case: User -> (Login), User -> (Logout)

    EXAMPLE OF GOOD OUTPUT (Assuming ATS Resume Generator Scope):
    - Activity: Start -> User Selects 'Student' Role -> System Queries Local ATS Templates -> System Renders Preview -> User Exports PDF -> Stop
    - Use Case: User -> (Upload Raw Resume), System -> (Parse Keywords), System -> (Calculate ATS Score)

    I REPEAT: Be hyper-specific. Tailor every node and arrow to the precise business rules of THIS project.

    You must output EXACTLY the PlantUML code blocks and nothing else.
    Wrap each diagram in a standard markdown PlantUML code block like this:
    ```plantuml
    @startuml
    ...
    @enduml
    ```
    
    Generate exactly these four diagrams in this order:
    1. A Use Case Diagram describing the actors and their interactions with the system.
    2. A Class Diagram showing the main entities, their attributes, methods, and relationships.
    3. A Sequence Diagram showing the primary user flow or core functionality.
    4. An Activity Diagram illustrating the main business process or workflow. (CRITICAL: Use modern syntax with `start` and `stop`. If adding notes, use `note right: text` immediately after an action. DO NOT use `note right of` or `note left of` in activity diagrams, and NEVER place a note after the `stop` keyword. This causes syntax errors).
    """

    task = Task(
        description=task_description,
        agent=agent,
        expected_output="Four PlantUML code blocks containing the UML diagrams."
    )

    crew = Crew(
        agents=[agent],
        tasks=[task],
        verbose=True,
        process=Process.sequential
    )

    result = crew.kickoff()
    return str(result)

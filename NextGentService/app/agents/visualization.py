from crewai import Agent, Task, Crew, Process
from app.config.llm import llm

def create_visualization_agent():
    return Agent(
        role='UML Architect',
        goal='Generate accurate and comprehensive UML diagrams based on technical specifications and requirements.',
        backstory="""You are an expert software architect specializing in visualizing system designs.
        You take business requirements and technical specifications and translate them into precise PlantUML diagrams.
        Your diagrams are clean, logically structured, and easy to understand.""",
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

def generate_uml_diagrams(refined_problem: dict, specs_markdown: str):
    agent = create_visualization_agent()

    problem_desc = refined_problem.get("problem_statement", "No problem statement found.")
    constraints = refined_problem.get("constraints", {})
    key_features = refined_problem.get("key_features", [])

    task_description = f"""
    Analyze the following project requirements and technical specifications:
    
    **Problem Statement:**
    {problem_desc}

    **Key Constraints:**
    {constraints}

    **Key Features:**
    {key_features}
    
    **Technical Specifications:**
    {specs_markdown}

    **Your Task:**
    Based on the provided information, generate four UML diagrams using PlantUML syntax.
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
    4. An Activity Diagram illustrating the main business process or workflow. (CRITICAL: Use modern syntax with `start` and `stop`. If adding notes, use `note right: text` immediately after an action. DO NOT use `note right of` or `note left of` in activity diagrams, as it causes syntax errors).
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

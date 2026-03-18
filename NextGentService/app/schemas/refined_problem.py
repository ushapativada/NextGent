from pydantic import BaseModel
from typing import List


class RefinedProblem(BaseModel):
    project_name: str
    problem_summary: str
    in_scope: List[str]
    out_of_scope: List[str]
    assumptions: List[str]
    constraints: List[str]
    open_points: List[str]

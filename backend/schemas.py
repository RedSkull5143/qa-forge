from pydantic import BaseModel
from typing import List

class TestCase(BaseModel):
    id : str
    title : str
    type : str  
    summary : str
    preconditions : str
    steps : List[str]
    expected_results : List[str]
    priority : str
    
class TestcaseGenerationResponse(BaseModel):
    test_cases: List[TestCase]
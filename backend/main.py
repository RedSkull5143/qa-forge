from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from jira_service import get_jira_ticket, create_jira_subtask
from groq_service import generate_test_cases

# Initialize the FastAPI application
app = FastAPI(
    title="QA Forge Enterprise API",
    description="Backend engine for Jira generation integration",
    version="1.0.0"
)

# Setup CORS (Cross-Origin Resource Sharing)
# This allows our React frontend to securely talk to our Python backend
# without browser security blocking it.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, this would be our actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a simple "Health Check" endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "qa-forge-api"}

@app.get("/api/jira/{ticket_id}")
async def get_jira_ticket_endpoint(ticket_id: str):
    return get_jira_ticket(ticket_id)

@app.post("/api/generate/{ticket_id}")
async def generate_tests_from_jira(ticket_id: str):
    # 1. Fetch the data from Jira using the function
    jira_data = get_jira_ticket(ticket_id)
    
    # Optional safety check!
    if "error" in jira_data:
        return jira_data 

    # 2. Pass that raw Jira data directly into the AI Brain
    ai_test_cases = generate_test_cases(jira_data)
    
    # 3. Return the AI's JSON back to the browser!
    return ai_test_cases

@app.post("/api/push/{ticket_id}")
async def push_tests_to_jira(ticket_id: str, test_cases: list):
    results = []
    for tc in test_cases:
        result = create_jira_subtask(ticket_id, tc)
        results.append(result)
    return {"pushed": len(results), "results": results}


# This block allows us to run the server directly if needed
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

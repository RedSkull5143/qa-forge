from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from jira_service import get_jira_ticket

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


# This block allows us to run the server directly if needed
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

import requests
import os
from dotenv import load_dotenv
from requests.auth import HTTPBasicAuth

load_dotenv()

# Read the variables securely
JIRA_BASE_URL=os.getenv("JIRA_BASE_URL")
JIRA_EMAIL=os.getenv("JIRA_EMAIL")
JIRA_API_TOKEN=os.getenv("JIRA_API_TOKEN")

def get_jira_ticket(ticket_id: str) -> dict:
    """
    Fetch a Jira ticket by its ID.

    Args: 
        ticket_id (str): The ID of the ticket to fetch.

    Returns:
        dict: The ticket data.
    """
    
    url = f"{JIRA_BASE_URL}/rest/api/3/issue/{ticket_id}"
    auth = HTTPBasicAuth(JIRA_EMAIL, JIRA_API_TOKEN)
    headers = {
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, auth=auth)
        if response.status_code==200:
            return response.json()
        else:
            return {"error": f"Jira returned status {response.status_code}"}
    
    except requests.exceptions.RequestException as e:
        print(f"Network error: {e}")
        return {"error": "Could not connect to Jira. Check your URL."}

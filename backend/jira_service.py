import requests
from requests.auth import HTTPBasicAuth

JIRA_BASE_URL=""
JIRA_EMAIL=""
JIRA_API_TOKEN=""

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
    response = requests.get(url, headers=headers, auth=auth)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to fetch ticket"}
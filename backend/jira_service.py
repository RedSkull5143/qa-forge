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

def create_jira_subtask(parent_ticket_id: str, test_case: dict) -> dict:
    """
    Create a Sub-task under a parent Jira ticket.

    Uses the Jira REST API v3 to create a new Sub-task issue linked
    to the specified parent ticket. The test case data is formatted
    into the Sub-task's summary and description fields.

    Args:
        parent_ticket_id (str): The parent Jira ticket key (e.g. 'AUTH-402').
        test_case (dict): A dictionary containing test case fields:
            - title (str): Name of the test case.
            - type (str): Category — Positive, Negative, or Edge.
            - preconditions (str): Setup required before execution.
            - expected_results (List[str]): Expected outcomes after execution.

    Returns:
        dict: The created issue JSON on success, or an error dict on failure.
    """
    url = f"{JIRA_BASE_URL}/rest/api/3/issue"
    auth = HTTPBasicAuth(JIRA_EMAIL, JIRA_API_TOKEN)
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    # Build the Atlassian-compliant payload for Sub-task creation.
    # Project key is extracted from the parent ticket (e.g. 'AUTH' from 'AUTH-402').
    payload = {
        "fields": {
            "project": {"key": parent_ticket_id.split("-")[0]},
            "parent": {"key": parent_ticket_id},
            "summary": f"[QA] {test_case['title']}",
            "description": (
                f"Type: {test_case['type']}\n\n"
                f"Preconditions: {test_case['preconditions']}\n\n"
                f"Expected: {', '.join(test_case['expected_results'])}"
            ),
            "issuetype": {"name": "Sub-task"}
        }
    }

    try:
        response = requests.post(url, headers=headers, auth=auth, json=payload)
        if response.status_code == 201:
            return response.json()
        else:
            return {"error": f"Failed to push to Jira: {response.status_code} - {response.text}"}
    except requests.exceptions.RequestException as e:
        return {"error": f"Network error while pushing to Jira: {str(e)}"}

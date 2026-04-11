def build_qa_prompt(jira_data: dict) -> str:
    jira_title = jira_data.get('fields', {}).get('summary', 'Unknown Title')
    jira_description = jira_data.get('fields', {}).get('description', 'No description provided')

    prompt = f"""
    You are an Expert Manual QA Tester working in an agile software team.

    Your task is to analyze the following Jira Ticket and write manual test cases
    that a HUMAN TESTER can execute step-by-step — no coding knowledge required.

    JIRA TICKET INFO:
    Title: {jira_title}
    Description: {jira_description}

    INSTRUCTIONS:
    1. Write exactly 5 manual test cases.
    2. Use simple, clear English that any non-technical tester can follow.
    3. Include at least 2 negative scenarios (what happens when the user does something wrong).
    4. Each step should describe a real UI action (e.g. "Click the Submit button", "Enter 'admin@test.com' in the Email field").

    OUTPUT FORMAT:
    Return a strict JSON object matching the provided schema.
    For each test case, the 'type' field must be one of: Positive, Negative, or Edge.
    """

    return prompt

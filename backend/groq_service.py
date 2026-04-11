import os
import json
from groq import Groq
from prompt_builder import build_qa_prompt
from schemas import TestcaseGenerationResponse

# Load the API key from your .env
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_test_cases(jira_data: dict) -> dict:
    # 1. Build the angry QA Senior Engineer prompt!
    prompt = build_qa_prompt(jira_data)
    
    # 2. Tell Groq what schema we expect it to strictly follow
    schema_json = TestcaseGenerationResponse.schema_json()
    
    # 3. Call Llama 3!
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {"role": "system", "content": f"You are a test generator. Output strictly in JSON format matching this schema: {schema_json}"},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"} # FORCES strict JSON!
        )
        
        # 4. Read the text the AI returned and convert it to a python Dictionary
        ai_output = response.choices[0].message.content
        return json.loads(ai_output)
        
    except Exception as e:
        print(f"AI Error: {e}")
        return {"error": "Failed to generate test cases"}
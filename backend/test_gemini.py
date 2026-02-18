import os
import google.generativeai as genai
from dotenv import load_dotenv

def test_connectivity():
    load_dotenv()
    api_key = os.getenv("API_KEY")
    
    if not api_key:
        print("ERROR: API_KEY not found in environment.")
        return

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-3-flash-preview')
        response = model.generate_content("Say 'TAVAAZO System Online'")
        print(f"SUCCESS: {response.text}")
    except Exception as e:
        print(f"FAILURE: {str(e)}")

if __name__ == "__main__":
    test_connectivity()

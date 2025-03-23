import os
import google.generativeai as genai

# Set up Gemini using your API key from env var
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

def clean_snippet_with_gemini(code: str) -> str:
    prompt = (
        "Clean the following code by removing personal data (e.g. names, API keys, file paths). "
        "Make it more reusable:\n\n"
        f"{code}\n\nCleaned:"
    )
    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        return response.text.strip() if hasattr(response, "text") else code
    except Exception as e:
        print("Gemini Error:", e)
        return code  # Return original if any failure

from django.conf import settings
from google import genai
from .intent import detect_intent
from .retrieval import get_portfolio_context
from .prompts import get_system_prompt

def process_chat_message(user_message, history=None):
    """
    Main orchestrator for the ASK CHIRANJEEB AI assistant.
    Returns a dictionary containing the 'answer' string and 'actions' list.
    """
    if not history:
        history = []
        
    if not settings.GEMINI_API_KEY:
        return {
            "answer": "The AI is temporarily offline (API Key missing). However, you can still explore the portfolio using the navigation menu.",
            "actions": []
        }

    try:
        # 1. Detect Intent
        intents = detect_intent(user_message)
        
        # 2. Retrieve Data & Actions
        context_dict, actions = get_portfolio_context(intents)
        
        # 3. Build Prompt
        system_prompt = get_system_prompt(context_dict)
        
        # 4. Initialize Gemini
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        # 5. Build Content Array for Gemini
        # Convert our history to Gemini format if needed, but for simplicity we can just
        # inject the system prompt and the current user message.
        # GenAI SDK usually handles system instructions directly in the generate_content call if supported.
        
        full_prompt = f"{system_prompt}\n\nUser Question: {user_message}\n\nAssistant Response:"
        
        # 6. Generate Response
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=full_prompt,
        )
        
        answer = response.text
        
        # Limit actions to avoid cluttering the UI (e.g. max 3 cards)
        return {
            "answer": answer,
            "actions": actions[:3]
        }
        
    except Exception as e:
        print(f"AI Service Error: {e}")
        return {
            "answer": "I'm having trouble connecting to my neural core right now. Please try again later or explore the portfolio manually.",
            "actions": []
        }

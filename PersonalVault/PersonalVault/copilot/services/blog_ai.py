from django.conf import settings
from google import genai
from portfolio.models import BlogPost

def ask_about_article(article_id, question):
    if not settings.GEMINI_API_KEY:
        return {"error": "AI Service is temporarily offline."}
        
    try:
        article = BlogPost.objects.get(id=article_id, is_published=True)
    except BlogPost.DoesNotExist:
        return {"error": "Article not found or not published."}
        
    system_instruction = (
        "You are an expert technical AI assistant designed to answer questions about a specific article.\n"
        "STRICT RULES:\n"
        "1. Answer the user's question using ONLY the provided Article Content as your source of truth.\n"
        "2. If the answer is not in the article, politely state that the article does not cover that topic.\n"
        "3. Do not invent information or attribute facts to the author that they did not write.\n"
        "4. Output in clean Markdown.\n"
        "5. Clearly distinguish your explanation from the actual article text if you are summarizing.\n"
    )
    
    full_prompt = f"{system_instruction}\n\nArticle Title: {article.title}\n\nArticle Content:\n{article.content}\n\nUser Question: {question}"
    
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=full_prompt
        )
        return {"answer": response.text}
    except Exception as e:
        print(f"Blog AI Error: {e}")
        return {"error": "An internal error occurred."}

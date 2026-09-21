import re

def detect_intent(message):
    """
    Categorizes the user's message to determine which database models to query.
    Returns a list of intent strings.
    """
    message = message.lower()
    intents = set()
    
    # Keyword maps
    keywords = {
        'projects': ['project', 'work', 'built', 'build', 'create', 'portfolio', 'github', 'repo'],
        'skills': ['skill', 'technology', 'technologies', 'python', 'django', 'react', 'language', 'framework', 'tool', 'stack'],
        'resume': ['resume', 'cv', 'experience', 'job', 'work history'],
        'certificates': ['certificate', 'cert', 'certification', 'award', 'degree', 'education'],
        'contact': ['contact', 'email', 'hire', 'reach', 'message', 'phone', 'social', 'linkedin'],
        'general': ['who', 'about', 'bio', 'background', 'hello', 'hi', 'hey']
    }
    
    for intent, words in keywords.items():
        for word in words:
            # Match whole words to avoid false positives
            if re.search(rf'\b{word}\b', message):
                intents.add(intent)
                break
                
    # If no specific intent matched, default to general and projects to have some context
    if not intents:
        intents.add('general')
        intents.add('projects')
        
    return list(intents)

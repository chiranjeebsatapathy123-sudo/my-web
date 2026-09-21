from django.conf import settings
from google import genai
from portfolio.models import Project, Skill

def ask_about_universe_node(node_id, node_type, node_name, question):
    if not settings.GEMINI_API_KEY:
        return {"error": "AI Service is temporarily offline."}
        
    context = f"Node Name: {node_name}\nNode Type: {node_type}\n"
    
    if node_type == 'project':
        try:
            pid = node_id.replace('project_', '')
            project = Project.objects.get(id=pid)
            techs = ", ".join([t.name for t in project.technologies.all()])
            context += f"Description: {project.description}\nTechnologies used: {techs}\n"
        except Project.DoesNotExist:
            return {"error": "Project not found."}
            
    elif node_type == 'skill':
        try:
            sid = node_id.replace('skill_', '')
            skill = Skill.objects.get(id=sid)
            projects = Project.objects.filter(technologies=skill)
            p_names = ", ".join([p.title for p in projects])
            context += f"Category: {skill.category}\nProjects using this: {p_names}\n"
        except Skill.DoesNotExist:
            return {"error": "Skill not found."}
            
    elif node_type == 'domain':
        skills = Skill.objects.filter(category=node_name)
        s_names = ", ".join([s.name for s in skills])
        context += f"This is a major technical domain in the portfolio.\nTechnologies in this domain: {s_names}\n"
        
    system_instruction = (
        "You are an expert technical AI assistant embedded inside an interactive 3D Knowledge Graph (Technical Universe).\n"
        "STRICT RULES:\n"
        "1. Answer the user's question using ONLY the provided Context.\n"
        "2. Do not invent project architectures, skills, or relationships that are not in the Context.\n"
        "3. Output in clean Markdown.\n"
        "4. Be concise and technical. You are explaining the portfolio to a recruiter or engineering manager.\n"
    )
    
    full_prompt = f"{system_instruction}\n\nContext:\n{context}\n\nUser Question: {question}"
    
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=full_prompt
        )
        return {"answer": response.text}
    except Exception as e:
        print(f"Universe AI Error: {e}")
        return {"error": "An internal error occurred."}

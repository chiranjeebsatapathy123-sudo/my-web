import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from google import genai
from portfolio.models import Profile, Project
from certificates.models import Certificate

@csrf_exempt
def chat_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_message = data.get('message', '')
            
            if not user_message:
                return JsonResponse({'error': 'Message is required'}, status=400)
            
            if not settings.GEMINI_API_KEY:
                return JsonResponse({'error': 'Gemini API key is not configured.'}, status=500)
                
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            # 1. Gather Context
            context_text = ""
            if request.user.is_authenticated:
                profile = Profile.objects.filter(user=request.user).first()
                if profile:
                    context_text += f"User Bio: {profile.bio}\n"
                
                projects = Project.objects.filter(user=request.user)
                if projects.exists():
                    context_text += "\nUser Projects:\n"
                    for p in projects:
                        context_text += f"- {p.title}: {p.description}\n"
                
                certs = Certificate.objects.filter(user=request.user)
                if certs.exists():
                    context_text += "\nUser Certificates:\n"
                    for c in certs:
                        context_text += f"- {c.title} from {c.organization} ({c.issue_date})\n"
            else:
                context_text += "User is not logged in. They are viewing the public vault."

            # 2. Manage Chat History
            history = request.session.get('chat_history', [])
            history.append({"role": "user", "content": user_message})
            
            # Format history for the prompt
            history_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history[-10:]]) # keep last 10 messages
            
            prompt = f"""You are an advanced AI assistant for a Personal Vault application.
You help the user navigate their vault, summarize their projects, and answer questions.
Use markdown for formatting when appropriate (e.g. bolding, lists).

Here is the context about the user's vault data:
{context_text}

Here is the recent conversation history:
{history_text}

Please provide a helpful, concise response to the user's last message.
AI:"""
            
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt,
            )
            
            # Save AI response to history
            history.append({"role": "AI", "content": response.text})
            # limit history size
            if len(history) > 20:
                history = history[-20:]
            request.session['chat_history'] = history
            
            return JsonResponse({'response': response.text})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Invalid request method'}, status=405)

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from resume.models import Resume

@login_required
def analyze_resume_view(request):
    if request.method == 'POST':
        resume_id = request.POST.get('resume_id')
        if not resume_id:
            return render(request, 'copilot/analyze.html', {'error': 'Please select a resume.', 'resumes': Resume.objects.filter(user=request.user)})
        
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)
        
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            uploaded_file = client.files.upload(file=resume.file.path)
            prompt = """You are an expert technical recruiter and resume reviewer. 
Please thoroughly analyze this resume. 
Identify strong points, weak points, formatting issues (if discernible from text), missing critical skills, and provide actionable suggestions for improvement. 
Format your response beautifully in Markdown."""
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=[uploaded_file, prompt]
            )
            return render(request, 'copilot/analyze_result.html', {'analysis': response.text, 'resume': resume})
        except Exception as e:
            return render(request, 'copilot/analyze.html', {'error': f'Error analyzing resume: {str(e)}', 'resumes': Resume.objects.filter(user=request.user)})
            
    resumes = Resume.objects.filter(user=request.user)
    return render(request, 'copilot/analyze.html', {'resumes': resumes})

@login_required
def generate_cover_letter_view(request):
    if request.method == 'POST':
        job_description = request.POST.get('job_description')
        if not job_description:
            return render(request, 'copilot/cover_letter.html', {'error': 'Job description is required.'})
            
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            # Gather user context
            context_text = ""
            profile = Profile.objects.filter(user=request.user).first()
            if profile:
                context_text += f"Name: {request.user.first_name} {request.user.last_name}\nBio: {profile.bio}\n"
            
            projects = Project.objects.filter(user=request.user)
            if projects.exists():
                context_text += "\nProjects:\n"
                for p in projects:
                    context_text += f"- {p.title}: {p.description}\n"
            
            prompt = f"""You are an expert career coach. Write a highly tailored, professional, and compelling cover letter for the following job description, using the candidate's actual projects and bio to demonstrate fit.
            
Candidate Info:
{context_text}

Target Job Description:
{job_description}

Please output ONLY the cover letter formatted beautifully in Markdown."""
            
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt
            )
            return render(request, 'copilot/cover_letter_result.html', {'cover_letter': response.text})
        except Exception as e:
            return render(request, 'copilot/cover_letter.html', {'error': str(e)})
            
    return render(request, 'copilot/cover_letter.html')

@login_required
def mock_interview_view(request):
    return render(request, 'copilot/interview.html')

@csrf_exempt
@login_required
def mock_interview_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_message = data.get('message', '')
            
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            context_text = ""
            projects = Project.objects.filter(user=request.user)
            if projects.exists():
                context_text += "\nUser Projects:\n"
                for p in projects:
                    context_text += f"- {p.title}: {p.description}\n"
                    
            history = request.session.get('interview_history', [])
            history.append({"role": "user", "content": user_message})
            
            history_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history[-10:]])
            
            prompt = f"""You are a strict but fair technical recruiter conducting a mock interview.
The candidate has the following projects on their resume:
{context_text}

Here is the conversation so far:
{history_text}

Ask exactly ONE follow-up question or technical question based on their last response or their projects. Do not break character. Do not provide the answer."""
            
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt
            )
            
            history.append({"role": "AI", "content": response.text})
            request.session['interview_history'] = history[-20:]
            
            return JsonResponse({'response': response.text})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    # Reset history on GET
    request.session['interview_history'] = []
    return JsonResponse({'status': 'reset'})

from django.http import HttpResponse

@login_required
def job_matcher_view(request):
    if request.method == 'POST':
        job_description = request.POST.get('job_description')
        if not job_description:
            return render(request, 'copilot/job_matcher.html', {'error': 'Job description is required.'})
            
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            context_text = ""
            profile = Profile.objects.filter(user=request.user).first()
            if profile:
                context_text += f"Bio: {profile.bio}\n"
            
            projects = Project.objects.filter(user=request.user)
            if projects.exists():
                context_text += "\nProjects:\n"
                for p in projects:
                    context_text += f"- {p.title}: {p.description}\n"
                    
            prompt = f"""You are an expert AI Career Matcher.
Compare this job description with the user's profile and projects.
Output a detailed match report including:
1. Match Percentage
2. Key Strengths (what they have)
3. Skill Gaps (what they are missing)
4. Actionable Advice

Format beautifully in Markdown.
Job Description: {job_description}
User Profile: {context_text}"""
            
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt
            )
            return render(request, 'copilot/job_matcher_result.html', {'match_report': response.text})
        except Exception as e:
            return render(request, 'copilot/job_matcher.html', {'error': str(e)})
            
    return render(request, 'copilot/job_matcher.html')

@login_required
def idea_generator_view(request):
    if request.method == 'POST':
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            context_text = ""
            profile = Profile.objects.filter(user=request.user).first()
            if profile:
                context_text += f"Bio: {profile.bio}\n"
            
            projects = Project.objects.filter(user=request.user)
            if projects.exists():
                context_text += "\nExisting Projects:\n"
                for p in projects:
                    context_text += f"- {p.title}: {p.description}\n"
                    
            prompt = f"""You are an expert technical product manager.
Based on the user's existing projects and bio, suggest 3 highly unique, challenging, and resume-boosting project ideas they should build next to stand out to recruiters.
Include a catchy title, a brief description, and suggested tech stack for each.
Format beautifully in Markdown.
User Profile: {context_text}"""
            
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt
            )
            return render(request, 'copilot/idea_result.html', {'ideas': response.text})
        except Exception as e:
            return render(request, 'copilot/idea_generator.html', {'error': str(e)})
            
    return render(request, 'copilot/idea_generator.html')

@login_required
def pitch_generator_view(request):
    if request.method == 'POST':
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            context_text = ""
            profile = Profile.objects.filter(user=request.user).first()
            if profile:
                context_text += f"Bio: {profile.bio}\n"
            
            projects = Project.objects.filter(user=request.user)
            if projects.exists():
                context_text += "\nProjects:\n"
                for p in projects:
                    context_text += f"- {p.title}\n"
                    
            prompt = f"""You are an expert career coach.
Generate an 'Elevator Pitch' for the user based on their profile and projects.
Provide exactly three versions:
1. 30-Second Pitch (Short & Punchy)
2. 60-Second Pitch (Standard)
3. 2-Minute Pitch (Detailed Story)
Format beautifully in Markdown.
User Profile: {context_text}"""
            
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt
            )
            return render(request, 'copilot/pitch_result.html', {'pitches': response.text})
        except Exception as e:
            return render(request, 'copilot/pitch_generator.html', {'error': str(e)})
            
    return render(request, 'copilot/pitch_generator.html')

@login_required
def tech_explainer_view(request):
    if request.method == 'POST':
        project_id = request.POST.get('project_id')
        if not project_id:
            return render(request, 'copilot/tech_explainer.html', {'error': 'Select a project.', 'projects': Project.objects.filter(user=request.user)})
            
        project = get_object_or_404(Project, id=project_id, user=request.user)
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            prompt = f"""You are an expert software architect.
The user built a project named '{project.title}' with the following description: '{project.description}'.
Generate talking points for an interview explaining:
1. Why this project is technically impressive.
2. The implied technical challenges.
3. How to confidently explain the architectural decisions.
Format beautifully in Markdown."""
            
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt
            )
            return render(request, 'copilot/tech_result.html', {'explanation': response.text, 'project': project})
        except Exception as e:
            return render(request, 'copilot/tech_explainer.html', {'error': str(e), 'projects': Project.objects.filter(user=request.user)})
            
    return render(request, 'copilot/tech_explainer.html', {'projects': Project.objects.filter(user=request.user)})

@csrf_exempt
@login_required
def optimize_snippet_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            code = data.get('code', '')
            action = data.get('action', 'optimize')
            
            if not code:
                return JsonResponse({'error': 'Code is required'}, status=400)
                
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            prompt = f"You are an expert software engineer. "
            if action == 'optimize':
                prompt += "Please optimize the following code for performance and readability. Return ONLY the optimized code (no markdown formatting blocks like ```python, just the raw code text)."
            elif action == 'explain':
                prompt += "Please explain what the following code does. Be concise and format your response as comments that can be prepended to the code, or just as a markdown explanation."
            elif action == 'translate_js':
                prompt += "Please translate the following code to JavaScript. Return ONLY the translated code (no markdown blocks)."
            elif action == 'translate_py':
                prompt += "Please translate the following code to Python. Return ONLY the translated code (no markdown blocks)."
            else:
                prompt += "Please review the following code."
                
            prompt += f"\n\nCode:\n{code}"
            
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt
            )
            
            result_text = response.text
            # Clean markdown code blocks if present
            if result_text.startswith("```"):
                lines = result_text.split('\n')
                if len(lines) > 2:
                    result_text = '\n'.join(lines[1:-1])
                    if result_text.endswith("```"):
                        result_text = result_text[:-3]

            return JsonResponse({'result': result_text})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Invalid request'}, status=400)
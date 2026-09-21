import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from google import genai
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from portfolio.models import Profile, Project
from resume.models import Resume

# Services
from .services.portfolio_ai import process_chat_message
from .services.resume_ai import analyze_resume, match_job
from .services.generator_ai import generate_cover_letter, generate_project_idea, generate_pitch
from .services.interview_ai import process_interview_message
from .services.explainer_ai import generate_explanation
from .services.blog_ai import ask_about_article
from .services.universe_ai import ask_about_universe_node

@csrf_exempt
def chat_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_message = data.get('message', '')
            if not user_message:
                return JsonResponse({'error': 'Message is required'}, status=400)
            
            history = request.session.get('chat_history', [])
            response_data = process_chat_message(user_message, history)
            
            history.append({"role": "user", "content": user_message})
            history.append({"role": "model", "content": response_data.get('answer', '')})
            request.session['chat_history'] = history[-10:]
            
            return JsonResponse(response_data)
        except Exception as e:
            return JsonResponse({'error': 'An internal error occurred'}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def ask_ai_view(request):
    profile = Profile.objects.first()
    return render(request, 'copilot/ask_ai.html', {'profile': profile})

@login_required
def analyze_resume_view(request):
    if request.method == 'POST':
        resume_id = request.POST.get('resume_id')
        if not resume_id:
            return render(request, 'copilot/analyze.html', {'error': 'Please select a resume.', 'resumes': Resume.objects.filter(user=request.user)})
        
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)
        analysis_result = analyze_resume(request.user, resume.id)
        
        if analysis_result.startswith("Error"):
            return render(request, 'copilot/analyze.html', {'error': analysis_result, 'resumes': Resume.objects.filter(user=request.user)})
            
        return render(request, 'copilot/analyze_result.html', {'analysis': analysis_result, 'resume': resume})
            
    resumes = Resume.objects.filter(user=request.user)
    return render(request, 'copilot/analyze.html', {'resumes': resumes})

@login_required
def generate_cover_letter_view(request):
    if request.method == 'POST':
        job_description = request.POST.get('job_description')
        if not job_description:
            return render(request, 'copilot/cover_letter.html', {'error': 'Job description is required.'})
            
        result = generate_cover_letter(request.user, job_description)
        if result.startswith("Error"):
            return render(request, 'copilot/cover_letter.html', {'error': result})
            
        return render(request, 'copilot/cover_letter_result.html', {'cover_letter': result})
            
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
            
            history = request.session.get('interview_history', [])
            
            result = process_interview_message(request.user, user_message, history)
            if result.get("answer", "").startswith("Error"):
                return JsonResponse({'error': result["answer"]}, status=500)
                
            history.append({"role": "user", "content": user_message})
            history.append({"role": "AI", "content": result["answer"]})
            request.session['interview_history'] = history[-20:]
            
            return JsonResponse({'response': result["answer"]})
        except Exception as e:
            return JsonResponse({'error': 'An internal error occurred'}, status=500)
            
    # Reset history on GET
    request.session['interview_history'] = []
    return JsonResponse({'status': 'reset'})

@login_required
def job_matcher_view(request):
    if request.method == 'POST':
        resume_id = request.POST.get('resume_id')
        job_description = request.POST.get('job_description')
        if not resume_id or not job_description:
            return render(request, 'copilot/job_matcher.html', {'error': 'Resume and Job description are required.', 'resumes': Resume.objects.filter(user=request.user)})
            
        result = match_job(request.user, resume_id, job_description)
        if result.startswith("Error"):
            return render(request, 'copilot/job_matcher.html', {'error': result, 'resumes': Resume.objects.filter(user=request.user)})
            
        return render(request, 'copilot/job_matcher_result.html', {'match_report': result})
            
    resumes = Resume.objects.filter(user=request.user)
    return render(request, 'copilot/job_matcher.html', {'resumes': resumes})

@login_required
def idea_generator_view(request):
    if request.method == 'POST':
        domain = request.POST.get('domain', 'Full Stack Web Development')
        difficulty = request.POST.get('difficulty', 'Intermediate')
        
        result = generate_project_idea(request.user, domain, difficulty)
        if result.startswith("Error"):
            return render(request, 'copilot/idea_generator.html', {'error': result})
            
        return render(request, 'copilot/idea_result.html', {'ideas': result})
            
    return render(request, 'copilot/idea_generator.html')

@login_required
def pitch_generator_view(request):
    if request.method == 'POST':
        project_id = request.POST.get('project_id')
        pitch_type = request.POST.get('pitch_type', 'Elevator Pitch')
        
        if not project_id:
            return render(request, 'copilot/pitch_generator.html', {'error': 'Please select a project.', 'projects': Project.objects.filter(user=request.user)})
            
        result = generate_pitch(request.user, project_id, pitch_type)
        if result.startswith("Error"):
            return render(request, 'copilot/pitch_generator.html', {'error': result, 'projects': Project.objects.filter(user=request.user)})
            
        return render(request, 'copilot/pitch_result.html', {'pitches': result})
            
    return render(request, 'copilot/pitch_generator.html', {'projects': Project.objects.filter(user=request.user)})

@login_required
def tech_explainer_view(request):
    if request.method == 'POST':
        topic = request.POST.get('topic')
        if not topic:
            return render(request, 'copilot/tech_explainer.html', {'error': 'Topic is required.'})
            
        result = generate_explanation(topic)
        if result.startswith("Error"):
            return render(request, 'copilot/tech_explainer.html', {'error': result})
            
        return render(request, 'copilot/tech_result.html', {'explanation': result, 'topic': topic})
            
    return render(request, 'copilot/tech_explainer.html')

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
                model='gemini-2.0-flash',
                contents=prompt
            )
            
            result_text = response.text
            if result_text.startswith("```"):
                lines = result_text.split('\n')
                if len(lines) > 2:
                    result_text = '\n'.join(lines[1:-1])
                    if result_text.endswith("```"):
                        result_text = result_text[:-3]

            return JsonResponse({'result': result_text})
        except Exception as e:
            return JsonResponse({'error': 'An internal error occurred'}, status=500)
            
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def blog_ask_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            article_id = data.get('article_id')
            question = data.get('question', '')
            
            if not article_id or not question:
                return JsonResponse({'error': 'Article ID and question are required'}, status=400)
                
            result = ask_about_article(article_id, question)
            
            if "error" in result:
                return JsonResponse({'error': result["error"]}, status=500)
                
            return JsonResponse({'answer': result["answer"]})
        except Exception as e:
            return JsonResponse({'error': 'An internal error occurred'}, status=500)
            
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def universe_ask_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            node_id = data.get('node_id')
            node_type = data.get('node_type')
            node_name = data.get('node_name')
            question = data.get('question', '')
            
            if not all([node_id, node_type, node_name, question]):
                return JsonResponse({'error': 'Missing required fields'}, status=400)
                
            result = ask_about_universe_node(node_id, node_type, node_name, question)
            
            if "error" in result:
                return JsonResponse({'error': result["error"]}, status=500)
                
            return JsonResponse({'answer': result["answer"]})
        except Exception as e:
            return JsonResponse({'error': 'An internal error occurred'}, status=500)
            
    return JsonResponse({'error': 'Invalid request'}, status=400)
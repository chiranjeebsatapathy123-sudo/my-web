from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.contrib import messages
import requests

from .models import Profile, Project, Snippet
from .forms import ProfileForm, ProjectForm, SnippetForm

from certificates.models import Certificate
from documents.models import Document
import json
from django.http import HttpResponse
from django.core.serializers.json import DjangoJSONEncoder

def home(request):
    if not request.user.is_authenticated:
        return render(request, "portfolio/welcome.html")

    profile = Profile.objects.filter(user=request.user).first()
    
    projects_count = 0
    certificates_count = 0

    if profile:
        projects = Project.objects.filter(user=profile.user).order_by('-created_at')[:6]
        projects_count = Project.objects.filter(user=profile.user).count()
        certificates_count = Certificate.objects.filter(user=profile.user).count()
    else:
        projects = Project.objects.none()

    return render(request, "home.html", {
        "profile": profile,
        "projects": projects,
        "projects_count": projects_count,
        "certificates_count": certificates_count,
    })

@login_required
def profile(request):

    profile, created = Profile.objects.get_or_create(
        user=request.user
    )

    if request.method == "POST":

        form = ProfileForm(
            request.POST,
            request.FILES,
            instance=profile
        )

        if form.is_valid():

            form.save()

            return redirect('profile')

    else:

        form = ProfileForm(instance=profile)

    return render(
        request,
        'portfolio/profile.html',
        {
            'form':form,
            'profile':profile
        }
    )

@login_required
def project_list(request):
    projects = Project.objects.filter(user=request.user)
    return render(request, 'portfolio/project_list.html', {
        'projects': projects
    })


@login_required
def add_project(request):

    if request.method == "POST":

        form = ProjectForm(request.POST, request.FILES)

        if form.is_valid():

            project = form.save(commit=False)

            project.user = request.user

            project.save()

            messages.success(request, 'Project added successfully!')
            return redirect('project_list')

    else:
        form = ProjectForm()

    return render(request,
                  'portfolio/add_project.html',
                  {'form': form})


@login_required
def edit_project(request, pk):
    project = get_object_or_404(Project, pk=pk, user=request.user)

    if request.method == "POST":
        form = ProjectForm(request.POST, request.FILES, instance=project)
        if form.is_valid():
            form.save()
            messages.success(request, 'Project updated successfully!')
            return redirect('project_list')
    else:
        form = ProjectForm(instance=project)

    return render(request, 'portfolio/edit_project.html', {
        'form': form,
        'project': project
    })


@login_required
@require_POST
def delete_project(request, pk):
    project = get_object_or_404(Project, pk=pk, user=request.user)
    if project.image:
        project.image.delete(save=False)
    project.delete()
    messages.success(request, 'Project deleted successfully!')
    return redirect('project_list')



@login_required
def import_github_projects(request):
    username = request.GET.get('username', '')
    profile = Profile.objects.filter(user=request.user).first()
    
    # Pre-fill username if profile has a github link
    if not username and profile and profile.github:
        parts = profile.github.strip('/').split('/')
        if len(parts) > 0:
            username = parts[-1]
            
    repos = []
    error_message = None
    
    if username:
        # Fetch from GitHub API
        url = f"https://api.github.com/users/{username}/repos?sort=updated&per_page=50"
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                repos_data = response.json()
                for repo in repos_data:
                    exists = Project.objects.filter(user=request.user, github_link=repo['html_url']).exists()
                    repos.append({
                        'name': repo['name'],
                        'description': repo['description'] or 'No description provided.',
                        'html_url': repo['html_url'],
                        'homepage': repo['homepage'] or '',
                        'exists': exists
                    })
            elif response.status_code == 404:
                error_message = f"GitHub user '{username}' not found."
            else:
                error_message = f"Error fetching from GitHub: {response.status_code}"
        except requests.RequestException as e:
            error_message = f"Failed to connect to GitHub: {str(e)}"
            
    if request.method == 'POST' and username:
        selected_repos = request.POST.getlist('selected_repos')
        imported_count = 0
        for repo_name in selected_repos:
            title = request.POST.get(f"title_{repo_name}")
            description = request.POST.get(f"desc_{repo_name}")
            github_link = request.POST.get(f"link_{repo_name}")
            live_demo = request.POST.get(f"demo_{repo_name}")
            
            if github_link and not Project.objects.filter(user=request.user, github_link=github_link).exists():
                Project.objects.create(
                    user=request.user,
                    title=title or repo_name,
                    description=description or '',
                    github_link=github_link,
                    live_demo=live_demo or ''
                )
                imported_count += 1
                
        if imported_count > 0:
            messages.success(request, f"Successfully imported {imported_count} projects from GitHub!")
            return redirect('project_list')
        else:
            messages.warning(request, "No new projects were imported.")
            
    return render(request, 'portfolio/import_github.html', {
        'username': username,
        'repos': repos,
        'error_message': error_message
    })

@login_required
def search_view(request):
    query = request.GET.get('q', '')
    projects = Project.objects.none()
    certificates = Certificate.objects.none()
    documents = Document.objects.none()

    if query:
        projects = Project.objects.filter(user=request.user, title__icontains=query) | \
                   Project.objects.filter(user=request.user, description__icontains=query)
        certificates = Certificate.objects.filter(user=request.user, title__icontains=query) | \
                       Certificate.objects.filter(user=request.user, organization__icontains=query)
        documents = Document.objects.filter(user=request.user, title__icontains=query)

    return render(request, 'portfolio/search_results.html', {
        'query': query,
        'projects': projects,
        'certificates': certificates,
        'documents': documents
    })

@login_required
def export_vault_data(request):
    profile = Profile.objects.filter(user=request.user).first()
    projects = list(Project.objects.filter(user=request.user).values('title', 'description', 'github_link', 'live_demo', 'created_at'))
    certificates = list(Certificate.objects.filter(user=request.user).values('title', 'organization', 'issue_date'))
    
    data = {
        'profile': {
            'bio': profile.bio if profile else '',
            'location': profile.location if profile else '',
            'github': profile.github if profile else '',
            'linkedin': profile.linkedin if profile else '',
        },
        'projects': projects,
        'certificates': certificates
    }
    
    response = HttpResponse(
        json.dumps(data, cls=DjangoJSONEncoder, indent=4),
        content_type='application/json'
    )
    response['Content-Disposition'] = 'attachment; filename="vault_backup.json"'
    return response
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Secret

@login_required
def secrets_list(request):
    secrets = Secret.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'portfolio/secrets.html', {'secrets': secrets})

@login_required
def add_secret(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        content = request.POST.get('content')
        Secret.objects.create(user=request.user, title=title, content=content)
        return redirect('secrets')
    return render(request, 'portfolio/add_secret.html')

@login_required
def snippet_list(request):
    snippets = Snippet.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'portfolio/snippets.html', {'snippets': snippets})

@login_required
def add_snippet(request):
    if request.method == 'POST':
        form = SnippetForm(request.POST)
        if form.is_valid():
            snippet = form.save(commit=False)
            snippet.user = request.user
            snippet.save()
            messages.success(request, "Snippet added successfully!")
            return redirect('snippets')
    else:
        form = SnippetForm()
    return render(request, 'portfolio/add_snippet.html', {'form': form})

@login_required
def edit_snippet(request, pk):
    snippet = get_object_or_404(Snippet, pk=pk, user=request.user)
    if request.method == 'POST':
        form = SnippetForm(request.POST, instance=snippet)
        if form.is_valid():
            form.save()
            messages.success(request, "Snippet updated successfully!")
            return redirect('snippets')
    else:
        form = SnippetForm(instance=snippet)
    return render(request, 'portfolio/edit_snippet.html', {'form': form, 'snippet': snippet})

@login_required
def delete_snippet(request, pk):
    snippet = get_object_or_404(Snippet, pk=pk, user=request.user)
    if request.method == 'POST':
        snippet.delete()
        messages.success(request, "Snippet deleted!")
        return redirect('snippets')
    return redirect('snippets')

@login_required
def delete_secret(request, pk):
    secret = get_object_or_404(Secret, pk=pk, user=request.user)
    if request.method == 'POST':
        secret.delete()
        return redirect('secrets')
    return render(request, 'portfolio/delete_secret.html', {'secret': secret})

from .models import JobApplication, Connection, BlogPost

# --- JOB KANBAN BOARD ---
@login_required
def jobs_view(request):
    if request.method == 'POST':
        company = request.POST.get('company')
        position = request.POST.get('position')
        status = request.POST.get('status')
        JobApplication.objects.create(user=request.user, company=company, position=position, status=status)
        return redirect('jobs')
        
    jobs = JobApplication.objects.filter(user=request.user)
    return render(request, 'portfolio/jobs.html', {'jobs': jobs})

@login_required
def delete_job(request, pk):
    job = get_object_or_404(JobApplication, pk=pk, user=request.user)
    job.delete()
    return redirect('jobs')

# --- CONNECTIONS CRM ---
@login_required
def connections_view(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        role = request.POST.get('role')
        company = request.POST.get('company')
        linkedin_url = request.POST.get('linkedin_url', '')
        notes = request.POST.get('notes', '')
        Connection.objects.create(user=request.user, name=name, role=role, company=company, linkedin_url=linkedin_url, notes=notes)
        return redirect('connections')
        
    connections = Connection.objects.filter(user=request.user)
    return render(request, 'portfolio/connections.html', {'connections': connections})

@login_required
def delete_connection(request, pk):
    conn = get_object_or_404(Connection, pk=pk, user=request.user)
    conn.delete()
    return redirect('connections')

# --- DEV BLOG ---
@login_required
def blog_view(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        content = request.POST.get('content')
        BlogPost.objects.create(user=request.user, title=title, content=content, is_published=True)
        return redirect('blog')
        
    posts = BlogPost.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'portfolio/blog.html', {'posts': posts})

@login_required
def delete_blog(request, pk):
    post = get_object_or_404(BlogPost, pk=pk, user=request.user)
    post.delete()
    return redirect('blog')

@login_required
def linkedin_sync(request):
    if request.method == 'POST' and request.FILES.get('linkedin_pdf'):
        pdf_file = request.FILES['linkedin_pdf']
        try:
            from google import genai
            from django.conf import settings
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            # Save the file temporarily
            from django.core.files.storage import FileSystemStorage
            fs = FileSystemStorage()
            filename = fs.save(pdf_file.name, pdf_file)
            uploaded_file_url = fs.path(filename)
            
            uploaded_file = client.files.upload(file=uploaded_file_url)
            
            prompt = """You are an expert data parser. Read this LinkedIn Profile PDF.
Extract the 'Bio/Summary' and format it as a single paragraph.
Then, extract the 'Experience' and 'Projects' and format them as a JSON list of objects:
[{"title": "Project or Role Title", "description": "Detailed description..."}]

Output ONLY valid JSON in this exact structure:
{
    "bio": "extracted bio...",
    "projects": [{"title": "...", "description": "..."}]
}
"""
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=[uploaded_file, prompt]
            )
            
            fs.delete(filename)
            
            # Parse the JSON response
            import json
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group(0))
                
                # Update Profile
                profile, _ = Profile.objects.get_or_create(user=request.user)
                if data.get('bio'):
                    profile.bio = data['bio']
                    profile.save()
                    
                # Create Projects
                for p in data.get('projects', []):
                    Project.objects.create(
                        user=request.user,
                        title=p.get('title', 'LinkedIn Project')[:200],
                        description=p.get('description', '')
                    )
                messages.success(request, 'Successfully synced LinkedIn data!')
            else:
                messages.error(request, 'Could not parse LinkedIn data.')
        except Exception as e:
            messages.error(request, f'Sync failed: {str(e)}')
    return redirect('profile')

from .models import SharedLink, AuditLog, ThemePreference
import uuid
from django.utils import timezone
from datetime import timedelta

# --- THEME ENGINE ---
@login_required
def theme_settings(request):
    pref, _ = ThemePreference.objects.get_or_create(user=request.user)
    if request.method == 'POST':
        pref.primary_color = request.POST.get('primary_color', '#3b82f6')
        pref.bg_color = request.POST.get('bg_color', '#0f172a')
        pref.save()
        messages.success(request, 'Theme updated!')
        return redirect('theme_settings')
    return render(request, 'portfolio/theme_settings.html', {'pref': pref})

# --- AUDIT LOG ---
@login_required
def audit_log_view(request):
    logs = AuditLog.objects.filter(user=request.user).order_by('-timestamp')[:100]
    return render(request, 'portfolio/audit_log.html', {'logs': logs})

# --- SECURE LINK ---
@login_required
def generate_link(request):
    if request.method == 'POST':
        target_type = request.POST.get('target_type')
        target_id = request.POST.get('target_id')
        days = int(request.POST.get('days', 7))
        
        link = SharedLink.objects.create(
            user=request.user,
            target_type=target_type,
            target_id=target_id,
            expires_at=timezone.now() + timedelta(days=days)
        )
        return render(request, 'portfolio/shared_link.html', {'link': link})
    
    # Just list projects and resumes for simplicity
    projects = Project.objects.filter(user=request.user)
    resumes = Resume.objects.filter(user=request.user)
    return render(request, 'portfolio/generate_link.html', {'projects': projects, 'resumes': resumes})

def view_shared_link(request, url_hash):
    link = get_object_or_404(SharedLink, url_hash=url_hash)
    if timezone.now() > link.expires_at:
        return HttpResponse("This secure link has expired.", status=403)
        
    if link.target_type == 'project':
        item = get_object_or_404(Project, id=link.target_id)
        return render(request, 'portfolio/view_shared_project.html', {'project': item})
    else:
        item = get_object_or_404(Resume, id=link.target_id)
        return redirect(item.file.url)

import pyotp
import qrcode
import qrcode.image.svg
from io import BytesIO
from django.utils.safestring import mark_safe
from .models import TwoFactorAuth

@login_required
def setup_2fa(request):
    tfa, created = TwoFactorAuth.objects.get_or_create(user=request.user)
    
    if not tfa.secret_key:
        tfa.secret_key = pyotp.random_base32()
        tfa.save()
        
    totp = pyotp.TOTP(tfa.secret_key)
    provisioning_uri = totp.provisioning_uri(name=request.user.email or request.user.username, issuer_name="Personal Vault")
    
    # Generate SVG QR Code
    factory = qrcode.image.svg.SvgImage
    img = qrcode.make(provisioning_uri, image_factory=factory)
    stream = BytesIO()
    img.save(stream)
    svg_data = stream.getvalue().decode('utf-8')
    
    if request.method == 'POST':
        token = request.POST.get('token')
        if totp.verify(token):
            tfa.is_enabled = True
            tfa.save()
            request.session['2fa_verified'] = True
            messages.success(request, '2FA successfully enabled!')
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid code. Please try again.')
            
    return render(request, 'portfolio/setup_2fa.html', {'qr_svg': mark_safe(svg_data), 'secret': tfa.secret_key, 'is_enabled': tfa.is_enabled})

@login_required
def verify_2fa(request):
    tfa, created = TwoFactorAuth.objects.get_or_create(user=request.user)
    if not tfa.is_enabled:
        return redirect('dashboard')
        
    if request.method == 'POST':
        token = request.POST.get('token')
        totp = pyotp.TOTP(tfa.secret_key)
        if totp.verify(token):
            request.session['2fa_verified'] = True
            next_url = request.session.get('next_url_after_2fa', 'dashboard')
            return redirect(next_url)
        else:
            messages.error(request, 'Invalid 2FA code.')
            
    return render(request, 'portfolio/verify_2fa.html')

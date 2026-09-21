from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Resume
from .forms import ResumeForm

from portfolio.models import Profile

@login_required
def resume_view(request):
    # Get latest resume for display
    resume = Resume.objects.order_by('-uploaded_at').first()
    
    # Fetch profile to display social links
    from django.contrib.auth.models import User
    profile = None
    superuser = User.objects.filter(is_superuser=True).first()
    if superuser:
        profile = Profile.objects.filter(user=superuser).first()
    
    form = None
    if request.user.is_authenticated:
        if request.method == 'POST':
            form = ResumeForm(request.POST, request.FILES)
            if form.is_valid():
                new_resume = form.save(commit=False)
                new_resume.user = request.user
                new_resume.save()
                messages.success(request, 'Resume uploaded successfully!')
                return redirect('resume_view')
        else:
            form = ResumeForm()
            
    return render(request, 'resume/resume.html', {
        'resume': resume,
        'form': form,
        'profile': profile,
    })

@login_required
def delete_resume(request, pk):
    if request.method == 'POST':
        resume = get_object_or_404(Resume, pk=pk, user=request.user)
        # Delete file from storage as well
        if resume.file:
            resume.file.delete(save=False)
        resume.delete()
        messages.success(request, 'Resume deleted successfully!')
    return redirect('resume_view')

def interactive_resume(request):
    profile = Profile.objects.first()
    resume = Resume.objects.order_by('-uploaded_at').first()
    
    from portfolio.models import Project, Skill, Achievement
    from certificates.models import Certificate
    
    projects = Project.objects.filter(user=profile.user) if profile else None
    skills = Skill.objects.filter(user=profile.user) if profile else None
    achievements = Achievement.objects.filter(user=profile.user).order_by('-date_achieved') if profile else None
    certificates = Certificate.objects.filter(user=profile.user) if profile else None

    return render(request, 'resume/interactive_resume.html', {
        'profile': profile,
        'resume_file': resume,
        'projects': projects,
        'skills': skills,
        'achievements': achievements,
        'certificates': certificates
    })

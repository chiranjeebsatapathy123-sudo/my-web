from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from documents.models import Document
from certificates.models import Certificate
from resume.models import Resume
from portfolio.models import Project
from contact.models import Contact


@login_required
def dashboard(request):
    from portfolio.models import Profile
    import requests
    
    leetcode_stats = None
    profile = Profile.objects.filter(user=request.user).first()
    if profile and profile.leetcode_username:
        try:
            r = requests.get(f"https://leetcode-stats-api.herokuapp.com/{profile.leetcode_username}", timeout=3)
            if r.status_code == 200:
                leetcode_stats = r.json()
        except:
            pass

    context = {
        "documents": Document.objects.filter(user=request.user).count(),
        "certificates": Certificate.objects.filter(user=request.user).count(),
        "resumes": Resume.objects.filter(user=request.user).count(),
        "projects": Project.objects.filter(user=request.user).count(),
        "contact_messages": Contact.objects.all().order_by('-sent_at'),
        "leetcode_stats": leetcode_stats,
        "profile": profile,
    }

    return render(request, "dashboard/dashboard.html", context)
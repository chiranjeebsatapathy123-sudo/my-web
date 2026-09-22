from portfolio.models import Profile, Project, Skill, Achievement
from certificates.models import Certificate
from resume.models import Resume

def get_portfolio_context(intents):
    """
    Fetches only the database context necessary for the detected intents.
    Returns a dictionary of context data and potential UI actions (cards).
    """
    context = {}
    actions = []
    
    # Always get basic profile info
    profile = Profile.objects.first()
    if profile:
        context['Profile'] = f"Name: {profile.user.first_name or profile.user.username}\nBio: {profile.bio}\nGitHub: {profile.github}\nLinkedIn: {profile.linkedin}"
    
    if 'projects' in intents:
        projects = Project.objects.filter(user=profile.user) if profile else []
        project_texts = []
        for p in projects:
            techs = ", ".join([t.name for t in p.technologies.all()])
            p_text = f"Title: {p.title}\nDescription: {p.description}\nTechnologies: {techs}\nGitHub: {p.github_link}\nLive Demo: {p.live_demo}"
            project_texts.append(p_text)
            actions.append({
                "type": "project_card",
                "id": p.id,
                "title": p.title,
                "description": p.description[:100] + "..." if len(p.description) > 100 else p.description,
                "url": f"/projects/{p.id}/"
            })
        if project_texts:
            context['Projects'] = "\n\n".join(project_texts)

    if 'skills' in intents:
        skills = Skill.objects.filter(user=profile.user) if profile else []
        if skills:
            # Group by domain
            from itertools import groupby
            from operator import attrgetter
            sorted_skills = sorted(skills, key=attrgetter('category'))
            skill_text = []
            for category, group in groupby(sorted_skills, key=attrgetter('category')):
                skill_names = [s.name for s in group]
                skill_text.append(f"Domain: {category} -> Technologies: {', '.join(skill_names)}")
            context['Skills & Domains'] = "\n".join(skill_text)

    if 'certificates' in intents:
        certs = Certificate.objects.filter(user=profile.user) if profile else []
        cert_texts = []
        for c in certs:
            cert_texts.append(f"Title: {c.title}\nOrg: {c.organization}\nDate: {c.issue_date}")
            actions.append({
                "type": "certificate_card",
                "title": c.title,
                "organization": c.organization
            })
        if cert_texts:
            context['Certificates'] = "\n\n".join(cert_texts)

    # Added Blog Posts logic
    from portfolio.models import BlogPost
    blogs = BlogPost.objects.filter(user=profile.user, is_published=True) if profile else []
    if blogs:
        blog_texts = []
        for b in blogs:
            blog_texts.append(f"Title: {b.title}\nExcerpt: {b.excerpt}\nLink: /blog/{b.slug}/")
        context['Blog Articles'] = "\n\n".join(blog_texts)

    if 'resume' in intents:
        resume_obj = Resume.objects.order_by('-uploaded_at').first()
        if resume_obj:
            context['Resume'] = f"A resume exists and was uploaded on {resume_obj.uploaded_at.strftime('%Y-%m-%d')}."
            actions.append({
                "type": "resume_link",
                "url": resume_obj.file.url if resume_obj.file else "#"
            })

    if 'contact' in intents:
        actions.append({"type": "contact_link"})

    return context, actions

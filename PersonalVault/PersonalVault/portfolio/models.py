from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    profile_image = models.ImageField(
        upload_to='profile/',
        default='profile/default.png'
    )

    phone = models.CharField(max_length=15, blank=True)
    location = models.CharField(max_length=100, blank=True)

    bio = models.TextField(blank=True)

    github = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    website = models.URLField(blank=True)
    leetcode_username = models.CharField(max_length=100, blank=True)
    hackerrank_username = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.user.username

class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    title = models.CharField(max_length=200)

    description = models.TextField()

    image = models.ImageField(upload_to='projects/', blank=True, null=True)

    github_link = models.URLField(blank=True)

    live_demo = models.URLField(blank=True)
    
    technologies = models.ManyToManyField('Skill', blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    


class Secret(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Snippet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    language = models.CharField(max_length=50, blank=True, help_text="e.g., Python, JavaScript, Bash")
    code_content = models.TextField()
    tags = models.CharField(max_length=200, blank=True, help_text="Comma separated tags")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Skill(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    category_choices = [
        ('AI/ML', 'AI/ML'),
        ('Programming', 'Programming'),
        ('Web Development', 'Web Development'),
        ('Databases', 'Databases'),
        ('Tools', 'Tools'),
        ('Cloud', 'Cloud'),
        ('Other', 'Other')
    ]
    category = models.CharField(max_length=50, choices=category_choices, default='Programming')
    proficiency = models.IntegerField(default=50, help_text="0 to 100")

    def __str__(self):
        return self.name

class Achievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date_achieved = models.DateField()
    category_choices = [
        ('Education', 'Education'),
        ('Project', 'Project'),
        ('Hackathon', 'Hackathon'),
        ('Certification', 'Certification'),
        ('Career', 'Career'),
        ('Other', 'Other')
    ]
    category = models.CharField(max_length=50, choices=category_choices, default='Career')

    def __str__(self):
        return self.title

# --- Phase 2: Career & Networking Models ---
class JobApplication(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    company = models.CharField(max_length=200)
    position = models.CharField(max_length=200)
    status_choices = [
        ('Applied', 'Applied'),
        ('Interviewing', 'Interviewing'),
        ('Offer', 'Offer'),
        ('Rejected', 'Rejected')
    ]
    status = models.CharField(max_length=50, choices=status_choices, default='Applied')
    applied_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.position} at {self.company}"

class Connection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    linkedin_url = models.URLField(blank=True)
    last_contact = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.name

class BlogCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class BlogTag(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class BlogPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True, null=True)
    excerpt = models.TextField(blank=True)
    content = models.TextField(help_text="Markdown supported")
    cover_image = models.ImageField(upload_to='blog/', blank=True, null=True)
    
    category = models.ForeignKey(BlogCategory, on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.ManyToManyField(BlogTag, blank=True)
    
    reading_time = models.IntegerField(default=1, help_text="Reading time in minutes")
    featured = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
            
        # Calculate reading time automatically if not explicitly set
        if self.content:
            word_count = len(self.content.split())
            calculated_time = max(1, round(word_count / 200)) # 200 wpm
            self.reading_time = calculated_time
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

# --- Phase 4: Security & Customization Models ---
import uuid

class SharedLink(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    target_type = models.CharField(max_length=50) # e.g. "resume" or "project"
    target_id = models.IntegerField()
    url_hash = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

class ThemePreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    theme_name = models.CharField(max_length=50, default='default')
    primary_color = models.CharField(max_length=20, default='#3b82f6')
    bg_color = models.CharField(max_length=20, default='#0f172a')

class TwoFactorAuth(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    secret_key = models.CharField(max_length=32, blank=True)
    is_enabled = models.BooleanField(default=False)

from django.contrib import admin
from .models import (
    Profile, Project, Secret, Snippet, Skill, Achievement, 
    JobApplication, Connection, BlogPost, BlogCategory, BlogTag,
    SharedLink, AuditLog, ThemePreference, TwoFactorAuth
)

admin.site.register(Profile)
admin.site.register(Project)
admin.site.register(Secret)
admin.site.register(Snippet)
admin.site.register(Skill)
admin.site.register(Achievement)
admin.site.register(JobApplication)
admin.site.register(Connection)

@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}

@admin.register(BlogTag)
class BlogTagAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'category', 'is_published', 'featured', 'created_at')
    list_filter = ('is_published', 'featured', 'category')
    search_fields = ('title', 'content')
    prepopulated_fields = {'slug': ('title',)}

admin.site.register(SharedLink)
admin.site.register(AuditLog)
admin.site.register(ThemePreference)
admin.site.register(TwoFactorAuth)
from django.urls import path
from . import views

urlpatterns = [

    path('', views.home, name='home'),

    path('profile/', views.profile, name='profile'),

    path('projects/', views.project_list, name='project_list'),

    path('projects/add/', views.add_project, name='add_project'),
    path('projects/import-github/', views.import_github_projects, name='import_github'),
    path('projects/<int:pk>/edit/', views.edit_project, name='edit_project'),
    path('projects/<int:pk>/delete/', views.delete_project, name='delete_project'),
    path('search/', views.search_view, name='search'),
    path('export/', views.export_vault_data, name='export_vault_data'),
    
    path('secrets/', views.secrets_list, name='secrets'),
    path('secrets/add/', views.add_secret, name='add_secret'),
    path('secrets/<int:pk>/delete/', views.delete_secret, name='delete_secret'),

    path('snippets/', views.snippet_list, name='snippets'),
    path('snippets/add/', views.add_snippet, name='add_snippet'),
    path('snippets/<int:pk>/edit/', views.edit_snippet, name='edit_snippet'),
    path('snippets/<int:pk>/delete/', views.delete_snippet, name='delete_snippet'),


    path('jobs/', views.jobs_view, name='jobs'),
    path('jobs/<int:pk>/delete/', views.delete_job, name='delete_job'),
    path('connections/', views.connections_view, name='connections'),
    path('connections/<int:pk>/delete/', views.delete_connection, name='delete_connection'),
    path('blog/', views.blog_view, name='blog'),
    path('blog/<int:pk>/delete/', views.delete_blog, name='delete_blog'),

    path('linkedin-sync/', views.linkedin_sync, name='linkedin_sync'),


    path('theme/', views.theme_settings, name='theme_settings'),
    path('audit/', views.audit_log_view, name='audit_log'),
    path('share/', views.generate_link, name='generate_link'),
    path('s/<uuid:url_hash>/', views.view_shared_link, name='view_shared_link'),


    path('2fa/setup/', views.setup_2fa, name='setup_2fa'),
    path('2fa/verify/', views.verify_2fa, name='verify_2fa'),

]
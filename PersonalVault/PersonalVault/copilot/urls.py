from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.chat_view, name='chat'),
    path('analyze/', views.analyze_resume_view, name='analyze_resume'),
    path('cover-letter/', views.generate_cover_letter_view, name='cover_letter'),
    path('interview/', views.mock_interview_view, name='interview'),
    path('interview/api/', views.mock_interview_api, name='interview_api'),

    path('matcher/', views.job_matcher_view, name='job_matcher'),
    path('ideate/', views.idea_generator_view, name='idea_generator'),
    path('pitch/', views.pitch_generator_view, name='pitch_generator'),
    path('tech-explainer/', views.tech_explainer_view, name='tech_explainer'),
    path('optimize-snippet/', views.optimize_snippet_api, name='optimize_snippet_api'),
]

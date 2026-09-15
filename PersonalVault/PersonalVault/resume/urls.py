from django.urls import path
from . import views

urlpatterns = [
    path('', views.resume_view, name='resume_view'),
    path('delete/<int:pk>/', views.delete_resume, name='delete_resume'),
]
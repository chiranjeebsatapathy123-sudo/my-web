from django.urls import path
from . import views

urlpatterns = [
    path('', views.contact_view, name='contact_view'),
    path('delete/<int:pk>/', views.delete_contact_message, name='delete_contact_message'),
]
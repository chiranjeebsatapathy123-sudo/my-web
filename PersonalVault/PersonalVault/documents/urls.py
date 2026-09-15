from django.urls import path
from . import views

urlpatterns = [

    path('', views.document_list, name='document_list'),

    path('upload/', views.upload_document, name='upload_document'),
    path('<int:pk>/edit/', views.edit_document, name='edit_document'),
    path('<int:pk>/delete/', views.delete_document, name='delete_document'),


    path('<int:pk>/summarize/', views.summarize_document, name='summarize_document'),

]
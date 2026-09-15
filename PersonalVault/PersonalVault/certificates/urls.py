from django.urls import path
from . import views

urlpatterns = [

    path(
        '',
        views.certificate_list,
        name='certificate_list'
    ),

    path(
        'add/',
        views.add_certificate,
        name='add_certificate'
    ),

    path(
        '<int:pk>/edit/',
        views.edit_certificate,
        name='edit_certificate'
    ),

    path(
        '<int:pk>/delete/',
        views.delete_certificate,
        name='delete_certificate'
    ),

]
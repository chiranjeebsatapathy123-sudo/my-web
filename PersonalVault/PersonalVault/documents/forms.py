from django import forms
from .models import Document

class DocumentForm(forms.ModelForm):

    class Meta:
        model = Document
        fields = ['title', 'category', 'file']

        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., Semester 4 Marksheet / Passport Scan / Project Specification'
            }),

            'category': forms.Select(attrs={
                'class': 'form-select bg-dark text-white border-secondary'
            }),

            'file': forms.FileInput(attrs={
                'class': 'form-control'
            })
        }
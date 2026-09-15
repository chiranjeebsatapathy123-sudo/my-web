from django import forms
from .models import Document

class DocumentForm(forms.ModelForm):

    class Meta:
        model = Document
        fields = ['title', 'category', 'file']

        widgets = {
            'title': forms.TextInput(attrs={
                'class':'form-control'
            }),

            'category': forms.Select(attrs={
                'class':'form-select'
            }),

            'file': forms.FileInput(attrs={
                'class':'form-control'
            })
        }
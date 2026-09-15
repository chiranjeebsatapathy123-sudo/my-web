from django import forms
from .models import Profile, Project, Snippet

class ProfileForm(forms.ModelForm):

    class Meta:
        model = Profile

        fields = [
            'profile_image',
            'phone',
            'location',
            'bio',
            'github',
            'linkedin',
            'website',
            'leetcode_username',
            'hackerrank_username',
        ]

        widgets = {

            'phone': forms.TextInput(attrs={
                'class':'form-control'
            }),

            'location': forms.TextInput(attrs={
                'class':'form-control'
            }),

            'bio': forms.Textarea(attrs={
                'class':'form-control'
            }),

            'github': forms.URLInput(attrs={
                'class':'form-control'
            }),

            'linkedin': forms.URLInput(attrs={
                'class':'form-control'
            }),

            'website': forms.URLInput(attrs={
                'class':'form-control'
            }),
        }
        from .models import Project

class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = [
            'title',
            'description',
            'image',
            'github_link',
            'live_demo'
        ]

        widgets = {
            'title': forms.TextInput(attrs={'class':'form-control'}),
            'description': forms.Textarea(attrs={'class':'form-control'}),
            'github_link': forms.URLInput(attrs={'class':'form-control'}),
            'live_demo': forms.URLInput(attrs={'class':'form-control'}),
        }

class SnippetForm(forms.ModelForm):
    class Meta:
        model = Snippet
        fields = ['title', 'language', 'code_content', 'tags']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Snippet Title'}),
            'language': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., Python, JavaScript'}),
            'code_content': forms.Textarea(attrs={'class': 'form-control text-monospace', 'rows': 10}),
            'tags': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Comma-separated tags'}),
        }
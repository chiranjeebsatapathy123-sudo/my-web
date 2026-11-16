from django import forms
from .models import Profile, Project, Snippet, Skill

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

            'leetcode_username': forms.TextInput(attrs={
                'class':'form-control',
                'placeholder':'e.g. chiranjeeb_dev'
            }),

            'hackerrank_username': forms.TextInput(attrs={
                'class':'form-control',
                'placeholder':'e.g. chiranjeeb_satapathy'
            }),
        }

class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = [
            'title',
            'description',
            'image',
            'github_link',
            'live_demo',
            'technologies',
        ]

        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., AI-Powered Personal Vault & Portfolio'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 5,
                'placeholder': 'Describe your project, architecture, key features, and implementation...'
            }),
            'image': forms.FileInput(attrs={
                'class': 'form-control'
            }),
            'github_link': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://github.com/username/repository'
            }),
            'live_demo': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://my-app.vercel.app'
            }),
            'technologies': forms.SelectMultiple(attrs={
                'class': 'form-select bg-dark text-white border-secondary',
                'size': 6
            }),
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        self.user = user
        super().__init__(*args, **kwargs)
        if user:
            self.fields['technologies'].queryset = Skill.objects.filter(user=user)
        self.fields['github_link'].required = False
        self.fields['live_demo'].required = False
        self.fields['technologies'].required = False
        self.fields['technologies'].help_text = 'Hold Ctrl (or Cmd on Mac) to select multiple technologies.'

    def clean_github_link(self):
        link = (self.cleaned_data.get('github_link') or '').strip()
        if link and self.user:
            existing = Project.objects.filter(user=self.user, github_link=link)
            if self.instance and self.instance.pk:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise forms.ValidationError(f"A project with repository URL '{link}' already exists in your vault. Use Edit to update it.")
        return link

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
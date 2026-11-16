from django import forms
from .models import Certificate

class CertificateForm(forms.ModelForm):

    class Meta:
        model = Certificate

        fields = [
            'title',
            'organization',
            'issue_date',
            'certificate_image',
            'description',
            'credential_url'
        ]

        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., Deep Learning Specialization / AWS Certified Cloud Practitioner'
            }),

            'organization': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., Coursera, DeepLearning.AI / Amazon Web Services'
            }),

            'issue_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),

            'certificate_image': forms.FileInput(attrs={
                'class': 'form-control'
            }),

            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Brief description of core competencies and verified skills...'
            }),

            'credential_url': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://coursera.org/verify/... or https://skillsboost.google/...'
            }),
        }
from django import forms
from .models import Certificate

class CertificateForm(forms.ModelForm):

    class Meta:
        model = Certificate

        fields = [
            'title',
            'organization',
            'issue_date',
            'certificate_image'
        ]

        widgets = {
            'title': forms.TextInput(attrs={
                'class':'form-control'
            }),

            'organization': forms.TextInput(attrs={
                'class':'form-control'
            }),

            'issue_date': forms.DateInput(attrs={
                'class':'form-control',
                'type':'date'
            }),

            'certificate_image': forms.FileInput(attrs={
                'class':'form-control'
            }),
        }
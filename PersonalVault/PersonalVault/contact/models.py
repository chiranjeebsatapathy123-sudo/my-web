from django.db import models


class Contact(models.Model):

    name = models.CharField(max_length=100)

    email = models.EmailField()

    subject = models.CharField(max_length=200)

    INQUIRY_CHOICES = [
        ('Job Opportunity', 'Job Opportunity'),
        ('Internship Opportunity', 'Internship Opportunity'),
        ('Freelance / Client', 'Freelance / Client'),
        ('Collaboration', 'Collaboration'),
        ('Project Discussion', 'Project Discussion'),
        ('Technical Discussion', 'Technical Discussion'),
        ('General Inquiry', 'General Inquiry'),
    ]
    inquiry_type = models.CharField(max_length=50, choices=INQUIRY_CHOICES, default='General Inquiry')

    message = models.TextField()

    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
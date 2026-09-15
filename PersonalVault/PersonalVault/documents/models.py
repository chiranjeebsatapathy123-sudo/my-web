from django.db import models
from django.contrib.auth.models import User


class Document(models.Model):

    CATEGORY_CHOICES = [

        ('Resume', 'Resume'),
        ('Certificate', 'Certificate'),
        ('Marksheet', 'Marksheet'),
        ('ID Proof', 'ID Proof'),
        ('Notes', 'Notes'),
        ('Other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    title = models.CharField(max_length=200)

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES
    )

    file = models.FileField(upload_to='documents/')

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
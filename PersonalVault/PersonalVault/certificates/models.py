from django.db import models
from django.contrib.auth.models import User


class Certificate(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    title = models.CharField(max_length=200)

    organization = models.CharField(max_length=200)

    issue_date = models.DateField()

    certificate_image = models.ImageField(upload_to='certificates/')

    description = models.TextField(blank=True, default='')

    credential_url = models.URLField(blank=True, default='')

    def __str__(self):
        return self.title
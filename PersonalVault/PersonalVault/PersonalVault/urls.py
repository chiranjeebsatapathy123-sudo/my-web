from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    path('', include('portfolio.urls')),
    path('accounts/', include('accounts.urls')),
    path('dashboard/', include('dashboard.urls')),
    path('documents/', include('documents.urls')),
    path('certificates/', include('certificates.urls')),
    path('resume/', include('resume.urls')),
    path('contact/', include('contact.urls')),
    path('copilot/', include('copilot.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
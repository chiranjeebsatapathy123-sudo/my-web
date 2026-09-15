
from portfolio.models import AuditLog
class AuditLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    def __call__(self, request):
        response = self.get_response(request)
        if request.user.is_authenticated and request.method in ['POST', 'PUT', 'DELETE']:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
            try:
                AuditLog.objects.create(user=request.user, action=f"{request.method} {request.path}", ip_address=ip)
            except:
                pass
        return response

from django.shortcuts import redirect
from django.urls import resolve
from .models import TwoFactorAuth

class TwoFactorMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            # Check if 2FA is enabled
            tfa = TwoFactorAuth.objects.filter(user=request.user).first()
            if tfa and tfa.is_enabled and not request.session.get('2fa_verified', False):
                current_url_name = resolve(request.path_info).url_name
                # Exclude static/media/admin and the 2fa verification/logout urls itself
                allowed_urls = ['verify_2fa', 'logout', 'setup_2fa']
                if current_url_name not in allowed_urls and not request.path.startswith('/admin/'):
                    request.session['next_url_after_2fa'] = request.path
                    return redirect('verify_2fa')
        return self.get_response(request)


from portfolio.models import ThemePreference
def theme_processor(request):
    if request.user.is_authenticated:
        pref, _ = ThemePreference.objects.get_or_create(user=request.user)
        return {'theme_pref': pref}
    return {}

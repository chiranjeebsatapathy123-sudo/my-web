from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.contrib import messages
from .models import Contact
from .forms import ContactForm

from django.http import JsonResponse

def contact_view(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.headers.get('accept') == 'application/json':
                return JsonResponse({'success': True, 'message': 'Message sent successfully.'})
            messages.success(request, 'Thank you! Your message has been sent successfully.')
            return redirect('contact_view')
        else:
            if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.headers.get('accept') == 'application/json':
                return JsonResponse({'success': False, 'errors': form.errors})
    else:
        form = ContactForm()
        
    return render(request, 'contact/contact.html', {'form': form})

@login_required
@require_POST
def delete_contact_message(request, pk):
    message = get_object_or_404(Contact, pk=pk)
    message.delete()
    messages.success(request, 'Contact message deleted successfully.')
    return redirect('dashboard')

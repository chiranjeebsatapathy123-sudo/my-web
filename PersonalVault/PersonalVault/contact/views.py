from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.contrib import messages
from .models import Contact
from .forms import ContactForm

@login_required
def contact_view(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Thank you! Your message has been sent successfully. We will get back to you shortly.')
            return redirect('contact_view')
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

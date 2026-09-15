from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.contrib import messages

from .models import Certificate
from .forms import CertificateForm


def certificate_list(request):
    if request.user.is_authenticated:
        certificates = Certificate.objects.filter(
            user=request.user
        )
    else:
        from django.contrib.auth.models import User
        superuser = User.objects.filter(is_superuser=True).first()
        if superuser:
            certificates = Certificate.objects.filter(user=superuser)
        else:
            certificates = Certificate.objects.none()

    return render(
        request,
        'certificates/certificate_list.html',
        {
            'certificates': certificates
        }
    )


@login_required
def add_certificate(request):

    if request.method == 'POST':

        form = CertificateForm(
            request.POST,
            request.FILES
        )

        if form.is_valid():

            certificate = form.save(commit=False)

            certificate.user = request.user

            certificate.save()

            messages.success(request, 'Certificate added successfully!')
            return redirect('certificate_list')

    else:

        form = CertificateForm()

    return render(
        request,
        'certificates/add_certificate.html',
        {
            'form': form
        }
    )


@login_required
def edit_certificate(request, pk):
    certificate = get_object_or_404(Certificate, pk=pk, user=request.user)

    if request.method == 'POST':
        form = CertificateForm(request.POST, request.FILES, instance=certificate)
        if form.is_valid():
            form.save()
            messages.success(request, 'Certificate updated successfully!')
            return redirect('certificate_list')
    else:
        form = CertificateForm(instance=certificate)

    return render(
        request,
        'certificates/edit_certificate.html',
        {
            'form': form,
            'certificate': certificate
        }
    )


@login_required
@require_POST
def delete_certificate(request, pk):
    certificate = get_object_or_404(Certificate, pk=pk, user=request.user)
    if certificate.certificate_image:
        certificate.certificate_image.delete(save=False)
    certificate.delete()
    messages.success(request, 'Certificate deleted successfully!')
    return redirect('certificate_list')
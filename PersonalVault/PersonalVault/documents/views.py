from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.contrib import messages

from .models import Document
from .forms import DocumentForm


@login_required
def document_list(request):

    documents = Document.objects.filter(user=request.user)

    return render(
        request,
        'documents/document_list.html',
        {'documents':documents}
    )


@login_required
def upload_document(request):

    if request.method == "POST":

        form = DocumentForm(request.POST, request.FILES)

        if form.is_valid():

            document = form.save(commit=False)

            document.user = request.user

            document.save()

            return redirect('document_list')

    else:

        form = DocumentForm()

    return render(
        request,
        'documents/upload_document.html',
        {'form':form}
    )


@login_required
def edit_document(request, pk):
    document = get_object_or_404(Document, pk=pk, user=request.user)

    if request.method == "POST":
        old_file = document.file
        form = DocumentForm(request.POST, request.FILES, instance=document)
        if form.is_valid():
            new_file = request.FILES.get('file')
            if new_file and old_file:
                try:
                    import os
                    if os.path.isfile(old_file.path) and 'chiranjeeb_resume.pdf' not in old_file.path:
                        os.remove(old_file.path)
                except Exception:
                    pass
            form.save()
            messages.success(request, 'Document updated successfully!')
            return redirect('document_list')
    else:
        form = DocumentForm(instance=document)

    return render(
        request,
        'documents/edit_document.html',
        {'form': form, 'document': document}
    )


@login_required
@require_POST
def delete_document(request, pk):
    document = get_object_or_404(Document, pk=pk, user=request.user)
    if document.file:
        document.file.delete(save=False)
    document.delete()
    messages.success(request, 'Document deleted successfully!')
    return redirect('document_list')
from django.conf import settings
from django.http import HttpResponse

@login_required
def summarize_document(request, pk):
    doc = get_object_or_404(Document, pk=pk, user=request.user)
    try:
        from google import genai
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        uploaded_file = client.files.upload(file=doc.file.path)
        prompt = """You are an expert assistant. Read this document and provide a 3-bullet executive summary and key takeaways. Format beautifully in Markdown."""
        model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-3.5-flash-lite')
        response = client.models.generate_content(
            model=model_name,
            contents=[uploaded_file, prompt]
        )
        return render(request, 'documents/summary.html', {'summary': response.text, 'doc': doc})
    except Exception as e:
        messages.error(request, f"Could not summarize document: {str(e)}")
        return redirect('document_list')

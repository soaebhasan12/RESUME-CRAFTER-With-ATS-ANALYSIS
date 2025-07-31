from django.db import transaction
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.shortcuts import render, redirect, get_object_or_404
from django.template.loader import render_to_string
from django.http import HttpResponse
from django.contrib import messages
from django.conf import settings
from django.urls import reverse
from django.http import JsonResponse
from django.template.loader import get_template
from django.contrib import messages
from django.contrib import admin
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
import json
import os




from .models import (
    Resume, BasicDetails, SocialLink, Skill, Education, Experience,
    Responsibility, Achievement, Certificate, Project
)


from accounts.models import User


User = get_user_model()     # Gets your custom RegisterUser model


# Resume Management Views
@login_required
def create_resume(request):
    if request.method == 'POST':
        title = request.POST.get('title', 'Untitled Resume')
        template = request.POST.get('template', 'template1')
        
        resume = Resume.objects.create(
            user=request.user,
            title=title,
            template=template
        )
        
        # Create basic details with default values
        BasicDetails.objects.create(
            resume=resume,
            full_name=request.user.username,
            email=request.user.email
        )
        
        messages.success(request, "Resume created successfully!")
        return redirect('edit_resume', resume_id=resume.id)
    
    return render(request, 'resumes/create_resume.html')


@login_required
def edit_resume(request, resume_id):
    resume = get_object_or_404(Resume, id=resume_id, user=request.user)
    
    if request.method == 'POST':
        # Handle form submissions for different sections
        section = request.POST.get('section')
        
        if section == 'basic_details':
            basic_details = resume.basic_details
            basic_details.full_name = request.POST.get('full_name', '')
            basic_details.email = request.POST.get('email', '')
            basic_details.phone = request.POST.get('phone', '')
            basic_details.summary = request.POST.get('summary', '')
            basic_details.save()
            messages.success(request, "Basic details updated!")
            
        elif section == 'education':
            education_id = request.POST.get('education_id')
            if education_id:
                education = get_object_or_404(Education, id=education_id, resume=resume)
            else:
                education = Education(resume=resume)
                
            education.institution = request.POST.get('institution', '')
            education.degree = request.POST.get('degree', '')
            education.field_of_study = request.POST.get('field_of_study', '')
            education.start_year = request.POST.get('start_year', '')
            education.end_year = request.POST.get('end_year', '')
            education.currently_studying = request.POST.get('currently_studying') == 'on'
            education.gpa = request.POST.get('gpa', '')
            education.description = request.POST.get('description', '')
            education.save()
            messages.success(request, "Education updated!")
            
        # Add similar handling for other sections (experience, skills, etc.)
        
        return redirect('edit_resume', resume_id=resume.id)
    
    context = {
        'resume': resume,
        'educations': resume.educations.all(),
        'experiences': resume.experiences.all(),
        'skills': resume.skills.all(),
        'projects': resume.projects.all(),
        'certificates': resume.certificates.all(),
        'achievements': resume.achievements.all(),
        'social_links': resume.social_links.all(),
    }
    return render(request, 'edit_resume.html', context)


@login_required
def delete_resume(request, resume_id):
    resume = get_object_or_404(Resume, id=resume_id, user=request.user)
    if request.method == 'POST':
        resume.delete()
        messages.success(request, "Resume deleted successfully!")
        return redirect('resume_list')
    return render(request, 'confirm_delete.html', {'resume': resume})


@login_required
def resume_list(request):
    resumes = Resume.objects.filter(user=request.user).order_by('-updated_at')
    return render(request, 'resumes/resume_list.html', {'resumes': resumes})


# PDF Generation View
@login_required
def generate_pdf(request, resume_id):
    resume = get_object_or_404(Resume, id=resume_id, user=request.user)
    
    context = {
        'resume': resume,
        'basic_details': resume.basic_details,
        'educations': resume.educations.all(),
        'experiences': resume.experiences.all(),
        'skills': resume.skills.all(),
        'projects': resume.projects.all(),
        'certificates': resume.certificates.all(),
        'achievements': resume.achievements.all(),
        'social_links': resume.social_links.all(),
    }

    html_string = render_to_string('resume_template.html', context)
    css_path = os.path.join(settings.BASE_DIR, 'static', 'css', 'resume.css')
    
    font_config = FontConfiguration()
    html = HTML(string=html_string, base_url=request.build_absolute_uri())
    
    try:
        pdf_file = html.write_pdf(
            stylesheets=[CSS(filename=css_path)],
            font_config=font_config
        )
    except Exception as e:
        pdf_file = html.write_pdf(font_config=font_config)

    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{resume.title}.pdf"'
    return response


# Profile Views
@login_required
def profile_view(request):
    profile = request.user.profile
    resumes = Resume.objects.filter(user=request.user).order_by('-updated_at')
    
    context = {
        'profile': profile,
        'resumes': resumes,
        'resume_count': resumes.count(),
    }
    return render(request, 'profile.html', context)


@login_required
def update_profile(request):
    if request.method == 'POST':
        profile = request.user.profile
        profile.phone = request.POST.get('phone', '')
        profile.location = request.POST.get('location', '')
        profile.linkedin_url = request.POST.get('linkedin_url', '')
        profile.github_url = request.POST.get('github_url', '')
        profile.bio = request.POST.get('bio', '')
        
        if 'profile_picture' in request.FILES:
            profile.profile_picture = request.FILES['profile_picture']
        
        profile.save()
        messages.success(request, 'Profile updated successfully!')
    
    return redirect('profile')


# Home View
def home_page(request):
    if request.user.is_authenticated:
        return redirect('resume_list')
    return render(request, 'home.html')







@login_required
def update_resume_template(request, resume_id):
    if request.method == 'POST':
        try:
            resume = Resume.objects.get(id=resume_id, user=request.user)
            data = json.loads(request.body)
            resume.template = data.get('template')
            resume.save()
            return JsonResponse({'success': True})
        except Resume.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Resume not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)


@login_required
def preview_template(request):
    template_name = request.GET.get('template', 'professional')
    # Render a preview of the template
    return render(request, f'resume/templates/{template_name}_preview.html')


@login_required
def duplicate_resume(request, resume_id):
    resume = get_object_or_404(Resume, id=resume_id, user=request.user)
    new_resume = Resume.objects.create(
        user=request.user,
        title=f"{resume.title} (Copy)",
        template=resume.template
    )
    # Copy all related objects (basic details, education, etc.)
    messages.success(request, "Resume duplicated successfully!")
    return redirect('edit_resume', resume_id=new_resume.id)
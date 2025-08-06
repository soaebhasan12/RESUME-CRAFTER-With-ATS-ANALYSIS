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
@transaction.atomic
def create_resume(request):
    if request.method == 'POST':
        try:
            # Create new resume
            resume = Resume.objects.create(
                user=request.user,
                title=request.POST.get('title', 'Untitled Resume')
            )
            
            # Create basic details
            BasicDetails.objects.create(
                resume=resume,
                full_name=request.POST.get('full_name', ''),
                email=request.POST.get('email', ''),
                phone=request.POST.get('phone', ''),
                summary=request.POST.get('summary', '')
            )
            
            return redirect('resumes:edit_resume', resume_id=resume.id)
            
        except Exception as e:
            messages.error(request, f"Error creating resume: {str(e)}")
            return redirect('resumes:create_resume')
    
    return render(request, 'resumes/create_resume.html', {
        'creating_new': True,
        'resume': None
    })




@login_required
def edit_resume(request, resume_id):
    resume = get_object_or_404(Resume, id=resume_id, user=request.user)
    
    if request.method == 'POST':
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            # Handle preview request
            context = {
                'resume': resume,
                'basic_details': {
                    'full_name': request.POST.get('full_name', ''),
                    'email': request.POST.get('email', ''),
                    'phone': request.POST.get('phone', ''),
                    'summary': request.POST.get('summary', ''),
                },
                'skills': zip(
                    request.POST.getlist('skill_names[]'),
                    request.POST.getlist('skill_levels[]')
                ),
                'educations': zip(
                    request.POST.getlist('education_institutions[]'),
                    request.POST.getlist('education_degrees[]'),
                    request.POST.getlist('education_fields[]'),
                    request.POST.getlist('education_start_years[]'),
                    request.POST.getlist('education_end_years[]'),
                    request.POST.getlist('education_current[]'),
                    request.POST.getlist('education_descriptions[]')
                )
            }
            preview_html = render_to_string('resumes/resume_preview.html', context)
            return JsonResponse({'preview_html': preview_html})
        
        # Handle form submission
        return _handle_form_submission(request, resume)
    
    return render(request, 'resumes/create_resume.html', {
        'resume': resume,
        'creating_new': False
    })

def _handle_form_submission(request, resume):
    section = request.POST.get('section')
    
    if section == 'basic_details':
        basic_details = resume.basic_details
        basic_details.full_name = request.POST.get('full_name', '')
        basic_details.email = request.POST.get('email', '')
        basic_details.phone = request.POST.get('phone', '')
        basic_details.summary = request.POST.get('summary', '')
        basic_details.save()
    
    elif section == 'skills':
        # Handle skills updates
        pass
    
    # Add other section handlers
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'status': 'success'})
    return redirect('resumes:edit_resume', resume_id=resume.id)



@login_required
def delete_resume(request, resume_id):
    resume = get_object_or_404(Resume, id=resume_id, user=request.user)
    if request.method == 'POST':
        resume.delete()
        messages.success(request, "Resume deleted successfully!")
        return redirect('resumes:resume_list')
    
    return render(request, 'resumes/resume_list.html', {'resumes': Resume.objects.filter(user=request.user)})


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

    html_string = render_to_string('resumes/resume_preview.html', context)
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
def preview_resume(request):
    template_name = request.GET.get('template', 'resumes/resume_templates/temp_1')
    
    # Create sample data if no resume exists
    if not Resume.objects.filter(user=request.user).exists():
        context = {
            'template_name': template_name,
            'template_path': f'resumes/resume_templates/{template_name}.html',
            'basic_details': {
                'full_name': f"{request.user.first_name} {request.user.last_name}",
                'email': request.user.email,
                'phone': "+1234567890",
                'summary': "Experienced professional with demonstrated skills..."
            },
            'skills': [("Python", "Advanced"), ("Django", "Expert")],
            'educations': [("University", "Bachelor", "Computer Science", "2018", "2022", False, "Graduated with honors")],
            'is_preview': True
        }
    else:
        resume = Resume.objects.filter(user=request.user).first()
        context = {
            'template_name': template_name,
            'template_path': f'resumes/resume_templates/{template_name}.html',
            'resume': resume,
            'basic_details': resume.basic_details,
            'skills': [(skill.name, skill.category) for skill in resume.skills.all()],
            'educations': [(edu.institution, edu.get_degree_display(), edu.field_of_study, 
                          edu.start_year, edu.end_year, edu.currently_studying, edu.description) 
                         for edu in resume.educations.all()],
            'is_preview': True
        }
    
    return render(request, 'resumes/resume_preview.html', context)


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
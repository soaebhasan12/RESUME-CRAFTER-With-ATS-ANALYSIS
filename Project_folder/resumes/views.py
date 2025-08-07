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
        try:
            # Create or update resume
            resume_id = request.POST.get('resume_id')
            if resume_id:
                resume = get_object_or_404(Resume, id=resume_id, user=request.user)
                resume.title = request.POST.get('title', 'Untitled Resume')
                resume.template = request.POST.get('template', 'temp_1')
                resume.save()
            else:
                resume = Resume.objects.create(
                    user=request.user,
                    title=request.POST.get('title', 'Untitled Resume'),
                    template=request.POST.get('template', 'temp_1')
                )
            
            # Create or update basic details
            basic_details, created = BasicDetails.objects.update_or_create(
                resume=resume,
                defaults={
                    'full_name': request.POST.get('full_name', ''),
                    'email': request.POST.get('email', ''),
                    'phone': request.POST.get('phone', ''),
                    'summary': request.POST.get('summary', ''),
                    'avatar': request.POST.get('avatar', None)
                }
            )
            
            # Handle skills
            existing_skill_ids = [int(id) for id in request.POST.getlist('skill_ids[]') if id]
            Skill.objects.filter(resume=resume).exclude(id__in=existing_skill_ids).delete()
            
            skill_names = request.POST.getlist('skill_names[]')
            skill_categories = request.POST.getlist('skill_categories[]')
            
            for i, skill_name in enumerate(skill_names):
                if skill_name:  # Only save if name is provided
                    skill_id = request.POST.getlist('skill_ids[]')[i] if i < len(request.POST.getlist('skill_ids[]')) else None
                    if skill_id:
                        skill = Skill.objects.get(id=skill_id)
                        skill.name = skill_name
                        skill.category = skill_categories[i] if i < len(skill_categories) else None
                        skill.save()
                    else:
                        Skill.objects.create(
                            resume=resume,
                            name=skill_name,
                            category=skill_categories[i] if i < len(skill_categories) else None
                        )
            
            # Handle education
            existing_edu_ids = [int(id) for id in request.POST.getlist('education_ids[]') if id]
            Education.objects.filter(resume=resume).exclude(id__in=existing_edu_ids).delete()
            
            institutions = request.POST.getlist('education_institutions[]')
            degrees = request.POST.getlist('education_degrees[]')
            fields = request.POST.getlist('education_fields[]')
            start_years = request.POST.getlist('education_start_years[]')
            end_years = request.POST.getlist('education_end_years[]')
            current_statuses = request.POST.getlist('education_current[]')
            descriptions = request.POST.getlist('education_descriptions[]')
            gpas = request.POST.getlist('education_gpas[]')
            percentages = request.POST.getlist('education_percentages[]')
            
            for i, institution in enumerate(institutions):
                if institution:
                    edu_id = request.POST.getlist('education_ids[]')[i] if i < len(request.POST.getlist('education_ids[]')) else None
                    current = True if f'education_current_{i}' in request.POST else False
                    
                    edu_data = {
                        'institution': institution,
                        'degree': degrees[i] if i < len(degrees) else 'bachelors',
                        'field_of_study': fields[i] if i < len(fields) else '',
                        'start_year': start_years[i] if i < len(start_years) else None,
                        'end_year': end_years[i] if i < len(end_years) and not current else None,
                        'currently_studying': current,
                        'description': descriptions[i] if i < len(descriptions) else '',
                        'gpa': gpas[i] if i < len(gpas) and gpas[i] else None,
                        'percentage': percentages[i] if i < len(percentages) and percentages[i] else None
                    }
                    
                    if edu_id:
                        Education.objects.filter(id=edu_id).update(**edu_data)
                    else:
                        Education.objects.create(resume=resume, **edu_data)
            
            # Handle experiences
            existing_exp_ids = [int(id) for id in request.POST.getlist('experience_ids[]') if id]
            Experience.objects.filter(resume=resume).exclude(id__in=existing_exp_ids).delete()
            
            organizations = request.POST.getlist('experience_organizations[]')
            positions = request.POST.getlist('experience_positions[]')
            start_dates = request.POST.getlist('experience_start_dates[]')
            end_dates = request.POST.getlist('experience_end_dates[]')
            current_jobs = request.POST.getlist('experience_current[]')
            exp_descriptions = request.POST.getlist('experience_descriptions[]')
            
            for i, organization in enumerate(organizations):
                if organization:
                    exp_id = request.POST.getlist('experience_ids[]')[i] if i < len(request.POST.getlist('experience_ids[]')) else None
                    current = True if f'experience_current_{i}' in request.POST else False
                    
                    exp_data = {
                        'organization': organization,
                        'position': positions[i] if i < len(positions) else '',
                        'start_date': start_dates[i] if i < len(start_dates) else None,
                        'end_date': end_dates[i] if i < len(end_dates) and not current else None,
                        'currently_working': current,
                        'description': exp_descriptions[i] if i < len(exp_descriptions) else ''
                    }
                    
                    if exp_id:
                        Experience.objects.filter(id=exp_id).update(**exp_data)
                    else:
                        exp = Experience.objects.create(resume=resume, **exp_data)
                        
                        # Handle responsibilities
                        resp_descriptions = request.POST.getlist(f'responsibilities_{i}[]')
                        for desc in resp_descriptions:
                            if desc:
                                Responsibility.objects.create(
                                    experience=exp,
                                    description=desc
                                )
            
            # Handle projects
            existing_project_ids = [int(id) for id in request.POST.getlist('project_ids[]') if id]
            Project.objects.filter(resume=resume).exclude(id__in=existing_project_ids).delete()
            
            project_titles = request.POST.getlist('project_titles[]')
            project_start_dates = request.POST.getlist('project_start_dates[]')
            project_end_dates = request.POST.getlist('project_end_dates[]')
            project_urls = request.POST.getlist('project_urls[]')
            project_descriptions = request.POST.getlist('project_descriptions[]')
            
            for i, title in enumerate(project_titles):
                if title:
                    project_id = request.POST.getlist('project_ids[]')[i] if i < len(request.POST.getlist('project_ids[]')) else None
                    
                    project_data = {
                        'title': title,
                        'start_date': project_start_dates[i] if i < len(project_start_dates) else None,
                        'end_date': project_end_dates[i] if i < len(project_end_dates) else None,
                        'project_url': project_urls[i] if i < len(project_urls) else '',
                        'description': project_descriptions[i] if i < len(project_descriptions) else ''
                    }
                    
                    if project_id:
                        Project.objects.filter(id=project_id).update(**project_data)
                    else:
                        Project.objects.create(resume=resume, **project_data)
            
            # Handle certificates
            existing_cert_ids = [int(id) for id in request.POST.getlist('certificate_ids[]') if id]
            Certificate.objects.filter(resume=resume).exclude(id__in=existing_cert_ids).delete()
            
            cert_titles = request.POST.getlist('certificate_titles[]')
            issuing_orgs = request.POST.getlist('certificate_issuers[]')
            issue_dates = request.POST.getlist('certificate_issue_dates[]')
            expiry_dates = request.POST.getlist('certificate_expiry_dates[]')
            credential_ids = request.POST.getlist('certificate_credential_ids[]')
            credential_urls = request.POST.getlist('certificate_urls[]')
            cert_descriptions = request.POST.getlist('certificate_descriptions[]')
            
            for i, title in enumerate(cert_titles):
                if title:
                    cert_id = request.POST.getlist('certificate_ids[]')[i] if i < len(request.POST.getlist('certificate_ids[]')) else None
                    
                    cert_data = {
                        'title': title,
                        'issuing_organization': issuing_orgs[i] if i < len(issuing_orgs) else '',
                        'issue_date': issue_dates[i] if i < len(issue_dates) else None,
                        'expiration_date': expiry_dates[i] if i < len(expiry_dates) else None,
                        'credential_id': credential_ids[i] if i < len(credential_ids) else '',
                        'credential_url': credential_urls[i] if i < len(credential_urls) else '',
                        'description': cert_descriptions[i] if i < len(cert_descriptions) else ''
                    }
                    
                    if cert_id:
                        Certificate.objects.filter(id=cert_id).update(**cert_data)
                    else:
                        Certificate.objects.create(resume=resume, **cert_data)
            
            # Handle achievements
            existing_ach_ids = [int(id) for id in request.POST.getlist('achievement_ids[]') if id]
            Achievement.objects.filter(resume=resume).exclude(id__in=existing_ach_ids).delete()
            
            achievement_titles = request.POST.getlist('achievement_titles[]')
            achievement_dates = request.POST.getlist('achievement_dates[]')
            achievement_descriptions = request.POST.getlist('achievement_descriptions[]')
            
            for i, title in enumerate(achievement_titles):
                if title:
                    ach_id = request.POST.getlist('achievement_ids[]')[i] if i < len(request.POST.getlist('achievement_ids[]')) else None
                    
                    ach_data = {
                        'title': title,
                        'date': achievement_dates[i] if i < len(achievement_dates) else None,
                        'description': achievement_descriptions[i] if i < len(achievement_descriptions) else ''
                    }
                    
                    if ach_id:
                        Achievement.objects.filter(id=ach_id).update(**ach_data)
                    else:
                        Achievement.objects.create(resume=resume, **ach_data)
            
            # Handle social links
            existing_link_ids = [int(id) for id in request.POST.getlist('social_link_ids[]') if id]
            SocialLink.objects.filter(resume=resume).exclude(id__in=existing_link_ids).delete()
            
            platforms = request.POST.getlist('social_platforms[]')
            urls = request.POST.getlist('social_urls[]')
            
            for i, platform in enumerate(platforms):
                if platform and urls[i]:
                    link_id = request.POST.getlist('social_link_ids[]')[i] if i < len(request.POST.getlist('social_link_ids[]')) else None
                    
                    if link_id:
                        SocialLink.objects.filter(id=link_id).update(
                            platform=platform,
                            url=urls[i]
                        )
                    else:
                        SocialLink.objects.create(
                            resume=resume,
                            platform=platform,
                            url=urls[i]
                        )
            
            messages.success(request, "Resume saved successfully!")
            return redirect('resumes:edit_resume', resume_id=resume.id)
            
        except Exception as e:
            messages.error(request, f"Error saving resume: {str(e)}")
            return redirect('resumes:create_resume')
    
    # For GET request
    return render(request, 'resumes/create_resume.html', {
        'creating_new': True,
        'resume': None,
        'template_choices': Resume.TEMPLATE_CHOICES
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
    template_name = request.GET.get('template', 'temp_1_preview')
    
    # Create sample resume data structure
    sample_resume = {
        'title': "Sample Resume",
        'template': template_name,
        'basic_details': {
            'full_name': "John Doe",
            'email': "john.doe@example.com",
            'phone': "+1 (555) 123-4567",
            'summary': "Experienced professional with 5+ years in the industry. Skilled in various technologies and passionate about creating efficient solutions."
        },
        'skills': [
            {'name': "Python", 'category': "technical"},
            {'name': "Project Management", 'category': "soft"},
            {'name': "English", 'category': "language"}
        ],
        'educations': [{
            'institution': "University of Technology",
            'degree': "bachelors",
            'field_of_study': "Computer Science",
            'start_year': "2015",
            'end_year': "2019",
            'currently_studying': False,
            'gpa': "3.8",
            'description': "Graduated with honors"
        }],
        'experiences': [{
            'organization': "Tech Solutions Inc.",
            'position': "Senior Developer",
            'start_date': "2020-01-01",
            'currently_working': True,
            'description': "Led a team of 5 developers to deliver enterprise solutions",
            'responsibilities': [
                "Developed core application features",
                "Mentored junior team members",
                "Implemented CI/CD pipeline"
            ]
        }]
    }
    
    context = {
        'template_name': template_name,
        'template_path': f'resumes/resume_templates/{template_name}.html',
        'resume': sample_resume,
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
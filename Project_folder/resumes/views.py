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
            with transaction.atomic():
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
                avatar = None
                if 'avatar' in request.FILES:
                    avatar = request.FILES['avatar']
                elif 'avatar' in request.POST and request.POST['avatar']:
                    avatar = request.POST['avatar']
                
                basic_details, created = BasicDetails.objects.update_or_create(
                    resume=resume,
                    defaults={
                        'full_name': request.POST.get('full_name', ''),
                        'email': request.POST.get('email', ''),
                        'phone': request.POST.get('phone', ''),
                        'summary': request.POST.get('summary', ''),
                        'avatar': avatar
                    }
                )
                
                # Handle skills
                Skill.objects.filter(resume=resume).delete()
                skill_names = request.POST.getlist('skill_names[]')
                skill_categories = request.POST.getlist('skill_categories[]')
                
                for name, category in zip(skill_names, skill_categories):
                    if name:  # Only save if name is provided
                        Skill.objects.create(
                            resume=resume,
                            name=name,
                            category=category
                        )
                
                # Handle education
                Education.objects.filter(resume=resume).delete()
                institutions = request.POST.getlist('education_institutions[]')
                degrees = request.POST.getlist('education_degrees[]')
                fields = request.POST.getlist('education_fields[]')
                start_years = request.POST.getlist('education_start_years[]')
                end_years = request.POST.getlist('education_end_years[]')
                current_statuses = request.POST.getlist('education_current[]')
                descriptions = request.POST.getlist('education_descriptions[]')
                gpas = request.POST.getlist('education_gpas[]')
                percentages = request.POST.getlist('education_percentages[]')
                
                for i in range(len(institutions)):
                    if institutions[i]:
                        Education.objects.create(
                            resume=resume,
                            institution=institutions[i],
                            degree=degrees[i] if i < len(degrees) else 'bachelors',
                            field_of_study=fields[i] if i < len(fields) else '',
                            start_year=start_years[i] if i < len(start_years) else None,
                            end_year=end_years[i] if (i < len(end_years) and not current_statuses[i]) else None,
                            currently_studying=bool(current_statuses[i]),
                            description=descriptions[i] if i < len(descriptions) else '',
                            gpa=gpas[i] if i < len(gpas) and gpas[i] else None,
                            percentage=percentages[i] if i < len(percentages) and percentages[i] else None
                        )
                
                # Handle experiences
                Experience.objects.filter(resume=resume).delete()
                organizations = request.POST.getlist('experience_organizations[]')
                positions = request.POST.getlist('experience_positions[]')
                start_dates = request.POST.getlist('experience_start_dates[]')
                end_dates = request.POST.getlist('experience_end_dates[]')
                current_jobs = request.POST.getlist('experience_current[]')
                exp_descriptions = request.POST.getlist('experience_descriptions[]')
                
                for i in range(len(organizations)):
                    if organizations[i]:
                        exp = Experience.objects.create(
                            resume=resume,
                            organization=organizations[i],
                            position=positions[i] if i < len(positions) else '',
                            start_date=start_dates[i] if i < len(start_dates) else None,
                            end_date=end_dates[i] if (i < len(end_dates) and not current_jobs[i]) else None,
                            currently_working=bool(current_jobs[i]),
                            description=exp_descriptions[i] if i < len(exp_descriptions) else ''
                        )
                        
                        # Handle responsibilities
                        resp_descriptions = request.POST.getlist(f'responsibility_descriptions[]')
                        for desc in resp_descriptions:
                            if desc:
                                Responsibility.objects.create(
                                    experience=exp,
                                    description=desc
                                )
                
                # Handle projects
                Project.objects.filter(resume=resume).delete()
                project_titles = request.POST.getlist('project_titles[]')
                project_start_dates = request.POST.getlist('project_start_dates[]')
                project_end_dates = request.POST.getlist('project_end_dates[]')
                project_urls = request.POST.getlist('project_urls[]')
                project_descriptions = request.POST.getlist('project_descriptions[]')
                
                for i in range(len(project_titles)):
                    if project_titles[i]:
                        Project.objects.create(
                            resume=resume,
                            title=project_titles[i],
                            start_date=project_start_dates[i] if i < len(project_start_dates) else None,
                            end_date=project_end_dates[i] if i < len(project_end_dates) else None,
                            project_url=project_urls[i] if i < len(project_urls) else '',
                            description=project_descriptions[i] if i < len(project_descriptions) else ''
                        )
                
                # Handle certificates
                Certificate.objects.filter(resume=resume).delete()
                cert_titles = request.POST.getlist('certificate_titles[]')
                issuing_orgs = request.POST.getlist('certificate_organizations[]')
                issue_dates = request.POST.getlist('certificate_issue_dates[]')
                expiry_dates = request.POST.getlist('certificate_expiration_dates[]')
                credential_ids = request.POST.getlist('certificate_ids[]')
                credential_urls = request.POST.getlist('certificate_urls[]')
                cert_descriptions = request.POST.getlist('certificate_descriptions[]')
                
                for i in range(len(cert_titles)):
                    if cert_titles[i]:
                        Certificate.objects.create(
                            resume=resume,
                            title=cert_titles[i],
                            issuing_organization=issuing_orgs[i] if i < len(issuing_orgs) else '',
                            issue_date=issue_dates[i] if i < len(issue_dates) else None,
                            expiration_date=expiry_dates[i] if i < len(expiry_dates) else None,
                            credential_id=credential_ids[i] if i < len(credential_ids) else '',
                            credential_url=credential_urls[i] if i < len(credential_urls) else '',
                            description=cert_descriptions[i] if i < len(cert_descriptions) else ''
                        )
                
                # Handle achievements
                Achievement.objects.filter(resume=resume).delete()
                achievement_titles = request.POST.getlist('achievement_titles[]')
                achievement_dates = request.POST.getlist('achievement_dates[]')
                achievement_descriptions = request.POST.getlist('achievement_descriptions[]')
                
                for i in range(len(achievement_titles)):
                    if achievement_titles[i]:
                        Achievement.objects.create(
                            resume=resume,
                            title=achievement_titles[i],
                            date=achievement_dates[i] if i < len(achievement_dates) else None,
                            description=achievement_descriptions[i] if i < len(achievement_descriptions) else ''
                        )
                
                # Handle social links
                SocialLink.objects.filter(resume=resume).delete()
                platforms = request.POST.getlist('social_platforms[]')
                urls = request.POST.getlist('social_urls[]')
                
                for i in range(len(platforms)):
                    if platforms[i] and urls[i]:
                        SocialLink.objects.create(
                            resume=resume,
                            platform=platforms[i],
                            url=urls[i]
                        )
                
                messages.success(request, "Resume saved successfully!")
                return JsonResponse({'success': True, 'resume_id': resume.id})
                
        except Exception as e:
            messages.error(request, f"Error saving resume: {str(e)}")
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    # For GET request
    return render(request, 'resumes/create_resume.html', {
        'creating_new': True,
        'resume': None,
        'TEMPLATE_CHOICES': Resume.TEMPLATE_CHOICES,
        'SKILL_CATEGORIES': Skill.SKILL_CATEGORIES,
        'DEGREE_CHOICES': Education.DEGREE_CHOICES
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
                    request.POST.getlist('skill_categories[]')
                ),
                'educations': zip(
                    request.POST.getlist('education_institutions[]'),
                    request.POST.getlist('education_degrees[]'),
                    request.POST.getlist('education_fields[]'),
                    request.POST.getlist('education_start_years[]'),
                    request.POST.getlist('education_end_years[]'),
                    request.POST.getlist('education_current[]'),
                    request.POST.getlist('education_descriptions[]')
                ),
                'experiences': [],  # Add similar for other sections
                'projects': [],     # Add similar for other sections
                'certificates': [], # Add similar for other sections
                'achievements': [], # Add similar for other sections
                'social_links': [] # Add similar for other sections
            }
            preview_html = render_to_string('resumes/resume_preview.html', context)
            return JsonResponse({'preview_html': preview_html})
        
        # Handle form submission
        return _handle_form_submission(request, resume)
    
    return render(request, 'resumes/create_resume.html', {
        'resume': resume,
        'creating_new': False,
        'TEMPLATE_CHOICES': Resume.TEMPLATE_CHOICES,
        'SKILL_CATEGORIES': Skill.SKILL_CATEGORIES,
        'DEGREE_CHOICES': Education.DEGREE_CHOICES
    })

def _handle_form_submission(request, resume):
    try:
        with transaction.atomic():
            # Update resume title and template
            resume.title = request.POST.get('title', resume.title)
            resume.template = request.POST.get('template', resume.template)
            resume.save()

            # Handle basic details
            avatar = None
            if 'avatar' in request.FILES:
                avatar = request.FILES['avatar']
            elif 'avatar' in request.POST and request.POST['avatar']:
                avatar = request.POST['avatar']
            
            basic_details, created = BasicDetails.objects.update_or_create(
                resume=resume,
                defaults={
                    'full_name': request.POST.get('full_name', ''),
                    'email': request.POST.get('email', ''),
                    'phone': request.POST.get('phone', ''),
                    'summary': request.POST.get('summary', ''),
                    'avatar': avatar
                }
            )

            # Handle skills
            Skill.objects.filter(resume=resume).delete()
            skill_names = request.POST.getlist('skill_names[]')
            skill_categories = request.POST.getlist('skill_categories[]')
            for name, category in zip(skill_names, skill_categories):
                if name:
                    Skill.objects.create(
                        resume=resume,
                        name=name,
                        category=category
                    )

            # Handle education
            Education.objects.filter(resume=resume).delete()
            institutions = request.POST.getlist('education_institutions[]')
            degrees = request.POST.getlist('education_degrees[]')
            fields = request.POST.getlist('education_fields[]')
            start_years = request.POST.getlist('education_start_years[]')
            end_years = request.POST.getlist('education_end_years[]')
            current_statuses = request.POST.getlist('education_current[]')
            descriptions = request.POST.getlist('education_descriptions[]')
            gpas = request.POST.getlist('education_gpas[]')
            percentages = request.POST.getlist('education_percentages[]')
            
            for i in range(len(institutions)):
                if institutions[i]:
                    Education.objects.create(
                        resume=resume,
                        institution=institutions[i],
                        degree=degrees[i] if i < len(degrees) else 'bachelors',
                        field_of_study=fields[i] if i < len(fields) else '',
                        start_year=start_years[i] if i < len(start_years) else None,
                        end_year=end_years[i] if (i < len(end_years) and not current_statuses[i]) else None,
                        currently_studying=bool(current_statuses[i]),
                        description=descriptions[i] if i < len(descriptions) else '',
                        gpa=gpas[i] if i < len(gpas) and gpas[i] else None,
                        percentage=percentages[i] if i < len(percentages) and percentages[i] else None
                    )

            # Handle experiences
            Experience.objects.filter(resume=resume).delete()
            organizations = request.POST.getlist('experience_organizations[]')
            positions = request.POST.getlist('experience_positions[]')
            start_dates = request.POST.getlist('experience_start_dates[]')
            end_dates = request.POST.getlist('experience_end_dates[]')
            current_jobs = request.POST.getlist('experience_current[]')
            exp_descriptions = request.POST.getlist('experience_descriptions[]')
            
            for i in range(len(organizations)):
                if organizations[i]:
                    exp = Experience.objects.create(
                        resume=resume,
                        organization=organizations[i],
                        position=positions[i] if i < len(positions) else '',
                        start_date=start_dates[i] if i < len(start_dates) else None,
                        end_date=end_dates[i] if (i < len(end_dates) and not current_jobs[i]) else None,
                        currently_working=bool(current_jobs[i]),
                        description=exp_descriptions[i] if i < len(exp_descriptions) else ''
                    )
                    
                    # Handle responsibilities
                    resp_descriptions = request.POST.getlist(f'responsibility_descriptions[]')
                    for desc in resp_descriptions:
                        if desc:
                            Responsibility.objects.create(
                                experience=exp,
                                description=desc
                            )

            # Handle projects
            Project.objects.filter(resume=resume).delete()
            project_titles = request.POST.getlist('project_titles[]')
            project_start_dates = request.POST.getlist('project_start_dates[]')
            project_end_dates = request.POST.getlist('project_end_dates[]')
            project_urls = request.POST.getlist('project_urls[]')
            project_descriptions = request.POST.getlist('project_descriptions[]')
            
            for i in range(len(project_titles)):
                if project_titles[i]:
                    Project.objects.create(
                        resume=resume,
                        title=project_titles[i],
                        start_date=project_start_dates[i] if i < len(project_start_dates) else None,
                        end_date=project_end_dates[i] if i < len(project_end_dates) else None,
                        project_url=project_urls[i] if i < len(project_urls) else '',
                        description=project_descriptions[i] if i < len(project_descriptions) else ''
                    )

            # Handle certificates
            Certificate.objects.filter(resume=resume).delete()
            cert_titles = request.POST.getlist('certificate_titles[]')
            issuing_orgs = request.POST.getlist('certificate_organizations[]')
            issue_dates = request.POST.getlist('certificate_issue_dates[]')
            expiry_dates = request.POST.getlist('certificate_expiration_dates[]')
            credential_ids = request.POST.getlist('certificate_ids[]')
            credential_urls = request.POST.getlist('certificate_urls[]')
            cert_descriptions = request.POST.getlist('certificate_descriptions[]')
            
            for i in range(len(cert_titles)):
                if cert_titles[i]:
                    Certificate.objects.create(
                        resume=resume,
                        title=cert_titles[i],
                        issuing_organization=issuing_orgs[i] if i < len(issuing_orgs) else '',
                        issue_date=issue_dates[i] if i < len(issue_dates) else None,
                        expiration_date=expiry_dates[i] if i < len(expiry_dates) else None,
                        credential_id=credential_ids[i] if i < len(credential_ids) else '',
                        credential_url=credential_urls[i] if i < len(credential_urls) else '',
                        description=cert_descriptions[i] if i < len(cert_descriptions) else ''
                    )

            # Handle achievements
            Achievement.objects.filter(resume=resume).delete()
            achievement_titles = request.POST.getlist('achievement_titles[]')
            achievement_dates = request.POST.getlist('achievement_dates[]')
            achievement_descriptions = request.POST.getlist('achievement_descriptions[]')
            
            for i in range(len(achievement_titles)):
                if achievement_titles[i]:
                    Achievement.objects.create(
                        resume=resume,
                        title=achievement_titles[i],
                        date=achievement_dates[i] if i < len(achievement_dates) else None,
                        description=achievement_descriptions[i] if i < len(achievement_descriptions) else ''
                    )

            # Handle social links
            SocialLink.objects.filter(resume=resume).delete()
            platforms = request.POST.getlist('social_platforms[]')
            urls = request.POST.getlist('social_urls[]')
            
            for i in range(len(platforms)):
                if platforms[i] and urls[i]:
                    SocialLink.objects.create(
                        resume=resume,
                        platform=platforms[i],
                        url=urls[i]
                    )

            messages.success(request, "Resume updated successfully!")
            return JsonResponse({'success': True, 'resume_id': resume.id})
            
    except Exception as e:
        messages.error(request, f"Error updating resume: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=400)



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
def update_resume_template(request):
    if request.method == 'POST':
        try:
            # Create a temporary resume object for preview
            resume = {
                'title': request.POST.get('title', 'Untitled Resume'),
                'template': request.POST.get('template', 'temp_1'),
                'basic_details': {
                    'full_name': request.POST.get('full_name', ''),
                    'email': request.POST.get('email', ''),
                    'phone': request.POST.get('phone', ''),
                    'summary': request.POST.get('summary', ''),
                    'avatar': request.POST.get('avatar', '')
                },
                'skills': [],
                'educations': [],
                'experiences': [],
                'projects': [],
                'certificates': [],
                'achievements': [],
                'social_links': []
            }
            
            # Process skills
            skill_names = request.POST.getlist('skill_names[]')
            skill_categories = request.POST.getlist('skill_categories[]')
            for name, category in zip(skill_names, skill_categories):
                if name:
                    resume['skills'].append({'name': name, 'category': category})
            
            # Process education
            institutions = request.POST.getlist('education_institutions[]')
            degrees = request.POST.getlist('education_degrees[]')
            fields = request.POST.getlist('education_fields[]')
            start_years = request.POST.getlist('education_start_years[]')
            end_years = request.POST.getlist('education_end_years[]')
            current_statuses = request.POST.getlist('education_current[]')
            descriptions = request.POST.getlist('education_descriptions[]')
            
            for i in range(len(institutions)):
                if institutions[i]:
                    resume['educations'].append({
                        'institution': institutions[i],
                        'degree': degrees[i] if i < len(degrees) else 'bachelors',
                        'field_of_study': fields[i] if i < len(fields) else '',
                        'start_year': start_years[i] if i < len(start_years) else None,
                        'end_year': end_years[i] if i < len(end_years) and not current_statuses[i] else None,
                        'currently_studying': bool(current_statuses[i]),
                        'description': descriptions[i] if i < len(descriptions) else ''
                    })
            
            # Process experiences
            organizations = request.POST.getlist('experience_organizations[]')
            positions = request.POST.getlist('experience_positions[]')
            start_dates = request.POST.getlist('experience_start_dates[]')
            end_dates = request.POST.getlist('experience_end_dates[]')
            current_jobs = request.POST.getlist('experience_current[]')
            exp_descriptions = request.POST.getlist('experience_descriptions[]')
            responsibilities = request.POST.getlist('responsibility_descriptions[]')
            
            for i in range(len(organizations)):
                if organizations[i]:
                    exp = {
                        'organization': organizations[i],
                        'position': positions[i] if i < len(positions) else '',
                        'start_date': start_dates[i] if i < len(start_dates) else None,
                        'end_date': end_dates[i] if i < len(end_dates) and not current_jobs[i] else None,
                        'currently_working': bool(current_jobs[i]),
                        'description': exp_descriptions[i] if i < len(exp_descriptions) else '',
                        'responsibilities': []
                    }
                    
                    for desc in responsibilities:
                        if desc:
                            exp['responsibilities'].append({'description': desc})
                    
                    resume['experiences'].append(exp)
            
            # Process projects
            project_titles = request.POST.getlist('project_titles[]')
            project_start_dates = request.POST.getlist('project_start_dates[]')
            project_end_dates = request.POST.getlist('project_end_dates[]')
            project_urls = request.POST.getlist('project_urls[]')
            project_descriptions = request.POST.getlist('project_descriptions[]')
            
            for i in range(len(project_titles)):
                if project_titles[i]:
                    resume['projects'].append({
                        'title': project_titles[i],
                        'start_date': project_start_dates[i] if i < len(project_start_dates) else None,
                        'end_date': project_end_dates[i] if i < len(project_end_dates) else None,
                        'project_url': project_urls[i] if i < len(project_urls) else '',
                        'description': project_descriptions[i] if i < len(project_descriptions) else ''
                    })
            
            # Process certificates
            cert_titles = request.POST.getlist('certificate_titles[]')
            issuing_orgs = request.POST.getlist('certificate_organizations[]')
            issue_dates = request.POST.getlist('certificate_issue_dates[]')
            expiry_dates = request.POST.getlist('certificate_expiration_dates[]')
            credential_ids = request.POST.getlist('certificate_ids[]')
            credential_urls = request.POST.getlist('certificate_urls[]')
            cert_descriptions = request.POST.getlist('certificate_descriptions[]')
            
            for i in range(len(cert_titles)):
                if cert_titles[i]:
                    resume['certificates'].append({
                        'title': cert_titles[i],
                        'issuing_organization': issuing_orgs[i] if i < len(issuing_orgs) else '',
                        'issue_date': issue_dates[i] if i < len(issue_dates) else None,
                        'expiration_date': expiry_dates[i] if i < len(expiry_dates) else None,
                        'credential_id': credential_ids[i] if i < len(credential_ids) else '',
                        'credential_url': credential_urls[i] if i < len(credential_urls) else '',
                        'description': cert_descriptions[i] if i < len(cert_descriptions) else ''
                    })
            
            # Process achievements
            achievement_titles = request.POST.getlist('achievement_titles[]')
            achievement_dates = request.POST.getlist('achievement_dates[]')
            achievement_descriptions = request.POST.getlist('achievement_descriptions[]')
            
            for i in range(len(achievement_titles)):
                if achievement_titles[i]:
                    resume['achievements'].append({
                        'title': achievement_titles[i],
                        'date': achievement_dates[i] if i < len(achievement_dates) else None,
                        'description': achievement_descriptions[i] if i < len(achievement_descriptions) else ''
                    })
            
            # Process social links
            platforms = request.POST.getlist('social_platforms[]')
            urls = request.POST.getlist('social_urls[]')
            
            for i in range(len(platforms)):
                if platforms[i] and urls[i]:
                    resume['social_links'].append({
                        'platform': platforms[i],
                        'url': urls[i]
                    })
            
            context = {
                'resume': resume,
                'is_preview': True
            }
            
            preview_html = render_to_string('resumes/resume_preview.html', context)
            return JsonResponse({'preview_html': preview_html})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Invalid request'}, status=400)








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
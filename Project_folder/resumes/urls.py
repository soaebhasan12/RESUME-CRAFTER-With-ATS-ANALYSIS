from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from resumes import views

app_name = 'resumes'  # This should match with namespace

urlpatterns = [
    # Single-Page Resume Builder
    path('resume/new/', views.create_resume, name='create_resume'),
    path('resume/<int:resume_id>/edit/', views.edit_resume, name='edit_resume'),
    path('resume/<int:resume_id>/delete/', views.delete_resume, name='delete_resume'),
    path('resume/<int:resume_id>/download/', views.generate_pdf, name='download_resume'),
    
    # AJAX Endpoints
    path('resume/<int:resume_id>/update-template/', views.update_resume_template, name='update_template'),
    path('resume/<int:resume_id>/duplicate/', views.duplicate_resume, name='duplicate_resume'),
    path('resume/preview/', views.preview_resume, name='preview_resume'),
    
    # Resume List
    path('my-resumes/', views.resume_list, name='resume_list'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
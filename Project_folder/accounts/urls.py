from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

app_name = 'accounts'  # This should match with namespace

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),

    # # Single-Page Resume Builder
    # path('resume/new/', views.create_resume, name='create_resume'),
    # path('resume/<int:resume_id>/edit/', views.edit_resume, name='edit_resume'),
    # path('resume/<int:resume_id>/delete/', views.delete_resume, name='delete_resume'),
    # path('resume/<int:resume_id>/download/', views.generate_pdf, name='download_resume'),
    
    # # AJAX Endpoints
    # path('resume/<int:resume_id>/update-template/', views.update_resume_template, name='update_template'),
    # path('resume/<int:resume_id>/duplicate/', views.duplicate_resume, name='duplicate_resume'),
    # path('resume/preview/', views.preview_template, name='preview_template'),
    
    # # Profile
    # path('profile/', views.profile_view, name='profile'),
    # path('profile/update/', views.update_profile, name='update_profile'),
    
    # # Resume List
    # path('my-resumes/', views.resume_list, name='resume_list'),
    
    # Admin
    # path('admin/', admin.site.urls),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
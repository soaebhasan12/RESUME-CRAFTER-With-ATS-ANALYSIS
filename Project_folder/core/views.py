from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages

from accounts.models import User


# Home View
def home_view(request):
    # if request.user.is_authenticated:
    #     return redirect('resume_list')
    return render(request, 'core/home.html')

# Profile Views
@login_required
def profile_view(request):
    profile = request.User.profile
    # resumes = Resume.objects.filter(user=request.user).order_by('-updated_at')
    
    context = {
        # 'profile': profile,
        # 'resumes': resumes,
        # 'resume_count': resumes.count(),
    }
    return render(request, 'core/profile/base_profile.html', context)

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
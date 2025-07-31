from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.shortcuts import render, redirect
from django.contrib import messages
from .models import User
from core import views

def register_view(request):
    """Handle user registration"""
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email').lower()
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')

        # Password validation
        if password1 != password2:
            messages.error(request, "Passwords do not match!")
            return render(request, 'accounts/register.html')
        
        try:
            validate_password(password1)
        except ValidationError as e:
            messages.error(request, "\n".join(e.messages))
            return render(request, 'accounts/register.html')
        
        # Create user
        try:
            User.objects.create_user(
                email=email,
                username=username,
                password=password1
            )
            messages.success(request, "Account created successfully! Please login.")
            return redirect('accounts:login')
        except IntegrityError:
            messages.error(request, "Email or username already exists.")

    return render(request, 'accounts/register.html')

def login_view(request):
    """Handle user login"""
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        user = authenticate(request, email=email, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, "Welcome back!")
            return redirect('core:home')
        
        messages.error(request, "Invalid email or password.")

    return render(request, 'accounts/login.html')

def logout_view(request):
    """Handle user logout"""
    logout(request)
    messages.success(request, "You have been logged out successfully.")
    return redirect('core:home')
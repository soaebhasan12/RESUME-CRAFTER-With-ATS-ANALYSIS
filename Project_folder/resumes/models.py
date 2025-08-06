from django.db import models
from accounts.models import User

# Create your models here.
class Resume(models.Model):
    TEMPLATE_CHOICES = [
        ('temp_1', 'Professional Blue'),
        ('temp_2', 'Modern Red'),
        ('temp_3', 'Creative Green'),
        ('temp_4', 'Minimalist Black'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=255, default="Untitled Resume")
    template = models.CharField(max_length=50, choices=TEMPLATE_CHOICES, default='template1')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} - {self.user.username}"

class BasicDetails(models.Model):
    resume = models.OneToOneField(Resume, on_delete=models.CASCADE, related_name='basic_details')
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    avatar = models.URLField(blank=True, null=True)
    summary = models.TextField()
    
    def __str__(self):
        return f"Basic details for {self.resume.title}"

class SocialLink(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='social_links')
    platform = models.CharField(max_length=50)
    url = models.URLField()
    
    def __str__(self):
        return f"{self.platform} - {self.resume.title}"

class Skill(models.Model):
    SKILL_CATEGORIES = [
        ('technical', 'Technical'),
        ('soft', 'Soft Skills'),
        ('language', 'Languages'),
        ('other', 'Other'),
    ]
    
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=SKILL_CATEGORIES, blank=True, null=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

class Education(models.Model):
    DEGREE_CHOICES = [
        ('high_school', 'High School'),
        ('bachelors', 'Bachelor\'s Degree'),
        ('masters', 'Master\'s Degree'),
        ('phd', 'PhD'),
        ('diploma', 'Diploma'),
        ('certificate', 'Certificate'),
    ]
    
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='educations')
    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=50, choices=DEGREE_CHOICES)
    field_of_study = models.CharField(max_length=255)
    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField(blank=True, null=True)
    currently_studying = models.BooleanField(default=False)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.get_degree_display()} at {self.institution}"

class Experience(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='experiences')
    organization = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    currently_working = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.position} at {self.organization}"

class Responsibility(models.Model):
    experience = models.ForeignKey(Experience, on_delete=models.CASCADE, related_name='responsibilities')
    description = models.TextField()
    
    def __str__(self):
        return f"Responsibility for {self.experience.position}"

class Achievement(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date = models.DateField(blank=True, null=True)
    
    def __str__(self):
        return self.title

class Certificate(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='certificates')
    title = models.CharField(max_length=255)
    issuing_organization = models.CharField(max_length=255)
    issue_date = models.DateField(blank=True, null=True)
    expiration_date = models.DateField(blank=True, null=True)
    credential_id = models.CharField(max_length=100, blank=True)
    credential_url = models.URLField(blank=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.title

class Project(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=255)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    project_url = models.URLField(blank=True)
    description = models.TextField()
    
    def __str__(self):
        return self.title
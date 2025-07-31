from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import RegisterUser, UserProfile, User_Personal_Details

@receiver(post_save, sender=RegisterUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # Create personal details first
        personal_details = User_Personal_Details.objects.create(
            email=instance.email,
            name=instance.username
        )
        
        # Then create profile with personal details
        UserProfile.objects.create(
            user=instance,
            personal_details=personal_details
        )

@receiver(post_save, sender=RegisterUser)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
/**
 * Profile Application - Core Functionality
 * 
 * This script handles all interactive elements of the profile section
 * using modern JavaScript practices and efficient DOM manipulation.
 */

class ProfileApp {
    constructor() {
        this.initElements();
        this.initEvents();
        this.setActiveSection('dashboard');
    }

    initElements() {
        // Core elements
        this.sidebar = document.querySelector('.profile-sidebar');
        this.mainContent = document.querySelector('.profile-main-content');
        
        // Navigation elements
        this.navLinks = document.querySelectorAll('.profile-menu a[data-section]');
        this.sections = document.querySelectorAll('.profile-section');
        
        // Profile picture upload
        this.profileUpload = document.getElementById('profileUpload');
        this.profilePicture = document.querySelector('.profile-picture');
        this.settingsProfilePicture = document.getElementById('settingsProfilePicture');
        
        // Action buttons
        this.changePasswordBtn = document.getElementById('changePasswordBtn');
        this.deleteAccountBtn = document.getElementById('deleteAccountBtn');
    }

    initEvents() {
        // Navigation click events
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.setActiveSection(section);
            });
        });

        // Profile picture upload
        if (this.profileUpload) {
            this.profileUpload.addEventListener('change', (e) => this.handleProfileUpload(e));
        }

        // Account actions
        if (this.changePasswordBtn) {
            this.changePasswordBtn.addEventListener('click', () => this.changePassword());
        }

        if (this.deleteAccountBtn) {
            this.deleteAccountBtn.addEventListener('click', () => this.deleteAccount());
        }

        // CV card interactions
        document.addEventListener('click', (e) => {
            const cvCard = e.target.closest('.cv-card');
            if (cvCard && !e.target.closest('.cv-actions') && !e.target.closest('.cv-badge')) {
                const cvId = cvCard.getAttribute('data-cv-id');
                this.viewCV(cvId);
            }
        });

        // Initialize tooltips
        this.initTooltips();
    }

    setActiveSection(section) {
        // Update navigation
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === section) {
                link.classList.add('active');
            }
        });

        // Update sections
        this.sections.forEach(sectionEl => {
            sectionEl.style.display = 'none';
        });

        const activeSection = document.getElementById(`${section}-section`);
        if (activeSection) {
            activeSection.style.display = 'block';
        }
    }

    handleProfileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            // Update both profile pictures
            if (this.profilePicture) this.profilePicture.src = event.target.result;
            if (this.settingsProfilePicture) this.settingsProfilePicture.src = event.target.result;
            
            // Upload to server (would be implemented with AJAX)
            this.uploadProfilePicture(file);
        };
        reader.readAsDataURL(file);
    }

    uploadProfilePicture(file) {
        // Implement AJAX upload here
        console.log('Uploading profile picture:', file.name);
        // Example:
        // const formData = new FormData();
        // formData.append('profile_picture', file);
        // fetch('/api/upload-profile-picture', {
        //     method: 'POST',
        //     body: formData
        // }).then(response => {
        //     // Handle response
        // });
    }

    viewCV(cvId) {
        window.location.href = `/cv/${cvId}/view/`;
    }

    changePassword() {
        window.location.href = '/accounts/password/change/';
    }

    deleteAccount() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            window.location.href = '/accounts/delete/';
        }
    }

    initTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map((tooltipTriggerEl) => {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfileApp();
});
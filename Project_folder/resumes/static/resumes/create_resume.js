document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('resumeForm');
    const previewContainer = document.getElementById('resumePreview');
    const isNewResume = form.action.includes('new');

    // Initialize form
    function initializeForm() {
        setupDynamicSections();
        setupInputListeners();
        updatePreview();
    }

    // Setup dynamic sections
    function setupDynamicSections() {
        // Skills
        document.getElementById('addSkillBtn')?.addEventListener('click', addNewSkill);
        
        // Education
        document.getElementById('addEducationBtn')?.addEventListener('click', addNewEducation);
        
        // Experience
        document.getElementById('addExperienceBtn')?.addEventListener('click', addNewExperience);
        
        // Projects
        document.getElementById('addProjectBtn')?.addEventListener('click', addNewProject);
        
        // Certificates
        document.getElementById('addCertificateBtn')?.addEventListener('click', addNewCertificate);
        
        // Achievements
        document.getElementById('addAchievementBtn')?.addEventListener('click', addNewAchievement);
        
        // Social Links
        document.getElementById('addSocialLinkBtn')?.addEventListener('click', addNewSocialLink);
        
        // Delegated event listeners for remove buttons
        document.addEventListener('click', function(e) {
            if (e.target.closest('.remove-skill')) {
                removeItem(e.target.closest('.skill-item'));
            }
            if (e.target.closest('.remove-education')) {
                removeItem(e.target.closest('.education-item'));
            }
            if (e.target.closest('.remove-experience')) {
                removeItem(e.target.closest('.experience-item'));
            }
            if (e.target.closest('.remove-project')) {
                removeItem(e.target.closest('.project-item'));
            }
            if (e.target.closest('.remove-certificate')) {
                removeItem(e.target.closest('.certificate-item'));
            }
            if (e.target.closest('.remove-achievement')) {
                removeItem(e.target.closest('.achievement-item'));
            }
            if (e.target.closest('.remove-social-link')) {
                removeItem(e.target.closest('.social-link-item'));
            }
            if (e.target.closest('.remove-responsibility')) {
                removeItem(e.target.closest('.responsibility-item'));
            }
        });
    }

    // Setup input listeners for real-time updates
    function setupInputListeners() {
        // Listen to all existing inputs
        document.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('input', debounce(updatePreview, 500));
            input.addEventListener('change', debounce(updatePreview, 500));
        });
        
        // Avatar preview
        const avatarInput = document.getElementById('avatarInput');
        if (avatarInput) {
            avatarInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        updatePreview();
                    }
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Summary character counter
        const summaryTextarea = document.querySelector('textarea[name="summary"]');
        if (summaryTextarea) {
            summaryTextarea.addEventListener('input', debounce(updatePreview, 500));
        }
    }

    // Helper function to remove items with animation
    function removeItem(item) {
        if (item) {
            item.classList.add('removing');
            setTimeout(() => {
                item.remove();
                updatePreview();
            }, 300);
        }
    }

    // Update preview function
    function updatePreview() {
    const formData = new FormData(form);
    
    // Manually add all sections to the FormData
    const sections = [
        'skill_names[]', 'skill_categories[]',
        'education_institutions[]', 'education_degrees[]', 'education_fields[]',
        'education_start_years[]', 'education_end_years[]', 'education_current[]',
        'experience_organizations[]', 'experience_positions[]', 'experience_start_dates[]',
        'experience_end_dates[]', 'experience_current[]', 'responsibility_descriptions[]',
        'project_titles[]', 'project_start_dates[]', 'project_end_dates[]',
        'certificate_titles[]', 'certificate_organizations[]', 'certificate_issue_dates[]',
        'achievement_titles[]', 'achievement_dates[]',
        'social_platforms[]', 'social_urls[]'
    ];
    
    sections.forEach(field => {
        document.querySelectorAll(`[name="${field}"]`).forEach(input => {
            if (!formData.has(field)) {
                if (input.type === 'checkbox') {
                    formData.append(field, input.checked);
                } else {
                    formData.append(field, input.value);
                }
            }
        });
    });
    
    // Get the selected template
    const templateSelector = document.getElementById('templateSelector');
    const selectedTemplate = templateSelector ? templateSelector.value : 'temp_1';
    formData.append('template', selectedTemplate);
    
    fetch('/resumes/preview/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        if (data.preview_html) {
            previewContainer.innerHTML = data.preview_html;
        }
    })
    .catch(error => {
        console.error('Error updating preview:', error);
    });
}

    // Helper function to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Debounce function for performance
    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    // Initialize the form
    initializeForm();
    
    // Template selector change listener
    const templateSelector = document.getElementById('templateSelector');
    if (templateSelector) {
        templateSelector.addEventListener('change', updatePreview);
    }
});

// Section-specific functions (addNewSkill, addNewEducation, etc.) would go here
// These should all call updatePreview() after adding new elements














// side bar js
document.addEventListener('DOMContentLoaded', function() {
    // Add tooltips to navigation buttons
    const navLinks = document.querySelectorAll('#resume-sections-tab .nav-link');
    
    // Tooltip content mapping
    const tooltipContent = {
        'basic-tab': 'Basic Information',
        'skills-tab': 'Skills & Expertise',
        'education-tab': 'Education',
        'experience-tab': 'Work Experience',
        'projects-tab': 'Projects',
        'certificates-tab': 'Certifications',
        'achievements-tab': 'Achievements',
        'social-tab': 'Social Links'
    };
    
    // Create and append tooltips
    navLinks.forEach(link => {
        const tooltip = document.createElement('span');
        tooltip.className = 'nav-link-tooltip';
        tooltip.textContent = tooltipContent[link.id];
        link.appendChild(tooltip);
        
        // Add aria-label for accessibility
        link.setAttribute('aria-label', tooltipContent[link.id]);
    });
    
    // Smooth scroll to active tab content
    const tabButtons = document.querySelectorAll('[data-bs-toggle="pill"]');
    
    tabButtons.forEach(button => {
        button.addEventListener('shown.bs.tab', function(e) {
            const targetId = e.target.getAttribute('data-bs-target');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Highlight current active tab with animation
    const tabPaneElements = document.querySelectorAll('.tab-pane');
    
    tabPaneElements.forEach(pane => {
        pane.addEventListener('show.bs.tab', function() {
            this.style.opacity = 0;
            setTimeout(() => {
                this.style.opacity = 1;
            }, 100);
        });
    });






















// Skills Section 
    // Skills Section Functionality
    const skillsContainer = document.getElementById('skillsContainer');
    const addSkillBtn = document.getElementById('addSkillBtn');
    
    // Add new skill
    function addNewSkill(skillName = '', category = 'technical') {
        const skillId = Date.now(); // Temporary ID for new skills
        
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item mb-3 p-3 border rounded';
        skillItem.innerHTML = `
            <input type="hidden" name="skill_ids[]" value="new-${skillId}">
            <div class="row g-2">
                <div class="col-md-6">
                    <label class="form-label">Skill Name*</label>
                    <input type="text" class="form-control" name="skill_names[]" value="${skillName}" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Category</label>
                    <select class="form-select" name="skill_categories[]">
                        <option value="technical" ${category === 'technical' ? 'selected' : ''}>Technical</option>
                        <option value="soft" ${category === 'soft' ? 'selected' : ''}>Soft Skills</option>
                        <option value="language" ${category === 'language' ? 'selected' : ''}>Languages</option>
                        <option value="other" ${category === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="col-md-2 d-flex align-items-end">
                    <button type="button" class="btn btn-sm btn-outline-danger w-100 remove-skill">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        skillsContainer.appendChild(skillItem);
        
        // Scroll to the new skill if it's not visible
        setTimeout(() => {
            skillItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        
        // Focus on the new skill input
        const input = skillItem.querySelector('input[type="text"]');
        setTimeout(() => input.focus(), 150);
    }
    
    // Handle add skill button click
    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', function() {
            addNewSkill();
        });
    }
    
    // Handle remove skill button clicks (delegated event)
    skillsContainer.addEventListener('click', function(e) {
        if (e.target.closest('.remove-skill')) {
            const skillItem = e.target.closest('.skill-item');
            if (skillItem) {
                // Add removing class for animation
                skillItem.classList.add('removing');
                
                // Remove after animation completes
                setTimeout(() => {
                    skillItem.remove();
                }, 300);
            }
        }
    });
    
    // Initialize skill category badges in preview
    function updateSkillBadges() {
        document.querySelectorAll('.skill-badge').forEach(badge => {
            const category = badge.dataset.category;
            if (category) {
                badge.classList.add(`skill-category-${category}`);
                
                // Add category label if not already present
                if (!badge.querySelector('.category-label')) {
                    const label = document.createElement('span');
                    label.className = 'skill-category-badge';
                    label.textContent = {
                        'technical': 'Tech',
                        'soft': 'Soft',
                        'language': 'Lang',
                        'other': 'Other'
                    }[category] || '';
                    badge.appendChild(label);
                }
            }
        });
    }
    
    // Update skill badges when skills change
    skillsContainer.addEventListener('change', function(e) {
        if (e.target.name === 'skill_categories[]') {
            updateSkillBadges();
        }
    });
    
    // Initial update
    updateSkillBadges();



















// Education Section Functionality
    const educationContainer = document.getElementById('educationContainer');
    const addEducationBtn = document.getElementById('addEducationBtn');
    
    // Add new education entry
    function addNewEducation() {
        const educationId = Date.now(); // Temporary ID for new entries
        
        const educationItem = document.createElement('div');
        educationItem.className = 'education-item mb-4 p-3 border rounded';
        educationItem.innerHTML = `
            <input type="hidden" name="education_ids[]" value="new-${educationId}">
            <div class="mb-3">
                <label class="form-label">Institution*</label>
                <input type="text" class="form-control" name="education_institutions[]" required>
            </div>
            
            <div class="row g-2">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Degree*</label>
                    <select class="form-select" name="education_degrees[]" required>
                        <option value="" disabled selected>Select degree</option>
                        <option value="high_school">High School</option>
                        <option value="bachelors">Bachelor's Degree</option>
                        <option value="masters">Master's Degree</option>
                        <option value="phd">PhD</option>
                        <option value="diploma">Diploma</option>
                        <option value="certificate">Certificate</option>
                    </select>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Field of Study*</label>
                    <input type="text" class="form-control" name="education_fields[]" required>
                </div>
            </div>
            
            <div class="row g-2">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Start Year*</label>
                    <input type="month" class="form-control" name="education_start_years[]" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">End Year</label>
                    <input type="month" class="form-control" name="education_end_years[]">
                    <div class="form-check mt-2">
                        <input class="form-check-input" type="checkbox" name="education_current[]">
                        <label class="form-check-label">Currently studying here</label>
                    </div>
                </div>
            </div>
            
            <div class="row g-2">
                <div class="col-md-6 mb-3">
                    <label class="form-label">GPA</label>
                    <input type="number" step="0.01" min="0" max="4" class="form-control" name="education_gpas[]">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Percentage</label>
                    <input type="number" step="0.01" min="0" max="100" class="form-control" name="education_percentages[]">
                </div>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" name="education_descriptions[]" rows="3"></textarea>
            </div>
            
            <div class="text-end">
                <button type="button" class="btn btn-sm btn-outline-danger remove-education">
                    <i class="bi bi-trash"></i> Remove
                </button>
            </div>
        `;
        
        educationContainer.appendChild(educationItem);
        
        // Add event listeners for the new item
        const currentCheckbox = educationItem.querySelector('input[name="education_current[]"]');
        const endYearInput = educationItem.querySelector('input[name="education_end_years[]"]');
        
        currentCheckbox.addEventListener('change', function() {
            endYearInput.disabled = this.checked;
            if (this.checked) {
                endYearInput.value = '';
            }
        });
        
        // Scroll to and focus on the new item
        setTimeout(() => {
            educationItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            educationItem.querySelector('input[name="education_institutions[]"]').focus();
        }, 100);
    }
    
    // Handle add education button click
    if (addEducationBtn) {
        addEducationBtn.addEventListener('click', addNewEducation);
    }
    
    // Handle remove education button clicks (delegated event)
    educationContainer.addEventListener('click', function(e) {
        if (e.target.closest('.remove-education')) {
            const educationItem = e.target.closest('.education-item');
            if (educationItem) {
                educationItem.classList.add('removing');
                setTimeout(() => educationItem.remove(), 300);
            }
        }
    });
    
    // Initialize current study checkboxes
    document.querySelectorAll('input[name="education_current[]"]').forEach(checkbox => {
        const endYearInput = checkbox.closest('.row').querySelector('input[name="education_end_years[]"]');
        if (checkbox.checked) {
            endYearInput.disabled = true;
        }
        
        checkbox.addEventListener('change', function() {
            endYearInput.disabled = this.checked;
            if (this.checked) {
                endYearInput.value = '';
            }
        });
    });
    
    // Update degree badges in preview
    function updateDegreeBadges() {
        document.querySelectorAll('.education-degree').forEach(badge => {
            const degree = badge.dataset.degree;
            if (degree) {
                badge.textContent = {
                    'high_school': 'HS',
                    'bachelors': 'BSc',
                    'masters': 'MSc',
                    'phd': 'PhD',
                    'diploma': 'DIP',
                    'certificate': 'CERT'
                }[degree] || '';
            }
        });
    }
    
    // Update when degrees change
    educationContainer.addEventListener('change', function(e) {
        if (e.target.name === 'education_degrees[]') {
            updateDegreeBadges();
        }
    });
    
    // Initial update
    updateDegreeBadges();






















// Experience Section Functionality
    const experienceContainer = document.getElementById('experienceContainer');
    const addExperienceBtn = document.getElementById('addExperienceBtn');
    
    // Add new experience entry
    function addNewExperience() {
        const experienceId = Date.now(); // Temporary ID
        
        const experienceItem = document.createElement('div');
        experienceItem.className = 'experience-item mb-4 p-3 border rounded';
        experienceItem.innerHTML = `
            <input type="hidden" name="experience_ids[]" value="new-${experienceId}">
            <div class="mb-3">
                <label class="form-label">Organization*</label>
                <input type="text" class="form-control" name="experience_organizations[]" required>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Position*</label>
                <input type="text" class="form-control" name="experience_positions[]" required>
            </div>
            
            <div class="row g-2">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Start Date*</label>
                    <input type="date" class="form-control" name="experience_start_dates[]" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">End Date</label>
                    <input type="date" class="form-control" name="experience_end_dates[]">
                    <div class="form-check mt-2">
                        <input class="form-check-input" type="checkbox" name="experience_current[]">
                        <label class="form-check-label">Currently working here</label>
                    </div>
                </div>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" name="experience_descriptions[]" rows="3"></textarea>
            </div>
            
            <div class="responsibilities-container mb-3">
                <label class="form-label">Key Responsibilities</label>
                <div class="responsibilities-list"></div>
                <button type="button" class="btn btn-sm btn-outline-primary add-responsibility">
                    <i class="bi bi-plus"></i> Add Responsibility
                </button>
            </div>
            
            <div class="text-end">
                <button type="button" class="btn btn-sm btn-outline-danger remove-experience">
                    <i class="bi bi-trash"></i> Remove
                </button>
            </div>
        `;
        
        experienceContainer.appendChild(experienceItem);
        
        // Add event listeners for the new item
        const currentCheckbox = experienceItem.querySelector('input[name="experience_current[]"]');
        const endDateInput = experienceItem.querySelector('input[name="experience_end_dates[]"]');
        const addResponsibilityBtn = experienceItem.querySelector('.add-responsibility');
        const responsibilitiesList = experienceItem.querySelector('.responsibilities-list');
        
        // Currently working toggle
        currentCheckbox.addEventListener('change', function() {
            endDateInput.disabled = this.checked;
            if (this.checked) {
                endDateInput.value = '';
            }
        });
        
        // Add responsibility
        addResponsibilityBtn.addEventListener('click', function() {
            const responsibilityId = Date.now();
            const responsibilityItem = document.createElement('div');
            responsibilityItem.className = 'responsibility-item input-group mb-2';
            responsibilityItem.innerHTML = `
                <input type="hidden" name="responsibility_ids[]" value="new-${responsibilityId}">
                <input type="text" class="form-control" name="responsibility_descriptions[]" placeholder="Describe your responsibility">
                <button type="button" class="btn btn-outline-danger remove-responsibility">
                    <i class="bi bi-trash"></i>
                </button>
            `;
            responsibilitiesList.appendChild(responsibilityItem);
            
            // Focus on the new responsibility input
            setTimeout(() => {
                responsibilityItem.querySelector('input').focus();
            }, 50);
        });
        
        // Scroll to and focus on the new item
        setTimeout(() => {
            experienceItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            experienceItem.querySelector('input[name="experience_organizations[]"]').focus();
        }, 100);
    }
    
    // Handle add experience button click
    if (addExperienceBtn) {
        addExperienceBtn.addEventListener('click', addNewExperience);
    }
    
    // Handle remove experience button clicks (delegated event)
    experienceContainer.addEventListener('click', function(e) {
        // Remove experience
        if (e.target.closest('.remove-experience')) {
            const experienceItem = e.target.closest('.experience-item');
            if (experienceItem) {
                experienceItem.classList.add('removing');
                setTimeout(() => experienceItem.remove(), 300);
            }
        }
        
        // Remove responsibility
        if (e.target.closest('.remove-responsibility')) {
            const responsibilityItem = e.target.closest('.responsibility-item');
            if (responsibilityItem) {
                responsibilityItem.classList.add('removing');
                setTimeout(() => responsibilityItem.remove(), 300);
            }
        }
        
        // Add responsibility
        if (e.target.closest('.add-responsibility')) {
            const responsibilitiesContainer = e.target.closest('.responsibilities-container');
            const responsibilitiesList = responsibilitiesContainer.querySelector('.responsibilities-list') || 
                                       responsibilitiesContainer.querySelector('.responsibility-item').parentNode;
            
            const responsibilityId = Date.now();
            const responsibilityItem = document.createElement('div');
            responsibilityItem.className = 'responsibility-item input-group mb-2';
            responsibilityItem.innerHTML = `
                <input type="hidden" name="responsibility_ids[]" value="new-${responsibilityId}">
                <input type="text" class="form-control" name="responsibility_descriptions[]" placeholder="Describe your responsibility">
                <button type="button" class="btn btn-outline-danger remove-responsibility">
                    <i class="bi bi-trash"></i>
                </button>
            `;
            responsibilitiesList.appendChild(responsibilityItem);
            
            // Focus on the new responsibility input
            setTimeout(() => {
                responsibilityItem.querySelector('input').focus();
            }, 50);
        }
    });
    
    // Initialize current work checkboxes
    document.querySelectorAll('input[name="experience_current[]"]').forEach(checkbox => {
        const endDateInput = checkbox.closest('.row').querySelector('input[name="experience_end_dates[]"]');
        if (checkbox.checked) {
            endDateInput.disabled = true;
        }
        
        checkbox.addEventListener('change', function() {
            endDateInput.disabled = this.checked;
            if (this.checked) {
                endDateInput.value = '';
            }
        });
    });
    
    // Initialize add responsibility buttons for existing experiences
    document.querySelectorAll('.add-responsibility').forEach(btn => {
        btn.addEventListener('click', function() {
            const responsibilitiesContainer = this.closest('.responsibilities-container');
            const responsibilitiesList = responsibilitiesContainer.querySelector('.responsibility-item') ? 
                                       responsibilitiesContainer.querySelector('.responsibility-item').parentNode : 
                                       responsibilitiesContainer.querySelector('.responsibilities-list');
            
            const responsibilityId = Date.now();
            const responsibilityItem = document.createElement('div');
            responsibilityItem.className = 'responsibility-item input-group mb-2';
            responsibilityItem.innerHTML = `
                <input type="hidden" name="responsibility_ids[]" value="new-${responsibilityId}">
                <input type="text" class="form-control" name="responsibility_descriptions[]" placeholder="Describe your responsibility">
                <button type="button" class="btn btn-outline-danger remove-responsibility">
                    <i class="bi bi-trash"></i>
                </button>
            `;
            responsibilitiesList.appendChild(responsibilityItem);
            
            // Focus on the new responsibility input
            setTimeout(() => {
                responsibilityItem.querySelector('input').focus();
            }, 50);
        });
    });




















// Projects Section Functionality
    const projectsContainer = document.getElementById('projectsContainer');
    const addProjectBtn = document.getElementById('addProjectBtn');
    
    // Add new project entry
    function addNewProject() {
        const projectId = Date.now(); // Temporary ID
        
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item mb-4 p-3 border rounded';
        projectItem.innerHTML = `
            <input type="hidden" name="project_ids[]" value="new-${projectId}">
            <div class="mb-3">
                <label class="form-label">Project Title*</label>
                <input type="text" class="form-control" name="project_titles[]" required>
            </div>
            
            <div class="row g-2">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Start Date</label>
                    <input type="date" class="form-control" name="project_start_dates[]">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">End Date</label>
                    <input type="date" class="form-control" name="project_end_dates[]">
                </div>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Project URL</label>
                <input type="url" class="form-control" name="project_urls[]" placeholder="https://example.com">
            </div>
            
            <div class="mb-3">
                <label class="form-label">Description*</label>
                <textarea class="form-control" name="project_descriptions[]" rows="3" required></textarea>
            </div>
            
            <div class="text-end">
                <button type="button" class="btn btn-sm btn-outline-danger remove-project">
                    <i class="bi bi-trash"></i> Remove
                </button>
            </div>
        `;
        
        projectsContainer.appendChild(projectItem);
        
        // Add date change listeners for status updates
        const startDateInput = projectItem.querySelector('input[name="project_start_dates[]"]');
        const endDateInput = projectItem.querySelector('input[name="project_end_dates[]"]');
        
        function updateProjectStatus() {
            // This can be used to update visual indicators in the resume preview
            // You would implement this based on your preview rendering logic
        }
        
        startDateInput.addEventListener('change', updateProjectStatus);
        endDateInput.addEventListener('change', updateProjectStatus);
        
        // Scroll to and focus on the new item
        setTimeout(() => {
            projectItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            projectItem.querySelector('input[name="project_titles[]"]').focus();
        }, 100);
    }
    
    // Handle add project button click
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', addNewProject);
    }
    
    // Handle remove project button clicks (delegated event)
    projectsContainer.addEventListener('click', function(e) {
        if (e.target.closest('.remove-project')) {
            const projectItem = e.target.closest('.project-item');
            if (projectItem) {
                projectItem.classList.add('removing');
                setTimeout(() => projectItem.remove(), 300);
            }
        }
    });
    
    // Initialize date change listeners for existing projects
    document.querySelectorAll('.project-item').forEach(project => {
        const startDateInput = project.querySelector('input[name="project_start_dates[]"]');
        const endDateInput = project.querySelector('input[name="project_end_dates[]"]');
        
        function updateProjectStatus() {
            // Update visual indicators in resume preview
        }
        
        if (startDateInput) startDateInput.addEventListener('change', updateProjectStatus);
        if (endDateInput) endDateInput.addEventListener('change', updateProjectStatus);
    });
    
    // Function to update project status badges in preview
    function updateProjectStatusBadges() {
        document.querySelectorAll('.project-status').forEach(badge => {
            const startDate = badge.dataset.startDate;
            const endDate = badge.dataset.endDate;
            
            if (startDate && endDate) {
                const today = new Date();
                const end = new Date(endDate);
                
                if (end > today) {
                    badge.className = 'project-status project-status-current';
                    badge.textContent = 'Current';
                } else {
                    badge.className = 'project-status project-status-completed';
                    badge.textContent = 'Completed';
                }
            }
        });
    }
    
    // Update when dates change
    projectsContainer.addEventListener('change', function(e) {
        if (e.target.name === 'project_start_dates[]' || e.target.name === 'project_end_dates[]') {
            updateProjectStatusBadges();
        }
    });
    
    // Initial update
    updateProjectStatusBadges();


















// Certificates Section Functionality
    const certificatesContainer = document.getElementById('certificatesContainer');
    const addCertificateBtn = document.getElementById('addCertificateBtn');
    
    // Add new certificate entry
    function addNewCertificate() {
        const certificateId = Date.now(); // Temporary ID
        
        const certificateItem = document.createElement('div');
        certificateItem.className = 'certificate-item mb-4 p-3 border rounded';
        certificateItem.innerHTML = `
            <input type="hidden" name="certificate_ids[]" value="new-${certificateId}">
            <div class="mb-3">
                <label class="form-label">Certificate Title*</label>
                <input type="text" class="form-control" name="certificate_titles[]" required>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Issuing Organization*</label>
                <input type="text" class="form-control" name="certificate_organizations[]" required>
            </div>
            
            <div class="row g-2">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Issue Date</label>
                    <input type="date" class="form-control" name="certificate_issue_dates[]">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Expiration Date</label>
                    <input type="date" class="form-control" name="certificate_expiration_dates[]">
                </div>
            </div>
            
            <div class="row g-2">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Credential ID</label>
                    <input type="text" class="form-control" name="certificate_ids[]" placeholder="e.g., ABC123456">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Credential URL</label>
                    <input type="url" class="form-control" name="certificate_urls[]" placeholder="https://example.com/certificate">
                </div>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" name="certificate_descriptions[]" rows="3"></textarea>
            </div>
            
            <div class="text-end">
                <button type="button" class="btn btn-sm btn-outline-danger remove-certificate">
                    <i class="bi bi-trash"></i> Remove
                </button>
            </div>
        `;
        
        certificatesContainer.appendChild(certificateItem);
        
        // Add date change listeners for status updates
        const issueDateInput = certificateItem.querySelector('input[name="certificate_issue_dates[]"]');
        const expiryDateInput = certificateItem.querySelector('input[name="certificate_expiration_dates[]"]');
        
        function updateCertificateStatus() {
            // This can be used to update visual indicators in the resume preview
            // You would implement this based on your preview rendering logic
        }
        
        if (issueDateInput) issueDateInput.addEventListener('change', updateCertificateStatus);
        if (expiryDateInput) expiryDateInput.addEventListener('change', updateCertificateStatus);
        
        // Scroll to and focus on the new item
        setTimeout(() => {
            certificateItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            certificateItem.querySelector('input[name="certificate_titles[]"]').focus();
        }, 100);
    }
    
    // Handle add certificate button click
    if (addCertificateBtn) {
        addCertificateBtn.addEventListener('click', addNewCertificate);
    }
    
    // Handle remove certificate button clicks (delegated event)
    certificatesContainer.addEventListener('click', function(e) {
        if (e.target.closest('.remove-certificate')) {
            const certificateItem = e.target.closest('.certificate-item');
            if (certificateItem) {
                certificateItem.classList.add('removing');
                setTimeout(() => certificateItem.remove(), 300);
            }
        }
    });
    
    // Initialize date change listeners for existing certificates
    document.querySelectorAll('.certificate-item').forEach(certificate => {
        const issueDateInput = certificate.querySelector('input[name="certificate_issue_dates[]"]');
        const expiryDateInput = certificate.querySelector('input[name="certificate_expiration_dates[]"]');
        
        function updateCertificateStatus() {
            // Update visual indicators in resume preview
        }
        
        if (issueDateInput) issueDateInput.addEventListener('change', updateCertificateStatus);
        if (expiryDateInput) expiryDateInput.addEventListener('change', updateCertificateStatus);
    });
    
    // Function to update certificate status badges in preview
    function updateCertificateStatusBadges() {
        document.querySelectorAll('.certificate-status').forEach(badge => {
            const issueDate = badge.dataset.issueDate;
            const expiryDate = badge.dataset.expiryDate;
            
            if (!expiryDate) {
                badge.className = 'certificate-status certificate-status-no-expiry';
                badge.textContent = 'No Expiry';
            } else {
                const today = new Date();
                const expiry = new Date(expiryDate);
                
                if (expiry > today) {
                    badge.className = 'certificate-status certificate-status-active';
                    badge.textContent = 'Active';
                } else {
                    badge.className = 'certificate-status certificate-status-expired';
                    badge.textContent = 'Expired';
                }
            }
        });
    }
    
    // Update when dates change
    certificatesContainer.addEventListener('change', function(e) {
        if (e.target.name === 'certificate_issue_dates[]' || e.target.name === 'certificate_expiration_dates[]') {
            updateCertificateStatusBadges();
        }
    });
    
    // Initial update
    updateCertificateStatusBadges();























// Achievements Section Functionality
    const achievementsContainer = document.getElementById('achievementsContainer');
    const addAchievementBtn = document.getElementById('addAchievementBtn');
    
    // Add new achievement entry
    function addNewAchievement() {
        const achievementId = Date.now(); // Temporary ID
        
        const achievementItem = document.createElement('div');
        achievementItem.className = 'achievement-item mb-4 p-3 border rounded';
        achievementItem.innerHTML = `
            <input type="hidden" name="achievement_ids[]" value="new-${achievementId}">
            <div class="mb-3">
                <label class="form-label">Title*</label>
                <input type="text" class="form-control" name="achievement_titles[]" required>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Date</label>
                <input type="date" class="form-control" name="achievement_dates[]">
            </div>
            
            <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" name="achievement_descriptions[]" rows="3"></textarea>
            </div>
            
            <div class="text-end">
                <button type="button" class="btn btn-sm btn-outline-danger remove-achievement">
                    <i class="bi bi-trash"></i> Remove
                </button>
            </div>
        `;
        
        achievementsContainer.appendChild(achievementItem);
        
        // Scroll to and focus on the new item
        setTimeout(() => {
            achievementItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            achievementItem.querySelector('input[name="achievement_titles[]"]').focus();
        }, 100);
    }
    
    // Handle add achievement button click
    if (addAchievementBtn) {
        addAchievementBtn.addEventListener('click', addNewAchievement);
    }
    
    // Handle remove achievement button clicks (delegated event)
    achievementsContainer.addEventListener('click', function(e) {
        if (e.target.closest('.remove-achievement')) {
            const achievementItem = e.target.closest('.achievement-item');
            if (achievementItem) {
                achievementItem.classList.add('removing');
                setTimeout(() => achievementItem.remove(), 300);
            }
        }
    });
    
    // Function to update achievement dates in preview
    function updateAchievementDates() {
        document.querySelectorAll('.achievement-date').forEach(dateElement => {
            const dateValue = dateElement.dataset.date;
            if (dateValue) {
                const date = new Date(dateValue);
                dateElement.textContent = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
        });
    }
    
    // Update when dates change
    achievementsContainer.addEventListener('change', function(e) {
        if (e.target.name === 'achievement_dates[]') {
            updateAchievementDates();
        }
    });
    
    // Initial update
    updateAchievementDates();





















    // Social Links Section Functionality
    const socialLinksContainer = document.getElementById('socialLinksContainer');
    const addSocialLinkBtn = document.getElementById('addSocialLinkBtn');
    
    // Common social platforms with icons
    const socialPlatforms = {
        'linkedin': { name: 'LinkedIn', icon: 'bi-linkedin' },
        'github': { name: 'GitHub', icon: 'bi-github' },
        'twitter': { name: 'Twitter', icon: 'bi-twitter' },
        'facebook': { name: 'Facebook', icon: 'bi-facebook' },
        'instagram': { name: 'Instagram', icon: 'bi-instagram' },
        'youtube': { name: 'YouTube', icon: 'bi-youtube' },
        'website': { name: 'Website', icon: 'bi-globe' },
        'other': { name: 'Other', icon: 'bi-link-45deg' }
    };

    // Add new social link
    function addNewSocialLink(platform = '', url = '') {
        const linkId = Date.now(); // Temporary ID
        
        const linkItem = document.createElement('div');
        linkItem.className = 'social-link-item mb-3 p-3 border rounded';
        linkItem.innerHTML = `
            <input type="hidden" name="social_link_ids[]" value="new-${linkId}">
            <div class="row g-2">
                <div class="col-md-5">
                    <label class="form-label">Platform*</label>
                    <select class="form-select" name="social_platforms[]" required>
                        <option value="" disabled selected>Select platform</option>
                        ${Object.entries(socialPlatforms).map(([key, platform]) => 
                            `<option value="${key}" ${platform === key ? 'selected' : ''}>
                                ${platform.name}
                            </option>`
                        ).join('')}
                    </select>
                </div>
                <div class="col-md-5">
                    <label class="form-label">URL*</label>
                    <input type="url" class="form-control" name="social_urls[]" value="${url}" required>
                </div>
                <div class="col-md-2 d-flex align-items-end">
                    <button type="button" class="btn btn-sm btn-outline-danger w-100 remove-social-link">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        socialLinksContainer.appendChild(linkItem);
        
        // Add platform change listener
        const platformSelect = linkItem.querySelector('select[name="social_platforms[]"]');
        const urlInput = linkItem.querySelector('input[name="social_urls[]"]');
        
        platformSelect.addEventListener('change', function() {
            const selectedPlatform = this.value;
            if (selectedPlatform && !urlInput.value) {
                // Suggest URL format based on platform
                const urlHints = {
                    'linkedin': 'https://linkedin.com/in/yourprofile',
                    'github': 'https://github.com/yourusername',
                    'twitter': 'https://twitter.com/yourhandle',
                    'facebook': 'https://facebook.com/yourprofile',
                    'instagram': 'https://instagram.com/yourhandle',
                    'youtube': 'https://youtube.com/yourchannel',
                    'website': 'https://yourwebsite.com'
                };
                
                if (urlHints[selectedPlatform]) {
                    urlInput.placeholder = urlHints[selectedPlatform];
                }
            }
            updatePlatformIcons();
        });
        
        // Scroll to and focus on the new item
        setTimeout(() => {
            linkItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            platformSelect.focus();
        }, 100);
    }
    








    // Handle add social link button click
    if (addSocialLinkBtn) {
        addSocialLinkBtn.addEventListener('click', function() {
            addNewSocialLink();
        });
    }
    







    // Handle remove social link button clicks (delegated event)
    socialLinksContainer.addEventListener('click', function(e) {
        if (e.target.closest('.remove-social-link')) {
            const linkItem = e.target.closest('.social-link-item');
            if (linkItem) {
                linkItem.classList.add('removing');
                setTimeout(() => linkItem.remove(), 300);
            }
        }
    });
    






    // Update platform icons in preview
    function updatePlatformIcons() {
        document.querySelectorAll('.social-platform').forEach(platformElement => {
            const platform = platformElement.dataset.platform;
            if (platform && socialPlatforms[platform]) {
                platformElement.innerHTML = `
                    <i class="bi ${socialPlatforms[platform].icon}"></i>
                    ${socialPlatforms[platform].name}
                `;
            }
        });
    }
    






    // Update when platforms change
    socialLinksContainer.addEventListener('change', function(e) {
        if (e.target.name === 'social_platforms[]') {
            updatePlatformIcons();
        }
    });
    







    // Initialize existing social links
    document.querySelectorAll('input[name="social_platforms[]"]').forEach(input => {
        input.insertAdjacentHTML('beforebegin', `
            <div class="input-group-prepend">
                <span class="input-group-text">
                    <i class="bi ${socialPlatforms[input.value]?.icon || 'bi-link-45deg'}"></i>
                </span>
            </div>
        `);
    });
    




    // Initial update
    updatePlatformIcons();













// Resume Preview Scaling Functionality
    const resumePreview = document.getElementById('resumePreview');
    let currentScale = 1;
    const minScale = 0.7;
    const maxScale = 1;
    
    // Create scaling controls
    const scaleControls = document.createElement('div');
    scaleControls.className = 'scale-controls';
    scaleControls.innerHTML = `
        <button id="zoomOutBtn" title="Zoom Out">-</button>
        <span id="scaleValue">100%</span>
        <button id="zoomInBtn" title="Zoom In">+</button>
    `;
    resumePreview.appendChild(scaleControls);
    





    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'resume-content';
    resumePreview.insertBefore(contentContainer, resumePreview.firstChild);
    






    // Function to update preview content
    // Update the updatePreview function to include all sections
    function updatePreview() {
        const formData = new FormData(form);
        
        // Get all form data including dynamically added sections
        const formElements = form.elements;
        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            if (element.name && !formData.has(element.name)) {
                if (element.type === 'checkbox') {
                    formData.append(element.name, element.checked);
                } else {
                    formData.append(element.name, element.value);
                }
            }
        }

        // Get the selected template
        const templateSelector = document.getElementById('templateSelector');
        const selectedTemplate = templateSelector ? templateSelector.value : 'temp_1';
        formData.append('template', selectedTemplate);
        
        fetch('/resumes/preview/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.preview_html) {
                previewContainer.innerHTML = data.preview_html;
            }
        })
        .catch(error => {
            console.error('Error updating preview:', error);
        });
    }










    // Add event listeners for all dynamic sections
    function setupDynamicSections() {
        // Skills
        document.getElementById('addSkillBtn')?.addEventListener('click', function() {
            addNewSkill();
            updatePreview();
        });
        
        // Education
        document.getElementById('addEducationBtn')?.addEventListener('click', function() {
            addNewEducation();
            updatePreview();
        });
        
        // Experience
        document.getElementById('addExperienceBtn')?.addEventListener('click', function() {
            addNewExperience();
            updatePreview();
        });
        
        // Projects
        document.getElementById('addProjectBtn')?.addEventListener('click', function() {
            addNewProject();
            updatePreview();
        });
        
        // Certificates
        document.getElementById('addCertificateBtn')?.addEventListener('click', function() {
            addNewCertificate();
            updatePreview();
        });
        
        // Achievements
        document.getElementById('addAchievementBtn')?.addEventListener('click', function() {
            addNewAchievement();
            updatePreview();
        });
        
        // Social Links
        document.getElementById('addSocialLinkBtn')?.addEventListener('click', function() {
            addNewSocialLink();
            updatePreview();
        });
        
        // Delegated event listeners for remove buttons
        document.addEventListener('click', function(e) {
            if (e.target.closest('.remove-skill')) {
                removeItem(e.target.closest('.skill-item'));
                updatePreview();
            }
            if (e.target.closest('.remove-education')) {
                removeItem(e.target.closest('.education-item'));
                updatePreview();
            }
            if (e.target.closest('.remove-experience')) {
                removeItem(e.target.closest('.experience-item'));
                updatePreview();
            }
            if (e.target.closest('.remove-project')) {
                removeItem(e.target.closest('.project-item'));
                updatePreview();
            }
            if (e.target.closest('.remove-certificate')) {
                removeItem(e.target.closest('.certificate-item'));
                updatePreview();
            }
            if (e.target.closest('.remove-achievement')) {
                removeItem(e.target.closest('.achievement-item'));
                updatePreview();
            }
            if (e.target.closest('.remove-social-link')) {
                removeItem(e.target.closest('.social-link-item'));
                updatePreview();
            }
            if (e.target.closest('.remove-responsibility')) {
                removeItem(e.target.closest('.responsibility-item'));
                updatePreview();
            }
        });
    }
    











    // Function to fit content to one page
    function fitToSinglePage() {
        const paperHeight = resumePreview.offsetHeight;
        const contentHeight = contentContainer.scrollHeight;
        
        if (contentHeight > paperHeight) {
            // Calculate required scale
            const newScale = Math.min(maxScale, Math.max(minScale, paperHeight / contentHeight * 0.95));
            currentScale = newScale;
            contentContainer.style.transform = `scale(${newScale})`;
            document.getElementById('scaleValue').textContent = `${Math.round(newScale * 100)}%`;
            
            // Enable compact mode if needed
            if (newScale <= minScale * 1.1) {
                resumePreview.classList.add('compact-mode');
            } else {
                resumePreview.classList.remove('compact-mode');
            }
        } else {
            // Reset to full size if content fits
            currentScale = 1;
            contentContainer.style.transform = 'scale(1)';
            document.getElementById('scaleValue').textContent = '100%';
            resumePreview.classList.remove('compact-mode');
        }
    }
    










    // Zoom controls
    document.getElementById('zoomOutBtn').addEventListener('click', function() {
        currentScale = Math.max(minScale, currentScale - 0.05);
        contentContainer.style.transform = `scale(${currentScale})`;
        document.getElementById('scaleValue').textContent = `${Math.round(currentScale * 100)}%`;
        fitToSinglePage();
    });
    document.getElementById('zoomInBtn').addEventListener('click', function() {
        currentScale = Math.min(maxScale, currentScale + 0.05);
        contentContainer.style.transform = `scale(${currentScale})`;
        document.getElementById('scaleValue').textContent = `${Math.round(currentScale * 100)}%`;
        fitToSinglePage();
    });
    






    // Initial setup
    updatePreviewContent();
    
    // Fit content initially and on changes
    fitToSinglePage();
    new ResizeObserver(fitToSinglePage).observe(contentContainer);
    
    // Also fit when window resizes
    window.addEventListener('resize', fitToSinglePage);
});




















document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('resumeForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect all form data including dynamically added fields
        const formData = new FormData(form);
        
        // Manually add checkbox values since they might be missed
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            formData.append(checkbox.name, checkbox.checked);
        });
        
        // Add all responsibility descriptions
        document.querySelectorAll('input[name="responsibility_descriptions[]"]').forEach(input => {
            if (!formData.has('responsibility_descriptions[]')) {
                formData.append('responsibility_descriptions[]', input.value);
            }
        });
        
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.resume_id) {
                    // Update form action for future edits
                    form.action = `/resumes/edit/${data.resume_id}/`;
                }
                alert('Resume saved successfully!');
            } else {
                alert('Error saving resume: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while saving the resume');
        });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('resumeForm');
    const previewContainer = document.getElementById('resumePreview');
    const isNewResume = form.action.includes('new');

    // Initialize form
    function initializeForm() {
        if (isNewResume) {
            // New resume specific setup
            document.querySelectorAll('.remove-skill, .remove-education').forEach(btn => {
                btn.style.display = 'none';
            });
        } else {
            // Existing resume setup
            setupDynamicSections();
            updatePreview();
        }
    }

    // Setup dynamic sections
    function setupDynamicSections() {
        // Skills
        document.getElementById('addSkillBtn').addEventListener('click', addSkill);
        
        // Education
        document.getElementById('addEducationBtn').addEventListener('click', addEducation);
        
        // Remove handlers
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-skill')) {
                e.target.closest('.skill-item').remove();
                updatePreview();
            }
            if (e.target.classList.contains('remove-education')) {
                e.target.closest('.education-item').remove();
                updatePreview();
            }
        });
    }

    // Add new skill
    function addSkill() {
        const container = document.getElementById('skillsContainer');
        const newSkill = document.createElement('div');
        newSkill.className = 'skill-item mb-3';
        newSkill.innerHTML = `
            <div class="d-flex align-items-center">
                <input type="text" class="form-control me-2 skill-input" name="skill_names[]" placeholder="Skill name">
                <select class="form-select skill-level" name="skill_levels[]" style="width: 120px;">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                </select>
                <button type="button" class="btn btn-sm btn-outline-danger ms-2 remove-skill">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(newSkill);
        setupInputListeners(newSkill);
    }

    // Add new education
    function addEducation() {
        const container = document.getElementById('educationContainer');
        const newEducation = document.createElement('div');
        newEducation.className = 'education-item mb-4 p-3 border rounded';
        newEducation.innerHTML = `
            <div class="mb-3">
                <label class="form-label">Institution</label>
                <input type="text" class="form-control" name="education_institutions[]" placeholder="University Name">
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Degree</label>
                    <input type="text" class="form-control" name="education_degrees[]" placeholder="B.Tech/BE">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Field of Study</label>
                    <input type="text" class="form-control" name="education_fields[]" placeholder="Computer Science">
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Start Year</label>
                    <input type="month" class="form-control" name="education_start_years[]">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">End Year</label>
                    <input type="month" class="form-control" name="education_end_years[]">
                    <div class="form-check mt-2">
                        <input class="form-check-input" type="checkbox" name="education_current[]">
                        <label class="form-check-label">Currently studying</label>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" name="education_descriptions[]" rows="3"></textarea>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-education">
                <i class="bi bi-trash"></i> Remove
            </button>
        `;
        container.appendChild(newEducation);
        setupInputListeners(newEducation);
    }

    // Setup input listeners for real-time updates
    function setupInputListeners(element) {
        element.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('input', debounce(updatePreview, 500));
            input.addEventListener('change', debounce(updatePreview, 500));
        });
    }

    // Update preview
    function updatePreview() {
        const formData = new FormData(form);
        
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.preview_html) {
                previewContainer.innerHTML = data.preview_html;
            }
        });
    }

    // Form submission
    form.addEventListener('submit', function(e) {
        if (isNewResume) return; // Let default submission handle new resumes
        
        e.preventDefault();
        submitResumeForm(form);
    });

    function submitResumeForm(form) {
        const formData = new FormData(form);
        
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Resume saved successfully!');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to save resume');
        });
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
    
    // Setup listeners for existing inputs
    document.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('input', debounce(updatePreview, 500));
        input.addEventListener('change', debounce(updatePreview, 500));
    });
});














// complete file functionlity
document.addEventListener('DOMContentLoaded', function() {
    // Avatar preview functionality
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarPreviewContainer = document.getElementById('avatarPreviewContainer');
    const currentAvatar = document.getElementById('currentAvatar');
    
    if (avatarInput) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    avatarPreview.src = event.target.result;
                    avatarPreviewContainer.style.display = 'block';
                    if (currentAvatar) {
                        currentAvatar.style.display = 'none';
                    }
                }
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Summary character counter
    const summaryTextarea = document.querySelector('textarea[name="summary"]');
    const summaryCounter = document.getElementById('summaryCounter');
    
    if (summaryTextarea && summaryCounter) {
        // Initialize counter
        summaryCounter.textContent = summaryTextarea.value.length;
        
        // Update counter on input
        summaryTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            summaryCounter.textContent = currentLength;
            
            // Optional: Add warning when approaching limit
            if (currentLength > 280) {
                summaryCounter.style.color = '#dc3545';
            } else {
                summaryCounter.style.color = 'inherit';
            }
            
            // Enforce max length (optional)
            if (currentLength > 300) {
                this.value = this.value.substring(0, 300);
                summaryCounter.textContent = 300;
            }
        });
    }
});















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
});






















// Skills Section 
document.addEventListener('DOMContentLoaded', function() {
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
});



















// Education Section Functionality
document.addEventListener('DOMContentLoaded', function() {
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
});






















// Experience Section Functionality
document.addEventListener('DOMContentLoaded', function() {
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
});




















// Projects Section Functionality
document.addEventListener('DOMContentLoaded', function() {
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
});
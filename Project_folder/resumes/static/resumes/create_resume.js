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
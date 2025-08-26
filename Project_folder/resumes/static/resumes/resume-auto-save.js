document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('resumeForm');
    if (!form) return;  // Exit if form not found
    
    let currentResumeId = null;
    const resumeIdInput = form.querySelector('[name="resume_id"]');
    if (resumeIdInput && resumeIdInput.value) {
        currentResumeId = resumeIdInput.value;
    }

    let saveTimeout = null;
    let isSaving = false;
    let pendingChanges = false;
    let lastSavedData = null;

    // Create saving indicator
    const savingIndicator = document.createElement('div');
    savingIndicator.className = 'saving-indicator';
    savingIndicator.innerHTML = '<span class="saving-spinner"></span>Saving...';
    document.body.appendChild(savingIndicator);

    // Function to collect form data
    function collectFormData() {
        const formData = new FormData();
        
        // Get resume_id and csrf token
        const resumeIdInput = form.querySelector('[name="resume_id"]');
        const csrfToken = form.querySelector('[name="csrfmiddlewaretoken"]');
        
        // Always include the current resume ID if we have one
        if (currentResumeId) {
            formData.append('resume_id', currentResumeId);
        } else if (resumeIdInput && resumeIdInput.value) {
            formData.append('resume_id', resumeIdInput.value);
        }
        
        if (csrfToken) formData.append('csrfmiddlewaretoken', csrfToken.value);

        // Handle basic fields
        const basicFields = ['title', 'template', 'full_name', 'email', 'phone', 'summary'];
        basicFields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input && input.value) {
                formData.append(field, input.value);
            }
        });

        // Handle file upload
        const avatar = form.querySelector('[name="avatar"]');
        if (avatar && avatar.files && avatar.files[0]) {
            formData.append('avatar', avatar.files[0]);
        }

        // Handle arrays with indices
        const arrayFields = {
            skills: ['skill_names', 'skill_categories'],
            education: ['education_institutions', 'education_degrees', 'education_fields', 
                       'education_start_years', 'education_end_years', 'education_current',
                       'education_descriptions', 'education_gpas', 'education_percentages'],
            experience: ['experience_organizations', 'experience_positions', 'experience_start_dates',
                        'experience_end_dates', 'experience_current', 'experience_descriptions'],
            projects: ['project_titles', 'project_start_dates', 'project_end_dates',
                      'project_urls', 'project_descriptions'],
            certificates: ['certificate_titles', 'certificate_organizations', 'certificate_issue_dates',
                         'certificate_expiration_dates', 'certificate_ids', 'certificate_urls',
                         'certificate_descriptions'],
            achievements: ['achievement_titles', 'achievement_dates', 'achievement_descriptions'],
            social: ['social_platforms', 'social_urls']
        };

        // Process each section's array fields
        Object.entries(arrayFields).forEach(([section, fields]) => {
            // Get all items in the section
            const items = document.querySelectorAll(`.${section}-item`);
            
            items.forEach((item, index) => {
                // Process each field for this item
                fields.forEach(fieldName => {
                    const input = item.querySelector(`[name="${fieldName}[]"]`);
                    if (input) {
                        if (input.type === 'checkbox') {
                            formData.append(`${fieldName}[]`, input.checked);
                        } else if (input.value.trim()) {
                            formData.append(`${fieldName}[]`, input.value.trim());
                        }
                    }
                });

                // Special handling for responsibilities in experience section
                if (section === 'experience') {
                    const responsibilities = item.querySelectorAll('.responsibility-input');
                    responsibilities.forEach(resp => {
                        if (resp.value.trim()) {
                            formData.append(`experience_${index}_responsibilities[]`, resp.value.trim());
                        }
                    });
                }
            });
        });

        // Handle dynamic responsibility fields for experiences
        const experiences = document.querySelectorAll('.experience-item');
        experiences.forEach((exp, index) => {
            const responsibilities = exp.querySelectorAll('.responsibility-input');
            responsibilities.forEach(resp => {
                if (resp.value) {
                    formData.append(`experience_${index}_responsibilities[]`, resp.value);
                }
            });
        });

        return formData;
    }

    async function saveFormData() {
        if (isSaving) {
            pendingChanges = true;
            return;
        }

        try {
            isSaving = true;
            showSavingIndicator();

            const formData = collectFormData();
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();
            if (data.success) {
                if (data.resume_id) {
                    currentResumeId = data.resume_id;
                    const resumeIdInput = form.querySelector('[name="resume_id"]');
                    if (resumeIdInput) {
                        resumeIdInput.value = currentResumeId;
                    }
                    // Update URL to reflect the resume ID
                    const currentPath = window.location.pathname;
                    if (currentPath.includes('/create')) {
                        const newUrl = currentPath.replace(/\/create\/?$/, `/edit/${currentResumeId}`);
                        window.history.replaceState({}, '', newUrl);
                    }
                }
                showToast('Changes saved successfully');
                updatePreview();
            } else {
                throw new Error(data.error || 'Save failed');
            }
        } catch (error) {
            console.error('Save failed:', error);
            showToast('Failed to save changes: ' + error.message, 'error');
        } finally {
            isSaving = false;
            hideSavingIndicator();
            
            if (pendingChanges) {
                pendingChanges = false;
                saveFormData();
            }
        }
    }

    async function updatePreview() {
        try {
            const formData = collectFormData();
            const response = await fetch('/resumes/preview/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Preview update failed');
            }

            const data = await response.text();
            const previewElement = document.getElementById('resumePreview');
            if (previewElement) {
                previewElement.innerHTML = data;
            }
        } catch (error) {
            console.error('Preview update failed:', error);
            showToast('Failed to update preview', 'error');
        }
    }

    function triggerSave() {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        saveTimeout = setTimeout(saveFormData, 500);
    }

    // Set up form change listeners
    function addChangeListeners(element) {
        element.querySelectorAll('input, textarea, select').forEach(input => {
            if (input.type === 'file') {
                input.addEventListener('change', triggerSave);
            } else {
                input.addEventListener('input', triggerSave);
                input.addEventListener('change', triggerSave);
            }
        });
    }

    // Watch for dynamic elements
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    addChangeListeners(node);
                }
            });
        });
    });

    observer.observe(form, { childList: true, subtree: true });

    // Initial setup
    addChangeListeners(form);

    function showSavingIndicator() {
        savingIndicator.style.display = 'block';
    }

    function hideSavingIndicator() {
        savingIndicator.style.display = 'none';
    }

    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container') || createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}-toast`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    // Handle form submission
    form.addEventListener('submit', function(e) {
        if (!e.submitter || !e.submitter.formAction) {
            e.preventDefault();
            saveFormData();
        }
    });

    // Save before unload
    window.addEventListener('beforeunload', function(e) {
        if (saveTimeout) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
}); // End of DOMContentLoaded event listener

    // Create saving indicator
    const savingIndicator = document.createElement('div');
    savingIndicator.className = 'saving-indicator';
    savingIndicator.innerHTML = '<span class="saving-spinner"></span>Saving...';
    document.body.appendChild(savingIndicator);

    // Function to collect form data
    function collectFormData() {
        const formData = new FormData(form);
        
        document.querySelectorAll('input, textarea, select').forEach(input => {
            if (!formData.has(input.name) && input.name) {
                if (input.type === 'checkbox') {
                    formData.append(input.name, input.checked);
                } else if (input.value) {
                    formData.append(input.name, input.value);
                }
            }
        });
        
        return formData;
    }

    async function saveFormData() {
        if (isSaving) {
            pendingChanges = true;
            return;
        }

        try {
            isSaving = true;
            showSavingIndicator();

            const formData = collectFormData();
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                if (data.resume_id) {
                    const resumeIdInput = form.querySelector('[name="resume_id"]');
                    if (resumeIdInput) {
                        resumeIdInput.value = data.resume_id;
                    }
                }
                showToast('Changes saved');
                updatePreview();
            } else {
                throw new Error(data.error || 'Save failed');
            }
        } catch (error) {
            console.error('Save failed:', error);
            showToast('Failed to save: ' + error.message, 'error');
        } finally {
            isSaving = false;
            hideSavingIndicator();
            
            if (pendingChanges) {
                pendingChanges = false;
                saveFormData();
            }
        }
    }

    function triggerSave() {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        saveTimeout = setTimeout(saveFormData, 500);
    }

    function addChangeListeners(element) {
        element.querySelectorAll('input, textarea, select').forEach(input => {
            if (input.type === 'file') {
                input.addEventListener('change', triggerSave);
            } else {
                input.addEventListener('input', triggerSave);
                input.addEventListener('change', triggerSave);
            }
        });
    }

    addChangeListeners(form);

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    addChangeListeners(node);
                }
            });
        });
    });

    observer.observe(form, { childList: true, subtree: true });

    function showSavingIndicator() {
        savingIndicator.style.display = 'block';
    }

    function hideSavingIndicator() {
        savingIndicator.style.display = 'none';
    }

    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container') || createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}-toast`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    form.addEventListener('submit', function(e) {
        if (!e.submitter || !e.submitter.formAction) {
            e.preventDefault();
            saveFormData();
        }
    });

    window.addEventListener('beforeunload', function(e) {
        if (saveTimeout) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
});
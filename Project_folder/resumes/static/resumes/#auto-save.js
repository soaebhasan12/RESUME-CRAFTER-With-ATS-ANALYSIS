// Auto-save functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('resumeForm');
    if (!form) return;
    
    let autoSaveTimeout;
    let currentResumeId = form.querySelector('[name="resume_id"]').value;
    let lastSaveTime = Date.now();

    // Debounce function to prevent too many saves
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Function to collect form data
    function collectFormData() {
        const formData = new FormData(form);
        
        // Add all dynamic fields
        document.querySelectorAll('input, textarea, select').forEach(input => {
            if (!formData.has(input.name)) {
                if (input.type === 'checkbox') {
                    formData.append(input.name, input.checked);
                } else {
                    formData.append(input.name, input.value);
                }
            }
        });
        
        return formData;
    }

    // Function to auto-save form data
    async function autoSave() {
        if (Date.now() - lastSaveTime < 2000) return; // Don't save more often than every 2 seconds
        
        const formData = collectFormData();
        try {
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
                lastSaveTime = Date.now();
                if (data.resume_id) {
                    currentResumeId = data.resume_id;
                    form.querySelector('[name="resume_id"]').value = currentResumeId;
                }
                console.log('Auto-saved successfully');
            } else {
                console.error('Auto-save failed:', data.error);
            }
        } catch (error) {
            console.error('Auto-save error:', error);
        }
    }

    // Function to update preview
    async function updatePreview() {
        const formData = collectFormData();
        
        try {
            const response = await fetch('/resumes/preview/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const data = await response.text();
            document.getElementById('resumePreview').innerHTML = data;
        } catch (error) {
            console.error('Preview update failed:', error);
        }
    }

    // Function to save form data
    async function autoSave() {
        const formData = collectFormData();
        
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                'X-Requested-With': 'XMLHttpRequest',
                'X-Auto-Save': 'true'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.resume_id && isNewResume) {
                    // Update form action for future edits
                    currentResumeId = data.resume_id;
                    const newUrl = `/resumes/${data.resume_id}/edit/`;
                    form.action = newUrl;
                    window.history.pushState({}, '', newUrl);
                    isNewResume = false;
                }
                // Update last saved indicator
                updateLastSavedStatus();
            }
        })
        .catch(error => console.error('Auto-save failed:', error));
    }

    // Function to update last saved status
    function updateLastSavedStatus() {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            statusElement.textContent = 'Last saved: ' + new Date().toLocaleTimeString();
        }
    }

    // Add save status indicator to the form
    const statusDiv = document.createElement('div');
    statusDiv.id = 'saveStatus';
    statusDiv.className = 'text-muted small ms-2';
    statusDiv.textContent = 'All changes saved';
    document.querySelector('.form-actions').firstElementChild.appendChild(statusDiv);

    // Add event listeners for form changes
    const debouncedAutoSave = debounce(autoSave, 2000); // Wait 2 seconds after last change
    const debouncedPreviewUpdate = debounce(updatePreview, 1000); // Update preview more frequently

    // Listen for changes on all form elements
    form.addEventListener('input', function(e) {
        debouncedAutoSave();
        debouncedPreviewUpdate();
    });

    // Listen for changes in dynamic elements (added after page load)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        node.querySelectorAll('input, textarea, select').forEach(input => {
                            input.addEventListener('input', function() {
                                debouncedAutoSave();
                                debouncedPreviewUpdate();
                            });
                        });
                    }
                });
            }
        });
    });

    // Start observing changes in form containers
    const containers = [
        'skillsContainer',
        'educationContainer',
        'experienceContainer',
        'projectsContainer',
        'certificatesContainer',
        'achievementsContainer',
        'socialLinksContainer'
    ];

    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            observer.observe(container, { childList: true, subtree: true });
        }
    });
});

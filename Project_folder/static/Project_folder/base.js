// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeSwitcher = document.getElementById('theme-switcher');
    const html = document.documentElement;
    
    // Check for saved theme preference
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);
    
    // Toggle theme on button click
    themeSwitcher.addEventListener('click', function() {
        const newTheme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme stylesheet
        // document.getElementById('theme-style').href = `/static/css/theme-${newTheme}.css`;
        document.getElementById('theme-style').href = `/static/Blog_main/theme-${newTheme}.css`;
    });
});
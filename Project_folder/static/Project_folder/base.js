// Enhanced Theme Toggle with Font Awesome Icons
document.addEventListener('DOMContentLoaded', function() {
    const themeSwitcher = document.getElementById('theme-switcher');
    
    if (!themeSwitcher) {
        console.log('Theme switcher not found - skipping theme initialization');
        return;
    }

    const html = document.documentElement;
    const moonIcon = themeSwitcher.querySelector('.fa-moon');
    const sunIcon = themeSwitcher.querySelector('.fa-sun');
    
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    // Apply theme and icons
    html.setAttribute('data-theme', currentTheme);
    updateIcons(currentTheme);

    // Toggle theme on click
    themeSwitcher.addEventListener('click', function() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Update theme
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateIcons(newTheme);
        
        // Smooth transition
        html.classList.add('theme-transition');
        setTimeout(() => html.classList.remove('theme-transition'), 300);
    });

    // Update icons based on theme
    function updateIcons(theme) {
        if (theme === 'dark') {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
            sunIcon.style.color = '#ffd43b'; // Yellow color for sun
            themeSwitcher.setAttribute('aria-label', 'Switch to light mode');
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
            moonIcon.style.color = '#495057'; // Dark gray color for moon
            themeSwitcher.setAttribute('aria-label', 'Switch to dark mode');
        }
    }

    // Watch for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
            updateIcons(newTheme);
        }
    });
});









// document.addEventListener('DOMContentLoaded', function() {
//     // Theme toggle functionality
//     const themeToggle = document.getElementById('theme-toggle');
//     const themeIcon = themeToggle.querySelector('.theme-icon');
    
//     // Check for saved theme preference
//     const currentTheme = localStorage.getItem('theme') || 'light';
//     document.documentElement.setAttribute('data-theme', currentTheme);
//     updateThemeIcon(currentTheme);
    
//     // Toggle theme on button click
//     themeToggle.addEventListener('click', function() {
//         const currentTheme = document.documentElement.getAttribute('data-theme');
//         const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
//         document.documentElement.setAttribute('data-theme', newTheme);
//         localStorage.setItem('theme', newTheme);
//         updateThemeIcon(newTheme);
//     });
    
//     function updateThemeIcon(theme) {
//         themeIcon.textContent = theme === 'dark' ? '🌞' : '🌙';
//         themeToggle.setAttribute('aria-label', 
//             theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
//     }
// });
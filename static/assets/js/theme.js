document.addEventListener('DOMContentLoaded', function() {
        const themeToggle = document.getElementById('themeToggle');
        const logoImage = document.querySelector('.sidebar-header img');

        // Function to update the logo based on theme
        function updateLogo(theme) {
          if (theme === 'light') {
            logoImage.src = logoImage.src.replace('gpe.png', 'logo.png');
          } else {
            logoImage.src = logoImage.src.replace('logo.png', 'gpe.png');
          }
        }

        // Check for saved theme preference or use device preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

        // Set initial theme
        let initialTheme;
        if (savedTheme) {
          initialTheme = savedTheme;
        } else if (prefersDarkScheme.matches) {
          initialTheme = 'dark';
        } else {
          initialTheme = 'light';
        }

        document.documentElement.setAttribute('data-theme', initialTheme);
        updateLogo(initialTheme);

        // Toggle theme when button is clicked
        themeToggle.addEventListener('click', function() {
          const currentTheme = document.documentElement.getAttribute('data-theme');
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

          document.documentElement.setAttribute('data-theme', newTheme);
          localStorage.setItem('theme', newTheme);
          updateLogo(newTheme);
        });
      });
      document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const centralContent = document.querySelector('.central-content');

    // Check if sidebar state is stored in localStorage
    const sidebarState = localStorage.getItem('sidebarCollapsed');
    console.log('sidebarState:', sidebarState); // Debugging line
          /*
          if (sidebarState === 'true') {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('expanded');
      centralContent.classList.add('centered');
      sidebarToggle.classList.add('active');
    }else{
        mainContent.classList.add('blur');
    }
           */

    if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
      mainContent.classList.add('expanded');
      centralContent.classList.add('centered');
      sidebarToggle.classList.add('active');
    }
    // Toggle sidebar when the button is clicked
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('expanded');
      mainContent.classList.toggle('blur');
      sidebarToggle.classList.toggle('active');
      document.body.classList.toggle('sidebar-hidden');


      // Store sidebar state in localStorage
      const isCollapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem('sidebarCollapsed', isCollapsed);

      // Force a reflow to ensure animations work properly on mobile
      if (window.innerWidth <= 768) {
        sidebar.offsetHeight; // This triggers a reflow

      }
    });

    // Adjust for window resize
    window.addEventListener('resize', function() {
      // When resizing to desktop view, restore proper positioning
      if (window.innerWidth > 768 && sidebarToggle.classList.contains('active')) {
        mainContent.classList.add('expanded');
      }
    });
  });
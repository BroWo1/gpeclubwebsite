class MagazineReader {
  constructor(containerId, magazineId, totalPages) {
    this.container = document.getElementById(containerId);
    this.magazineId = magazineId;
    this.currentPage = 1;
    this.totalPages = totalPages;
    this.pageRendering = false;
    this.imageBaseUrl = `https://server.gpeclub.com:4000/${magazineId}/`;
    this.zoomLevel = 1;
    this.toolbarVisible = true;
    this.autoHideToolbarTimer = null;
    this.init();
  }

  init() {
    try {
      this.createReaderInterface();
      this.loadSpread(this.currentPage);
      this.updatePageCounter();
      this.setupToolbarAutoHide();
      this.setupKeyboardNavigation();
      this.syncWithSiteTheme();
    } catch (error) {
      console.error('Error initializing magazine reader:', error);
      this.container.innerHTML = `<div class="error-message">Failed to load magazine: ${error.message}</div>`;
    }
  }

  createReaderInterface() {
    this.container.innerHTML = `
      <div class="magazine-reader">
        <div class="reader-toolbar">
          <div class="nav-controls">
            <button class="btn-prev" aria-label="Previous page">&larr;</button>
            <span class="page-info">Page <span class="current-page">0</span> of <span class="total-pages">${this.totalPages}</span></span>
            <button class="btn-next" aria-label="Next page">&rarr;</button>
          </div>
          <div class="zoom-controls">
            <button class="btn-zoom-out" aria-label="Zoom out">−</button>
            <button class="btn-zoom-reset" aria-label="Reset zoom">100%</button>
            <button class="btn-zoom-in" aria-label="Zoom in">+</button>
            <button class="btn-fullscreen toolbar-btn" aria-label="Toggle fullscreen">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="loading-indicator">Loading page...</div>
        <div class="page-container">
          <div class="page-spread">
            <div class="page left-page">
              <img class="magazine-page" src="" alt="Left page" />
              <div class="page-corner left-corner"></div>
            </div>
            <div class="page right-page">
              <img class="magazine-page" src="" alt="Right page" />
              <div class="page-corner right-corner"></div>
            </div>
          </div>
          <div class="book-spine"></div>
        </div>
      </div>
    `;

    // Add event listeners
    this.container.querySelector('.btn-prev').addEventListener('click', () => this.prevPage());
    this.container.querySelector('.btn-next').addEventListener('click', () => this.nextPage());
    this.container.querySelector('.btn-zoom-in').addEventListener('click', () => this.zoom(0.1));
    this.container.querySelector('.btn-zoom-out').addEventListener('click', () => this.zoom(-0.1));
    this.container.querySelector('.btn-zoom-reset').addEventListener('click', () => this.resetZoom());
    this.container.querySelector('.btn-fullscreen').addEventListener('click', () => this.toggleFullscreen());

    // Page corner turn effect
    this.container.querySelector('.left-corner').addEventListener('click', () => this.nextPage());
    this.container.querySelector('.right-corner').addEventListener('click', () => this.prevPage());

    // Show/hide toolbar on mouse movement
    this.pageContainer = this.container.querySelector('.page-container');
    this.pageContainer.addEventListener('mousemove', () => this.showToolbar());

    this.addSwipeGestures();
  }
  // Modify the loadSpread method to handle cover page and layout resets
  loadSpread(pageNum) {
    if (this.pageRendering) return;

    this.pageRendering = true;
    const loadingIndicator = this.container.querySelector('.loading-indicator');
    loadingIndicator.style.display = 'flex';

    const leftPage = this.container.querySelector('.left-page img');
    const rightPage = this.container.querySelector('.right-page img');
    const leftPageElement = this.container.querySelector('.left-page');
    const rightPageElement = this.container.querySelector('.right-page');
    const leftCorner = this.container.querySelector('.left-corner');
    const rightCorner = this.container.querySelector('.right-corner');
    const pageSpreadElement = this.container.querySelector('.page-spread');
    // const isFullscreen = this.container.querySelector('.magazine-reader').classList.contains('fullscreen-mode'); // No longer strictly needed for cover positioning logic

    // --- Comprehensive Reset ---
    // Reset visibility for both page elements and their images
    leftPageElement.style.visibility = 'visible';
    rightPageElement.style.visibility = 'visible';
    leftPage.style.visibility = 'visible';
    rightPage.style.visibility = 'visible';

    // Reset display properties (ensure they are flex items)
    leftPageElement.style.display = 'flex';
    rightPageElement.style.display = 'flex';
    leftPage.style.display = 'block'; // Image display
    rightPage.style.display = 'block'; // Image display

    // Reset corners
    leftCorner.style.display = 'block';
    rightCorner.style.display = 'block';

    // Reset potentially conflicting inline styles
    rightPageElement.style.margin = '';
    rightPageElement.style.maxWidth = ''; // Remove max-width override
    leftPageElement.style.maxWidth = '';  // Remove max-width override
    pageSpreadElement.style.justifyContent = ''; // Use default flex alignment


    // Handle cover page (page 1)
    if (pageNum === 1) {
      const rightImageUrl = `${this.imageBaseUrl}${this.magazineId}_Page_1.jpg`;

      // Make left page invisible but keep its space in the layout
      leftPageElement.style.visibility = 'hidden';
      leftPage.style.visibility = 'hidden'; // Hide the image content too
      leftCorner.style.display = 'none'; // Hide the corner interaction

      // Clear the src for the hidden left page to avoid unnecessary loading/errors
      leftPage.src = '';
      leftPage.alt = '';

      // Load the cover image onto the right page
      rightPage.onload = () => {
        this.currentPage = pageNum;
        this.updatePageCounter();
        this.pageRendering = false;
        loadingIndicator.style.display = 'none';
      };
      rightPage.onerror = () => {
        console.error(`Failed to load cover image: ${rightImageUrl}`);
        this.pageRendering = false;
        loadingIndicator.style.display = 'none';
        rightPage.alt = `Failed to load cover`;
        rightPage.src = `/static/imgs/page_error.png`; // Provide a fallback image
      };
      rightPage.src = rightImageUrl;
      rightPage.alt = `Cover`;

    }
    // Handle regular spreads (pages 2-3, 4-5, etc.)
    else {
      // Visibility/Display already reset above

      const leftPageNum = pageNum;
      const rightPageNum = pageNum + 1;

      const leftImageUrl = `${this.imageBaseUrl}${this.magazineId}_Page_${leftPageNum}.jpg`;
      const rightImageUrl = `${this.imageBaseUrl}${this.magazineId}_Page_${rightPageNum}.jpg`;

      let pagesToLoad = 0;
      let pagesLoaded = 0;

      // --- Left Page Loading ---
      pagesToLoad++;
      leftPage.onload = () => pageLoadHandler();
      leftPage.onerror = () => {
        console.error(`Failed to load image: ${leftImageUrl}`);
        leftPage.alt = `Failed to load page ${leftPageNum}`;
        leftPage.src = `/static/imgs/page_error.png`;
        pageLoadHandler(); // Still count as "loaded" (with error)
      };
      leftPage.src = leftImageUrl;
      leftPage.alt = `Page ${leftPageNum}`;

      // --- Right Page Loading (if exists) ---
      if (rightPageNum <= this.totalPages) {
        pagesToLoad++;
        rightPage.onload = () => pageLoadHandler();
        rightPage.onerror = () => {
          console.error(`Failed to load image: ${rightImageUrl}`);
          rightPage.alt = `Failed to load page ${rightPageNum}`;
          rightPage.src = `/static/imgs/page_error.png`;
          pageLoadHandler(); // Still count as "loaded" (with error)
        };
        rightPage.src = rightImageUrl;
        rightPage.alt = `Page ${rightPageNum}`;
      } else {
        // Last page is odd, make the right page invisible but keep space
        rightPageElement.style.visibility = 'hidden';
        rightPage.style.visibility = 'hidden';
        rightCorner.style.display = 'none';
        rightPage.src = ''; // Clear src
        rightPage.alt = '';
      }

      // --- Page Load Handler ---
      const pageLoadHandler = () => {
        pagesLoaded++;
        if (pagesLoaded === pagesToLoad) {
          this.currentPage = pageNum;
          this.updatePageCounter();
          this.pageRendering = false;
          loadingIndicator.style.display = 'none';
        }
      };
    }
  }

  prevPage() {
    if (this.currentPage === 1) return;

    this.animatePageTurn('right');

    if (this.currentPage === 2) {
      // From page 2-3 to cover (page 1)
      this.loadSpread(1);
    } else {
      // From page 4-5 or later, go back 2 pages
      this.loadSpread(this.currentPage - 2);
    }
  }

  nextPage() {
    if (this.currentPage === 1) {
      // From cover to page 2-3
      this.animatePageTurn('left');
      this.loadSpread(2);
    } else if (this.currentPage + 2 <= this.totalPages) {
      // Normal spread navigation
      this.animatePageTurn('left');
      this.loadSpread(this.currentPage + 2);
    }
  }

  updatePageCounter() {
    const currentPageElem = this.container.querySelector('.current-page');
    if (this.currentPage === 1) {
      currentPageElem.textContent = "Cover";
    } else {
      const endPage = Math.min(this.currentPage + 1, this.totalPages);
      currentPageElem.textContent = `${this.currentPage}-${endPage}`;
    }
  }

  zoom(delta) {
    const pages = this.container.querySelectorAll('.magazine-page');
    this.zoomLevel += delta;

    if (this.zoomLevel < 0.8) this.zoomLevel = 0.8;
    if (this.zoomLevel > 1.1) this.zoomLevel = 1.2;

    const zoomPercent = Math.round(this.zoomLevel * 100);
    this.container.querySelector('.btn-zoom-reset').textContent = `${zoomPercent}%`;

    pages.forEach(img => {
      img.style.transform = `scale(${this.zoomLevel})`;
    });
  }

  resetZoom() {
    const pages = this.container.querySelectorAll('.magazine-page');
    this.zoomLevel = 1;
    this.container.querySelector('.btn-zoom-reset').textContent = '100%';

    pages.forEach(img => {
      img.style.transform = 'scale(1)';
    });
  }
animatePageTurn(direction) {
  const pageContainer = this.container.querySelector('.page-container');
  const isFullscreen = this.container.querySelector('.magazine-reader').classList.contains('fullscreen-mode');

  if (direction === 'left') {
    // Going to next page, animate right page turning
    const rightPage = this.container.querySelector('.right-page');
    if (rightPage) {
      const clone = rightPage.cloneNode(true);
      clone.classList.add('turning-page', 'turning-right-page');
      pageContainer.appendChild(clone);

      // Position the clone correctly, especially in fullscreen mode
      if (isFullscreen) {
        // Get the position of the original right page
        const rect = rightPage.getBoundingClientRect();
        const containerRect = pageContainer.getBoundingClientRect();

        // Set the clone's position to match the original
        clone.style.position = 'absolute';
        clone.style.top = `${rect.top - containerRect.top}px`;
        clone.style.left = `${rect.left - containerRect.left}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
      }

      // Apply the turning animation
      setTimeout(() => {
        clone.classList.add('turn-left');
      }, 10);

      setTimeout(() => {
        clone.remove();
      }, 500);
    }
  } else {
    // Going to previous page, animate left page turning
    const leftPage = this.container.querySelector('.left-page');
    if (leftPage) {
      const clone = leftPage.cloneNode(true);
      clone.classList.add('turning-page', 'turning-left-page');
      pageContainer.appendChild(clone);

      // Position the clone correctly, especially in fullscreen mode
      if (isFullscreen) {
        // Get the position of the original left page
        const rect = leftPage.getBoundingClientRect();
        const containerRect = pageContainer.getBoundingClientRect();

        // Set the clone's position to match the original
        clone.style.position = 'absolute';
        clone.style.top = `${rect.top - containerRect.top}px`;
        clone.style.left = `${rect.left - containerRect.left}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
      }

      // Apply the turning animation
      setTimeout(() => {
        clone.classList.add('turn-right');
      }, 10);

      setTimeout(() => {
        clone.remove();
      }, 500);
    }
  }
}
  addSwipeGestures() {
    const pageContainer = this.container.querySelector('.page-container');
    let startX;

    pageContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      this.showToolbar();
    });

    pageContainer.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;

      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this.nextPage();
        } else {
          this.prevPage();
        }
      }
    });
  }
toggleFullscreen() {
  const readerElement = this.container.querySelector('.magazine-reader');
  const wasFullscreen = readerElement.classList.contains('fullscreen-mode');

  // Toggle fullscreen class
  readerElement.classList.toggle('fullscreen-mode');

  // Check if entering or exiting fullscreen
  const isFullscreen = readerElement.classList.contains('fullscreen-mode');

  if (isFullscreen) {
    // Save the original dimensions to restore later
    readerElement.dataset.originalWidth = readerElement.style.width || '';
    readerElement.dataset.originalHeight = readerElement.style.height || '';
    readerElement.dataset.originalLeft = readerElement.style.left || '';

    // Check if sidebar is collapsed
    const sidebar = document.querySelector('.sidebar');
    const sidebarCollapsed = sidebar && sidebar.classList.contains('collapsed');

    // Apply appropriate positioning based on sidebar state
    if (sidebar && !sidebarCollapsed) {
      // If sidebar is visible, account for it
      const sidebarWidth = sidebar.offsetWidth;
      readerElement.style.left = `${sidebarWidth}px`;
      readerElement.style.width = `calc(100vw - ${sidebarWidth}px)`;
    } else {
      // If sidebar is collapsed or doesn't exist
      readerElement.style.left = '0';
      readerElement.style.width = '100vw';
    }

    // Ensure page spread scales correctly in fullscreen
    const pageSpread = this.container.querySelector('.page-spread');
    if (pageSpread) {
      pageSpread.style.maxHeight = '90vh';
      pageSpread.style.maxWidth = '90vw';
    }
  } else {
    // Restore original dimensions when exiting fullscreen
    readerElement.style.width = readerElement.dataset.originalWidth;
    readerElement.style.height = readerElement.dataset.originalHeight;
    readerElement.style.left = readerElement.dataset.originalLeft;

    // Reset page spread to original dimensions
    const pageSpread = this.container.querySelector('.page-spread');
    if (pageSpread) {
      pageSpread.style.maxHeight = '90%';
      pageSpread.style.maxWidth = '90%';
    }
  }

  // Reset zoom when entering/exiting fullscreen
  this.resetZoom();

  // Force a re-render of the current spread after a small delay
  // This helps with page display issues
  setTimeout(() => {
    if (this.currentPage) {
      this.loadSpread(this.currentPage);
    }
  }, 50);
}
  showToolbar() {
    const toolbar = this.container.querySelector('.reader-toolbar');
    toolbar.classList.remove('reader-toolbar-hidden');
    this.toolbarVisible = true;

    this.resetToolbarTimer();
  }

  hideToolbar() {
    if (!this.toolbarVisible) return;

    const toolbar = this.container.querySelector('.reader-toolbar');
    toolbar.classList.add('reader-toolbar-hidden');
    this.toolbarVisible = false;
  }

  resetToolbarTimer() {
    if (this.autoHideToolbarTimer) {
      clearTimeout(this.autoHideToolbarTimer);
    }

    this.autoHideToolbarTimer = setTimeout(() => {
      this.hideToolbar();
    }, 3000);
  }

  setupToolbarAutoHide() {
    // Initial toolbar timer
    this.resetToolbarTimer();

    // Keep toolbar visible when hovering over it
    const toolbar = this.container.querySelector('.reader-toolbar');
    toolbar.addEventListener('mouseenter', () => {
      if (this.autoHideToolbarTimer) {
        clearTimeout(this.autoHideToolbarTimer);
      }
    });

    toolbar.addEventListener('mouseleave', () => {
      this.resetToolbarTimer();
    });
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Only handle keys if this reader is visible in viewport
      const rect = this.container.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;

      if (!visible) return;

      switch (e.key) {
        case 'ArrowLeft':
          this.prevPage();
          break;
        case 'ArrowRight':
          this.nextPage();
          break;
        case '+':
          this.zoom(0.1);
          break;
        case '-':
          this.zoom(-0.1);
          break;
        case '0':
          this.resetZoom();
          break;
        case 'f':
        case 'F':
          this.toggleFullscreen();
          break;
      }
    });
  }

  syncWithSiteTheme() {
    // Apply current theme state
    const isDarkTheme = document.body.getAttribute('data-theme') !== 'light';
    const readerElement = this.container.querySelector('.magazine-reader');

    // Initially set theme
    if (isDarkTheme) {
      readerElement.classList.add('dark-theme');
    } else {
      readerElement.classList.remove('dark-theme');
    }

    // Listen for theme change events
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        // Short delay to let the site theme change first
        setTimeout(() => {
          const isDarkTheme = document.body.getAttribute('data-theme') !== 'light';
          if (isDarkTheme) {
            readerElement.classList.add('dark-theme');
          } else {
            readerElement.classList.remove('dark-theme');
          }
        }, 100);
      });
    }

    // Listen for sidebar collapse/expand
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        // Adjust reader fullscreen state if active
        if (readerElement.classList.contains('fullscreen-mode')) {
          setTimeout(() => this.toggleFullscreen(), 10);
          setTimeout(() => this.toggleFullscreen(), 600);
        }
      });
    }
  }
}
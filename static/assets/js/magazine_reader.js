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
    this.isMobileView = false; // Add state for mobile view
    this.init();
  }

  init() {
    try {
      this.createReaderInterface();
      this.checkLayout(); // Initial layout check
      this.loadSpread(this.currentPage);
      this.updatePageCounter();
      this.setupToolbarAutoHide();
      this.setupKeyboardNavigation();
      this.syncWithSiteTheme();
      window.addEventListener('resize', () => this.handleResize()); // Add resize listener
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

  checkLayout() {
    const wasMobile = this.isMobileView;
    this.isMobileView = window.matchMedia("(max-width: 768px)").matches;
    const readerElement = this.container.querySelector('.magazine-reader');

    if (this.isMobileView) {
      readerElement.classList.add('mobile-view');
    } else {
      readerElement.classList.remove('mobile-view');
    }

    // Return true if the layout mode changed
    return wasMobile !== this.isMobileView;
  }

  handleResize() {
    const layoutChanged = this.checkLayout();
    // If layout changed (e.g., desktop to mobile or vice-versa), reload the current view
    if (layoutChanged && this.currentPage) {
       // Ensure currentPage is valid for the new layout before reloading
       if (!this.isMobileView && this.currentPage % 2 !== 0 && this.currentPage !== 1) {
         // Switched to desktop, currently on an odd page (meant for right side)
         // Go back one page to show the correct spread start
         this.currentPage--;
       }
       this.loadSpread(this.currentPage);
       this.updatePageCounter(); // Update counter for new layout
    }
    // Adjust fullscreen positioning if active during resize
    if (this.container.querySelector('.magazine-reader').classList.contains('fullscreen-mode')) {
        this.adjustFullscreenLayout();
    }
  }

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

    // --- Comprehensive Reset ---
    leftPageElement.style.visibility = 'visible';
    rightPageElement.style.visibility = 'visible';
    leftPage.style.visibility = 'visible';
    rightPage.style.visibility = 'visible';

    leftPageElement.style.display = 'flex';
    rightPageElement.style.display = 'flex';
    leftPage.style.display = 'block';
    rightPage.style.display = 'block';

    leftCorner.style.display = 'block';
    rightCorner.style.display = 'block';

    rightPageElement.style.margin = '';
    rightPageElement.style.maxWidth = '';
    leftPageElement.style.maxWidth = '';
    pageSpreadElement.style.justifyContent = '';

    // --- Mobile View Logic ---
    if (this.isMobileView) {
      leftPageElement.style.display = 'none';
      leftPage.src = '';
      leftPage.alt = '';
      leftCorner.style.display = 'none';

      rightPageElement.style.visibility = 'visible';
      rightPage.style.visibility = 'visible';
      rightPageElement.style.display = 'flex';
      rightPage.style.display = 'block';
      rightCorner.style.display = 'none';

      const imageUrl = `${this.imageBaseUrl}${this.magazineId}_Page_${pageNum}.jpg`;

      rightPage.onload = () => {
        this.currentPage = pageNum;
        this.updatePageCounter();
        this.pageRendering = false;
        loadingIndicator.style.display = 'none';
      };
      rightPage.onerror = () => {
        console.error(`Failed to load image: ${imageUrl}`);
        this.pageRendering = false;
        loadingIndicator.style.display = 'none';
        rightPage.alt = `Failed to load page ${pageNum}`;
        rightPage.src = `/static/imgs/page_error.png`;
      };
      rightPage.src = imageUrl;
      rightPage.alt = `Page ${pageNum}`;

      return;
    }

    // --- Desktop View Logic ---
    if (pageNum === 1) {
      const rightImageUrl = `${this.imageBaseUrl}${this.magazineId}_Page_1.jpg`;

      leftPageElement.style.visibility = 'hidden';
      leftPage.style.visibility = 'hidden';
      leftCorner.style.display = 'none';

      leftPage.src = '';
      leftPage.alt = '';

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
        rightPage.src = `/static/imgs/page_error.png`;
      };
      rightPage.src = rightImageUrl;
      rightPage.alt = `Cover`;

    } else {
      const leftPageNum = pageNum;
      const rightPageNum = pageNum + 1;

      const leftImageUrl = `${this.imageBaseUrl}${this.magazineId}_Page_${leftPageNum}.jpg`;
      const rightImageUrl = `${this.imageBaseUrl}${this.magazineId}_Page_${rightPageNum}.jpg`;

      let pagesToLoad = 0;
      let pagesLoaded = 0;

      pagesToLoad++;
      leftPage.onload = () => pageLoadHandler();
      leftPage.onerror = () => {
        console.error(`Failed to load image: ${leftImageUrl}`);
        leftPage.alt = `Failed to load page ${leftPageNum}`;
        leftPage.src = `/static/imgs/page_error.png`;
        pageLoadHandler();
      };
      leftPage.src = leftImageUrl;
      leftPage.alt = `Page ${leftPageNum}`;

      if (rightPageNum <= this.totalPages) {
        pagesToLoad++;
        rightPage.onload = () => pageLoadHandler();
        rightPage.onerror = () => {
          console.error(`Failed to load image: ${rightImageUrl}`);
          rightPage.alt = `Failed to load page ${rightPageNum}`;
          rightPage.src = `/static/imgs/page_error.png`;
          pageLoadHandler();
        };
        rightPage.src = rightImageUrl;
        rightPage.alt = `Page ${rightPageNum}`;
      } else {
        rightPageElement.style.visibility = 'hidden';
        rightPage.style.visibility = 'hidden';
        rightCorner.style.display = 'none';
        rightPage.src = '';
        rightPage.alt = '';
      }

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

    if (this.isMobileView) {
      this.animatePageTurn('right');
      this.loadSpread(this.currentPage - 1);
    } else {
      this.animatePageTurn('right');
      if (this.currentPage === 2) {
        this.loadSpread(1);
      } else {
        this.loadSpread(this.currentPage - 2);
      }
    }
  }

  nextPage() {
    if (this.isMobileView) {
      if (this.currentPage < this.totalPages) {
        this.animatePageTurn('left');
        this.loadSpread(this.currentPage + 1);
      }
    } else {
      if (this.currentPage === 1) {
        this.animatePageTurn('left');
        this.loadSpread(2);
      } else if (this.currentPage + 2 <= this.totalPages) {
        this.animatePageTurn('left');
        this.loadSpread(this.currentPage + 2);
      }
    }
  }

  updatePageCounter() {
    const currentPageElem = this.container.querySelector('.current-page');
    if (this.isMobileView) {
      currentPageElem.textContent = `${this.currentPage}`;
    } else {
      if (this.currentPage === 1) {
        currentPageElem.textContent = "Cover";
      } else {
        const endPage = Math.min(this.currentPage + 1, this.totalPages);
        currentPageElem.textContent = `${this.currentPage}-${endPage}`;
      }
    }
    this.container.querySelector('.total-pages').textContent = this.totalPages;
  }

  zoom(delta) {
    if (this.isMobileView) return;

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
    if (this.isMobileView) {
      return;
    }

    const pageContainer = this.container.querySelector('.page-container');
    const isFullscreen = this.container.querySelector('.magazine-reader').classList.contains('fullscreen-mode');

    if (direction === 'left') {
      const rightPage = this.container.querySelector('.right-page');
      if (rightPage) {
        const clone = rightPage.cloneNode(true);
        clone.classList.add('turning-page', 'turning-right-page');
        pageContainer.appendChild(clone);

        if (isFullscreen) {
          const rect = rightPage.getBoundingClientRect();
          const containerRect = pageContainer.getBoundingClientRect();

          clone.style.position = 'absolute';
          clone.style.top = `${rect.top - containerRect.top}px`;
          clone.style.left = `${rect.left - containerRect.left}px`;
          clone.style.width = `${rect.width}px`;
          clone.style.height = `${rect.height}px`;
        }

        setTimeout(() => {
          clone.classList.add('turn-left');
        }, 10);

        setTimeout(() => {
          clone.remove();
        }, 500);
      }
    } else {
      const leftPage = this.container.querySelector('.left-page');
      if (leftPage) {
        const clone = leftPage.cloneNode(true);
        clone.classList.add('turning-page', 'turning-left-page');
        pageContainer.appendChild(clone);

        if (isFullscreen) {
          const rect = leftPage.getBoundingClientRect();
          const containerRect = pageContainer.getBoundingClientRect();

          clone.style.position = 'absolute';
          clone.style.top = `${rect.top - containerRect.top}px`;
          clone.style.left = `${rect.left - containerRect.left}px`;
          clone.style.width = `${rect.width}px`;
          clone.style.height = `${rect.height}px`;
        }

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

  adjustFullscreenLayout() {
    const readerElement = this.container.querySelector('.magazine-reader');
    if (!readerElement.classList.contains('fullscreen-mode')) return;

    const sidebar = document.querySelector('.sidebar');
    const sidebarCollapsed = !sidebar || sidebar.classList.contains('collapsed');

    if (sidebar && !sidebarCollapsed && !this.isMobileView) {
      const sidebarWidth = sidebar.offsetWidth;
      readerElement.style.left = `${sidebarWidth}px`;
      readerElement.style.width = `calc(100vw - ${sidebarWidth}px)`;
    } else {
      readerElement.style.left = '0';
      readerElement.style.width = '100vw';
    }

    const pageSpread = this.container.querySelector('.page-spread');
    if (pageSpread) {
        if (this.isMobileView) {
            pageSpread.style.maxHeight = '95vh';
            pageSpread.style.maxWidth = '95vw';
        } else {
            pageSpread.style.maxHeight = '90vh';
            pageSpread.style.maxWidth = '90vw';
        }
    }
  }

  toggleFullscreen() {
    const readerElement = this.container.querySelector('.magazine-reader');
    const wasFullscreen = readerElement.classList.contains('fullscreen-mode');

    readerElement.classList.toggle('fullscreen-mode');
    const isFullscreen = readerElement.classList.contains('fullscreen-mode');

    if (isFullscreen) {
      readerElement.dataset.originalWidth = readerElement.style.width || '';
      readerElement.dataset.originalHeight = readerElement.style.height || '';
      readerElement.dataset.originalLeft = readerElement.style.left || '';
      this.adjustFullscreenLayout();
    } else {
      readerElement.style.width = readerElement.dataset.originalWidth;
      readerElement.style.height = readerElement.dataset.originalHeight;
      readerElement.style.left = readerElement.dataset.originalLeft;

      const pageSpread = this.container.querySelector('.page-spread');
      if (pageSpread) {
        pageSpread.style.maxHeight = '';
        pageSpread.style.maxWidth = '';
      }
    }

    this.resetZoom();

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
    this.resetToolbarTimer();

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
      const rect = this.container.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;

      if (!visible) return;

      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
          e.preventDefault();
      }

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
    const isDarkTheme = document.body.getAttribute('data-theme') !== 'light';
    const readerElement = this.container.querySelector('.magazine-reader');

    if (isDarkTheme) {
      readerElement.classList.add('dark-theme');
    } else {
      readerElement.classList.remove('dark-theme');
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
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

    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        if (this.container.querySelector('.magazine-reader').classList.contains('fullscreen-mode')) {
          setTimeout(() => this.adjustFullscreenLayout(), 300);
        }
      });
    }
  }
}
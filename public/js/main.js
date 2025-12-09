/**
 * Main JavaScript - Core Functionality
 * 
 * Handles mobile menu, smooth scrolling, testimonial carousel,
 * and general UI interactions.
 */

(function() {
  'use strict';

  // ==========================================================================
  // MOBILE MENU - COMPLETE REBUILD
  // ==========================================================================
  
  function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!mobileMenuToggle || !mainNav) {
      console.warn('Mobile menu elements not found');
      return;
    }

    let scrollPosition = 0;
    let isMenuOpen = false;

    function openMenu() {
      if (isMenuOpen) return;
      
      isMenuOpen = true;
      scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
      mainNav.classList.add('active');
      
      if (menuOverlay) {
        menuOverlay.classList.add('active');
        menuOverlay.setAttribute('aria-hidden', 'false');
      }
      
      document.body.classList.add('menu-open');
      
      if (window.innerWidth <= 768) {
        document.body.style.top = `-${scrollPosition}px`;
      }
    }

    function closeMenu() {
      if (!isMenuOpen) return;
      
      isMenuOpen = false;
      
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('active');
      
      if (menuOverlay) {
        menuOverlay.classList.remove('active');
        menuOverlay.setAttribute('aria-hidden', 'true');
      }
      
      document.body.classList.remove('menu-open');
      document.body.style.top = '';
      
      if (window.innerWidth <= 768) {
        window.scrollTo(0, scrollPosition);
      }
    }

    function toggleMenu() {
      if (isMenuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    // Toggle menu on button click
    mobileMenuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    // Close menu when clicking overlay
    if (menuOverlay) {
      menuOverlay.addEventListener('click', function(e) {
        e.preventDefault();
        closeMenu();
      });
    }

    // Close menu when clicking nav links
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          closeMenu();
        }
      });
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    });

    // Close menu on window resize if it becomes desktop size
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        if (window.innerWidth > 768 && isMenuOpen) {
          closeMenu();
        }
      }, 100);
    });
  }

  // Initialize mobile menu when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  } else {
    initMobileMenu();
  }

  // ==========================================================================
  // SMOOTH SCROLLING
  // ==========================================================================
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ==========================================================================
  // STICKY HEADER ON SCROLL
  // ==========================================================================
  
  const header = document.querySelector('.site-header');

  if (header) {
    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // ==========================================================================
  // FORM INPUT ANIMATION
  // ==========================================================================
  
  document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentElement.classList.remove('focused');
      }
    });
  });

  // Auto-resize textarea
  document.querySelectorAll('textarea').forEach(textarea => {
    textarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });
  });

  // ==========================================================================
  // ANIMATE NUMBERS ON SCROLL (FOR STATS)
  // ==========================================================================
  
  const animateValue = (element, start, end, duration) => {
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      element.textContent = prefix + value + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        entry.target.classList.add('animated');
        const targetValue = parseInt(entry.target.dataset.target || entry.target.textContent);
        if (!isNaN(targetValue)) {
          animateValue(entry.target, 0, targetValue, 2000);
        }
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number, .stat-value').forEach(stat => {
    statsObserver.observe(stat);
  });

  // ==========================================================================
  // SCROLL TO TOP BUTTON
  // ==========================================================================
  
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.className = 'scroll-to-top';
  scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
  scrollTopBtn.innerHTML = '↑';
  document.body.appendChild(scrollTopBtn);

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // ==========================================================================
  // UPDATE GRID BACKGROUND HEIGHT
  // ==========================================================================
  
  const gridBackground = document.getElementById('grid-background');
  if (gridBackground) {
    const updateGridHeight = () => {
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      gridBackground.style.height = documentHeight + 'px';
    };

    updateGridHeight();
    window.addEventListener('resize', updateGridHeight);
    window.addEventListener('load', updateGridHeight);

    const observer = new MutationObserver(() => {
      updateGridHeight();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

})();

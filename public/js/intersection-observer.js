
(function() {
  'use strict';

  // Check for IntersectionObserver support
  const supportsIntersectionObserver = 'IntersectionObserver' in window;

  if (supportsIntersectionObserver) {
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add 'visible' class to trigger CSS animations
          entry.target.classList.add('visible');
          
          // Add stagger delay for child elements
          const children = entry.target.querySelectorAll('.feature-card, .service-card, .industry-card, .testimonial-card, .team-member, .process-step, .qa-card, .value-card');
          
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('animate-in');
            }, index * 100); // 100ms stagger
          });
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '-50px'
    });

    // Observe all elements with data-observe attribute
    document.querySelectorAll('[data-observe]').forEach(element => {
      animationObserver.observe(element);
    });
  } else {
    // Fallback: Add visible class immediately
    document.querySelectorAll('[data-observe]').forEach(element => {
      element.classList.add('visible');
    });
  }

})();

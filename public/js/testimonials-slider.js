(function() {
  'use strict';

  function initTestimonialsSlider() {
    if (typeof Swiper === 'undefined') {
      console.warn('Swiper library not loaded');
      return;
    }

    const testimonialsSwiper = new Swiper('.testimonials-swiper', {
      slidesPerView: 1,
      spaceBetween: 20,
      rewind: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        // Mobile (default - 0px and up)
        0: {
          spaceBetween: 20,
          autoplay: {
            delay: 5000,
          },
        },
        // Tablet (768px and up)
        768: {
          spaceBetween: 30,
          autoplay: {
            delay: 4000,
          },
        },
        // Desktop (1024px and up)
        1024: {
          spaceBetween: 40,
          autoplay: {
            delay: 3000,
          },
        }
      },
      effect: 'slide',
      speed: 400,
      grabCursor: true,
      watchSlidesProgress: true,
      slidesPerGroupSkip: 1,
      touchRatio: 1,
      touchAngle: 45,
      simulateTouch: true,
      allowTouchMove: true,
      resistance: true,
      resistanceRatio: 0.85,
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestimonialsSlider);
  } else {
    initTestimonialsSlider();
  }

})();


document.addEventListener('DOMContentLoaded', function() {
  // Common animation observer
  const animateOnScroll = (elements, options = {}) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: options.threshold || 0.1 });

    elements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = `all 0.5s ease ${index * (options.delayFactor || 0.1)}s`;
      observer.observe(element);
    });
  };

  // Hero Section
  const resumeCount = document.getElementById('resumeCount');
  if (resumeCount) {
    let targetCount = 50000;
    let currentCount = 0;
    const increment = targetCount / 50;

    const animateCounter = () => {
      if (currentCount < targetCount) {
        currentCount += increment;
        resumeCount.textContent = Math.floor(currentCount).toLocaleString() + '+';
        requestAnimationFrame(animateCounter);
      } else {
        resumeCount.textContent = targetCount.toLocaleString() + '+';
      }
    };

    const heroObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounter();
        heroObserver.unobserve(entries[0].target);
      }
    }, { threshold: 0.5 });

    heroObserver.observe(document.querySelector('.hero'));
  }

  // Button hover effects
  const setupButtonHover = (button) => {
    if (!button) return;
    
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-3px)';
      button.style.boxShadow = '0 8px 25px rgba(67, 97, 238, 0.4)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 15px rgba(67, 97, 238, 0.3)';
    });
  };

  setupButtonHover(document.getElementById('createResumeBtn'));
  setupButtonHover(document.querySelector('.cta-button'));

  // Feature Cards
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-10px)';
      card.style.boxShadow = '0 15px 30px rgba(67, 97, 238, 0.1)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
    });
  });

  animateOnScroll(featureCards);

  // Testimonial Slider
  const testimonialsContainer = document.querySelector('.testimonials-container');
  if (testimonialsContainer) {
    const dots = document.querySelectorAll('.dot');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    let currentIndex = 0;
    let autoScrollInterval;

    const updateDots = (index) => {
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    };

    const scrollToTestimonial = (index) => {
      currentIndex = index;
      const cardWidth = testimonialCards[0].offsetWidth + 32;
      testimonialsContainer.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth'
      });
      updateDots(index);
    };

    const startAutoScroll = () => {
      autoScrollInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonialCards.length;
        scrollToTestimonial(currentIndex);
      }, 5000);
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => scrollToTestimonial(index));
    });

    testimonialsContainer.addEventListener('mouseenter', () => {
      clearInterval(autoScrollInterval);
    });

    testimonialsContainer.addEventListener('mouseleave', startAutoScroll);

    testimonialsContainer.addEventListener('scroll', () => {
      const cardWidth = testimonialCards[0].offsetWidth;
      const newIndex = Math.round(testimonialsContainer.scrollLeft / cardWidth);
      if (newIndex !== currentIndex) {
        currentIndex = newIndex;
        updateDots(currentIndex);
      }
    });

    animateOnScroll(testimonialCards);
    startAutoScroll();
  }

  // Template Gallery Slider
  const templateSlider = document.querySelector('.template-slider');
  if (templateSlider) {
    const prevBtn = document.querySelector('.prev-arrow');
    const nextBtn = document.querySelector('.next-arrow');
    const templateCards = document.querySelectorAll('.template-card');
    const cardWidth = templateCards[0].offsetWidth + 32;

    const checkArrowVisibility = () => {
      if (window.innerWidth < 768) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
      } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
      }
    };

    window.addEventListener('resize', checkArrowVisibility);
    checkArrowVisibility();

    nextBtn.addEventListener('click', () => {
      templateSlider.scrollBy({ left: cardWidth, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
      templateSlider.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    });

    document.querySelectorAll('.use-template-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const templateName = e.target.closest('.template-card').querySelector('h3').textContent;
        console.log(`Selected template: ${templateName}`);
      });
    });
  }

  // How It Works Section
  const stepCards = document.querySelectorAll('.step-card');
  if (stepCards.length > 0) {
    animateOnScroll(stepCards, { threshold: 0.5, delayFactor: 0.2 });

    const connectingLine = document.querySelector('.connecting-line');
    if (connectingLine) {
      document.head.insertAdjacentHTML('beforeend', `
        <style>
          @keyframes lineFill {
            0% { background-position: 100% 0; }
            100% { background-position: 0 0; }
          }
        </style>
      `);
    }
  }
});
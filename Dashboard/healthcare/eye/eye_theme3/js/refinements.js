document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const serviceImages = [
    ['https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=85','Eye diagnostic equipment'],
    ['https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=900&q=85','Eye examination and clinical care'],
    ['https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=85','Modern clinical care'],
    ['https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=85','Bright healthcare environment']
  ];
  document.querySelectorAll('.section-services .service-card').forEach((card, index) => {
    if (card.querySelector('.service-photo')) return;
    const wrap = document.createElement('div'); wrap.className = 'service-photo';
    const img = document.createElement('img');
    const chosen = serviceImages[index % serviceImages.length];
    img.src = chosen[0]; img.alt = chosen[1]; img.loading = 'lazy';
    img.onerror = () => { img.onerror = null; img.src = serviceImages[0][0]; };
    wrap.appendChild(img); card.prepend(wrap);
  });
  // Rotate the service imagery gently, without moving the card layout.
  if (!reducedMotion) {
    let active = 0;
    window.setInterval(() => {
      active = (active + 1) % serviceImages.length;
      document.querySelectorAll('.section-services .service-photo img').forEach((img, i) => {
        const next = serviceImages[(active + i) % serviceImages.length];
        img.style.opacity = '.35';
        window.setTimeout(() => { img.src = next[0]; img.alt = next[1]; img.style.opacity = '1'; }, 220);
      });
    }, 6500);
  }
  // Rotate the About page hero slideshow in one fixed image frame.
  const aboutSlides = [...document.querySelectorAll('.about-hero-slideshow .about-slide')];
  if (aboutSlides.length > 1) {
    let slideIndex = 0;
    aboutSlides.forEach((img, i) => { img.style.opacity = i === 0 ? '1' : '0'; });
    if (!reducedMotion) window.setInterval(() => {
      aboutSlides[slideIndex].classList.remove('active');
      aboutSlides[slideIndex].style.opacity = '0';
      slideIndex = (slideIndex + 1) % aboutSlides.length;
      aboutSlides[slideIndex].classList.add('active');
      aboutSlides[slideIndex].style.opacity = '1';
    }, 4200);
  }
  // Ensure the fixed home hero image always fills its frame and gracefully falls back.
  const homeHeroImage = document.querySelector('.hero-image-wrap img');
  if (homeHeroImage) {
    homeHeroImage.style.width = '100%';
    homeHeroImage.style.height = '100%';
    homeHeroImage.style.objectFit = 'cover';
    homeHeroImage.onerror = () => {
      homeHeroImage.onerror = null;
      homeHeroImage.src = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1400&q=85';
    };
  }

  // Consistent fixed-frame image slideshows for the home hero and interior-page banners.
  const startSlideshow = (selector, activeClass = 'is-active', interval = 4600) => {
    document.querySelectorAll(selector).forEach((frame) => {
      const slides = [...frame.querySelectorAll('img')];
      if (slides.length < 2) return;
      let current = Math.max(0, slides.findIndex(img => img.classList.contains(activeClass)));
      slides.forEach((img, i) => img.classList.toggle(activeClass, i === current));
      if (reducedMotion) return;
      window.setInterval(() => {
        slides[current].classList.remove(activeClass);
        current = (current + 1) % slides.length;
        slides[current].classList.add(activeClass);
      }, interval);
    });
  };
  startSlideshow('.hero-slideshow', 'is-active', 4800);
  startSlideshow('.banner-slideshow', 'is-active', 4400);
  startSlideshow('.contact-banner-slideshow', 'is-active', 4600);

  // Make the image rail and new image panels participate in existing scroll reveals.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold: .12});
    document.querySelectorAll('.service-photo-ribbon,.contact-hero-visual,.about-hero-slideshow').forEach(el => observer.observe(el));
  }
});

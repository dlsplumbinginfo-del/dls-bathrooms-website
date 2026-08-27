(() => {
  const businessEmail = 'info@dlsbathrooms.co.uk';

  // Keep the public homepage contact email aligned with the active DLS business inbox.
  document.querySelectorAll('a[href="mailto:dlsplumbinginfo@gmail.com"]').forEach((link) => {
    link.href = `mailto:${businessEmail}`;
  });

  // Keep the homepage structured business data aligned for search engines that execute JS.
  document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
    try {
      const data = JSON.parse(script.textContent);
      if (data && data['@type'] === 'HomeAndConstructionBusiness') {
        data.email = businessEmail;
        script.textContent = JSON.stringify(data);
      }
    } catch (_) {}
  });

  const cards = [...document.querySelectorAll('.gallery-card')];
  const gallery = document.getElementById('gallery-grid');
  const toggle = document.getElementById('gallery-toggle');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCount = document.getElementById('lightbox-count');
  let currentIndex = 0;
  let previousFocus = null;

  if (gallery && toggle) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      gallery.classList.toggle('show-all', !expanded);
      toggle.setAttribute('aria-expanded', String(!expanded));
      toggle.textContent = expanded ? 'View All 23 Photographs' : 'Show Fewer Photographs';
      if (expanded) document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const updateLightbox = () => {
    const card = cards[currentIndex];
    const image = card.querySelector('img');
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxTitle.textContent = card.querySelector('strong')?.textContent || 'DLS Bathrooms project';
    lightboxCount.textContent = `${currentIndex + 1} of ${cards.length}`;
  };

  const openLightbox = (index) => {
    if (!lightbox) return;
    previousFocus = document.activeElement;
    currentIndex = index;
    updateLightbox();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox-close')?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    lightboxImage.src = '';
    previousFocus?.focus();
  };

  const moveLightbox = (offset) => {
    currentIndex = (currentIndex + offset + cards.length) % cards.length;
    updateLightbox();
  };

  cards.forEach((card, index) => card.addEventListener('click', () => openLightbox(index)));
  lightbox?.querySelectorAll('[data-lightbox-close]').forEach((button) => button.addEventListener('click', closeLightbox));
  document.getElementById('lightbox-prev')?.addEventListener('click', () => moveLightbox(-1));
  document.getElementById('lightbox-next')?.addEventListener('click', () => moveLightbox(1));
  document.addEventListener('keydown', (event) => {
    if (!lightbox || lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });
})();

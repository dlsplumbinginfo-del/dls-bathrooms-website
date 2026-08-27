(() => {
  // Recovery fix: use the original warm bathroom promo film from the old site.
  // This replaces the later 14-second black-marble showreel and removes its poster image.
  const promoVideo = document.querySelector('.video-section video');
  if (promoVideo) {
    const promoSource = promoVideo.querySelector('source');
    if (promoSource) {
      promoSource.src = 'assets/6c45b2de-97e3-4f7d-b86e-517d72861e00.mp4';
      promoSource.type = 'video/mp4';
    }
    promoVideo.removeAttribute('poster');
    promoVideo.preload = 'metadata';
    promoVideo.load();

    const promoCopy = document.querySelector('.video-copy .lead');
    if (promoCopy) {
      promoCopy.textContent = 'Bathroom inspiration with a clean music-only soundtrack — no voiceover.';
    }
  }

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
    if (!card || !lightboxImage || !lightboxTitle || !lightboxCount) return;
    const image = card.querySelector('img');
    if (!image) return;
    lightboxImage.src = image.currentSrc || image.src;
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
    if (lightboxImage) lightboxImage.src = '';
    previousFocus?.focus();
  };

  const moveLightbox = (offset) => {
    if (!cards.length) return;
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

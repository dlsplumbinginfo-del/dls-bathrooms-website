(() => {
  const PHONE = '447539037841';

  // Vercel Web Analytics for the static site.
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  if (!document.querySelector('script[src="/_vercel/insights/script.js"]')) {
    const analytics = document.createElement('script');
    analytics.defer = true;
    analytics.src = '/_vercel/insights/script.js';
    document.head.appendChild(analytics);
  }

  // Safety net: remove the retired personal number from any old cached markup.
  document.querySelectorAll('a[href*="447304056595"]').forEach((link) => {
    link.href = link.href.replace('447304056595', PHONE);
  });
  document.querySelectorAll('a[href*="07304056595"]').forEach((link) => {
    link.href = link.href.replace('07304056595', '07539037841');
  });
  document.querySelectorAll('a[href^="mailto:dlsplumbinginfo@gmail.com"],a[href^="mailto:dlstilingandplumbing30@gmail.com"]').forEach((link) => {
    link.href = 'mailto:info@dlsbathrooms.co.uk';
  });

  // Keep public wording accurate where old review totals were hard-coded.
  document.querySelectorAll('.trust-strip div').forEach((item) => {
    if (/recommend|review/i.test(item.textContent)) {
      item.innerHTML = '<strong>Recommended</strong><span>Trusted by customers on Facebook</span>';
    }
  });

  // Route the remote-estimate button to the dedicated working page.
  document.querySelectorAll('a').forEach((link) => {
    if (/request a video estimate/i.test(link.textContent)) link.href = '/video-estimate';
  });

  // Add the product-matched visualisation service to the richer homepage.
  const workSection = document.getElementById('work');
  if (workSection && !document.getElementById('visualisation')) {
    const visual = document.createElement('section');
    visual.id = 'visualisation';
    visual.className = 'section visualisation-section';
    visual.innerHTML = `
      <div class="shell visual-grid">
        <div>
          <p class="eyebrow">Product-matched bathroom visualisation</p>
          <h2>See what you are choosing. <span>Inside your actual bathroom.</span></h2>
          <p class="lead">DLS can create a high-detail visual guide of your real room using the products and finishes selected for your project before installation begins.</p>
          <p>Choose products from Scudo or another recognised supplier. Share the product links, model numbers, colours and finishes, or let DLS help select the range, so the complete scheme can be reviewed together.</p>
          <div class="visual-badges"><span>Tiles</span><span>Baths</span><span>Showers</span><span>Furniture</span><span>Brassware</span><span>Lighting</span><span>Niches</span><span>Mirrors</span><span>Radiators</span></div>
          <div class="remote-actions"><a class="button" href="/quote">Request My Bathroom Visual</a><span>Available for suitable DLS supply-and-fit projects</span></div>
        </div>
        <div class="visual-card">
          <img src="/assets/projects/black-marble-suite.webp" alt="Completed DLS bathroom showing coordinated finishes and lighting" loading="lazy">
          <div><small>Matched from real product pages</small><strong>Your room + your selected products + a clear design guide</strong></div>
        </div>
      </div>
      <div class="shell visual-process">
        <article><span>01</span><h3>Capture the room</h3><p>Send clear photographs, a slow video and reliable measurements.</p></article>
        <article><span>02</span><h3>Select the products</h3><p>Share exact supplier links, codes, colours and finishes.</p></article>
        <article><span>03</span><h3>Review the complete look</h3><p>See the layout, tiles, lighting and fittings working together before you commit.</p></article>
      </div>
      <p class="shell visual-disclaimer">Visualisations are design guides, not technical drawings or a guarantee of exact on-screen colour. Final appearance may vary because of screen settings, room lighting, product batches, installation details and site conditions. Fast appointments, quotations and visual preparation are subject to location, access, availability and sufficient project information.</p>`;
    workSection.before(visual);

    const services = document.querySelector('.service-grid');
    if (services && !services.querySelector('[data-visual-service]')) {
      const card = document.createElement('article');
      card.className = 'service-card';
      card.dataset.visualService = 'true';
      card.innerHTML = '<span>07</span><h3>Product-Matched Visualisation</h3><p>See your actual room with selected tiles, furniture, brassware, lighting and finishes before installation begins.</p>';
      services.appendChild(card);
    }

    const nav = document.querySelector('.site-header nav');
    if (nav && !nav.querySelector('a[href="#visualisation"]')) {
      const link = document.createElement('a');
      link.href = '#visualisation';
      link.textContent = 'Design Preview';
      const workLink = nav.querySelector('a[href="#work"]');
      nav.insertBefore(link, workLink || null);
    }
  }

  // Add area links to existing footers when they are missing.
  document.querySelectorAll('.footer-links').forEach((links) => {
    const add = (href, label) => {
      if (!links.querySelector(`a[href="${href}"]`)) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = label;
        links.appendChild(a);
      }
    };
    add('/areas/stockport', 'Stockport');
    add('/areas/manchester', 'Manchester');
    add('/areas/cheadle', 'Cheadle');
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
    toggle.textContent = `View All ${cards.length} Photographs`;
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      gallery.classList.toggle('show-all', !expanded);
      toggle.setAttribute('aria-expanded', String(!expanded));
      toggle.textContent = expanded ? `View All ${cards.length} Photographs` : 'Show Fewer Photographs';
      if (expanded) document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const updateLightbox = () => {
    const card = cards[currentIndex];
    if (!card || !lightboxImage || !lightboxTitle || !lightboxCount) return;
    const image = card.querySelector('img');
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

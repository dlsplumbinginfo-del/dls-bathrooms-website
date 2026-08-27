(() => {
  const PHONE = '447539037841';

  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  if (!document.querySelector('script[src="/_vercel/insights/script.js"]')) {
    const analytics = document.createElement('script');
    analytics.defer = true;
    analytics.src = '/_vercel/insights/script.js';
    document.head.appendChild(analytics);
  }

  document.querySelectorAll('a[href*="447304056595"]').forEach((link) => {
    link.href = link.href.replace('447304056595', PHONE);
  });
  document.querySelectorAll('a[href*="07304056595"]').forEach((link) => {
    link.href = link.href.replace('07304056595', '07539037841');
  });
  document.querySelectorAll('a[href^="mailto:dlsplumbinginfo@gmail.com"],a[href^="mailto:dlstilingandplumbing30@gmail.com"]').forEach((link) => {
    link.href = 'mailto:info@dlsbathrooms.co.uk';
  });

  document.querySelectorAll('.trust-strip div').forEach((item) => {
    if (/recommend|review/i.test(item.textContent)) {
      item.innerHTML = '<strong>Recommended</strong><span>Trusted by customers on Facebook</span>';
    }
  });

  document.querySelectorAll('a').forEach((link) => {
    if (/request a video estimate/i.test(link.textContent)) link.href = '/video-estimate';
  });

  // Restore the original DLS homepage video used before the later 14-second showreel.
  const homepageVideo = document.querySelector('.video-section video');
  if (homepageVideo) {
    let source = homepageVideo.querySelector('source');
    if (!source) {
      source = document.createElement('source');
      source.type = 'video/mp4';
      homepageVideo.appendChild(source);
    }
    source.src = '/assets/6c45b2de-97e3-4f7d-b86e-517d72861e00.mp4';
    homepageVideo.poster = '/assets/projects/bronze-wetroom-hero.webp';
    homepageVideo.load();
  }

  const ORIGINAL_IMAGE = 'data:image/webp;base64,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';
  const VISUAL_IMAGE = 'data:image/webp;base64,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';

  const workSection = document.getElementById('work');
  document.getElementById('visualisation')?.remove();
  document.querySelectorAll('[data-visual-service]').forEach((el) => el.remove());
  document.querySelectorAll('.site-header nav a[href="#visualisation"]').forEach((el) => el.remove());

  if (workSection) {
    const style = document.createElement('style');
    style.textContent = `
      .liked-visual{background:linear-gradient(180deg,#111415,#090b0c);border-block:1px solid var(--line)}
      .liked-visual-head{max-width:820px;margin-bottom:34px}
      .liked-visual-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
      .liked-visual-card{overflow:hidden;border:1px solid var(--line);border-radius:18px;background:#0c0f10}
      .liked-visual-card img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block}
      .liked-visual-label{padding:18px 20px}
      .liked-visual-label small{display:block;color:var(--gold);text-transform:uppercase;letter-spacing:.14em;font-size:10px;font-weight:800;margin-bottom:4px}
      .liked-visual-label strong{font-size:19px;color:#f4f0e8}
      .liked-visual-copy{max-width:900px;margin:28px 0 0;color:var(--muted);line-height:1.75}
      .liked-visual-actions{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:24px}
      .liked-visual-note{font-size:12px;color:#88857d;max-width:760px;margin-top:18px;line-height:1.6}
      @media (max-width:760px){.liked-visual-grid{grid-template-columns:1fr 1fr;gap:8px}.liked-visual-label{padding:12px}.liked-visual-label strong{font-size:14px}.liked-visual-card img{aspect-ratio:3/4}.liked-visual-copy{font-size:15px}.liked-visual .shell{width:min(100% - 24px,1180px)}}
    `;
    document.head.appendChild(style);

    const visual = document.createElement('section');
    visual.id = 'visualisation';
    visual.className = 'section liked-visual';
    visual.innerHTML = `
      <div class="shell">
        <div class="liked-visual-head">
          <p class="eyebrow">Visual bathroom design & quote</p>
          <h2>See Your Bathroom <span>Before It’s Built.</span></h2>
          <p class="lead">Start with your real room. Then see a visual guide of how the finished bathroom could look before installation begins.</p>
        </div>
        <div class="liked-visual-grid">
          <figure class="liked-visual-card"><img src="${ORIGINAL_IMAGE}" alt="Original DLS bathroom photograph"><figcaption class="liked-visual-label"><small>Original Bathroom</small><strong>Your real room</strong></figcaption></figure>
          <figure class="liked-visual-card"><img src="${VISUAL_IMAGE}" alt="Visualised version of the bathroom"><figcaption class="liked-visual-label"><small>Visualised Bathroom</small><strong>See the finished idea</strong></figcaption></figure>
        </div>
        <p class="liked-visual-copy">Send DLS clear photographs or a short video of the bathroom and the basic room details. We can create a visual guide to help you picture the layout, style and overall finish, then use the same information to help prepare your initial bathroom quote.</p>
        <div class="liked-visual-actions"><a class="button" href="/video-estimate">Start a Visual Quote</a><a class="button button-outline" href="tel:+447539037841">Call 07539 037841</a></div>
        <p class="liked-visual-note">The visual is a design guide rather than a technical drawing. Final colours, products, dimensions and details are confirmed separately before installation.</p>
      </div>`;
    workSection.before(visual);

    const nav = document.querySelector('.site-header nav');
    if (nav) {
      const link = document.createElement('a');
      link.href = '#visualisation';
      link.textContent = 'Design Preview';
      const workLink = nav.querySelector('a[href="#work"]');
      nav.insertBefore(link, workLink || null);
    }
  }

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
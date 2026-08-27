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

  const workSection = document.getElementById('work');
  document.getElementById('visualisation')?.remove();
  document.querySelectorAll('[data-visual-service]').forEach((el) => el.remove());
  document.querySelectorAll('.site-header nav a[href="#visualisation"]').forEach((el) => el.remove());

  if (workSection) {
    const style = document.createElement('style');
    style.textContent = `
      html,body{max-width:100%;overflow-x:hidden}
      .liked-visual{background:linear-gradient(180deg,#111415,#090b0c);border-block:1px solid var(--line)}
      .liked-visual-head{max-width:820px;margin-bottom:34px}
      .liked-visual-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}
      .liked-visual-card{overflow:hidden;border:1px solid var(--line);border-radius:18px;background:#0c0f10;min-width:0}
      .liked-visual-card img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block;background:#111}
      .liked-visual-label{padding:18px 20px}
      .liked-visual-label small{display:block;color:var(--gold);text-transform:uppercase;letter-spacing:.14em;font-size:10px;font-weight:800;margin-bottom:4px}
      .liked-visual-label strong{font-size:19px;color:#f4f0e8}
      .liked-visual-copy{max-width:900px;margin:28px 0 0;color:var(--muted);line-height:1.75}
      .liked-visual-actions{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:24px}
      .liked-visual-note{font-size:12px;color:#88857d;max-width:760px;margin-top:18px;line-height:1.6}
      @media (max-width:760px){
        .liked-visual-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}
        .liked-visual-label{padding:12px 10px}
        .liked-visual-label strong{font-size:14px}
        .liked-visual-card img{aspect-ratio:3/4}
        .liked-visual-copy{font-size:15px}
        .liked-visual .shell{width:min(100% - 24px,1180px)}
      }
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
          <p class="lead">See the visual idea first, then compare it with the real completed bathroom.</p>
        </div>
        <div class="liked-visual-grid">
          <figure class="liked-visual-card">
            <img id="dls-visual-ai" alt="AI-assisted visual bathroom design">
            <figcaption class="liked-visual-label"><small>Visualised Bathroom</small><strong>See the idea first</strong></figcaption>
          </figure>
          <figure class="liked-visual-card">
            <img id="dls-visual-real" alt="Real completed DLS bathroom">
            <figcaption class="liked-visual-label"><small>Completed Bathroom</small><strong>Then see the real finish</strong></figcaption>
          </figure>
        </div>
        <p class="liked-visual-copy">Send DLS clear photographs or a short video of your bathroom and the basic room details. We can create a visual guide to help you picture the layout, style and overall finish before the work begins, then use the same information to help prepare your initial bathroom quote.</p>
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

  const b64ToBlobUrl = (b64, type) => {
    const raw = atob(b64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type }));
  };

  const applyRecoveredMedia = () => {
    const media = window.DLS_SITE_MEDIA;
    if (!media?.promo || !media?.visual || !media?.real) return;

    const homepageVideo = document.querySelector('.video-section video');
    if (homepageVideo) {
      let source = homepageVideo.querySelector('source');
      if (!source) {
        source = document.createElement('source');
        source.type = 'video/mp4';
        homepageVideo.appendChild(source);
      }
      source.src = b64ToBlobUrl(media.promo, 'video/mp4');
      source.type = 'video/mp4';
      homepageVideo.poster = '/assets/projects/bronze-wetroom-hero.webp';
      homepageVideo.load();
    }

    const ai = document.getElementById('dls-visual-ai');
    const real = document.getElementById('dls-visual-real');
    if (ai) ai.src = `data:image/webp;base64,${media.visual}`;
    if (real) real.src = `data:image/webp;base64,${media.real}`;
  };

  const mediaScript = document.createElement('script');
  mediaScript.src = '/site-data.js?v=20260827-verified';
  mediaScript.onload = applyRecoveredMedia;
  mediaScript.onerror = () => console.error('DLS restored media package failed to load');
  document.head.appendChild(mediaScript);

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
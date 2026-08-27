(() => {
  const PHONE = '447539037841';

  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  if (!document.querySelector('script[src="/_vercel/insights/script.js"]')) {
    const analytics = document.createElement('script');
    analytics.defer = true;
    analytics.src = '/_vercel/insights/script.js';
    document.head.appendChild(analytics);
  }

  // Match the production mobile overflow repair while keeping the migrated styles.
  const mobileFix = document.createElement('style');
  mobileFix.textContent = `html,body{max-width:100%;overflow-x:clip}@supports not (overflow:clip){html,body{overflow-x:hidden}}@media (max-width:760px){.mobile-cta{grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr)!important;left:8px!important;right:8px!important;bottom:8px!important;width:auto!important;max-width:calc(100vw - 16px)!important;box-sizing:border-box!important;overflow:hidden!important}.mobile-cta .button{min-width:0!important;width:100%!important;max-width:100%!important;padding-inline:10px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.shell,.trust-strip,.gallery-shell{max-width:calc(100vw - 24px)}.hero-content,.trust-strip>div,.payment-grid>*,.local-area-grid>*{min-width:0}}`;
  document.head.appendChild(mobileFix);

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

  const areaGrid = document.querySelector('.local-area-grid');
  if (areaGrid) {
    const areaCards = [...areaGrid.querySelectorAll('article')];
    const addLink = (card, href, label) => {
      if (!card || card.querySelector('a')) return;
      const link = document.createElement('a');
      link.className = 'text-link';
      link.href = href;
      link.textContent = label;
      card.appendChild(link);
    };
    addLink(areaCards[0], '/areas/stockport', 'View Stockport services →');
    addLink(areaCards[1], '/areas/manchester', 'View Manchester services →');
    if (areaCards[2] && !/cheadle/i.test(areaCards[2].textContent)) {
      areaCards[2].classList.remove('local-area-cta');
      areaCards[2].innerHTML = '<span>Cheadle</span><h3>Complete bathrooms in Cheadle</h3><p>Full bathroom renovations, walk-in showers, wet rooms and premium tiling, coordinated from preparation through to the finished room.</p><a class="text-link" href="/areas/cheadle">View Cheadle services →</a>';
    }
  }

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
          <p>Choose products from Scudo or another recognised supplier. Share product links, model numbers, colours and finishes, or let DLS help select the range, so the complete scheme can be reviewed together.</p>
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
      nav.insertBefore(link, nav.querySelector('a[href="#work"]') || null);
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
  const image = document.getElementById('lightbox-image');
  const title = document.getElementById('lightbox-title');
  const count = document.getElementById('lightbox-count');
  let current = 0;
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

  const refresh = () => {
    const card = cards[current];
    if (!card || !image || !title || !count) return;
    const cardImage = card.querySelector('img');
    image.src = cardImage.currentSrc || cardImage.src;
    image.alt = cardImage.alt;
    title.textContent = card.querySelector('strong')?.textContent || 'DLS Bathrooms project';
    count.textContent = `${current + 1} of ${cards.length}`;
  };
  const open = (index) => {
    if (!lightbox) return;
    previousFocus = document.activeElement;
    current = index;
    refresh();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox-close')?.focus();
  };
  const close = () => {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (image) image.src = '';
    previousFocus?.focus();
  };
  const move = (offset) => {
    if (!cards.length) return;
    current = (current + offset + cards.length) % cards.length;
    refresh();
  };

  cards.forEach((card, index) => card.addEventListener('click', () => open(index)));
  lightbox?.querySelectorAll('[data-lightbox-close]').forEach((button) => button.addEventListener('click', close));
  document.getElementById('lightbox-prev')?.addEventListener('click', () => move(-1));
  document.getElementById('lightbox-next')?.addEventListener('click', () => move(1));
  document.addEventListener('keydown', (event) => {
    if (!lightbox || lightbox.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  });
})();

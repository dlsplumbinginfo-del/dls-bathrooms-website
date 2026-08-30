(() => {
  'use strict';

  const businessWhatsApp = '447539037841';

  function setupQuoteForm() {
    const form = document.querySelector('form.quote-form');
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const value = (name) => String(data.get(name) || 'Not provided').trim();
      const message = [
        "Hello DLS Bathrooms Ltd, I'd like a bathroom quotation.",
        '',
        `Name: ${value('name')}`,
        `Postcode: ${value('postcode')}`,
        `Project: ${value('project')}`,
        `Quote type: ${value('quoteType')}`,
        `Product-matched visual: ${value('visualPreview')}`,
        `Preferred timing: ${value('timing')}`,
        `How they found DLS: ${value('referralSource')}`,
        `Details: ${value('details')}`,
        '',
        'I can add photographs, a room video, rough measurements and product links in WhatsApp.'
      ].join('\n');

      window.location.assign(
        `https://wa.me/${businessWhatsApp}?text=${encodeURIComponent(message)}`
      );
    });
  }

  function setupGallery() {
    const gallery = document.querySelector('.gallery-grid');
    const toggle = document.getElementById('gallery-toggle');
    if (!gallery) return;

    const cards = [...gallery.querySelectorAll('.gallery-card')];
    if (!cards.length) return;

    if (toggle) {
      toggle.addEventListener('click', () => {
        const expanded = gallery.classList.toggle('show-all');
        toggle.setAttribute('aria-expanded', String(expanded));
        toggle.textContent = expanded
          ? 'Show Featured Work'
          : `View All ${cards.length} Photographs`;

        if (!expanded) {
          document.getElementById('work')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    }

    let current = 0;
    let previousFocus = null;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.hidden = true;
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Project photograph');
    lightbox.innerHTML = `
      <button class="lightbox-backdrop" type="button" data-close aria-label="Close photograph"></button>
      <div class="lightbox-panel">
        <button class="lightbox-close" type="button" data-close aria-label="Close">×</button>
        <button class="lightbox-arrow lightbox-prev" type="button" data-prev aria-label="Previous photograph">‹</button>
        <img src="" alt="">
        <button class="lightbox-arrow lightbox-next" type="button" data-next aria-label="Next photograph">›</button>
        <div class="lightbox-caption"><strong></strong><span></span></div>
      </div>`;
    document.body.appendChild(lightbox);

    const image = lightbox.querySelector('img');
    const title = lightbox.querySelector('.lightbox-caption strong');
    const count = lightbox.querySelector('.lightbox-caption span');

    function render() {
      const card = cards[current];
      const source = card.querySelector('img');
      image.src = source.currentSrc || source.src;
      image.alt = source.alt;
      title.textContent =
        card.querySelector('strong')?.textContent || 'DLS Bathrooms project';
      count.textContent =
        `${current + 1} / ${cards.length} · DLS Bathrooms Ltd`;
    }

    function open(index) {
      previousFocus = document.activeElement;
      current = index;
      render();
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      lightbox.querySelector('.lightbox-close').focus();
    }

    function close() {
      lightbox.hidden = true;
      image.src = '';
      document.body.style.overflow = '';
      previousFocus?.focus();
    }

    function move(offset) {
      current = (current + offset + cards.length) % cards.length;
      render();
    }

    cards.forEach((card, index) => {
      card.addEventListener('click', () => open(index));
    });
    lightbox.querySelectorAll('[data-close]').forEach((button) => {
      button.addEventListener('click', close);
    });
    lightbox.querySelector('[data-prev]').addEventListener('click', () => move(-1));
    lightbox.querySelector('[data-next]').addEventListener('click', () => move(1));

    document.addEventListener('keydown', (event) => {
      if (lightbox.hidden) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    });
  }

  function prioritiseHomepageProof() {
    const paymentSection = document.getElementById('payments');
    const callToAction = document.querySelector('.cta-section');
    if (paymentSection && callToAction) {
      callToAction.before(paymentSection);
    }

    const processGrid = document.querySelector('#process .process-grid');
    if (!processGrid || processGrid.dataset.customerCareAdded === 'true') return;

    const buildStep = processGrid.querySelector('article:last-child p');
    if (buildStep) {
      buildStep.textContent =
        'One DLS team stays responsible, keeps you updated and coordinates every trade through to completion.';
    }

    const careSteps = [
      ['5', 'Protect & communicate', 'Floors and access routes are protected, the working area is kept orderly and progress is explained throughout the installation.'],
      ['6', 'Handover & aftercare', 'We walk through the finished bathroom with you, explain the new fittings and support our workmanship with a 24-month guarantee.']
    ];

    careSteps.forEach(([number, title, copy]) => {
      const article = document.createElement('article');
      article.innerHTML = `<span>${number}</span><h3>${title}</h3><p>${copy}</p>`;
      processGrid.appendChild(article);
    });
    processGrid.dataset.customerCareAdded = 'true';
  }

  function restoreVerifiedTrustAndContact() {
    if (!document.querySelector('link[href="/trust-contact.css"]')) {
      const styles = document.createElement('link');
      styles.rel = 'stylesheet';
      styles.href = '/trust-contact.css';
      document.head.appendChild(styles);
    }

    const trustItems = document.querySelectorAll('.trust-strip > div');
    const reviewItem = trustItems[2];
    if (reviewItem) {
      reviewItem.innerHTML =
        '<strong>Customer reviews</strong><span class="review-platform-links"><a href="https://www.facebook.com/DLSBathrooms/" target="_blank" rel="noreferrer">Facebook</a><span aria-hidden="true">•</span><a href="https://uk.trustpilot.com/review/dlsbathrooms.co.uk" target="_blank" rel="noreferrer">Trustpilot</a></span>';
    }

    const footerLinks = document.querySelector('.footer-links');
    if (footerLinks && !footerLinks.querySelector('[data-trustpilot-link]')) {
      const trustpilotLink = document.createElement('a');
      trustpilotLink.href = 'https://uk.trustpilot.com/review/dlsbathrooms.co.uk';
      trustpilotLink.target = '_blank';
      trustpilotLink.rel = 'noreferrer';
      trustpilotLink.dataset.trustpilotLink = 'true';
      trustpilotLink.textContent = 'Trustpilot';
      footerLinks.insertBefore(trustpilotLink, footerLinks.querySelector('a[href="mailto:info@dlsbathrooms.co.uk"]'));
    }

    const trustStrip = document.querySelector('.trust-strip');
    if (trustStrip && !document.querySelector('.trustpilot-banner')) {
      const trustpilotBanner = document.createElement('a');
      trustpilotBanner.className = 'trustpilot-banner';
      trustpilotBanner.href = 'https://uk.trustpilot.com/review/dlsbathrooms.co.uk';
      trustpilotBanner.target = '_blank';
      trustpilotBanner.rel = 'noreferrer';
      trustpilotBanner.setAttribute('aria-label', 'View the new DLS Bathrooms Trustpilot profile');
      trustpilotBanner.innerHTML =
        '<span class="trustpilot-stars" aria-hidden="true">★★★★★</span><span class="trustpilot-title"><strong><i aria-hidden="true">★</i> Trustpilot</strong><small>New profile — customer reviews coming soon</small></span><span class="trustpilot-action">View profile →</span>';
      trustStrip.insertAdjacentElement('afterend', trustpilotBanner);
    }

    if (!document.querySelector('.whatsapp-float')) {
      const whatsapp = document.createElement('a');
      whatsapp.className = 'whatsapp-float';
      whatsapp.href = `https://wa.me/${businessWhatsApp}?text=${encodeURIComponent("Hello DLS Bathrooms Ltd, I'd like a bathroom quotation.")}`;
      whatsapp.setAttribute('aria-label', 'Message DLS Bathrooms on WhatsApp');
      whatsapp.innerHTML = '<span aria-hidden="true">WhatsApp</span><strong>Get a quote</strong>';
      document.body.appendChild(whatsapp);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    prioritiseHomepageProof();
    restoreVerifiedTrustAndContact();
    setupQuoteForm();
    setupGallery();
  });
})();

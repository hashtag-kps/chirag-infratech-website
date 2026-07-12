// Chirag Infratech — shared inner-page behaviour.
// Each block checks for its target elements before running, so this single
// file can be safely included on every inner page regardless of which
// widgets that page actually uses.

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Video play overlays (Gallery) ---------------- */
  document.querySelectorAll('.video-item').forEach((item) => {
    const video = item.querySelector('video');
    const overlay = item.querySelector('.video-play-overlay');
    if (!video || !overlay) return;

    overlay.addEventListener('click', () => {
      overlay.classList.add('is-hidden');
      video.play().catch(() => {
        // Autoplay with sound can be blocked — reveal native controls either way
        overlay.classList.add('is-hidden');
      });
    });
    video.addEventListener('play', () => overlay.classList.add('is-hidden'));
  });

  /* ---------------- Financial growth bar chart ---------------- */
  const bars = document.querySelectorAll('.bar-chart-bar[data-height]');
  if (bars.length && 'IntersectionObserver' in window) {
    const chartObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            bars.forEach((bar, i) => {
              const delay = prefersReducedMotion ? 0 : i * 120;
              setTimeout(() => {
                bar.style.height = bar.dataset.height + '%';
              }, delay);
            });
            chartObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    chartObserver.observe(bars[0].closest('.bar-chart'));
  } else {
    bars.forEach((bar) => { bar.style.height = bar.dataset.height + '%'; });
  }

  /* ---------------- Project filter tabs ---------------- */
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectCards = document.querySelectorAll('[data-status]');
  if (filterTabs.length && projectCards.length) {
    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        filterTabs.forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        const filter = tab.dataset.filter;
        projectCards.forEach((card) => {
          const show = filter === 'all' || card.dataset.status === filter;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---------------- Gallery lightbox ---------------- */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.querySelector('.lightbox');
  if (galleryItems.length && lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    let currentIndex = 0;

    function openLightbox(index) {
      currentIndex = index;
      const item = galleryItems[index];
      const fullSrc = item.dataset.full || item.querySelector('img').src;
      lightboxImg.src = fullSrc;
      lightboxImg.alt = item.querySelector('img').alt;
      if (lightboxCaption) lightboxCaption.textContent = item.dataset.caption || '';
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    function showRelative(delta) {
      currentIndex = (currentIndex + delta + galleryItems.length) % galleryItems.length;
      openLightbox(currentIndex);
    }

    galleryItems.forEach((item, i) => {
      item.addEventListener('click', () => openLightbox(i));
    });
    closeBtn && closeBtn.addEventListener('click', closeLightbox);
    prevBtn && prevBtn.addEventListener('click', () => showRelative(-1));
    nextBtn && nextBtn.addEventListener('click', () => showRelative(1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showRelative(-1);
      if (e.key === 'ArrowRight') showRelative(1);
    });
  }

  /* ---------------- Contact form (submits to Formspree) ---------------- */
  const contactForm = document.querySelector('#enquiryForm');
  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const successEl = document.querySelector('.form-success');
    const errorEl = document.querySelector('.form-error');

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      successEl && successEl.classList.remove('is-visible');
      errorEl && errorEl.classList.remove('is-visible');

      const originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      })
        .then((response) => {
          if (response.ok) {
            successEl && successEl.classList.add('is-visible');
            contactForm.reset();
          } else {
            errorEl && errorEl.classList.add('is-visible');
          }
        })
        .catch(() => {
          errorEl && errorEl.classList.add('is-visible');
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        });
    });
  }
})();

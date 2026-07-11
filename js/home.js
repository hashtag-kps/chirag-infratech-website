// Chirag Infratech — home page behaviour
// Scroll-triggered reveal animations + animated stat counters.
// Respects prefers-reduced-motion by skipping the counting animation
// (final values are still set immediately) and relying on the CSS
// media query in home.css to disable the reveal transition.

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Animated stat counters ----
  // (Scroll reveal now lives in the shared js/script.js)
  const statNums = document.querySelectorAll('.stat-num[data-count]');
  if (!statNums.length) return;

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';

    if (prefersReducedMotion) {
      el.textContent = prefix + target + suffix;
      return;
    }

    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current = Math.round(target * eased);
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statNums.forEach((el) => statObserver.observe(el));
  } else {
    statNums.forEach(animateCount);
  }
})();

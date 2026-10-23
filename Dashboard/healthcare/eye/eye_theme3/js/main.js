document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  const toast = document.querySelector('.toast');
  window.showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(window.__aureliaToast);
    window.__aureliaToast = window.setTimeout(() => toast.classList.remove('show'), 3800);
  };
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    });
  });
});

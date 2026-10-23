// VisionCare interactive features
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const navLinks = document.querySelectorAll(".nav-link");

  menuButton?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    menuButton.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
    if (window.lucide) window.lucide.createIcons();
  });

  navLinks.forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  }));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  const sections = document.querySelectorAll("main section[id], footer[id]");
  const activeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const activeId = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach(section => activeObserver.observe(section));

  const backToTop = document.querySelector(".back-to-top");
  const updateBackToTop = () => backToTop?.classList.toggle("visible", window.scrollY > 500);
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Count-up animation for clinic stats
  const counters = document.querySelectorAll("[data-count]");
  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.count);
      const suffix = element.dataset.suffix || "";
      const duration = 1300;
      const startTime = performance.now();
      const tick = now => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        element.textContent = `${Math.round(target * eased).toLocaleString("en-IN")}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.unobserve(element);
    });
  }, { threshold: 0.6 });
  counters.forEach(counter => countObserver.observe(counter));
});

// ============================================================
//  app.js — Common loader, sidebar toggle, nav active state
// ============================================================

/** Load HTML component into placeholder */
async function loadComponent(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed: ${url}`);
    el.innerHTML = await res.text();
  } catch (err) {
    console.error(err);
    el.innerHTML = `<div class="p-4 text-red-500 text-sm">Failed to load ${url}</div>`;
  }
}

/** Highlight active nav link */
function setActiveNav() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll('.nav-link').forEach(link => {
    const isActive = link.dataset.nav === page;
    link.classList.toggle('bg-slate-200', isActive);
    link.classList.toggle('text-slate-900', isActive);
    link.classList.toggle('font-semibold', isActive);
  });
}

/** Sidebar toggle: mobile (slide) + desktop (collapse to icons) */
function initSidebarToggle() {
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebarOverlay');
  const toggleBtn = document.getElementById('sidebarToggle');
  const closeBtn  = document.getElementById('sidebarClose');
  const main      = document.getElementById('mainContent');

  if (!sidebar || !toggleBtn) return;

  const isMobile = () => window.innerWidth < 1024;

  const applyCollapsedState = (collapsed) => {
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    if (main) {
      main.classList.toggle('lg:ml-64', !collapsed);
      main.classList.toggle('lg:ml-[72px]', collapsed);
    }
  };

  const openMobile = () => {
    sidebar.classList.remove('-translate-x-full');
    overlay?.classList.remove('hidden');
  };
  const closeMobile = () => {
    sidebar.classList.add('-translate-x-full');
    overlay?.classList.add('hidden');
  };

  toggleBtn.addEventListener('click', () => {
    if (isMobile()) {
      const isOpen = !sidebar.classList.contains('-translate-x-full');
      isOpen ? closeMobile() : openMobile();
    } else {
      const isCollapsed = document.body.classList.contains('sidebar-collapsed');
      applyCollapsedState(!isCollapsed);
    }
  });

  closeBtn?.addEventListener('click', closeMobile);
  overlay?.addEventListener('click', closeMobile);

  // Restore collapsed state on load (desktop only)
  window.addEventListener('resize', () => {
    if (!isMobile()) overlay?.classList.add('hidden');
  });
}

/** Global search (dispatch event) */
function initSearch() {
  const input = document.getElementById('globalSearch');
  if (!input) return;
  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    document.dispatchEvent(new CustomEvent('global-search', { detail: { q } }));
  });
}

/** Reload lucide icons after dynamic content insertion */
function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/** Bootstrap layout */
async function initLayout() {
  await Promise.all([
    loadComponent('#sidebar-root', 'components/sidebar.html'),
    loadComponent('#header-root',  'components/header.html'),
  ]);

  setActiveNav();
  initSidebarToggle();
  initSearch();
  refreshIcons();
}

document.addEventListener('DOMContentLoaded', initLayout);
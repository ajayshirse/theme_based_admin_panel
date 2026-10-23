// ============================================================
//  content-management.js
//  Handles theme selection, JSON loading, wizard rendering
//  Supports: sections + fields + nested lists + custom types
// ============================================================

// ---------- Config ----------
// Base path where theme JSON files live
const THEME_BASE_PATH = {
  dental: '/healthcare/dental',
  dermat: '/healthcare/dermat',
  eye: '/healthcare/eye',
  ortho: '/healthcare/ortho'
};

const THEME_LIST = [
  { id: 'dental_theme1', category: 'dental', label: 'Dental Theme 1', meta: 'Multipage · Carousel' },
  { id: 'dental_theme2', category: 'dental', label: 'Dental Theme 2', meta: 'Multipage · Single Hero' },
  { id: 'dental_theme3', category: 'dental', label: 'Dental Theme 3', meta: 'Multipage · Wellness' },
  { id: 'dental_theme4', category: 'dental', label: 'Dental Theme 4', meta: 'Multipage · Clean Blue' },
  { id: 'dermat_theme1', category: 'dermat', label: 'Dermat Theme 1', meta: 'Multipage · Classic' },
  { id: 'dermat_theme2', category: 'dermat', label: 'Dermat Theme 2', meta: 'Multipage · Modern' },
  { id: 'dermat_theme3', category: 'dermat', label: 'Dermat Theme 3', meta: 'Multipage · Luxury' },
  { id: 'eye_theme1', category: 'eye', label: 'Eye Theme 1', meta: 'Single Page · Clean Clinical' },
  { id: 'eye_theme2', category: 'eye', label: 'Eye Theme 2', meta: 'Multipage · Institute' },
  { id: 'eye_theme3', category: 'eye', label: 'Eye Theme 3', meta: 'Multipage · Editorial' },
  { id: 'ortho_theme1', category: 'ortho', label: 'Ortho Theme 1', meta: 'Single Page · Orthodontic' },
  { id: 'ortho_theme2', category: 'ortho', label: 'Ortho Theme 2', meta: 'Multipage · Bone & Joint' }
];

// ---------- State ----------
let currentTheme = null;       // theme id (e.g. "dental_theme1")
let currentCategory = null;    // 'dental' | 'dermat' | 'eye' | 'ortho'
let currentSchema = null;
let currentStep = 0;
let formData = {};

// ============================================================
//  SUB-CATEGORY TABS (Dental / Dermat)
// ============================================================
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.subcat-tab');
  if (!tab) return;

  const category = tab.dataset.tab;

  // Update tab styles
  document.querySelectorAll('.subcat-tab').forEach(t => {
    const isActive = t === tab;
    t.classList.toggle('active', isActive);
    t.classList.toggle('bg-slate-900', isActive);
    t.classList.toggle('text-white', isActive);
    t.classList.toggle('bg-white', !isActive);
    t.classList.toggle('text-slate-600', !isActive);
    t.classList.toggle('border', !isActive);
    t.classList.toggle('border-slate-200', !isActive);
  });

  // Show/hide panels
  document.querySelectorAll('.subcat-panel').forEach(p => {
    p.classList.add('hidden');
    p.classList.remove('grid');
  });

  const panel = document.getElementById('panel-' + category);
  if (panel) {
    panel.classList.remove('hidden');
    panel.classList.add('grid');
  }

  if (window.lucide) window.lucide.createIcons();
});

// ============================================================
//  THEME SELECTION
// ============================================================
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-select-theme]');
  if (!btn) return;
  loadTheme(btn.dataset.selectTheme);
});

async function loadTheme(themeId) {
  try {
    // Find the theme meta (to know category)
    const meta = THEME_LIST.find(t => t.id === themeId);
    if (!meta) throw new Error('Unknown theme: ' + themeId);

    currentCategory = meta.category;
    const basePath = THEME_BASE_PATH[meta.category];

    const res = await fetch(`${basePath}/${themeId}.json`);
    if (!res.ok) throw new Error('Schema not found');
    const schema = await res.json();

    currentTheme = themeId;
    currentSchema = schema;
    currentStep = 0;
    formData = {};

    // UI updates
    document.getElementById('themeSelectStep').classList.add('hidden');
    document.getElementById('wizardContainer').classList.remove('hidden');

    document.getElementById('wizardThemeName').textContent =
      meta?.label || schema.label || themeId;
    document.getElementById('wizardThemeMeta').textContent =
      meta?.meta || schema.description || '';

    renderSteps();
    renderForm();
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error(err);
    showToast('Failed to load theme schema');
  }
}

// ============================================================
//  BACK TO THEME SELECTION
// ============================================================
function goBackToThemeSelect() {
  currentTheme = null;
  currentCategory = null;
  currentSchema = null;
  currentStep = 0;
  formData = {};
  document.getElementById('wizardContainer').classList.add('hidden');
  document.getElementById('themeSelectStep').classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

// Wire up back button (after DOM ready)
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('backToThemeBtn')?.addEventListener('click', goBackToThemeSelect);
});

// ============================================================
//  WIZARD STEPS (page-wise)
// ============================================================
function renderSteps() {
  const pages = currentSchema.pages || [];
  const stepsEl = document.getElementById('wizardSteps');

  stepsEl.innerHTML = pages.map((page, i) => {
    const active = i === currentStep;
    const done = i < currentStep;
    return `
      <button data-goto-step="${i}"
        class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium 
               whitespace-nowrap transition shrink-0
               ${active
                 ? 'bg-slate-900 text-white'
                 : done
                   ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                   : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
        <span class="w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold
                     ${active
                       ? 'bg-white/20 text-white'
                       : done
                         ? 'bg-emerald-500 text-white'
                         : 'bg-slate-100 text-slate-600'}">
          ${done ? '✓' : i + 1}
        </span>
        ${page.label}
      </button>
    `;
  }).join('');

  document.getElementById('stepIndicator').textContent =
    `Step ${currentStep + 1} of ${pages.length}`;

  document.getElementById('prevStepBtn').disabled = currentStep === 0;
  document.getElementById('nextStepBtn').disabled = currentStep === pages.length - 1;
}

// ============================================================
//  FORM RENDERING (sections + fields)
// ============================================================
function renderForm() {
  const pages = currentSchema.pages || [];
  const page = pages[currentStep];
  const body = document.getElementById('formBody');

  if (!page) {
    body.innerHTML = '<div class="text-slate-500">No page found.</div>';
    return;
  }

  const pageData = formData[page.id] || {};
  const sections = page.sections || [];

  // Render all sections
  const sectionsHtml = sections.map(section => renderSection(section, pageData)).join('');

  body.innerHTML = `
    <div class="mb-6">
      <h2 class="text-lg font-bold text-slate-800 tracking-tight">${page.label}</h2>
      <p class="text-sm text-slate-500 mt-0.5">${page.description || 'Edit content for this page.'}</p>
    </div>

    <div class="space-y-6">
      ${sectionsHtml || '<div class="text-slate-500">No sections found.</div>'}
    </div>
  `;

  // Bind input listeners
  bindFieldListeners(page.id);

  if (window.lucide) window.lucide.createIcons();
}

// ------------------------------------------------------------
//  Render a single section
// ------------------------------------------------------------
function renderSection(section, pageData) {
  const sectionData = pageData[section.id];

  const header = `
    <div class="flex items-center justify-between mb-3">
      <div>
        <div class="text-sm font-semibold text-slate-800">${section.label || section.id}</div>
        ${section.description
          ? `<div class="text-xs text-slate-500 mt-0.5">${section.description}</div>`
          : ''}
      </div>
      <span class="text-[10px] uppercase tracking-wider font-semibold 
                   text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
        ${section.type || 'single'}
      </span>
    </div>
  `;

  let contentHtml = '';

  if (section.type === 'list' || section.type === 'carousel') {
    // Repeatable list
    const items = Array.isArray(sectionData) ? sectionData : [];
    contentHtml = `
      <div class="space-y-3" data-list-id="${section.id}">
        ${items.map((item, idx) => renderListItem(section, item, idx)).join('')}
      </div>
      <button type="button" data-add-item="${section.id}"
        class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
               text-slate-700 bg-white border border-slate-200 rounded-md 
               hover:bg-slate-50 transition">
        <i data-lucide="plus" class="w-3.5 h-3.5"></i>
        Add Item
      </button>
    `;
  } else {
    // Single object
    const data = sectionData || {};
    const fields = section.fields || [];
    contentHtml = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${fields.map(f => renderField(f, data[f.name], `${section.id}.${f.name}`)).join('')}
      </div>
    `;
  }

  return `
    <div class="bg-slate-50 border border-slate-200 rounded-lg p-4">
      ${header}
      ${contentHtml}
    </div>
  `;
}

// ------------------------------------------------------------
//  Render a single list item (for list/carousel sections)
// ------------------------------------------------------------
function renderListItem(section, itemData, idx) {
  const data = itemData || {};
  const fields = section.fields || [];

  return `
    <div class="bg-white border border-slate-200 rounded-lg p-3" data-list-item="${idx}">
      <div class="flex items-center justify-between mb-2">
        <div class="text-xs font-semibold text-slate-500">#${idx + 1}</div>
        <button type="button" data-remove-item="${section.id}:${idx}"
          class="text-rose-500 hover:text-rose-700 p-1 rounded transition">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${fields.map(f => renderField(f, data[f.name], `${section.id}.${idx}.${f.name}`)).join('')}
      </div>
    </div>
  `;
}

// ------------------------------------------------------------
//  Render a single field (text, textarea, image, number, etc.)
// ------------------------------------------------------------
function renderField(field, value = '', dataPath) {
  const isFull = field.full === true || field.type === 'textarea';
  const common = `class="w-full px-3 py-2 rounded-lg border border-slate-200 
                  text-sm text-slate-800 focus:outline-none focus:border-slate-400 
                  transition"`;
  const dataAttr = `data-field="${dataPath}"`;
  const inputType = field.type || 'text';
  const label = `
    <label class="block text-xs font-medium text-slate-600 mb-1.5">
      ${field.label || field.name}
      ${field.required ? '<span class="text-rose-500">*</span>' : ''}
    </label>
  `;

  let input = '';

  switch (inputType) {
    case 'textarea':
      input = `<textarea ${dataAttr} rows="${field.rows || 3}" 
                placeholder="${field.placeholder || ''}" ${common}>${value || ''}</textarea>`;
      break;

    case 'image':
  input = `
    <div class="flex items-center gap-3">
      <label class="w-14 h-14 rounded-md bg-slate-100 grid place-items-center 
                    border border-dashed border-slate-300 cursor-pointer 
                    hover:bg-slate-50 transition shrink-0 overflow-hidden">
        ${value
          ? `<img src="${value}" class="w-full h-full object-cover" />`
          : `<i data-lucide="upload" class="w-4 h-4 text-slate-400"></i>`}
        <input type="file" ${dataAttr} accept="image/*" class="hidden"
               onchange="handleImageUpload(event, '${dataPath}')">
      </label>
      <div class="flex-1 min-w-0">
        <div class="text-xs text-slate-600 truncate">
          ${value ? value.split('/').pop() : 'Click to upload image'}
        </div>
        <div class="text-[11px] text-slate-400 mt-0.5">PNG, JPG · Max 2 MB</div>
      </div>
    </div>
  `;
  break;

    case 'list':
      input = `
        <textarea ${dataAttr} rows="${field.rows || 4}"
          placeholder="${field.placeholder || 'One item per line'}" ${common}>${value || ''}</textarea>
        <div class="text-[11px] text-slate-400 mt-1">One item per line</div>
      `;
      break;

    case 'boolean':
      input = `
        <label class="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" ${dataAttr} ${value ? 'checked' : ''}
            class="accent-slate-900 w-4 h-4">
          <span class="text-sm text-slate-700">Enable</span>
        </label>
      `;
      break;

    case 'number':
      input = `<input type="number" ${dataAttr} value="${value || ''}" 
                placeholder="${field.placeholder || ''}" ${common}>`;
      break;

    case 'email':
      input = `<input type="email" ${dataAttr} value="${value || ''}" 
                placeholder="${field.placeholder || ''}" ${common}>`;
      break;

    case 'url':
      input = `<input type="url" ${dataAttr} value="${value || ''}" 
                placeholder="${field.placeholder || ''}" ${common}>`;
      break;

    case 'select':
      input = `
        <select ${dataAttr} ${common}>
          <option value="">— Select —</option>
          ${(field.options || []).map(opt => `
            <option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>
          `).join('')}
        </select>
      `;
      break;

    default: // text
      input = `<input type="text" ${dataAttr} value="${value || ''}" 
                placeholder="${field.placeholder || ''}" ${common}>`;
  }

  return `
    <div class="${isFull ? 'md:col-span-2' : ''}">
      ${label}
      ${input}
      ${field.hint ? `<div class="text-[11px] text-slate-400 mt-1">${field.hint}</div>` : ''}
    </div>
  `;
}


async function handleImageUpload(event, dataPath) {
  const file = event.target.files[0];
  if (!file) return;

  // Optional: validate size/type
  if (file.size > 2 * 1024 * 1024) {
    showToast('Image must be under 2 MB');
    return;
  }

  // Build FormData
  const fd = new FormData();
  fd.append('file', file);

  // Send to backend
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    body: fd
  });
  const { url } = await res.json();

  // Save URL in formData
  const pageId = currentSchema.pages[currentStep].id;
  setNestedValue(formData, pageId, dataPath, url);

  // Re-render form
  renderForm();
  showToast('Image uploaded');
}

// ------------------------------------------------------------
//  Bind listeners to inputs
// ------------------------------------------------------------
function bindFieldListeners(pageId) {
  const body = document.getElementById('formBody');

  // Inputs
  body.querySelectorAll('[data-field]').forEach(el => {
    el.addEventListener('input', (e) => {
      const path = e.target.dataset.field;
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setNestedValue(formData, pageId, path, value);
    });
    el.addEventListener('change', (e) => {
      const path = e.target.dataset.field;
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setNestedValue(formData, pageId, path, value);
    });
  });

  // Add item buttons
  body.querySelectorAll('[data-add-item]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sectionId = btn.dataset.addItem;
      addListItem(sectionId);
    });
  });

  // Remove item buttons
  body.querySelectorAll('[data-remove-item]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [sectionId, idx] = btn.dataset.removeItem.split(':');
      removeListItem(sectionId, Number(idx));
    });
  });
}

// ------------------------------------------------------------
//  Set nested value in formData
//  path format: "sectionId.fieldName" OR "sectionId.idx.fieldName"
// ------------------------------------------------------------
function setNestedValue(store, pageId, path, value) {
  const parts = path.split('.');
  if (!store[pageId]) store[pageId] = {};

  if (parts.length === 2) {
    // section.field
    const [sectionId, fieldName] = parts;
    if (!store[pageId][sectionId]) store[pageId][sectionId] = {};
    store[pageId][sectionId][fieldName] = value;
  } else if (parts.length === 3) {
    // section.idx.field
    const [sectionId, idx, fieldName] = parts;
    if (!Array.isArray(store[pageId][sectionId])) store[pageId][sectionId] = [];
    if (!store[pageId][sectionId][idx]) store[pageId][sectionId][idx] = {};
    store[pageId][sectionId][idx][fieldName] = value;
  }
}

// ------------------------------------------------------------
//  Add / Remove list items
// ------------------------------------------------------------
function addListItem(sectionId) {
  const page = currentSchema.pages[currentStep];
  const pageData = formData[page.id] || {};
  if (!Array.isArray(pageData[sectionId])) pageData[sectionId] = [];
  pageData[sectionId].push({});
  if (!formData[page.id]) formData[page.id] = {};
  formData[page.id][sectionId] = pageData[sectionId];
  renderForm();
}

function removeListItem(sectionId, idx) {
  const page = currentSchema.pages[currentStep];
  const pageData = formData[page.id] || {};
  if (Array.isArray(pageData[sectionId])) {
    pageData[sectionId].splice(idx, 1);
    formData[page.id][sectionId] = pageData[sectionId];
    renderForm();
  }
}

// ============================================================
//  WIZARD NAVIGATION
// ============================================================
document.addEventListener('click', (e) => {
  const gotoBtn = e.target.closest('[data-goto-step]');
  if (gotoBtn) {
    currentStep = Number(gotoBtn.dataset.gotoStep);
    renderSteps();
    renderForm();
  }
});

document.getElementById('prevStepBtn')?.addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep--;
    renderSteps();
    renderForm();
  }
});

document.getElementById('nextStepBtn')?.addEventListener('click', () => {
  if (currentStep < currentSchema.pages.length - 1) {
    currentStep++;
    renderSteps();
    renderForm();
  }
});

document.getElementById('changeThemeBtn')?.addEventListener('click', () => {
  if (!confirm('Change theme? Unsaved changes will be lost.')) return;
  currentTheme = null;
  currentSchema = null;
  currentStep = 0;
  formData = {};
  document.getElementById('wizardContainer').classList.add('hidden');
  document.getElementById('themeSelectStep').classList.remove('hidden');
});

// ============================================================
//  SAVE / PUBLISH
// ============================================================
document.getElementById('saveDraftBtn')?.addEventListener('click', () => {
  console.log('Draft saved:', { theme: currentTheme, data: formData });
  showToast('Draft saved successfully');
});

document.getElementById('publishBtn')?.addEventListener('click', () => {
  console.log('Published:', { theme: currentTheme, data: formData });
  showToast('Content published');
});

// ============================================================
//  Toast
// ============================================================
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'fixed bottom-5 right-5 z-[60] bg-slate-900 text-white text-sm ' +
                'font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2';
  t.innerHTML = `<i data-lucide="check-circle-2" class="w-4 h-4"></i> ${msg}`;
  document.body.appendChild(t);
  if (window.lucide) window.lucide.createIcons();
  setTimeout(() => t.remove(), 2400);
}
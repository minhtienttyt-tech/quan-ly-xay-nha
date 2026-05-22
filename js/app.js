// ─────────────────────────────────────────────
//  APP – router, event bindings, init
// ─────────────────────────────────────────────

let currentPage = 'dashboard';

// ── Navigation ────────────────────────────────

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  const navEl  = document.getElementById('nav-' + page);
  if (pageEl) pageEl.classList.add('active');
  if (navEl)  navEl.classList.add('active');
  currentPage = page;
  renderCurrentPage();
}

function renderCurrentPage() {
  if (currentPage === 'dashboard')    renderDashboard();
  if (currentPage === 'categories')   renderCategories();
  if (currentPage === 'transactions') renderTransactions();
  if (currentPage === 'reports')      renderReports();
}

function refreshAll() {
  renderCurrentPage();
}

// ── Settings Modal ────────────────────────────

function openSettings() {
  const p = DB.getProject();
  document.getElementById('inp-proj-name').value    = p.name || '';
  document.getElementById('inp-total-budget').value = p.totalBudget ? formatInputCurrency(p.totalBudget) : '';
  document.getElementById('inp-start-date').value   = p.startDate || '';
  document.getElementById('inp-end-date').value     = p.endDate || '';
  document.getElementById('inp-sheet-url').value    = p.googleSheetUrl || '';
  openModal('modal-settings');
}

function saveSettings() {
  const name        = document.getElementById('inp-proj-name').value.trim();
  const totalBudget = parseNum(document.getElementById('inp-total-budget').value);
  const startDate   = document.getElementById('inp-start-date').value;
  const endDate     = document.getElementById('inp-end-date').value;
  const googleSheetUrl = document.getElementById('inp-sheet-url').value.trim();
  if (!name) { showToast('Vui lòng nhập tên dự án', 'error'); return; }
  DB.saveProject({ name, totalBudget, startDate, endDate, googleSheetUrl });
  closeModal('modal-settings');
  showToast('Đã lưu thông tin dự án');
  refreshAll();
}

// ── Event Bindings ────────────────────────────

function bindEvents() {
  // Nav
  document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // Header
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('sync-btn').addEventListener('click', async () => {
    const btn = document.getElementById('sync-btn');
    btn.style.opacity = '0.5';
    try {
      showToast('Đang đồng bộ dữ liệu...', 'info');
      await DB.syncFromGoogleSheet();
      showToast('Đồng bộ thành công!');
      refreshAll();
    } catch (e) {
      showToast(e.message || 'Lỗi đồng bộ', 'error');
    } finally {
      btn.style.opacity = '1';
    }
  });

  // Edit budget shortcut on dashboard
  document.getElementById('edit-budget-btn').addEventListener('click', openSettings);

  // See all transactions
  document.getElementById('see-all-txn-btn').addEventListener('click', () => navigateTo('transactions'));

  // Settings modal
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings);

  // Category modal
  document.getElementById('add-category-btn').addEventListener('click', openAddCategory);
  document.getElementById('save-cat-btn').addEventListener('click', saveCategory);

  // Transaction modal
  document.getElementById('add-txn-btn').addEventListener('click', () => openAddTransaction());
  document.getElementById('save-txn-btn').addEventListener('click', saveTransaction);

  // FAB nav button opens add transaction
  document.getElementById('nav-transactions').addEventListener('click', () => {
    if (currentPage === 'transactions') {
      openAddTransaction();
    } else {
      navigateTo('transactions');
    }
  });

  // Print
  document.getElementById('print-btn').addEventListener('click', () => window.print());

  // Search
  document.getElementById('txn-search').addEventListener('input', renderTransactions);

  // Auto-format currency inputs
  ['inp-total-budget', 'inp-cat-budget', 'inp-txn-amount'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function(e) {
        const raw = e.target.value.replace(/[^\d]/g, '');
        e.target.value = raw ? formatInputCurrency(parseInt(raw, 10)) : '';
      });
    }
  });

  // Close buttons (data-close attribute)
  document.querySelectorAll('.close-btn[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
}

// ── First-run check ───────────────────────────

function checkFirstRun() {
  const p = DB.getProject();
  if (!p.totalBudget) {
    // Slight delay to let page render
    setTimeout(() => {
      openSettings();
      showToast('👋 Chào mừng! Hãy thiết lập dự án của bạn.', 'info');
    }, 600);
  }
}

async function autoSync() {
  const p = DB.getProject();
  if (GLOBAL_SHEET_URL || p.googleSheetUrl) {
    try {
      await DB.syncFromGoogleSheet();
      refreshAll();
    } catch(e) {
      console.log('Auto sync failed:', e);
    }
  }
}

// ── Init ──────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  navigateTo('dashboard');
  checkFirstRun();
  autoSync();
});

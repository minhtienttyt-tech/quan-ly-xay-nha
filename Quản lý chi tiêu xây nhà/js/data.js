// ─────────────────────────────────────────────
//  DATA – localStorage CRUD layer
// ─────────────────────────────────────────────

const STORAGE_KEY = 'xaynha_app_v1';

const DEFAULT_DATA = {
  project: {
    name: 'Dự án xây nhà',
    totalBudget: 0,
    startDate: '',
    endDate: ''
  },
  categories: [
    { id: 'cat_1', name: 'Phần thô', budget: 0, color: '#FF6B6B', icon: '🏗️' },
    { id: 'cat_2', name: 'Hoàn thiện', budget: 0, color: '#4ECDC4', icon: '🎨' },
    { id: 'cat_3', name: 'Điện – Nước', budget: 0, color: '#45B7D1', icon: '⚡' },
    { id: 'cat_4', name: 'Nội thất', budget: 0, color: '#96CEB4', icon: '🛋️' },
    { id: 'cat_5', name: 'Nhân công', budget: 0, color: '#FFEAA7', icon: '👷' },
    { id: 'cat_6', name: 'Khác', budget: 0, color: '#DDA0DD', icon: '📦' }
  ],
  transactions: []
};

// ── Internal helpers ──────────────────────────

function _load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_DATA));
    const parsed = JSON.parse(raw);
    // Ensure all keys exist (migration-safe)
    if (!parsed.project) parsed.project = { ...DEFAULT_DATA.project };
    if (!parsed.categories) parsed.categories = [];
    if (!parsed.transactions) parsed.transactions = [];
    return parsed;
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function _save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Project ───────────────────────────────────

const DB = {
  getProject() {
    return _load().project;
  },
  saveProject(proj) {
    const data = _load();
    data.project = { ...data.project, ...proj };
    _save(data);
  },

  // ── Categories ─────────────────────────────

  getCategories() {
    return _load().categories;
  },
  addCategory(cat) {
    const data = _load();
    cat.id = cat.id || genId('cat');
    data.categories.push(cat);
    _save(data);
    return cat;
  },
  updateCategory(id, updates) {
    const data = _load();
    const idx = data.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      data.categories[idx] = { ...data.categories[idx], ...updates };
      _save(data);
    }
  },
  deleteCategory(id) {
    const data = _load();
    data.categories = data.categories.filter(c => c.id !== id);
    // Also remove transactions for this category
    data.transactions = data.transactions.filter(t => t.categoryId !== id);
    _save(data);
  },

  // ── Transactions ───────────────────────────

  getTransactions() {
    return _load().transactions.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  },
  addTransaction(txn) {
    const data = _load();
    txn.id = txn.id || genId('txn');
    data.transactions.push(txn);
    _save(data);
    return txn;
  },
  updateTransaction(id, updates) {
    const data = _load();
    const idx = data.transactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      data.transactions[idx] = { ...data.transactions[idx], ...updates };
      _save(data);
    }
  },
  deleteTransaction(id) {
    const data = _load();
    data.transactions = data.transactions.filter(t => t.id !== id);
    _save(data);
  },

  // ── Derived data ───────────────────────────

  /** Returns { [categoryId]: totalSpent } */
  getSpentPerCategory() {
    const txns = this.getTransactions();
    const map = {};
    txns.forEach(t => {
      map[t.categoryId] = (map[t.categoryId] || 0) + (t.amount || 0);
    });
    return map;
  },

  /** Total spent across all categories */
  getTotalSpent() {
    return this.getTransactions().reduce((sum, t) => sum + (t.amount || 0), 0);
  },

  /** Spent per month { 'YYYY-MM': amount } */
  getSpentPerMonth() {
    const txns = this.getTransactions();
    const map = {};
    txns.forEach(t => {
      const key = monthKey(t.date);
      if (key) map[key] = (map[key] || 0) + (t.amount || 0);
    });
    return map;
  },

  /** Reset to default data (for dev) */
  reset() {
    _save(JSON.parse(JSON.stringify(DEFAULT_DATA)));
  }
};

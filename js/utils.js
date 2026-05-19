// ─────────────────────────────────────────────
//  UTILS – helpers shared across all modules
// ─────────────────────────────────────────────

/** Format number as Vietnamese currency */
function formatVND(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

/** Format date string (YYYY-MM-DD) → DD/MM/YYYY */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

/** Today as YYYY-MM-DD */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Generate a simple unique id */
function genId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Show toast notification */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

/** Open modal */
function openModal(id) {
  const el = document.getElementById(id);
  el.classList.remove('hidden');
  requestAnimationFrame(() => el.classList.add('open'));
}

/** Close modal */
function closeModal(id) {
  const el = document.getElementById(id);
  el.classList.remove('open');
  setTimeout(() => el.classList.add('hidden'), 300);
}

/** Clamp value between min and max */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/** Truncate text */
function truncate(str, n = 30) {
  return str && str.length > n ? str.slice(0, n) + '…' : str;
}

/** Month label from YYYY-MM-DD */
function monthLabel(dateStr) {
  if (!dateStr) return '';
  const [y, m] = dateStr.split('-');
  return `${m}/${y}`;
}

/** Get month key YYYY-MM from date string */
function monthKey(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : '';
}

/** Parse number input safely */
function parseNum(val) {
  const n = parseFloat(String(val).replace(/[^\d.]/g, ''));
  return isNaN(n) ? 0 : n;
}

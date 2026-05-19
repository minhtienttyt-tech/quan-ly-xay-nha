// ─────────────────────────────────────────────
//  TRANSACTIONS
// ─────────────────────────────────────────────

let activeCatFilter = 'all';

function renderTransactions() {
  const categories = DB.getCategories();
  const catMap     = Object.fromEntries(categories.map(c => [c.id, c]));

  // Filter chips
  const chips = document.getElementById('cat-filter-chips');
  chips.innerHTML = `<button class="chip ${activeCatFilter === 'all' ? 'active' : ''}" data-cat="all">Tất cả</button>` +
    categories.map(c => `<button class="chip ${activeCatFilter === c.id ? 'active' : ''}" data-cat="${c.id}" style="${activeCatFilter === c.id ? `background:${c.color};border-color:${c.color}` : `border-color:${c.color}44`}">${c.icon} ${c.name}</button>`).join('');
  chips.querySelectorAll('.chip').forEach(btn => btn.addEventListener('click', () => {
    activeCatFilter = btn.dataset.cat;
    renderTransactions();
  }));

  // Populate category select in modal
  const sel = document.getElementById('inp-txn-category');
  sel.innerHTML = categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');

  // Filter + search
  const searchVal = (document.getElementById('txn-search')?.value || '').toLowerCase();
  let txns = DB.getTransactions();
  if (activeCatFilter !== 'all') txns = txns.filter(t => t.categoryId === activeCatFilter);
  if (searchVal) txns = txns.filter(t => (t.description || '').toLowerCase().includes(searchVal) || (t.note || '').toLowerCase().includes(searchVal));

  renderTxnList('all-txn-list', txns, catMap, true);
}

function openAddTransaction(prefillCatId = null) {
  document.getElementById('modal-txn-title').textContent = 'Thêm Chi Tiêu';
  document.getElementById('inp-txn-id').value = '';
  document.getElementById('inp-txn-desc').value = '';
  document.getElementById('inp-txn-amount').value = '';
  document.getElementById('inp-txn-date').value = todayISO();
  document.getElementById('inp-txn-note').value = '';

  // Populate select
  const categories = DB.getCategories();
  const sel = document.getElementById('inp-txn-category');
  sel.innerHTML = categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  if (prefillCatId) sel.value = prefillCatId;

  openModal('modal-transaction');
}

function openEditTransaction(id) {
  const txn = DB.getTransactions().find(t => t.id === id);
  if (!txn) return;
  document.getElementById('modal-txn-title').textContent = 'Sửa Chi Tiêu';
  document.getElementById('inp-txn-id').value     = txn.id;
  document.getElementById('inp-txn-desc').value   = txn.description || '';
  document.getElementById('inp-txn-amount').value = txn.amount || '';
  document.getElementById('inp-txn-date').value   = txn.date || todayISO();
  document.getElementById('inp-txn-note').value   = txn.note || '';

  const categories = DB.getCategories();
  const sel = document.getElementById('inp-txn-category');
  sel.innerHTML = categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  sel.value = txn.categoryId || '';

  openModal('modal-transaction');
}

function saveTransaction() {
  const id     = document.getElementById('inp-txn-id').value;
  const catId  = document.getElementById('inp-txn-category').value;
  const desc   = document.getElementById('inp-txn-desc').value.trim();
  const amount = parseNum(document.getElementById('inp-txn-amount').value);
  const date   = document.getElementById('inp-txn-date').value;
  const note   = document.getElementById('inp-txn-note').value.trim();

  if (!desc)   { showToast('Vui lòng nhập mô tả', 'error'); return; }
  if (!amount) { showToast('Vui lòng nhập số tiền', 'error'); return; }
  if (!date)   { showToast('Vui lòng chọn ngày', 'error'); return; }
  if (!catId)  { showToast('Vui lòng chọn hạng mục', 'error'); return; }

  if (id) {
    DB.updateTransaction(id, { categoryId: catId, description: desc, amount, date, note });
    showToast('Đã cập nhật chi tiêu');
  } else {
    DB.addTransaction({ categoryId: catId, description: desc, amount, date, note });
    showToast('Đã thêm chi tiêu');
  }
  closeModal('modal-transaction');
  refreshAll();
}

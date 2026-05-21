// ─────────────────────────────────────────────
//  CATEGORIES
// ─────────────────────────────────────────────

const CAT_COLORS = ['#FF6B6B','#FF8E53','#FECA57','#48DBFB','#4ECDC4','#45B7D1','#A29BFE','#FD79A8','#55EFC4','#B2BEC3','#6C5CE7','#DDA0DD'];
const CAT_ICONS  = ['🏗️','🎨','⚡','💧','🛋️','🪟','🚪','🔩','🪵','🧱','👷','📦','🛠️','🪣','🏠','🌿'];

let selectedColor = CAT_COLORS[0];
let selectedIcon  = CAT_ICONS[0];

function renderCategories() {
  const categories = DB.getCategories();
  const spentMap   = DB.getSpentPerCategory();
  const grid = document.getElementById('cat-grid');

  if (!categories.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🗂️</div><p>Chưa có hạng mục nào</p></div>`;
    return;
  }

  grid.innerHTML = categories.map(c => {
    const spent  = spentMap[c.id] || 0;
    const budget = c.budget || 0;
    const pct    = budget > 0 ? clamp(Math.round((spent / budget) * 100), 0, 100) : 0;
    const over   = budget > 0 && spent > budget;
    return `
    <div class="cat-card" data-id="${c.id}">
      <div class="cat-card-header">
        <div class="cat-icon-wrap" style="background:${c.color}22">${c.icon}</div>
        <div class="cat-actions">
          <button class="mini-btn edit-cat-btn" data-id="${c.id}">✏️</button>
          <button class="mini-btn del-cat-btn" data-id="${c.id}">🗑️</button>
        </div>
      </div>
      <div class="cat-name">${c.name}</div>
      <div class="cat-spent" style="color:${c.color}">${formatVND(spent)}</div>
      <div class="cat-budget-label">/ ${formatVND(budget)}</div>
      <div class="cat-progress-track">
        <div class="cat-progress-fill ${over ? 'danger' : ''}" style="width:${pct}%;background:${c.color}"></div>
      </div>
      <div class="cat-pct ${over ? 'danger-text' : ''}">${over ? '⚠️ Vượt ' : ''}${pct}%</div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.edit-cat-btn').forEach(btn => btn.addEventListener('click', () => openEditCategory(btn.dataset.id)));
  grid.querySelectorAll('.del-cat-btn').forEach(btn => btn.addEventListener('click', () => {
    if (confirm('Xóa hạng mục này và toàn bộ chi tiêu liên quan?')) {
      DB.deleteCategory(btn.dataset.id);
      showToast('Đã xóa hạng mục');
      refreshAll();
    }
  }));
}

function initCategoryModal() {
  const colorPicker = document.getElementById('color-picker');
  colorPicker.innerHTML = CAT_COLORS.map(c => `
    <button class="color-swatch ${c === selectedColor ? 'active' : ''}" data-color="${c}" style="background:${c}"></button>`).join('');
  colorPicker.querySelectorAll('.color-swatch').forEach(btn => btn.addEventListener('click', () => {
    selectedColor = btn.dataset.color;
    colorPicker.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }));

  const iconPicker = document.getElementById('icon-picker');
  iconPicker.innerHTML = CAT_ICONS.map(i => `
    <button class="icon-swatch ${i === selectedIcon ? 'active' : ''}" data-icon="${i}">${i}</button>`).join('');
  iconPicker.querySelectorAll('.icon-swatch').forEach(btn => btn.addEventListener('click', () => {
    selectedIcon = btn.dataset.icon;
    iconPicker.querySelectorAll('.icon-swatch').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }));
}

function openAddCategory() {
  document.getElementById('modal-cat-title').textContent = 'Thêm Hạng Mục';
  document.getElementById('inp-cat-id').value = '';
  document.getElementById('inp-cat-name').value = '';
  document.getElementById('inp-cat-budget').value = '';
  selectedColor = CAT_COLORS[0];
  selectedIcon  = CAT_ICONS[0];
  initCategoryModal();
  openModal('modal-category');
}

function openEditCategory(id) {
  const cat = DB.getCategories().find(c => c.id === id);
  if (!cat) return;
  document.getElementById('modal-cat-title').textContent = 'Sửa Hạng Mục';
  document.getElementById('inp-cat-id').value   = cat.id;
  document.getElementById('inp-cat-name').value = cat.name;
  document.getElementById('inp-cat-budget').value = cat.budget ? formatInputCurrency(cat.budget) : '';
  selectedColor = cat.color || CAT_COLORS[0];
  selectedIcon  = cat.icon  || CAT_ICONS[0];
  initCategoryModal();
  openModal('modal-category');
}

function saveCategory() {
  const id     = document.getElementById('inp-cat-id').value;
  const name   = document.getElementById('inp-cat-name').value.trim();
  const budget = parseNum(document.getElementById('inp-cat-budget').value);
  if (!name) { showToast('Vui lòng nhập tên hạng mục', 'error'); return; }

  if (id) {
    DB.updateCategory(id, { name, budget, color: selectedColor, icon: selectedIcon });
    showToast('Đã cập nhật hạng mục');
  } else {
    DB.addCategory({ name, budget, color: selectedColor, icon: selectedIcon });
    showToast('Đã thêm hạng mục');
  }
  closeModal('modal-category');
  refreshAll();
}

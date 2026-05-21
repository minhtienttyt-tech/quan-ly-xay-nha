// ─────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────

let donutChart = null;

function renderDashboard() {
  const project = DB.getProject();
  const categories = DB.getCategories();
  const spentMap = DB.getSpentPerCategory();
  const totalSpent = DB.getTotalSpent();
  const totalBudget = project.totalBudget || 0;
  const remaining = totalBudget - totalSpent;
  const pct = totalBudget > 0 ? clamp(Math.round((totalSpent / totalBudget) * 100), 0, 100) : 0;

  document.getElementById('project-name-display').textContent = project.name || 'Dự án của tôi';
  document.getElementById('dash-total-budget').textContent = formatVND(totalBudget);
  document.getElementById('dash-spent').textContent = formatVND(totalSpent);
  document.getElementById('dash-remaining').textContent = formatVND(remaining);
  document.getElementById('dash-progress').style.width = pct + '%';
  document.getElementById('dash-progress').className = 'progress-fill' + (pct >= 100 ? ' danger' : pct >= 80 ? ' warning' : '');
  document.getElementById('dash-progress-pct').textContent = pct + '%';

  // Over-budget alert
  const overBudget = categories.some(c => (spentMap[c.id] || 0) > c.budget && c.budget > 0);
  document.getElementById('over-budget-alert').classList.toggle('hidden', !overBudget);

  // Donut chart
  renderDonutChart(categories, spentMap);

  // Recent transactions (last 5)
  const txns = DB.getTransactions().slice(0, 5);
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
  renderTxnList('dash-recent-txn', txns, catMap, false);
}

function renderDonutChart(categories, spentMap) {
  const ctx = document.getElementById('donut-chart').getContext('2d');
  const labels = categories.map(c => c.name);
  const values = categories.map(c => spentMap[c.id] || 0);
  const colors = categories.map(c => c.color);
  const hasData = values.some(v => v > 0);

  if (donutChart) donutChart.destroy();

  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: hasData ? values : [1],
        backgroundColor: hasData ? colors : ['#2a2a3a'],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      cutout: '68%',
      plugins: { legend: { display: false }, tooltip: {
        callbacks: {
          label: ctx => ` ${formatVND(ctx.raw)}`
        }
      }},
      animation: { animateRotate: true, duration: 800 }
    }
  });

  // Legend
  const legend = document.getElementById('chart-legend');
  legend.innerHTML = categories.map(c => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${c.color}"></span>
      <div class="legend-info">
        <span class="legend-name">${c.name}</span>
        <span class="legend-val">${formatVND(spentMap[c.id] || 0)}</span>
      </div>
    </div>`).join('');
}

function renderTxnList(containerId, txns, catMap, showActions = true) {
  const el = document.getElementById(containerId);
  if (!txns.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">💸</div><p>Chưa có giao dịch nào</p></div>`;
    return;
  }
  el.innerHTML = txns.map(t => {
    const cat = catMap[t.categoryId] || {};
    return `
    <div class="txn-item" data-id="${t.id}">
      <div class="txn-icon" style="background:${cat.color || '#555'}22;color:${cat.color || '#aaa'}">${cat.icon || '📦'}</div>
      <div class="txn-info">
        <div class="txn-desc">${truncate(t.description || '—', 28)}</div>
        <div class="txn-meta">${cat.name || '—'} · ${formatDate(t.date)}</div>
      </div>
      <div class="txn-right">
        <div class="txn-amount">-${formatVND(t.amount)}</div>
        ${showActions ? `<div class="txn-actions">
          <button class="mini-btn edit-txn-btn" data-id="${t.id}">✏️</button>
          <button class="mini-btn del-txn-btn" data-id="${t.id}">🗑️</button>
        </div>` : ''}
      </div>
    </div>`;
  }).join('');

  if (showActions) {
    el.querySelectorAll('.edit-txn-btn').forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation();
      openEditTransaction(btn.dataset.id);
    }));
    el.querySelectorAll('.del-txn-btn').forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation();
      if (confirm('Xóa giao dịch này?')) {
        DB.deleteTransaction(btn.dataset.id);
        DB.syncToGoogleSheet('delete', { id: btn.dataset.id });
        showToast('Đã xóa giao dịch');
        refreshAll();
      }
    }));
  }
}

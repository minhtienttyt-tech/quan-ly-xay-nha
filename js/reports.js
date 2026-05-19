// ─────────────────────────────────────────────
//  REPORTS
// ─────────────────────────────────────────────

let barChart     = null;
let compareChart = null;

function renderReports() {
  const project    = DB.getProject();
  const categories = DB.getCategories();
  const spentMap   = DB.getSpentPerCategory();
  const totalSpent = DB.getTotalSpent();
  const totalBudget = project.totalBudget || 0;

  // Summary cards
  const summary = document.getElementById('report-summary');
  const remaining = totalBudget - totalSpent;
  const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  summary.innerHTML = `
    <div class="report-card">
      <div class="rc-label">Tổng ngân sách</div>
      <div class="rc-value">${formatVND(totalBudget)}</div>
    </div>
    <div class="report-card spent">
      <div class="rc-label">Đã chi</div>
      <div class="rc-value">${formatVND(totalSpent)}</div>
    </div>
    <div class="report-card ${remaining < 0 ? 'danger' : 'safe'}">
      <div class="rc-label">Còn lại</div>
      <div class="rc-value">${formatVND(remaining)}</div>
    </div>
    <div class="report-card">
      <div class="rc-label">Tiến độ</div>
      <div class="rc-value">${pct}%</div>
    </div>`;

  // Bar chart – spending per month
  const spentPerMonth = DB.getSpentPerMonth();
  const monthKeys = Object.keys(spentPerMonth).sort();
  const barCtx = document.getElementById('bar-chart').getContext('2d');
  if (barChart) barChart.destroy();
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: monthKeys.map(k => { const [y,m] = k.split('-'); return `${m}/${y}`; }),
      datasets: [{
        label: 'Chi tiêu',
        data: monthKeys.map(k => spentPerMonth[k]),
        backgroundColor: '#A29BFE99',
        borderColor: '#A29BFE',
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ' + formatVND(c.raw) }}},
      scales: {
        x: { ticks: { color: '#aaa' }, grid: { color: '#ffffff10' }},
        y: { ticks: { color: '#aaa', callback: v => (v >= 1e6 ? (v/1e6).toFixed(0)+'M' : v) }, grid: { color: '#ffffff10' }}
      }
    }
  });

  // Compare chart – budget vs spent per category
  const cmpCtx = document.getElementById('compare-chart').getContext('2d');
  if (compareChart) compareChart.destroy();
  compareChart = new Chart(cmpCtx, {
    type: 'bar',
    data: {
      labels: categories.map(c => c.name),
      datasets: [
        { label: 'Ngân sách', data: categories.map(c => c.budget || 0), backgroundColor: '#4ECDC455', borderColor: '#4ECDC4', borderWidth: 2, borderRadius: 6 },
        { label: 'Đã chi',    data: categories.map(c => spentMap[c.id] || 0), backgroundColor: '#FF6B6B88', borderColor: '#FF6B6B', borderWidth: 2, borderRadius: 6 }
      ]
    },
    options: {
      plugins: { legend: { labels: { color: '#ccc' }}, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${formatVND(c.raw)}` }}},
      scales: {
        x: { ticks: { color: '#aaa', maxRotation: 30 }, grid: { color: '#ffffff10' }},
        y: { ticks: { color: '#aaa', callback: v => (v >= 1e6 ? (v/1e6).toFixed(0)+'M' : v) }, grid: { color: '#ffffff10' }}
      }
    }
  });

  // Table
  const tbody = document.getElementById('report-table-body');
  tbody.innerHTML = categories.map(c => {
    const spent  = spentMap[c.id] || 0;
    const budget = c.budget || 0;
    const pct    = budget > 0 ? clamp(Math.round((spent / budget) * 100), 0, 999) : 0;
    const over   = budget > 0 && spent > budget;
    return `<tr class="${over ? 'row-over' : ''}">
      <td><span class="cat-tag" style="background:${c.color}22;color:${c.color}">${c.icon} ${c.name}</span></td>
      <td>${formatVND(budget)}</td>
      <td>${formatVND(spent)}</td>
      <td class="${over ? 'danger-text' : ''}">${pct}%</td>
    </tr>`;
  }).join('');
}

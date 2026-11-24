'use strict';

const subscriptions = Object.freeze([
  {
    name: 'Designly',
    category: 'Design',
    monthlyCost: 18,
    renewalDate: '2026-12-03',
    status: 'Active',
  },
  {
    name: 'CloudSafe',
    category: 'Storage',
    monthlyCost: 9.99,
    renewalDate: '2026-12-07',
    status: 'Active',
  },
  {
    name: 'FocusFlow',
    category: 'Productivity',
    monthlyCost: 12,
    renewalDate: '2026-12-15',
    status: 'Active',
  },
  {
    name: 'SoundWave',
    category: 'Entertainment',
    monthlyCost: 11.99,
    renewalDate: '2026-12-20',
    status: 'Active',
  },
  {
    name: 'CodeLab',
    category: 'Learning',
    monthlyCost: 29,
    renewalDate: '2026-12-28',
    status: 'Active',
  },
  {
    name: 'NewsDesk',
    category: 'News',
    monthlyCost: 6.5,
    renewalDate: '2027-01-05',
    status: 'Paused',
  },
]);

function getActiveSubscriptions(items) {
  return items.filter((item) => item.status === 'Active');
}

function calculateMonthlyTotal(items) {
  return getActiveSubscriptions(items).reduce(
    (total, item) => total + item.monthlyCost,
    0,
  );
}

function calculateYearlyForecast(items) {
  return calculateMonthlyTotal(items) * 12;
}

function getLocalISODate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getNextRenewal(items, today = getLocalISODate()) {
  return (
    getActiveSubscriptions(items)
      .filter((item) => item.renewalDate >= today)
      .sort((first, second) => first.renewalDate.localeCompare(second.renewalDate))[0] ??
    null
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function summarizeCategorySpend(items) {
  const activeItems = getActiveSubscriptions(items);
  const total = calculateMonthlyTotal(activeItems);
  const totals = activeItems.reduce((summary, item) => {
    summary.set(item.category, (summary.get(item.category) ?? 0) + item.monthlyCost);
    return summary;
  }, new Map());

  return [...totals.entries()]
    .map(([category, monthlyCost]) => ({
      category,
      monthlyCost,
      percentage: total === 0 ? 0 : (monthlyCost / total) * 100,
    }))
    .sort(
      (first, second) =>
        second.monthlyCost - first.monthlyCost ||
        first.category.localeCompare(second.category),
    );
}

function makeCell(text, className = '') {
  const cell = document.createElement('td');
  cell.textContent = text;
  if (className) cell.className = className;
  return cell;
}

function renderSubscriptionRows(items) {
  const list = document.querySelector('#subscription-list');
  list.replaceChildren();

  items.forEach((item) => {
    const row = document.createElement('tr');
    row.append(
      makeCell(item.name, 'service-name'),
      makeCell(item.category),
      makeCell(formatCurrency(item.monthlyCost)),
      makeCell(formatDate(item.renewalDate)),
    );

    const statusCell = document.createElement('td');
    const status = document.createElement('span');
    status.className = `status-pill${
      item.status === 'Paused' ? ' status-pill--paused' : ''
    }`;
    status.textContent = item.status;
    statusCell.append(status);
    row.append(statusCell);
    list.append(row);
  });
}

function renderCategorySpend(items) {
  const list = document.querySelector('#category-spend-list');
  const summary = summarizeCategorySpend(items);
  list.replaceChildren();

  if (summary.length === 0) {
    const message = document.createElement('p');
    message.className = 'category-spend-empty';
    message.textContent = 'No active subscription costs to compare.';
    list.append(message);
    return;
  }

  summary.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'category-spend-row';

    const label = document.createElement('span');
    label.className = 'category-spend-label';
    label.textContent = entry.category;

    const track = document.createElement('div');
    track.className = 'category-spend-track';
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-label', `${entry.category} share of monthly spend`);
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', '100');
    track.setAttribute('aria-valuenow', String(Math.round(entry.percentage)));
    track.setAttribute(
      'aria-valuetext',
      `${formatCurrency(entry.monthlyCost)}, ${entry.percentage.toFixed(1)} percent`,
    );

    const bar = document.createElement('span');
    bar.className = 'category-spend-bar';
    bar.style.width = `${entry.percentage}%`;
    track.append(bar);

    const value = document.createElement('span');
    value.className = 'category-spend-value';
    value.textContent = formatCurrency(entry.monthlyCost);

    row.append(label, track, value);
    list.append(row);
  });
}

function renderDashboard(items) {
  const activeItems = getActiveSubscriptions(items);
  const nextRenewal = getNextRenewal(items);

  document.querySelector('#monthly-spend').textContent = formatCurrency(
    calculateMonthlyTotal(items),
  );
  document.querySelector('#yearly-forecast').textContent = formatCurrency(
    calculateYearlyForecast(items),
  );
  document.querySelector('#active-count').textContent = String(activeItems.length);
  document.querySelector('#plan-count').textContent = `${items.length} plans`;
  document.querySelector('#next-renewal').textContent = nextRenewal?.name ?? 'None';
  document.querySelector('#next-renewal-date').textContent = nextRenewal
    ? `${formatDate(nextRenewal.renewalDate)} · ${formatCurrency(nextRenewal.monthlyCost)}`
    : 'No upcoming charge';

  renderSubscriptionRows(items);
  renderCategorySpend(items);
}

if (typeof document !== 'undefined') {
  renderDashboard(subscriptions);
}

if (typeof module !== 'undefined') {
  module.exports = {
    subscriptions,
    getActiveSubscriptions,
    calculateMonthlyTotal,
    calculateYearlyForecast,
    getLocalISODate,
    getNextRenewal,
    formatCurrency,
    formatDate,
    summarizeCategorySpend,
  };
}

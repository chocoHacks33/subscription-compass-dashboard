'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  subscriptions,
  getActiveSubscriptions,
  calculateMonthlyTotal,
  calculateYearlyForecast,
  getLocalISODate,
  getNextRenewal,
  formatCurrency,
  formatDate,
  protectSpreadsheetCell,
  escapeCsvCell,
  buildSubscriptionCsv,
} = require('../app.js');

test('active subscriptions exclude paused plans', () => {
  assert.equal(getActiveSubscriptions(subscriptions).length, 5);
});

test('monthly total includes active plans only', () => {
  assert.equal(calculateMonthlyTotal(subscriptions), 80.98);
});

test('yearly forecast is twelve months of active costs', () => {
  assert.equal(calculateYearlyForecast(subscriptions), 971.76);
});

test('next renewal ignores paused and past plans', () => {
  const next = getNextRenewal(subscriptions, '2026-12-08');
  assert.equal(next.name, 'FocusFlow');
});

test('next renewal returns null when no active renewal remains', () => {
  assert.equal(getNextRenewal(subscriptions, '2027-02-01'), null);
});

test('local ISO dates retain local calendar components', () => {
  assert.equal(getLocalISODate(new Date(2026, 10, 24, 23, 50)), '2026-11-24');
});

test('currency and date formatters produce readable labels', () => {
  assert.equal(formatCurrency(12), '$12.00');
  assert.equal(formatDate('2026-12-15'), 'Dec 15, 2026');
});

test('CSV cells escape punctuation and neutralize spreadsheet formulas', () => {
  assert.equal(escapeCsvCell('Plan, Plus'), '"Plan, Plus"');
  assert.equal(escapeCsvCell('Say "hello"'), '"Say ""hello"""');
  assert.equal(protectSpreadsheetCell('=2+2'), "'=2+2");
  assert.equal(protectSpreadsheetCell('  @SUM(A1:A2)'), "'  @SUM(A1:A2)");
  assert.equal(protectSpreadsheetCell(12.5), '12.5');
});

test('subscription CSV includes a header and one row per plan', () => {
  const csv = buildSubscriptionCsv(subscriptions);
  const rows = csv.split('\r\n');
  assert.equal(rows[0], 'Service,Category,Monthly Cost,Renewal Date,Status');
  assert.equal(rows.length, subscriptions.length + 1);
  assert.match(csv, /Designly,Design,18\.00,2026-12-03,Active/);
});

test('subscription CSV protects user-provided service names', () => {
  const csv = buildSubscriptionCsv([
    {
      name: '=HYPERLINK("https://example.com")',
      category: 'Other',
      monthlyCost: 5,
      renewalDate: '2027-01-01',
      status: 'Active',
    },
  ]);
  assert.match(csv, /"'=HYPERLINK\(""https:\/\/example\.com""\)"/);
});

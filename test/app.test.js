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
  summarizeCategorySpend,
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

test('category spending aggregates active plans and sorts by cost', () => {
  const summary = summarizeCategorySpend([
    { category: 'Work', monthlyCost: 20, status: 'Active' },
    { category: 'Home', monthlyCost: 15, status: 'Active' },
    { category: 'Work', monthlyCost: 10, status: 'Active' },
    { category: 'Home', monthlyCost: 100, status: 'Paused' },
  ]);

  assert.deepEqual(summary, [
    { category: 'Work', monthlyCost: 30, percentage: 66.66666666666666 },
    { category: 'Home', monthlyCost: 15, percentage: 33.33333333333333 },
  ]);
});

test('category percentages account for all active monthly spending', () => {
  const summary = summarizeCategorySpend(subscriptions);
  const percentageTotal = summary.reduce(
    (total, entry) => total + entry.percentage,
    0,
  );
  assert.ok(Math.abs(percentageTotal - 100) < 1e-9);
  assert.equal(summary[0].category, 'Learning');
  assert.equal(summary.some((entry) => entry.category === 'News'), false);
});

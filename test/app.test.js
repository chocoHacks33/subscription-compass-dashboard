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
  normalizeBudget,
  calculateBudgetProgress,
  describeBudget,
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

test('budget values accept positive numbers and reject invalid input', () => {
  assert.equal(normalizeBudget('125.50'), 125.5);
  assert.equal(normalizeBudget('0'), 100);
  assert.equal(normalizeBudget('not-a-number', 80), 80);
});

test('budget progress is bounded to the progressbar range', () => {
  assert.equal(calculateBudgetProgress(50, 100), 50);
  assert.equal(calculateBudgetProgress(120, 100), 100);
  assert.equal(calculateBudgetProgress(-10, 100), 0);
});

test('budget description reports remaining and overspend amounts', () => {
  assert.equal(describeBudget(80, 100), '$20.00 remaining of $100.00');
  assert.equal(describeBudget(120, 100), '$20.00 over the $100.00 target');
});

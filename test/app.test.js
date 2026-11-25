'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  subscriptions,
  getActiveSubscriptions,
  calculateMonthlyTotal,
  calculateYearlyForecast,
  getLargestActiveSubscription,
  calculateMonthlyShare,
  getLocalISODate,
  getNextRenewal,
  formatCurrency,
  formatDate,
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

test('largest cost insight ignores paused plans and reports its monthly share', () => {
  const items = [
    { name: 'Starter', status: 'Active', monthlyCost: 20 },
    { name: 'Pro', status: 'Active', monthlyCost: 30 },
    { name: 'Legacy', status: 'Paused', monthlyCost: 100 },
  ];
  const largest = getLargestActiveSubscription(items);

  assert.equal(largest.name, 'Pro');
  assert.equal(calculateMonthlyShare(largest, items), 60);
});

test('largest cost insight handles an inventory without active spend', () => {
  const items = [{ name: 'Paused plan', status: 'Paused', monthlyCost: 12 }];

  assert.equal(getLargestActiveSubscription(items), null);
  assert.equal(calculateMonthlyShare(null, items), 0);
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

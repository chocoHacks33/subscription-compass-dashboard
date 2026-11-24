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
  daysUntilRenewal,
  getUpcomingRenewals,
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

test('renewal day math is stable across calendar boundaries', () => {
  assert.equal(daysUntilRenewal('2027-01-02', '2026-12-31'), 2);
  assert.equal(daysUntilRenewal('2026-12-31', '2026-12-31'), 0);
});

test('renewal planner includes only active plans inside the horizon', () => {
  const upcoming = getUpcomingRenewals(subscriptions, '2026-11-24', 30);
  assert.deepEqual(
    upcoming.map((item) => [item.name, item.daysRemaining]),
    [
      ['Designly', 9],
      ['CloudSafe', 13],
      ['FocusFlow', 21],
      ['SoundWave', 26],
    ],
  );
});

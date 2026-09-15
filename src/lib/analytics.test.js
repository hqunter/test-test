import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCorrelation, calculateMdd, calculateReturn, calculateRollingCorrelation, formatDateRange, getChartDomain, getNearestIndex, normalizeSeries, sortByColumn, sortByMetric, toggleSelection, toDailyChanges } from './analytics.js';

test('converts yield levels into daily basis-point changes', () => {
  assert.deepEqual(toDailyChanges([4.00, 4.10, 4.05]), [0.10, -0.05]);
});

test('calculates Pearson correlation from aligned daily changes', () => {
  assert.equal(calculateCorrelation([1, 2, 3], [2, 4, 6]), 1);
  assert.equal(calculateCorrelation([1, 2, 3], [6, 4, 2]), -1);
});

test('returns rolling correlations with the requested window', () => {
  const result = calculateRollingCorrelation([1, 2, 3, 4, 5], [2, 4, 6, 8, 10], 3);
  assert.deepEqual(result, [1, 1, 1]);
});

test('formats the selected date range from the visible data window', () => {
  assert.equal(formatDateRange(['2026-05-20', '2026-06-18']), '2026.05.20 — 2026.06.18');
});

test('normalizes each market series to a common base of 100', () => {
  assert.deepEqual(normalizeSeries([50, 75, 100]), [100, 150, 200]);
});

test('finds the nearest chart point for a pointer position', () => {
  assert.equal(getNearestIndex(0.62, 5), 2);
  assert.equal(getNearestIndex(1, 5), 4);
});

test('creates a padded chart domain that contains every line and the base value', () => {
  assert.deepEqual(getChartDomain([[80, 120], [95, 105]]), { min: 76, max: 124 });
});

test('toggles a ticker in the selected chart set', () => {
  assert.deepEqual(toggleSelection(['sp500', 'gold'], 'gold'), ['sp500']);
  assert.deepEqual(toggleSelection(['sp500'], 'nasdaq'), ['sp500', 'nasdaq']);
});

test('calculates selected-period return and maximum drawdown', () => {
  assert.equal(calculateReturn([100, 120, 110]), 10);
  assert.equal(calculateMdd([100, 120, 90, 105]), 25);
});

test('sorts selected tickers by return or drawdown metric', () => {
  const items = [{ symbol: 'A', returnValue: 4, mdd: -12 }, { symbol: 'B', returnValue: 10, mdd: -28 }];
  assert.deepEqual(sortByMetric(items, 'return-desc').map((item) => item.symbol), ['B', 'A']);
  assert.deepEqual(sortByMetric(items, 'mdd-asc').map((item) => item.symbol), ['A', 'B']);
});

test('sorts table rows by a clicked column in either direction', () => {
  const items = [{ symbol: 'A', returnValue: 4 }, { symbol: 'B', returnValue: 10 }];
  assert.deepEqual(sortByColumn(items, 'returnValue', 'desc').map((item) => item.symbol), ['B', 'A']);
  assert.deepEqual(sortByColumn(items, 'returnValue', 'asc').map((item) => item.symbol), ['A', 'B']);
});

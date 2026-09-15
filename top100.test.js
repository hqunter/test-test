import test from 'node:test';
import assert from 'node:assert/strict';
import { top100Stocks } from './top100.js';

test('provides the top 100 US-listed stock ticker directory', () => {
  assert.equal(top100Stocks.length, 100);
  assert.equal(new Set(top100Stocks.map((stock) => stock.symbol)).size, 100);
  assert.ok(top100Stocks.some((stock) => stock.symbol === 'NVDA'));
  assert.ok(top100Stocks.some((stock) => stock.symbol === 'CRWD'));
});

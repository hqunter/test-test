import test from 'node:test';
import assert from 'node:assert/strict';
import { demoData, instruments, latestDataDate } from './demo.js';

test('includes gold alongside US indices and 10-year treasury yield', () => {
  assert.ok(instruments.some((instrument) => instrument.id === 'gold'));
  assert.ok(instruments.some((instrument) => instrument.id === 'us10y'));
  assert.equal(demoData.gold.at(-1).date, latestDataDate);
  assert.ok(demoData.gold.length >= 1200);
  assert.equal(demoData.gold[0].date, '2021-06-18');
});

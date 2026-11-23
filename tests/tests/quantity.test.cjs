const test = require('node:test');
const assert = require('node:assert/strict');
const { positiveInteger, productId, normalizeOrderItems } = require('../backend/utils/quantity');

test('quantities reject zero, negatives, fractions, strings and unsafe integers', () => {
  for (const value of [0, -2, 1.5, '2', null, true, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => positiveInteger(value));
  }
  assert.equal(positiveInteger(2), 2);
});
test('IDs must be positive whole IDs', () => {
  assert.equal(productId('12'), 12);
  for (const value of ['1x', '1.5', '-1', '', 0]) assert.throws(() => productId(value));
});
test('order lines are validated, combined and sorted', () => {
  assert.deepEqual(normalizeOrderItems([{ productId: 2, quantity: 1 }, { productId: 1, quantity: 2 }, { productId: 1, quantity: 3 }]), [{ productId: 1, quantity: 5 }, { productId: 2, quantity: 1 }]);
  for (const items of [null, [], {}, [null], [{ productId: 1, quantity: -1 }]]) assert.throws(() => normalizeOrderItems(items));
});

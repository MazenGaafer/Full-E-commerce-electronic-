const fail = (message) => Object.assign(new Error(message), { status: 400 });

// JSON quantities must be positive safe integers. Never silently truncate input.
const positiveInteger = (value, label = 'Quantity') => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) {
    throw fail(`${label} must be a positive integer`);
  }
  return value;
};

const productId = (value) => {
  const id = typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : value;
  return positiveInteger(id, 'Product ID');
};

const normalizeOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) throw fail('No order items');
  if (items.length > 100) throw fail('Too many order lines');
  const combined = new Map();
  for (const item of items) {
    if (!item || typeof item !== 'object') throw fail('Invalid order item');
    const id = productId(item.productId);
    const quantity = positiveInteger(item.quantity);
    combined.set(id, positiveInteger((combined.get(id) || 0) + quantity));
  }
  // Consistent locking order reduces deadlocks for overlapping baskets.
  return [...combined].sort(([a], [b]) => a - b).map(([productId, quantity]) => ({ productId, quantity }));
};

module.exports = { positiveInteger, productId, normalizeOrderItems };

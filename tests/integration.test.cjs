// Disposable local integration suite. Requires an empty local MySQL-compatible TEST_DATABASE_URL.
const test = require('node:test');
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');
const { randomBytes } = require('node:crypto');
const prisma = new PrismaClient();
const base = process.env.TEST_API_URL || 'http://127.0.0.1:5000/api';
let product, user1, user2;
const call = async (route, token, body, method = 'POST') => {
  const res = await fetch(base + route, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: res.status, body: await res.json() };
};
const order = (quantity, extra = {}) => ({ items: [{ productId: product.id, quantity }], shippingAddress: 'Synthetic integration address', phone: 'synthetic', paymentMethod: 'Cash on Delivery', ...extra });

test('database-backed HTTP regression suite', async t => {
  assert.ok(process.env.DATABASE_URL?.includes('127.0.0.1:33307/electronics_regression'), 'Only disposable regression DB is allowed');
  try {
    const password = randomBytes(24).toString('base64url');
    for (const id of [1, 2]) {
      const email = `tester${id}@example.invalid`;
      const registered = await call('/auth/register', null, { name: 'Synthetic Tester', email, password });
      assert.equal(registered.status, 201);
      const logged = await call('/auth/login', null, { email, password });
      assert.equal(logged.status, 200);
      if (id === 1) user1 = logged.body; else user2 = logged.body;
    }
    const category = await prisma.category.create({ data: { name: 'Synthetic category', slug: 'synthetic' } });
    const brand = await prisma.brand.create({ data: { name: 'Synthetic brand', slug: 'synthetic' } });
    product = await prisma.product.create({ data: { name: 'Synthetic Phone', slug: 'synthetic-phone', description: 'Local regression fixture', price: 50, stock: 5, sku: 'TEST-ONLY', categoryId: category.id, brandId: brand.id } });
    await t.test('real auth and role guards', async () => {
      assert.equal((await call('/cart', null, null, 'GET')).status, 401);
      assert.equal((await call('/cart', 'invalid', null, 'GET')).status, 401);
      assert.equal((await call('/orders', user1.token, null, 'GET')).status, 403);
    });
    await t.test('catalog and detail use real database', async () => {
      assert.equal((await call('/products', null, null, 'GET')).body.products.length, 1);
      assert.equal((await call('/products/' + product.id, null, null, 'GET')).body.product.name, product.name);
    });
    await t.test('cart rejects invalid quantities without writes', async () => {
      for (const quantity of [0, -2, 1.5, '2', 999]) {
        assert.equal((await call('/cart', user1.token, { productId: product.id, quantity })).status, 400);
      }
      assert.equal(await prisma.cartItem.count(), 0);
      assert.equal((await call('/cart', user1.token, { productId: product.id, quantity: 2 })).status, 201);
      for (const quantity of [0, -1, 1.5, '2']) assert.equal((await call('/cart/' + product.id, user1.token, { quantity }, 'PUT')).status, 400);
      assert.equal((await prisma.cartItem.findFirst()).quantity, 2);
    });
    await t.test('invalid orders and duplicate oversell do not write', async () => {
      for (const quantity of [0, -2, 1.5, '2']) assert.equal((await call('/orders', user1.token, order(quantity))).status, 400);
      const duplicate = order(4, { items: [{ productId: product.id, quantity: 4 }, { productId: product.id, quantity: 4 }] });
      assert.equal((await call('/orders', user1.token, duplicate)).status, 400);
      assert.equal(await prisma.order.count(), 0);
      assert.equal((await prisma.product.findUnique({ where: { id: product.id } })).stock, 5);
    });
    await t.test('failure after order insert rolls back order, stock and cart', async () => {
      await prisma.$executeRawUnsafe("CREATE TRIGGER regression_fail_cleanup BEFORE DELETE ON cart_items FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'synthetic rollback test'");
      try { assert.equal((await call('/orders', user1.token, order(2))).status, 500); }
      finally { await prisma.$executeRawUnsafe('DROP TRIGGER regression_fail_cleanup'); }
      assert.equal(await prisma.order.count(), 0);
      assert.equal((await prisma.product.findUnique({ where: { id: product.id } })).stock, 5);
      assert.equal((await prisma.cartItem.findFirst()).quantity, 2);
    });
    await t.test('concurrent purchases cannot overdraw stock', async () => {
      const attempts = await Promise.all([call('/orders', user1.token, order(4)), call('/orders', user2.token, order(4))]);
      assert.deepEqual(attempts.map(x => x.status).sort(), [201, 400]);
      assert.equal((await prisma.product.findUnique({ where: { id: product.id } })).stock, 1);
      assert.equal(await prisma.order.count(), 1);
    });
    await t.test('normal order combines duplicates, computes totals and clears only owner cart', async () => {
      await prisma.product.update({ where: { id: product.id }, data: { stock: 5 } });
      await prisma.cartItem.deleteMany();
      await prisma.cartItem.createMany({ data: [{ userId: user1.user.id, productId: product.id, quantity: 2 }, { userId: user2.user.id, productId: product.id, quantity: 1 }] });
      const result = await call('/orders', user1.token, order(1, { items: [{ productId: product.id, quantity: 1 }, { productId: product.id, quantity: 1 }] }));
      assert.equal(result.status, 201);
      assert.equal(result.body.order.items.length, 1);
      assert.equal(result.body.order.items[0].quantity, 2);
      assert.equal(Number(result.body.order.totalPrice), 120);
      assert.equal((await prisma.product.findUnique({ where: { id: product.id } })).stock, 3);
      assert.equal(await prisma.cartItem.count({ where: { userId: user1.user.id } }), 0);
      assert.equal(await prisma.cartItem.count({ where: { userId: user2.user.id } }), 1);
      assert.equal((await call('/orders/' + result.body.order.id, user2.token, null, 'GET')).status, 403);
    });
  } finally { await prisma.$disconnect(); }
});

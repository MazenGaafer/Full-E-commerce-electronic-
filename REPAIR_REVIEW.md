# Cart/order repair review

Prepared 23 November 2026 from commit `e13474102441a5ddbeeeb5a3152c01c718b0ccd1`.

## Changes

- Import the missing `Package` icon so an empty catalog renders instead of crashing.
- Stack the mobile product search input above its buttons.
- Match Vite's default API proxy to the Express default port, 5000.
- Reject zero, negative, fractional, string and unsafe quantities on cart/order writes.
- Validate product IDs instead of silently truncating them.
- Combine duplicate order lines before checking stock.
- Atomically reserve stock with a conditional update. Create the order and clear the owner's cart in the same Prisma transaction. Any failure rolls back these writes.
- Return validation errors as 400 without exposing internal database error details to the client.

## Verified locally

- `npm test`: 3 validation unit tests passed.
- `npm run test:integration`: 7 database-backed HTTP subtests passed, using Express, Prisma 5.22 and a disposable MariaDB 10.6.23 database. This is a MySQL-compatible engine, not certification against a specific Oracle MySQL release.
- Real registration/login, catalog/detail reads, cart writes, invalid quantities, duplicate-line rejection, cross-user order denial and owner-only cart cleanup were checked.
- Two simultaneous purchases of four units against five available units produced one successful order and one rejection, with stock one.
- A temporary database trigger forced cart cleanup to fail after order insertion. The order and stock writes rolled back and the original cart remained. The trigger was removed after the test.
- Browser customer journey with the production-built React UI and the real local API/database: login, add product, cart, checkout with synthetic shipping data and Cash on Delivery, order detail. The stored synthetic order total was 65, stock fell from five to four, and the user's cart was cleared. No real payment or fulfillment occurred.
- Fixture UI regressions passed with no runtime exceptions, including empty catalog. Mobile search inspected at 390px.
- Frontend production build and `git diff --check` passed.

## Running tests safely

`npm ci`, then `npx prisma generate`, then `npm test`.

The integration test is intentionally restricted to a disposable local database whose URL contains `127.0.0.1:33307/electronics_regression`. Do not point it at a real database. Start a local MySQL-compatible server on that port, create an empty `electronics_regression` database, set `DATABASE_URL` and a process-only `JWT_SECRET`, and run `npx prisma migrate deploy`. Start `node backend/server.js` with `PORT=5000`, then run `npm run test:integration` with the same database URL. The test database user needs trigger privileges for the rollback test. Recreate the disposable database before rerunning, since fixtures use fixed synthetic names. Do not commit passwords or environment files.

## Not claimed

This is a focused repair, not a full security or production-readiness audit. Admin UI journeys, refunds/cancellations, payment provider integration, other concurrent workflow combinations and exact Oracle MySQL behavior were not verified. Existing dependency audit warnings remain: the root production dependency audit reported seven advisories, including one critical, and frontend install reported additional warnings. Review and test dependency upgrades separately before deployment. No package upgrades were included in this repair.

No hosting deployment or main-branch overwrite is part of this review.

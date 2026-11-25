# Security Specification & Threat Model — Dar Souss & Drâa

## 1. Data Invariants
1. **No PII in Public Tracking**: `order_tracking/{trackingKey}` must never store `customerName`, `phone`, `email`, or `address`.
2. **No Global Order Enumeration**: `allow list` on `orders`, `orders/{orderId}/items`, `order_tracking`, and `newsletter` is strictly forbidden for non-admin callers.
3. **Atomic Order Creation**: An `orders/{orderId}` document cannot be created without an accompanying `order_tracking/{trackingKey}` document in the same batch (`existsAfter`), and an `OrderItem` cannot be created without its parent `Order` (`existsAfter`).
4. **Immutable Order Lines & Initial Status**: Guests can only create orders with `status == 'pending'`, valid positive prices, and server-verified timestamps (`createdAt == request.time`, `updatedAt == request.time`).
5. **Verified Admin Only**: Admin privileges require `request.auth != null`, `request.auth.token.email_verified == true`, and matching the authorized admin email or an entry in `/admins/{uid}`.

## 2. Adversarial "Dirty Dozen" Payloads (All Must Return PERMISSION_DENIED)
1. **Shadow Field Injection on Order Create**: Payload includes all valid `Order` fields plus `isAdmin: true` or `discountOverride: 100`.
2. **Pre-approved Status Spoof on Guest Order**: Guest attempts `create` on `orders/{id}` with `status: 'delivered'`.
3. **Forged Timestamp on Order Create**: Client sends `createdAt` in the past instead of `request.time`.
4. **Orphan Order Without Tracking Record**: Client writes `orders/{id}` without batch-writing `order_tracking/{trackingKey}`.
5. **Orphan Order Item Without Parent Order**: Client writes `orders/fakeOrder/items/item1` when `orders/fakeOrder` does not exist.
6. **Public Scraping of Customer Orders**: Unauthenticated or non-admin user runs `list` on `/orders` or `/order_tracking`.
7. **PII Leak via Direct `get` on Orders**: Non-admin user calls `getDoc` on `/orders/{knownId}`.
8. **Poisoned Long String ID**: Attacker attempts `create` with a 1500-character document ID or `customerName`.
9. **Negative or Zero Price Manipulation**: Guest creates an `Order` with `totalAmount: -50` or `subtotal: 0`.
10. **Unverified Admin Email Spoof**: User signs in with `email_verified: false` claiming admin email and attempts `update` on `/orders/{id}`.
11. **Guest Status Mutation**: Non-admin attempts `update` on `/order_tracking/{trackingKey}` to change `status` to `'shipped'`.
12. **Product Catalog Tampering**: Non-admin attempts `create`, `update`, or `delete` on `/products/{productId}`.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { formatPrice, Product, ProductVariant } from '../data/products';

export type OrderStatus = 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderCartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface PlaceOrderInput {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  paymentMethod: 'cod' | 'card';
  items: OrderCartItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
}

export interface PlacedOrderResult {
  orderId: string;
  orderNumber: string;
  trackingKey: string;
  phoneLast4: string;
  customerName: string;
  address: string;
  city: string;
  paymentMethod: 'cod' | 'card';
  totalAmount: number;
  itemCount: number;
  whatsappUrl: string;
}

export interface OrderTrackingRecord {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  city: string;
  paymentMethod: 'cod' | 'card';
  itemCount: number;
  totalAmount: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface AdminOrderRecord {
  orderId: string;
  orderNumber: string;
  trackingKey: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  paymentMethod: 'cod' | 'card';
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  itemCount: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface OrderItemRecord {
  orderId: string;
  productId: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

const STORE_WHATSAPP_NUMBER = '212528850000';

export function extractLast4Digits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '0000';
  return digits.slice(-4);
}

export function buildWhatsappConfirmationUrl(params: {
  orderNumber: string;
  customerName: string;
  city: string;
  address: string;
  paymentMethod: 'cod' | 'card';
  totalAmount: number;
  items: OrderCartItem[];
}): string {
  const itemLines = params.items
    .map(
      (i) =>
        `- ${i.quantity}x ${i.product.name} (${i.variant.label}) : ${formatPrice(
          i.variant.price * i.quantity
        )}`
    )
    .join('\n');

  const paymentLabel =
    params.paymentMethod === 'cod' ? 'Paiement à la livraison' : 'Carte bancaire';

  const message = [
    `Bonjour Dar Souss & Drâa, je souhaite confirmer ma commande ${params.orderNumber}.`,
    '',
    `Client : ${params.customerName}`,
    `Livraison : ${params.address}, ${params.city}`,
    `Règlement : ${paymentLabel}`,
    '',
    'Articles :',
    itemLines,
    '',
    `Total TTC : ${formatPrice(params.totalAmount)}`,
  ].join('\n');

  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export async function placeGuestOrder(
  input: PlaceOrderInput
): Promise<PlacedOrderResult> {
  const cleanName = input.customerName.trim().slice(0, 100);
  const cleanPhone = input.phone.trim().slice(0, 24);
  const cleanEmail = input.email.trim().slice(0, 120);
  const cleanAddress = input.address.trim().slice(0, 200);
  const cleanCity = input.city.trim().slice(0, 100);

  const phoneLast4 = extractLast4Digits(cleanPhone);
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `DSD-${randomDigits}`;
  const trackingKey = `${orderNumber}_${phoneLast4}`;
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const itemCount = input.items.reduce((sum, item) => sum + item.quantity, 0);
  const now = serverTimestamp();

  const batch = writeBatch(db);
  const orderRef = doc(db, 'orders', orderId);
  const trackingRef = doc(db, 'order_tracking', trackingKey);

  batch.set(orderRef, {
    orderId,
    orderNumber,
    trackingKey,
    customerName: cleanName,
    phone: cleanPhone,
    email: cleanEmail,
    address: cleanAddress,
    city: cleanCity,
    paymentMethod: input.paymentMethod,
    status: 'pending',
    subtotal: Number(input.subtotal.toFixed(2)),
    shippingCost: Number(input.shippingCost.toFixed(2)),
    totalAmount: Number(input.totalAmount.toFixed(2)),
    itemCount,
    createdAt: now,
    updatedAt: now,
  });

  batch.set(trackingRef, {
    orderId,
    orderNumber,
    status: 'pending',
    city: cleanCity,
    paymentMethod: input.paymentMethod,
    itemCount,
    totalAmount: Number(input.totalAmount.toFixed(2)),
    createdAt: now,
    updatedAt: now,
  });

  input.items.forEach((item, index) => {
    const itemId = `item_${index + 1}_${item.variant.id}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
    const itemRef = doc(db, 'orders', orderId, 'items', itemId);
    batch.set(itemRef, {
      orderId,
      productId: item.product.id.slice(0, 80),
      productName: item.product.name.slice(0, 140),
      variantId: item.variant.id.slice(0, 64),
      variantLabel: item.variant.label.slice(0, 60),
      unitPrice: Number(item.variant.price.toFixed(2)),
      quantity: item.quantity,
      lineTotal: Number((item.variant.price * item.quantity).toFixed(2)),
      createdAt: now,
    });
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `orders/${orderId}`);
  }

  return {
    orderId,
    orderNumber,
    trackingKey,
    phoneLast4,
    customerName: cleanName,
    address: cleanAddress,
    city: cleanCity,
    paymentMethod: input.paymentMethod,
    totalAmount: input.totalAmount,
    itemCount,
    whatsappUrl: buildWhatsappConfirmationUrl({
      orderNumber,
      customerName: cleanName,
      city: cleanCity,
      address: cleanAddress,
      paymentMethod: input.paymentMethod,
      totalAmount: input.totalAmount,
      items: input.items,
    }),
  };
}

export async function lookupOrderTracking(
  rawOrderNumber: string,
  rawPhoneLast4: string
): Promise<OrderTrackingRecord | null> {
  const normalizedRef = rawOrderNumber.trim().toUpperCase();
  const normalizedDigits = rawPhoneLast4.replace(/\D/g, '').slice(-4);

  if (!/^DSD-[0-9]{4}$/.test(normalizedRef) || !/^[0-9]{4}$/.test(normalizedDigits)) {
    return null;
  }

  const trackingKey = `${normalizedRef}_${normalizedDigits}`;
  const path = `order_tracking/${trackingKey}`;

  try {
    const snap = await getDoc(doc(db, 'order_tracking', trackingKey));
    if (!snap.exists()) {
      return null;
    }
    return snap.data() as OrderTrackingRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeAdminOrders(
  onOrders: (orders: AdminOrderRecord[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const path = 'orders';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((d) => d.data() as AdminOrderRecord);
      onOrders(orders);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function fetchOrderItems(orderId: string): Promise<OrderItemRecord[]> {
  const path = `orders/${orderId}/items`;
  try {
    const snap = await getDocs(collection(db, 'orders', orderId, 'items'));
    return snap.docs.map((d) => d.data() as OrderItemRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateOrderStatus(
  orderId: string,
  trackingKey: string,
  status: OrderStatus
): Promise<void> {
  const batch = writeBatch(db);
  const now = serverTimestamp();

  batch.update(doc(db, 'orders', orderId), {
    status,
    updatedAt: now,
  });

  batch.update(doc(db, 'order_tracking', trackingKey), {
    status,
    updatedAt: now,
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
}

export async function subscribeNewsletter(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase().slice(0, 120);
  const subscriberId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const path = `newsletter/${subscriberId}`;

  try {
    await setDoc(doc(db, 'newsletter', subscriberId), {
      email: cleanEmail,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

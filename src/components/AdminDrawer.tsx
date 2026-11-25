import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { ChevronDown, ChevronUp, Loader2, LogIn, LogOut, ShieldCheck, X } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { formatPrice } from '../data/products';
import {
  AdminOrderRecord,
  fetchOrderItems,
  OrderItemRecord,
  OrderStatus,
  subscribeAdminOrders,
  updateOrderStatus,
} from '../services/orderService';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ADMIN_EMAIL = 'abderrahmane.oubrou@gmail.com';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'preparing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
];

export function AdminDrawer({ isOpen, onClose }: AdminDrawerProps) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItemRecord[]>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isAuthorizedAdmin =
    Boolean(user?.emailVerified) && user?.email?.toLowerCase() === ADMIN_EMAIL;

  useEffect(() => {
    if (!isOpen || !authReady || !isAuthorizedAdmin) {
      return;
    }

    setLoadingOrders(true);
    setError('');

    const unsub = subscribeAdminOrders(
      (list) => {
        setOrders(list);
        setLoadingOrders(false);
      },
      (err) => {
        setError(err.message);
        setLoadingOrders(false);
      }
    );

    return () => unsub();
  }, [isOpen, authReady, isAuthorizedAdmin]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      setError('Connexion Google annulée ou bloquée par le navigateur.');
    }
  };

  const handleToggleExpand = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);
    if (!itemsByOrder[orderId]) {
      try {
        const loaded = await fetchOrderItems(orderId);
        setItemsByOrder((prev) => ({ ...prev, [orderId]: loaded }));
      } catch {
        setError("Impossible de charger les articles de la commande.");
      }
    }
  };

  const handleStatusChange = async (
    order: AdminOrderRecord,
    nextStatus: OrderStatus
  ) => {
    setUpdatingOrderId(order.orderId);
    setError('');
    try {
      await updateOrderStatus(order.orderId, order.trackingKey, nextStatus);
    } catch {
      setError('Mise à jour refusée ou échouée.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#171C18]/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Gestion des commandes"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-[#FAF9F6] h-full flex flex-col border-l border-[#E4E2DA] shadow-2xl">
        <div className="px-6 py-5 border-b border-[#E4E2DA] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#2D4732]" />
            <h2 className="font-display text-xl font-medium text-[#171C18]">
              Gestion des commandes
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                type="button"
                onClick={() => void signOut(auth)}
                className="px-3 py-1.5 text-xs font-medium text-[#545A55] hover:text-[#171C18] hover:bg-[#F1F0EB] rounded-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer l'espace gestion"
              className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-[#F1F0EB] text-[#171C18] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!user ? (
            <div className="max-w-sm mx-auto text-center py-12">
              <p className="font-display text-xl text-[#171C18]">
                Accès réservé à l&apos;atelier
              </p>
              <p className="mt-2 text-sm text-[#545A55]">
                Connectez-vous avec le compte administrateur autorisé pour consulter les commandes clients et mettre à jour les livraisons.
              </p>
              <button
                type="button"
                onClick={handleSignIn}
                className="mt-6 px-5 py-3 min-h-[44px] inline-flex items-center gap-2 text-sm font-medium bg-[#2D4732] text-[#FAF9F6] rounded-md hover:bg-[#223726] transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Se connecter avec Google</span>
              </button>
            </div>
          ) : !isAuthorizedAdmin ? (
            <div className="max-w-md mx-auto text-center py-12">
              <p className="font-display text-xl text-[#171C18]">
                Compte non autorisé
              </p>
              <p className="mt-2 text-sm text-[#545A55]">
                Connecté en tant que {user.email}. Seul le compte administrateur de la boutique peut consulter les dossiers clients.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="p-3 text-xs text-[#7F1D1D] bg-[#FEF2F2] border border-[#FECACA] rounded-md">
                  {error}
                </div>
              )}

              {loadingOrders ? (
                <div className="py-12 flex items-center justify-center gap-2 text-sm text-[#5C615D]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Chargement des commandes...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center bg-[#F1F0EB] rounded-lg p-6">
                  <p className="font-display text-lg text-[#171C18]">
                    Aucune commande enregistrée pour le moment
                  </p>
                  <p className="mt-1 text-sm text-[#5C615D]">
                    Les nouvelles commandes passées depuis le panier apparaîtront ici en temps réel.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {orders.map((order) => {
                    const isExpanded = expandedOrderId === order.orderId;
                    const lineItems = itemsByOrder[order.orderId] || [];

                    return (
                      <li
                        key={order.orderId}
                        className="bg-white border border-[#E4E2DA] rounded-lg p-4 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#171C18] tabular-nums">
                              <span>{order.orderNumber}</span>
                              <span aria-hidden="true" className="text-[#737874]">
                                ·
                              </span>
                              <span>{order.customerName}</span>
                            </div>
                            <p className="text-xs text-[#5C615D] mt-0.5">
                              {order.city} · {order.phone} ·{' '}
                              {order.paymentMethod === 'cod' ? 'À la livraison' : 'Carte'}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-[#171C18] tabular-nums">
                              {formatPrice(order.totalAmount)}
                            </span>

                            <select
                              value={order.status}
                              disabled={updatingOrderId === order.orderId}
                              onChange={(e) =>
                                void handleStatusChange(order, e.target.value as OrderStatus)
                              }
                              aria-label={`Statut de la commande ${order.orderNumber}`}
                              className="h-9 px-2.5 text-xs font-medium bg-[#FAF9F6] border border-[#D8D5CB] rounded-md text-[#171C18] focus:outline-none focus:border-[#2D4732] cursor-pointer"
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => void handleToggleExpand(order.orderId)}
                              aria-label="Afficher le détail de la commande"
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F1F0EB] text-[#545A55] cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="pt-3 border-t border-[#ECEAE2] text-xs space-y-2">
                            <p className="text-[#545A55]">
                              <span className="font-medium text-[#171C18]">Adresse :</span>{' '}
                              {order.address}, {order.city} ({order.email})
                            </p>
                            <p className="text-[#545A55] tabular-nums">
                              <span className="font-medium text-[#171C18]">Clé de suivi :</span>{' '}
                              {order.trackingKey}
                            </p>
                            {lineItems.length > 0 && (
                              <ul className="pt-1 space-y-1 text-[#454B46]">
                                {lineItems.map((item, idx) => (
                                  <li
                                    key={`${order.orderId}_${idx}`}
                                    className="flex items-center justify-between tabular-nums"
                                  >
                                    <span>
                                      {item.quantity}x {item.productName} ({item.variantLabel})
                                    </span>
                                    <span>{formatPrice(item.lineTotal)}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

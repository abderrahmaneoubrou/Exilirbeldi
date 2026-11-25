import { FormEvent, useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Minus,
  PackageSearch,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { formatPrice, Product, ProductVariant } from '../data/products';
import { ResilientImage } from './ResilientImage';
import { PlacedOrderResult, placeGuestOrder } from '../services/orderService';

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (variantId: string, delta: number) => void;
  onRemoveItem: (variantId: string) => void;
  onClearCart: () => void;
  onTrackOrder: (orderNumber: string, phoneLast4: string) => void;
}

type DrawerStep = 'cart' | 'checkout' | 'confirmed';

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 35;

export function CartDrawer({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onTrackOrder,
}: CartDrawerProps) {
  const [step, setStep] = useState<DrawerStep>('cart');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<PlacedOrderResult | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && items.length === 0 && step === 'checkout') {
      setStep('cart');
    }
  }, [isOpen, items.length, step]);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const qualifiesFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = items.length === 0 || qualifiesFreeShipping ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingCost;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleCheckoutSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const digitsOnly = phone.replace(/\D/g, '');
    if (
      fullName.trim().length < 2 ||
      digitsOnly.length < 8 ||
      !email.trim().includes('@') ||
      address.trim().length < 4 ||
      city.trim().length < 2
    ) {
      setError(
        'Merci de vérifier vos coordonnées (nom, téléphone valide, email, adresse et ville).'
      );
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const result = await placeGuestOrder({
        customerName: fullName,
        phone,
        email,
        address,
        city,
        paymentMethod,
        items,
        subtotal,
        shippingCost,
        totalAmount: total,
      });

      setConfirmedOrder(result);
      onClearCart();
      setStep('confirmed');
    } catch {
      setError(
        "L'enregistrement de la commande a échoué. Vérifiez votre connexion et réessayez."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAndReset = () => {
    if (step === 'confirmed') {
      setStep('cart');
      setConfirmedOrder(null);
      setFullName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCity('');
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#171C18]/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Panier de commande"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseAndReset();
      }}
    >
      <div className="w-full max-w-md bg-[#FAF9F6] h-full flex flex-col border-l border-[#E4E2DA] shadow-2xl">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#E4E2DA] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('cart')}
                aria-label="Retour au panier"
                className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-[#F1F0EB] text-[#171C18] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="font-display text-xl font-medium text-[#171C18]">
              {step === 'cart' && 'Votre panier'}
              {step === 'checkout' && 'Livraison & règlement'}
              {step === 'confirmed' && 'Commande enregistrée'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleCloseAndReset}
            aria-label="Fermer le panier"
            className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-[#F1F0EB] text-[#171C18] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Cart Items */}
        {step === 'cart' && (
          <>
            {items.length > 0 && (
              <div className="px-6 py-3.5 bg-[#F1F0EB] border-b border-[#E4E2DA]">
                <p className="text-xs text-[#454B46] tabular-nums">
                  {qualifiesFreeShipping
                    ? 'Vous bénéficiez de la livraison offerte partout au Maroc.'
                    : `Plus que ${formatPrice(remainingForFreeShipping)} pour profiter de la livraison offerte.`}
                </p>
                <div className="mt-2 h-1 w-full bg-[#DFDDD4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2D4732] transition-all duration-200"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <p className="font-display text-lg text-[#171C18]">
                    Votre panier est encore vide
                  </p>
                  <p className="mt-2 text-sm text-[#5C615D] max-w-xs">
                    Parcourez nos récoltes du Souss-Massa et du Drâa-Tafilalet pour composer votre colis.
                  </p>
                  <button
                    type="button"
                    onClick={handleCloseAndReset}
                    className="mt-6 px-5 py-2.5 min-h-[42px] text-sm font-medium bg-[#2D4732] text-[#FAF9F6] rounded-md hover:bg-[#223726] transition-colors cursor-pointer"
                  >
                    Découvrir la récolte
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-[#E4E2DA]">
                  {items.map(({ product, variant, quantity }) => (
                    <li key={variant.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                      <div className="w-20 h-20 rounded-md overflow-hidden bg-[#F1F0EB] shrink-0">
                        <ResilientImage
                          src={product.image}
                          alt={product.name}
                          fallbackTitle={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-medium text-[#171C18] leading-snug">
                            {product.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(variant.id)}
                            aria-label={`Retirer ${product.name}`}
                            className="p-1 text-[#737874] hover:text-[#171C18] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="mt-0.5 text-xs text-[#5C615D]">{variant.label}</p>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="inline-flex items-center border border-[#D8D5CB] rounded-md bg-white">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(variant.id, -1)}
                              aria-label="Diminuer la quantité"
                              className="w-8 h-8 flex items-center justify-center text-[#171C18] hover:bg-[#F1F0EB] cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-medium tabular-nums">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(variant.id, 1)}
                              aria-label="Augmenter la quantité"
                              className="w-8 h-8 flex items-center justify-center text-[#171C18] hover:bg-[#F1F0EB] cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-sm font-medium text-[#171C18] tabular-nums">
                            {formatPrice(variant.price * quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-[#E4E2DA] bg-[#F6F5F0] space-y-3">
                <div className="flex items-center justify-between text-sm text-[#545A55]">
                  <span>Sous-total ({totalItems} articles)</span>
                  <span className="tabular-nums text-[#171C18]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-[#545A55]">
                  <span>Livraison protégée Maroc</span>
                  <span className="tabular-nums text-[#171C18]">
                    {shippingCost === 0 ? 'Offerte' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="pt-3 border-t border-[#E4E2DA] flex items-center justify-between text-base font-medium text-[#171C18]">
                  <span>Total TTC</span>
                  <span className="tabular-nums">{formatPrice(total)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="w-full min-h-[44px] mt-2 px-5 py-3 text-sm font-medium text-[#FAF9F6] bg-[#2D4732] hover:bg-[#223726] rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732]"
                >
                  Finaliser la commande
                </button>
              </div>
            )}
          </>
        )}

        {/* Step 2: Guest Checkout Form (COD Default) */}
        {step === 'checkout' && (
          <form onSubmit={handleCheckoutSubmit} className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-1 px-6 py-5 space-y-4">
              {error && (
                <div className="p-3 text-xs text-[#7F1D1D] bg-[#FEF2F2] border border-[#FECACA] rounded-md">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="checkout-name"
                  className="block text-xs font-medium text-[#454B46] mb-1.5"
                >
                  Nom complet
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  maxLength={100}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nadia Benali"
                  className="w-full h-11 px-3.5 text-sm bg-white border border-[#D8D5CB] rounded-md text-[#171C18] focus:outline-none focus:border-[#2D4732]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="checkout-phone"
                    className="block text-xs font-medium text-[#454B46] mb-1.5"
                  >
                    Téléphone (pour suivi &amp; livreur)
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    maxLength={24}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 61 24 56 78"
                    className="w-full h-11 px-3.5 text-sm bg-white border border-[#D8D5CB] rounded-md text-[#171C18] focus:outline-none focus:border-[#2D4732]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="checkout-email"
                    className="block text-xs font-medium text-[#454B46] mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    maxLength={120}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nadia@exemple.ma"
                    className="w-full h-11 px-3.5 text-sm bg-white border border-[#D8D5CB] rounded-md text-[#171C18] focus:outline-none focus:border-[#2D4732]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="checkout-address"
                  className="block text-xs font-medium text-[#454B46] mb-1.5"
                >
                  Adresse de livraison
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  required
                  maxLength={200}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="24 avenue Hassan II, Quartier Talborjt"
                  className="w-full h-11 px-3.5 text-sm bg-white border border-[#D8D5CB] rounded-md text-[#171C18] focus:outline-none focus:border-[#2D4732]"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-city"
                  className="block text-xs font-medium text-[#454B46] mb-1.5"
                >
                  Ville
                </label>
                <input
                  id="checkout-city"
                  type="text"
                  required
                  maxLength={100}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Agadir"
                  className="w-full h-11 px-3.5 text-sm bg-white border border-[#D8D5CB] rounded-md text-[#171C18] focus:outline-none focus:border-[#2D4732]"
                />
              </div>

              <div className="pt-2">
                <span className="block text-xs font-medium text-[#454B46] mb-2">
                  Mode de règlement
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 text-left text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-[#2D4732] bg-[#2D4732]/5 text-[#171C18]'
                        : 'border-[#D8D5CB] bg-white text-[#545A55]'
                    }`}
                  >
                    Paiement à la livraison
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 text-left text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-[#2D4732] bg-[#2D4732]/5 text-[#171C18]'
                        : 'border-[#D8D5CB] bg-white text-[#545A55]'
                    }`}
                  >
                    Carte bancaire
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-[#E4E2DA] bg-[#F6F5F0] space-y-3">
              <div className="flex items-center justify-between text-base font-medium text-[#171C18]">
                <span>Total à régler</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[44px] px-5 py-3 inline-flex items-center justify-center gap-2 text-sm font-medium text-[#FAF9F6] bg-[#2D4732] hover:bg-[#223726] rounded-md transition-colors cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enregistrement en cours...</span>
                  </>
                ) : (
                  <span>Valider la commande</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Persisted Confirmation Receipt + WhatsApp & Tracking */}
        {step === 'confirmed' && confirmedOrder && (
          <div className="flex-1 px-6 py-7 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="w-11 h-11 rounded-full bg-[#2D4732]/10 text-[#2D4732] flex items-center justify-center mb-5">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <p className="text-xs font-medium text-[#2D4732] tabular-nums">
                Commande #{confirmedOrder.orderNumber} enregistrée — En attente de confirmation
              </p>

              <h3 className="mt-2 font-display text-2xl font-medium text-[#171C18]">
                Merci, {confirmedOrder.customerName}
              </h3>

              <p className="mt-3 text-sm text-[#545A55] leading-relaxed">
                Votre commande est sauvegardée. Confirmez-la directement sur WhatsApp avec notre atelier ou suivez son avancement avec votre référence et les 4 derniers chiffres de votre téléphone (<span className="font-semibold text-[#171C18] tabular-nums">{confirmedOrder.phoneLast4}</span>).
              </p>

              <div className="mt-6 p-4 bg-[#F1F0EB] border border-[#E4E2DA] rounded-lg space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#5C615D]">Référence</span>
                  <span className="font-semibold text-[#171C18] tabular-nums">
                    {confirmedOrder.orderNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#5C615D]">Code suivi tél.</span>
                  <span className="font-medium text-[#171C18] tabular-nums">
                    {confirmedOrder.phoneLast4}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#5C615D]">Règlement</span>
                  <span className="font-medium text-[#171C18]">
                    {confirmedOrder.paymentMethod === 'cod'
                      ? 'Paiement à la livraison'
                      : 'Carte bancaire'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[#5C615D] shrink-0">Livraison</span>
                  <span className="font-medium text-[#171C18] text-right">
                    {confirmedOrder.address}, {confirmedOrder.city}
                  </span>
                </div>
                <div className="pt-2.5 border-t border-[#DFDDD4] flex items-center justify-between">
                  <span className="font-medium text-[#171C18]">Total TTC</span>
                  <span className="font-semibold text-[#171C18] tabular-nums">
                    {formatPrice(confirmedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              <a
                href={confirmedOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] px-5 py-3 inline-flex items-center justify-center gap-2 text-sm font-medium text-[#FAF9F6] bg-[#2D4732] hover:bg-[#223726] rounded-md transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirmer sur WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const ref = confirmedOrder.orderNumber;
                  const last4 = confirmedOrder.phoneLast4;
                  handleCloseAndReset();
                  onTrackOrder(ref, last4);
                }}
                className="w-full min-h-[44px] px-5 py-3 inline-flex items-center justify-center gap-2 text-sm font-medium text-[#171C18] bg-[#F1F0EB] hover:bg-[#E7E4DC] border border-[#D8D5CB] rounded-md transition-colors cursor-pointer"
              >
                <PackageSearch className="w-4 h-4" />
                <span>Suivre cette commande</span>
              </button>

              <button
                type="button"
                onClick={handleCloseAndReset}
                className="w-full py-2.5 text-xs font-medium text-[#5C615D] hover:text-[#171C18] transition-colors cursor-pointer"
              >
                Retour à la boutique
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

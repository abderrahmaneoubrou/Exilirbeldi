import { FormEvent, useEffect, useState } from 'react';
import { Check, Loader2, PackageSearch, Truck, X } from 'lucide-react';
import { formatPrice } from '../data/products';
import {
  lookupOrderTracking,
  OrderStatus,
  OrderTrackingRecord,
} from '../services/orderService';

interface OrderTrackingModalProps {
  isOpen: boolean;
  initialOrderNumber?: string;
  initialPhoneLast4?: string;
  onClose: () => void;
}

const TRACKING_STEPS: { key: OrderStatus; label: string; description: string }[] = [
  {
    key: 'pending',
    label: 'En attente de confirmation',
    description: 'Commande enregistrée, en cours de vérification par l’atelier.',
  },
  {
    key: 'preparing',
    label: 'En préparation',
    description: 'Sélection des lots et calage sécurisé de vos flacons.',
  },
  {
    key: 'shipped',
    label: 'Expédiée',
    description: 'Colis confié au transporteur vers votre ville de livraison.',
  },
  {
    key: 'delivered',
    label: 'Livrée',
    description: 'Commande remise au destinataire.',
  },
];

export function OrderTrackingModal({
  isOpen,
  initialOrderNumber = '',
  initialPhoneLast4 = '',
  onClose,
}: OrderTrackingModalProps) {
  const [orderRef, setOrderRef] = useState(initialOrderNumber);
  const [phoneLast4, setPhoneLast4] = useState(initialPhoneLast4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [record, setRecord] = useState<OrderTrackingRecord | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialOrderNumber) setOrderRef(initialOrderNumber);
      if (initialPhoneLast4) setPhoneLast4(initialPhoneLast4);
      setError('');
    }
  }, [isOpen, initialOrderNumber, initialPhoneLast4]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanRef = orderRef.trim().toUpperCase();
    const cleanDigits = phoneLast4.replace(/\D/g, '').slice(-4);

    if (!/^DSD-[0-9]{4}$/.test(cleanRef)) {
      setError('Format attendu pour la référence : DSD-1234');
      return;
    }
    if (!/^[0-9]{4}$/.test(cleanDigits)) {
      setError('Veuillez saisir les 4 derniers chiffres de votre numéro de téléphone.');
      return;
    }

    setError('');
    setLoading(true);
    setSearched(false);

    try {
      const result = await lookupOrderTracking(cleanRef, cleanDigits);
      setRecord(result);
      setSearched(true);
    } catch {
      setError('Impossible de consulter le suivi pour le moment. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = record
    ? TRACKING_STEPS.findIndex((s) => s.key === record.status)
    : -1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#171C18]/50 backdrop-blur-[2px] p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tracking-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#FAF9F6] border border-[#E4E2DA] rounded-xl shadow-2xl p-6 sm:p-8 my-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le suivi de commande"
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-md hover:bg-[#F1F0EB] text-[#171C18] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-xs font-medium text-[#5C615D]">
          <PackageSearch className="w-4 h-4 text-[#2D4732]" />
          <span>Suivi invité sans compte</span>
        </div>

        <h2
          id="tracking-modal-title"
          className="mt-2 font-display text-2xl font-medium text-[#171C18]"
        >
          Suivre votre commande
        </h2>
        <p className="mt-2 text-sm text-[#545A55]">
          Indiquez la référence reçue lors de la validation (ex. DSD-2048) et les 4 derniers chiffres du téléphone renseigné.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="track-ref"
                className="block text-xs font-medium text-[#454B46] mb-1.5"
              >
                Référence commande
              </label>
              <input
                id="track-ref"
                type="text"
                required
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value.toUpperCase())}
                placeholder="DSD-2048"
                className="w-full h-11 px-3.5 text-sm bg-white border border-[#D8D5CB] rounded-md text-[#171C18] tabular-nums focus:outline-none focus:border-[#2D4732]"
              />
            </div>

            <div>
              <label
                htmlFor="track-digits"
                className="block text-xs font-medium text-[#454B46] mb-1.5"
              >
                4 derniers chiffres (tél.)
              </label>
              <input
                id="track-digits"
                type="text"
                inputMode="numeric"
                maxLength={4}
                required
                value={phoneLast4}
                onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="5678"
                className="w-full h-11 px-3.5 text-sm bg-white border border-[#D8D5CB] rounded-md text-[#171C18] tabular-nums focus:outline-none focus:border-[#2D4732]"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-[#7F1D1D] bg-[#FEF2F2] border border-[#FECACA] rounded-md p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] px-5 py-2.5 inline-flex items-center justify-center gap-2 text-sm font-medium bg-[#2D4732] hover:bg-[#223726] text-[#FAF9F6] rounded-md transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recherche en cours...</span>
              </>
            ) : (
              <span>Consulter l&apos;état du colis</span>
            )}
          </button>
        </form>

        {/* Empty / Not found result */}
        {searched && !record && !loading && (
          <div className="mt-6 p-4 bg-[#F1F0EB] border border-[#E4E2DA] rounded-lg text-sm text-[#545A55]">
            Aucune commande trouvée pour cette combinaison référence / téléphone. Vérifiez les chiffres saisis.
          </div>
        )}

        {/* Active Tracking Result */}
        {record && (
          <div className="mt-6 pt-6 border-t border-[#E4E2DA] space-y-5">
            <div className="p-4 bg-[#F1F0EB] border border-[#DFDDD4] rounded-lg space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#5C615D]">Référence</span>
                <span className="font-semibold text-[#171C18] tabular-nums">
                  {record.orderNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5C615D]">Destination</span>
                <span className="font-medium text-[#171C18]">{record.city}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5C615D]">Contenu &amp; règlement</span>
                <span className="font-medium text-[#171C18] tabular-nums">
                  {record.itemCount} article{record.itemCount > 1 ? 's' : ''} ·{' '}
                  {record.paymentMethod === 'cod' ? 'À la livraison' : 'Carte'}
                </span>
              </div>
              <div className="pt-2 border-t border-[#DFDDD4] flex items-center justify-between">
                <span className="font-medium text-[#171C18]">Total TTC</span>
                <span className="font-semibold text-[#171C18] tabular-nums">
                  {formatPrice(record.totalAmount)}
                </span>
              </div>
            </div>

            {record.status === 'cancelled' ? (
              <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-sm text-[#7F1D1D]">
                Cette commande a été annulée. Contactez notre atelier si vous souhaitez la relancer.
              </div>
            ) : (
              <ol className="space-y-3">
                {TRACKING_STEPS.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <li
                      key={step.key}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        isCurrent
                          ? 'bg-[#2D4732]/5 border-[#2D4732]/30'
                          : 'bg-white border-[#E4E2DA]'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isCompleted
                            ? 'bg-[#2D4732] text-[#FAF9F6]'
                            : 'bg-[#ECEAE2] text-[#737874]'
                        }`}
                      >
                        {isCurrent && step.key === 'shipped' ? (
                          <Truck className="w-3.5 h-3.5" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isCompleted ? 'text-[#171C18]' : 'text-[#737874]'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-[#5C615D] mt-0.5">{step.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

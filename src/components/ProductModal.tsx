import { useEffect, useState } from 'react';
import { Check, Minus, Plus, X } from 'lucide-react';
import { formatPrice, Product, ProductVariant } from '../data/products';
import { ResilientImage } from './ResilientImage';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
}

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedVariantId(product.variants[0]?.id ?? '');
      setQuantity(1);
      setJustAdded(false);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];

  const handleAdd = () => {
    if (!activeVariant) return;
    onAddToCart(product, activeVariant, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#171C18]/50 backdrop-blur-[2px] p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-[#FAF9F6] border border-[#E4E2DA] rounded-xl overflow-hidden shadow-2xl my-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fiche produit"
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-md bg-[#FAF9F6]/90 text-[#171C18] hover:bg-[#F1F0EB] border border-[#E4E2DA] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
          {/* Left: Product Stage */}
          <div className="bg-[#F1F0EB] p-6 sm:p-8 flex flex-col justify-between">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#E9E7DF]">
              <ResilientImage
                src={product.image}
                alt={product.name}
                fallbackTitle={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-6 pt-5 border-t border-[#DFDDD4] space-y-2 text-sm text-[#545A55]">
              <div className="flex items-center justify-between gap-4">
                <span>Producteur</span>
                <span className="font-medium text-[#171C18]">{product.producer}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Origine</span>
                <span className="font-medium text-[#171C18]">{product.originCity}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Cahier des charges</span>
                <span className="font-medium text-[#171C18]">{product.harvestLabel}</span>
              </div>
            </div>
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#5C615D]">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span>{product.terroirRegion}</span>
              </div>

              <h2
                id="pdp-title"
                className="mt-2 font-display text-2xl sm:text-[28px] font-medium leading-tight text-[#171C18]"
              >
                {product.name}
              </h2>

              <p className="mt-3 text-xl font-medium text-[#171C18] tabular-nums">
                {formatPrice(activeVariant.price)}
              </p>

              <p className="mt-4 text-[15px] leading-relaxed text-[#454B46]">
                {product.shortNote}
              </p>

              {/* Variant Selector */}
              <div className="mt-6">
                <span className="block text-xs font-medium text-[#5C615D] mb-2">
                  Format disponible
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const isSelected = variant.id === activeVariant.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`px-4 py-2 min-h-[40px] text-sm font-medium rounded-md border transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732] ${
                          isSelected
                            ? 'border-[#2D4732] bg-[#2D4732] text-[#FAF9F6]'
                            : 'border-[#D8D5CB] bg-white text-[#171C18] hover:border-[#2D4732]'
                        }`}
                      >
                        {variant.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity & Primary CTA */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center border border-[#D8D5CB] rounded-md bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Diminuer la quantité"
                    className="w-10 h-11 flex items-center justify-center text-[#171C18] hover:bg-[#F1F0EB] transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Augmenter la quantité"
                    className="w-10 h-11 flex items-center justify-center text-[#171C18] hover:bg-[#F1F0EB] transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 min-w-[200px] min-h-[44px] px-5 py-2.5 inline-flex items-center justify-center gap-2 text-sm font-medium rounded-md bg-[#2D4732] hover:bg-[#223726] text-[#FAF9F6] transition-colors duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732] focus-visible:ring-offset-2"
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Ajouté au panier</span>
                    </>
                  ) : (
                    <span className="tabular-nums">
                      Ajouter · {formatPrice(activeVariant.price * quantity)}
                    </span>
                  )}
                </button>
              </div>

              {/* Tasting & Ingredients */}
              <div className="mt-7 pt-6 border-t border-[#E4E2DA] space-y-4 text-sm">
                <div>
                  <h3 className="font-sans text-xs font-semibold text-[#171C18] mb-1">
                    Notes de dégustation
                  </h3>
                  <p className="text-[#545A55] leading-relaxed">{product.tastingNotes}</p>
                </div>
                <div>
                  <h3 className="font-sans text-xs font-semibold text-[#171C18] mb-1">
                    Accords conseillés
                  </h3>
                  <p className="text-[#545A55] leading-relaxed">{product.pairings}</p>
                </div>
                <div>
                  <h3 className="font-sans text-xs font-semibold text-[#171C18] mb-1">
                    Ingrédients
                  </h3>
                  <p className="text-[#545A55] leading-relaxed">{product.ingredients}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

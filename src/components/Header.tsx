import { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenTracking: () => void;
}

export function Header({ cartCount, onOpenCart, onOpenTracking }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-sm border-b border-[#E4E2DA]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          className="font-display text-xl font-semibold tracking-tight text-[#171C18] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732] rounded-sm"
        >
          Dar Souss &amp; Drâa
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Navigation principale"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#545A55]"
        >
          <a
            href="#recoltes"
            className="hover:text-[#171C18] underline-offset-4 hover:underline transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732] rounded-sm"
          >
            Récoltes
          </a>
          <a
            href="#producteurs"
            className="hover:text-[#171C18] underline-offset-4 hover:underline transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732] rounded-sm"
          >
            Coopératives
          </a>
          <button
            type="button"
            onClick={onOpenTracking}
            className="hover:text-[#171C18] underline-offset-4 hover:underline transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732] rounded-sm"
          >
            Suivi
          </button>
          <a
            href="#contact"
            className="hover:text-[#171C18] underline-offset-4 hover:underline transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732] rounded-sm"
          >
            Contact
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Ouvrir le panier (${cartCount} articles)`}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] text-sm font-medium text-[#FAF9F6] bg-[#2D4732] hover:bg-[#223726] transition-colors duration-150 rounded-md whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F6]"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span className="tabular-nums">Panier · {cartCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 text-[#171C18] hover:bg-[#F1F0EB] rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <nav
          aria-label="Navigation mobile"
          className="md:hidden border-t border-[#E4E2DA] bg-[#FAF9F6] px-4 py-3 flex flex-col gap-1"
        >
          <a
            href="#recoltes"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 px-2 text-sm font-medium text-[#171C18] hover:bg-[#F1F0EB] rounded-md transition-colors"
          >
            Récoltes
          </a>
          <a
            href="#producteurs"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 px-2 text-sm font-medium text-[#171C18] hover:bg-[#F1F0EB] rounded-md transition-colors"
          >
            Coopératives
          </a>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenTracking();
            }}
            className="py-2.5 px-2 text-left text-sm font-medium text-[#171C18] hover:bg-[#F1F0EB] rounded-md transition-colors cursor-pointer"
          >
            Suivi de commande
          </button>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 px-2 text-sm font-medium text-[#171C18] hover:bg-[#F1F0EB] rounded-md transition-colors"
          >
            Contact
          </a>
        </nav>
      )}
    </header>
  );
}

import { FormEvent, useMemo, useState } from 'react';
import { ArrowRight, Check, Search, SlidersHorizontal, X } from 'lucide-react';
import {
  ATELIER_IMAGE,
  CATEGORIES,
  COMMITMENTS,
  formatPrice,
  HERO_IMAGE,
  PRODUCERS,
  Product,
  ProductCategory,
  PRODUCTS,
  ProductVariant,
  REGIONS,
  TerroirRegion,
  TESTIMONIALS,
} from './data/products';
import { Header } from './components/Header';
import { ResilientImage } from './components/ResilientImage';
import { ProductModal } from './components/ProductModal';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AdminDrawer } from './components/AdminDrawer';
import { subscribeNewsletter } from './services/orderService';

type SortOption = 'featured' | 'price-asc' | 'price-desc';

export default function App() {
  const [showBanner, setShowBanner] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('Toutes');
  const [selectedRegion, setSelectedRegion] = useState<TerroirRegion>('Toutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [justAddedProductId, setJustAddedProductId] = useState<string | null>(null);

  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingPrefill, setTrackingPrefill] = useState<{
    orderNumber?: string;
    phoneLast4?: string;
  }>({});
  const [adminOpen, setAdminOpen] = useState(false);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterConfirmed, setNewsletterConfirmed] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  const totalCartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Toutes' || product.category === selectedCategory;
      const matchesRegion =
        selectedRegion === 'Toutes' || product.terroirRegion === selectedRegion;
      const matchesQuery =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.originCity.toLowerCase().includes(q) ||
        product.terroirRegion.toLowerCase().includes(q) ||
        product.producer.toLowerCase().includes(q) ||
        product.shortNote.toLowerCase().includes(q);
      return matchesCategory && matchesRegion && matchesQuery;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.variants[0].price - b.variants[0].price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.variants[0].price - a.variants[0].price);
    }
    return list;
  }, [selectedCategory, selectedRegion, searchQuery, sortBy]);

  const handleAddToCart = (
    product: Product,
    variant: ProductVariant,
    quantity = 1
  ) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.variant.id === variant.id);
      if (existing) {
        return prev.map((item) =>
          item.variant.id === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, variant, quantity }];
    });

    setJustAddedProductId(product.id);
    window.setTimeout(() => {
      setJustAddedProductId((current) => (current === product.id ? null : current));
    }, 1200);
  };

  const handleUpdateQuantity = (variantId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.variant.id === variantId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (variantId: string) => {
    setCartItems((prev) => prev.filter((item) => item.variant.id !== variantId));
  };

  const handleOpenTracking = (orderNumber?: string, phoneLast4?: string) => {
    setTrackingPrefill({ orderNumber, phoneLast4 });
    setTrackingOpen(true);
  };

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setNewsletterError('');
    try {
      await subscribeNewsletter(newsletterEmail);
      setNewsletterConfirmed(true);
      setNewsletterEmail('');
    } catch {
      setNewsletterError("Impossible d'enregistrer votre inscription pour le moment.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#171C18]">
      {/* Slim dismissible top announcement (<= 40px, non-sticky) */}
      {showBanner && (
        <div className="bg-[#2D4732] text-[#FAF9F6] h-9 px-4 flex items-center justify-center relative text-xs">
          <p className="truncate pr-8 tabular-nums">
            Récoltes du Souss-Massa &amp; Drâa-Tafilalet · Paiement à la livraison · Livraison offerte dès 500,00 DH
          </p>
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            aria-label="Fermer l'annonce"
            className="absolute right-3 w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Strictly 3-zone Top Bar */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenTracking={() => handleOpenTracking()}
      />

      <main className="flex-1">
        {/* Section 1: Storefront Hero + Full-Width Commitment Strip */}
        <section className="pt-8 sm:pt-12 pb-12 sm:pb-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-8 lg:gap-12">
              <div className="lg:col-span-5 flex flex-col justify-center py-2">
                <p className="text-xs font-medium text-[#5C615D]">
                  Taroudant · Taliouine · Tiznit · Erfoud · Kelâat M&apos;Gouna
                </p>

                <h1 className="mt-4 font-display text-[clamp(2.25rem,4vw,3.35rem)] font-medium leading-[1.08] tracking-tight text-[#171C18] text-balance">
                  Les trésors du Souss-Massa et du Drâa-Tafilalet, en direct des coopératives.
                </h1>

                <p className="mt-5 text-[15px] sm:text-base leading-relaxed text-[#4E544F] max-w-lg">
                  Huile d&apos;argan culinaire, safran pur de Taliouine, dattes Majhoul d&apos;Erfoud, amlou moulu sur pierre et miel de daghmous récoltés à la main par nos partenaires du Sud marocain.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#recoltes"
                    className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] text-sm font-medium bg-[#2D4732] text-[#FAF9F6] hover:bg-[#223726] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732] focus-visible:ring-offset-2"
                  >
                    <span>Découvrir la récolte</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleOpenTracking()}
                    className="inline-flex items-center px-3 py-2.5 min-h-[44px] text-sm font-medium text-[#171C18] hover:text-[#2D4732] underline underline-offset-4 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Suivre une commande
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="h-full min-h-[280px] sm:min-h-[380px] lg:min-h-[460px] rounded-xl overflow-hidden bg-[#ECEAE2]">
                  <ResilientImage
                    src={HERO_IMAGE}
                    alt="Produits du terroir marocain du Souss-Massa et Drâa-Tafilalet : huile d'argan, safran de Taliouine, dattes Majhoul, amandes et miel d'euphorbe"
                    fallbackTitle="Dar Souss & Drâa — Terroirs du Maroc"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* 4-column full-width commitment strip below hero split */}
            <div
              id="engagements"
              className="mt-12 sm:mt-16 pt-8 pb-2 border-t border-b border-[#E4E2DA] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
            >
              {COMMITMENTS.map((item) => (
                <div key={item.label} className="pb-6">
                  <p className="font-display text-2xl font-medium text-[#171C18] tabular-nums">
                    {item.metric}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#171C18]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#5C615D]">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Featured Terroir Catalog & Regional Filtering */}
        <section id="recoltes" className="py-12 sm:py-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#5C615D]">
                  Souss-Massa &amp; Drâa-Tafilalet
                </p>
                <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-medium text-[#171C18] text-balance">
                  La récolte des oasis et de l&apos;Anti-Atlas
                </h2>
              </div>
              <p className="text-sm text-[#5C615D] tabular-nums">
                {filteredProducts.length}{' '}
                {filteredProducts.length > 1 ? 'références disponibles' : 'référence disponible'}
              </p>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="mt-8 flex flex-col gap-4 pb-6 border-b border-[#E4E2DA]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div
                  role="tablist"
                  aria-label="Filtrer par famille de produits"
                  className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F1F0EB] rounded-lg w-fit"
                >
                  {CATEGORIES.map((category) => {
                    const isActive = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3.5 py-2 min-h-[38px] text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732] ${
                          isActive
                            ? 'bg-white text-[#171C18] shadow-xs'
                            : 'text-[#545A55] hover:text-[#171C18]'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>

                <div
                  role="tablist"
                  aria-label="Filtrer par région du Maroc"
                  className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F1F0EB] rounded-lg w-fit"
                >
                  {REGIONS.map((region) => {
                    const isActive = selectedRegion === region;
                    return (
                      <button
                        key={region}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setSelectedRegion(region)}
                        className={`px-3.5 py-2 min-h-[38px] text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732] ${
                          isActive
                            ? 'bg-[#2D4732] text-[#FAF9F6]'
                            : 'text-[#545A55] hover:text-[#171C18]'
                        }`}
                      >
                        {region === 'Toutes' ? 'Toutes régions' : region}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#737874] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher argan, safran, Majhoul, Taliouine..."
                    aria-label="Rechercher un produit ou une ville d'origine"
                    className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-[#D8D5CB] rounded-md text-[#171C18] placeholder:text-[#7A807B] focus:outline-none focus:border-[#2D4732]"
                  />
                </div>

                <div className="relative flex items-center">
                  <SlidersHorizontal className="w-4 h-4 text-[#737874] absolute left-3 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label="Trier les produits"
                    className="h-10 pl-9 pr-8 text-sm bg-white border border-[#D8D5CB] rounded-md text-[#171C18] focus:outline-none focus:border-[#2D4732] cursor-pointer"
                  >
                    <option value="featured">Ordre de sélection</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-[#F3F2EC] rounded-xl mt-8 px-6">
                <p className="font-display text-xl text-[#171C18]">
                  Aucun produit ne correspond à votre recherche
                </p>
                <p className="mt-2 text-sm text-[#5C615D]">
                  Essayez un autre mot-clé ou réinitialisez les filtres régionaux et de catégorie.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Toutes');
                    setSelectedRegion('Toutes');
                    setSearchQuery('');
                    setSortBy('featured');
                  }}
                  className="mt-5 px-4 py-2.5 min-h-[40px] text-sm font-medium bg-[#2D4732] text-[#FAF9F6] rounded-md hover:bg-[#223726] transition-colors cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => {
                  const baseVariant = product.variants[0];
                  const isAdded = justAddedProductId === product.id;

                  return (
                    <article
                      key={product.id}
                      className="group flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5"
                    >
                      <div>
                        <button
                          type="button"
                          onClick={() => setActiveProduct(product)}
                          className="block w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#F1F0EB] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732]"
                        >
                          <ResilientImage
                            src={product.image}
                            alt={product.name}
                            fallbackTitle={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </button>

                        <div className="mt-4 flex items-center gap-2 text-xs text-[#5C615D]">
                          <span>{product.originCity}</span>
                          <span aria-hidden="true">·</span>
                          <span>{baseVariant.label}</span>
                        </div>

                        <h3 className="mt-1.5 font-sans text-base font-semibold text-[#171C18] leading-snug">
                          <button
                            type="button"
                            onClick={() => setActiveProduct(product)}
                            className="text-left hover:text-[#2D4732] transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
                          >
                            {product.name}
                          </button>
                        </h3>

                        <p className="mt-1.5 text-sm text-[#545A55] leading-relaxed line-clamp-2">
                          {product.shortNote}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[#E4E2DA] flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[15px] font-medium text-[#171C18] tabular-nums">
                            {formatPrice(baseVariant.price)}
                          </span>
                          <span className="block text-[11px] text-[#6B706C]">
                            {product.harvestLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveProduct(product)}
                            className="px-3 py-2 min-h-[40px] text-xs font-medium text-[#171C18] hover:bg-[#F1F0EB] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732]"
                          >
                            Détails
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product, baseVariant, 1)}
                            className={`px-4 py-2 min-h-[40px] text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732] ${
                              isAdded
                                ? 'bg-[#171C18] text-[#FAF9F6]'
                                : 'bg-[#2D4732] text-[#FAF9F6] hover:bg-[#223726]'
                            }`}
                          >
                            {isAdded ? (
                              <span className="inline-flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                Ajouté
                              </span>
                            ) : (
                              'Ajouter'
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Craftsmanship, Moroccan Cooperatives & Adjacent Tasting Proof */}
        <section id="producteurs" className="py-14 sm:py-20 bg-[#F2F0EA] border-t border-[#E4E2DA]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-10 lg:gap-14">
              <div className="lg:col-span-5">
                <div className="h-full min-h-[300px] lg:min-h-[520px] rounded-xl overflow-hidden bg-[#E5E2D8]">
                  <ResilientImage
                    src={ATELIER_IMAGE}
                    alt="Atelier de coopérative marocaine dans le Souss-Massa avec meule en pierre pour l'argan et paniers d'osier"
                    fallbackTitle="Coopératives du Souss & Drâa"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-[#5C615D]">
                    Savoir-faire &amp; coopératives
                  </p>
                  <h2 className="mt-2 font-display text-2xl sm:text-3xl font-medium text-[#171C18] text-balance">
                    Des coopératives féminines et palmeraies suivies de l&apos;arganeraie jusqu&apos;aux oasis.
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#4E544F] max-w-2xl">
                    Chaque flacon et chaque coffret provient directement des ateliers du Souss-Massa et du Drâa-Tafilalet. Aucun mélange d&apos;origines : chaque lot conserve la signature de son terroir.
                  </p>

                  <div className="mt-8 divide-y divide-[#DDDAD0] border-t border-b border-[#DDDAD0]">
                    {PRODUCERS.map((producer) => (
                      <div key={producer.name} className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6">
                        <div className="sm:col-span-5">
                          <h3 className="text-sm font-semibold text-[#171C18]">
                            {producer.index} {producer.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-[#5C615D]">
                            {producer.location} · {producer.specialty}
                          </p>
                        </div>
                        <p className="sm:col-span-7 text-sm leading-relaxed text-[#4E544F]">
                          {producer.story}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {TESTIMONIALS.map((item) => (
                    <blockquote
                      key={item.author}
                      className="p-5 bg-[#FAF9F6] border border-[#E4E2DA] rounded-lg flex flex-col justify-between"
                    >
                      <p className="text-sm leading-relaxed text-[#171C18]">
                        « {item.quote} »
                      </p>
                      <footer className="mt-4 pt-3 border-t border-[#ECEAE2]">
                        <p className="text-xs font-semibold text-[#171C18]">{item.author}</p>
                        <p className="text-xs text-[#5C615D]">{item.role}</p>
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Section 4: Quiet Architectural Footer & Harvest Dispatch */}
      <footer id="contact" className="bg-[#FAF9F6] border-t border-[#E4E2DA] py-12 sm:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#E4E2DA]">
            <div className="md:col-span-4">
              <p className="font-display text-xl font-semibold text-[#171C18]">
                Dar Souss &amp; Drâa
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#545A55] max-w-xs">
                Épicerie de terroir marocain en circuit direct. Récoltes authentiques du Souss-Massa et du Drâa-Tafilalet.
              </p>
              <p className="mt-4 text-xs text-[#5C615D] leading-relaxed">
                Avenue Mohammed V, 83000 Taroudant
                <br />
                bonjour@darsoussdraa.ma · +212 5 28 85 00 00
              </p>
            </div>

            <div className="md:col-span-3">
              <h3 className="text-xs font-semibold text-[#171C18]">Boutique</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#545A55]">
                <li>
                  <a href="#recoltes" className="hover:text-[#171C18] transition-colors">
                    La récolte de saison
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenTracking()}
                    className="hover:text-[#171C18] transition-colors cursor-pointer"
                  >
                    Suivre une commande
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setCartOpen(true)}
                    className="hover:text-[#171C18] transition-colors cursor-pointer"
                  >
                    Consulter le panier
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setAdminOpen(true)}
                    className="hover:text-[#171C18] transition-colors cursor-pointer"
                  >
                    Espace gestion
                  </button>
                </li>
              </ul>
            </div>

            <div className="md:col-span-5">
              <h3 className="text-xs font-semibold text-[#171C18]">
                Carnet de récolte
              </h3>
              <p className="mt-3 text-sm text-[#545A55]">
                Recevez l&apos;annonce de la cueillette du safran de Taliouine, de la récolte des dattes Majhoul d&apos;Erfoud et des nouveaux pressages d&apos;argan.
              </p>

              {newsletterConfirmed ? (
                <div className="mt-4 p-3.5 bg-[#F1F0EB] border border-[#DFDDD4] rounded-md text-sm text-[#2D4732] flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Inscription enregistrée pour la prochaine lettre de récolte.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="mt-4 space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="email"
                      required
                      maxLength={120}
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="votre.email@exemple.ma"
                      aria-label="Adresse email pour le carnet de récolte"
                      className="flex-1 h-11 px-3.5 text-sm bg-white border border-[#D8D5CB] rounded-md text-[#171C18] placeholder:text-[#7A807B] focus:outline-none focus:border-[#2D4732]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 min-h-[44px] text-sm font-medium bg-[#2D4732] text-[#FAF9F6] hover:bg-[#223726] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4732]"
                    >
                      S&apos;inscrire
                    </button>
                  </div>
                  {newsletterError && (
                    <p className="text-xs text-[#7F1D1D]">{newsletterError}</p>
                  )}
                </form>
              )}
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#5C615D]">
            <p>© 2026 Dar Souss &amp; Drâa. Tous droits réservés.</p>
            <p>Expédition partout au Maroc · Paiement à la livraison et confirmation WhatsApp</p>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Slide-Over Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
        onTrackOrder={(orderNumber, phoneLast4) =>
          handleOpenTracking(orderNumber, phoneLast4)
        }
      />

      {/* Guest Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={trackingOpen}
        initialOrderNumber={trackingPrefill.orderNumber}
        initialPhoneLast4={trackingPrefill.phoneLast4}
        onClose={() => setTrackingOpen(false)}
      />

      {/* Admin Order Management Drawer */}
      <AdminDrawer isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
    </div>
  );
}

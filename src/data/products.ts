export type ProductCategory =
  | 'Toutes'
  | 'Huiles & Amlou'
  | 'Miels & Dattes'
  | 'Épices & Eaux Florales';

export type TerroirRegion = 'Toutes' | 'Souss-Massa' | 'Drâa-Tafilalet';

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Exclude<ProductCategory, 'Toutes'>;
  terroirRegion: Exclude<TerroirRegion, 'Toutes'>;
  originCity: string;
  producer: string;
  harvestLabel: string;
  image: string;
  shortNote: string;
  tastingNotes: string;
  pairings: string;
  ingredients: string;
  variants: ProductVariant[];
}

export interface ProducerProfile {
  index: string;
  name: string;
  location: string;
  specialty: string;
  story: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export const CATEGORIES: ProductCategory[] = [
  'Toutes',
  'Huiles & Amlou',
  'Miels & Dattes',
  'Épices & Eaux Florales',
];

export const REGIONS: TerroirRegion[] = [
  'Toutes',
  'Souss-Massa',
  'Drâa-Tafilalet',
];

export const HERO_IMAGE = '/src/assets/images/hero_maroc_terroir_1795626146511.jpg';
export const ATELIER_IMAGE = '/src/assets/images/atelier_cooperative_maroc_1795626149725.jpg';

export const PRODUCTS: Product[] = [
  {
    id: 'argan-culinaire-taroudant',
    slug: 'huile-argan-culinaire-taroudant',
    name: "Huile d'Argan Culinaire Torréfiée",
    category: 'Huiles & Amlou',
    terroirRegion: 'Souss-Massa',
    originCity: 'Taroudant · Souss-Massa',
    producer: 'Coopérative Toudarte',
    harvestLabel: 'IGP Argan · Pression à froid',
    image: '/src/assets/images/product_argan_huile_1795626146567.jpg',
    shortNote:
      "Amandons d'arganier légèrement torréfiés au feu de bois et pressés mécaniquement à froid.",
    tastingNotes:
      'Robe ambre doré, arômes prononcés de noisette grillée et de sésame chaud, finale longue et soyeuse.',
    pairings:
      'À verser en filet hors du feu sur un tajine de légumes, un couscous aux sept légumes ou sur du pain d’orge chaud.',
    ingredients:
      "100 % huile vierge d'amandons d'arganier (Argania spinosa) issus de la réserve de biosphère du Souss.",
    variants: [
      { id: 'argan-250', label: '250 ml · Verre ambré', price: 150, inStock: true },
      { id: 'argan-500', label: '500 ml · Verre ambré', price: 280, inStock: true },
    ],
  },
  {
    id: 'safran-taliouine-aop',
    slug: 'safran-pur-taliouine-pistils',
    name: 'Safran en Pistils Pur de Taliouine',
    category: 'Épices & Eaux Florales',
    terroirRegion: 'Souss-Massa',
    originCity: 'Taliouine · Anti-Atlas',
    producer: 'Safranière Souktana',
    harvestLabel: 'AOP Taliouine · Catégorie I',
    image: '/src/assets/images/product_safran_taliouine_1795626146494.jpg',
    shortNote:
      'Stigmates entiers cueillis à la main à l’aube entre 1 200 et 1 600 m d’altitude, séchés à l’ombre.',
    tastingNotes:
      'Pouvoir colorant intense et bouquet floral miellé typique du Crocus sativus de l’Anti-Atlas, sans aucune brisure.',
    pairings:
      'Infuser quelques pistils dans de l’eau tiède pour parfumer un thé vert, un tajine d’agneau aux pruneaux ou une pastilla.',
    ingredients: '100 % stigmates purs de Crocus sativus récoltés à Taliouine.',
    variants: [
      { id: 'safran-2g', label: '2 g · Pot verre', price: 110, inStock: true },
      { id: 'safran-5g', label: '5 g · Pot verre', price: 250, inStock: true },
    ],
  },
  {
    id: 'dattes-majhoul-tafilalet',
    slug: 'dattes-majhoul-royales-erfoud',
    name: 'Dattes Majhoul Royales de Tafilalet',
    category: 'Miels & Dattes',
    terroirRegion: 'Drâa-Tafilalet',
    originCity: 'Erfoud · Drâa-Tafilalet',
    producer: "Palmeraie d'Erfoud",
    harvestLabel: 'IGP Tafilalet · Calibre Jumbo',
    image: '/src/assets/images/product_dattes_majhoul_1795626147165.jpg',
    shortNote:
      'Récoltées sur régime à pleine maturité dans les oasis du Ziz, charnues et sans ajout de sirop.',
    tastingNotes:
      'Chair tendre et fondante évoquant le caramel au beurre, la figue mûre et une pointe de miel brun.',
    pairings:
      'À savourer nature avec un café aux épices, farcies aux cerneaux de noix de l’Atlas ou en accompagnement de fromages affinés.',
    ingredients: '100 % dattes Majhoul entières non traitées, séchées naturellement au soleil des oasis.',
    variants: [
      { id: 'majhoul-500', label: '500 g · Coffret bois', price: 95, inStock: true },
      { id: 'majhoul-1000', label: '1 kg · Coffret bois', price: 175, inStock: true },
    ],
  },
  {
    id: 'amlou-tafraoute-argan',
    slug: 'amlou-artisanal-amandes-tafraoute',
    name: 'Amlou aux Amandes de Tafraoute & Argan',
    category: 'Huiles & Amlou',
    terroirRegion: 'Souss-Massa',
    originCity: 'Tafraoute · Souss-Massa',
    producer: 'Coopérative Toudarte',
    harvestLabel: 'Meule de pierre · Sans sucre ajouté',
    image: '/src/assets/images/product_amlou_argan_1795626148263.jpg',
    shortNote:
      'Amandes beldi torréfiées broyées sur pierre avec de l’huile d’argan culinaire et du miel d’oranger.',
    tastingNotes:
      'Texture fluide et veloutée, richesse aromatique de l’amande grillée équilibrée par la douceur florale du miel du Souss.',
    pairings:
      'Incontournable au petit-déjeuner avec du msemen chaud, du pain baghrir ou des fruits frais de saison.',
    ingredients:
      "Amandes beldi de l'Anti-Atlas (64 %), huile d'argan culinaire torréfiée (24 %), miel pur de fleurs d'oranger (12 %).",
    variants: [
      { id: 'amlou-250', label: '250 g · Bocal verre', price: 120, inStock: true },
      { id: 'amlou-450', label: '450 g · Bocal verre', price: 210, inStock: true },
    ],
  },
  {
    id: 'miel-daghmous-anti-atlas',
    slug: 'miel-cru-daghmous-euphorbe-tiznit',
    name: "Miel Cru de Daghmous de l'Anti-Atlas",
    category: 'Miels & Dattes',
    terroirRegion: 'Souss-Massa',
    originCity: 'Tiznit · Souss-Massa',
    producer: 'Rucher Ait Baâmrane',
    harvestLabel: "Miel cru · Récolte d'été",
    image: '/src/assets/images/product_miel_daghmous_1795626149103.jpg',
    shortNote:
      'Miel rare issu du nectar d’euphorbe (Euphorbia echinus) butiné sur les coteaux arides du Souss.',
    tastingNotes:
      'Robe ambre foncé intense. Attaque douce suivie de la sensation chaude et poivrée caractéristique en gorge.',
    pairings:
      'À prendre à la cuillère le matin à jeun, dans une tisane de thym sauvage ou pour glacer des figues rôties.',
    ingredients: '100 % miel cru de daghmous (euphorbe) non chauffé et non filtré finement.',
    variants: [
      { id: 'daghmous-250', label: '250 g · Verre', price: 160, inStock: true },
      { id: 'daghmous-500', label: '500 g · Verre', price: 295, inStock: true },
    ],
  },
  {
    id: 'eau-rose-kelaat-mgouna',
    slug: 'eau-florale-rose-damascena-dades',
    name: 'Eau de Rose Damascena de Kelâat M’Gouna',
    category: 'Épices & Eaux Florales',
    terroirRegion: 'Drâa-Tafilalet',
    originCity: 'Vallée du Dadès · Drâa-Tafilalet',
    producer: 'Distillerie des Roses du Dadès',
    harvestLabel: 'Alambic cuivre · 100 % pure',
    image: '/src/assets/images/product_eau_rose_dades_1795626149845.jpg',
    shortNote:
      'Hydrolat culinaire et botanique obtenu par distillation à la vapeur de roses fraîches de la vallée du Dadès.',
    tastingNotes:
      'Parfum franc et délicat de pétales fraîchement cueillis à l’aube, sans aucun arôme de synthèse.',
    pairings:
      'Quelques gouttes suffisent pour parfumer des cornes de gazelle, une salade d’oranges à la cannelle ou un lait d’amande.',
    ingredients: 'Hydrolat de Rosa damascena issu de première distillation (sans conservateur).',
    variants: [
      { id: 'rose-250', label: '250 ml · Verre', price: 85, inStock: true },
      { id: 'rose-500', label: '500 ml · Verre', price: 150, inStock: true },
    ],
  },
];

export const PRODUCERS: ProducerProfile[] = [
  {
    index: '01.',
    name: 'Coopérative Toudarte',
    location: 'Taroudant & Tafraoute · Souss-Massa',
    specialty: 'Arganeraie & meule de pierre',
    story:
      'Rassemble quarante-cinq femmes artisanes qui concassent les noix d’argan à la main et broient les amandes de l’Anti-Atlas sur meule traditionnelle.',
  },
  {
    index: '02.',
    name: "Palmeraie d'Erfoud",
    location: 'Vallée du Ziz · Drâa-Tafilalet',
    specialty: 'Dattes Majhoul des oasis',
    story:
      'Culture oasienne irriguée par khettaras traditionnelles. Chaque régime est ensaché sur le palmier puis trié à la main par calibre et souplesse.',
  },
  {
    index: '03.',
    name: 'Safranière & Distillerie de l’Atlas',
    location: 'Taliouine & Kelâat M’Gouna',
    specialty: 'Safran AOP & rose de Damas',
    story:
      'Récolte matinale avant le lever du soleil pour préserver les huiles essentielles des fleurs de crocus et des roses de la vallée du Dadès.',
  },
];

export const COMMITMENTS = [
  {
    metric: '100 %',
    label: 'Direct coopératives',
    detail: 'Revenus équitables versés aux ateliers du Souss et du Drâa.',
  },
  {
    metric: '14',
    label: 'Oasis & douars partenaires',
    detail: 'Traçabilité par lot de Taroudant à Erfoud.',
  },
  {
    metric: '48 h',
    label: 'Expédition au Maroc',
    detail: 'Colis protégés expédiés sous 48 h vers toutes les villes.',
  },
  {
    metric: '500 DH',
    label: 'Livraison offerte',
    detail: 'Offerte partout au Maroc dès 500,00 DH de commande.',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "L'huile d'argan de Taroudant et l'amlou à la pierre retrouvent exactement le goût des tables familiales du Souss, sans aucune amertume.",
    author: 'Salma Benjelloun',
    role: 'Cheffe pâtissière, Maison Al-Marsa (Casablanca)',
  },
  {
    quote:
      'Des dattes Majhoul d’Erfoud charnues et un safran de Taliouine d’une pureté rare. Nous travaillons leurs récoltes toute l’année au riad.',
    author: 'Youssef El Amrani',
    role: 'Chef de cuisine, Dar Zitoun (Marrakech)',
  },
];

export function formatPrice(amount: number): string {
  return (
    new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' DH'
  );
}

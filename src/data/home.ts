import { findProperty, heroImage } from './properties';

/**
 * Home page choices, in the order the editor sets them. In production this is the Sanity
 * "Página inicial" document: two lists of listing references that the team can drag to reorder.
 */
export const MAX_FEATURED = 8; // two full rows of 4
export const MAX_HERO_LISTINGS = 3;

export const homePage = {
  /** "Imóveis em destaque" section. */
  featuredSlugs: [
    'apartamento-t2-casuarinas-vilamoura',
    'casuarinas-residences-vilamoura',
    't2-perto-da-praia-quarteira',
    't2-vista-mar-forte-novo-quarteira',
    't1-novo-rua-da-azinheira-quarteira',
    'oliveiras-residence-quarteira',
  ],
  /** Photos rotating at the top of the page ("Imagens do topo"). */
  heroSlugs: [
    'oliveiras-residence-quarteira',
    't2-vista-mar-forte-novo-quarteira',
    'casuarinas-residences-vilamoura',
  ],
};

/** One free-form highlight: an image plus text, for a new development, a campaign, a service... */
export interface Highlight {
  label: string;
  title: string;
  text: string;
  image: string;
  imageAlt: string;
  href: string;
}

const photoOf = (slug: string, i = 0) => findProperty(slug)?.images[i] ?? heroImage;

/**
 * Side panel next to the zones ("Destaques"). The first is the large one. In production this is a list
 * on the Sanity home page document (image, label, title, text, link); the team can add, remove and reorder.
 * Texts below come from the client's own listings; TODO: reviewed copy.
 */
export const sideHighlights: Highlight[] = [
  {
    label: 'Novo empreendimento',
    title: 'Casuarinas Residences',
    text: 'Condomínio privado de luxo no centro de Vilamoura, a 1 km da praia da Falésia: 25 frações, entre apartamentos T2 e moradias em banda T2+1.',
    image: photoOf('casuarinas-residences-vilamoura', 1),
    imageAlt: 'Casuarinas Residences, Vilamoura',
    href: '/imoveis/casuarinas-residences-vilamoura/',
  },
  {
    label: 'Novo empreendimento',
    title: 'Oliveiras Residence',
    text: 'Moradias contemporâneas na Cascalheira, em Quarteira, com eficiência energética.',
    image: photoOf('oliveiras-residence-quarteira', 1),
    imageAlt: 'Oliveiras Residence, Quarteira',
    href: '/imoveis/oliveiras-residence-quarteira/',
  },
  {
    label: 'Novo empreendimento',
    title: 'Edifício novo na Rua da Azinheira',
    text: 'Edifício contemporâneo em Quarteira, a poucos minutos a pé da praia, do passeio marítimo e do comércio.',
    image: photoOf('t1-novo-rua-da-azinheira-quarteira', 0),
    imageAlt: 'Edifício novo na Rua da Azinheira, Quarteira',
    href: '/imoveis/t1-novo-rua-da-azinheira-quarteira/',
  },
];

/** One figure in the "Resultados" section: a big number (with an optional smaller unit) and a short caption. */
export interface ResultStat {
  value: string;
  unit?: string;
  label: string;
}

export const MAX_RESULT_STATS = 4;

/**
 * "Resultados" section. In production: a list on the Sanity "Página inicial" document (max 4, drag to reorder).
 * TODO: PLACEHOLDER figures copied from a reference layout, NOT JPP data. Ask the client for the real numbers
 * (and the year of the largest sale) before launch; EN/FR captions pending.
 */
export const resultStats: ResultStat[] = [
  { value: '98', unit: '%', label: 'Média do valor pedido alcançado' },
  { value: '4,2', unit: 'M€', label: 'Maior venda em 2025' },
  { value: '45', unit: 'dias', label: 'Tempo médio de venda' },
  { value: '30+', unit: 'anos', label: 'De experiência no setor imobiliário' },
];

export const MAX_RECENTLY_SOLD = 4;

/**
 * TODO: DEMO ONLY, remove before launch. Listings still for sale, shown as "Vendido" in the "Resultados" section
 * so the client can preview it while no listing is marked as sold. In production the row lists real sold listings.
 */
export const demoSoldSlugs = [
  't2-perto-da-praia-quarteira',
  'apartamento-t2-casuarinas-vilamoura',
  't1-novo-rua-da-azinheira-quarteira',
  'oliveiras-residence-quarteira',
];

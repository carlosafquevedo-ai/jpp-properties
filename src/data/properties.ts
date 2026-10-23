/**
 * PROTOTYPE DATA. These six listings come from the current public site (jppproperties.com)
 * so the design can be judged with real content. Photos are hot-linked from the old site and
 * are NOT stored in this repository. In production everything comes from Sanity.
 * TODO: titles/descriptions below are provisional PT translations; reviewed copy comes later.
 */
const OLD = 'https://jppproperties.com/wp-content/uploads';

export type ZoneId =
  'vilamoura' | 'quarteira' | 'vilasol' | 'vale-do-lobo' | 'quinta-do-lago' | 'loule';
export type ListingType = 'sale' | 'rent';
export type PropertyType = 'apartment' | 'villa' | 'plot' | 'shop';

export interface Property {
  slug: string;
  reference?: string;
  title: string;
  listingType: ListingType;
  propertyType: PropertyType;
  condition: 'new' | 'used';
  zone: ZoneId;
  locality?: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  garageSpaces: number;
  usableArea: number;
  yearBuilt: number;
  energyClass: string | null;
  featured: boolean;
  addedAt: string;
  images: string[];
  description: string[];
  features: string[];
}

export const zones: Record<ZoneId, { name: string; blurb: string }> = {
  vilamoura: { name: 'Vilamoura', blurb: 'Marina, golfe e a praia da Falésia a poucos minutos.' },
  quarteira: {
    name: 'Quarteira',
    blurb: 'Vida junto ao mar, com passeio marítimo, comércio e serviços.',
  },
  'vale-do-lobo': { name: 'Vale do Lobo', blurb: 'Golfe, praia e privacidade.' },
  'quinta-do-lago': {
    name: 'Quinta do Lago',
    blurb: 'Junto à Ria Formosa, entre os endereços mais exclusivos.',
  },
  vilasol: { name: 'Vilasol', blurb: 'Zona residencial tranquila, rodeada de golfe.' },
  loule: { name: 'Loulé', blurb: 'O centro histórico e o dia a dia do concelho.' },
};

export const propertyTypeLabels: Record<PropertyType, string> = {
  apartment: 'Apartamento',
  villa: 'Moradia',
  plot: 'Terreno',
  shop: 'Loja / negócio',
};

const quarteiraPhotos = [
  'MG_0052',
  'MG_0043',
  'MG_0001',
  'MG_0004',
  'MG_0007',
  'MG_0013',
  'MG_0010',
  'MG_0016',
  'MG_0019',
  'MG_0022',
  'MG_0025',
  'MG_0028',
  'MG_0031',
  'MG_0034',
  'MG_0037',
  'MG_0040',
  'MG_0046',
  'MG_0049',
  'MG_0055',
  'MG_0061',
  'MG_0064',
  'MG_0067',
  'MG_0070',
].map((n) => `${OLD}/2026/04/${n}.jpg1_.jpg`);

export const heroImage = `${OLD}/2020/07/930747_v8.jpeg`;
export const logoImage = `${OLD}/2020/07/logopng-1.png`;

export const properties: Property[] = [
  {
    slug: 'apartamento-t2-casuarinas-vilamoura',
    title: 'Apartamento T2 no centro de Vilamoura',
    listingType: 'sale',
    propertyType: 'apartment',
    condition: 'new',
    zone: 'vilamoura',
    price: 815000,
    bedrooms: 2,
    bathrooms: 2,
    garageSpaces: 2,
    usableArea: 130,
    yearBuilt: 2024,
    energyClass: null,
    featured: true,
    addedAt: '2026-03-10',
    images: [
      `${OLD}/2024/04/image00004.png`,
      `${OLD}/2023/04/montagem-norte.jpg`,
      `${OLD}/2023/04/foto11.jpg`,
      `${OLD}/2023/04/foto8-1.jpg`,
    ],
    description: [
      'Viver no condomínio Casuarinas é viver perto da natureza, numa zona residencial tranquila no centro de Vilamoura, a 1 km da praia da Falésia.',
    ],
    features: ['2 quartos', '2 casas de banho', '2 lugares de garagem', 'Condomínio privado'],
  },
  {
    slug: 'casuarinas-residences-vilamoura',
    reference: 'CRT2',
    title: 'Casuarinas Residences',
    listingType: 'sale',
    propertyType: 'apartment',
    condition: 'new',
    zone: 'vilamoura',
    price: 760000,
    bedrooms: 2,
    bathrooms: 2,
    garageSpaces: 1,
    usableArea: 100,
    yearBuilt: 2024,
    energyClass: 'A',
    featured: true,
    addedAt: '2026-02-18',
    images: [
      `${OLD}/2023/04/villas-entrance-Large-1.png`,
      `${OLD}/2023/04/south-view-villa-Large-1-1.png`,
      `${OLD}/2024/05/geral-2-Large-Copia-Copia-Copia.jpg`,
      `${OLD}/2024/05/kitchen-villa-Large-1-Copia-Small-Copia.jpg`,
      `${OLD}/2024/05/living-2-villa-Large-1-Copia-Small-Copia.jpg`,
      `${OLD}/2024/05/Master-bedroom-T2-Large-1-Copia.jpg`,
    ],
    description: [
      'Viver nas Casuarinas Residences é viver perto da natureza. Num bairro residencial de moradias e apartamentos, o Casuarinas oferece conforto, privacidade e bem-estar.',
      'No coração de Vilamoura, a 1 km da premiada praia da Falésia, este condomínio privado de luxo terá 25 frações: 20 apartamentos T2 (110 a 140 m²) e 5 moradias em banda T2+1 (260 a 290 m²).',
      'Todas as frações incluem estacionamento privado e arrecadação, e cada uma tem o seu terraço. O projeto aposta na sustentabilidade: painéis solares para águas quentes, paisagismo sustentável e lugares preparados para carregamento de veículos elétricos.',
    ],
    features: [
      'Classe energética A',
      'Terraço privado',
      'Estacionamento e arrecadação',
      'Painéis solares',
      'Carregamento elétrico',
      'Condomínio privado',
    ],
  },
  {
    slug: 't2-perto-da-praia-quarteira',
    title: 'Apartamento T2 perto da praia',
    listingType: 'sale',
    propertyType: 'apartment',
    condition: 'used',
    zone: 'quarteira',
    price: 410000,
    bedrooms: 2,
    bathrooms: 2,
    garageSpaces: 1,
    usableArea: 80,
    yearBuilt: 2022,
    energyClass: null,
    featured: true,
    addedAt: '2026-04-12',
    images: [
      ...quarteiraPhotos,
      `${OLD}/2026/04/dji_fly_20260408_123630_0081_1775649429192_photo-scaled.jpeg`,
    ],
    description: [
      'Apartamento T2 moderno, num edifício recente (2022), a 5 minutos a pé da praia. Tem 2 quartos amplos, 2 casas de banho, uma sala luminosa e cozinha funcional. Destaca-se pelos acabamentos modernos e pela excelente luz natural.',
      'Inclui lugar de estacionamento privado e arrecadação, para mais comodidade e espaço.',
      'Numa zona privilegiada, perto de comércio, serviços e transportes. Ideal para quem procura qualidade de vida junto ao mar, como residência principal ou como investimento.',
    ],
    features: [
      '2 quartos',
      '2 casas de banho',
      'Construído em 2022',
      'Estacionamento privado',
      'Arrecadação',
      'A 5 minutos a pé da praia',
    ],
  },
  {
    slug: 't2-vista-mar-forte-novo-quarteira',
    title: 'Apartamento T2 novo com vista mar, piscina e garagem',
    listingType: 'sale',
    propertyType: 'apartment',
    condition: 'new',
    zone: 'quarteira',
    locality: 'Forte Novo',
    price: 1255000,
    bedrooms: 2,
    bathrooms: 2,
    garageSpaces: 2,
    usableArea: 106,
    yearBuilt: 2026,
    energyClass: null,
    featured: true,
    addedAt: '2026-06-02',
    images: [1, 2, 3, 4].map((n) => `${OLD}/2026/06/${n}.png`),
    description: [
      'Apartamento T2 novo, num condomínio fechado de prestígio no Forte Novo, uma das zonas mais procuradas de Quarteira.',
    ],
    features: ['Vista mar', 'Piscina', '2 lugares de garagem', 'Condomínio fechado'],
  },
  {
    slug: 't1-novo-rua-da-azinheira-quarteira',
    title: 'Apartamento T1 novo com estacionamento, a minutos da praia',
    listingType: 'sale',
    propertyType: 'apartment',
    condition: 'new',
    zone: 'quarteira',
    locality: 'Rua da Azinheira',
    price: 325000,
    bedrooms: 1,
    bathrooms: 1,
    garageSpaces: 1,
    usableArea: 58,
    yearBuilt: 2026,
    energyClass: null,
    featured: true,
    addedAt: '2026-07-05',
    images: [5, 1, 2, 3].map((n) => `${OLD}/2026/07/Azinheira-${n}.jpeg`),
    description: [
      'Apartamento T1 novo, num edifício contemporâneo na Rua da Azinheira, a poucos minutos a pé da praia, do passeio marítimo e de todo o comércio e serviços. Sala e cozinha em open space.',
    ],
    features: ['Estacionamento', 'Edifício novo', 'Perto da praia', 'Sala e cozinha em open space'],
  },
  {
    slug: 'oliveiras-residence-quarteira',
    title: 'Oliveiras Residence',
    listingType: 'sale',
    propertyType: 'villa',
    condition: 'new',
    zone: 'quarteira',
    locality: 'Cascalheira',
    price: 1390000,
    bedrooms: 3,
    bathrooms: 2,
    garageSpaces: 1,
    usableArea: 160,
    yearBuilt: 2026,
    energyClass: null,
    featured: true,
    addedAt: '2026-07-20',
    images: [
      '2_b7de29d5-a7df-4691-892b-3dfb8a0f7448',
      '0_879d01f8-f05f-4fa7-a18e-021c8cd39aac',
      '1_0549754c-93d6-4d1e-a622-34b6993d45ce',
      '3_fa23d9a4-2b2c-4fc1-9777-7c96f0ecb21f',
    ].map((n) => `${OLD}/2026/07/${n}.jpg`),
    description: [
      'Descubra uma nova forma de viver no Oliveiras Residence, um empreendimento exclusivo de moradias contemporâneas na Cascalheira, em Quarteira, onde a arquitetura moderna encontra a construção inovadora, os altos padrões de qualidade e a eficiência energética.',
    ],
    features: ['Moradia nova', 'Arquitetura contemporânea', 'Eficiência energética'],
  },
];

export const findProperty = (slug: string) => properties.find((p) => p.slug === slug);

const eur = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
export const formatPrice = (price: number) => eur.format(price).replace(/ /g, ' ');

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

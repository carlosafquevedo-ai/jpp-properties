/** Site-wide constants. Real client data will come from Sanity (siteSettings). */
export const SITE_URL = 'https://jppproperties.com'; // TODO: confirm final domain
export const AMI = '9361';
/** Public Google Business profile (where visitors read and leave reviews). Supplied by the team. */
export const googleProfileUrl = 'https://share.google/SCYCPULSla1Ik3uft';

export const offices = [
  {
    id: 'vilamoura',
    name: 'Vilamoura',
    mapUrl: 'https://share.google/53JRHbtb1BUG44fbl',
    address: ['Praceta Tivoli, Edifício Tália, Loja nº 3', '8125-410 Vilamoura'],
    phones: [
      { label: '+351 917 629 447', tel: '+351917629447', note: 'Chamada para rede móvel nacional' },
      { label: '+351 961 399 556', tel: '+351961399556', note: 'Chamada para rede móvel nacional' },
      { label: '+351 289 380 135', tel: '+351289380135', note: 'Chamada para rede fixa nacional' },
    ],
  },
] as const;

export const email = 'geral@jppproperties.com';
/** Opening hours shown in the header's contact panel. TODO: confirm with the client (placeholder until then). */
export const openingHours: string[] = [];
export const mainPhone = offices[0].phones[0];
// TODO: confirm the WhatsApp number with the client (provisionally the main mobile line).
export const whatsappUrl = 'https://wa.me/351917629447';
export const facebookUrl = 'https://www.facebook.com/JPP-Properties-107531187529584/';
export const complaintsBookUrl = 'https://www.livroreclamacoes.pt/inicio';
// TODO: confirm the real Instagram profile with the client (placeholder points to the Instagram home).
export const instagramUrl = 'https://www.instagram.com/';

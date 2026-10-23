/** Site-wide constants. Real client data will come from Sanity (siteSettings). */
export const SITE_URL = 'https://jppproperties.com'; // TODO: confirm final domain
export const AMI = '9361';

export const offices = [
  {
    id: 'vilamoura',
    name: 'Vilamoura',
    address: ['Praceta Tivoli, Edifício Tália, Loja nº 3', '8125-410 Vilamoura'],
    phones: [
      { label: '+351 917 629 447', tel: '+351917629447', note: 'Chamada para rede móvel nacional' },
      { label: '+351 961 399 556', tel: '+351961399556', note: 'Chamada para rede móvel nacional' },
      { label: '+351 289 380 135', tel: '+351289380135', note: 'Chamada para rede fixa nacional' },
    ],
  },
  {
    id: 'quarteira',
    name: 'Quarteira',
    address: ['Av.ª Dr. Carlos Mota Pinto, Edif. Coluna, Loja n.º 4', '8125-215 Quarteira'],
    phones: [
      { label: '+351 962 913 977', tel: '+351962913977', note: 'Chamada para rede móvel nacional' },
      { label: '+351 916 935 583', tel: '+351916935583', note: 'Chamada para rede móvel nacional' },
      { label: '+351 916 937 244', tel: '+351916937244', note: 'Chamada para rede móvel nacional' },
    ],
  },
] as const;

export const email = 'geral@jppproperties.com';
export const mainPhone = offices[0].phones[0];
// TODO: confirm the WhatsApp number with the client (provisionally the main mobile line).
export const whatsappUrl = 'https://wa.me/351917629447';
export const facebookUrl = 'https://www.facebook.com/JPP-Properties-107531187529584/';
export const complaintsBookUrl = 'https://www.livroreclamacoes.pt/inicio';
// TODO: confirm the real Instagram profile with the client (placeholder points to the Instagram home).
export const instagramUrl = 'https://www.instagram.com/';

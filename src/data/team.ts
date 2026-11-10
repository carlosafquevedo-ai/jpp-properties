import { email, mainPhone } from '../lib/site';

/**
 * Team members shown in the "about" section. In production this is a Sanity list ("Equipa": photo, name,
 * role, phone, email, WhatsApp); the team can add, remove and reorder people.
 * TODO: PLACEHOLDERS. No real names, photos or personal contacts exist yet (the client will provide them).
 * The row is a carousel, so any number of people fits without making the section taller. Until then each card uses the agency's own general contacts so the buttons can be tested.
 */
export interface Agent {
  name: string;
  role: string;
  /** Portrait (4:5). Without it a branded placeholder is shown. */
  photo?: string;
  phone?: { label: string; tel: string };
  email?: string;
  /** International number without "+" or spaces, e.g. 351917629447. */
  whatsapp?: string;
}

/**
 * DEMO ONLY: portraits in public/team-demo/ (the owner's own example portrait, committed so the client can preview the
 * layout on the published prototype; TODO (client): replace with the team's real photos) are picked up by order (the first one is reused if there are fewer photos than people). Without that folder every card falls back to the placeholder.
 */
const demoPhotos = Object.keys(import.meta.glob('/public/team-demo/*.{avif,webp,jpg,jpeg,png}'))
  .sort()
  .map((path) => path.replace('/public', ''));

const people: Agent[] = [
  {
    name: 'Nome do agente',
    role: 'Agente imobiliário',
    phone: mainPhone,
    email,
    whatsapp: mainPhone.tel.replace(/\D/g, ''),
  },
  {
    name: 'Nome do agente',
    role: 'Agente imobiliário',
    phone: mainPhone,
    email,
    whatsapp: mainPhone.tel.replace(/\D/g, ''),
  },
  {
    name: 'Nome do agente',
    role: 'Agente imobiliário',
    phone: mainPhone,
    email,
    whatsapp: mainPhone.tel.replace(/\D/g, ''),
  },
  {
    name: 'Nome do agente',
    role: 'Agente imobiliário',
    phone: mainPhone,
    email,
    whatsapp: mainPhone.tel.replace(/\D/g, ''),
  },
];

export const team: Agent[] = people.map((a, i) => ({
  ...a,
  photo: demoPhotos[i] ?? demoPhotos[0] ?? a.photo,
}));

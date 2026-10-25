import { email, mainPhone } from '../lib/site';

/**
 * Team members shown in the "about" section. In production this is a Sanity list ("Equipa": photo, name,
 * role, phone, email, WhatsApp); the team can add, remove and reorder people.
 * TODO: PLACEHOLDERS. No real names, photos or personal contacts exist yet (the client will provide them).
 * Until then each card uses the agency's own general contacts so the buttons can be tested.
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

export const team: Agent[] = [
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

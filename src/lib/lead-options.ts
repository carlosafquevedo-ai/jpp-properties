/**
 * Options for the "sell / buy" request form (see src/components/LeadForm.astro and functions/api/lead.ts).
 * Keep the values (first item of each pair) in sync with the labels used in the e-mail built by the function.
 */

/** Property types the seller can choose from. */
export const tipologias: [value: string, label: string][] = [
  ['apartamento', 'Apartamento'],
  ['moradia', 'Moradia / Vivenda'],
  ['loja', 'Loja'],
  ['predio', 'Prédio'],
  ['terreno', 'Terreno'],
  ['outro', 'Outro'],
];

export const quartos: [value: string, label: string][] = [
  ['0', 'T0 (estúdio)'],
  ['1', '1 quarto'],
  ['2', '2 quartos'],
  ['3', '3 quartos'],
  ['4', '4 quartos'],
  ['5+', '5 ou mais'],
];

export const casasDeBanho: [value: string, label: string][] = [
  ['1', '1'],
  ['2', '2'],
  ['3', '3'],
  ['4', '4'],
  ['5+', '5 ou mais'],
];

export const estados: [value: string, label: string][] = [
  ['novo', 'Novo'],
  ['usado', 'Usado, em bom estado'],
  ['recuperar', 'Para recuperar'],
];

export const extras: [value: string, label: string][] = [
  ['garagem', 'Garagem'],
  ['piscina', 'Piscina'],
  ['terraco', 'Terraço'],
  ['jardim', 'Jardim'],
  ['elevador', 'Elevador'],
  ['vista-mar', 'Vista mar'],
];

export const financiamento: [value: string, label: string][] = [
  ['nao', 'Pagamento sem crédito'],
  ['sim', 'Preciso de crédito habitação'],
  ['nao-sei', 'Ainda não sei'],
];

/**
 * Cloudflare Pages Function: POST /api/lead
 *
 * Receives the "sell / buy" request form and e-mails it to the team through Resend.
 * - Nothing is stored: the data only travels to the team's inbox (personal data never goes to Sanity or Git).
 * - Anti-spam: honeypot field + Cloudflare Turnstile (verified here when TURNSTILE_SECRET_KEY is set).
 * - Secrets come ONLY from environment variables (Cloudflare Pages settings, or .env locally):
 *   RESEND_API_KEY, TURNSTILE_SECRET_KEY, LEAD_TO_EMAIL, LEAD_FROM_EMAIL.
 */

interface Env {
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  /** Inbox that receives the requests (the team's e-mail). */
  LEAD_TO_EMAIL?: string;
  /** Sender, on a domain verified in Resend, e.g. "JPP Properties <pedidos@jppproperties.com>". */
  LEAD_FROM_EMAIL?: string;
}

type Intent = 'vender' | 'comprar';

const MAX_FIELD = 2000;

/** Human labels for the e-mail, in the order they should appear. */
const FIELDS: Record<Intent, [key: string, label: string][]> = {
  vender: [
    ['concelho', 'Concelho'],
    ['morada', 'Morada'],
    ['porta', 'Nº da porta'],
    ['codigo_postal', 'Código postal'],
    ['tipologia', 'Tipo de imóvel'],
    ['tipologia_outro', 'Outro tipo (especificado)'],
    ['quartos', 'Quartos'],
    ['casas_de_banho', 'Casas de banho'],
    ['area_util', 'Área útil (m²)'],
    ['area_terreno', 'Área do terreno (m²)'],
    ['ano', 'Ano de construção'],
    ['estado', 'Estado'],
    ['extras', 'Características'],
    ['preco', 'Preço pretendido (€)'],
  ],
  comprar: [
    ['zonas', 'Zonas de interesse'],
    ['tipos', 'Tipo de imóvel'],
    ['quartos_min', 'Quartos (mínimo)'],
    ['orcamento', 'Orçamento máximo (€)'],
    ['financiamento', 'Financiamento'],
  ],
};

const REQUIRED: Record<Intent, string[]> = {
  vender: ['concelho', 'morada', 'porta', 'tipologia', 'area_util'],
  comprar: ['orcamento'],
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

/** Single-line, bounded text (safe for subjects and short fields). */
const clean = (v: FormDataEntryValue | null, max = 200) =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ message: 'Pedido inválido.' }, 400);
  }

  // Bots fill the honeypot; answer "ok" so they learn nothing.
  if (clean(form.get('website'))) return json({ ok: true });

  if (!env.RESEND_API_KEY || !env.LEAD_TO_EMAIL || !env.LEAD_FROM_EMAIL) {
    return json({ message: 'O envio ainda não está configurado.' }, 503);
  }

  const intent: Intent = form.get('intent') === 'comprar' ? 'comprar' : 'vender';
  const name = clean(form.get('name'), 120);
  const email = clean(form.get('email'), 160);
  const phone = clean(form.get('phone'), 40);

  const missing =
    !name ||
    !phone ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ||
    form.get('consent') === null ||
    REQUIRED[intent].some((k) => !clean(form.get(k)));
  if (missing) return json({ message: 'Faltam campos obrigatórios.' }, 400);

  // Turnstile (when configured).
  if (env.TURNSTILE_SECRET_KEY) {
    const token = clean(form.get('cf-turnstile-response'), 2048);
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: request.headers.get('cf-connecting-ip') ?? '',
      }),
    }).then(
      (r) => r.json() as Promise<{ success?: boolean }>,
      () => ({ success: false }),
    );
    if (!check.success)
      return json({ message: 'Não foi possível validar o pedido. Tente novamente.' }, 400);
  }

  const rows: [string, string][] = [
    ['Nome', name],
    ['Telefone', phone],
    ['Email', email],
  ];
  const TIPO: Record<string, string> = {
    apartamento: 'Apartamento',
    moradia: 'Moradia / Vivenda',
    loja: 'Loja',
    predio: 'Prédio',
    terreno: 'Terreno',
    outro: 'Outro',
  };
  for (const [key, label] of FIELDS[intent]) {
    const values = form
      .getAll(key)
      .map((v) => clean(v))
      .filter(Boolean);
    if (values.length)
      rows.push([
        label,
        key === 'tipologia' ? (TIPO[values[0]!] ?? values[0]!) : values.join(', '),
      ]);
  }
  const message =
    typeof form.get('message') === 'string'
      ? String(form.get('message')).trim().slice(0, MAX_FIELD)
      : '';
  if (message) rows.push(['Mensagem', message]);

  const headline =
    intent === 'vender' ? 'Pedido de avaliação (vender)' : 'Pedido de procura (comprar)';
  const where =
    intent === 'vender' ? clean(form.get('concelho'), 60) : clean(form.get('zonas'), 60);
  const subject = `${headline}${where ? ` · ${where}` : ''} · ${name}`.slice(0, 200);

  const text = [headline, '', ...rows.map(([k, v]) => `${k}: ${v}`)].join('\n');
  const html =
    `<h2 style="font-family:sans-serif">${escapeHtml(headline)}</h2>` +
    `<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">` +
    rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 12px 4px 0;color:#555;vertical-align:top">${escapeHtml(k)}</td>` +
          `<td style="padding:4px 0">${escapeHtml(v).replace(/\n/g, '<br>')}</td></tr>`,
      )
      .join('') +
    `</table>`;

  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.LEAD_FROM_EMAIL,
      to: [env.LEAD_TO_EMAIL],
      reply_to: email,
      subject,
      text,
      html,
    }),
  }).catch(() => null);

  if (!sent || !sent.ok)
    return json({ message: 'Não foi possível enviar. Tente novamente dentro de instantes.' }, 502);
  return json({ ok: true });
};

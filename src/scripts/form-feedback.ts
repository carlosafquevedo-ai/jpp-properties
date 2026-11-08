// Form feedback shared by the site's forms (careers application, sell/buy request).
// Each field answers where it is: a plain Portuguese message under it (linked with aria-describedby), a soft red edge
// when wrong, a small lime tick once a filled field is valid. Fields are checked when the visitor leaves them and,
// after a first error, while they type. On submit every field is checked and the first one to fix is brought into
// view with the cursor in it. An optional progress bar counts the required fields that are done.
// Only fields the browser will validate count (controls in a disabled fieldset, e.g. the hidden tab, are skipped).

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const defaultMessage = (el: Field): string => {
  const v = el.validity;
  if (el instanceof HTMLInputElement && el.type === 'file') return 'O ficheiro tem mais de 5 MB. Escolha um ficheiro mais pequeno.';
  if (el instanceof HTMLInputElement && el.type === 'checkbox') return 'Aceite a Política de Privacidade para continuar.';
  if (v.valueMissing) {
    if (el instanceof HTMLSelectElement) return 'Escolha uma opção.';
    if (el.name === 'name') return 'Indique o seu nome.';
    if (el.name === 'phone') return 'Indique um número de telefone.';
    if (el.name === 'email') return 'Indique o seu email.';
    // Otherwise name the field by its label ("Falta preencher: Morada.").
    const label = el.labels?.[0]?.textContent?.replace(/\*|\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
    return label ? `Falta preencher: ${label}.` : 'Preencha este campo.';
  }
  if (el.type === 'email') return 'Confirme o email (ex.: nome@email.com).';
  if (el.type === 'url') return 'Cole o endereço completo (https://…).';
  if (el.type === 'tel') return 'Confirme o número (só algarismos, espaços e +).';
  if (v.rangeUnderflow || v.rangeOverflow) return 'Confirme o valor.';
  if (v.patternMismatch) return 'Confirme o formato.';
  return 'Confirme este campo.';
};

export type FormFeedback = {
  /** Check every field, show the messages and focus the first one to fix. Returns true when all are valid. */
  validateAll: () => boolean;
  /** Recount the progress (call after showing or hiding parts of the form). */
  refresh: () => void;
  /** Clear every message and state (after a reset). */
  clear: () => void;
};

export function initFormFeedback(
  form: HTMLFormElement,
  opts: { progress?: HTMLElement | null; message?: (el: Field) => string | undefined } = {},
): FormFeedback {
  const fields = (): Field[] =>
    [...form.querySelectorAll<Field>('input, select, textarea')].filter(
      (el) => el.type !== 'hidden' && !(el.closest('[aria-hidden="true"]') && el.tabIndex === -1),
    );
  const say = (el: Field) => opts.message?.(el) ?? defaultMessage(el);

  // Telephone numbers: digits, spaces, +, brackets and dashes, at least 9.
  form.querySelectorAll<HTMLInputElement>('input[type="tel"]').forEach((el) => {
    if (!el.pattern) el.pattern = '[+0-9 ()\\-]{9,}';
  });

  const boxOf = (el: Field): Element => el.closest('.cp-file') ?? el;
  const anchorOf = (el: Field): Element =>
    el instanceof HTMLInputElement && el.type === 'checkbox' ? (el.closest('label') ?? el) : boxOf(el);

  const errorFor = (el: Field) => {
    const id = `${el.id || el.name}-erro`;
    let p = document.getElementById(id);
    if (!p) {
      p = document.createElement('p');
      p.id = id;
      p.className = 'form-err';
      anchorOf(el).insertAdjacentElement('afterend', p);
      el.setAttribute('aria-describedby', [el.getAttribute('aria-describedby'), id].filter(Boolean).join(' '));
    }
    return p;
  };

  const check = (el: Field, show: boolean) => {
    const ok = !el.willValidate || el.checkValidity();
    const box = boxOf(el);
    if (show || el.hasAttribute('aria-invalid')) {
      if (ok) el.removeAttribute('aria-invalid');
      else el.setAttribute('aria-invalid', 'true');
      box.classList.toggle('is-invalid', !ok);
      if (!ok || document.getElementById(`${el.id || el.name}-erro`)) errorFor(el).textContent = ok ? '' : say(el);
    }
    const isBox = el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio' || el.type === 'file');
    box.classList.toggle('is-valid', ok && !!el.value && !isBox && el.willValidate);
    return ok;
  };

  // Progress through the required fields.
  const bar = opts.progress;
  const fill = bar?.querySelector<HTMLElement>('[data-progress-fill]');
  const text = bar?.querySelector<HTMLElement>('[data-progress-text]');
  const refresh = () => {
    if (!bar || !fill || !text) return;
    const required = fields().filter((f) => f.required && f.willValidate);
    if (!required.length) return;
    const done = required.filter((f) => f.checkValidity()).length;
    fill.style.transform = `scaleX(${done / required.length})`;
    text.textContent =
      done === required.length ? 'Tudo pronto para enviar' : `${done} de ${required.length} campos obrigatórios`;
    bar.toggleAttribute('data-done', done === required.length);
  };
  if (bar) bar.hidden = false;

  form.addEventListener(
    'blur',
    (e) => {
      const el = e.target as Field;
      if (!(el instanceof HTMLElement) || !('validity' in el)) return;
      if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) return;
      if (el.value || el.hasAttribute('aria-invalid')) check(el, true);
    },
    true,
  );
  form.addEventListener('input', (e) => {
    const el = e.target as Field;
    if ('validity' in el) check(el, false);
    refresh();
  });
  form.addEventListener('change', (e) => {
    const el = e.target as Field;
    if ('validity' in el) {
      const isFile = el instanceof HTMLInputElement && el.type === 'file';
      check(el, isFile || el.hasAttribute('aria-invalid'));
    }
    refresh();
  });

  const validateAll = () => {
    const bad = fields().filter((f) => !check(f, true));
    refresh();
    if (!bad.length) return true;
    const first = bad[0]!;
    // A field inside a closed <details> ("Acrescentar detalhes") opens first.
    first.closest('details')?.setAttribute('open', '');
    const target = first.type === 'file' ? (first.closest('.cp-file') as HTMLElement) : first;
    target.scrollIntoView({
      block: 'center',
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
    first.focus({ preventScroll: true });
    return false;
  };

  const clear = () => {
    form.querySelectorAll('.form-err').forEach((p) => (p.textContent = ''));
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    form.querySelectorAll('.is-invalid, .is-valid').forEach((el) => el.classList.remove('is-invalid', 'is-valid'));
    refresh();
  };

  refresh();
  return { validateAll, refresh, clear };
}

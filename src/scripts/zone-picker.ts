// "Explore por zona" strips: one tall photo strip per zone; the open one widens and shows its count and a link.
// - Fine pointer: hovering a strip opens it, a click goes to that zone's listings.
// - Touch: the first tap on a closed strip opens it, the next tap goes.
// - Keyboard: focusing a strip opens it; arrow keys move; Enter goes.
// Without JS the first strip is open and every strip is a plain link.

export function initZonePicker(list: HTMLElement) {
  const strips = [...list.querySelectorAll<HTMLElement>(':scope > .zone-strip')];
  const links = strips.map((s) => s.querySelector<HTMLAnchorElement>('a')!);
  const n = strips.length;
  if (n < 2) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let current = Math.max(0, strips.findIndex((s) => s.hasAttribute('data-active')));

  const open = (i: number) => {
    i = ((i % n) + n) % n;
    if (i === current) return;
    current = i;
    strips.forEach((s, j) => s.toggleAttribute('data-active', j === i));
  };

  strips.forEach((strip, i) => {
    const link = links[i];
    if (finePointer) strip.addEventListener('pointerenter', () => open(i));
    link.addEventListener('focus', () => open(i));
    link.addEventListener('click', (e) => {
      if (!finePointer && i !== current) {
        e.preventDefault();
        open(i);
      }
    });
  });

  list.addEventListener('keydown', (e) => {
    const step = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key];
    if (!step) return;
    e.preventDefault();
    links[(((current + step) % n) + n) % n].focus();
  });
}

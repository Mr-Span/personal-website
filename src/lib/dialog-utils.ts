/**
 * Progressive light-dismiss fallback for browsers without native <dialog closedby="any">.
 * Tests pointerdown + pointerup coordinates outside dialog bounds so text-selection drags
 * ending on the backdrop do not dismiss accidentally.
 */
export function attachLightDismissFallback(dialog: HTMLDialogElement): () => void {
  if (typeof HTMLDialogElement === 'undefined' || 'closedBy' in HTMLDialogElement.prototype) {
    return () => {};
  }

  const isOutside = (e: PointerEvent): boolean => {
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };

  let pressedOutside = false;
  const onDown = (e: PointerEvent) => {
    pressedOutside = isOutside(e);
  };
  const onUp = (e: PointerEvent) => {
    if (pressedOutside && isOutside(e) && dialog.open) {
      dialog.close();
    }
    pressedOutside = false;
  };

  dialog.addEventListener('pointerdown', onDown);
  dialog.addEventListener('pointerup', onUp);

  return () => {
    dialog.removeEventListener('pointerdown', onDown);
    dialog.removeEventListener('pointerup', onUp);
  };
}

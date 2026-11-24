import { useEffect, useRef } from 'react';
import type { LayoutNode } from '@/lib/diagram-layout';

interface Props {
  node: LayoutNode | null;
  mobileModalOpen: boolean;
  onCloseMobile: () => void;
}

/**
 * Desktop: non-blocking side inspector panel (user keeps selecting nodes in diagram).
 * Mobile (<1024px): native <dialog> via showModal() following MWG dialog guidance
 * (no manual role="dialog"/aria-modal/focus-trap, bounding-rect light-dismiss fallback).
 */
export function InspectorDrawer({ node, mobileModalOpen, onCloseMobile }: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (mobileModalOpen && node) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [mobileModalOpen, node]);

  // Progressive fallback for browsers lacking native closedby="any"
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    let pressedOutside = false;
    const onDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) {
        dialog.close();
      }
    };

    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);
    return () => {
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, []);

  const body = node ? (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded border border-border-strong bg-elevated px-2 py-0.5 font-mono text-xs text-baby">
          {node.stackTag}
        </span>
        {node.metricTag && (
          <span className="font-mono text-xs font-semibold text-coral">{node.metricTag}</span>
        )}
      </div>

      <h3 id="inspector-node-title" className="font-display text-lg font-bold text-ink">
        {node.label}
      </h3>

      <dl className="space-y-3 text-sm">
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-baby">Role</dt>
          <dd className="mt-1 text-muted">{node.inspector.role}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-signal">Data Boundary</dt>
          <dd className="mt-1 text-muted">{node.inspector.dataBoundary}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-ink">Engineering Trade-off</dt>
          <dd className="mt-1 text-muted">{node.inspector.tradeoff}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-coral">Failure / Guardrail Behavior</dt>
          <dd className="mt-1 text-muted">{node.inspector.failureBehavior}</dd>
        </div>
      </dl>
    </div>
  ) : (
    <p className="text-sm text-muted">
      Select any node in the diagram (click or Tab + Enter) to inspect its role, data boundary, engineering trade-offs, and failure handling.
    </p>
  );

  return (
    <>
      {/* Desktop non-blocking side inspector */}
      <aside
        aria-label="Node Architecture Inspector"
        aria-live="polite"
        className="hidden rounded-xl border border-border-subtle bg-elevated/60 p-5 lg:block"
      >
        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted">
          Node Inspector
        </p>
        {body}
      </aside>

      {/* Mobile native modal <dialog> bottom sheet */}
      <dialog
        ref={dialogRef}
        className="inspector-modal lg:hidden"
        aria-labelledby="mobile-inspector-title"
        onClose={() => {
          if (dialogRef.current) dialogRef.current.returnValue = '';
          onCloseMobile();
        }}
        {...({ closedby: 'any' } as Record<string, string>)}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
          <h2 id="mobile-inspector-title" className="font-mono text-xs uppercase tracking-wider text-baby">
            Node Inspector
          </h2>
          <form method="dialog">
            <button
              type="submit"
              autoFocus
              className="inline-flex min-h-[36px] items-center rounded-lg border border-border-strong bg-elevated px-3 text-xs font-semibold text-ink"
            >
              Close
            </button>
          </form>
        </div>
        <div className="overflow-y-auto p-5">{body}</div>
      </dialog>
    </>
  );
}

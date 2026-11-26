import { useEffect, useRef } from 'react';
import type { LayoutNode } from '@/lib/diagram-layout';
import { attachLightDismissFallback } from '@/lib/dialog-utils';

interface Props {
  node: LayoutNode | null;
  mobileModalOpen: boolean;
  onCloseMobile: () => void;
}

/**
 * Desktop: non-blocking side inspector panel.
 * Mobile (<1024px): native <dialog> via showModal() with shared progressive light-dismiss fallback.
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

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    return attachLightDismissFallback(dialog);
  }, []);

  const renderBody = () =>
    node ? (
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline pb-2 font-mono text-xs">
          <span className="font-semibold text-tech">{node.stackTag}</span>
          {node.metricTag && (
            <span className="font-semibold text-vermilion">{node.metricTag}</span>
          )}
        </div>

        <h3 className="font-display text-lg font-semibold text-ink">{node.label}</h3>

        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-tech">Role</dt>
            <dd className="mt-1 text-ink-secondary">{node.inspector.role}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-signal">Data Boundary</dt>
            <dd className="mt-1 text-ink-secondary">{node.inspector.dataBoundary}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-ink">
              Engineering Trade-off
            </dt>
            <dd className="mt-1 text-ink-secondary">{node.inspector.tradeoff}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-vermilion">
              Failure / Guardrail Behavior
            </dt>
            <dd className="mt-1 text-ink-secondary">{node.inspector.failureBehavior}</dd>
          </div>
        </dl>
      </div>
    ) : (
      <p className="text-sm text-ink-secondary">
        Select any node in the diagram (click or Tab + Enter) to inspect its role, data boundary,
        engineering trade-offs, and failure handling.
      </p>
    );

  return (
    <>
      {/* Desktop non-blocking side inspector */}
      <aside
        aria-label="Node Architecture Inspector"
        aria-live="polite"
        className="hidden border border-hairline bg-recessed/70 p-5 lg:block"
      >
        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted">Node Inspector</p>
        {renderBody()}
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
        <div className="flex items-center justify-between border-b border-hairline bg-recessed px-5 py-3">
          <h2
            id="mobile-inspector-title"
            className="font-mono text-xs uppercase tracking-wider text-vermilion"
          >
            Node Inspector
          </h2>
          <form method="dialog">
            <button
              type="submit"
              autoFocus
              className="inline-flex min-h-[36px] items-center rounded-[2px] border border-interactive bg-canvas px-3 font-mono text-xs font-semibold text-ink"
            >
              Close
            </button>
          </form>
        </div>
        <div className="overflow-y-auto p-5">{renderBody()}</div>
      </dialog>
    </>
  );
}

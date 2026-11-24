import type { CompiledArchitectureGraph, LayoutNode } from '@/lib/diagram-layout';

interface Props {
  graph: CompiledArchitectureGraph;
  activeMode: 'nominal' | 'guardrail';
  selectedId: string;
  tracedStepId: string | null;
  onSelect: (node: LayoutNode, openMobileModal: boolean) => void;
}

/**
 * Semantic vertical pipeline rendered below 768px (375px safe, zero horizontal overflow).
 */
export function MobilePipeline({
  graph,
  activeMode,
  selectedId,
  tracedStepId,
  onSelect,
}: Props) {
  const scenarioSteps = new Set(graph.scenarios[activeMode].steps);

  return (
    <ol className="space-y-3 md:hidden" aria-label={`${graph.title} vertical architecture steps`}>
      {graph.nodes.map((node, index) => {
        const isInScenario = scenarioSteps.has(node.id);
        const isSelected = selectedId === node.id;
        const isTraced = tracedStepId === node.id;
        const stageName = graph.stages[node.stage]?.label ?? `Stage ${node.stage + 1}`;

        return (
          <li key={node.id}>
            <button
              type="button"
              onClick={() => onSelect(node, true)}
              aria-pressed={isSelected}
              className={[
                'flex w-full flex-col gap-1.5 rounded-xl border p-4 text-left transition-colors',
                isTraced
                  ? 'border-coral bg-elevated'
                  : isSelected
                    ? 'border-baby bg-elevated'
                    : isInScenario
                      ? 'border-border-strong bg-surface'
                      : 'border-border-subtle bg-surface/50 opacity-60',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-mono text-baby">
                  {String(index + 1).padStart(2, '0')} · {stageName}
                </span>
                <span className="font-mono text-muted">{node.stackTag}</span>
              </div>
              <span className="font-display text-base font-bold text-ink">{node.label}</span>
              <span className="text-xs text-muted">Tap to inspect trade-offs &amp; failure behavior</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

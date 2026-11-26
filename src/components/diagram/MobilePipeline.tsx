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
    <ol className="space-y-2.5 md:hidden" aria-label={`${graph.title} vertical architecture steps`}>
      {graph.nodes.map((node) => {
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
                'flex w-full flex-col gap-1.5 rounded-[2px] border p-3.5 text-left transition-colors',
                isTraced
                  ? 'border-vermilion bg-elevated'
                  : isSelected
                    ? 'border-tech bg-elevated'
                    : isInScenario
                      ? 'border-interactive bg-canvas'
                      : 'border-hairline bg-recessed/70 text-muted',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-2 font-mono text-xs">
                <span className="text-tech">{stageName}</span>
                <span className="text-muted">{node.stackTag}</span>
              </div>
              <span className="font-display text-base font-semibold text-ink">{node.label}</span>
              <span className="text-xs text-muted">
                Tap to inspect trade-offs &amp; failure behavior
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

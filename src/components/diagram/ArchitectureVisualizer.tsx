import { useEffect, useMemo, useRef, useState } from 'react';
import { LazyMotion, domAnimation, m } from 'motion/react';
import type { CompiledArchitectureGraph, LayoutNode } from '@/lib/diagram-layout';
import { useMotionActive } from '@/lib/motion';
import { InspectorDrawer } from './InspectorDrawer';
import { MobilePipeline } from './MobilePipeline';
import { DiagramErrorBoundary } from './DiagramErrorBoundary';

interface Props {
  graph: CompiledArchitectureGraph;
}

function ArchitectureVisualizerInner({ graph }: Props) {
  const containerRef = useRef<HTMLElement | null>(null);
  const { active: motionAllowed, prefersReducedMotion } = useMotionActive(containerRef);

  const [mode, setMode] = useState<'nominal' | 'guardrail'>('nominal');
  const [selectedId, setSelectedId] = useState<string>(graph.nodes[0]?.id ?? '');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [traceIndex, setTraceIndex] = useState<number | null>(null);

  const scenario = graph.scenarios[mode];
  const tracedNodeId = traceIndex !== null ? (scenario.steps[traceIndex] ?? null) : null;
  const focusedId = tracedNodeId ?? hoveredId ?? selectedId;

  // Adjacency set for upstream/downstream highlighting
  const { connectedNodes, connectedEdges } = useMemo(() => {
    const activeEdges = graph.edges.filter((e) => e.mode === 'both' || e.mode === mode);
    const nodesSet = new Set<string>();
    const edgesSet = new Set<string>();
    if (focusedId) {
      nodesSet.add(focusedId);
      for (const edge of activeEdges) {
        if (edge.from === focusedId || edge.to === focusedId) {
          edgesSet.add(edge.id);
          nodesSet.add(edge.from);
          nodesSet.add(edge.to);
        }
      }
    }
    return { connectedNodes: nodesSet, connectedEdges: edgesSet };
  }, [graph.edges, focusedId, mode]);

  // Bounded 2-3s Trace Flow sequencer (discrete highlight steps under prefers-reduced-motion)
  useEffect(() => {
    if (traceIndex === null) return;
    const stepMs = prefersReducedMotion ? 550 : 480;
    const timer = window.setTimeout(() => {
      if (traceIndex + 1 < scenario.steps.length) {
        const nextIdx = traceIndex + 1;
        setTraceIndex(nextIdx);
        setSelectedId(scenario.steps[nextIdx]);
      } else {
        setTraceIndex(null);
      }
    }, stepMs);
    return () => window.clearTimeout(timer);
  }, [traceIndex, scenario.steps, prefersReducedMotion]);

  const selectedNode = useMemo(
    () => graph.nodes.find((n) => n.id === selectedId) ?? graph.nodes[0] ?? null,
    [graph.nodes, selectedId],
  );

  const handleSelect = (node: LayoutNode, openMobileModal: boolean) => {
    setTraceIndex(null);
    setSelectedId(node.id);
    if (openMobileModal) setMobileModalOpen(true);
  };

  const startTrace = () => {
    setSelectedId(scenario.steps[0]);
    setTraceIndex(0);
  };

  return (
    <LazyMotion features={domAnimation}>
      <section
        ref={containerRef}
        className="bento-card p-5 sm:p-6"
        aria-labelledby={`arch-title-${graph.projectSlug}`}
        data-architecture-visualizer
      >
        <div className="flex flex-col gap-4 border-b border-border-subtle pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-baby">
              Interactive System Architecture
            </p>
            <h2
              id={`arch-title-${graph.projectSlug}`}
              className="mt-1 font-display text-xl font-bold text-ink"
            >
              {graph.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Architecture execution scenario"
              className="inline-flex rounded-lg border border-border-strong bg-canvas p-1"
            >
              <button
                type="button"
                aria-pressed={mode === 'nominal'}
                onClick={() => {
                  setTraceIndex(null);
                  setMode('nominal');
                  setSelectedId(graph.scenarios.nominal.steps[0]);
                }}
                className={[
                  'min-h-[36px] rounded-md px-3 text-xs font-semibold transition-colors',
                  mode === 'nominal'
                    ? 'bg-baby text-[var(--accent-on-primary)]'
                    : 'text-muted hover:text-ink',
                ].join(' ')}
              >
                Nominal
              </button>
              <button
                type="button"
                aria-pressed={mode === 'guardrail'}
                onClick={() => {
                  setTraceIndex(null);
                  setMode('guardrail');
                  setSelectedId(graph.scenarios.guardrail.steps[0]);
                }}
                className={[
                  'min-h-[36px] rounded-md px-3 text-xs font-semibold transition-colors',
                  mode === 'guardrail'
                    ? 'bg-coral text-[var(--accent-on-contrast)]'
                    : 'text-muted hover:text-ink',
                ].join(' ')}
              >
                Guardrail / Failure
              </button>
            </div>

            <button
              type="button"
              onClick={startTrace}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-border-strong bg-elevated px-3.5 text-xs font-semibold text-ink transition-colors hover:border-baby hover:text-baby"
            >
              <span aria-hidden="true">&#9654;</span>
              {traceIndex !== null ? 'Tracing...' : 'Trace Flow'}
            </button>
          </div>
        </div>

        <p className="mt-3 text-sm text-muted">
          <strong className="text-ink">{scenario.label}:</strong> {scenario.description}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            {/* Desktop / Tablet Deterministic SVG Diagram */}
            <div className="hidden overflow-x-auto rounded-xl border border-border-subtle bg-canvas/70 p-3 md:block">
              <svg
                viewBox={`0 0 ${graph.viewBoxWidth} ${graph.viewBoxHeight}`}
                className="h-auto w-full min-w-[680px]"
                role="group"
                aria-label={`${graph.title} diagram`}
              >
                {/* Stage column headers */}
                {graph.stages.map((st) => (
                  <g key={st.index}>
                    <text
                      x={st.x + st.width / 2}
                      y={24}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize="11"
                      fontFamily="var(--font-mono)"
                      fontWeight="600"
                    >
                      {String(st.index + 1).padStart(2, '0')} / {st.label.toUpperCase()}
                    </text>
                  </g>
                ))}

                {/* Pre-computed Bezier edges */}
                {graph.edges.map((edge) => {
                  const inMode = edge.mode === 'both' || edge.mode === mode;
                  const isHighlighted = inMode && connectedEdges.has(edge.id);
                  const strokeColor =
                    edge.mode === 'guardrail'
                      ? 'var(--accent-contrast)'
                      : isHighlighted
                        ? 'var(--accent-primary)'
                        : 'var(--border-strong)';

                  return (
                    <g key={edge.id} opacity={inMode ? (isHighlighted ? 1 : 0.45) : 0.14}>
                      <path
                        d={edge.path}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isHighlighted ? 2.4 : 1.5}
                        strokeDasharray={edge.mode === 'guardrail' ? '6 4' : undefined}
                      />
                      {motionAllowed && traceIndex !== null && isHighlighted && (
                        <m.path
                          d={edge.path}
                          fill="none"
                          stroke={edge.mode === 'guardrail' ? 'var(--accent-contrast)' : 'var(--accent-primary-soft)'}
                          strokeWidth={3}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.42, ease: 'easeOut' }}
                        />
                      )}
                      {edge.label && inMode && (
                        <text
                          x={edge.labelX}
                          y={edge.labelY}
                          textAnchor="middle"
                          fill="var(--text-muted)"
                          fontSize="10"
                          fontFamily="var(--font-mono)"
                        >
                          {edge.label}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Semantic accessible nodes */}
                {graph.nodes.map((node) => {
                  const isSelected = selectedId === node.id;
                  const isTraced = tracedNodeId === node.id;
                  const isConnected = connectedNodes.has(node.id);
                  const isActiveNode = isSelected || isTraced;
                  const strokeColor = isTraced
                    ? 'var(--accent-contrast)'
                    : isSelected
                      ? 'var(--accent-primary)'
                      : isConnected
                        ? node.kind === 'guardrail'
                          ? 'var(--accent-contrast)'
                          : 'var(--accent-primary)'
                        : node.kind === 'guardrail'
                          ? 'var(--accent-contrast)'
                          : 'var(--border-strong)';

                  return (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                      <foreignObject
                        x={0}
                        y={0}
                        width={node.width}
                        height={node.height}
                        style={{ overflow: 'visible' }}
                      >
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => handleSelect(node, false)}
                          onMouseEnter={() => setHoveredId(node.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onFocus={() => setHoveredId(node.id)}
                          onBlur={() => setHoveredId(null)}
                          className="flex h-full w-full cursor-pointer flex-col justify-start rounded-xl px-3.5 py-2.5 text-left transition-colors"
                          style={{
                            backgroundColor: isActiveNode
                              ? 'var(--bg-elevated)'
                              : 'var(--bg-surface)',
                            border: `${isActiveNode ? 2 : 1.5}px solid ${strokeColor}`,
                            boxShadow: isActiveNode
                              ? '0 0 0 3px var(--accent-primary-glow)'
                              : undefined,
                          }}
                        >
                          <span
                            className="block font-mono text-[10.5px] font-semibold leading-tight"
                            style={{
                              color:
                                node.kind === 'guardrail'
                                  ? 'var(--accent-contrast)'
                                  : 'var(--accent-primary)',
                            }}
                          >
                            {node.stackTag}
                          </span>
                          <span
                            className="mt-1 block font-display text-[13px] font-bold leading-snug"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {node.label}
                          </span>
                        </button>
                      </foreignObject>
                    </g>
                  );
                })}
              </svg>
              <p className="mt-2 px-1 font-mono text-[11px] text-muted">
                Tip: Click or Tab + Enter on any node to inspect boundaries and trade-offs.
              </p>
            </div>

            {/* Mobile Vertical Pipeline (<768px) */}
            <MobilePipeline
              graph={graph}
              activeMode={mode}
              selectedId={selectedId}
              tracedStepId={tracedNodeId}
              onSelect={handleSelect}
            />
          </div>

          <InspectorDrawer
            node={selectedNode}
            mobileModalOpen={mobileModalOpen}
            onCloseMobile={() => setMobileModalOpen(false)}
          />
        </div>
      </section>
    </LazyMotion>
  );
}

export default function ArchitectureVisualizer({ graph }: Props) {
  return (
    <DiagramErrorBoundary graph={graph}>
      <ArchitectureVisualizerInner graph={graph} />
    </DiagramErrorBoundary>
  );
}

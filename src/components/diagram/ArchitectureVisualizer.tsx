import { useEffect, useMemo, useRef, useState } from 'react';
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
    <section
      ref={containerRef}
      className="hw-panel p-5 sm:p-6"
      aria-labelledby={`arch-title-${graph.projectSlug}`}
      data-architecture-visualizer
    >
      <div className="flex flex-col gap-4 border-b border-hairline pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="hw-eyebrow">
            <span className="px-beacon px-beacon-tech" aria-hidden="true" />
            <span>Interactive System Architecture</span>
          </p>
          <h2
            id={`arch-title-${graph.projectSlug}`}
            className="mt-2 font-display text-xl font-semibold tracking-[-0.025em] text-ink"
          >
            {graph.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            role="group"
            aria-label="Architecture execution scenario"
            className="inline-flex rounded-[10px] border border-strong bg-recessed p-1 shadow-[var(--inner-highlight)]"
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
                'min-h-[34px] rounded-[7px] px-3 font-mono text-xs font-semibold transition-all',
                mode === 'nominal'
                  ? 'bg-tech text-on-accent shadow-[var(--shadow-bevel)]'
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
                'min-h-[34px] rounded-[7px] px-3 font-mono text-xs font-semibold transition-all',
                mode === 'guardrail'
                  ? 'bg-vermilion text-on-accent shadow-[var(--shadow-bevel)]'
                  : 'text-muted hover:text-ink',
              ].join(' ')}
            >
              Guardrail / Failure
            </button>
          </div>

          <button
            type="button"
            onClick={startTrace}
            className="cta-secondary-bevel btn-press font-mono text-xs"
          >
            <span aria-hidden="true">&#9654;</span>
            {traceIndex !== null ? 'Tracing...' : 'Trace Flow'}
          </button>
        </div>
      </div>

      <p className="mt-4 rounded-[10px] border border-hairline bg-recessed/80 px-4 py-2.5 text-sm text-ink-secondary">
        <strong className="font-semibold text-ink">{scenario.label}:</strong> {scenario.description}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] [&_aside]:rounded-[10px] [&_aside]:border-strong [&_aside]:bg-surface [&_aside]:shadow-[var(--shadow-bevel)] [&_dialog_button]:rounded-[8px] [&_ol_button]:rounded-[10px] [&_ol_button]:shadow-[var(--shadow-bevel)]">
        <div>
          {/* Desktop / Tablet Deterministic Orthographic SVG Diagram */}
          <div className="hidden overflow-x-auto rounded-[10px] border border-strong bg-recessed p-3.5 shadow-[var(--inner-highlight)] md:block">
            <svg
              viewBox={`0 0 ${graph.viewBoxWidth} ${graph.viewBoxHeight}`}
              className="h-auto w-full min-w-[680px]"
              role="group"
              aria-label={`${graph.title} diagram`}
            >
              {/* Clean Stage Column Headers (no decorative 01 / numbering) */}
              {graph.stages.map((st) => (
                <g key={st.index}>
                  <text
                    x={st.x + st.width / 2}
                    y={24}
                    textAnchor="middle"
                    fill="var(--ink-muted)"
                    fontSize="11"
                    fontFamily="var(--family-mono)"
                    fontWeight="500"
                  >
                    {st.label.toUpperCase()}
                  </text>
                </g>
              ))}

              {/* Pre-computed Bezier Edges (pure CSS stroke-dashoffset trace) */}
              {graph.edges.map((edge) => {
                const inMode = edge.mode === 'both' || edge.mode === mode;
                const isHighlighted = inMode && connectedEdges.has(edge.id);
                const strokeColor =
                  edge.mode === 'guardrail'
                    ? 'var(--accent-vermilion)'
                    : isHighlighted
                      ? 'var(--accent-tech)'
                      : 'var(--border-interactive)';

                return (
                  <g key={edge.id}>
                    <path
                      d={edge.path}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isHighlighted ? 2.2 : 1.4}
                      strokeDasharray={edge.mode === 'guardrail' ? '6 4' : undefined}
                      opacity={inMode ? (isHighlighted ? 1 : 0.56) : 0.16}
                    />
                    {motionAllowed && traceIndex !== null && isHighlighted && (
                      <path
                        key={`${edge.id}-${traceIndex}`}
                        d={edge.path}
                        fill="none"
                        pathLength={1}
                        stroke={
                          edge.mode === 'guardrail'
                            ? 'var(--accent-vermilion)'
                            : 'var(--accent-tech)'
                        }
                        strokeWidth={2.8}
                        className="arch-trace-path"
                      />
                    )}
                    {edge.label && inMode && (
                      <text
                        x={edge.labelX}
                        y={edge.labelY}
                        textAnchor="middle"
                        fill={isHighlighted ? 'var(--ink-primary)' : 'var(--ink-muted)'}
                        fontSize="11"
                        fontFamily="var(--family-mono)"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Semantic Accessible Nodes (Machined Hardware Geometry) */}
              {graph.nodes.map((node) => {
                const isSelected = selectedId === node.id;
                const isTraced = tracedNodeId === node.id;
                const isConnected = connectedNodes.has(node.id);
                const isActiveNode = isSelected || isTraced;
                const strokeColor = isTraced
                  ? 'var(--accent-vermilion)'
                  : isSelected
                    ? 'var(--accent-tech)'
                    : isConnected
                      ? node.kind === 'guardrail'
                        ? 'var(--accent-vermilion)'
                        : 'var(--accent-tech)'
                      : node.kind === 'guardrail'
                        ? 'var(--accent-vermilion)'
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
                        className="flex h-full w-full cursor-pointer flex-col justify-start rounded-[10px] px-3 py-2 text-left transition-all"
                        style={{
                          backgroundColor: isActiveNode ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                          border: `${isActiveNode ? 2 : 1}px solid ${strokeColor}`,
                          boxShadow: isActiveNode ? 'var(--shadow-card)' : 'var(--shadow-bevel)',
                        }}
                      >
                        <span
                          className="block font-mono text-[11px] font-semibold leading-tight"
                          style={{
                            color:
                              node.kind === 'guardrail'
                                ? 'var(--accent-vermilion)'
                                : 'var(--accent-tech)',
                          }}
                        >
                          {node.stackTag}
                        </span>
                        <span
                          className="mt-1 block font-display text-[13px] font-semibold leading-snug"
                          style={{ color: 'var(--ink-primary)' }}
                        >
                          {node.label}
                        </span>
                      </button>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
            <p className="mt-2.5 px-1 font-mono text-xs text-muted">
              Tip: Click or Tab + Enter on any node to inspect boundaries and trade-offs.
            </p>
          </div>

          {/* Mobile Vertical Pipeline (< 768px) */}
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
  );
}

export default function ArchitectureVisualizer({ graph }: Props) {
  return (
    <DiagramErrorBoundary graph={graph}>
      <ArchitectureVisualizerInner graph={graph} />
    </DiagramErrorBoundary>
  );
}

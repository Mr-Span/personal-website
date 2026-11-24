import React from 'react';
import type { CompiledArchitectureGraph } from '@/lib/diagram-layout';

interface Props {
  graph: CompiledArchitectureGraph;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Isolates interactive SVG island crashes and degrades gracefully to a readable static summary.
 */
export class DiagramErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <section className="bento-card p-5" aria-label={this.props.graph.title}>
        <p className="font-mono text-xs uppercase tracking-wider text-baby">Architecture Summary</p>
        <h3 className="mt-1 font-display text-lg font-bold text-ink">{this.props.graph.title}</h3>
        <ul className="mt-4 space-y-3">
          {this.props.graph.nodes.map((node) => (
            <li key={node.id} className="rounded-lg border border-border-subtle bg-elevated p-3 text-sm">
              <strong className="text-ink">{node.label}</strong> ({node.stackTag}):{' '}
              <span className="text-muted">{node.inspector.role}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }
}

import { describe, expect, it } from 'vitest';
import { compileArchitectureLayout } from '../../src/lib/diagram-layout';
import betfairGraph from '../../src/content/projects/enterprise-agentic-review.architecture.json';
import ragGraph from '../../src/content/projects/electrocasnicu-rag.architecture.json';
import quadyxGraph from '../../src/content/projects/quadyx-autonomy.architecture.json';

describe('compileArchitectureLayout', () => {
  it('compiles all 3 flagship architecture graphs deterministically with valid viewBox & Bezier paths', () => {
    for (const raw of [betfairGraph, ragGraph, quadyxGraph]) {
      const compiled = compileArchitectureLayout(raw);
      expect(compiled.viewBoxWidth).toBeGreaterThan(600);
      expect(compiled.viewBoxHeight).toBeGreaterThan(150);
      expect(compiled.nodes.length).toBe(raw.nodes.length);
      expect(compiled.edges.length).toBe(raw.edges.length);

      // Verify deterministic tab order: stage ascending, then lane ascending
      for (let i = 1; i < compiled.nodes.length; i++) {
        const prev = compiled.nodes[i - 1];
        const curr = compiled.nodes[i];
        expect(curr.stage > prev.stage || (curr.stage === prev.stage && curr.lane > prev.lane)).toBe(
          true,
        );
      }

      for (const edge of compiled.edges) {
        expect(edge.path.startsWith('M ')).toBe(true);
      }
    }
  });

  it('rejects duplicate (stage, lane) cell collisions', () => {
    const colliding = structuredClone(ragGraph);
    colliding.nodes[1].stage = colliding.nodes[0].stage;
    colliding.nodes[1].lane = colliding.nodes[0].lane;
    expect(() => compileArchitectureLayout(colliding)).toThrow(/Grid collision/i);
  });

  it('rejects dangling edge references', () => {
    const broken = structuredClone(ragGraph);
    broken.edges[0].to = 'non-existent-node';
    expect(() => compileArchitectureLayout(broken)).toThrow(/unknown target node/i);
  });

  it('rejects unknown node ids inside scenario steps', () => {
    const broken = structuredClone(ragGraph);
    broken.scenarios.guardrail.steps.push('ghost-node');
    expect(() => compileArchitectureLayout(broken)).toThrow(/unknown node/i);
  });
});

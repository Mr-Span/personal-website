import {
  ArchitectureGraphSchema,
  type ArchitectureEdge,
  type ArchitectureGraph,
  type ArchitectureNode,
} from './architecture.schema';

export interface LayoutNode extends ArchitectureNode {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
}

export interface LayoutEdge extends ArchitectureEdge {
  path: string;
  labelX: number;
  labelY: number;
}

export interface StageColumn {
  index: number;
  label: string;
  x: number;
  width: number;
}

export interface CompiledArchitectureGraph {
  projectSlug: string;
  title: string;
  viewBoxWidth: number;
  viewBoxHeight: number;
  stages: StageColumn[];
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  scenarios: ArchitectureGraph['scenarios'];
}

const NODE_WIDTH = 196;
const NODE_HEIGHT = 86;
const COL_GAP = 118;
const ROW_GAP = 48;
const PAD_X = 28;
const PAD_TOP = 56;
const PAD_BOTTOM = 28;

/**
 * Deterministic build-time SVG layout compiler based on semantic (stage, lane) coordinates.
 * Ships 0 KB of graph-layout engine code to the browser.
 */
export function compileArchitectureLayout(rawGraph: unknown): CompiledArchitectureGraph {
  const graph = ArchitectureGraphSchema.parse(rawGraph);

  const maxLane = Math.max(...graph.nodes.map((n) => n.lane), 0);
  const stageCount = graph.stages.length;

  const viewBoxWidth = PAD_X * 2 + stageCount * NODE_WIDTH + (stageCount - 1) * COL_GAP;
  const viewBoxHeight = PAD_TOP + (maxLane + 1) * NODE_HEIGHT + maxLane * ROW_GAP + PAD_BOTTOM;

  const stages: StageColumn[] = graph.stages.map((label, index) => ({
    index,
    label,
    x: PAD_X + index * (NODE_WIDTH + COL_GAP),
    width: NODE_WIDTH,
  }));

  // Deterministic topological tabbing order: stage ascending, then lane ascending
  const orderedNodes = [...graph.nodes].sort((a, b) =>
    a.stage !== b.stage ? a.stage - b.stage : a.lane - b.lane,
  );

  const nodeMap = new Map<string, LayoutNode>();
  const nodes: LayoutNode[] = orderedNodes.map((node) => {
    const x = PAD_X + node.stage * (NODE_WIDTH + COL_GAP);
    const y = PAD_TOP + node.lane * (NODE_HEIGHT + ROW_GAP);
    const layoutNode: LayoutNode = {
      ...node,
      x,
      y,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      cx: x + NODE_WIDTH / 2,
      cy: y + NODE_HEIGHT / 2,
    };
    nodeMap.set(node.id, layoutNode);
    return layoutNode;
  });

  const edges: LayoutEdge[] = graph.edges.map((edge) => {
    const src = nodeMap.get(edge.from)!;
    const dst = nodeMap.get(edge.to)!;

    let path: string;
    let labelX: number;
    let labelY: number;

    if (dst.stage > src.stage) {
      // Standard left-to-right cubic Bezier curve
      const startX = src.x + src.width;
      const startY = src.cy;
      const endX = dst.x;
      const endY = dst.cy;
      const dx = Math.max(40, (endX - startX) * 0.5);
      path = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;
      labelX = (startX + endX) / 2;
      labelY = (startY + endY) / 2 - 8;
    } else if (dst.stage === src.stage) {
      // Same-stage vertical connector
      const down = dst.lane > src.lane;
      const startX = src.cx;
      const startY = down ? src.y + src.height : src.y;
      const endX = dst.cx;
      const endY = down ? dst.y : dst.y + dst.height;
      path = `M ${startX} ${startY} L ${endX} ${endY}`;
      labelX = startX + 8;
      labelY = (startY + endY) / 2;
    } else {
      // Feedback / retry edge curving gently underneath
      const startX = src.cx;
      const startY = src.y + src.height;
      const endX = dst.cx;
      const endY = dst.y + dst.height;
      const arcY = Math.max(startY, endY) + 28;
      path = `M ${startX} ${startY} C ${startX} ${arcY}, ${endX} ${arcY}, ${endX} ${endY}`;
      labelX = (startX + endX) / 2;
      labelY = arcY - 4;
    }

    return { ...edge, path, labelX, labelY };
  });

  return {
    projectSlug: graph.projectSlug,
    title: graph.title,
    viewBoxWidth,
    viewBoxHeight,
    stages,
    nodes,
    edges,
    scenarios: graph.scenarios,
  };
}

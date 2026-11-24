import { z } from 'zod';

export const ArchitectureNodeKindSchema = z.enum([
  'source',
  'process',
  'agent',
  'guardrail',
  'human',
  'storage',
]);

export const ArchitectureNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  stage: z.number().int().min(0),
  lane: z.number().int().min(0),
  kind: ArchitectureNodeKindSchema,
  stackTag: z.string().min(1),
  metricTag: z.string().min(1).optional(),
  inspector: z.object({
    role: z.string().min(5),
    dataBoundary: z.string().min(5),
    tradeoff: z.string().min(5),
    failureBehavior: z.string().min(5),
  }),
});

export const ArchitectureEdgeSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  label: z.string().min(1).optional(),
  mode: z.enum(['both', 'nominal', 'guardrail']).default('both'),
});

export const ArchitectureScenarioSchema = z.object({
  label: z.string().min(1),
  description: z.string().min(5),
  steps: z.array(z.string().min(1)).min(2),
});

export const ArchitectureGraphSchema = z
  .object({
    projectSlug: z.string().min(1),
    title: z.string().min(1),
    stages: z.array(z.string().min(1)).min(2),
    nodes: z.array(ArchitectureNodeSchema).min(2),
    edges: z.array(ArchitectureEdgeSchema).min(1),
    scenarios: z.object({
      nominal: ArchitectureScenarioSchema,
      guardrail: ArchitectureScenarioSchema,
    }),
  })
  .superRefine((graph, ctx) => {
    const nodeIds = new Set<string>();
    const occupiedCells = new Set<string>();

    graph.nodes.forEach((node, idx) => {
      if (nodeIds.has(node.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['nodes', idx, 'id'],
          message: `Duplicate node id "${node.id}".`,
        });
      }
      nodeIds.add(node.id);

      if (node.stage >= graph.stages.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['nodes', idx, 'stage'],
          message: `Node "${node.id}" stage ${node.stage} exceeds declared stages length (${graph.stages.length}).`,
        });
      }

      const cellKey = `${node.stage}:${node.lane}`;
      if (occupiedCells.has(cellKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['nodes', idx],
          message: `Grid collision at (stage=${node.stage}, lane=${node.lane}) for node "${node.id}".`,
        });
      }
      occupiedCells.add(cellKey);
    });

    graph.edges.forEach((edge, idx) => {
      if (!nodeIds.has(edge.from)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['edges', idx, 'from'],
          message: `Edge "${edge.id}" references unknown source node "${edge.from}".`,
        });
      }
      if (!nodeIds.has(edge.to)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['edges', idx, 'to'],
          message: `Edge "${edge.id}" references unknown target node "${edge.to}".`,
        });
      }
    });

    (['nominal', 'guardrail'] as const).forEach((mode) => {
      graph.scenarios[mode].steps.forEach((stepId, idx) => {
        if (!nodeIds.has(stepId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['scenarios', mode, 'steps', idx],
            message: `Scenario "${mode}" references unknown node "${stepId}".`,
          });
        }
      });
    });
  });

export type ArchitectureGraph = z.infer<typeof ArchitectureGraphSchema>;
export type ArchitectureNode = z.infer<typeof ArchitectureNodeSchema>;
export type ArchitectureEdge = z.infer<typeof ArchitectureEdgeSchema>;

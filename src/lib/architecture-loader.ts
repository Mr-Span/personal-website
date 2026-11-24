import fs from 'node:fs';
import path from 'node:path';
import {
  compileArchitectureLayout,
  type CompiledArchitectureGraph,
} from './diagram-layout';

export function loadCompiledArchitecture(architectureFile: string): CompiledArchitectureGraph {
  const fullPath = path.resolve(process.cwd(), 'src', 'content', 'projects', architectureFile);
  const rawJson = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  return compileArchitectureLayout(rawJson);
}

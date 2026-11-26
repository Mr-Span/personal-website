import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts', 'src/data/resume.schema.ts'],
      exclude: [
        'src/lib/motion.ts',
        'src/lib/kinematic-runtime.ts',
        'src/lib/dialog-utils.ts',
      ],
      thresholds: {
        lines: 85,
        functions: 85,
      },
    },
  },
});

/**
 * test-runner.mjs
 * Thin wrapper that invokes `vitest run` and forwards its exit code.
 * This allows `npm run test` to work as a standard CI gate.
 */
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const result = spawnSync(
  'npx',
  ['vitest', 'run', '--reporter=verbose'],
  {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  }
)

process.exit(result.status ?? 1)

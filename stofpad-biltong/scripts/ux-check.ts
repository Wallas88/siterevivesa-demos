/*
 * ux-check.ts — runs the shared ux-check on Stofpad's build.
 *
 *   npm run build && CHROME_PATH=/path/to/chrome npm run ux-check
 */
import { runUxCheck } from '../../_core/checks/ux/run-ux-check.ts'
import { UX_SETUP } from './check-setup.ts'

await runUxCheck(UX_SETUP)

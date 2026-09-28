/*
 * flow-check.ts — runs the shared "Nothing hops" flow-check on
 * Copperkloof's build, at every audit width, 360 first.
 *
 *   npm run build && CHROME_PATH=/path/to/chrome npm run flow-check
 */
import { runFlowCheck } from '../../_core/checks/flow/run-flow-check.ts'
import { FLOW_SETUP } from './check-setup.ts'

await runFlowCheck(FLOW_SETUP)

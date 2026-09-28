/*
 * RealSiteDifferences.tsx — the short list under the mock sign-in: for
 * each thing the demo does differently, what the real site does and why
 * that keeps the owner safe. It sits below every sign-in control, so it
 * never moves them.
 */
import type { Difference } from './sign-in-words.ts'

interface RealSiteDifferencesProps {
  title: string
  differences: Difference[]
}

function renderDifference(difference: Difference) {
  return (
    <li className="difference" key={difference.here}>
      <span className="difference-here">{difference.here}</span> {difference.real}
    </li>
  )
}

export function RealSiteDifferences({ title, differences }: RealSiteDifferencesProps) {
  return (
    <section className="differences" aria-labelledby="differences-title">
      <h3 className="differences-title" id="differences-title">
        {title}
      </h3>
      <ul className="difference-list">{differences.map(renderDifference)}</ul>
    </section>
  )
}

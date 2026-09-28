/*
 * SwapLabel.tsx — a button label that changes ("Add to website" →
 * "Adding…") without changing the button's width: every label sits in the
 * same grid cell and the widest sets the size; only the shown one is
 * visible (Nothing hops).
 */

interface SwapLabelProps {
  labels: string[]
  shown: number
}

export function SwapLabel({ labels, shown }: SwapLabelProps) {
  function renderLabel(label: string, index: number) {
    return (
      <span key={label} className="swap-label-item" aria-hidden={index !== shown} data-shown={index === shown}>
        {label}
      </span>
    )
  }

  return <span className="swap-label">{labels.map(renderLabel)}</span>
}

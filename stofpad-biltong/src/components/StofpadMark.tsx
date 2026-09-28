/*
 * StofpadMark.tsx — the glowing STOFPAD / Biltong circle mark, drawn once
 * as an SVG symbol (with its glow filter) and used by the header logo and
 * the hero, exactly as the static demo's inline sprite did.
 */

export function StofpadSprite() {
  return (
    <svg className="sprite" width="0" height="0" aria-hidden="true">
      <defs>
        <filter id="stofpad-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <symbol id="stofpad-mark" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="35" fill="none" stroke="#c98a3f" strokeWidth="1.6" opacity=".75" filter="url(#stofpad-glow)" />
          <text x="40" y="37" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="13.5" fontWeight="700" letterSpacing=".5" fill="#f2c98b" filter="url(#stofpad-glow)">
            STOFPAD
          </text>
          <text x="40" y="52" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontSize="11" fill="#e0a862">
            Biltong
          </text>
          <path d="M24 58 Q40 66 56 58" fill="none" stroke="#c98a3f" strokeWidth="1.2" opacity=".8" />
        </symbol>
      </defs>
    </svg>
  )
}

interface StofpadMarkProps {
  className: string
  size: number
  label: string | null
}

// label null: decorative (the brand link already names the shop).
export function StofpadMark({ className, size, label }: StofpadMarkProps) {
  if (label == null) {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
        <use href="#stofpad-mark" />
      </svg>
    )
  }
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 80 80" role="img" aria-label={label}>
      <title>{label}</title>
      <use href="#stofpad-mark" />
    </svg>
  )
}

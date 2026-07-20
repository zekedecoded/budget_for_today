import { useMemo } from 'react'

const COLORS = ['#FFDE00', '#3B4CCA', '#FF1C1C', '#FFFFFF', '#FFD700', '#5B6CDA']
const PIECE_COUNT = 8

export function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, i) => {
        const angle = (i / PIECE_COUNT) * Math.PI * 2 + Math.random() * 0.4
        const distance = 46 + Math.random() * 34
        return {
          cx: Math.cos(angle) * distance,
          cy: Math.sin(angle) * distance - 20,
          cr: (Math.random() - 0.5) * 360,
          color: COLORS[i % COLORS.length],
          size: 5 + Math.round(Math.random() * 4),
          delay: Math.random() * 120,
          rounded: Math.random() > 0.5,
        }
      }),
    [],
  )

  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece absolute"
          style={
            {
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.rounded ? '50%' : '2px',
              animationDelay: p.delay + 'ms',
              '--cx': p.cx + 'px',
              '--cy': p.cy + 'px',
              '--cr': p.cr + 'deg',
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  )
}
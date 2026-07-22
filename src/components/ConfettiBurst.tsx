import { useMemo } from 'react'

const COLORS = ['#D4A843', '#C45B4A', '#5B8C5A', '#E4C06A', '#7AB879']
const PIECE_COUNT = 12

export function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, i) => {
        const angle = (i / PIECE_COUNT) * Math.PI * 2 + Math.random() * 0.4
        const distance = 40 + Math.random() * 40
        return {
          cx: Math.cos(angle) * distance,
          cy: Math.sin(angle) * distance - 15,
          cr: (Math.random() - 0.5) * 360,
          color: COLORS[i % COLORS.length],
          size: 4 + Math.round(Math.random() * 3),
          delay: Math.random() * 120,
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
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay + 'ms',
            '--cx': p.cx + 'px',
            '--cy': p.cy + 'px',
            '--cr': p.cr + 'deg',
          } as React.CSSProperties}
        />
      ))}
    </span>
  )
}

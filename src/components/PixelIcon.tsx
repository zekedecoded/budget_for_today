type IconName =
  | 'home' | 'receipt' | 'trophy' | 'calendar' | 'user'
  | 'star' | 'bolt' | 'fire' | 'gem' | 'redo'
  | 'plus' | 'trash' | 'crown' | 'piggy' | 'warning'
  | 'arrow-left' | 'arrow-right' | 'close' | 'medal'
  | 'download' | 'check' | 'login' | 'user-plus' | 'save'
  | 'logout' | 'coin'

interface PixelIconProps {
  name: IconName
  size?: number
  className?: string
}

const icons: Record<IconName, string> = {
  home: 'M2 8l6-6 6 6M3 7v5a1 1 0 001 1h3v-3h2v3h3a1 1 0 001-1V7',
  receipt: 'M3 2h8l2 2v10a1 1 0 01-1 1H4a1 1 0 01-1-1V2zm2 4h6m-6 2h6m-6 2h4',
  trophy: 'M4 3h6v5a3 3 0 01-6 0V3zm-1 0H2v3a1 1 0 001 1m7-4h1v3a1 1 0 01-1 1M5 11v1a2 2 0 002 2h2a2 2 0 002-2v-1M4 14h6',
  calendar: 'M2 4h10v9H2zM4 2v2m4-2v2M2 7h10',
  user: 'M6 6a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-3 5c0-2 1.5-3 3-3s3 1 3 3v1H3v-1z',
  star: 'M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 9l-3 1.5.5-3.5L1 4.5 4.5 4z',
  bolt: 'M7 1L3 8h3l-1 5 5-7H7l1-5z',
  fire: 'M6 1c0 2-2 3-2 5a3 3 0 006 0c0-2-2-3-2-5-1 1-2 1-2 0zm0 8a1.5 1.5 0 001.5-1.5c0-.8-.7-1-1.5-1.5-.8.5-1.5.7-1.5 1.5A1.5 1.5 0 006 9z',
  gem: 'M3 4l3-2 3 2 3-2v6l-3 2-3-2-3 2V4zm0 0l3 2m3-2l3 2m-9 0l3 2m3-2l3 2',
  redo: 'M8 2a4 4 0 11-4 4M4 2v4h4',
  plus: 'M6 2v8M2 6h8',
  trash: 'M3 3h8l-.5 9a1 1 0 01-1 1h-5a1 1 0 01-1-1L3 3zm2 0V1h2v2m-4 0h6',
  crown: 'M2 10L1 4l3 3 2-3 2 3 2-3 3 3-1 6H2zm0 0v1h8v-1',
  piggy: 'M4 5c0-1.5 1-2 2-2s2 .5 2 2v1h1a1 1 0 011 1v3a2 2 0 01-2 2H4a2 2 0 01-2-2V6a1 1 0 011-1h1V5zm3 1v2m-2-1v3',
  warning: 'M6 1L1 11h10L6 1zm0 3v4m0 1v1',
  'arrow-left': 'M8 2L3 6l5 4M3 6h8',
  'arrow-right': 'M4 2l5 4-5 4M4 6h8',
  close: 'M2 2l8 8m0-8l-8 8',
  medal: 'M5 1a2 2 0 110 4 2 2 0 010-4zm-2 5l-1 5 3-1 3 1-1-5',
  download: 'M6 1v7m-3-3l3 3 3-3M2 10v1h8v-1',
  check: 'M2 5l3 3 5-5',
  login: 'M2 6h6m-3-3v6m3-1l3-2-3-2',
  'user-plus': 'M7 5a2 2 0 100-4 2 2 0 000 4zm-4 5c0-1.5 1.5-3 3-3m4 3v4m-2-2h4',
  save: 'M2 2h6l2 2v7a1 1 0 01-1 1H3a1 1 0 01-1-1V2zm2 8h4v3H4v-3zm2-5a2 2 0 100 4 2 2 0 000-4z',
  logout: 'M4 6H2v4h2m2-4l4-4v12l-4-4m2-4h4m-2 0v4',
  coin: 'M6 1a5 5 0 100 10 5 5 0 000-10zm0 2v6m-2-3h4',
}

export function PixelIcon({ name, size = 16, className = '' }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      <path d={icons[name]} />
    </svg>
  )
}

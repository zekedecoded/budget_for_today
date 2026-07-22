import Avatar from 'boring-avatars'

const FOREST_PALETTE = [
  '#2D4A30',
  '#D4A843',
  '#5B8C5A',
  '#8B6B3D',
  '#1A3A3A',
  '#E8DCC8',
  '#3D6B3C',
  '#A6832F',
]

interface PixelAvatarProps {
  userId: string
  size?: number
  className?: string
}

export function PixelAvatar({ userId, size = 32, className = '' }: PixelAvatarProps) {
  return (
    <Avatar
      size={`${size}px`}
      name={userId}
      variant="beam"
      colors={FOREST_PALETTE}
      square={false}
      className={className}
    />
  )
}

export default function Logo({ variant = 'primary' }) {
  const palette = {
    primary: 'text-primary',
    inverse: 'text-secondary',
  }

  return (
    <span className={`text-2xl font-semibold tracking-wider ${palette[variant] ?? palette.primary}`}>
      KIX
    </span>
  )
}


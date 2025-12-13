const baseClass =
  'inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40'

const variants = {
  primary: `${baseClass} bg-accent text-white shadow-[0_15px_30px_rgba(255,117,24,0.3)] hover:-translate-y-0.5`,
  secondary: `${baseClass} border border-primary/20 text-primary bg-white hover:border-primary hover:-translate-y-0.5`,
  outline: `${baseClass} border border-primary/10 text-primary hover:border-accent/60`,
}

export default function CTAButton({ as = 'button', variant = 'primary', children, className = '', ...rest }) {
  const Component = as
  return (
    <Component className={`${variants[variant] ?? variants.primary} ${className}`} {...rest}>
      {children}
    </Component>
  )
}


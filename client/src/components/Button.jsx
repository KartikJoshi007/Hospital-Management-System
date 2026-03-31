const stylesByVariant = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-200 disabled:bg-blue-300',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-200 disabled:bg-emerald-300',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200 disabled:bg-red-300',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-200 disabled:bg-slate-100',
}

function Button({
  type = 'button',
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2 ${stylesByVariant[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button

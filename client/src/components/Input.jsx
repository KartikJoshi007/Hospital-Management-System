function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  as = 'input',
  options = [],
  ...props
}) {
  const sharedClasses =
    'mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2'
  const dynamicClasses = error
    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
    : 'border-slate-300 focus:border-blue-400 focus:ring-blue-200'

  return (
    <div className="w-full">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${sharedClasses} ${dynamicClasses} min-h-24`}
          {...props}
        />
      ) : as === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`${sharedClasses} ${dynamicClasses}`}
          {...props}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${sharedClasses} ${dynamicClasses}`}
          {...props}
        />
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default Input

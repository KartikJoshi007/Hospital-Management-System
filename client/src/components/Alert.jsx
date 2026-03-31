function Alert({ type = 'success', message, onClose }) {
  if (!message) return null

  const classByType = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-red-200 bg-red-50 text-red-800',
  }

  return (
    <div
      className={`mb-4 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${classByType[type]}`}
    >
      <span>{message}</span>
      <button type="button" onClick={onClose} className="ml-4 font-semibold">
        x
      </button>
    </div>
  )
}

export default Alert

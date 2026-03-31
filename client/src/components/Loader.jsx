function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
      <span className="ml-2 text-sm text-slate-600">{label}</span>
    </div>
  )
}

export default Loader

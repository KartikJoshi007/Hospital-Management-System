import { useCallback, useState } from 'react'

const useApi = (apiFn) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const execute = useCallback(
    async (...args) => {
      setLoading(true)
      setError('')
      try {
        const result = await apiFn(...args)
        return result
      } catch (err) {
        setError(err.message || 'Failed to process request')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [apiFn],
  )

  const clearError = useCallback(() => setError(''), [])

  return { execute, loading, error, clearError }
}

export default useApi

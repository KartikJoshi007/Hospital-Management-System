import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../modules/auth/authApi'

const useAuth = () => {
  const navigate = useNavigate()

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null
    } catch {
      return null
    }
  }

  const [user, setUser] = useState(getUser)

  const login = useCallback((userData) => {
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } catch {
      // clear locally even if API fails
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }, [navigate])

  const isAuthenticated = Boolean(localStorage.getItem('token'))
  const role = user?.role || null

  return { user, role, isAuthenticated, login, logout }
}

export default useAuth

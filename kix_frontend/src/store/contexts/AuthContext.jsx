import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { setToken, apiRequest } from '../../services/api/client'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          const response = await apiRequest('/auth/me')
          if (response.success) {
            setUser(response.data.user)
            setIsAuthenticated(true)
          }
        } catch (error) {
          // Token invalid, clear it
          setToken(null)
          setIsAuthenticated(false)
          setUser(null)
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const login = (token, userData) => {
    setToken(token)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    // Call logout endpoint
    apiRequest('/auth/logout', { method: 'POST' }).catch(() => {
      // Ignore errors on logout
    })
  }

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }))
  }

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [isAuthenticated, user, isLoading],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


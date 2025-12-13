const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5050/api'

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('authToken')
}

// Set token in localStorage
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token)
  } else {
    localStorage.removeItem('authToken')
  }
}

// Get auth headers
const getAuthHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers ?? {}),
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    setToken(null)
    // Only redirect if not already on auth pages
    const isAuthPage = window.location.pathname.includes('/auth/')
    if (!isAuthPage) {
      window.location.href = '/auth/sign-in'
    }
    throw new Error('Authentication required')
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `API request failed with status ${response.status}`)
  }

  return response.json()
}


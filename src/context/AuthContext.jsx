import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('pawsy_user')
    return stored ? JSON.parse(stored) : null
  })

  const signup = useCallback((email, name) => {
    const newUser = {
      id: crypto.randomUUID(),
      email,
      name,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('pawsy_user', JSON.stringify(newUser))
    setUser(newUser)
    return newUser
  }, [])

  const login = useCallback((email) => {
    const stored = localStorage.getItem('pawsy_user')
    if (stored) {
      const user = JSON.parse(stored)
      if (user.email === email) {
        setUser(user)
        return user
      }
    }
    throw new Error('User not found')
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('pawsy_user')
    setUser(null)
  }, [])

  const value = {
    user,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
  }

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

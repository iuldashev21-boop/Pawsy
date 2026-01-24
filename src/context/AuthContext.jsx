import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const AuthContext = createContext(null)

// Helper to get all registered users
const getStoredUsers = () => {
  const stored = localStorage.getItem('pawsy_users')
  return stored ? JSON.parse(stored) : {}
}

// Helper to save users registry
const saveUsersRegistry = (users) => {
  localStorage.setItem('pawsy_users', JSON.stringify(users))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('pawsy_current_user')
    return stored ? JSON.parse(stored) : null
  })

  const signup = useCallback((email, name) => {
    const users = getStoredUsers()

    // Check if email already exists
    if (users[email]) {
      throw new Error('Email already registered')
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      name,
      createdAt: new Date().toISOString(),
    }

    // Add to users registry (keyed by email for easy lookup)
    users[email] = newUser
    saveUsersRegistry(users)

    // Set as current user
    localStorage.setItem('pawsy_current_user', JSON.stringify(newUser))
    setUser(newUser)

    return newUser
  }, [])

  const login = useCallback((email) => {
    const users = getStoredUsers()
    const foundUser = users[email]

    if (!foundUser) {
      throw new Error('User not found')
    }

    // Set as current user
    localStorage.setItem('pawsy_current_user', JSON.stringify(foundUser))
    setUser(foundUser)

    return foundUser
  }, [])

  const logout = useCallback(() => {
    // Only clear the current session, NOT the user's data
    localStorage.removeItem('pawsy_current_user')
    setUser(null)
  }, [])

  // Helper to get storage key with user prefix
  const getUserStorageKey = useCallback((key) => {
    if (!user) return null
    return `pawsy_${user.id}_${key}`
  }, [user])

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
    getUserStorageKey,
  }), [user, signup, login, logout, getUserStorageKey])

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

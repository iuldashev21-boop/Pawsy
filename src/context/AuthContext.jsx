import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { generateUUID } from '../utils/uuid'

const AuthContext = createContext(null)

const USERS_KEY = 'pawsy_users'
const CURRENT_USER_KEY = 'pawsy_current_user'

const getStoredUsers = () => {
  const stored = localStorage.getItem(USERS_KEY)
  return stored ? JSON.parse(stored) : {}
}

const saveUsersRegistry = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

const persistCurrentUser = (userData) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(CURRENT_USER_KEY)
    return stored ? JSON.parse(stored) : null
  })

  const setCurrentUser = useCallback((userData) => {
    persistCurrentUser(userData)
    setUser(userData)
    return userData
  }, [])

  const createUser = (email, name) => ({
    id: generateUUID(),
    email,
    name,
    createdAt: new Date().toISOString(),
  })

  const signup = useCallback((email, name, autoLogin = false) => {
    const users = getStoredUsers()

    if (users[email]) {
      if (autoLogin) return setCurrentUser(users[email])
      throw new Error('Email already registered')
    }

    const newUser = createUser(email, name)
    users[email] = newUser
    saveUsersRegistry(users)
    return setCurrentUser(newUser)
  }, [setCurrentUser])

  const login = useCallback((email, autoCreate = false) => {
    const users = getStoredUsers()
    let foundUser = users[email]

    if (!foundUser && autoCreate) {
      const provider = email.split('@')[1]?.split('.')[0] || 'User'
      const name = provider.charAt(0).toUpperCase() + provider.slice(1) + ' User'
      foundUser = createUser(email, name)
      users[email] = foundUser
      saveUsersRegistry(users)
    }

    if (!foundUser) throw new Error('User not found')

    return setCurrentUser(foundUser)
  }, [setCurrentUser])

  const logout = useCallback(() => {
    localStorage.removeItem(CURRENT_USER_KEY)
    setUser(null)
  }, [])

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

// eslint-disable-next-line react-refresh/only-export-components -- Standard React Context pattern
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const UserAuthContext = createContext(null)

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    if (token) {
      axios.get('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } })
        .then(({ data }) => setUser(data))
        .catch(() => localStorage.removeItem('userToken'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (username, password) => {
    const { data } = await axios.post('/api/auth/login', { username, password })
    if (data.token) localStorage.setItem('userToken', data.token)
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (form) => {
    const { data } = await axios.post('/api/auth/register', form)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('userToken')
    setUser(null)
  }, [])

  return (
    <UserAuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </UserAuthContext.Provider>
  )
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext)
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider')
  return ctx
}

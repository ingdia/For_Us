"use client"

import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem("@user")
      if (userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error("Error checking auth state:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      // Check if user exists
      const users = await AsyncStorage.getItem("@users")
      const userList = users ? JSON.parse(users) : []

      const foundUser = userList.find((u) => u.email === email && u.password === password)

      if (foundUser) {
        const userData = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
          department: foundUser.department,
        }

        setUser(userData)
        await AsyncStorage.setItem("@user", JSON.stringify(userData))
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (email, password, name, role = "user") => {
    try {
      const users = await AsyncStorage.getItem("@users")
      const userList = users ? JSON.parse(users) : []

      // Check if user already exists
      if (userList.find((u) => u.email === email)) {
        return false
      }

      // Determine role based on email
      let userRole = role
      if (email.toLowerCase().includes("admin")) {
        userRole = "superAdmin"
      } else if (email.toLowerCase().includes("staff") || email.toLowerCase().includes("department")) {
        userRole = "staff"
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        role: userRole,
        createdAt: new Date().toISOString(),
      }

      userList.push(newUser)
      await AsyncStorage.setItem("@users", JSON.stringify(userList))

      const userData = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      }

      setUser(userData)
      await AsyncStorage.setItem("@user", JSON.stringify(userData))

      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("@user")
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

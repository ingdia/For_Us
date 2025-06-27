"use client"

import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

const lightTheme = {
  primary: "#e4d8c8",
  background: "#ffffff",
  surface: "#f5f5f5",
  text: "#333333",
  textSecondary: "#666666",
  border: "#e0e0e0",
  accent: "#e4d8c8",
}

const darkTheme = {
  primary: "#e4d8c8",
  background: "#121212",
  surface: "#1e1e1e",
  text: "#ffffff",
  textSecondary: "#cccccc",
  border: "#333333",
  accent: "#666666",
}

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    loadTheme()
  }, [])

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("@theme")
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme))
      }
    } catch (error) {
      console.error("Error loading theme:", error)
    }
  }

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode
      setIsDarkMode(newTheme)
      await AsyncStorage.setItem("@theme", JSON.stringify(newTheme))
    } catch (error) {
      console.error("Error saving theme:", error)
    }
  }

  const colors = isDarkMode ? darkTheme : lightTheme

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

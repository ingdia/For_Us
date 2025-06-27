"use client"

import Toast from "react-native-toast-message"
import { useTheme } from "../context/ThemeContext"

export const useToast = () => {
  const { isDarkMode } = useTheme()

  const showSuccess = (title, message = "") => {
    Toast.show({
      type: "success",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 60,
      props: { isDarkMode },
    })
  }

  const showError = (title, message = "") => {
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 60,
      props: { isDarkMode },
    })
  }

  const showInfo = (title, message = "") => {
    Toast.show({
      type: "info",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 60,
      props: { isDarkMode },
    })
  }

  const showWarning = (title, message = "") => {
    Toast.show({
      type: "warning",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 3500,
      autoHide: true,
      topOffset: 60,
      props: { isDarkMode },
    })
  }

  const hideToast = () => {
    Toast.hide()
  }

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hideToast,
  }
}

"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import { useLocalization } from "../context/LocalizationContext"
import { useToast } from "../hooks/useToast"

const RegisterScreen = ({ navigation }) => {
  const { colors } = useTheme()
  const { register } = useAuth()
  const { t, currentLanguage, changeLanguage } = useLocalization()
  const { showSuccess, showError, showInfo } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "en" ? "rw" : "en"
    changeLanguage(newLanguage)
  }

  const getDepartmentFromEmail = (email) => {
    const emailLower = email.toLowerCase()

    if (emailLower.includes("sanitation") || emailLower.includes("isuku")) {
      return "Sanitation"
    } else if (emailLower.includes("police") || emailLower.includes("polisi")) {
      return "Police"
    } else if (
      emailLower.includes("electricity") ||
      emailLower.includes("amashanyarazi") ||
      emailLower.includes("power")
    ) {
      return "Electricity"
    } else if (emailLower.includes("roads") || emailLower.includes("imihanda") || emailLower.includes("road")) {
      return "Roads"
    } else if (emailLower.includes("water") || emailLower.includes("amazi")) {
      return "Water"
    }

    return null
  }

  const getAccountTypePreview = () => {
    if (!email) return null

    const emailLower = email.toLowerCase()
    const department = getDepartmentFromEmail(email)

    if (emailLower.includes("admin")) {
      return {
        type: "Super Admin",
        description: "Full system access and management",
        icon: "shield-checkmark",
        color: "#9c27b0",
      }
    } else if (department) {
      return {
        type: `${department} Staff`,
        description: `Manage ${department.toLowerCase()} department reports`,
        icon: "person-add",
        color: "#2196f3",
      }
    } else if (emailLower.includes("staff") || emailLower.includes("department")) {
      return {
        type: "General Staff",
        description: "Department staff access",
        icon: "person-add",
        color: "#2196f3",
      }
    } else {
      return {
        type: "Citizen",
        description: "Create and track reports",
        icon: "person",
        color: "#4caf50",
      }
    }
  }

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      showError(t("missingInfo"), t("fillAllFields"))
      return
    }

    if (password !== confirmPassword) {
      showError(t("error"), t("passwordsDoNotMatch"))
      return
    }

    if (password.length < 6) {
      showError(t("error"), t("passwordTooShort"))
      return
    }

    setLoading(true)
    showInfo(t("creatingAccount"), t("pleaseWait"))

    const success = await register(email, password, name)
    setLoading(false)

    if (success) {
      showSuccess(t("registrationSuccessful"), t("accountCreated"))

      // Check user role and navigate accordingly
      setTimeout(() => {
        if (email.toLowerCase().includes("admin")) {
          navigation.replace("SuperAdminDashboard")
        } else if (getDepartmentFromEmail(email) || email.toLowerCase().includes("staff")) {
          navigation.replace("StaffDashboard")
        } else {
          navigation.replace("UserDashboard")
        }
      }, 1500)
    } else {
      showError(t("registrationFailed"), t("emailAlreadyExists"))
    }
  }

  const accountPreview = getAccountTypePreview()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 40,
      marginBottom: 40,
    },
    backButton: {
      marginRight: 15,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      flex: 1,
    },
    languageButton: {
      padding: 8,
      backgroundColor: colors.surface,
      borderRadius: 15,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    languageText: {
      fontSize: 12,
      color: colors.text,
      fontWeight: "600",
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    passwordInput: {
      flex: 1,
      padding: 15,
      fontSize: 16,
      color: colors.text,
    },
    eyeButton: {
      padding: 15,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 20,
    },
    buttonText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
    },
    loginLink: {
      textAlign: "center",
      marginTop: 20,
      color: colors.textSecondary,
    },
    loginLinkText: {
      color: colors.primary,
      fontWeight: "600",
    },
    roleHint: {
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
    },
    roleHintTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 5,
    },
    roleHintText: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
    },
    accountPreview: {
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
      borderLeftWidth: 4,
    },
    previewHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },
    previewTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.text,
      marginLeft: 10,
    },
    previewDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 34,
    },
    disabledButton: {
      opacity: 0.6,
    },
    departmentExamples: {
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
    },
    exampleTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 10,
    },
    exampleItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    exampleText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 10,
      flex: 1,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("register")}</Text>
        <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
          <Ionicons name="language" size={16} color={colors.text} />
          <Text style={styles.languageText}>{currentLanguage === "en" ? "RW" : "EN"}</Text>
        </TouchableOpacity>
      </View>

   
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t("fullName")}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t("enterFullName")}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t("email")}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder={t("enterEmail")}
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* {accountPreview && (
        <View style={[styles.accountPreview, { borderLeftColor: accountPreview.color }]}>
          <View style={styles.previewHeader}>
            <Ionicons name={accountPreview.icon} size={20} color={accountPreview.color} />
            <Text style={styles.previewTitle}>Account Type: {accountPreview.type}</Text>
          </View>
          <Text style={styles.previewDescription}>{accountPreview.description}</Text>
        </View>
      )} */}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t("password")}</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder={t("enterPassword")}
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t("confirmPassword")}</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t("confirmYourPassword")}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={!showPassword}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? t("creatingAccount") : t("register")}</Text>
      </TouchableOpacity>

      <Text style={styles.loginLink}>
        {t("alreadyHaveAccount")}{" "}
        <Text style={styles.loginLinkText} onPress={() => navigation.navigate("Login")}>
          {t("login")}
        </Text>
      </Text>
    </SafeAreaView>
  )
}

export default RegisterScreen

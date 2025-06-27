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
        } else if (email.toLowerCase().includes("staff") || email.toLowerCase().includes("department")) {
          navigation.replace("StaffDashboard")
        } else {
          navigation.replace("UserDashboard")
        }
      }, 1500)
    } else {
      showError(t("registrationFailed"), t("emailAlreadyExists"))
    }
  }

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
    disabledButton: {
      opacity: 0.6,
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

      <View style={styles.roleHint}>
        <Text style={styles.roleHintTitle}>{t("accountTypes")}</Text>
        <Text style={styles.roleHintText}>{t("accountTypesDesc")}</Text>
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

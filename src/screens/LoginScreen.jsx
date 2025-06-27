"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import { useLocalization } from "../context/LocalizationContext"
import { useToast } from "../hooks/useToast"
import AsyncStorage from "@react-native-async-storage/async-storage"

const LoginScreen = ({ navigation }) => {
  const { colors } = useTheme()
  const { login } = useAuth()
  const { t } = useLocalization()
  const { showSuccess, showError, showInfo } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      showError(t("missingInfo"), t("fillAllFields"))
      return
    }

    setLoading(true)
    showInfo(t("loggingInMsg"), t("verifyingCredentials"))

    const success = await login(email, password)
    setLoading(false)

    if (success) {
      const userData = await AsyncStorage.getItem("@user")
      if (userData) {
        const user = JSON.parse(userData)
        showSuccess(t("welcomeBackMsg"), t("loginSuccessful").replace("{name}", user.name))

        // Navigate based on role
        setTimeout(() => {
          switch (user.role) {
            case "user":
              navigation.replace("UserDashboard")
              break
            case "staff":
              navigation.replace("StaffDashboard")
              break
            case "superAdmin":
              navigation.replace("SuperAdminDashboard")
              break
          }
        }, 1000)
      }
    } else {
      showError(t("loginFailed"), t("invalidCredentials"))
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
    registerLink: {
      textAlign: "center",
      marginTop: 20,
      color: colors.textSecondary,
    },
    registerLinkText: {
      color: colors.primary,
      fontWeight: "600",
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("login")}</Text>
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

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? t("loggingIn") : t("login")}</Text>
      </TouchableOpacity>

      <Text style={styles.registerLink}>
        {t("dontHaveAccount")}{" "}
        <Text style={styles.registerLinkText} onPress={() => navigation.navigate("Register")}>
          {t("registerHere")}
        </Text>
      </Text>
    </SafeAreaView>
  )
}

export default LoginScreen

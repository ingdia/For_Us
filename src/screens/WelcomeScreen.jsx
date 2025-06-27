"use client"
import { Text, TouchableOpacity, StyleSheet, SafeAreaView, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useLocalization } from "../context/LocalizationContext"

const WelcomeScreen = ({ navigation }) => {
  const { colors, isDarkMode, toggleTheme } = useTheme()
  const { t, currentLanguage, changeLanguage } = useLocalization()

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "en" ? "rw" : "en"
    changeLanguage(newLanguage)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    topControls: {
      position: "absolute",
      top: 50,
      right: 20,
      flexDirection: "row",
      gap: 15,
    },
    controlButton: {
      padding: 10,
      backgroundColor: colors.surface,
      borderRadius: 20,
    },
    icon: {
      fontSize: 80,
      color: colors.primary,
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 50,
      lineHeight: 24,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 25,
      marginBottom: 15,
      width: "80%",
      alignItems: "center",
    },
    buttonText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
    },
    loginButton: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: colors.primary,
    },
    loginButtonText: {
      color: colors.primary,
    },
    languageText: {
      fontSize: 12,
      color: colors.text,
      marginTop: 5,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleLanguage}>
          <Ionicons name="language" size={20} color={colors.text} />
          <Text style={styles.languageText}>{currentLanguage === "en" ? "RW" : "EN"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleTheme}>
          <Ionicons name={isDarkMode ? "sunny" : "moon"} size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Ionicons name="megaphone" style={styles.icon} />

      <Text style={styles.title}>{t("appTitle")}</Text>
      <Text style={styles.subtitle}>{t("appSubtitle")}</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Register")}>
        <Text style={styles.buttonText}>{t("getStarted")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={() => navigation.navigate("Login")}>
        <Text style={[styles.buttonText, styles.loginButtonText]}>{t("alreadyHaveAccount")}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default WelcomeScreen

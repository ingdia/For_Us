import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export const toastConfig = {
  success: ({ text1, text2, props }) => (
    <View style={[styles.toastContainer, styles.successToast, props?.isDarkMode && styles.darkToast]}>
      <View style={styles.toastContent}>
        <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
        <View style={styles.textContainer}>
          <Text style={[styles.toastTitle, props?.isDarkMode && styles.darkText]}>{text1}</Text>
          {text2 && <Text style={[styles.toastMessage, props?.isDarkMode && styles.darkSubText]}>{text2}</Text>}
        </View>
      </View>
    </View>
  ),

  error: ({ text1, text2, props }) => (
    <View style={[styles.toastContainer, styles.errorToast, props?.isDarkMode && styles.darkToast]}>
      <View style={styles.toastContent}>
        <Ionicons name="close-circle" size={24} color="#ff4444" />
        <View style={styles.textContainer}>
          <Text style={[styles.toastTitle, props?.isDarkMode && styles.darkText]}>{text1}</Text>
          {text2 && <Text style={[styles.toastMessage, props?.isDarkMode && styles.darkSubText]}>{text2}</Text>}
        </View>
      </View>
    </View>
  ),

  info: ({ text1, text2, props }) => (
    <View style={[styles.toastContainer, styles.infoToast, props?.isDarkMode && styles.darkToast]}>
      <View style={styles.toastContent}>
        <Ionicons name="information-circle" size={24} color="#2196f3" />
        <View style={styles.textContainer}>
          <Text style={[styles.toastTitle, props?.isDarkMode && styles.darkText]}>{text1}</Text>
          {text2 && <Text style={[styles.toastMessage, props?.isDarkMode && styles.darkSubText]}>{text2}</Text>}
        </View>
      </View>
    </View>
  ),

  warning: ({ text1, text2, props }) => (
    <View style={[styles.toastContainer, styles.warningToast, props?.isDarkMode && styles.darkToast]}>
      <View style={styles.toastContent}>
        <Ionicons name="warning" size={24} color="#ffa500" />
        <View style={styles.textContainer}>
          <Text style={[styles.toastTitle, props?.isDarkMode && styles.darkText]}>{text1}</Text>
          {text2 && <Text style={[styles.toastMessage, props?.isDarkMode && styles.darkSubText]}>{text2}</Text>}
        </View>
      </View>
    </View>
  ),
}

const styles = StyleSheet.create({
  toastContainer: {
    width: "90%",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  successToast: {
    backgroundColor: "#f0f9f0",
    borderLeftWidth: 4,
    borderLeftColor: "#4caf50",
  },
  errorToast: {
    backgroundColor: "#fef5f5",
    borderLeftWidth: 4,
    borderLeftColor: "#ff4444",
  },
  infoToast: {
    backgroundColor: "#f0f8ff",
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  warningToast: {
    backgroundColor: "#fffaf0",
    borderLeftWidth: 4,
    borderLeftColor: "#ffa500",
  },
  darkToast: {
    backgroundColor: "#2a2a2a",
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 18,
  },
  darkText: {
    color: "#ffffff",
  },
  darkSubText: {
    color: "#cccccc",
  },
})

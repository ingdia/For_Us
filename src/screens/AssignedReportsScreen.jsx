"use client"

import { View, Text, StyleSheet } from "react-native"
import { useTheme } from "../context/ThemeContext"

const AssignedReportsScreen = () => {
  const { colors } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>Assigned Reports Screen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
  },
})

export default AssignedReportsScreen

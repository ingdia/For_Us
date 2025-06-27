"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import AsyncStorage from "@react-native-async-storage/async-storage"

const StaffDashboard = ({ navigation }) => {
  const { colors, toggleTheme, isDarkMode } = useTheme()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("home")
  const [assignedReports, setAssignedReports] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
  })

  useEffect(() => {
    loadAssignedReports()
  }, [])

  const loadAssignedReports = async () => {
    try {
      const assignedData = await AsyncStorage.getItem("@assignedReports")
      if (assignedData) {
        const allAssigned = JSON.parse(assignedData)
        const myReports = allAssigned.filter((report) => report.assignedTo === user?.id)
        setAssignedReports(myReports)

        const stats = {
          total: myReports.length,
          inProgress: myReports.filter((r) => r.status === "In Progress").length,
          completed: myReports.filter((r) => r.status === "Resolved").length,
        }
        setStats(stats)
      }
    } catch (error) {
      console.error("Error loading assigned reports:", error)
    }
  }

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      // Update assigned reports
      const assignedData = await AsyncStorage.getItem("@assignedReports")
      if (assignedData) {
        const assignedReports = JSON.parse(assignedData)
        const updatedAssigned = assignedReports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus, updatedAt: new Date().toISOString() } : report,
        )
        await AsyncStorage.setItem("@assignedReports", JSON.stringify(updatedAssigned))
      }

      // Update all reports (preserving all data)
      const allReportsData = await AsyncStorage.getItem("@allReports")
      if (allReportsData) {
        const allReports = JSON.parse(allReportsData)
        const updatedAll = allReports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus, updatedAt: new Date().toISOString() } : report,
        )
        await AsyncStorage.setItem("@allReports", JSON.stringify(updatedAll))
      }

      // Update user reports (preserving all data)
      const reportsData = await AsyncStorage.getItem("@reports")
      if (reportsData) {
        const reports = JSON.parse(reportsData)
        const updatedReports = reports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus, updatedAt: new Date().toISOString() } : report,
        )
        await AsyncStorage.setItem("@reports", JSON.stringify(updatedReports))
      }

      // Update master reports (preserving all data)
      const masterReportsData = await AsyncStorage.getItem("@masterReports")
      if (masterReportsData) {
        const masterReports = JSON.parse(masterReportsData)
        const updatedMasterReports = masterReports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus, updatedAt: new Date().toISOString() } : report,
        )
        await AsyncStorage.setItem("@masterReports", JSON.stringify(updatedMasterReports))
      }

      loadAssignedReports()
      Alert.alert("Success", "Report status updated successfully!")
    } catch (error) {
      console.error("Error updating report status:", error)
      Alert.alert("Error", "Failed to update report status")
    }
  }

  const handleLogout = async () => {
    await logout()
    navigation.replace("Welcome")
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#ff4444"
      case "Medium":
        return "#ffa500"
      case "Low":
        return "#4caf50"
      default:
        return colors.textSecondary
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#ffa500"
      case "In Progress":
        return "#2196f3"
      case "Resolved":
        return "#4caf50"
      default:
        return colors.textSecondary
    }
  }

  const renderHome = () => (
    <ScrollView style={styles.content}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
        <Text style={styles.welcomeSubtext}>Department Staff Dashboard</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Assigned Reports</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab("reports")}>
          <Ionicons name="document-text" size={20} color={colors.primary} />
          <Text style={styles.actionText}>View Assigned Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={loadAssignedReports}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Refresh Reports</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )

  const renderReports = () => (
    <ScrollView style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assigned Reports</Text>
        <TouchableOpacity onPress={loadAssignedReports}>
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {assignedReports.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No assigned reports</Text>
          <Text style={styles.emptySubtext}>Reports will appear here when assigned by admin</Text>
        </View>
      ) : (
        assignedReports.map((report) => (
          <View key={report.id} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportTitle}>{report.category}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) }]}>
                <Text style={styles.badgeText}>{report.priority}</Text>
              </View>
            </View>

            <Text style={styles.reportDescription}>{report.description}</Text>
            <Text style={styles.reportUser}>Reported by: {report.userName}</Text>

            {/* Display image if available */}
            {report.image && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: report.image.uri }} style={styles.reportImage} />
                <Text style={styles.imageCaption}>📷 Evidence Photo</Text>
              </View>
            )}

            <View style={styles.reportInfo}>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={14} color={colors.textSecondary} />
                <Text style={styles.reportLocation}>{report.location}</Text>
              </View>
              <Text style={styles.reportDate}>{new Date(report.createdAt).toLocaleDateString()}</Text>
            </View>

            {/* Show coordinates if available */}
            {report.coordinates && (
              <View style={styles.coordinatesContainer}>
                <Ionicons name="navigate" size={12} color={colors.textSecondary} />
                <Text style={styles.coordinatesText}>
                  GPS: {report.coordinates.latitude.toFixed(6)}, {report.coordinates.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            <View style={styles.reportFooter}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                <Text style={styles.statusText}>{report.status}</Text>
              </View>

              <View style={styles.actionButtons}>
                {report.status === "Pending" && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#2196f3" }]}
                    onPress={() => updateReportStatus(report.id, "In Progress")}
                  >
                    <Text style={styles.actionBtnText}>Start</Text>
                  </TouchableOpacity>
                )}

                {report.status === "In Progress" && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#4caf50" }]}
                    onPress={() => updateReportStatus(report.id, "Resolved")}
                  >
                    <Text style={styles.actionBtnText}>Complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  )

  const renderProfile = () => (
    <ScrollView style={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.profileRole}>Department Staff</Text>
          </View>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.settingItem} onPress={toggleTheme}>
          <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={colors.primary} />
          <Text style={styles.settingText}>{isDarkMode ? "Dark Mode" : "Light Mode"}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#ff4444" />
          <Text style={[styles.settingText, { color: "#ff4444" }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    welcomeCard: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 15,
      marginBottom: 20,
    },
    welcomeText: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 5,
    },
    welcomeSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    statCard: {
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      flex: 1,
      marginHorizontal: 2,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
    },
    quickActions: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 15,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
    },
    actionText: {
      color: colors.text,
      fontSize: 16,
      marginLeft: 15,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 50,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.textSecondary,
      marginTop: 15,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 5,
    },
    reportCard: {
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
    },
    reportHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    reportTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
    },
    reportDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 10,
    },
    reportInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 15,
    },
    reportLocation: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    reportDate: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    reportFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
    },
    actionButtons: {
      flexDirection: "row",
      gap: 10,
    },
    actionBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    actionBtnText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
    },
    profileCard: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 15,
      marginBottom: 20,
    },
    profileHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 15,
    },
    avatarText: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    profileEmail: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    profileRole: {
      fontSize: 12,
      color: colors.primary,
      marginTop: 2,
    },
    settingsSection: {
      marginBottom: 20,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
    },
    settingText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      marginLeft: 15,
    },
    bottomNav: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      paddingVertical: 10,
      paddingBottom: 30,
    },
    navItem: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 10,
    },
    navText: {
      fontSize: 12,
      marginTop: 5,
    },
    imageContainer: {
      marginBottom: 10,
    },
    reportImage: {
      width: "100%",
      height: 150,
      borderRadius: 8,
      resizeMode: "cover",
      marginBottom: 5,
    },
    imageCaption: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "600",
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    coordinatesContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
      marginBottom: 10,
    },
    coordinatesText: {
      fontSize: 10,
      color: colors.textSecondary,
      marginLeft: 4,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      {activeTab === "home" && renderHome()}
      {activeTab === "reports" && renderReports()}
      {activeTab === "profile" && renderProfile()}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab("home")}>
          <Ionicons
            name={activeTab === "home" ? "home" : "home-outline"}
            size={24}
            color={activeTab === "home" ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.navText,
              {
                color: activeTab === "home" ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab("reports")}>
          <Ionicons
            name={activeTab === "reports" ? "document-text" : "document-text-outline"}
            size={24}
            color={activeTab === "reports" ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.navText,
              {
                color: activeTab === "reports" ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            Reports
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab("profile")}>
          <Ionicons
            name={activeTab === "profile" ? "person" : "person-outline"}
            size={24}
            color={activeTab === "profile" ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.navText,
              {
                color: activeTab === "profile" ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default StaffDashboard

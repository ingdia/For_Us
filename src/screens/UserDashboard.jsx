"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import { useLocalization } from "../context/LocalizationContext"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useToast } from "../hooks/useToast"

const UserDashboard = ({ navigation }) => {
  const { colors, toggleTheme, isDarkMode } = useTheme()
  const { user, logout } = useAuth()
  const { t, currentLanguage, changeLanguage } = useLocalization()
  const [activeTab, setActiveTab] = useState("home")
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  })
  const { showSuccess, showError, showInfo } = useToast()

  useEffect(() => {
    loadUserReports()
  }, [])

  const loadUserReports = async () => {
    try {
      showInfo(t("refreshing"), t("loadingReports"))
      const reportsData = await AsyncStorage.getItem("@reports")
      if (reportsData) {
        const allReports = JSON.parse(reportsData)
        const userReports = allReports.filter((report) => report.userId === user?.id)
        // Sort by creation date (newest first)
        const sortedReports = userReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setReports(sortedReports)

        const stats = {
          total: userReports.length,
          pending: userReports.filter((r) => r.status === "Pending").length,
          inProgress: userReports.filter((r) => r.status === "In Progress" || r.status === "Assigned").length,
          resolved: userReports.filter((r) => r.status === "Resolved").length,
        }
        setStats(stats)
        showSuccess(t("reportsUpdated"), t("foundReports").replace("{count}", userReports.length))
      } else {
        showInfo(t("noReports"), t("noReportsFound"))
      }
    } catch (error) {
      console.error("Error loading reports:", error)
      showError(t("loadingFailed"), t("failedLoadReports"))
    }
  }

  const handleLogout = async () => {
    showInfo(t("loggingOut"), t("seeYouNext"))
    await logout()
    setTimeout(() => {
      navigation.replace("Welcome")
    }, 1000)
  }

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "en" ? "rw" : "en"
    changeLanguage(newLanguage)
  }

  const openLocationInMaps = (coordinates, address) => {
    if (coordinates) {
      const { latitude, longitude } = coordinates
      const url = `https://maps.google.com/?q=${latitude},${longitude}`
      Linking.openURL(url).catch(() => {
        showError(t("mapsError"), t("couldNotOpenMaps"))
      })
      showInfo(t("openingMaps"), t("launchingMaps"))
    } else if (address) {
      const encodedAddress = encodeURIComponent(address)
      const url = `https://maps.google.com/?q=${encodedAddress}`
      Linking.openURL(url).catch(() => {
        showError(t("mapsError"), t("couldNotOpenMaps"))
      })
      showInfo(t("openingMaps"), t("launchingMaps"))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#ffa500"
      case "Assigned":
        return "#2196f3"
      case "In Progress":
        return "#2196f3"
      case "Resolved":
        return "#4caf50"
      default:
        return colors.textSecondary
    }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getLocalizedStatus = (status) => {
    switch (status) {
      case "Pending":
        return t("pending")
      case "Assigned":
        return t("assigned")
      case "In Progress":
        return t("inProgress")
      case "Resolved":
        return t("resolved")
      default:
        return status
    }
  }

  const getLocalizedPriority = (priority) => {
    switch (priority) {
      case "High":
        return t("high")
      case "Medium":
        return t("medium")
      case "Low":
        return t("low")
      default:
        return priority
    }
  }

  const getLocalizedCategory = (category) => {
    switch (category) {
      case "Sanitation":
        return t("sanitation")
      case "Police":
        return t("police")
      case "Electricity":
        return t("electricity")
      case "Roads":
        return t("roads")
      case "Water":
        return t("water")
      case "Other":
        return t("other")
      default:
        return category
    }
  }

  const renderHome = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>
          {t("welcomeBack")}, {user?.name}!
        </Text>
        <Text style={styles.welcomeSubtext}>{t("trackReports")}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={20} color={colors.primary} />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>{t("totalReports")}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={20} color="#ffa500" />
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>{t("pending")}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="sync" size={20} color="#2196f3" />
          <Text style={styles.statNumber}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>{t("inProgress")}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
          <Text style={styles.statNumber}>{stats.resolved}</Text>
          <Text style={styles.statLabel}>{t("resolved")}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate("CreateReport")}>
        <Ionicons name="add-circle" size={24} color={colors.text} />
        <Text style={styles.createButtonText}>{t("createNewReport")}</Text>
      </TouchableOpacity>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>{t("quickActions")}</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab("reports")}>
          <Ionicons name="document-text" size={20} color={colors.primary} />
          <Text style={styles.actionText}>{t("viewMyReports")}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab("profile")}>
          <Ionicons name="person" size={20} color={colors.primary} />
          <Text style={styles.actionText}>{t("editProfile")}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={loadUserReports}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
          <Text style={styles.actionText}>{t("refreshReports")}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Recent Reports Preview */}
      {reports.length > 0 && (
        <View style={styles.recentReports}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("recentReports")}</Text>
            <TouchableOpacity onPress={() => setActiveTab("reports")}>
              <Text style={styles.viewAllText}>{t("viewAll")}</Text>
            </TouchableOpacity>
          </View>
          {reports.slice(0, 2).map((report) => (
            <View key={report.id} style={styles.miniReportCard}>
              <View style={styles.miniReportHeader}>
                <Text style={styles.miniReportTitle}>{getLocalizedCategory(report.category)}</Text>
                <View style={[styles.miniStatusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                  <Text style={styles.miniStatusText}>{getLocalizedStatus(report.status)}</Text>
                </View>
              </View>
              <Text style={styles.miniReportDate}>{formatDate(report.createdAt)}</Text>
              {report.image && (
                <View style={styles.miniImageIndicator}>
                  <Ionicons name="camera" size={12} color={colors.primary} />
                  <Text style={styles.miniImageText}>{t("evidencePhoto").replace("📷 ", "")}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )

  const renderReports = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t("reports")} ({reports.length})
        </Text>
        <TouchableOpacity onPress={loadUserReports}>
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {reports.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>{t("noReports")}</Text>
          <Text style={styles.emptySubtext}>{t("noReportsDesc")}</Text>
          <TouchableOpacity style={styles.createFirstButton} onPress={() => navigation.navigate("CreateReport")}>
            <Text style={styles.createFirstButtonText}>{t("createFirstReport")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        reports.map((report) => (
          <View key={report.id} style={styles.reportCard}>
            {/* Report Header */}
            <View style={styles.reportHeader}>
              <View style={styles.reportTitleContainer}>
                <Text style={styles.reportTitle}>{getLocalizedCategory(report.category)}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) }]}>
                  <Text style={styles.priorityText}>{getLocalizedPriority(report.priority)}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                <Text style={styles.statusText}>{getLocalizedStatus(report.status)}</Text>
              </View>
            </View>

            {/* Report Description */}
            <Text style={styles.reportDescription}>{report.description}</Text>

            {/* Image Section */}
            {report.image && (
              <View style={styles.imageSection}>
                <Text style={styles.imageSectionTitle}>{t("evidencePhoto")}</Text>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: report.image.uri }} style={styles.reportImage} />
                  <View style={styles.imageOverlay}>
                    <Ionicons name="expand" size={16} color="white" />
                  </View>
                </View>
              </View>
            )}

            {/* Location Section */}
            <View style={styles.locationSection}>
              <Text style={styles.locationSectionTitle}>{t("locationDetails")}</Text>

              {/* Address */}
              <TouchableOpacity
                style={styles.addressContainer}
                onPress={() => openLocationInMaps(report.coordinates, report.location)}
              >
                <View style={styles.addressRow}>
                  <Ionicons name="location" size={16} color={colors.primary} />
                  <Text style={styles.addressText}>{report.location}</Text>
                  <Ionicons name="open-outline" size={14} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>

              {/* GPS Coordinates */}
              {report.coordinates && (
                <TouchableOpacity
                  style={styles.coordinatesContainer}
                  onPress={() => openLocationInMaps(report.coordinates, report.location)}
                >
                  <View style={styles.coordinatesRow}>
                    <Ionicons name="navigate" size={14} color={colors.textSecondary} />
                    <Text style={styles.coordinatesText}>
                      {t("gpsCoordinates")}: {report.coordinates.latitude.toFixed(6)},{" "}
                      {report.coordinates.longitude.toFixed(6)}
                    </Text>
                    <Ionicons name="map" size={14} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Report Footer */}
            <View style={styles.reportFooter}>
              <View style={styles.reportMetadata}>
                <Text style={styles.reportDate}>
                  <Ionicons name="calendar" size={12} color={colors.textSecondary} /> {formatDate(report.createdAt)}
                </Text>
                {report.updatedAt !== report.createdAt && (
                  <Text style={styles.reportUpdated}>Updated: {formatDate(report.updatedAt)}</Text>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.reportActions}>
                {report.coordinates && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openLocationInMaps(report.coordinates, report.location)}
                  >
                    <Ionicons name="map" size={16} color={colors.primary} />
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
            <Text style={styles.profileRole}>{t("citizen")}</Text>
          </View>
        </View>
      </View>

      {/* User Statistics */}
      <View style={styles.userStatsSection}>
        <Text style={styles.sectionTitle}>{t("yourActivity")}</Text>
        <View style={styles.userStatsGrid}>
          <View style={styles.userStatCard}>
            <Text style={styles.userStatNumber}>{stats.total}</Text>
            <Text style={styles.userStatLabel}>{t("totalReports")}</Text>
          </View>
          <View style={styles.userStatCard}>
            <Text style={styles.userStatNumber}>{reports.filter((r) => r.image).length}</Text>
            <Text style={styles.userStatLabel}>{t("withPhotos")}</Text>
          </View>
          <View style={styles.userStatCard}>
            <Text style={styles.userStatNumber}>{reports.filter((r) => r.coordinates).length}</Text>
            <Text style={styles.userStatLabel}>{t("withGPS")}</Text>
          </View>
          <View style={styles.userStatCard}>
            <Text style={styles.userStatNumber}>{stats.resolved}</Text>
            <Text style={styles.userStatLabel}>{t("resolved")}</Text>
          </View>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>{t("settings")}</Text>

        <TouchableOpacity style={styles.settingItem} onPress={toggleTheme}>
          <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={colors.primary} />
          <Text style={styles.settingText}>{isDarkMode ? t("darkMode") : t("lightMode")}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={toggleLanguage}>
          <Ionicons name="language" size={20} color={colors.primary} />
          <Text style={styles.settingText}>
            {t("language")}: {currentLanguage === "en" ? t("english") : t("kinyarwanda")}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={loadUserReports}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
          <Text style={styles.settingText}>{t("refreshData")}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#ff4444" />
          <Text style={[styles.settingText, { color: "#ff4444" }]}>{t("logout")}</Text>
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
      padding: 12,
      borderRadius: 10,
      alignItems: "center",
      flex: 1,
      marginHorizontal: 2,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 5,
    },
    statLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 2,
    },
    createButton: {
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
    },
    createButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 10,
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
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    viewAllText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "600",
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
      flex: 1,
    },
    recentReports: {
      marginBottom: 20,
    },
    miniReportCard: {
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    miniReportHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 5,
    },
    miniReportTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    miniStatusBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    miniStatusText: {
      color: "white",
      fontSize: 10,
      fontWeight: "600",
    },
    miniReportDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 5,
    },
    miniImageIndicator: {
      flexDirection: "row",
      alignItems: "center",
    },
    miniImageText: {
      fontSize: 11,
      color: colors.primary,
      marginLeft: 4,
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
      marginBottom: 20,
    },
    createFirstButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    createFirstButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    reportCard: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    reportHeader: {
      marginBottom: 12,
    },
    reportTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    reportTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      flex: 1,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 10,
    },
    priorityText: {
      color: "white",
      fontSize: 11,
      fontWeight: "600",
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 15,
      alignSelf: "flex-start",
    },
    statusText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
    },
    reportDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    imageSection: {
      marginBottom: 16,
    },
    imageSectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    imageContainer: {
      position: "relative",
      borderRadius: 8,
      overflow: "hidden",
    },
    reportImage: {
      width: "100%",
      height: 180,
      resizeMode: "cover",
    },
    imageOverlay: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "rgba(0,0,0,0.6)",
      borderRadius: 15,
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    locationSection: {
      marginBottom: 16,
    },
    locationSectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    addressContainer: {
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    addressRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    addressText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
      marginLeft: 8,
      marginRight: 8,
    },
    coordinatesContainer: {
      backgroundColor: colors.background,
      padding: 10,
      borderRadius: 6,
    },
    coordinatesRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    coordinatesText: {
      fontSize: 12,
      color: colors.textSecondary,
      flex: 1,
      marginLeft: 6,
      marginRight: 6,
      fontFamily: "monospace",
    },
    reportFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    reportMetadata: {
      flex: 1,
    },
    reportDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    reportUpdated: {
      fontSize: 11,
      color: colors.textSecondary,
      fontStyle: "italic",
    },
    reportActions: {
      flexDirection: "row",
      gap: 8,
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
    userStatsSection: {
      marginBottom: 20,
    },
    userStatsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    userStatCard: {
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
      width: "48%",
      marginBottom: 8,
    },
    userStatNumber: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
    },
    userStatLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: "center",
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
    logoutItem: {
      borderWidth: 1,
      borderColor: "#ff4444",
      backgroundColor: "transparent",
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
            {t("home")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("CreateReport")}>
          <Ionicons name="add-circle-outline" size={24} color={colors.textSecondary} />
          <Text style={[styles.navText, { color: colors.textSecondary }]}>{t("create")}</Text>
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
            {t("reports")}
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
            {t("profile")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default UserDashboard

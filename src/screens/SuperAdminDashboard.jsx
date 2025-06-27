"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import AsyncStorage from "@react-native-async-storage/async-storage"

const SuperAdminDashboard = ({ navigation }) => {
  const { colors, toggleTheme, isDarkMode } = useTheme()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [allReports, setAllReports] = useState([])
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [staff, setStaff] = useState([])
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    totalUsers: 0,
    totalStaff: 0,
    totalDepartments: 0,
  })
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false)
  const [showAddStaffModal, setShowAddStaffModal] = useState(false)
  const [newDepartmentName, setNewDepartmentName] = useState("")
  const [newStaffData, setNewStaffData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  })

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      await Promise.all([loadAllReports(), loadUsers(), loadDepartments(), loadStaff()])
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const loadAllReports = async () => {
    try {
      const reportsData = await AsyncStorage.getItem("@allReports")
      if (reportsData) {
        const reports = JSON.parse(reportsData)
        setAllReports(reports)
        updateStats(reports)
      }
    } catch (error) {
      console.error("Error loading reports:", error)
    }
  }

  const loadUsers = async () => {
    try {
      const usersData = await AsyncStorage.getItem("@users")
      if (usersData) {
        const allUsers = JSON.parse(usersData)
        const regularUsers = allUsers.filter((u) => u.role === "user")
        setUsers(regularUsers)
      }
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const loadDepartments = async () => {
    try {
      const deptData = await AsyncStorage.getItem("@departments")
      if (deptData) {
        setDepartments(JSON.parse(deptData))
      } else {
        // Initialize with default departments
        const defaultDepts = [
          { id: "1", name: "Sanitation", active: true, createdAt: new Date().toISOString() },
          { id: "2", name: "Police", active: true, createdAt: new Date().toISOString() },
          { id: "3", name: "Electricity", active: true, createdAt: new Date().toISOString() },
          { id: "4", name: "Roads", active: true, createdAt: new Date().toISOString() },
          { id: "5", name: "Water", active: true, createdAt: new Date().toISOString() },
        ]
        await AsyncStorage.setItem("@departments", JSON.stringify(defaultDepts))
        setDepartments(defaultDepts)
      }
    } catch (error) {
      console.error("Error loading departments:", error)
    }
  }

  const loadStaff = async () => {
    try {
      const staffData = await AsyncStorage.getItem("@staff")
      if (staffData) {
        setStaff(JSON.parse(staffData))
      }
    } catch (error) {
      console.error("Error loading staff:", error)
    }
  }

  const updateStats = (reports) => {
    const totalReports = reports.length
    const pendingReports = reports.filter((r) => r.status === "Pending").length

    setStats((prev) => ({
      ...prev,
      totalReports,
      pendingReports,
    }))
  }

  const assignReport = async (reportId, staffId) => {
    try {
      const assignedData = await AsyncStorage.getItem("@assignedReports")
      const assignedReports = assignedData ? JSON.parse(assignedData) : []

      const reportToAssign = allReports.find((r) => r.id === reportId)
      if (reportToAssign) {
        const assignedReport = {
          ...reportToAssign, // This preserves ALL original data including image and coordinates
          assignedTo: staffId,
          assignedAt: new Date().toISOString(),
          status: "Assigned",
        }

        assignedReports.push(assignedReport)
        await AsyncStorage.setItem("@assignedReports", JSON.stringify(assignedReports))

        // Update the original report status in all storage locations
        const updatedReports = allReports.map((r) =>
          r.id === reportId ? { ...r, status: "Assigned", assignedTo: staffId } : r,
        )
        await AsyncStorage.setItem("@allReports", JSON.stringify(updatedReports))
        setAllReports(updatedReports)

        // Also update in user reports and master reports
        const userReportsData = await AsyncStorage.getItem("@reports")
        if (userReportsData) {
          const userReports = JSON.parse(userReportsData)
          const updatedUserReports = userReports.map((r) =>
            r.id === reportId ? { ...r, status: "Assigned", assignedTo: staffId } : r,
          )
          await AsyncStorage.setItem("@reports", JSON.stringify(updatedUserReports))
        }

        const masterReportsData = await AsyncStorage.getItem("@masterReports")
        if (masterReportsData) {
          const masterReports = JSON.parse(masterReportsData)
          const updatedMasterReports = masterReports.map((r) =>
            r.id === reportId ? { ...r, status: "Assigned", assignedTo: staffId } : r,
          )
          await AsyncStorage.setItem("@masterReports", JSON.stringify(updatedMasterReports))
        }

        Alert.alert("Success", "Report with all data (photo & location) assigned successfully!")
        setShowAssignModal(false)
        setSelectedReport(null)
      }
    } catch (error) {
      console.error("Error assigning report:", error)
      Alert.alert("Error", "Failed to assign report")
    }
  }

  const addDepartment = async () => {
    if (!newDepartmentName.trim()) {
      Alert.alert("Error", "Please enter department name")
      return
    }

    try {
      const newDept = {
        id: Date.now().toString(),
        name: newDepartmentName.trim(),
        active: true,
        createdAt: new Date().toISOString(),
      }

      const updatedDepts = [...departments, newDept]
      await AsyncStorage.setItem("@departments", JSON.stringify(updatedDepts))
      setDepartments(updatedDepts)
      setNewDepartmentName("")
      setShowAddDepartmentModal(false)
      Alert.alert("Success", "Department added successfully!")
    } catch (error) {
      console.error("Error adding department:", error)
      Alert.alert("Error", "Failed to add department")
    }
  }

  const addStaff = async () => {
    const { name, email, password, department } = newStaffData

    if (!name || !email || !password || !department) {
      Alert.alert("Error", "Please fill all fields")
      return
    }

    try {
      // Add to users collection
      const usersData = await AsyncStorage.getItem("@users")
      const users = usersData ? JSON.parse(usersData) : []

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role: "staff",
        department,
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      await AsyncStorage.setItem("@users", JSON.stringify(users))

      // Add to staff collection
      const staffData = await AsyncStorage.getItem("@staff")
      const staff = staffData ? JSON.parse(staffData) : []

      const newStaff = {
        id: newUser.id,
        name,
        email,
        department,
        active: true,
        createdAt: new Date().toISOString(),
      }

      staff.push(newStaff)
      await AsyncStorage.setItem("@staff", JSON.stringify(staff))
      setStaff(staff)

      setNewStaffData({ name: "", email: "", password: "", department: "" })
      setShowAddStaffModal(false)
      Alert.alert("Success", "Staff member added successfully!")
    } catch (error) {
      console.error("Error adding staff:", error)
      Alert.alert("Error", "Failed to add staff member")
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

  const renderDashboard = () => (
    <ScrollView style={styles.content}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Super Admin Dashboard</Text>
        <Text style={styles.welcomeSubtext}>System Overview & Management</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={24} color={colors.primary} />
          <Text style={styles.statNumber}>{stats.totalReports}</Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#ffa500" />
          <Text style={styles.statNumber}>{stats.pendingReports}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#2196f3" />
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Users</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="person-add" size={24} color="#4caf50" />
          <Text style={styles.statNumber}>{staff.length}</Text>
          <Text style={styles.statLabel}>Staff</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="business" size={24} color="#9c27b0" />
          <Text style={styles.statNumber}>{departments.length}</Text>
          <Text style={styles.statLabel}>Departments</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab("reports")}>
          <Ionicons name="document-text" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Manage Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab("departments")}>
          <Ionicons name="business" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Manage Departments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab("staff")}>
          <Ionicons name="people" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Manage Staff</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )

  const renderReports = () => (
    <ScrollView style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Reports</Text>
        <TouchableOpacity onPress={loadAllReports}>
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {allReports.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No reports found</Text>
        </View>
      ) : (
        allReports.map((report) => (
          <View key={report.id} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportTitle}>{report.category}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) }]}>
                <Text style={styles.badgeText}>{report.priority}</Text>
              </View>
            </View>

            <Text style={styles.reportDescription}>{report.description}</Text>
            <Text style={styles.reportUser}>
              Reported by: {report.userName} ({report.userEmail})
            </Text>

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

              {report.status === "Pending" && (
                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={() => {
                    setSelectedReport(report)
                    setShowAssignModal(true)
                  }}
                >
                  <Text style={styles.assignButtonText}>Assign</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  )

  const renderDepartments = () => (
    <ScrollView style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Departments</Text>
        <TouchableOpacity onPress={() => setShowAddDepartmentModal(true)}>
          <Ionicons name="add" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {departments.map((dept) => (
        <View key={dept.id} style={styles.departmentCard}>
          <View style={styles.departmentInfo}>
            <Text style={styles.departmentName}>{dept.name}</Text>
            <Text style={styles.departmentStatus}>{dept.active ? "Active" : "Inactive"}</Text>
          </View>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: dept.active ? "#4caf50" : "#ff4444",
              },
            ]}
          />
        </View>
      ))}
    </ScrollView>
  )

  const renderStaff = () => (
    <ScrollView style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Staff Members</Text>
        <TouchableOpacity onPress={() => setShowAddStaffModal(true)}>
          <Ionicons name="person-add" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {staff.map((member) => (
        <View key={member.id} style={styles.staffCard}>
          <View style={styles.staffAvatar}>
            <Text style={styles.staffAvatarText}>{member.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.staffInfo}>
            <Text style={styles.staffName}>{member.name}</Text>
            <Text style={styles.staffEmail}>{member.email}</Text>
            <Text style={styles.staffDepartment}>{member.department}</Text>
          </View>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: member.active ? "#4caf50" : "#ff4444",
              },
            ]}
          />
        </View>
      ))}
    </ScrollView>
  )

  const renderUsers = () => (
    <ScrollView style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registered Users</Text>
        <TouchableOpacity onPress={loadUsers}>
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {users.map((user) => (
        <View key={user.id} style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userDate}>Joined: {new Date(user.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>
      ))}
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
            <Text style={styles.profileRole}>Super Administrator</Text>
          </View>
        </View>
      </View>

      <View style={styles.adminStats}>
        <Text style={styles.sectionTitle}>System Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.miniStatCard}>
            <Text style={styles.miniStatNumber}>{stats.totalReports}</Text>
            <Text style={styles.miniStatLabel}>Total Reports</Text>
          </View>
          <View style={styles.miniStatCard}>
            <Text style={styles.miniStatNumber}>{users.length}</Text>
            <Text style={styles.miniStatLabel}>Active Users</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.miniStatCard}>
            <Text style={styles.miniStatNumber}>{staff.length}</Text>
            <Text style={styles.miniStatLabel}>Staff Members</Text>
          </View>
          <View style={styles.miniStatCard}>
            <Text style={styles.miniStatNumber}>{departments.length}</Text>
            <Text style={styles.miniStatLabel}>Departments</Text>
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

        <TouchableOpacity style={styles.settingItem} onPress={loadAllData}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
          <Text style={styles.settingText}>Refresh All Data</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
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
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    statCard: {
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      width: "48%",
      marginBottom: 10,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 5,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 2,
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
      marginBottom: 5,
    },
    reportUser: {
      fontSize: 12,
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
    assignButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    assignButtonText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    departmentCard: {
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    departmentInfo: {
      flex: 1,
    },
    departmentName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    departmentStatus: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statusIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    staffCard: {
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    staffAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 15,
    },
    staffAvatarText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    staffInfo: {
      flex: 1,
    },
    staffName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    staffEmail: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    staffDepartment: {
      fontSize: 12,
      color: colors.primary,
      marginTop: 2,
    },
    userCard: {
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 15,
    },
    userAvatarText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    userEmail: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    userDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
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
      fontSize: 10,
      marginTop: 5,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 15,
      width: "90%",
      maxHeight: "80%",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 15,
    },
    modalInput: {
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 15,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      marginHorizontal: 5,
    },
    modalButtonPrimary: {
      backgroundColor: colors.primary,
    },
    modalButtonSecondary: {
      backgroundColor: colors.border,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    staffOption: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    staffOptionText: {
      fontSize: 16,
      color: colors.text,
    },
    picker: {
      backgroundColor: colors.background,
      borderRadius: 10,
      marginBottom: 15,
    },
    adminStats: {
      marginBottom: 20,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    miniStatCard: {
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      flex: 1,
      marginHorizontal: 5,
    },
    miniStatNumber: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primary,
    },
    miniStatLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 2,
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
      fontWeight: "600",
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
      {activeTab === "dashboard" && renderDashboard()}
      {activeTab === "reports" && renderReports()}
      {activeTab === "departments" && renderDepartments()}
      {activeTab === "staff" && renderStaff()}
      {activeTab === "users" && renderUsers()}
      {activeTab === "profile" && renderProfile()}

      {/* Assign Report Modal */}
      <Modal
        visible={showAssignModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Report</Text>
            <Text style={{ color: colors.textSecondary, marginBottom: 15 }}>
              Select staff member to assign this report:
            </Text>

            <ScrollView style={{ maxHeight: 200 }}>
              {staff.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={styles.staffOption}
                  onPress={() => assignReport(selectedReport?.id, member.id)}
                >
                  <Text style={styles.staffOptionText}>
                    {member.name} - {member.department}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowAssignModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Department Modal */}
      <Modal
        visible={showAddDepartmentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddDepartmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Department</Text>

            <TextInput
              style={styles.modalInput}
              value={newDepartmentName}
              onChangeText={setNewDepartmentName}
              placeholder="Department Name"
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setShowAddDepartmentModal(false)
                  setNewDepartmentName("")
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={addDepartment}>
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Staff Modal */}
      <Modal
        visible={showAddStaffModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddStaffModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Staff Member</Text>

            <TextInput
              style={styles.modalInput}
              value={newStaffData.name}
              onChangeText={(text) => setNewStaffData((prev) => ({ ...prev, name: text }))}
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
            />

            <TextInput
              style={styles.modalInput}
              value={newStaffData.email}
              onChangeText={(text) => setNewStaffData((prev) => ({ ...prev, email: text }))}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.modalInput}
              value={newStaffData.password}
              onChangeText={(text) => setNewStaffData((prev) => ({ ...prev, password: text }))}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />

            <Text style={{ color: colors.text, marginBottom: 10 }}>Select Department:</Text>
            <ScrollView style={{ maxHeight: 150, marginBottom: 15 }}>
              {departments.map((dept) => (
                <TouchableOpacity
                  key={dept.id}
                  style={[
                    styles.staffOption,
                    newStaffData.department === dept.name && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setNewStaffData((prev) => ({ ...prev, department: dept.name }))}
                >
                  <Text
                    style={[styles.staffOptionText, newStaffData.department === dept.name && { color: colors.text }]}
                  >
                    {dept.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setShowAddStaffModal(false)
                  setNewStaffData({ name: "", email: "", password: "", department: "" })
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={addStaff}>
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Add Staff</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab("dashboard")}>
          <Ionicons
            name={activeTab === "dashboard" ? "grid" : "grid-outline"}
            size={20}
            color={activeTab === "dashboard" ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.navText,
              {
                color: activeTab === "dashboard" ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab("reports")}>
          <Ionicons
            name={activeTab === "reports" ? "document-text" : "document-text-outline"}
            size={20}
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

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab("users")}>
          <Ionicons
            name={activeTab === "users" ? "people" : "people-outline"}
            size={20}
            color={activeTab === "users" ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.navText,
              {
                color: activeTab === "users" ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            Users
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab("departments")}>
          <Ionicons
            name={activeTab === "departments" ? "business" : "business-outline"}
            size={20}
            color={activeTab === "departments" ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.navText,
              {
                color: activeTab === "departments" ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            Depts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab("profile")}>
          <Ionicons
            name={activeTab === "profile" ? "person" : "person-outline"}
            size={20}
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

export default SuperAdminDashboard

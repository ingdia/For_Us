// This file demonstrates how data flows from user actions - NO DUMMY DATA

import AsyncStorage from "@react-native-async-storage/async-storage"

// 1. USER REGISTRATION - Creates first data entry
export const verifyUserRegistration = async () => {
  // When user registers, this creates the first data entry
  const users = await AsyncStorage.getItem("@users")
  console.log("Users in storage:", users ? JSON.parse(users) : "No users yet - starts empty")
}

// 2. REPORT CREATION - Only happens when user creates reports
export const verifyReportCreation = async () => {
  const reports = await AsyncStorage.getItem("@reports")
  console.log("Reports in storage:", reports ? JSON.parse(reports) : "No reports yet - starts empty")
}

// 3. DEPARTMENT INITIALIZATION - Only default departments, no dummy reports
export const verifyDepartments = async () => {
  const departments = await AsyncStorage.getItem("@departments")
  if (!departments) {
    // Only creates basic department structure - NO dummy data
    const defaultDepts = [
      { id: "1", name: "Sanitation", active: true, createdAt: new Date().toISOString() },
      { id: "2", name: "Police", active: true, createdAt: new Date().toISOString() },
      { id: "3", name: "Electricity", active: true, createdAt: new Date().toISOString() },
      { id: "4", name: "Roads", active: true, createdAt: new Date().toISOString() },
      { id: "5", name: "Water", active: true, createdAt: new Date().toISOString() },
    ]
    await AsyncStorage.setItem("@departments", JSON.stringify(defaultDepts))
    console.log("Departments initialized - structure only, no dummy reports")
  }
}

// 4. STAFF MANAGEMENT - Only created by Super Admin
export const verifyStaffCreation = async () => {
  const staff = await AsyncStorage.getItem("@staff")
  console.log("Staff in storage:", staff ? JSON.parse(staff) : "No staff yet - Super Admin must add them")
}

// 5. REPORT ASSIGNMENT - Only happens when Super Admin assigns reports
export const verifyReportAssignment = async () => {
  const assignedReports = await AsyncStorage.getItem("@assignedReports")
  console.log("Assigned reports:", assignedReports ? JSON.parse(assignedReports) : "No assignments yet")
}

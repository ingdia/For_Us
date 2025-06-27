import AsyncStorage from "@react-native-async-storage/async-storage"

// Utility to sync report data across all storage locations
export const syncReportData = async (reportId, updatedData) => {
  try {
    const storageKeys = ["@reports", "@allReports", "@assignedReports", "@masterReports"]

    for (const key of storageKeys) {
      const data = await AsyncStorage.getItem(key)
      if (data) {
        const reports = JSON.parse(data)
        const updatedReports = reports.map((report) =>
          report.id === reportId ? { ...report, ...updatedData } : report,
        )
        await AsyncStorage.setItem(key, JSON.stringify(updatedReports))
      }
    }

    console.log("Data synced successfully across all storage locations")
  } catch (error) {
    console.error("Error syncing data:", error)
  }
}

// Utility to get complete report data with all fields
export const getCompleteReportData = async (reportId) => {
  try {
    // Try to get from master reports first (most complete)
    const masterData = await AsyncStorage.getItem("@masterReports")
    if (masterData) {
      const masterReports = JSON.parse(masterData)
      const report = masterReports.find((r) => r.id === reportId)
      if (report) return report
    }

    // Fallback to other storage locations
    const storageKeys = ["@allReports", "@reports", "@assignedReports"]

    for (const key of storageKeys) {
      const data = await AsyncStorage.getItem(key)
      if (data) {
        const reports = JSON.parse(data)
        const report = reports.find((r) => r.id === reportId)
        if (report) return report
      }
    }

    return null
  } catch (error) {
    console.error("Error getting complete report data:", error)
    return null
  }
}

// Utility to verify data integrity
export const verifyDataIntegrity = async () => {
  try {
    const allReportsData = await AsyncStorage.getItem("@allReports")
    const userReportsData = await AsyncStorage.getItem("@reports")
    const assignedReportsData = await AsyncStorage.getItem("@assignedReports")

    console.log("=== DATA INTEGRITY CHECK ===")
    console.log("All Reports:", allReportsData ? JSON.parse(allReportsData).length : 0)
    console.log("User Reports:", userReportsData ? JSON.parse(userReportsData).length : 0)
    console.log("Assigned Reports:", assignedReportsData ? JSON.parse(assignedReportsData).length : 0)

    // Check for reports with images and coordinates
    if (allReportsData) {
      const allReports = JSON.parse(allReportsData)
      const reportsWithImages = allReports.filter((r) => r.image)
      const reportsWithCoordinates = allReports.filter((r) => r.coordinates)

      console.log("Reports with Images:", reportsWithImages.length)
      console.log("Reports with GPS Coordinates:", reportsWithCoordinates.length)
    }

    console.log("=== END DATA CHECK ===")
  } catch (error) {
    console.error("Error verifying data integrity:", error)
  }
}

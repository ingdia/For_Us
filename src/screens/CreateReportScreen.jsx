"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import { useLocalization } from "../context/LocalizationContext"
import { useToast } from "../hooks/useToast"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Location from "expo-location"
import * as ImagePicker from "expo-image-picker"

const CreateReportScreen = ({ navigation }) => {
  const { colors } = useTheme()
  const { user } = useAuth()
  const { t } = useLocalization()
  const { showSuccess, showError, showInfo, showWarning } = useToast()
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)

  const categories = [
    { key: "Sanitation", label: t("sanitation") },
    { key: "Police", label: t("police") },
    { key: "Electricity", label: t("electricity") },
    { key: "Roads", label: t("roads") },
    { key: "Water", label: t("water") },
    { key: "Other", label: t("other") },
  ]

  const priorities = [
    { key: "High", label: t("high") },
    { key: "Medium", label: t("medium") },
    { key: "Low", label: t("low") },
  ]

  useEffect(() => {
    requestPermissions()
  }, [])

  const requestPermissions = async () => {
    try {
      // Request location permission
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync()
      if (locationStatus !== "granted") {
        showWarning(t("permissionRequired"), t("locationPermissionNeeded"))
      }

      // Request camera permission
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
      if (cameraStatus !== "granted") {
        showWarning(t("permissionRequired"), t("cameraPermissionNeeded"))
      }

      // Request media library permission
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (mediaStatus !== "granted") {
        showWarning(t("permissionRequired"), t("photoLibraryPermissionNeeded"))
      }
    } catch (error) {
      console.error("Error requesting permissions:", error)
      showError(t("error"), t("error"))
    }
  }

  const getCurrentLocation = async () => {
    setLocationLoading(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        showError(t("permissionRequired"), t("locationPermissionNeeded"))
        setLocationLoading(false)
        return
      }

      showInfo(t("gettingLocation"), t("detectingLocation"))

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      const { latitude, longitude } = locationData.coords
      setCurrentLocation({ latitude, longitude })

      // Reverse geocoding to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      })

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0]
        const formattedAddress = `${address.street || ""} ${address.name || ""}, ${address.city || ""}, ${address.region || ""}`
        setLocation(formattedAddress.trim())
      } else {
        setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
      }

      showSuccess(t("locationDetected"), t("locationAutoFilled"))
    } catch (error) {
      console.error("Error getting location:", error)
      showError(t("locationError"), t("locationFailed"))
    } finally {
      setLocationLoading(false)
    }
  }

  const selectImageSource = () => {
    Alert.alert(t("photoOptional"), t("tapToAddPhoto"), [
      { text: t("camera"), onPress: takePhoto },
      { text: t("gallery"), onPress: pickImage },
      { text: t("cancel"), style: "cancel" },
    ])
  }

  const takePhoto = async () => {
    setImageLoading(true)
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== "granted") {
        showError(t("permissionRequired"), t("cameraPermissionNeeded"))
        setImageLoading(false)
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0])
        showSuccess(t("photoCaptured"), t("evidencePhotoAdded"))
      }
    } catch (error) {
      console.error("Error taking photo:", error)
      showError(t("cameraError"), t("failedTakePhoto"))
    } finally {
      setImageLoading(false)
    }
  }

  const pickImage = async () => {
    setImageLoading(true)
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        showError(t("permissionRequired"), t("photoLibraryPermissionNeeded"))
        setImageLoading(false)
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0])
        showSuccess(t("photoSelected"), t("evidencePhotoAdded"))
      }
    } catch (error) {
      console.error("Error picking image:", error)
      showError(t("galleryError"), t("failedSelectImage"))
    } finally {
      setImageLoading(false)
    }
  }

  const removeImage = () => {
    Alert.alert(t("photoOptional"), t("photoRemoved"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        onPress: () => {
          setSelectedImage(null)
          showInfo(t("photoRemoved"), t("evidencePhotoRemoved"))
        },
        style: "destructive",
      },
    ])
  }

  const handleSubmit = async () => {
    if (!category || !priority || !location || !description) {
      showError(t("missingInfo"), t("fillAllFields"))
      return
    }

    setLoading(true)
    showInfo(t("submittingReport"), t("pleaseWait"))

    try {
      const newReport = {
        id: Date.now().toString(),
        userId: user?.id,
        userName: user?.name,
        userEmail: user?.email,
        category,
        priority,
        location,
        description,
        status: "Pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Location coordinates if available
        coordinates: currentLocation
          ? {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }
          : null,
        // Image data if available
        image: selectedImage
          ? {
              uri: selectedImage.uri,
              width: selectedImage.width,
              height: selectedImage.height,
              type: selectedImage.type || "image",
              fileName: selectedImage.fileName || `report_${Date.now()}.jpg`,
            }
          : null,
      }

      // Save to user reports (for citizen view)
      const reportsData = await AsyncStorage.getItem("@reports")
      const reports = reportsData ? JSON.parse(reportsData) : []
      reports.push(newReport)
      await AsyncStorage.setItem("@reports", JSON.stringify(reports))

      // Save to all reports (for admin view)
      const allReportsData = await AsyncStorage.getItem("@allReports")
      const allReports = allReportsData ? JSON.parse(allReportsData) : []
      allReports.push(newReport)
      await AsyncStorage.setItem("@allReports", JSON.stringify(allReports))

      // Also save to a master reports collection (ensures data consistency)
      const masterReportsData = await AsyncStorage.getItem("@masterReports")
      const masterReports = masterReportsData ? JSON.parse(masterReportsData) : []
      masterReports.push(newReport)
      await AsyncStorage.setItem("@masterReports", JSON.stringify(masterReports))

      const categoryTranslated = categories.find((c) => c.key === category)?.label || category
      showSuccess(
        t("reportSubmitted"),
        t("reportSubmittedDesc").replace("{category}", categoryTranslated.toLowerCase()),
      )

      // Reset form
      setCategory("")
      setPriority("")
      setLocation("")
      setDescription("")
      setSelectedImage(null)
      setCurrentLocation(null)

      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack()
      }, 1500)
    } catch (error) {
      console.error("Error creating report:", error)
      showError(t("submissionFailed"), t("failedSubmitReport"))
    } finally {
      setLoading(false)
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      paddingTop: 50,
    },
    backButton: {
      marginRight: 15,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 25,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 10,
    },
    required: {
      color: "#ff4444",
    },
    optionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    option: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    selectedOption: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    selectedOptionText: {
      color: colors.text,
      fontWeight: "600",
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
    textArea: {
      height: 100,
      textAlignVertical: "top",
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    locationInput: {
      flex: 1,
    },
    locationButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 50,
    },
    imageSection: {
      marginBottom: 25,
    },
    imageContainer: {
      alignItems: "center",
      marginBottom: 15,
    },
    selectedImageContainer: {
      position: "relative",
      marginBottom: 15,
    },
    selectedImage: {
      width: "100%",
      height: 200,
      borderRadius: 10,
      resizeMode: "cover",
    },
    removeImageButton: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: "rgba(255, 68, 68, 0.9)",
      borderRadius: 15,
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    imageButton: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: "dashed",
      borderRadius: 10,
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 120,
    },
    imageButtonText: {
      color: colors.textSecondary,
      fontSize: 16,
      marginTop: 10,
      textAlign: "center",
    },
    submitButton: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 20,
    },
    submitButtonText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
    },
    disabledButton: {
      opacity: 0.6,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      color: colors.text,
      marginLeft: 10,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("createReport")}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>
            {t("category")} <Text style={styles.required}>{t("required")}</Text>
          </Text>
          <View style={styles.optionsContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.option, category === cat.key && styles.selectedOption]}
                onPress={() => setCategory(cat.key)}
              >
                <Text style={[styles.optionText, category === cat.key && styles.selectedOptionText]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            {t("priority")} <Text style={styles.required}>{t("required")}</Text>
          </Text>
          <View style={styles.optionsContainer}>
            {priorities.map((pri) => (
              <TouchableOpacity
                key={pri.key}
                style={[styles.option, priority === pri.key && styles.selectedOption]}
                onPress={() => setPriority(pri.key)}
              >
                <Text style={[styles.optionText, priority === pri.key && styles.selectedOptionText]}>{pri.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            {t("location")} <Text style={styles.required}>{t("required")}</Text>
          </Text>
          <View style={styles.locationContainer}>
            <TextInput
              style={[styles.input, styles.locationInput]}
              value={location}
              onChangeText={setLocation}
              placeholder={t("enterLocation")}
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation} disabled={locationLoading}>
              {locationLoading ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Ionicons name="location" size={20} color={colors.text} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 5 }}>{t("locationDetectHint")}</Text>
        </View>

        <View style={styles.imageSection}>
          <Text style={styles.label}>{t("photoOptional")}</Text>

          {selectedImage ? (
            <View style={styles.selectedImageContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
              <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imageButton} onPress={selectImageSource} disabled={imageLoading}>
              {imageLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.textSecondary} />
                  <Text style={styles.loadingText}>{t("loading")}</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="camera" size={40} color={colors.textSecondary} />
                  <Text style={styles.imageButtonText}>{t("tapToAddPhoto")}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            {t("description")} <Text style={styles.required}>{t("required")}</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder={t("describeIssue")}
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.text} />
              <Text style={styles.loadingText}>{t("submitting")}</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>{t("submitReport")}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default CreateReportScreen

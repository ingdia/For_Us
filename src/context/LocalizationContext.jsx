"use client"

import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

const LocalizationContext = createContext()

export const LocalizationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en")

  useEffect(() => {
    loadLanguage()
  }, [])

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("@language")
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage)
      }
    } catch (error) {
      console.error("Error loading language:", error)
    }
  }

  const changeLanguage = async (language) => {
    try {
      setCurrentLanguage(language)
      await AsyncStorage.setItem("@language", language)
    } catch (error) {
      console.error("Error saving language:", error)
    }
  }

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key
  }

  return (
    <LocalizationContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  )
}

export const useLocalization = () => {
  const context = useContext(LocalizationContext)
  if (context === undefined) {
    throw new Error("useLocalization must be used within a LocalizationProvider")
  }
  return context
}

// Translations object
const translations = {
  en: {
    // Welcome Screen
    appTitle: "Citizen Complaint App",
    appSubtitle: "Report issues, track progress, and help improve your community services",
    getStarted: "Get Started",
    alreadyHaveAccount: "Already have an account? Login",

    // Login Screen
    login: "Login",
    email: "Email",
    password: "Password",
    enterEmail: "Enter your email",
    enterPassword: "Enter your password",
    loggingIn: "Logging in...",
    dontHaveAccount: "Don't have an account?",
    registerHere: "Register here",

    // Register Screen
    register: "Register",
    fullName: "Full Name",
    enterFullName: "Enter your full name",
    confirmPassword: "Confirm Password",
    confirmYourPassword: "Confirm your password",
    creatingAccount: "Creating Account...",
    accountTypes: "Account Types:",
    accountTypesDesc:
      '• Regular email = Citizen account\n• Email with "staff" or "department" = Staff account\n• Email with "admin" = Super Admin account',
    passwordsDoNotMatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 6 characters",
    emailAlreadyExists: "Email already exists",
    registrationSuccessful: "Registration Successful!",
    accountCreated: "Your account has been created successfully",
    registrationFailed: "Registration Failed",
    failedCreateAccount: "Failed to create account. Please try again.",

    // Dashboard Common
    welcome: "Welcome",
    welcomeBack: "Welcome back",
    home: "Home",
    reports: "Reports",
    profile: "Profile",
    create: "Create",
    logout: "Logout",
    refresh: "Refresh",
    settings: "Settings",

    // User Dashboard
    trackReports: "Track your reports and create new ones",
    totalReports: "Total Reports",
    pending: "Pending",
    inProgress: "In Progress",
    resolved: "Resolved",
    createNewReport: "Create New Report",
    quickActions: "Quick Actions",
    viewMyReports: "View My Reports",
    editProfile: "Edit Profile",
    refreshReports: "Refresh Reports",
    recentReports: "Recent Reports",
    viewAll: "View All",
    noReports: "No reports yet",
    noReportsDesc: "Create your first report to get started",
    createFirstReport: "Create First Report",
    citizen: "Citizen",
    yourActivity: "Your Activity",
    withPhotos: "With Photos",
    withGPS: "With GPS",
    refreshData: "Refresh Data",

    // Create Report Screen
    createReport: "Create Report",
    category: "Category",
    priority: "Priority",
    location: "Location",
    description: "Description",
    required: "*",
    enterLocation: "Enter the location of the issue",
    describeIssue: "Describe the issue in detail...",
    submitReport: "Submit Report",
    submitting: "Submitting...",
    photoOptional: "Photo (Optional)",
    tapToAddPhoto: "Tap to add a photo\nCamera or Photo Library",
    locationDetectHint: "Tap the location icon to automatically detect your current location",
    camera: "Camera",
    gallery: "Photo Library",

    // Categories
    sanitation: "Sanitation",
    police: "Police",
    electricity: "Electricity",
    roads: "Roads",
    water: "Water",
    other: "Other",

    // Priorities
    high: "High",
    medium: "Medium",
    low: "Low",

    // Status
    assigned: "Assigned",

    // Staff Dashboard
    departmentStaff: "Department Staff Dashboard",
    assignedReports: "Assigned Reports",
    noAssignedReports: "No assigned reports",
    reportsWillAppear: "Reports will appear here when assigned by admin",
    reportedBy: "Reported by",
    start: "Start",
    complete: "Complete",

    // Super Admin Dashboard
    superAdminDashboard: "Super Admin Dashboard",
    systemOverview: "System Overview & Management",
    allReports: "All Reports",
    manageDepartments: "Manage Departments",
    manageStaff: "Manage Staff",
    manageReports: "Manage Reports",
    totalUsers: "Total Users",
    users: "Users",
    staff: "Staff",
    departments: "Departments",
    assign: "Assign",
    addDepartment: "Add Department",
    addStaff: "Add Staff Member",
    departmentName: "Department Name",
    selectDepartment: "Select Department",
    cancel: "Cancel",
    add: "Add",
    active: "Active",
    inactive: "Inactive",
    registeredUsers: "Registered Users",
    joined: "Joined",
    systemStatistics: "System Statistics",
    activeUsers: "Active Users",
    staffMembers: "Staff Members",
    refreshAllData: "Refresh All Data",

    // Toast Messages
    missingInfo: "Missing Information",
    fillAllFields: "Please fill in all fields",
    permissionRequired: "Permission Required",
    locationPermissionNeeded: "Location permission is needed to automatically detect your location for reports.",
    cameraPermissionNeeded: "Camera permission is needed to take photos for your reports.",
    photoLibraryPermissionNeeded: "Photo library permission is needed to select photos for your reports.",
    gettingLocation: "Getting Location",
    detectingLocation: "Detecting your current location...",
    locationDetected: "Location Detected",
    locationAutoFilled: "Your current location has been automatically filled",
    locationError: "Location Error",
    locationFailed: "Failed to get your location. Please enter it manually.",
    photoCaptured: "Photo Captured",
    evidencePhotoAdded: "Evidence photo has been added to your report",
    photoSelected: "Photo Selected",
    cameraError: "Camera Error",
    failedTakePhoto: "Failed to take photo",
    galleryError: "Gallery Error",
    failedSelectImage: "Failed to select image",
    photoRemoved: "Photo Removed",
    evidencePhotoRemoved: "Evidence photo has been removed from your report",
    submittingReport: "Submitting Report",
    pleaseWait: "Please wait while we process your report...",
    reportSubmitted: "Report Submitted Successfully!",
    reportSubmittedDesc: "Your {category} report has been submitted and will be reviewed by our team.",
    submissionFailed: "Submission Failed",
    failedSubmitReport: "Failed to submit report. Please try again.",
    loggingInMsg: "Logging In",
    verifyingCredentials: "Please wait while we verify your credentials...",
    welcomeBackMsg: "Welcome Back!",
    loginSuccessful: "Successfully logged in as {name}",
    loginFailed: "Login Failed",
    invalidCredentials: "Invalid email or password. Please try again.",
    refreshing: "Refreshing",
    loadingReports: "Loading your latest reports...",
    reportsUpdated: "Reports Updated",
    foundReports: "Found {count} reports",
    noReportsFound: "You haven't created any reports yet",
    loadingFailed: "Loading Failed",
    failedLoadReports: "Failed to load your reports",
    loggingOut: "Logging Out",
    seeYouNext: "See you next time!",
    openingMaps: "Opening Maps",
    launchingMaps: "Launching maps application...",
    mapsError: "Maps Error",
    couldNotOpenMaps: "Could not open maps application",

    // Common
    ok: "OK",
    yes: "Yes",
    no: "No",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    back: "Back",
    next: "Next",
    done: "Done",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Info",

    // Location & GPS
    evidencePhoto: "📷 Evidence Photo",
    locationDetails: "📍 Location Details",
    gpsCoordinates: "GPS",

    // Theme
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    language: "Language",
    english: "English",
    kinyarwanda: "Kinyarwanda",
  },

  rw: {
    // Welcome Screen
    appTitle: "Porogaramu y'Ibibazo by'Abaturage",
    appSubtitle: "Tanga raporo z'ibibazo, gukurikirana iterambere, kandi ufashe guteza imbere serivisi z'abaturage",
    getStarted: "Tangira",
    alreadyHaveAccount: "Usanzwe ufite konti? Injira",

    // Login Screen
    login: "Kwinjira",
    email: "Imeyili",
    password: "Ijambo ry'ibanga",
    enterEmail: "Shyiramo imeyili yawe",
    enterPassword: "Shyiramo ijambo ry'ibanga",
    loggingIn: "Kwinjira...",
    dontHaveAccount: "Ntufite konti?",
    registerHere: "Iyandikishe hano",

    // Register Screen
    register: "Kwiyandikisha",
    fullName: "Amazina yose",
    enterFullName: "Shyiramo amazina yawe yose",
    confirmPassword: "Emeza ijambo ry'ibanga",
    confirmYourPassword: "Emeza ijambo ry'ibanga ryawe",
    creatingAccount: "Gukora konti...",
    accountTypes: "Ubwoko bw'amakonti:",
    accountTypesDesc:
      '• Imeyili isanzwe = Konti y\'umuturage\n• Imeyili ifite "staff" cyangwa "department" = Konti y\'umukozi\n• Imeyili ifite "admin" = Konti y\'umuyobozi mukuru',
    passwordsDoNotMatch: "Amagambo y'ibanga ntabwo ahura",
    passwordTooShort: "Ijambo ry'ibanga rigomba kuba rifite byibuze inyuguti 6",
    emailAlreadyExists: "Iyi meyili isanzwe ihari",
    registrationSuccessful: "Kwiyandikisha byagenze neza!",
    accountCreated: "Konti yawe yarakozwe neza",
    registrationFailed: "Kwiyandikisha byanze",
    failedCreateAccount: "Byanze gukora konti. Nyamuneka ongera ugerageze.",

    // Dashboard Common
    welcome: "Murakaza neza",
    welcomeBack: "Murakaza neza nanone",
    home: "Ahabanza",
    reports: "Raporo",
    profile: "Umwirondoro",
    create: "Kora",
    logout: "Gusohoka",
    refresh: "Kuvugurura",
    settings: "Amagenamiterere",

    // User Dashboard
    trackReports: "Gukurikirana raporo zawe no gukora izishya",
    totalReports: "Raporo zose",
    pending: "Zitegereje",
    inProgress: "Ziragenda",
    resolved: "Zakemutse",
    createNewReport: "Kora raporo nshya",
    quickActions: "Ibikorwa byihuse",
    viewMyReports: "Reba raporo zanjye",
    editProfile: "Hindura umwirondoro",
    refreshReports: "Kuvugurura raporo",
    recentReports: "Raporo za vuba",
    viewAll: "Reba byose",
    noReports: "Nta raporo uracyafite",
    noReportsDesc: "Kora raporo yawe ya mbere kugira ngo utangire",
    createFirstReport: "Kora raporo ya mbere",
    citizen: "Umuturage",
    yourActivity: "Ibikorwa byawe",
    withPhotos: "Zifite amafoto",
    withGPS: "Zifite GPS",
    refreshData: "Kuvugurura amakuru",

    // Create Report Screen
    createReport: "Kora raporo",
    category: "Icyiciro",
    priority: "Ibanze",
    location: "Aho biherereye",
    description: "Ibisobanuro",
    required: "*",
    enterLocation: "Shyiramo aho ikibazo kiherereye",
    describeIssue: "Sobanura ikibazo mu buryo burambuye...",
    submitReport: "Kohereza raporo",
    submitting: "Irohereza...",
    photoOptional: "Ifoto (Ntabwo ari ngombwa)",
    tapToAddPhoto: "Kanda kugira ngo wongeremo ifoto\nKamera cyangwa ububiko bw'amafoto",
    locationDetectHint: "Kanda ku kanya ka GPS kugira ngo hamenyekane aho uri ubu",
    camera: "Kamera",
    gallery: "Ububiko bw'amafoto",

    // Categories
    sanitation: "Isuku",
    police: "Polisi",
    electricity: "Amashanyarazi",
    roads: "Imihanda",
    water: "Amazi",
    other: "Ikindi",

    // Priorities
    high: "Byihutirwa",
    medium: "Byagati",
    low: "Bidafite ubwihangane",

    // Status
    pending: "Bitegereje",
    assigned: "Byahawe",
    inProgress: "Biragenda",
    resolved: "Byakemutse",

    // Staff Dashboard
    departmentStaff: "Ikibaho cy'abakozi b'ishami",
    assignedReports: "Raporo zahawe",
    noAssignedReports: "Nta raporo zahawe",
    reportsWillAppear: "Raporo zizagaragara hano iyo umuyobozi azitanze",
    reportedBy: "Yatanzwe na",
    start: "Tangira",
    complete: "Kurangiza",

    // Super Admin Dashboard
    superAdminDashboard: "Ikibaho cy'umuyobozi mukuru",
    systemOverview: "Incamake y'uburyo & ubuyobozi",
    allReports: "Raporo zose",
    manageDepartments: "Gucunga amashami",
    manageStaff: "Gucunga abakozi",
    manageReports: "Gucunga raporo",
    totalUsers: "Abakoresha bose",
    users: "Abakoresha",
    staff: "Abakozi",
    departments: "Amashami",
    assign: "Gutanga",
    addDepartment: "Kongeramo ishami",
    addStaff: "Kongeramo umukozi",
    departmentName: "Izina ry'ishami",
    selectDepartment: "Hitamo ishami",
    cancel: "Kureka",
    add: "Kongeramo",
    active: "Birakora",
    inactive: "Ntibikora",
    registeredUsers: "Abakoresha biyandikishije",
    joined: "Yinjiye",
    systemStatistics: "Imibare y'uburyo",
    activeUsers: "Abakoresha bakora",
    staffMembers: "Abanyamuryango b'abakozi",
    refreshAllData: "Kuvugurura amakuru yose",

    // Toast Messages
    missingInfo: "Amakuru abura",
    fillAllFields: "Nyamuneka uzuza ibice byose",
    permissionRequired: "Uruhushya rukenewe",
    locationPermissionNeeded: "Uruhushya rwo kumenya aho uri rukenewe kugira ngo hamenyekane aho uri mu raporo.",
    cameraPermissionNeeded: "Uruhushya rwa kamera rukenewe kugira ngo ufate amafoto mu raporo zawe.",
    photoLibraryPermissionNeeded: "Uruhushya rw'ububiko bw'amafoto rukenewe kugira ngo uhitemo amafoto mu raporo zawe.",
    gettingLocation: "Kubona aho uri",
    detectingLocation: "Gushakisha aho uri ubu...",
    locationDetected: "Aho uri hamenyekanye",
    locationAutoFilled: "Aho uri ubu byuzujwe mu buryo bwikora",
    locationError: "Ikosa ryo kubona aho uri",
    locationFailed: "Byanze kubona aho uri. Nyamuneka byandike wenyine.",
    photoCaptured: "Ifoto yafashwe",
    evidencePhotoAdded: "Ifoto y'ibimenyetso yongerewe kuri raporo yawe",
    photoSelected: "Ifoto yahiswemo",
    cameraError: "Ikosa rya kamera",
    failedTakePhoto: "Byanze gufata ifoto",
    galleryError: "Ikosa ry'ububiko",
    failedSelectImage: "Byanze guhitamo ifoto",
    photoRemoved: "Ifoto yakuweho",
    evidencePhotoRemoved: "Ifoto y'ibimenyetso yakuweho kuri raporo yawe",
    submittingReport: "Kohereza raporo",
    pleaseWait: "Nyamuneka tegereza mu gihe dutegura raporo yawe...",
    reportSubmitted: "Raporo yoherejwe neza!",
    reportSubmittedDesc: "Raporo yawe ya {category} yoherejwe kandi izasuzumwa n'itsinda ryacu.",
    submissionFailed: "Kohereza byanze",
    failedSubmitReport: "Byanze kohereza raporo. Nyamuneka ongera ugerageze.",
    loggingInMsg: "Kwinjira",
    verifyingCredentials: "Nyamuneka tegereza mu gihe tugenzura ibimenyetso byawe...",
    welcomeBackMsg: "Murakaza neza nanone!",
    loginSuccessful: "Winjiye neza nka {name}",
    loginFailed: "Kwinjira byanze",
    invalidCredentials: "Imeyili cyangwa ijambo ry'ibanga sibyo. Nyamuneka ongera ugerageze.",
    refreshing: "Kuvugurura",
    loadingReports: "Gupakira raporo zawe za vuba...",
    reportsUpdated: "Raporo zavuguruwe",
    foundReports: "Hasanzwe raporo {count}",
    noReportsFound: "Uraca utarakora raporo",
    loadingFailed: "Gupakira byanze",
    failedLoadReports: "Byanze gupakira raporo zawe",
    loggingOut: "Gusohoka",
    seeYouNext: "Tuzabonana!",
    openingMaps: "Gufungura amakarita",
    launchingMaps: "Gutangiza porogaramu y'amakarita...",
    mapsError: "Ikosa ry'amakarita",
    couldNotOpenMaps: "Ntishobora gufungura porogaramu y'amakarita",

    // Common
    ok: "Sawa",
    yes: "Yego",
    no: "Oya",
    save: "Kubika",
    delete: "Gusiba",
    edit: "Guhindura",
    view: "Kureba",
    back: "Gusubira inyuma",
    next: "Komeza",
    done: "Byarangiye",
    loading: "Birapakira...",
    error: "Ikosa",
    success: "Byagenze neza",
    warning: "Iburira",
    info: "Amakuru",

    // Location & GPS
    evidencePhoto: "📷 Ifoto y'ibimenyetso",
    locationDetails: "📍 Amakuru y'aho biherereye",
    gpsCoordinates: "GPS",

    // Theme
    darkMode: "Ubwoko bw'umwijima",
    lightMode: "Ubwoko bw'urumuri",
    language: "Ururimi",
    english: "Icyongereza",
    kinyarwanda: "Ikinyarwanda",
  },
}

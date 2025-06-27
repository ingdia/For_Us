import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar } from "expo-status-bar"
import Toast from "react-native-toast-message"
import { ThemeProvider } from "./src/context/ThemeContext"
import { AuthProvider } from "./src/context/AuthContext"
import { LocalizationProvider } from "./src/context/LocalizationContext"
import { toastConfig } from "./utils/toastConfig"
import WelcomeScreen from "./src/screens/WelcomeScreen"
import LoginScreen from "./src/screens/LoginScreen"
import RegisterScreen from "./src/screens/RegisterScreen"
import UserDashboard from "./src/screens/UserDashboard"
import StaffDashboard from "./src/screens/StaffDashboard"
import SuperAdminDashboard from "./src/screens/SuperAdminDashboard"
import CreateReportScreen from "./src/screens/CreateReportScreen"
import MyReportsScreen from "./src/screens/MyReportsScreen"
import AssignedReportsScreen from "./src/screens/AssignedReportsScreen"
import AllReportsScreen from "./src/screens/AllReportsScreen"
import ManageDepartmentsScreen from "./src/screens/ManageDepartmentsScreen"
import ManageStaffScreen from "./src/screens/ManageStaffScreen"
import ProfileScreen from "./src/screens/ProfileScreen"

const Stack = createStackNavigator()

export default function App() {
  return (
    <LocalizationProvider>
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="UserDashboard" component={UserDashboard} />
              <Stack.Screen name="StaffDashboard" component={StaffDashboard} />
              <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboard} />
              <Stack.Screen name="CreateReport" component={CreateReportScreen} />
              <Stack.Screen name="MyReports" component={MyReportsScreen} />
              <Stack.Screen name="AssignedReports" component={AssignedReportsScreen} />
              <Stack.Screen name="AllReports" component={AllReportsScreen} />
              <Stack.Screen name="ManageDepartments" component={ManageDepartmentsScreen} />
              <Stack.Screen name="ManageStaff" component={ManageStaffScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
            <Toast config={toastConfig} />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </LocalizationProvider>
  )
}

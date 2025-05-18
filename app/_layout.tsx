import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";

import AddMedicineScreen from "./addMedicine.js";
import HomeScreen from "./home.js";
import LoginScreen from "./login.js";
import MedicineDetailScreen from "./medicineDetail.js";
import ProfileScreen from "./profile.js";
import RegistrationScreen from "./register.js";
import ReminderScreen from "./reminder.js";
import SearchScreen from "./search.js";
import SplashScreen from "./splash.js";
import ReminderForm from "./reminderForm.js";
import MyMedicinesScreen from "./myMedicines.js";
import UserMedicineDetail from "./userMedicineDetail.js";
import MedicineReminderSelectScreen from "./medicineReminderSelect.js";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const MainStack = createStackNavigator();

function MainStackNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs" component={MainTabsComponent} />
      <MainStack.Screen
        name="MedicineDetail"
        component={MedicineDetailScreen}
      />
      <MainStack.Screen name="AddMedicine" component={AddMedicineScreen} />
      <MainStack.Screen name="ReminderForm" component={ReminderForm} />
      <MainStack.Screen
        name="UserMedicineDetail"
        component={UserMedicineDetail}
      />
      <MainStack.Screen
        name="MedicineReminderSelect"
        component={MedicineReminderSelectScreen}
      />
    </MainStack.Navigator>
  );
}

function MainTabsComponent() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "search":
              iconName = focused ? "search" : "search-outline";
              break;
            case "myMedicines":
              iconName = focused ? "medkit" : "medkit-outline";
              break;
            case "reminder":
              iconName = focused ? "alarm" : "alarm-outline";
              break;
            case "profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
      })}
    >
      <Tab.Screen name="home" component={HomeScreen} />
      <Tab.Screen name="search" component={SearchScreen} />
      <Tab.Screen name="myMedicines" component={MyMedicinesScreen} />
      <Tab.Screen name="reminder" component={ReminderScreen} />
      <Tab.Screen name="profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack({ onLogin }: { onLogin: () => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login">
        {(props) => <LoginScreen {...props} onLogin={onLogin} />}
      </Stack.Screen>
      <Stack.Screen name="register" component={RegistrationScreen} />
    </Stack.Navigator>
  );
}

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!isLoggedIn) {
    return <AuthStack onLogin={() => setIsLoggedIn(true)} />;
  }

  return <MainStackNavigator />;
}

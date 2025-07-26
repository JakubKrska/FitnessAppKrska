import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

import WorkoutPlanManagerScreen from "../screens/WorkoutPlanManagerScreen";
import ProfileScreen from '../screens/ProfileScreen';
import ExerciseManagerScreen from "../screens/ExerciseManagerScreen";
import WorkoutHistoryScreen from "../screens/WorkoutHistoryScreen";
import DashboardScreen from "../screens/DashboardScreen";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading, true/false = hotovo

    useEffect(() => {
        const run = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                setIsLoggedIn(!!token);
            } catch (err) {
                console.error("Chyba při ověřování přihlášení", err);
            }
        };

        run();
    }, []);

    // Dokud se neověří login, nerenderuj nic (nebo nahraď loaderem)
    if (isLoggedIn === null) return null;
    if (!isLoggedIn) return null; // Nepřihlášený uživatel by se sem neměl vůbec dostat

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                tabBarIcon: ({ color, size }) => {
                    switch (route.name) {
                        case "Dashboard":
                            return <MaterialIcons name="dashboard" size={size} color={color} />;
                        case "Plány":
                            return <Ionicons name="fitness" size={size} color={color} />;
                        case "Cviky":
                            return <Ionicons name="barbell" size={size} color={color} />;
                        case "Historie":
                            return <MaterialIcons name="history" size={size} color={color} />;
                        case "Profil":
                            return <Ionicons name="person" size={size} color={color} />;
                    }
                },
                tabBarActiveTintColor: "#1976D2",
                tabBarInactiveTintColor: "#999",
                tabBarLabelStyle: { fontSize: 12 },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Plány" component={WorkoutPlanManagerScreen} />
            <Tab.Screen name="Cviky" component={ExerciseManagerScreen} />
            <Tab.Screen name="Historie" component={WorkoutHistoryScreen} />
            <Tab.Screen name="Profil" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;

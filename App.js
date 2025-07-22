import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { apiFetch } from './api';

// Obrazovky
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import OnboardingGoalScreen from './screens/OnboardingGoalScreen';
import RecommendedPlansScreen from './screens/RecommendedPlansScreen';
import BottomTabNavigator from './navigation/BottomTabNavigator'; // obsahuje Dashboard

const Stack = createNativeStackNavigator();

export default function App() {
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {
        const checkStartupState = async () => {
            const token = await AsyncStorage.getItem('token');
            const seenWelcome = await AsyncStorage.getItem('hasSeenWelcome');

            if (!seenWelcome) return setInitialRoute("Welcome");
            if (!token) return setInitialRoute("Login");

            try {
                const user = await apiFetch("/users/me");
                if (!user.goal || user.goal === "") {
                    return setInitialRoute("OnboardingGoal");
                }
                return setInitialRoute("Dashboard");
            } catch (e) {
                console.error("Chyba při načítání uživatele", e);
                return setInitialRoute("Login");
            }
        };

        checkStartupState();
    }, []);

    if (!initialRoute) return null; // nebo loader

    return (
        <>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName={initialRoute}
                    screenOptions={{ headerShown: false }}
                >
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} />
                    <Stack.Screen name="RecommendedPlans" component={RecommendedPlansScreen} />
                    <Stack.Screen name="Dashboard" component={BottomTabNavigator} />
                </Stack.Navigator>
            </NavigationContainer>
            <Toast />
        </>
    );
}

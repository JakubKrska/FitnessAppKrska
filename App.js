import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { API_URL } from '@env';
import { apiFetch } from './api';


// Obrazovky
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import WelcomeScreen from './screens/WelcomeScreen';
import OnboardingGoalScreen from './screens/OnboardingGoalScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [hasSeenWelcome, setHasSeenWelcome] = useState(null);
    const [needsGoalSetup, setNeedsGoalSetup] = useState(false);

    useEffect(() => {
        const checkStartupState = async () => {
            const token = await AsyncStorage.getItem('token');
            const seenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
            setIsLoggedIn(!!token);
            setHasSeenWelcome(!!seenWelcome);

            if (token) {
                try {
                    const user = await apiFetch("/users/me");
                    if (!user.goal || user.goal === "") {
                        setNeedsGoalSetup(true);
                    }
                } catch (e) {
                    console.error("Chyba při načítání uživatele", e);
                }
            }
        };
        checkStartupState();
    }, []);

    if (isLoggedIn === null || hasSeenWelcome === null) return null; // loader

    return (
        <>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    {!hasSeenWelcome ? (
                        <Stack.Screen name="Welcome" component={WelcomeScreen}/>
                    ) : isLoggedIn ? (
                        needsGoalSetup ? (
                            <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen}/>
                        ) : (
                            <Stack.Screen name="MainApp" component={BottomTabNavigator}/>
                        )
                    ) : (
                        <>
                            <Stack.Screen name="Login" component={LoginScreen}/>
                            <Stack.Screen name="Register" component={RegisterScreen}/>
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
            <Toast/>
        </>
    );
}

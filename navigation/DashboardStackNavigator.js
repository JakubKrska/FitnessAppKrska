import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import DashboardScreen from "../screens/DashboardScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import WorkoutSessionScreen from "../screens/WorkoutSessionScreen";
import WorkoutHistoryDetailScreen from "../screens/WorkoutHistoryDetailScreen";
import PerformanceChartScreen from "../screens/PerformanceChartScreen";
import WorkoutSummaryScreen from "../screens/WorkoutSummaryScreen";
import ReminderFormScreen from "../screens/ReminderFormScreen";
import ReminderListScreen from "../screens/ReminderListScreen";
import BadgesScreen from "../screens/BadgesScreen";
import OnboardingGoalScreen from "../screens/OnboardingGoalScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import WeightScreen from "../screens/WeightScreen";
import ExerciseDetailsScreen from "../screens/ExerciseDetailsScreen";
import SelectPlanForExerciseScreen from "../screens/SelectPlanForExerciseScreen";

const Stack = createNativeStackNavigator();

const DashboardStackNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{title: "Welcome"}} />
            <Stack.Screen name="Login" component={LoginScreen} options={{title: "Login"}} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{title: "Register"}} />
            <Stack.Screen name="MainApp" component={BottomTabNavigator} options={{title: "Main"}} />
            <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} options={{title: "Onboard"}} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{title: "Dashboard"}}/>
            <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} options={{title: "Nastavení Cíle"}}/>
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{title: "Úprava profilu"}}/>
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{title: "Změna hesla"}}/>
            <Stack.Screen name="WeightScreen" component={WeightScreen} options={{title: "Vývoj váhy"}}/>
            <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} options={{title: "Trénink"}}/>
            <Stack.Screen name="PerformanceChart" component={PerformanceChartScreen} options={{title: "Statistiky výkonu"}}/>
            <Stack.Screen name="WorkoutHistoryDetail" component={WorkoutHistoryDetailScreen} options={{title: "Detail tréninku"}}/>
            <Stack.Screen name="Reminders" component={ReminderListScreen}/>
            <Stack.Screen name="AddReminder" component={ReminderFormScreen}/>
            <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen}/>
            <Stack.Screen name="Badges" component={BadgesScreen} options={{title: "Všechny odznaky"}}/>
            <Stack.Screen name="ExerciseDetails" component={ExerciseDetailsScreen} options={{ headerShown: true, title: 'Detail cviku' }}/>
            <Stack.Screen name="SelectPlanForExercise" component={SelectPlanForExerciseScreen} options={{ title: 'Výběr plánu' }}/>

        </Stack.Navigator>
    )
};

export default DashboardStackNavigator;

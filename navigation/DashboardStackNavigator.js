import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import DashboardScreen from "../screens/DashboardScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import WeightChartScreen from "../screens/WeightChartScreen";
import WeightFormScreen from "../screens/WeightFormScreen";
import WorkoutSessionScreen from "../screens/WorkoutSessionScreen";
import WorkoutHistoryDetailScreen from "../screens/WorkoutHistoryDetailScreen";
import PerformanceChartScreen from "../screens/PerformanceChartScreen";
import WorkoutSummaryScreen from "../screens/WorkoutSummaryScreen";
import ReminderFormScreen from "../screens/ReminderFormScreen";
import ReminderListScreen from "../screens/ReminderListScreen";
import BadgesScreen from "../screens/BadgesScreen";

const Stack = createNativeStackNavigator();

const DashboardStackNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="DashboardHome" component={DashboardScreen} options={{title: "Dashboard"}}/>
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{title: "Úprava profilu"}}/>
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{title: "Změna hesla"}}/>
            <Stack.Screen name="WeightChart" component={WeightChartScreen} options={{title: "Vývoj váhy"}}/>
            <Stack.Screen name="WeightForm" component={WeightFormScreen} options={{title: "Zaznamenat váhu"}}/>
            <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} options={{title: "Trénink"}}/>
            <Stack.Screen name="PerformanceChart" component={PerformanceChartScreen}
                          ptions={{title: "Statistiky výkonu"}}/>
            <Stack.Screen name="WorkoutHistoryDetail" component={WorkoutHistoryDetailScreen}
                          options={{title: "Detail tréninku"}}/>
            <Stack.Screen name="Reminders" component={ReminderListScreen}/>
            <Stack.Screen name="AddReminder" component={ReminderFormScreen}/>
            <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen}/>
            <Stack.Screen name="Badges" component={BadgesScreen} options={{title: "Všechny odznaky"}}/> {/* nový */}
        </Stack.Navigator>
    );
};

export default DashboardStackNavigator;

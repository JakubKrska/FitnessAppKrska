import React, { useState, useCallback, useLayoutEffect } from "react";
import {
    ScrollView,
    Text,
    StyleSheet,
    ActivityIndicator,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { colors, spacing } from "../components/ui/theme";
import AppButton from "../components/ui/AppButton";
import AppCard from "../components/ui/AppCard";
import AppTitle from "../components/ui/AppTitle";
import PlanCard from "../components/PlanCard";
import WorkoutCard from "../components/WorkoutCard";
import { apiFetch } from "../api";

const DashboardScreen = () => {
    const [userData, setUserData] = useState(null);
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [userPlans, setUserPlans] = useState([]);
    const [bmi, setBmi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState(0);

    const navigation = useNavigation();

    const fetchUser = useCallback(async () => {
        const token = await AsyncStorage.getItem("token");
        const userId = await AsyncStorage.getItem("userId");
        if (!token || !userId) return navigation.navigate("Login");

        try {
            const data = await apiFetch("/users/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserData(data);
            if (data.height && data.weight) {
                const bmiVal = (data.weight / ((data.height / 100) ** 2)).toFixed(1);
                setBmi(bmiVal);
            }
        } catch {
            navigation.navigate("Login");
        }
    }, []);

    const fetchHistory = useCallback(async () => {
        const token = await AsyncStorage.getItem("token");
        try {
            const history = await apiFetch("/workout-history", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWorkoutHistory(history);
            setStreak(calculateStreak(history));
        } catch (e) {
            console.error("Chyba načítání historie:", e);
        }
    }, []);

    const fetchPlans = useCallback(async () => {
        const token = await AsyncStorage.getItem("token");
        const userId = await AsyncStorage.getItem("userId");
        try {
            const plans = await apiFetch("/workout-plans", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserPlans(plans.filter(p => p.userId?.toString() === userId));
        } catch (e) {
            console.error("Chyba načítání plánů:", e);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchUser(), fetchHistory(), fetchPlans()]);
            setLoading(false);
        };
        load();
    }, [fetchUser, fetchHistory, fetchPlans]));

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <AppButton
                    title="Odhlásit se"
                    color={colors.danger}
                    onPress={async () => {
                        await AsyncStorage.clear();
                        navigation.navigate("Login");
                    }}
                />
            ),
        });
    }, [navigation]);

    const calculateStreak = (history) => {
        const days = new Set(history.map(h =>
            new Date(h.completedAt).toISOString().slice(0, 10)
        ));

        let streak = 0;
        let current = new Date();
        current.setHours(0, 0, 0, 0);

        while (days.has(current.toISOString().slice(0, 10))) {
            streak += 1;
            current.setDate(current.getDate() - 1);
        }

        return streak;
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const lastWorkout = workoutHistory[0];

    return (
        <ScrollView style={styles.container}>
            <AppTitle>Tvé pokroky</AppTitle>
            {userData && (
                <AppCard>
                    <Text>{userData.name}</Text>
                    <Text>Cíl: {userData.goal}</Text>
                    <Text>Výška: {userData.height} cm</Text>
                    <Text>Váha: {userData.weight} kg</Text>
                    <Text>BMI: {bmi ? `${bmi} (${getBMIStatus(bmi)})` : "Zadej výšku a váhu v profilu"}</Text>
                    <Text>Úroveň: {userData.experienceLevel}</Text>
                </AppCard>
            )}

            <AppTitle>Rychlé akce</AppTitle>
            <AppButton title="Vývoj váhy" onPress={() => navigation.navigate("WeightScreen")} />

            <AppTitle>Aktivní dny v řadě</AppTitle>
            <AppCard>
                <Text style={styles.streak}>{streak} dní v řadě</Text>
            </AppCard>

            <AppTitle>Tréninkové plány</AppTitle>
            {userPlans.length === 0 ? (
                <Text>Nemáš žádné tréninkové plány</Text>
            ) : (
                userPlans.map(plan => (
                    <PlanCard
                        key={plan.id}
                        name={plan.name}
                        goal={plan.goal}
                        level={plan.experienceLevel}
                        onPress={() =>
                            navigation.navigate("WorkoutSession", { planId: plan.id })
                        }
                    />
                ))
            )}

            <AppTitle>Poslední cvičení</AppTitle>
            {!lastWorkout ? (
                <Text>Žádné záznamy</Text>
            ) : (
                <WorkoutCard
                    planName={lastWorkout.workoutPlanName || "Neznámý plán"}
                    completedAt={lastWorkout.completedAt}
                    onPress={() =>
                        navigation.navigate("WorkoutHistoryDetail", {
                            historyId: lastWorkout.id,
                            completedAt: lastWorkout.completedAt,
                            planName: lastWorkout.workoutPlanName,
                            planId: lastWorkout.workoutPlanId,
                        })
                    }
                />
            )}
        </ScrollView>
    );
};

const getBMIStatus = (bmi) => {
    const val = parseFloat(bmi);
    if (val < 18.5) return "Podváha";
    if (val < 25) return "Normální";
    if (val < 30) return "Nadváha";
    return "Obezita";
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.large,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    streak: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.primary,
        textAlign: "center",
    },
});

export default DashboardScreen;

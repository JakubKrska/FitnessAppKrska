import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppTitle from '../components/ui/AppTitle';
import AppButton from '../components/ui/AppButton';
import { colors, spacing } from '../components/ui/theme';

const GOALS = [
    "Zhubnout",
    "Nabrat svaly",
    "Zlepšit kondici",
    "Zdravotní důvody",
    "Zvýšit sílu",
];

const OnboardingGoalScreen = ({ navigation }) => {
    const [selectedGoal, setSelectedGoal] = useState(null);

    const saveGoal = async () => {
        const token = await AsyncStorage.getItem("token");
        if (!selectedGoal || !token) {
            Alert.alert("Vyber svůj cíl.");
            return;
        }

        const res = await fetch("http://localhost:8081/users/me", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ goal: selectedGoal }),
        });

        if (!res.ok) {
            const err = await res.text();
            Alert.alert("Chyba při ukládání", err);
            return;
        }

        // pokračuj na výběr plánu (může být navržena další obrazovka)
        navigation.replace("RecommendedPlans", { goal: selectedGoal });
    };

    return (
        <View style={styles.container}>
            <AppTitle>Jaký je tvůj cíl?</AppTitle>
            {GOALS.map((goal) => (
                <AppButton
                    key={goal}
                    title={goal}
                    onPress={() => setSelectedGoal(goal)}
                    style={{
                        backgroundColor:
                            selectedGoal === goal ? colors.primary : colors.card,
                        marginBottom: spacing.small,
                    }}
                />
            ))}
            <AppButton title="Pokračovat" onPress={saveGoal} disabled={!selectedGoal} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
        flex: 1,
    },
});

export default OnboardingGoalScreen;

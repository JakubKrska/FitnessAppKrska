import React, { useState } from 'react';
import { View, Alert, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppTitle from '../components/ui/AppTitle';
import AppButton from '../components/ui/AppButton';
import { colors, spacing } from '../components/ui/theme';
import { apiFetch } from '../api';

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

        if (!token) {
            Alert.alert("Chyba", "Přihlášení selhalo");
            return;
        }

        try {
            if (selectedGoal) {
                const response = await apiFetch("/users/me", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ goal: selectedGoal }),
                });

                console.log("Goal uložen:", response);
            }

            // Přesměrování na dashboard
            navigation.replace("Dashboard");

        } catch (err) {
            console.error("Chyba při ukládání goal:", err);
            Alert.alert("Chyba", "Nepodařilo se uložit cíl.");
        }
    };

    return (
        <View style={styles.container}>
            <AppTitle>Jaký je tvůj cíl?</AppTitle>

            {selectedGoal && (
                <Text style={styles.selected}>Zvolený cíl: {selectedGoal}</Text>
            )}

            {GOALS.map((goal) => (
                <AppButton
                    key={goal}
                    title={goal}
                    onPress={() => setSelectedGoal(goal)}
                    style={{
                        backgroundColor: selectedGoal === goal ? colors.primary : colors.card,
                        marginBottom: spacing.small,
                    }}
                    textStyle={{
                        color: selectedGoal === goal ? colors.white : colors.text,
                    }}
                />
            ))}

            <AppButton
                title={selectedGoal ? "Pokračovat" : "Přeskočit a pokračovat"}
                onPress={saveGoal}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
        flex: 1,
    },
    selected: {
        textAlign: 'center',
        marginBottom: spacing.medium,
        color: colors.primary,
        fontWeight: 'bold',
    },
});

export default OnboardingGoalScreen;

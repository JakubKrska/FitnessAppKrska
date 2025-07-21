import React, {useState} from 'react';
import {View, Alert, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppTitle from '../components/ui/AppTitle';
import AppButton from '../components/ui/AppButton';
import {colors, spacing} from '../components/ui/theme';
import { apiFetch } from '../api';

const GOALS = [
    "Zhubnout",
    "Nabrat svaly",
    "Zlepšit kondici",
    "Zdravotní důvody",
    "Zvýšit sílu",
];

const OnboardingGoalScreen = ({navigation}) => {
    const [selectedGoal, setSelectedGoal] = useState(null);

    const saveGoal = async () => {
        const token = await AsyncStorage.getItem("token");
        if (!selectedGoal || !token) {
            Alert.alert("Vyber svůj cíl.");
            return;
        }

        try {
            await apiFetch("/users/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({goal: selectedGoal}),
            });

            navigation.replace("RecommendedPlans", {goal: selectedGoal});
        } catch (err) {
            Alert.alert("Chyba při ukládání", typeof err === "string" ? err : "Neznámá chyba.");
        }
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
            <AppButton title="Pokračovat" onPress={saveGoal} disabled={!selectedGoal}/>
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

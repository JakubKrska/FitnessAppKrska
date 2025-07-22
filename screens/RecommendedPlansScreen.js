import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Alert, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppCard from '../components/ui/AppCard';
import AppButton from '../components/ui/AppButton';
import AppTitle from '../components/ui/AppTitle';
import {colors, spacing} from '../components/ui/theme';
import { apiFetch } from '../api';

const RecommendedPlansScreen = ({route, navigation}) => {
    const {goal} = route.params;
    const [plans, setPlans] = useState([]);

    const fetchPlans = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            const allPlans = await apiFetch("/workout-plans", {
                headers: {Authorization: `Bearer ${token}`},
            });

            const filtered = allPlans.filter(
                (p) => p.goal === goal && p.isDefault
            );

            setPlans(filtered);
        } catch (err) {
            Alert.alert("Chyba při načítání plánů", String(err));
        }
    };

    const selectPlan = async (planId) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const userId = await AsyncStorage.getItem("userId");

            if (!userId || !token) return;

            await apiFetch("/workout-plans", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId,
                    name: "Můj plán – " + goal,
                    description: "Doporučený plán pro cíl: " + goal,
                    goal,
                    experienceLevel: "Začátečník",
                    isDefault: false,
                    basePlanId: planId,
                }),
            });

            Alert.alert("Plán přidán", "Doporučený plán byl přidán mezi tvé tréninky.");
            navigation.reset({
                index: 0,
                routes: [{ name: "Dashboard" }],
            });
        } catch (err) {
            Alert.alert("Chyba", typeof err === "string" ? err : "Nepodařilo se přidat plán.");
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>Doporučené plány pro cíl: {goal}</AppTitle>
            {plans.length === 0 ? (
                <Text style={styles.text}>Žádné doporučené plány nenalezeny.</Text>
            ) : (
                plans.map((plan) => (
                    <AppCard key={plan.id}>
                        <Text style={styles.name}>{plan.name}</Text>
                        <Text>{plan.description}</Text>
                        <AppButton title="Vybrat tento plán" onPress={() => selectPlan(plan.id)}/>
                    </AppCard>
                ))
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
        flexGrow: 1,
    },
    text: {
        fontSize: 16,
        color: colors.text,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: spacing.small,
        color: colors.text,
    },
});

export default RecommendedPlansScreen;

import React, { useEffect, useState} from 'react';
import {
    ScrollView,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';

import { apiFetch } from '../api';
import AppTitle from '../components/ui/AppTitle';
import { colors, spacing } from '../components/ui/theme';

const SelectPlanForExerciseScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { exerciseId } = route.params;

    const [plans, setPlans] = useState([]);
    const [token, setToken] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const load = async () => {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUserId = await AsyncStorage.getItem('userId');
            setToken(storedToken);
            setUserId(storedUserId);

            if (storedToken) fetchPlans(storedToken);
        };
        load();
    }, []);

    const fetchPlans = async (token) => {
        try {
            const res = await apiFetch('/workout-plans', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPlans(res);
        } catch (err) {
            console.error('❌ Chyba při načítání plánů:', err);
            Alert.alert('Chyba', 'Nepodařilo se načíst tréninkové plány.');
        }
    };

    const handleSelectPlan = (planId) => {
        navigation.navigate('WorkoutPlanDetails', {
            planId,
            prefillExerciseId: exerciseId,
        });
    };

    const userPlans = plans.filter(
        (p) => !p.isDefault && p.userId === userId
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>Vyber plán</AppTitle>
            {userPlans.length === 0 ? (
                <Text style={styles.noPlans}>Nemáš žádné vlastní plány.</Text>
            ) : (
                userPlans.map((plan) => (
                    <TouchableOpacity key={plan.id} onPress={() => handleSelectPlan(plan.id)} style={styles.card}>
                        <Text style={styles.title}>{plan.name}</Text>
                        <Text>{plan.goal} • {plan.experienceLevel}</Text>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
    },
    card: {
        backgroundColor: colors.gray,
        padding: spacing.medium,
        borderRadius: 8,
        marginBottom: spacing.medium,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: spacing.small,
        color: colors.text,
    },
    noPlans: {
        color: colors.gray,
        fontStyle: 'italic',
    },
});

export default SelectPlanForExerciseScreen;

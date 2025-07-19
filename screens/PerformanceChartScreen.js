import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppTitle from '../components/ui/AppTitle';
import ExercisePerformanceChart from '../components/ExercisePerformanceChart';
import { colors, spacing } from '../components/ui/theme';

const PerformanceChartScreen = ({ route }) => {
    const { exerciseId, exerciseName } = route.params;
    const [dataPoints, setDataPoints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');

                const res = await fetch(`http://localhost:8081/exercises/${exerciseId}/performance`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error(await res.text());

                const raw = await res.json();

                // Transformace dat pro graf
                const formatted = raw
                    .filter(p => p.weightUsed != null)
                    .map(p => ({
                        date: new Date(p.completedAt || p.createdAt || Date.now())
                            .toLocaleDateString('cs-CZ'),
                        weight: p.weightUsed,
                    }));

                setDataPoints(formatted);
            } catch (err) {
                console.error('Chyba při načítání dat:', err);
                Alert.alert('Chyba', 'Nepodařilo se načíst data pro graf.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [exerciseId]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>Sledování výkonu</AppTitle>
            <Text style={styles.subtitle}>{exerciseName}</Text>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : (
                <ExercisePerformanceChart dataPoints={dataPoints} />
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
    subtitle: {
        fontSize: 16,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.medium,
    },
});

export default PerformanceChartScreen;

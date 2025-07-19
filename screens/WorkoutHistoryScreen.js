// screens/WorkoutHistoryScreen.js
import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import WorkoutHistoryCard from '../components/WorkoutHistoryCard';
import AppTitle from '../components/ui/AppTitle';
import { colors, spacing } from '../components/ui/theme';

const WorkoutHistoryScreen = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    const fetchHistory = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            const res = await fetch("http://localhost:8081/users/me/history", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();
            setHistory(data);
        } catch (err) {
            console.error("Chyba při načítání historie:", err);
            Alert.alert("Chyba", "Nepodařilo se načíst historii cvičení.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>Historie cvičení</AppTitle>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : history.length === 0 ? (
                <Text style={styles.empty}>Zatím nemáš žádné dokončené tréninky.</Text>
            ) : (
                history.map(entry => (
                    <TouchableOpacity
                        key={entry.id}
                        onPress={() => navigation.navigate("WorkoutHistoryDetail", {
                            historyId: entry.id,
                            completedAt: entry.completedAt,
                            planName: entry.workoutPlanName,
                            planId: entry.workoutPlanId
                        })}
                    >
                        <WorkoutHistoryCard
                            date={new Date(entry.completedAt).toLocaleDateString('cs-CZ', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                            planName={entry.workoutPlanName || "Neznámý plán"}
                        />
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
        flexGrow: 1,
    },
    empty: {
        textAlign: 'center',
        color: colors.gray,
        marginTop: spacing.large,
        fontSize: 16,
    },
});

export default WorkoutHistoryScreen;

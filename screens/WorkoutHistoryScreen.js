import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker'; // nezapomeň nainstalovat: npm install @react-native-picker/picker

import WorkoutHistoryCard from '../components/WorkoutHistoryCard';
import AppTitle from '../components/ui/AppTitle';
import { colors, spacing } from '../components/ui/theme';
import { apiFetch } from '../api';

const WorkoutHistoryScreen = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("newest");
    const navigation = useNavigation();

    const fetchHistory = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            const data = await apiFetch("/users/me/history", {
                headers: { Authorization: `Bearer ${token}` },
            });

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

    const sortedHistory = [...history].sort((a, b) => {
        const dateA = new Date(a.completedAt);
        const dateB = new Date(b.completedAt);

        switch (sortBy) {
            case "oldest":
                return dateA - dateB;
            case "planName":
                return (a.workoutPlanName || "").localeCompare(b.workoutPlanName || "");
            case "newest":
            default:
                return dateB - dateA;
        }
    });

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>Historie cvičení</AppTitle>

            <Text style={styles.sortLabel}>Seřadit podle:</Text>
            <Picker
                selectedValue={sortBy}
                onValueChange={(value) => setSortBy(value)}
                style={styles.picker}
            >
                <Picker.Item label="Nejnovější" value="newest" />
                <Picker.Item label="Nejstarší" value="oldest" />
                <Picker.Item label="Název plánu (A–Z)" value="planName" />
            </Picker>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : sortedHistory.length === 0 ? (
                <Text style={styles.empty}>Zatím nemáš žádné dokončené tréninky.</Text>
            ) : (
                sortedHistory.map(entry => (
                    <TouchableOpacity
                        key={entry.id}
                        onPress={() => navigation.navigate("WorkoutHistoryDetail", {
                            historyId: entry.id,
                            completedAt: entry.completedAt,
                            planName: entry.workoutPlanName,
                            planId: entry.workoutPlanId,
                        })}
                    >
                        <WorkoutHistoryCard
                            date={new Date(entry.completedAt).toLocaleDateString('cs-CZ', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
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
    sortLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: spacing.small,
        color: colors.text,
    },
    picker: {
        marginBottom: spacing.medium,
        color: colors.text,
    },
    empty: {
        textAlign: 'center',
        color: colors.gray,
        marginTop: spacing.large,
        fontSize: 16,
    },
});

export default WorkoutHistoryScreen;

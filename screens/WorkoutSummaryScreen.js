import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Share,
    ScrollView,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

import AppButton from '../components/ui/AppButton';
import AppTitle from '../components/ui/AppTitle';
import AppCard from '../components/ui/AppCard';
import BadgeDetailModal from '../components/BadgeDetailModal';
import Toast from 'react-native-toast-message';

import { colors, spacing } from '../components/ui/theme';
import { apiFetch } from '../api';

const speak = (text) =>
    Speech.speak(text, {
        language: 'cs-CZ',
        pitch: 1.0,
        rate: 1.0,
    });

const WorkoutSummaryScreen = ({ route, navigation }) => {
    const {
        completedAt,
        planName,
        exercisesCompleted,
        totalSets,
        totalReps,
        userId: passedUserId,
        planId: passedPlanId,
    } = route.params;

    const [selectedBadge, setSelectedBadge] = useState(null);

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const userId = passedUserId || await AsyncStorage.getItem('userId');

                if (!token || !userId || !passedPlanId) return;

                const response = await apiFetch(`/badges/unlock`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        userId,
                        workoutPlanId: passedPlanId,
                        completedAt,
                    }),
                });

                const newBadges = response?.newBadges ?? [];

                if (newBadges.length > 0) {
                    Toast.show({
                        type: 'success',
                        text1: '🎉 Nový odznak!',
                        text2: `${newBadges[0].name}`,
                        onPress: () => setSelectedBadge(newBadges[0]),
                    });
                }
            } catch (err) {
                console.warn('Odznaky nejsou aktivní nebo dočasná chyba:', err.message);
            }

            speak("Trénink dokončen. Skvělá práce!");
        };

        fetchBadges();
    }, []);

    const handleShare = async () => {
        try {
            const message = `Právě jsem dokončil(a) trénink "${planName}"!\n📅 ${new Date(completedAt).toLocaleString('cs-CZ')}\n🔥 Cviky: ${exercisesCompleted} | Série: ${totalSets} | Opakování: ${totalReps}`;
            await Share.share({ message });
        } catch (error) {
            Alert.alert("Chyba", "Sdílení selhalo: " + error.message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>✅ Shrnutí tréninku</AppTitle>

            <AppCard>
                <Text style={styles.item}>Plán: {planName}</Text>
                <Text style={styles.item}>Dokončeno: {new Date(completedAt).toLocaleString('cs-CZ')}</Text>
                <Text style={styles.item}>Cviky: {exercisesCompleted}</Text>
                <Text style={styles.item}>Série: {totalSets}</Text>
                <Text style={styles.item}>Opakování: {totalReps}</Text>
            </AppCard>

            <View style={styles.shareSection}>
                <Text style={styles.shareTitle}>📤 Sdílej svůj výkon</Text>
                <AppButton title="Sdílet výsledek" onPress={handleShare} />
            </View>

            <AppButton
                title="Zpět na Dashboard"
                onPress={() =>
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainTabs', params: { screen: 'Dashboard' } }],
                    })
                }
            />

            <BadgeDetailModal
                visible={!!selectedBadge}
                badge={selectedBadge}
                onClose={() => setSelectedBadge(null)}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
        flexGrow: 1,
        justifyContent: 'center',
    },
    item: {
        fontSize: 16,
        color: colors.text,
        marginBottom: spacing.small,
    },
    shareSection: {
        marginVertical: spacing.large,
    },
    shareTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: spacing.small,
        textAlign: 'center',
        color: colors.primary,
    },
});

export default WorkoutSummaryScreen;

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Share, ScrollView, Alert } from 'react-native';
import AppButton from '../components/ui/AppButton';
import AppTitle from '../components/ui/AppTitle';
import { colors, spacing } from '../components/ui/theme';
import Toast from 'react-native-toast-message';
import BadgeDetailModal from '../components/BadgeDetailModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WorkoutSummaryScreen = ({ route, navigation }) => {
    const { completedAt, planName, exercisesCompleted, totalSets, totalReps } = route.params;

    const [unlockedBadges, setUnlockedBadges] = useState([]);
    const [selectedBadge, setSelectedBadge] = useState(null);

    useEffect(() => {
        const fetchBadges = async () => {
            const token = await AsyncStorage.getItem('token');
            try {
                const res = await fetch('http://localhost:8081/workout-history', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        id: crypto.randomUUID(),
                        userId: route.params.userId,
                        workoutPlanId: route.params.planId,
                        completedAt,
                    }),
                });

                const json = await res.json();

                if (res.ok) {
                    const json = await res.json();
                    const newBadges = json.newBadges ?? [];

                    if (newBadges.length > 0) {
                        setUnlockedBadges(newBadges);
                        Toast.show({
                            type: 'success',
                            text1: '🎉 Nový odznak!',
                            text2: `${newBadges[0].name}`,
                            onPress: () => setSelectedBadge(newBadges[0]),
                        });
                    }
                }
            } catch (err) {
                console.error("Chyba při fetchi odznaků", err);
            }
        };

        fetchBadges();
    }, []);

    const handleShare = async () => {
        try {
            const message = `Právě jsi dokončil(a) trénink "${planName}"!\n📅 ${new Date(completedAt).toLocaleString('cs-CZ')}\n🔥 Cviky: ${exercisesCompleted} | Série: ${totalSets} | Opakování: ${totalReps}`;
            await Share.share({ message });
        } catch (error) {
            Alert.alert("Chyba", "Sdílení selhalo: " + error.message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>✅ Shrnutí tréninku</AppTitle>
            <Text style={styles.item}>Plán: {planName}</Text>
            <Text style={styles.item}>Dokončeno: {new Date(completedAt).toLocaleString('cs-CZ')}</Text>
            <Text style={styles.item}>Cviky: {exercisesCompleted}</Text>
            <Text style={styles.item}>Série: {totalSets}</Text>
            <Text style={styles.item}>Opakování: {totalReps}</Text>

            <View style={styles.shareSection}>
                <Text style={styles.shareTitle}>📤 Sdílej svůj výkon s ostatními</Text>
                <AppButton title="Sdílet výsledek" onPress={handleShare} />
            </View>

            <AppButton
                title="Zpět na Dashboard"
                onPress={() => navigation.navigate('Dashboard')}
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
        marginBottom: spacing.medium,
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

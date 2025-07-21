import React, {useEffect, useState} from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Text,
    Alert
} from "react-native";
import {useRoute, useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AppTitle from "../components/ui/AppTitle";
import AppCard from "../components/ui/AppCard";
import AppButton from "../components/ui/AppButton";
import {colors, spacing} from "../components/ui/theme";
import { apiFetch } from "../api";

const WorkoutHistoryDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const {historyId, completedAt, planName, planId} = route.params;

    const [performances, setPerformances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exerciseMap, setExerciseMap] = useState({});

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const token = await AsyncStorage.getItem("token");

                const data = await apiFetch(`/workout-performance/${historyId}`, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                setPerformances(data);

                const map = {};
                for (const p of data) {
                    if (!map[p.exerciseId]) {
                        const ex = await apiFetch(`/exercises/${p.exerciseId}`, {
                            headers: {Authorization: `Bearer ${token}`},
                        });
                        map[p.exerciseId] = ex.name;
                    }
                }
                setExerciseMap(map);
            } catch (err) {
                console.error("Chyba při načítání detailů:", err);
                Alert.alert("Chyba", "Nepodařilo se načíst podrobnosti tréninku.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [historyId]);

    const handleRepeat = () => {
        if (!planId) {
            Alert.alert("Nelze spustit", "Tento trénink nemá přiřazený plán.");
            return;
        }
        navigation.navigate("WorkoutSession", {planId});
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>Detail tréninku</AppTitle>
            <AppCard>
                <Text style={styles.label}>Datum dokončení</Text>
                <Text style={styles.text}>{new Date(completedAt).toLocaleString("cs-CZ")}</Text>
                <Text style={[styles.label, {marginTop: spacing.medium}]}>Název plánu</Text>
                <Text style={styles.text}>{planName || "Neznámý plán"}</Text>
            </AppCard>

            <AppTitle style={{marginTop: spacing.large}}>Výkony</AppTitle>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary}/>
            ) : performances.length === 0 ? (
                <Text style={styles.empty}>Žádné výkony nejsou zaznamenány.</Text>
            ) : (
                performances.map((item) => (
                    <AppCard key={item.id}>
                        <Text style={styles.exerciseName}>{exerciseMap[item.exerciseId] || "Cvik"}</Text>
                        <Text>Série: {item.setsCompleted}</Text>
                        <Text>Opakování: {item.repsCompleted}</Text>
                        <Text>Váha: {item.weightUsed ? `${item.weightUsed} kg` : "Neuvedeno"}</Text>
                    </AppCard>
                ))
            )}

            <AppButton
                title="Opakovat trénink"
                onPress={handleRepeat}
                style={{marginTop: spacing.large}}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: spacing.large, backgroundColor: colors.background, flexGrow: 1 },
    label: { fontWeight: "bold", fontSize: 16, color: colors.text, marginBottom: 4 },
    text: { fontSize: 16, color: colors.text },
    exerciseName: { fontSize: 16, fontWeight: "bold", marginBottom: 4, color: colors.text },
    empty: { textAlign: "center", color: colors.gray, marginTop: spacing.large, fontSize: 16 },
});

export default WorkoutHistoryDetailScreen;

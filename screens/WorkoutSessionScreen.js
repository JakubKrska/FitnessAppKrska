import React, {useEffect, useState} from "react";
import {View, Text, Image, Alert, StyleSheet} from "react-native";
import {useNavigation, useRoute} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import {Bar} from "react-native-progress";
import Slider from "@react-native-community/slider";
import {v4 as uuidv4} from "uuid";

import AppTitle from "../components/ui/AppTitle";
import AppCard from "../components/ui/AppCard";
import AppButton from "../components/ui/AppButton";
import {colors, spacing} from "../components/ui/theme";
import apiFetch from "../api";

const motivationalPhrases = [
    "Skvělá práce, jen tak dál!",
    "Jsi silnější než si myslíš!",
    "Tohle zvládneš!",
    "Zbývá už jen kousek!",
    "Tvůj pokrok je vidět!",
];

const speak = (text) =>
    Speech.speak(text, {
        language: "cs-CZ",
        pitch: 1.0,
        rate: 1.0,
    });

const WorkoutSessionScreen = () => {
    const navigation = useNavigation();
    const {planId} = useRoute().params;

    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [planName, setPlanName] = useState("");
    const [workoutExercises, setWorkoutExercises] = useState([]);
    const [exerciseDetails, setExerciseDetails] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [isResting, setIsResting] = useState(false);
    const [restTime, setRestTime] = useState(60);
    const [restDuration, setRestDuration] = useState(60);
    const [completed, setCompleted] = useState(false);
    const [showOverview, setShowOverview] = useState(true);

    useEffect(() => {
        const loadCredentials = async () => {
            const storedToken = await AsyncStorage.getItem("token");
            const storedUserId = await AsyncStorage.getItem("userId");
            setToken(storedToken);
            setUserId(storedUserId);
        };
        loadCredentials();
    }, []);

    useEffect(() => {
        if (!token || !userId) return;

        const fetchWorkout = async () => {
            const data = await apiFetch(`/workout-exercises/${planId}`, {
                headers: {Authorization: `Bearer ${token}`},
            });

            const sorted = data.sort((a, b) => a.orderIndex - b.orderIndex);
            setWorkoutExercises(sorted);

            const details = {};
            for (const ex of sorted) {
                const info = await apiFetch(`/exercises/${ex.exerciseId}`, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                details[ex.exerciseId] = info;
            }
            setExerciseDetails(details);
        };

        const fetchPlanName = async () => {
            try {
                const data = await apiFetch(`/workout-plans/${planId}`, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                setPlanName(data.name);
            } catch (e) {
                console.error("Chyba při načítání plánu:", e);
            }
        };

        fetchWorkout();
        fetchPlanName();
    }, [token, userId]);

    useEffect(() => {
        let timer;
        if (isResting && restTime > 0) {
            timer = setTimeout(() => setRestTime((prev) => prev - 1), 1000);
        } else if (isResting && restTime === 0) {
            speak("Pauza skončila, pokračujeme!");
            handleNextSet();
        }
        return () => clearTimeout(timer);
    }, [isResting, restTime]);

    const handleNextSet = () => {
        setIsResting(false);
        setRestTime(restDuration);

        const current = workoutExercises[currentIndex];
        if (currentSet < current.sets) {
            setCurrentSet(currentSet + 1);
            speak(`Připrav se na sérii číslo ${currentSet + 1}`);
        } else if (currentIndex < workoutExercises.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setCurrentSet(1);
        } else {
            setCompleted(true);
            logWorkoutCompletion();
        }
    };

    const handleCompleteSet = () => {
        const phrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
        speak(`Série dokončena. ${phrase} Pauza začíná.`);
        setIsResting(true);
    };

    const skipRest = () => {
        speak("Pauza přeskočena.");
        setRestTime(0);
    };

    const skipExercise = () => {
        if (currentIndex < workoutExercises.length - 1) {
            speak("Cvik přeskočen.");
            setCurrentIndex(currentIndex + 1);
            setCurrentSet(1);
            setIsResting(false);
        } else {
            speak("Žádný další cvik. Dokončujeme.");
            setCompleted(true);
            logWorkoutCompletion();
        }
    };

    const confirmEndWorkout = () => {
        Alert.alert("Ukončit trénink", "Opravdu chceš ukončit trénink?", [
            {text: "Zrušit", style: "cancel"},
            {
                text: "Ukončit",
                onPress: () => {
                    speak("Trénink předčasně ukončen.");
                    navigation.navigate("Dashboard");
                },
            },
        ]);
    };

    const logWorkoutCompletion = async () => {
        const completedAt = new Date().toISOString();

        await apiFetch("/workout-history", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                id: uuidv4(),
                userId,
                workoutPlanId: planId,
                completedAt,
            }),
        });

        const totalSets = workoutExercises.reduce((sum, ex) => sum + ex.sets, 0);
        const totalReps = workoutExercises.reduce((sum, ex) => sum + (ex.sets * ex.reps), 0);

        speak("Trénink dokončen! Skvělá práce!");

        navigation.navigate("WorkoutSummary", {
            completedAt,
            planName: planName || "Trénink",
            exercisesCompleted: workoutExercises.length,
            totalSets,
            totalReps,
        });
    };

    if (!token || !userId || workoutExercises.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.loading}>Načítání tréninku...</Text>
            </View>
        );
    }

    if (completed) {
        return (
            <View style={styles.center}>
                <AppTitle>Trénink dokončen!</AppTitle>
                <AppButton title="Zpět na Dashboard" onPress={() => navigation.navigate("Dashboard")}/>
            </View>
        );
    }

    if (showOverview) {
        return (
            <View style={styles.container}>
                <AppTitle>{planName ? `Plán: ${planName}` : "Načítání plánu..."}</AppTitle>
                {workoutExercises.map((ex, i) => {
                    const info = exerciseDetails[ex.exerciseId];
                    return (
                        <AppCard key={ex.id}>
                            <Text style={styles.bold}>{i + 1}. {info?.name || "Neznámý cvik"}</Text>
                            <Text>{ex.sets} x {ex.reps}</Text>
                            {info?.description && (
                                <Text style={styles.desc}>{info.description}</Text>
                            )}
                        </AppCard>
                    );
                })}

                <Text style={styles.label}>
                    Nastav si délku pauzy mezi sériemi: {restDuration} s
                </Text>
                <Slider
                    style={{width: "100%", height: 40}}
                    minimumValue={10}
                    maximumValue={180}
                    step={5}
                    value={restDuration}
                    onValueChange={setRestDuration}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.gray}
                />

                <AppButton
                    title="Začít trénink"
                    onPress={() => {
                        speak("Začínáme trénink.");
                        setShowOverview(false);
                    }}
                />
            </View>
        );
    }

    const current = workoutExercises[currentIndex];
    const info = exerciseDetails[current.exerciseId];

    return (
        <View style={styles.container}>
            <AppTitle>{currentIndex + 1}/{workoutExercises.length} Trénink</AppTitle>

            <AppCard>
                <Text style={styles.label}>{currentIndex + 1}. {info?.name || "Neznámý cvik"}</Text>

                {info?.imageUrl && (
                    <Image source={{uri: info.imageUrl}} style={styles.image}/>
                )}

                {info?.description && (
                    <Text style={styles.desc}>{info.description}</Text>
                )}

                <Text style={styles.status}>Série: {currentSet} / {current.sets}</Text>
                <Text style={styles.status}>Opakování: {current.reps}</Text>

                {!isResting ? (
                    <>
                        <AppButton title="Dokončit sérii" onPress={handleCompleteSet}/>
                        <AppButton title="Přeskočit cvik" onPress={skipExercise} color={colors.secondary}/>
                        <AppButton title="Ukončit trénink" onPress={confirmEndWorkout} color={colors.danger}/>
                    </>
                ) : (
                    <>
                        <Text style={styles.rest}>⏱ Pauza: {restTime}s</Text>
                        <Bar progress={(restDuration - restTime) / restDuration} width={null} height={10} color={colors.primary}/>
                        <AppButton title="Přeskočit pauzu" onPress={skipRest}/>
                    </>
                )}
            </AppCard>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.large,
    },
    loading: {
        fontSize: 16,
        color: colors.gray,
    },
    label: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: spacing.small,
        color: colors.text,
    },
    desc: {
        fontSize: 14,
        color: colors.gray,
        marginBottom: spacing.medium,
    },
    status: {
        fontSize: 16,
        marginBottom: spacing.small,
        color: colors.text,
    },
    rest: {
        fontSize: 16,
        marginVertical: spacing.medium,
        textAlign: "center",
        color: colors.primary,
    },
    image: {
        width: "100%",
        height: 200,
        resizeMode: "cover",
        borderRadius: 8,
        marginBottom: spacing.medium,
    },
    bold: {
        fontWeight: "bold",
        fontSize: 16,
        color: colors.text,
    },
});

export default WorkoutSessionScreen;

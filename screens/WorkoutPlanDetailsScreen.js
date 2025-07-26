import React, {useEffect, useState, useRef} from 'react';
import {
    View,
    Text,
    Alert,
    ScrollView,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DraggableFlatList from 'react-native-draggable-flatlist';

import AppTitle from '../components/ui/AppTitle';
import AppTextInput from '../components/ui/AppTextInput';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import {colors, spacing} from '../components/ui/theme';
import {useNavigation} from '@react-navigation/native';
import {apiFetch} from '../api';

const WorkoutPlanDetailsScreen = ({ route }) => {
    const { planId, prefillExerciseId } = route.params || {};
    const navigation = useNavigation();
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [availableExercises, setAvailableExercises] = useState([]);
    const scrollRef = useRef();

    const [formData, setFormData] = useState({
        exerciseId: '',
        sets: 3,
        reps: 10,
        orderIndex: 1,
        restSeconds: 60,
    });

    useEffect(() => {
        AsyncStorage.getItem('token').then(setToken);
    }, []);

    useEffect(() => {
        if (token) loadData();
    }, [token]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [planData, exData, allExercises] = await Promise.all([
                apiFetch(`/workout-plans/${planId}`, { headers: { Authorization: `Bearer ${token}` } }),
                apiFetch(`/workout-exercises/${planId}`, { headers: { Authorization: `Bearer ${token}` } }),
                apiFetch(`/exercises`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            setPlan(planData);
            setExercises(exData);
            setAvailableExercises(allExercises);

            console.log("📦 Načtené cviky v plánu:", exData);

            if (prefillExerciseId) {
                setFormData((prev) => ({
                    ...prev,
                    exerciseId: prefillExerciseId,
                }));
                setTimeout(() => {
                    scrollRef.current?.scrollTo({
                        y: 400,
                        animated: true,
                    });
                }, 500);
            }

        } catch (e) {
            console.error('Chyba:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        const { exerciseId, sets, reps, orderIndex, restSeconds } = formData;
        if (!exerciseId) return Alert.alert('Vyberte cvik');

        try {
            await apiFetch(`/workout-exercises`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    workoutPlanId: planId,
                    exerciseId,
                    sets,
                    reps,
                    orderIndex,
                    restSeconds,
                }),
            });

            await loadData();
            setFormData({ exerciseId: '', sets: 3, reps: 10, orderIndex: exercises.length + 1, restSeconds: 60 });
        } catch (err) {
            Alert.alert('Chyba', err.message || 'Nepodařilo se přidat cvik.');
        }
    };

    const handleDelete = async (id) => {
        Alert.alert('Smazat?', 'Opravdu chceš odebrat tento cvik?', [
            { text: 'Zrušit', style: 'cancel' },
            {
                text: 'Smazat',
                onPress: async () => {
                    await apiFetch(`/workout-exercises/${id}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    await loadData();
                },
            },
        ]);
    };

    const renderItem = (item, drag) => {
        const full = availableExercises.find((e) => e.id === item.exerciseId);
        return (
            <AppCard onLongPress={drag}>
                <Text style={styles.exerciseName}>{full?.name || 'Neznámý cvik'}</Text>
                <Text>{item.sets}x{item.reps} • {item.restSeconds || 60}s pauza • Pořadí: {item.orderIndex}</Text>
                <AppButton title="Odebrat" color={colors.danger} onPress={() => {
                        console.log("🗑️ Odebrání cviku s ID:", item.id);
                        handleDelete(item.id);
                    }}
                />
            </AppCard>
        );
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
            <AppTitle>Detail plánu</AppTitle>

            {plan && (
                <AppCard>
                    <Text><Text style={styles.bold}>Název:</Text> {plan.name}</Text>
                    <Text><Text style={styles.bold}>Popis:</Text> {plan.description}</Text>
                    <Text><Text style={styles.bold}>Úroveň:</Text> {plan.experienceLevel}</Text>
                    <Text><Text style={styles.bold}>Cíl:</Text> {plan.goal}</Text>
                </AppCard>
            )}

            <AppButton
                title="Zahájit plán"
                color={colors.secondary}
                onPress={() => navigation.navigate('WorkoutSession', { planId })}
            />

            <AppTitle>Přidat cvik</AppTitle>

            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={formData.exerciseId}
                    onValueChange={(val) => setFormData({ ...formData, exerciseId: val })}
                >
                    <Picker.Item label="-- Vyber cvik --" value="" />
                    {availableExercises.map((ex) => (
                        <Picker.Item key={ex.id} label={`${ex.name} – ${ex.muscleGroup}`} value={ex.id} />
                    ))}
                </Picker>
            </View>

            <Text style={styles.label}>Počet sérií</Text>
            <AppTextInput
                keyboardType="numeric"
                value={String(formData.sets)}
                onChangeText={(val) => setFormData({ ...formData, sets: Number(val) })}
            />

            <Text style={styles.label}>Počet opakování</Text>
            <AppTextInput
                keyboardType="numeric"
                value={String(formData.reps)}
                onChangeText={(val) => setFormData({ ...formData, reps: Number(val) })}
            />

            <Text style={styles.label}>Pořadí v tréninku</Text>
            <AppTextInput
                keyboardType="numeric"
                value={String(formData.orderIndex)}
                onChangeText={(val) => setFormData({ ...formData, orderIndex: Number(val) })}
            />

            <Text style={styles.label}>Pauza mezi sériemi (v sekundách)</Text>
            <AppTextInput
                keyboardType="numeric"
                value={String(formData.restSeconds)}
                onChangeText={(val) => setFormData({ ...formData, restSeconds: Number(val) })}
            />

            <AppButton title="Přidat cvik do plánu" onPress={handleAdd} />

            <AppTitle>Cviky v plánu</AppTitle>

            <DraggableFlatList
                data={exercises}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={({ item, drag }) => renderItem(item, drag)} // ← uprav
                onDragEnd={({ data }) => setExercises(data)}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
    },
    pickerWrapper: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 6,
        marginBottom: spacing.medium,
    },
    label: {
        fontWeight: 'bold',
        color: colors.text,
        marginTop: spacing.small,
        marginBottom: 4,
    },
    exerciseName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: spacing.small,
        color: colors.text,
    },
    bold: { fontWeight: 'bold' },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});

export default WorkoutPlanDetailsScreen;
import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    Alert,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
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

const WorkoutPlanDetailsScreen = ({route}) => {
    const {planId} = route.params;
    const navigation = useNavigation();

    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [availableExercises, setAvailableExercises] = useState([]);

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
            const [planRes, exRes, availRes] = await Promise.all([
                fetch(`http://localhost:8081/workout-plans/${planId}`, {
                    headers: {Authorization: `Bearer ${token}`},
                }),
                fetch(`http://localhost:8081/workout-exercises/${planId}`, {
                    headers: {Authorization: `Bearer ${token}`},
                }),
                fetch(`http://localhost:8081/exercises`, {
                    headers: {Authorization: `Bearer ${token}`},
                }),
            ]);

            setPlan(await planRes.json());
            setExercises(await exRes.json());
            setAvailableExercises(await availRes.json());
        } catch (e) {
            console.error('Chyba:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        const {exerciseId, sets, reps, orderIndex, restSeconds} = formData;
        if (!exerciseId) return Alert.alert('Vyberte cvik');

        try {
            const res = await fetch('http://localhost:8081/workout-exercises', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    workoutPlanId: planId,
                    exerciseId,
                    sets,
                    reps,
                    orderIndex,
                    restSeconds,
                }),
            });

            if (res.ok) {
                await loadData();
                setFormData({exerciseId: '', sets: 3, reps: 10, orderIndex: exercises.length + 1, restSeconds: 60});
            } else {
                const msg = await res.text();
                Alert.alert('Chyba', msg);
            }
        } catch (err) {
            console.error('Chyba:', err);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert('Smazat?', 'Opravdu chceš odebrat tento cvik?', [
            {text: 'Zrušit', style: 'cancel'},
            {
                text: 'Smazat',
                onPress: async () => {
                    await fetch(`http://localhost:8081/workout-exercises/${id}`, {
                        method: 'DELETE',
                        headers: {Authorization: `Bearer ${token}`},
                    });
                    await loadData();
                },
            },
        ]);
    };

    const handleReorder = async (data) => {
        setExercises(data);

    };

    const renderItem = ({item, drag}) => {
        const full = availableExercises.find((e) => e.id === item.exerciseId);
        return (
            <AppCard onLongPress={drag}>
                <Text style={styles.exerciseName}>{full?.name || 'Neznámý cvik'}</Text>
                <Text>
                    {item.sets}x{item.reps} • {item.restSeconds || 60}s pauza • Pořadí: {item.orderIndex}
                </Text>
                <AppButton title="Odebrat" color={colors.danger} onPress={() => handleDelete(item.id)}/>
            </AppCard>
        );
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.primary}/>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
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
                onPress={() => navigation.navigate('WorkoutSession', {planId})}
            />

            <AppTitle>Přidat cvik</AppTitle>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={formData.exerciseId}
                    onValueChange={(val) => setFormData({...formData, exerciseId: val})}
                >
                    <Picker.Item label="-- Vyber cvik --" value=""/>
                    {availableExercises.map((ex) => (
                        <Picker.Item
                            key={ex.id}
                            label={`${ex.name} – ${ex.muscleGroup}`}
                            value={ex.id}
                        />
                    ))}
                </Picker>
            </View>

            <AppTextInput
                placeholder="Série"
                keyboardType="numeric"
                value={String(formData.sets)}
                onChangeText={(val) => setFormData({...formData, sets: Number(val)})}
            />
            <AppTextInput
                placeholder="Opakování"
                keyboardType="numeric"
                value={String(formData.reps)}
                onChangeText={(val) => setFormData({...formData, reps: Number(val)})}
            />
            <AppTextInput
                placeholder="Pořadí"
                keyboardType="numeric"
                value={String(formData.orderIndex)}
                onChangeText={(val) => setFormData({...formData, orderIndex: Number(val)})}
            />
            <AppTextInput
                placeholder="Pauza (v sekundách)"
                keyboardType="numeric"
                value={String(formData.restSeconds)}
                onChangeText={(val) => setFormData({...formData, restSeconds: Number(val)})}
            />

            <AppButton title="Přidat cvik" onPress={handleAdd}/>

            <AppTitle>Cviky v plánu</AppTitle>

            <DraggableFlatList
                data={exercises}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                onDragEnd={({data}) => handleReorder(data)}
                contentContainerStyle={{paddingBottom: spacing.large}}
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
    exerciseName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: spacing.small,
        color: colors.text,
    },
    bold: {fontWeight: 'bold'},
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});

export default WorkoutPlanDetailsScreen;

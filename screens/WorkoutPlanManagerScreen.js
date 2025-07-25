import React, { useEffect, useState, useRef } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    FlatList,
    Text,
    View,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

import AppTextInput from '../components/ui/AppTextInput';
import AppButton from '../components/ui/AppButton';
import AppTitle from '../components/ui/AppTitle';
import AppCard from '../components/ui/AppCard';
import { colors, spacing } from '../components/ui/theme';
import { apiFetch } from '../api';

const WorkoutPlanManagerScreen = ({ navigation }) => {
    const scrollRef = useRef();
    const [plans, setPlans] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        experienceLevel: '',
        goal: '',
    });
    const [editingPlan, setEditingPlan] = useState(null);
    const [token, setToken] = useState('');
    const [userId, setUserId] = useState('');
    const [filterGoal, setFilterGoal] = useState('');
    const [filterLevel, setFilterLevel] = useState('');

    useEffect(() => {
        const loadCredentials = async () => {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUserId = await AsyncStorage.getItem('userId');
            setToken(storedToken);
            setUserId(storedUserId);
        };
        loadCredentials();
    }, []);

    useEffect(() => {
        if (token) fetchPlans();
    }, [token]);

    const fetchPlans = async () => {
        const data = await apiFetch(`/workout-plans`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setPlans(data);
    };

    const handleSubmit = async () => {
        const { name, description, experienceLevel, goal } = formData;
        if (!name || !experienceLevel || !goal) {
            Alert.alert('Chyba', 'Vyplň prosím všechna povinná pole.');
            return;
        }

        const url = editingPlan
            ? `/workout-plans/${editingPlan.id}`
            : `/workout-plans`;
        const method = editingPlan ? 'PUT' : 'POST';

        try {
            await apiFetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            await fetchPlans();
            setFormData({ name: '', description: '', experienceLevel: '', goal: '' });
            setEditingPlan(null);
        } catch (err) {
            Alert.alert('Chyba', err.message || 'Nepodařilo se uložit plán.');
        }
    };

    const handleDelete = async (id) => {
        Alert.alert('Smazat plán?', 'Opravdu chceš plán smazat?', [
            { text: 'Zrušit', style: 'cancel' },
            {
                text: 'Smazat',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await apiFetch(`/workout-plans/${id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        await fetchPlans();
                    } catch (err) {
                        Alert.alert('Chyba', err.message || 'Nepodařilo se smazat plán.');
                    }
                }
            },
        ]);
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            description: plan.description || '',
            experienceLevel: plan.experienceLevel || '',
            goal: plan.goal || '',
        });
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        Alert.alert('Úprava plánu', `Upravuješ plán: ${plan.name}`);
    };

    const filteredPlans = plans
        .filter(p => (filterGoal ? p.goal === filterGoal : true))
        .filter(p => (filterLevel ? p.experienceLevel === filterLevel : true))
        .sort((a, b) => {
            if (a.isDefault) return 1;
            if (b.isDefault) return -1;
            return 0;
        });

    const renderPlan = ({ item }) => {
        const isOwner = item.userId === userId;
        const cardStyle = item.isDefault ? styles.defaultCard : null;

        return (
            <AppCard style={cardStyle}>
                <Text style={styles.titleText}>
                    {item.name} {item.isDefault ? '(výchozí)' : ''}
                </Text>
                <Text>{item.experienceLevel} • {item.goal}</Text>
                {item.description ? <Text style={styles.descText}>{item.description}</Text> : null}

                <AppButton
                    title="Detail"
                    onPress={() => navigation.navigate('WorkoutPlanDetails', { planId: item.id })}
                />

                {isOwner && (
                    <>
                        <AppButton title="Upravit" onPress={() => handleEdit(item)} />
                        <AppButton
                            title="Smazat"
                            color={colors.danger}
                            onPress={() => handleDelete(item.id)}
                        />
                    </>
                )}
            </AppCard>
        );
    };

    if (!userId) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
            <AppTitle>
                {editingPlan ? `Upravuješ plán: ${editingPlan.name}` : 'Přidat nový plán'}
            </AppTitle>

            {/* Filtrace */}
            <View style={styles.filterSection}>
                <Text style={styles.pickerLabel}>Filtruj cíl:</Text>
                <Picker selectedValue={filterGoal} onValueChange={setFilterGoal}>
                    <Picker.Item label="Vše" value="" />
                    <Picker.Item label="Nabrat svaly" value="Nabrat svaly" />
                    <Picker.Item label="Zhubnout" value="Zhubnout" />
                    <Picker.Item label="Zlepšit kondici" value="Zlepšit kondici" />
                    <Picker.Item label="Zdravotní důvody" value="Zdravotní důvody" />
                    <Picker.Item label="Zvýšit sílu" value="Zvýšit sílu" />
                </Picker>

                <Text style={styles.pickerLabel}>Filtruj úroveň:</Text>
                <Picker selectedValue={filterLevel} onValueChange={setFilterLevel}>
                    <Picker.Item label="Vše" value="" />
                    <Picker.Item label="Začátečník" value="Začátečník" />
                    <Picker.Item label="Pokročilý" value="Pokročilý" />
                    <Picker.Item label="Expert" value="Expert" />
                </Picker>
            </View>

            {/* Formulář */}
            <AppTextInput
                placeholder="Název plánu"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <AppTextInput
                placeholder="Popis plánu"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
            />
            <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Úroveň</Text>
                <Picker
                    selectedValue={formData.experienceLevel}
                    onValueChange={(val) => setFormData({ ...formData, experienceLevel: val })}
                >
                    <Picker.Item label="-- Vyber úroveň --" value="" />
                    <Picker.Item label="Začátečník" value="Začátečník" />
                    <Picker.Item label="Pokročilý" value="Pokročilý" />
                    <Picker.Item label="Expert" value="Expert" />
                </Picker>
            </View>

            <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Cíl</Text>
                <Picker
                    selectedValue={formData.goal}
                    onValueChange={(val) => setFormData({ ...formData, goal: val })}
                >
                    <Picker.Item label="-- Vyber cíl --" value="" />
                    <Picker.Item label="Zhubnout" value="Zhubnout" />
                    <Picker.Item label="Nabrat svaly" value="Nabrat svaly" />
                    <Picker.Item label="Zůstat fit" value="Zůstat fit" />
                    <Picker.Item label="Zdravotní důvody" value="Zdravotní důvody" />
                </Picker>
            </View>

            <AppButton
                title={editingPlan ? 'Uložit změny' : 'Přidat plán'}
                color={editingPlan ? colors.secondary : colors.primary}
                onPress={handleSubmit}
            />

            {editingPlan && (
                <AppButton
                    title="Zrušit úpravu"
                    color={colors.gray}
                    onPress={() => {
                        setEditingPlan(null);
                        setFormData({ name: '', description: '', experienceLevel: '', goal: '' });
                    }}
                />
            )}

            <AppTitle style={{ marginTop: spacing.large }}>Plány</AppTitle>

            <FlatList
                data={filteredPlans}
                keyExtractor={(item) => item.id}
                renderItem={renderPlan}
                contentContainerStyle={{ paddingBottom: spacing.large }}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: spacing.small,
        color: colors.text,
    },
    descText: {
        color: colors.gray,
        marginBottom: spacing.small,
    },
    pickerLabel: {
        fontWeight: 'bold',
        marginTop: spacing.small,
        marginBottom: spacing.small,
    },
    defaultCard: {
        backgroundColor: '#e5e5e5',
    },
    filterSection: {
        marginBottom: spacing.large,
    }
});

export default WorkoutPlanManagerScreen;

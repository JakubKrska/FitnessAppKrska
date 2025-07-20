import React, {useEffect, useState} from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    FlatList,
    Text,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppTextInput from '../components/ui/AppTextInput';
import AppButton from '../components/ui/AppButton';
import AppTitle from '../components/ui/AppTitle';
import AppCard from '../components/ui/AppCard';
import {colors, spacing} from '../components/ui/theme';

const WorkoutPlanManagerScreen = ({navigation}) => {
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
        try {
            const res = await fetch('http://localhost:8081/workout-plans', {
                headers: {Authorization: `Bearer ${token}`},
            });
            const data = await res.json();
            setPlans(data);
        } catch (e) {
            console.error('Chyba při načítání plánů:', e);
        }
    };

    const handleSubmit = async () => {
        const {name, description, experienceLevel, goal} = formData;
        if (!name || !experienceLevel || !goal) {
            Alert.alert('Chyba', 'Vyplň prosím všechna povinná pole.');
            return;
        }

        const url = editingPlan
            ? `http://localhost:8081/workout-plans/${editingPlan.id}`
            : 'http://localhost:8081/workout-plans';
        const method = editingPlan ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                await fetchPlans();
                setFormData({name: '', description: '', experienceLevel: '', goal: ''});
                setEditingPlan(null);
            } else {
                const err = await res.text();
                Alert.alert('Chyba', err);
            }
        } catch (e) {
            Alert.alert('Chyba', 'Nepodařilo se uložit plán.');
        }
    };

    const handleDelete = async (id) => {
        Alert.alert('Smazat plán?', 'Opravdu chceš plán smazat?', [
            {text: 'Zrušit', style: 'cancel'},
            {
                text: 'Smazat',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await fetch(`http://localhost:8081/workout-plans/${id}`, {
                            method: 'DELETE',
                            headers: {Authorization: `Bearer ${token}`},
                        });
                        await fetchPlans();
                    } catch (err) {
                        Alert.alert('Chyba', 'Nepodařilo se smazat plán.');
                    }
                },
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
    };

    const renderPlan = ({item}) => (
        <AppCard>
            <Text style={styles.titleText}>{item.name}</Text>
            <Text>{item.experienceLevel} • {item.goal}</Text>
            {item.description ? <Text style={styles.descText}>{item.description}</Text> : null}

            <AppButton
                title="Detail"
                onPress={() => navigation.navigate('WorkoutPlanDetails', {planId: item.id})}
            />

            {item.userId === userId && (
                <>
                    <AppButton title="Upravit" onPress={() => handleEdit(item)}/>
                    <AppButton title="Smazat" color={colors.danger} onPress={() => handleDelete(item.id)}/>
                </>
            )}
        </AppCard>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>{editingPlan ? 'Upravit plán' : 'Přidat nový plán'}</AppTitle>

            <AppTextInput
                placeholder="Název plánu"
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
            />
            <AppTextInput
                placeholder="Úroveň (Začátečník / Pokročilý / Expert)"
                value={formData.experienceLevel}
                onChangeText={(text) => setFormData({...formData, experienceLevel: text})}
            />
            <AppTextInput
                placeholder="Cíl (např. Nabrat svaly, Zhubnout...)"
                value={formData.goal}
                onChangeText={(text) => setFormData({...formData, goal: text})}
            />
            <AppTextInput
                placeholder="Popis plánu"
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                multiline
            />

            <AppButton
                title={editingPlan ? 'Uložit změny' : 'Přidat plán'}
                onPress={handleSubmit}
            />

            {editingPlan && (
                <AppButton
                    title="Zrušit úpravu"
                    color={colors.gray}
                    onPress={() => {
                        setEditingPlan(null);
                        setFormData({name: '', description: '', experienceLevel: '', goal: ''});
                    }}
                />
            )}

            <AppTitle style={{marginTop: spacing.large}}>Moje plány</AppTitle>

            <FlatList
                data={plans}
                keyExtractor={(item) => item.id}
                renderItem={renderPlan}
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
});

export default WorkoutPlanManagerScreen;

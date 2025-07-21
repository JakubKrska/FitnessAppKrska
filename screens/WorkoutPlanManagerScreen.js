import React, {useEffect, useState} from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    FlatList,
    Text,
    View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppTextInput from '../components/ui/AppTextInput';
import AppButton from '../components/ui/AppButton';
import AppTitle from '../components/ui/AppTitle';
import AppCard from '../components/ui/AppCard';
import {colors, spacing} from '../components/ui/theme';
import {apiFetch} from '../api';

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
            setToken(await AsyncStorage.getItem('token'));
            setUserId(await AsyncStorage.getItem('userId'));
        };
        loadCredentials();
    }, []);

    useEffect(() => {
        if (token) fetchPlans();
    }, [token]);

    const fetchPlans = async () => {
        const data = await apiFetch(`/workout-plans`, {
            headers: {Authorization: `Bearer ${token}`},
        });
        setPlans(data);
    };

    const handleSubmit = async () => {
        const {name, description, experienceLevel, goal} = formData;
        if (!name || !experienceLevel || !goal) {
            Alert.alert('Chyba', 'Vyplň prosím všechna povinná pole.');
            return;
        }

        const url = editingPlan ? `/workout-plans/${editingPlan.id}` : `/workout-plans`;
        const method = editingPlan ? 'PUT' : 'POST';

        try {
            await apiFetch(url, {
                method,
                headers: {Authorization: `Bearer ${token}`},
                body: JSON.stringify(formData),
            });
            await fetchPlans();
            setFormData({name: '', description: '', experienceLevel: '', goal: ''});
            setEditingPlan(null);
        } catch (err) {
            Alert.alert('Chyba', err.message || 'Nepodařilo se uložit plán.');
        }
    };

    const handleDelete = async (id) => {
        Alert.alert('Smazat plán?', 'Opravdu chceš plán smazat?', [
            {text: 'Zrušit', style: 'cancel'},
            {
                text: 'Smazat',
                style: 'destructive',
                onPress: async () => {
                    await apiFetch(`/workout-plans/${id}`, {
                        method: 'DELETE',
                        headers: {Authorization: `Bearer ${token}`},
                    });
                    await fetchPlans();
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

            <AppButton title={editingPlan ? 'Uložit změny' : 'Přidat plán'} onPress={handleSubmit}/>

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

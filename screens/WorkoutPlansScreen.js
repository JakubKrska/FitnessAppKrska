import React, {useState, useEffect} from 'react';
import {
    ScrollView,
    FlatList,
    StyleSheet,
    Text,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppTextInput from '../components/ui/AppTextInput';
import AppTitle from '../components/ui/AppTitle';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import {colors, spacing} from '../components/ui/theme';
import apiFetch from '../api';

const WorkoutPlansScreen = () => {
    const [plans, setPlans] = useState([]);
    const [newPlan, setNewPlan] = useState({
        name: '',
        description: '',
        goal: '',
        experienceLevel: ''
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await apiFetch('/workout-plans', {
                headers: {Authorization: `Bearer ${token}`}
            });
            setPlans(res);
        } catch (error) {
            console.error('Chyba při načítání plánů:', error);
        }
    };

    const handleChange = (name, value) => {
        setNewPlan((prev) => ({...prev, [name]: value}));
    };

    const handleSubmit = async () => {
        const {name, goal, experienceLevel} = newPlan;
        if (!name || !goal || !experienceLevel) {
            Alert.alert('Chyba', 'Vyplň prosím všechna povinná pole.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            await apiFetch('/workout-plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newPlan)
            });
            Alert.alert('Úspěch', 'Plán byl vytvořen');
            setNewPlan({name: '', description: '', goal: '', experienceLevel: ''});
            fetchPlans();
        } catch (error) {
            Alert.alert('Chyba', error.message || 'Chyba při ukládání plánu.');
        }
    };

    const renderPlan = ({item}) => (
        <AppCard>
            <Text style={styles.planTitle}>{item.name}</Text>
            <Text style={styles.planText}>
                Cíl: {item.goal} | Úroveň: {item.experienceLevel}
            </Text>
            {item.description ? <Text style={styles.planText}>{item.description}</Text> : null}
        </AppCard>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>Tréninkové plány</AppTitle>

            <FlatList
                data={plans}
                keyExtractor={(item) => item.id}
                renderItem={renderPlan}
                scrollEnabled={false}
                contentContainerStyle={{gap: spacing.medium}}
            />

            <AppTitle style={{marginTop: spacing.xlarge}}>Vytvořit nový plán</AppTitle>

            <AppTextInput
                placeholder="Název plánu"
                value={newPlan.name}
                onChangeText={(text) => handleChange('name', text)}
            />
            <AppTextInput
                placeholder="Popis (volitelný)"
                value={newPlan.description}
                onChangeText={(text) => handleChange('description', text)}
                multiline
            />
            <AppTextInput
                placeholder="Cíl (např. Zhubnout)"
                value={newPlan.goal}
                onChangeText={(text) => handleChange('goal', text)}
            />
            <AppTextInput
                placeholder="Úroveň (např. Začátečník)"
                value={newPlan.experienceLevel}
                onChangeText={(text) => handleChange('experienceLevel', text)}
            />

            <AppButton title="Vytvořit plán" onPress={handleSubmit}/>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
    },
    planTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.small,
    },
    planText: {
        color: colors.gray,
    },
});

export default WorkoutPlansScreen;

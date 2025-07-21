import React, {useEffect, useState} from 'react';
import {
    ScrollView,
    Alert,
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';
import {Ionicons} from '@expo/vector-icons';

import AppTitle from '../components/ui/AppTitle';
import AppTextInput from '../components/ui/AppTextInput';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import {colors, spacing, borderRadius} from '../components/ui/theme';
import { apiFetch } from '../api';

const ExerciseManagerScreen = () => {
    const [token, setToken] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [filtered, setFiltered] = useState([]);

    const [filters, setFilters] = useState({
        search: '',
        muscleGroup: '',
        difficulty: '',
    });

    const muscleGroups = ['Hrudník', 'Záda', 'Nohy', 'Břicho', 'Ramena', 'Biceps', 'Triceps'];
    const difficulties = ['Začátečník', 'Střední', 'Pokročilý', 'Expert'];

    useEffect(() => {
        const loadAuth = async () => {
            const storedToken = await AsyncStorage.getItem('token');
            setToken(storedToken);
        };
        loadAuth();
    }, []);

    useEffect(() => {
        if (token) {
            fetchExercises();
            fetchFavorites();
        }
    }, [token]);

    const fetchExercises = async () => {
        try {
            const data = await apiFetch('/exercises', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setExercises(data);
        } catch (err) {
            console.error('Chyba při načítání cviků:', err);
        }
    };

    const fetchFavorites = async () => {
        try {
            const data = await apiFetch('/favorites', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFavorites(data.map(fav => fav.exerciseId));
        } catch (err) {
            console.error('Chyba při načítání oblíbených:', err);
        }
    };

    const toggleFavorite = async (exerciseId) => {
        try {
            const method = favorites.includes(exerciseId) ? 'DELETE' : 'POST';
            await apiFetch(`/favorites/${exerciseId}`, {
                method,
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchFavorites();
        } catch (err) {
            console.error('Chyba při změně oblíbeného:', err);
        }
    };

    useEffect(() => {
        let result = exercises;

        if (filters.search) {
            result = result.filter((ex) =>
                ex.name.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.muscleGroup) {
            result = result.filter((ex) => ex.muscleGroup === filters.muscleGroup);
        }

        if (filters.difficulty) {
            result = result.filter((ex) => ex.difficulty === filters.difficulty);
        }

        setFiltered(result);
    }, [filters, exercises, favorites]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>Všechny cviky</AppTitle>

            <AppTextInput
                placeholder="Vyhledat název..."
                value={filters.search}
                onChangeText={(val) => setFilters(prev => ({ ...prev, search: val }))}
            />

            <Text style={styles.label}>Svalová skupina</Text>
            <Picker
                selectedValue={filters.muscleGroup}
                onValueChange={(val) => setFilters(prev => ({ ...prev, muscleGroup: val }))}
            >
                <Picker.Item label="Všechny" value="" />
                {muscleGroups.map((g) => (
                    <Picker.Item key={g} label={g} value={g} />
                ))}
            </Picker>

            <Text style={styles.label}>Obtížnost</Text>
            <Picker
                selectedValue={filters.difficulty}
                onValueChange={(val) => setFilters(prev => ({ ...prev, difficulty: val }))}
            >
                <Picker.Item label="Všechny" value="" />
                {difficulties.map((d) => (
                    <Picker.Item key={d} label={d} value={d} />
                ))}
            </Picker>

            {filtered.map((ex) => (
                <AppCard key={ex.id}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>{ex.name}</Text>
                        <TouchableOpacity onPress={() => toggleFavorite(ex.id)}>
                            <Ionicons
                                name={favorites.includes(ex.id) ? 'star' : 'star-outline'}
                                size={24}
                                color={favorites.includes(ex.id) ? colors.primary : colors.gray}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text>Svaly: {ex.muscleGroup}</Text>
                    <Text>Obtížnost: {ex.difficulty}</Text>
                    {ex.imageUrl ? (
                        <Image source={{ uri: ex.imageUrl }} style={styles.image} />
                    ) : null}
                </AppCard>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
    },
    label: {
        marginTop: spacing.small,
        marginBottom: spacing.small / 2,
        fontWeight: 'bold',
        color: colors.text,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    image: {
        width: '100%',
        height: 180,
        borderRadius: borderRadius.medium,
        marginTop: spacing.small,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.small,
    },
});

export default ExerciseManagerScreen;

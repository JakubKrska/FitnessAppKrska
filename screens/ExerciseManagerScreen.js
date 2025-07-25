import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Modal,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

import AppTextInput from '../components/ui/AppTextInput';
import AppButton from '../components/ui/AppButton';
import AppTitle from '../components/ui/AppTitle';
import AppCard from '../components/ui/AppCard';
import { colors, spacing, borderRadius } from '../components/ui/theme';
import { apiFetch } from '../api';
import { useNavigation } from '@react-navigation/native';

const ExerciseManagerScreen = () => {
    const [token, setToken] = useState('');
    const [exercises, setExercises] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        muscleGroup: '',
        difficulty: '',
    });
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();

    const [newExercise, setNewExercise] = useState({
        name: '',
        muscleGroup: '',
        difficulty: '',
        description: '',
        imageUrl: '',
    });

    const [localImage, setLocalImage] = useState(null);

    const muscleGroups = ['Hrudník', 'Záda', 'Nohy', 'Břicho', 'Ramena', 'Biceps', 'Triceps'];
    const difficulties = ['Začátečník','Pokročilý', 'Expert'];

    useEffect(() => {
        AsyncStorage.getItem('token').then(setToken);
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
            console.error('❌ Chyba při načítání cviků:', err);
        }
    };

    const fetchFavorites = async () => {
        try {
            const data = await apiFetch('/favorites', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFavorites(data.map(fav => fav.exerciseId));
        } catch (err) {
            console.error('❌ Chyba při načítání oblíbených:', err);
        }
    };

    const toggleFavorite = async (exerciseId) => {
        try {
            const method = favorites.includes(exerciseId) ? 'DELETE' : 'POST';
            const url = method === 'DELETE'
                ? `/favorites/by-exercise/${exerciseId}`
                : `/favorites`;

            await apiFetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                ...(method === 'POST' && {
                    body: JSON.stringify({ exerciseId }),
                }),
            });

            fetchFavorites();
        } catch (err) {
            console.error('Chyba při změně oblíbeného:', err);
        }
    };

    const filteredExercises = exercises.filter((ex) => {
        const matchSearch = ex.name.toLowerCase().includes(filters.search.toLowerCase());
        const matchGroup = filters.muscleGroup ? ex.muscleGroup === filters.muscleGroup : true;
        const matchDiff = filters.difficulty ? ex.difficulty === filters.difficulty : true;
        return matchSearch && matchGroup && matchDiff;
    });

    const openImagePicker = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            setLocalImage(result.assets[0].uri);
        }
    };

    const handleSubmitExercise = async () => {
        const exerciseData = {
            ...newExercise,
            imageUrl: localImage || newExercise.imageUrl,
        };

        if (!exerciseData.name || !exerciseData.muscleGroup || !exerciseData.difficulty) {
            Alert.alert("Chyba", "Vyplň všechna povinná pole.");
            return;
        }

        try {
            await apiFetch("/exercises", {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(exerciseData),
            });

            Alert.alert("Úspěch", "Cvik přidán");
            setModalVisible(false);
            setNewExercise({ name: '', muscleGroup: '', difficulty: '', description: '', imageUrl: '' });
            setLocalImage(null);
            fetchExercises();
        } catch (err) {
            Alert.alert("Chyba", err.message || "Nepodařilo se přidat cvik.");
        }
    };

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
                {muscleGroups.map(g => <Picker.Item key={g} label={g} value={g} />)}
            </Picker>

            <Text style={styles.label}>Obtížnost</Text>
            <Picker
                selectedValue={filters.difficulty}
                onValueChange={(val) => setFilters(prev => ({ ...prev, difficulty: val }))}
            >
                <Picker.Item label="Všechny" value="" />
                {difficulties.map(d => <Picker.Item key={d} label={d} value={d} />)}
            </Picker>

            <AppButton title="Přidat nový cvik" onPress={() => setModalVisible(true)} />

            {filteredExercises.map(ex => (
                <TouchableOpacity key={ex.id} onPress={() => navigation.navigate("ExerciseDetails", { id: ex.id })}>
                <AppCard>
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
                    {ex.imageUrl && (
                        <Image source={{ uri: ex.imageUrl }} style={styles.image} />
                    )}
                </AppCard>
                </TouchableOpacity>
            ))}

            {/* Modal Formulář */}
            <Modal visible={modalVisible} animationType="slide">
                <ScrollView contentContainerStyle={styles.modalContent}>
                    <AppTitle>Přidat cvik</AppTitle>

                    <AppTextInput
                        placeholder="Název"
                        value={newExercise.name}
                        onChangeText={val => setNewExercise(prev => ({ ...prev, name: val }))}
                    />

                    <Text style={styles.label}>Svalová skupina</Text>
                    <Picker
                        selectedValue={newExercise.muscleGroup}
                        onValueChange={(val) => setNewExercise(prev => ({ ...prev, muscleGroup: val }))}
                    >
                        <Picker.Item label="-- Vyber svalovou skupinu --" value="" />
                        {muscleGroups.map(g => <Picker.Item key={g} label={g} value={g} />)}
                    </Picker>

                    <Text style={styles.label}>Obtížnost</Text>
                    <Picker
                        selectedValue={newExercise.difficulty}
                        onValueChange={(val) => setNewExercise(prev => ({ ...prev, difficulty: val }))}
                    >
                        <Picker.Item label="-- Vyber obtížnost --" value="" />
                        {difficulties.map(d => <Picker.Item key={d} label={d} value={d} />)}
                    </Picker>

                    <AppTextInput
                        placeholder="Popis"
                        value={newExercise.description}
                        onChangeText={val => setNewExercise(prev => ({ ...prev, description: val }))}
                        multiline
                    />

                    <AppTextInput
                        placeholder="Externí obrázek z internetu (volitelné)"
                        value={newExercise.imageUrl}
                        onChangeText={val => setNewExercise(prev => ({ ...prev, imageUrl: val }))}
                    />

                    <AppButton title="📷 Nahrát obrázek z galerie" onPress={openImagePicker} />

                    {localImage && (
                        <Image source={{ uri: localImage }} style={styles.imagePreview} />
                    )}

                    <AppButton title="Uložit cvik" onPress={handleSubmitExercise} />
                    <AppButton title="Zrušit" color={colors.gray} onPress={() => setModalVisible(false)} />
                </ScrollView>
            </Modal>
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
        fontWeight: 'bold',
        color: colors.text,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.small,
    },
    image: {
        width: '100%',
        height: 180,
        borderRadius: borderRadius.medium,
        marginTop: spacing.small,
    },
    modalContent: {
        padding: spacing.large,
        backgroundColor: colors.background,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        marginTop: spacing.medium,
        borderRadius: borderRadius.medium,
    },
});

export default ExerciseManagerScreen;

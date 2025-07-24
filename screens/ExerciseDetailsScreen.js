import React, {useEffect, useState} from 'react';
import {
    ScrollView,
    Image,
    ActivityIndicator,
    StyleSheet,
    View,
    Text,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppTitle from '../components/ui/AppTitle';
import AppCard from '../components/ui/AppCard';
import AppButton from '../components/ui/AppButton';
import {colors, spacing} from '../components/ui/theme';
import { apiFetch } from '../api';

const ExerciseDetailsScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const {id} = route.params;

    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchExercise = async () => {
            try {
                const data = await apiFetch(`/exercises/${id}`);
                setExercise(data);
            } catch (err) {
                console.error('Chyba při načítání cviku:', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchUserInfo = async () => {
            try {
                const id = await AsyncStorage.getItem("userId");
                const token = await AsyncStorage.getItem("token");
                setCurrentUserId(id);

                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUserRole(payload.role);
                }
            } catch (e) {
                console.error("Chyba při získávání informací o uživateli:", e);
            }
        };

        const checkFavorite = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const data = await apiFetch("/favorites", {
                    headers: {Authorization: `Bearer ${token}`}
                });
                const exists = data.some(fav => fav.exerciseId === id);
                setIsFavorite(exists);
            } catch (err) {
                console.error("Chyba při ověřování oblíbenosti:", err);
            }
        };

        fetchExercise();
        fetchUserInfo();
        checkFavorite();
    }, [id]);

    const toggleFavorite = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            const allFavs = await apiFetch("/favorites", {
                headers: {Authorization: `Bearer ${token}`},
            });

            const entry = allFavs.find(fav => fav.exerciseId === id);

            if (isFavorite && entry) {
                await apiFetch(`/favorites/${entry.id}`, {
                    method: "DELETE",
                    headers: {Authorization: `Bearer ${token}`},
                });
            } else if (!isFavorite) {
                await apiFetch("/favorites", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({exerciseId: id})
                });
            }

            setIsFavorite(!isFavorite);
        } catch (err) {
            console.error("Chyba při změně oblíbeného stavu:", err);
        }
    };

    const canEdit = exercise?.authorId === currentUserId || userRole === 'admin';

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary}/>
            </View>
        );
    }

    if (!exercise) {
        return (
            <View style={styles.center}>
                <Text style={{color: colors.text}}>Cvik nenalezen.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>{exercise.name}</AppTitle>

            <AppCard>
                <Label title="Svalová skupina" value={exercise.muscleGroup}/>
                <Label title="Obtížnost" value={exercise.difficulty}/>
                {exercise.aliases?.length > 0 && (
                    <Label title="Alternativní názvy" value={exercise.aliases.join(', ')}/>
                )}
                {exercise.description && (
                    <Label title="Popis" value={exercise.description} multiline/>
                )}
                {exercise.imageUrl ? (
                    <Image source={{ uri: exercise.imageUrl }} style={styles.image} />
                ) : (
                    // <Image source={require("../assets/placeholder.png")} style={styles.image} />
                    <View style={[styles.image, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.card }]}>
                        <Text style={{ color: colors.gray }}>Bez obrázku</Text>
                    </View>
                )}
                {exercise.authorId && (
                    <Text style={styles.footer}>
                        Tento cvik vytvořil uživatel:{" "}
                        <Text style={styles.italic}>{exercise.authorId}</Text>
                    </Text>
                )}

                {canEdit && (
                    <View style={{marginTop: spacing.medium}}>
                        <AppButton
                            title="Upravit cvik"
                            onPress={() => navigation.navigate("ExerciseEdit", {exercise})}
                        />
                    </View>
                )}
            </AppCard>

            <AppButton
                title="Zobrazit vývoj výkonu"
                onPress={() =>
                    navigation.navigate("PerformanceChart", {
                        exerciseId: exercise.id,
                        exerciseName: exercise.name,
                    })
                }
                style={{marginTop: spacing.large}}
            />

            <AppButton
                title={isFavorite ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
                onPress={toggleFavorite}
                style={{marginTop: spacing.small}}
            />
        </ScrollView>
    );
};

const Label = ({title, value, multiline}) => (
    <View style={{marginBottom: spacing.small}}>
        <Text style={styles.label}>
            <Text style={styles.bold}>{title}: </Text>
            <Text style={{lineHeight: multiline ? 20 : 16}}>{value}</Text>
        </Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.large,
        backgroundColor: colors.background,
    },
    label: {
        fontSize: 16,
        color: colors.text,
    },
    bold: {
        fontWeight: 'bold',
    },
    italic: {
        fontStyle: 'italic',
        color: colors.gray,
    },
    footer: {
        marginTop: spacing.medium,
        fontSize: 14,
    },
    image: {
        width: '100%',
        height: 240,
        resizeMode: 'cover',
        marginTop: spacing.medium,
        borderRadius: 8,
    },
});

export default ExerciseDetailsScreen;

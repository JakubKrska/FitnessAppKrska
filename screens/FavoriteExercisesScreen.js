import React, {useEffect, useState} from "react";
import {ScrollView, Text, StyleSheet} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AppTitle from "../components/ui/AppTitle";
import AppCard from "../components/ui/AppCard";
import {colors, spacing} from "../components/ui/theme";
import { apiFetch } from "../api";

const FavoriteExercisesScreen = () => {
    const [favorites, setFavorites] = useState([]);

    const fetchFavorites = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const data = await apiFetch("/favorites", {
                headers: {Authorization: `Bearer ${token}`},
            });
            setFavorites(data);
        } catch (err) {
            console.error("Chyba při načítání oblíbených cviků:", err);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>Oblíbené cviky</AppTitle>
            {favorites.length === 0 ? (
                <Text style={styles.text}>Nemáš žádné oblíbené cviky.</Text>
            ) : (
                favorites.map((fav) => (
                    <AppCard key={fav.exerciseId}>
                        <Text style={styles.text}>ID cviku: {fav.exerciseId}</Text>
                    </AppCard>
                ))
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
        flexGrow: 1,
    },
    text: {
        color: colors.text,
        fontSize: 16,
    },
});

export default FavoriteExercisesScreen;

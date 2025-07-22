import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "../api";

const BadgesScreen = () => {
    const [badges, setBadges] = useState([]);

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                if (!token) return;

                const data = await apiFetch("/users/me/badges", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setBadges(data);
            } catch (err) {
                console.error("Chyba při načítání odznaků:", err);
            }
        };

        fetchBadges();
    }, []);

    const renderBadge = ({ item }) => (
        <View style={styles.card}>
            {item.icon && (
                <Image source={{ uri: item.icon }} style={styles.icon} />
            )}
            <View style={styles.textContainer}>
                <Text style={styles.name}>{item.name}</Text>
                {item.description && (
                    <Text style={styles.description}>{item.description}</Text>
                )}
                <Text style={styles.date}>Získáno: {new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Moje odznaky</Text>
            {badges.length === 0 ? (
                <Text style={styles.empty}>Zatím nemáš žádné odznaky.</Text>
            ) : (
                <FlatList
                    data={badges}
                    keyExtractor={(item) => item.id}
                    renderItem={renderBadge}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    card: {
        flexDirection: "row",
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#F3F4F6",
        marginBottom: 10,
        alignItems: "center",
    },
    icon: {
        width: 60,
        height: 60,
        marginRight: 16,
        borderRadius: 8,
        backgroundColor: "#E0E0E0",
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: "#555",
    },
    date: {
        fontSize: 12,
        color: "#888",
        marginTop: 4,
    },
    empty: {
        textAlign: "center",
        marginTop: 40,
        fontSize: 16,
        color: "#666",
    },
});

export default BadgesScreen;

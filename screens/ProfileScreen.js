import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Alert,
    FlatList,
    Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppTitle from '../components/ui/AppTitle';
import AppCard from '../components/ui/AppCard';
import AppButton from '../components/ui/AppButton';
import { colors, spacing } from '../components/ui/theme';
import { apiFetch } from '../api';

const ProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const userData = await apiFetch('/users/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(userData);

            const badgeData = await apiFetch('/users/me/badges', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBadges(badgeData);
        } catch (error) {
            Alert.alert('Chyba', 'Nepodařilo se načíst profil nebo odznaky.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const renderBadge = ({ item }) => (
        <View style={styles.badgeContainer}>
            {item.icon ? (
                <Image source={{ uri: item.icon }} style={styles.icon} />
            ) : (
                <View style={styles.placeholderIcon} />
            )}
            <Text style={styles.badgeName}>{item.name}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Nepodařilo se načíst profil.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>Můj profil</AppTitle>

            <AppCard>
                <Text style={styles.label}>Jméno: <Text style={styles.value}>{user.name}</Text></Text>
                <Text style={styles.label}>Věk: <Text style={styles.value}>{user.age ?? '–'}</Text></Text>
                <Text style={styles.label}>Výška: <Text style={styles.value}>{user.height ?? '–'} cm</Text></Text>
                <Text style={styles.label}>Váha: <Text style={styles.value}>{user.weight ?? '–'} kg</Text></Text>
                <Text style={styles.label}>Cíl: <Text style={styles.value}>{user.goal}</Text></Text>
                <Text style={styles.label}>Úroveň: <Text style={styles.value}>{user.experienceLevel}</Text></Text>
            </AppCard>

            <AppButton title="Upravit profil" onPress={() => navigation.navigate("EditProfile")} />
            <AppButton title="Změnit heslo" onPress={() => navigation.navigate("ChangePassword")} />
            <AppButton title="Moje připomínky" onPress={() => navigation.navigate("Reminders")} />

            <Text style={styles.badgesTitle}>Moje odznaky</Text>
            <FlatList
                data={badges}
                keyExtractor={(item) => item.id}
                renderItem={renderBadge}
                numColumns={3}
                contentContainerStyle={styles.badgeList}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: colors.danger,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: spacing.small / 2,
        color: colors.text,
    },
    value: {
        fontWeight: 'normal',
    },
    badgesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: spacing.large,
        marginBottom: spacing.medium,
        color: colors.primary,
    },
    badgeList: {
        alignItems: 'center',
    },
    badgeContainer: {
        alignItems: 'center',
        margin: spacing.small,
        width: 90,
    },
    icon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 5,
    },
    placeholderIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ccc',
        marginBottom: 5,
    },
    badgeName: {
        fontSize: 12,
        textAlign: 'center',
    },
});

export default ProfileScreen;

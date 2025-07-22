import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import AppButton from "../components/ui/AppButton";
import { colors, spacing } from "../components/ui/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";

const WelcomeScreen = ({ navigation }) => {

    useEffect(() => {
        const setSeenWelcome = async () => {
            try {
                await AsyncStorage.setItem("hasSeenWelcome", "true");
            } catch (e) {
                console.error("Chyba při ukládání hasSeenWelcome:", e);
            }
        };

        setSeenWelcome();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vítej ve FitnessApp</Text>
            <Text style={styles.subtitle}>Sleduj pokroky, plánuj tréninky, motivuj se.</Text>

            <AppButton title="Přihlásit se" onPress={() => navigation.navigate(LoginScreen)} />
            <AppButton title="Registrace" onPress={() => navigation.navigate(RegisterScreen)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.large,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: colors.primary,
        marginBottom: spacing.medium,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: colors.text,
        marginBottom: spacing.large,
        textAlign: "center",
    },
});

export default WelcomeScreen;

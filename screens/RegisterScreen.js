import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import AppTextInput from "../components/ui/AppTextInput";
import PasswordInput from "../components/ui/PasswordInput";
import AppButton from "../components/ui/AppButton";
import AppTitle from "../components/ui/AppTitle";
import { colors, spacing } from "../components/ui/theme";
import { apiFetch } from "../api";
import { decode as atob } from "base-64"; // <--- fix

const RegisterScreen = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const navigation = useNavigation();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            setError("Vyplňte všechna pole");
            return;
        }

        try {
            console.log("1. Registrace start");
            await apiFetch("/authUtils/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            console.log("2. Login...");
            const response = await apiFetch("/authUtils/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            console.log("3. Login response", response);
            if (!response.token) {
                console.error("❌ Token není v odpovědi:", response);
                throw new Error("Chybí token v odpovědi");
            }

            // Pokud atob selhává:
            let payload = {};
            try {
                const base64 = response.token.split(".")[1];
                payload = JSON.parse(atob(base64));
            } catch (decodeErr) {
                console.error("❌ Chyba při dekódování tokenu", decodeErr);
                throw new Error("Neplatný token");
            }

            await AsyncStorage.setItem("token", response.token);
            await AsyncStorage.setItem("userId", payload.userId);
            await AsyncStorage.setItem("hasSeenWelcome", "true");

            console.log("4. Naviguji na MainApp");

            navigation.reset({
                index: 0,
                routes: [{ name: "OnboardingGoal" }],
            });
        } catch (err) {
            console.error("❌ REGISTRACE ERROR:", err);
            setError("Registrace selhala: " + (err.message || "Neznámá chyba"));
        }
    };


    return (
        <View style={styles.container}>
            <MaterialIcons
                name="person-add"
                size={60}
                color={colors.primary}
                style={styles.icon}
            />
            <AppTitle>Registrace</AppTitle>

            <AppTextInput
                placeholder="Jméno"
                value={name}
                onChangeText={(text) => {
                    setName(text);
                    setError(null);
                }}
            />

            <AppTextInput
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                }}
            />

            <PasswordInput
                placeholder="Heslo"
                value={password}
                onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                }}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <AppButton title="Registrovat" onPress={handleRegister} />

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.link}>Už máš účet? Přihlaš se</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        padding: spacing.large,
    },
    icon: {
        alignSelf: "center",
        marginBottom: spacing.medium,
    },
    link: {
        marginTop: spacing.medium,
        textAlign: "center",
        color: colors.primary,
    },
    error: {
        color: colors.danger,
        marginBottom: spacing.small,
        textAlign: "center",
    },
});

export default RegisterScreen;

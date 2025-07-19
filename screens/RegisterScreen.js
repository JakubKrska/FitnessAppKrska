import React, { useState } from "react";
import {
    View,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import AppTextInput from "../components/ui/AppTextInput";
import AppButton from "../components/ui/AppButton";
import AppTitle from "../components/ui/AppTitle";
import { colors, spacing } from "../components/ui/theme";

const RegisterScreen = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);

    const navigation = useNavigation();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            setError("Vyplňte všechna pole");
            return;
        }

        try {
            const res = await fetch("http://localhost:8081/authUtils/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (!res.ok) {
                const text = await res.text();
                setError(text || "Registrace selhala");
                return;
            }

            Alert.alert("Úspěšná registrace", "Nyní se můžeš přihlásit.");
            navigation.navigate("Login");
        } catch (err) {
            setError("Nepodařilo se připojit k serveru.");
        }
    };

    return (
        <View style={styles.container}>
            <MaterialIcons name="person-add" size={60} color={colors.primary} style={styles.icon} />
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
            <View style={styles.passwordRow}>
                <AppTextInput
                    placeholder="Heslo"
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        setError(null);
                    }}
                    secureTextEntry={!showPassword}
                    style={{ flex: 1 }}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <MaterialIcons
                        name={showPassword ? "visibility" : "visibility-off"}
                        size={24}
                        color={colors.gray}
                    />
                </Pressable>
            </View>
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
    passwordRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    eyeIcon: {
        padding: spacing.small,
    },
});

export default RegisterScreen;

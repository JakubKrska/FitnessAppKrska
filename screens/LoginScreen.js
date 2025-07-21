import React, {useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
} from "react-native";
import {useNavigation, useRoute} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {MaterialIcons} from "@expo/vector-icons";
import AppTextInput from "../components/ui/AppTextInput";
import AppButton from "../components/ui/AppButton";
import AppTitle from "../components/ui/AppTitle";
import {colors, spacing} from "../components/ui/theme";
import { apiFetch } from "../api";

const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const navigation = useNavigation();
    const route = useRoute();
    const redirectTo = route.params?.redirectTo || "Dashboard";

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Vyplňte email a heslo");
            return;
        }

        try {
            const response = await apiFetch("/authUtils/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password}),
            });

            await AsyncStorage.setItem("token", response.token);
            const payload = JSON.parse(atob(response.token.split(".")[1]));
            await AsyncStorage.setItem("userId", payload.userId);
            navigation.replace(redirectTo);
        } catch (err) {
            setError(typeof err === "string" ? err : "Přihlášení selhalo");
        }
    };

    return (
        <View style={styles.container}>
            <MaterialIcons name="fitness-center" size={60} color={colors.primary} style={styles.icon}/>
            <AppTitle>Přihlášení</AppTitle>

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
                    style={{flex: 1}}
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

            <AppButton title="Přihlásit se" onPress={handleLogin}/>

            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.link}>Nemáš účet? Zaregistruj se</Text>
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

export default LoginScreen;

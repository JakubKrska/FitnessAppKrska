import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AppTextInput from "./AppTextInput";
import { spacing, colors } from "./theme";

const PasswordInput = ({ value, onChangeText, placeholder }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={styles.container}>
            <AppTextInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={!showPassword}
                style={{ flex: 1, marginBottom: 0 }}
            />
            <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.icon}
            >
                <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={24}
                    color={colors.gray}
                />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.medium,
    },
    icon: {
        padding: spacing.small,
    },
});

export default PasswordInput;

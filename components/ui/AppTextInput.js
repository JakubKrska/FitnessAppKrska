import React from "react";
import { TextInput, StyleSheet } from "react-native";
import { colors, spacing } from "./theme";

const AppTextInput = ({ style, ...props }) => {
    return (
        <TextInput
            style={[styles.input, style]}
            placeholderTextColor={colors.gray}
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        backgroundColor: "#fff",
        padding: spacing.medium,
        marginBottom: spacing.medium,
        borderRadius: 6,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.border || "#ddd",
    },
});

export default AppTextInput;

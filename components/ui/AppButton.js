import React from "react";
import {TouchableOpacity, Text, StyleSheet} from "react-native";
import {colors, spacing, borderRadius} from "./theme";

const AppButton = ({title, onPress, style = {}, textStyle = {}, color = colors.primary}) => (
    <TouchableOpacity
        style={[styles.button, {backgroundColor: color}, style]}
        onPress={onPress}
    >
        <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        paddingVertical: spacing.medium,
        borderRadius: borderRadius.medium,
        alignItems: "center",
        marginVertical: spacing.small,
    },
    text: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default AppButton;

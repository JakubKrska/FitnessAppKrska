import React from "react";
import {Text, StyleSheet} from "react-native";
import {colors, spacing} from "./theme";

const AppTitle = ({children, style}) => (
    <Text style={[styles.title, style]}>{children}</Text>
);

const styles = StyleSheet.create({
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: colors.text,
        marginBottom: spacing.small,
    },
});

export default AppTitle;

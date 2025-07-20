import React from "react";
import {View, StyleSheet} from "react-native";
import {colors, spacing, borderRadius} from "./theme";

const AppCard = ({children, style}) => (
    <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.medium,
        padding: spacing.medium,
        marginBottom: spacing.medium,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
});

export default AppCard;

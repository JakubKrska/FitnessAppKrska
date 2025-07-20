// components/PlanCard.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {colors, spacing, borderRadius} from './ui/theme';

const PlanCard = ({name, goal, level, onPress}) => (
    <TouchableOpacity onPress={onPress} style={styles.card}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.text}>Cíl: {goal}</Text>
        <Text style={styles.text}>Úroveň: {level}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        padding: spacing.medium,
        borderRadius: borderRadius.medium,
        marginBottom: spacing.medium,
        borderWidth: 1,
        borderColor: colors.gray,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    text: {
        color: colors.text,
    },
});

export default PlanCard;

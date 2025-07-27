import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import {colors, spacing, borderRadius} from './ui/theme';

const WorkoutCard = ({planName, completedAt, onPress}) => {
    const date = new Date(completedAt).toLocaleDateString();

    return (
        <TouchableOpacity onPress={onPress} style={styles.card}>
            <Text style={styles.title}>{planName}</Text>
            <Text style={styles.text}>Dokončeno: {date}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.gray,
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

export default WorkoutCard;

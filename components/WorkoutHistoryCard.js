import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, spacing, borderRadius} from './ui/theme';

const WorkoutHistoryCard = ({date, planName}) => (
    <View style={styles.card}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.plan}>{planName}</Text>
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        padding: spacing.medium,
        borderRadius: borderRadius.medium,
        marginBottom: spacing.small,
        borderColor: colors.gray,
        borderWidth: 1,
    },
    date: {
        fontWeight: "bold",
        color: colors.text,
        marginBottom: 4,
    },
    plan: {
        color: colors.text,
    },
});

export default WorkoutHistoryCard;

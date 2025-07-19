// components/AppTextInput.js
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from './theme';

const AppTextInput = (props) => (
    <TextInput
        style={styles.input}
        placeholderTextColor={colors.placeholder}
        {...props}
    />
);

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: borderRadius.small,
        padding: spacing.small,
        marginBottom: spacing.medium,
        backgroundColor: colors.white,
        color: colors.text,
    },
});

export default AppTextInput;

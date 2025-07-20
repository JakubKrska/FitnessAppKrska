import React from 'react';
import {Modal, View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {colors, spacing} from './ui/theme';

const BadgeDetailModal = ({visible, onClose, badge}) => {
    if (!badge) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {badge.icon ? (
                        <Image source={{uri: badge.icon}} style={styles.icon}/>
                    ) : (
                        <Text style={styles.iconPlaceholder}>🏆</Text>
                    )}
                    <Text style={styles.title}>{badge.name}</Text>
                    <Text style={styles.description}>{badge.description || "Bez popisu"}</Text>
                    <Text style={styles.condition}>Podmínka: {badge.conditionType} = {badge.conditionValue}</Text>

                    <TouchableOpacity onPress={onClose} style={styles.button}>
                        <Text style={styles.buttonText}>Zavřít</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: 'white',
        padding: spacing.large,
        borderRadius: 16,
        width: '85%',
        alignItems: 'center',
    },
    icon: {
        width: 80,
        height: 80,
        marginBottom: spacing.medium,
    },
    iconPlaceholder: {
        fontSize: 64,
        marginBottom: spacing.medium,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: spacing.small,
        color: colors.primary,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: spacing.small,
    },
    condition: {
        fontSize: 14,
        color: colors.gray,
        marginBottom: spacing.medium,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default BadgeDetailModal;